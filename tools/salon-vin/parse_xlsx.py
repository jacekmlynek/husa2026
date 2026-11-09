"""Parse NVC medal xlsx (gold + silver sheets) into JSON rows without external deps."""
import html, json, re, sys, zipfile

src, out = sys.argv[1], sys.argv[2]
z = zipfile.ZipFile(src)
ss = []
for si in re.findall(r'<si>(.*?)</si>', z.read('xl/sharedStrings.xml').decode('utf-8'), re.S):
    ss.append(''.join(re.findall(r'<t[^>]*>([^<]*)</t>', si)))
wb = z.read('xl/workbook.xml').decode('utf-8')
names = re.findall(r'<sheet [^>]*name="([^"]+)"', wb)

KEYS = {'pořadí v Salonu': 'nr', 'název vína': 'wine', 'přihlašovatel/výrobce': 'producer', 'Město - přihlašovatele': 'producer_town',
        'oblast': 'region', 'vinařská obec': 'village', 'vinařská trať': 'vineyard', 'kategorie': 'category',
        'jakostní zařazení': 'quality', 'číslo šarže': 'batch', 'cukr': 'sugar_gl', 'kyseliny': 'acid_gl',
        'alkohol': 'alcohol_pct', 'ročník': 'vintage', 'body': 'points', 'medaile': 'medal', 'objem lahve': 'bottle_l'}


def col(ref):
    n = 0
    for ch in re.match(r'[A-Z]+', ref).group(0):
        n = n * 26 + ord(ch) - 64
    return n - 1


res = {}
for i, name in enumerate(names, 1):
    xml = z.read(f'xl/worksheets/sheet{i}.xml').decode('utf-8')
    rows = []
    for r in re.findall(r'<row[^>]*>(.*?)</row>', xml, re.S):
        cells = {}
        for ref, attrs, body in re.findall(r'<c r="([A-Z]+\d+)"([^>]*?)(?:/>|>(.*?)</c>)', r, re.S):
            v = re.search(r'<v>(.*?)</v>', body or '')
            if not v:
                t = re.search(r'<t[^>]*>(.*?)</t>', body or '')
                val = t.group(1) if t else None
            else:
                val = v.group(1)
                if 't="s"' in attrs: val = ss[int(val)]
            cells[col(ref)] = val
        rows.append(cells)
    header = [rows[0].get(j) for j in range(max(rows[0]) + 1)]
    data = []
    for r in rows[1:]:
        if not any(v not in (None, '') for v in r.values()): continue
        d = {}
        for j, h in enumerate(header):
            if h is None: continue
            k = KEYS.get(h.strip(), h.strip())
            v = r.get(j)
            if isinstance(v, str): v = html.unescape(re.sub(r'\s+', ' ', v)).strip()
            if v in (None, ''): continue
            if k in ('sugar_gl', 'acid_gl', 'alcohol_pct', 'points', 'bottle_l'):
                try: v = round(float(str(v).replace(',', '.')), 2)
                except ValueError: pass
            if k in ('nr', 'vintage'):
                try: v = int(float(v))
                except ValueError: pass
            if k == 'batch' and re.fullmatch(r'\d+\.0', str(v)): v = v[:-2]
            d[k] = v
        data.append(d)
    res[name] = data
json.dump(res, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print({k: len(v) for k, v in res.items()})
