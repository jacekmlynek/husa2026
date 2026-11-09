"""Parse Salon vín catalogue (pdftotext -layout -enc UTF-8) into JSON: gold wine cards, silver list, producers."""
import json, re, sys
from pathlib import Path

src, year, out = Path(sys.argv[1]), int(sys.argv[2]), Path(sys.argv[3])
pages = src.read_text(encoding='utf-8').split('\f')

FIELDS = [
    ('Vinařská obec', 'village'), ('Viniční trať', 'vineyard'), ('Datum sklizně', 'harvest_date'), ('Výnos (t/ha)', 'yield_t_ha'),
    ('Cukernatost moštu (°NM)', 'must_nm'), ('Číslo šarže', 'batch'), ('Počet lahví šarže', 'bottles'),
    ('Obsah zbytk. cukru (g/l)', 'sugar_gl'), ('Obsah kyselin (g/l)', 'acid_gl'),
    ('Obsah alkoholu (% obj.)', 'alcohol_pct'), ('Bezcukerný extrakt (g/l)', 'extract_gl'),
    ('Doporučená lahvová zralost', 'drink_window'),
]
NUM = {'yield_t_ha', 'must_nm', 'sugar_gl', 'acid_gl', 'alcohol_pct', 'extract_gl'}


def num(v):
    try:
        return float(v.replace(',', '.').replace(' ', '').replace(' ', ''))
    except Exception:
        return v or None


def norm(s):
    return re.sub(r'\s+', ' ', s).strip()


def parse_card(p):
    if not re.search(r'Evidenční číslo vína:', p) or 'Vinařská obec' not in p:
        return None
    lines = p.split('\n')
    w = {}
    m = re.search(r'Vinařská podoblast\s*\n\s*(\S+)\s+(.+)', p)
    if m:
        w['region'], w['subregion'] = m.group(1).strip(), norm(m.group(2))
    m = re.search(r'(\d+)\s+Evidenční číslo vína:', p) or re.search(r'Evidenční číslo vína:\s*(\d+)', p)
    w['nr'] = int(m.group(1)) if m else None
    # left column header block: between the "Evidenční" line and first field line
    start = next(i for i, l in enumerate(lines) if 'Evidenční číslo vína' in l) + 1
    fstart = next(i for i, l in enumerate(lines) if 'Vinařská obec' in l)
    head = [l.strip() for l in lines[start:fstart] if l.strip()]
    # field block: right column "Label: value", values can wrap onto next lines
    body = lines[fstart:]
    cur = None
    vals = {}
    end_i = len(body)
    for i, l in enumerate(body):
        s = l.strip()
        if s.startswith('Charakteristika') or s.startswith('Senzorická'):
            end_i = i; break
        hit = None
        for lab, key in FIELDS:
            mm = re.search(re.escape(lab) + r':\s*(.*)$', l)
            if mm:
                hit = (key, mm.group(1).strip()); break
        if hit:
            cur = hit[0]; vals[cur] = hit[1]
        elif cur and s:
            # continuation of a wrapped value (right column, deep indent)
            if len(l) - len(l.lstrip()) > 40:
                vals[cur] = (vals[cur] + ' ' + s).strip()
    for k, v in vals.items():
        if k in NUM: v = num(v)
        elif k == 'bottles': v = num(v); v = int(v) if isinstance(v, float) else v
        w[k] = None if v in (None, '', '-', '–') else v   # keep real zeros (e.g. 0 g/l sugar)
    tail = '\n'.join(body[end_i:])
    tail = re.sub(r'\n\s*\d{1,3}\s*$', '', tail.strip())
    AW = r'(?:Ocenění|Dosažené ocenění|Dosažená ocenění)'
    m = re.search(r'(?:Charakteristika|Senzorická charakteristika):\s*(.*?)(?:\n\s*' + AW + r':|$)', tail, re.S)
    if m: w['description'] = norm(re.sub(r'-\n\s*', '', m.group(1)))
    m = re.search(AW + r':\s*(.*)$', tail, re.S)
    if m:  # hyphen at a line break inside a word ("Tro-\nphy") is dropped; a dash before a capital/number is kept
        a = re.sub(r'(?<=[a-zá-ž])-\n\s*(?=[a-zá-ž])', '', m.group(1))
        w['awards'] = norm(re.sub(r'-\n\s*', '- ', a))
    # header lines: wine name (1-2 lines), alt name, vintage, quality, producer (may wrap)
    yi = next((i for i, l in enumerate(head) if re.fullmatch(r'(19|20)\d{2}', l)), None)
    if yi is not None:
        w['vintage'] = int(head[yi])
        names = head[:yi]
        w['wine'] = names[0] if names else None
        if len(names) > 1: w['wine_alt'] = ' '.join(names[1:])
        rest = head[yi + 1:]
        # quality may wrap (e.g. "moravské zemské víno," + "polosuché")
        q = []
        while rest and (not q or q[-1].endswith(',')):
            q.append(rest.pop(0))
        w['quality'] = ' '.join(q)
        w['producer'] = norm(' '.join(rest))
    else:
        w['header_raw'] = head
    return w


QUAL = (r'(?:pozdní sběr|výběr z hroznů|výběr z bobulí|výběr z cibéb|kabinetní víno|kabinet|slámové víno|ledové víno|'
        r'moravské zemské víno|české zemské víno|zemské víno|jakostní šumivé víno|pěstitelský sekt|jakostní víno známkové|'
        r'jakostní víno odrůdové|likérové víno|jakostní víno|perlivé víno|šumivé víno|víno|VOC [^\d]+?)')
ROW = re.compile(r'^(.*?)\s+(' + QUAL + r')\s+((?:19|20)\d{2})(?:\s+(\S+))?\s*$')


def parse_silver():
    rows, prod, prefix = [], None, ''
    for p in pages:
        if 'Výrobce/Název vína' not in p:
            continue
        for raw in p.split('\n'):
            l = raw.replace('\r', '')
            s = l.strip()
            if not s or 'Výrobce/Název vína' in s or 'Stříbrná medaile Salon' in s or re.fullmatch(r'\d{1,3}', s):
                continue
            if re.search(r'WWW\.|^SALON VÍN|NÁRODNÍ SOUTĚŽ|^2025$|^2026$|^2024$', s):
                continue
            m = ROW.match(s.replace('\t', ' '))
            if not m and '\t' in l:          # producer lines end with tabs; wine rows may contain a tab too
                prod, prefix = re.sub(r'\s{2,}\d+$', '', s.split('\t')[0].strip()), ''
                continue
            if m:
                name = (prefix + ' ' + m.group(1)).strip()
                rows.append({'producer': prod, 'wine': name, 'quality': m.group(2).strip(),
                             'vintage': int(m.group(3)), 'batch': m.group(4)})
                prefix = ''
            else:
                prefix = (prefix + ' ' + s).strip()
    return rows


def parse_producers():
    res = []
    on = False
    for p in pages:
        if 'Seznam výrobců zastoupených' in p and 'Legenda' in p:
            on = True
        if not on: continue
        if 'Výrobce/Název vína' in p: break
        for block in re.split(r'\n(?=\S[^\n]*\n[^\n]*\d{3} ?\d{2}\b)', p):
            pass
        res.append(p)
    return res


ADDR = re.compile(r'^[^\d].*,\s*\d{3} ?\d{2}\s*$|^[^\d].*[A-Za-zá-ž]\s+\d{3} ?\d{2}$')


def structure_producers(raw_pages):
    out_list = []
    for p in raw_pages:
        lines = [l.replace('\r', '').rstrip() for l in p.split('\n')]
        if 'Legenda' in p:  # first page: skip legend part
            k = next((i for i, l in enumerate(lines) if 'bezbariérový' in l or 'stup' == l.strip()), 0)
        # address starts after a blank line; it may wrap onto a second line ending with the postcode
        # ("Blatnice 855," + "Blatnice pod Svatým Antonínkem, 699 71")
        addr_idx, addr_text = [], {}
        for i, l in enumerate(lines):
            s0 = l.strip()
            if not ADDR.search(s0) or s0.startswith('Sklepmistr') or i < 2:
                continue
            if not lines[i - 1].strip():
                addr_idx.append(i); addr_text[i] = s0
            elif i >= 3 and lines[i - 1].strip() and not lines[i - 2].strip() and ':' not in lines[i - 1] and '@' not in lines[i - 1]:
                addr_idx.append(i - 1); addr_text[i - 1] = lines[i - 1].strip() + ' ' + s0
        addr_idx = sorted(set(addr_idx))
        for n, ai in enumerate(addr_idx):
            # name: non-empty lines above the blank line before the address
            j = ai - 2; name_lines = []
            while j >= 0 and lines[j].strip():
                name_lines.insert(0, lines[j].strip()); j -= 1
            stop = addr_idx[n + 1] - 2 if n + 1 < len(addr_idx) else len(lines)
            # move stop up past the next name lines
            if n + 1 < len(addr_idx):
                while stop > ai and lines[stop].strip():
                    stop -= 1
            block = lines[ai:stop]
            wrapped = addr_text[ai] != lines[ai].strip()
            if wrapped: block = block[1:]           # second address line is part of the address
            pr = {'name': ' '.join(name_lines), 'address': addr_text[ai]}
            desc, socials = [], []
            last = None
            for l in block[1:]:
                s = l.strip()
                # cellar master wraps onto an indented line before "Rozloha": "Ing. Marcela Křivohlávková" + "Olbrechtová"
                if last == 'cellar_master' and s and ':' not in s and 'vineyard_area' not in pr and \
                        (pr['cellar_master'].endswith(',') or l.startswith('     ')):
                    cm = pr['cellar_master']
                    sep = ' ' if cm.endswith(',') or len(s.split()) == 1 else ', '
                    pr['cellar_master'] = cm + sep + s; continue
                if (s.startswith('www.') or s.startswith('http')) and ',' in s:
                    parts = [x.strip() for x in s.split(',') if x.strip()]
                    for x in parts:
                        if '@' in x: pr.setdefault('email', x)
                        elif x.startswith('www') or x.startswith('http'): pr.setdefault('web', x)
                    last = 'web'; continue
                if '@' in s and ',' in s and re.search(r'\d{3} \d{3} \d{3}', s):
                    em, _, ph = s.partition(',')
                    pr.setdefault('email', em.strip()); pr.setdefault('phone', ph.strip()); continue
                if not s or re.fullmatch(r'\d{1,3}', s):
                    continue
                low = s.lower()
                if s.startswith('www.') or s.startswith('http'):
                    pr.setdefault('web', s)
                elif '@' in s and ' ' not in s.rstrip(','):
                    pr.setdefault('email', s.rstrip(','))
                elif re.fullmatch(r'[+\d ,]{9,}', s):
                    pr.setdefault('phone', s)
                elif low.startswith('sklepmistr:'):
                    pr['cellar_master'] = s.split(':', 1)[1].strip(); last = 'cellar_master'; continue
                elif low.startswith('rozloha vlastních vinic:'):
                    pr['vineyard_area'] = s.split(':', 1)[1].strip()
                elif low.startswith('roční produkce:'):
                    pr['annual_production'] = s.split(':', 1)[1].strip()
                elif l.startswith(' ') and not desc and len(s) < 60:
                    last = None
                    socials.append(s)
                else:
                    desc.append(s)
            if socials: pr['social'] = socials
            pr['description'] = re.sub(r'\s+', ' ', re.sub(r'-\n', '', '\n'.join(desc))).strip()
            out_list.append(pr)
    return out_list


cards = [c for c in (parse_card(p) for p in pages) if c]
silver = parse_silver()
prod_pages = parse_producers()
producers = structure_producers(prod_pages)
out.write_text(json.dumps({'salon_year': year, 'gold': cards, 'silver': silver, 'producers': producers},
                          ensure_ascii=False, indent=1), encoding='utf-8')
print(year, 'gold', len(cards), 'silver', len(silver), 'producer pages', len(prod_pages), 'producers', len(producers))
missing = [c.get('nr') for c in cards if not c.get('producer') or not c.get('vintage')]
print('incomplete', missing)
