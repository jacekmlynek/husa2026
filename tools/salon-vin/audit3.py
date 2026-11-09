"""Third review pass: header parsing, silver list PDF vs XLSX, producer profile formats, 2026 web/GPS, site wines vs Salon cards.

usage: audit3.py docs/salon-vin WORKDIR/out site-wines.json report.txt
  WORKDIR/out must contain pdfYYYY.json, xlsxYYYY.json, salon2026.json (outputs of parse_pdf/parse_xlsx/scrape2026)
"""
import json, re, sys, unicodedata
from collections import Counter
from pathlib import Path

d_dir, work, site_json, out = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]), Path(sys.argv[4])
D = {int(p.stem[-4:]): json.loads(p.read_text(encoding='utf-8')) for p in sorted(d_dir.glob('salon-vin-*.json'))}
o = open(out, 'w', encoding='utf-8')
issues = Counter()


def W(sec, *a):
    issues[sec] += 1
    o.write(f'[{sec}] ' + ' '.join(str(x) for x in a) + '\n')


def key(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '', s)


def nb(b):
    return re.sub(r'^L(?=\d)', '', re.sub(r'(^|/)0+(\d)', r'\1\2', str(b or '').upper().replace(' ', '')))


QUAL_OK = re.compile(r'^(pozdní sběr|výběr z hroznů|výběr z bobulí|výběr z cibéb|kabinetní víno|slámové víno|ledové víno|likérové víno|'
                     r'moravské zemské víno|české zemské víno|jakostní šumivé víno|pěstitelský sekt|jakostní víno odrůdové|'
                     r'jakostní víno|VOC [A-ZÁ-Ž][\w .áčďéěíňóřšťúůýž-]*)(, (suché|polosuché|polosladké|sladké|brut|brut nature|extra brut|extra dry|demi-sec))?$')

o.write('=== 1. Card headers (name / quality / producer) ===\n')
for y in D:
    pdf = json.loads((work / f'pdf{y}.json').read_text(encoding='utf-8'))
    xl = json.loads((work / f'xlsx{y}.json').read_text(encoding='utf-8'))
    gx = {g['nr']: g for g in next(v for k, v in xl.items() if 'Zlat' in k)}
    for c in pdf['gold']:
        g = gx.get(c['nr'], {})
        if c.get('quality') and not QUAL_OK.match(c['quality']): W('header', y, c['nr'], 'odd quality text', repr(c['quality']))
        kp, kx = key(c.get('producer')), key(g.get('producer'))
        if kp and kx and not (kp[:8] in kx or kx[:8] in kp): W('header', y, c['nr'], 'producer card vs xlsx:', repr(c.get('producer')), '|', repr(g.get('producer')))
        wn = key(c.get('wine'))
        if g.get('wine') and wn and wn[:5] not in key(g['wine']) and key(g['wine'])[:5] not in wn + key(c.get('wine_alt')):
            W('header-name', y, c['nr'], 'name card vs xlsx:', repr(c.get('wine')), '/', repr(c.get('wine_alt')), '|', repr(g.get('wine')))
        if c.get('wine_alt') and re.search(r'\b(rezerva|reserva|barrique|grand|de noirs|blanc)\b', c['wine_alt'], re.I) and not re.search(r'[A-Z][a-z]+ (blanc|noir|gris)$', c['wine_alt']):
            W('header-name', y, c['nr'], 'name wraps into 2nd line?', repr(c.get('wine')), '+', repr(c.get('wine_alt')))

o.write('\n=== 2. Silver: PDF list vs XLSX ===\n')
for y in D:
    pdf = json.loads((work / f'pdf{y}.json').read_text(encoding='utf-8'))
    xs = D[y]['silver']
    xk = Counter((r.get('vintage'), nb(r.get('batch'))) for r in xs if r.get('batch'))
    pk = Counter((r.get('vintage'), nb(r.get('batch'))) for r in pdf['silver'] if r.get('batch'))
    for k in sorted(set(pk) - set(xk), key=str): W('silver', y, 'in PDF list, not in XLSX:', [r for r in pdf['silver'] if (r.get('vintage'), nb(r.get('batch'))) == k])
    for k in sorted(set(xk) - set(pk), key=str): W('silver', y, 'in XLSX, not in PDF list:', [(r['producer'], r['wine'], r.get('vintage'), r.get('batch'), r.get('points')) for r in xs if (r.get('vintage'), nb(r.get('batch'))) == k])
    nob = [r for r in pdf['silver'] if not r.get('batch')]
    if nob: W('silver', y, 'PDF rows without batch:', len(nob), [(r['producer'], r['wine'], r['vintage']) for r in nob])

o.write('\n=== 3. Producer profiles: formats ===\n')
for y, d in D.items():
    for p in d['producers']:
        n = p['name']
        if p.get('web') and not re.fullmatch(r'(https?://)?(www\.)?[\w.-]+\.[a-z]{2,}(/\S*)?', p['web']): W('profile', y, n, 'web?', p['web'])
        if p.get('email') and not re.fullmatch(r'[\w.+-]+@[\w-]+(\.[\w-]+)+', p['email']): W('profile', y, n, 'email?', p['email'])
        if p.get('phone') and not re.fullmatch(r'(\+?\d[\d ]{8,}\d)(, ?\+?\d[\d ]{8,}\d)*', p['phone']): W('profile', y, n, 'phone?', p['phone'])
        va = p.get('vineyard_area')
        if va and not re.fullmatch(r'\d+([,.]\d+)? ?ha|0|Nevlastní vinice|neuvedeno', va): W('profile', y, n, 'vineyard_area?', va)
        ap = p.get('annual_production')
        if ap and not re.fullmatch(r'(Do |do )?\d[\d ]* lahví|neuvedeno|\d[\d ]*', ap) and 'literówka' not in ap: W('profile', y, n, 'production?', ap)
        for s in p.get('social', []):
            if re.fullmatch(r'(Ing\.|Mgr\.|Bc\.)?\s*[A-ZÁ-Ž][a-zá-ž]+( [A-ZÁ-Ž][a-zá-ž]+)?', s) and len(s.split()) <= 3 and not re.search(r'vina|vino|víno|sklep|farm', s, re.I):
                W('profile', y, n, 'social looks like a person name (wrapped cellar master?):', repr(s), '| cellar_master:', p.get('cellar_master'))
        if p.get('description') and len(p['description']) < 120: W('profile', y, n, 'short description', repr(p['description']))

o.write('\n=== 4. 2026 web vs card, GPS vs subregion ===\n')
BOX = {'Znojemská': (15.5, 16.55, 48.6, 49.2), 'Mikulovská': (16.3, 16.95, 48.7, 49.0), 'Velkopavlovická': (16.4, 17.15, 48.75, 49.2),
       'Slovácká': (16.8, 17.8, 48.7, 49.2), 'Mělnická': (14.2, 14.8, 50.2, 50.6)}
for r in D.get(2026, {}).get('gold', []):
    if 'lat' in r:
        b = BOX.get(r.get('subregion'))
        if b and not (b[0] <= r['lon'] <= b[1] and b[2] <= r['lat'] <= b[3]):
            W('gps', 2026, r['nr'], r.get('subregion'), r.get('village'), r['lat'], r['lon'])
    else:
        W('gps', 2026, r['nr'], 'no GPS', r.get('producer'), r.get('village'))
web = json.loads((work / 'salon2026.json').read_text(encoding='utf-8'))
cards = {r['nr']: r for r in D[2026]['gold']}
for w in web['wines']:
    c = cards.get(w['nr'])
    if not c: W('web', 'no card for', w['nr']); continue
    if w.get('vintage') != c.get('vintage'): W('web', w['nr'], 'vintage', w.get('vintage'), c.get('vintage'))
    if key(w.get('producer'))[:8] not in key(c.get('producer_raw') or c.get('producer')) and key(c.get('producer_raw') or c.get('producer'))[:8] not in key(w.get('producer')):
        W('web', w['nr'], 'producer', w.get('producer'), '|', c.get('producer'))

o.write('\n=== 5. Our site wines vs Salon cards ===\n')
site = json.loads(site_json.read_text(encoding='utf-8'))
by_batch = {}
for y, d in D.items():
    for m in ('gold', 'silver'):
        for r in d[m]:
            by_batch.setdefault((r.get('vintage'), nb(r.get('batch'))), []).append((y, m, r))
for wid, w in site['wines'].items():
    mb = re.search(r'partia ([^\s·]+)', w.get('origin', ''))
    if not mb: continue
    pname = key(site['producers'][w['p']]['name'])
    for y, m, r in by_batch.get((w.get('year'), nb(mb.group(1))), []):
        if pname[:5] not in key(r.get('producer')) and pname[:5] not in key(r.get('producer_raw')): continue   # same batch, other winery
        for f_site, f_salon, tol in (('sugar', 'sugar_gl', 0.15), ('acid', 'acid_gl', 0.15), ('alc', 'alcohol_pct', 0.15)):
            a, b = w.get(f_site), r.get(f_salon)
            if a is not None and b is not None and abs(float(a) - float(b)) > tol:
                W('site', wid, f'{f_site}: strona {a} vs Salon {y} {m} {b}')
        aw = w.get('award', '')
        sal = re.search(r'Salon vín (\d{4})', aw)
        if m == 'gold' and not sal: W('site', wid, f'Salon {y} gold ({r.get("points")} pkt) not mentioned in award field: {aw!r}')
        if sal and int(sal.group(1)) == y and m == 'silver': W('site', wid, f'site says Salon gold {y}, data says silver')
        if 'Złoto Salon' in aw and m == 'gold' and str(y) not in aw: W('site', wid, f'award year mismatch: {aw!r} vs gold {y}')
o.write('\n=== 6. Possible same winery under two producer_ids (manual check) ===\n')
STOP = {'vinarstvi', 'rodinne', 'vinne', 'sklepy', 'vinar', 'vinice', 'rodiny', 'moravia', 'moravske', 'vinarska', 'skola', 'statek',
        'winery', 'farma', 'chateau', 'agrodruzstvo', 'martin', 'stanislav', 'miroslav', 'jaroslav', 'frantisek', 'ladislav', 'bronislav',
        'pavel', 'petr', 'josef', 'mikulov', 'valtice', 'bzenec', 'znojmo', 'rakvice', 'nechory', 'velke', 'pavlovice', 'bilovice',
        'zamecke', 'agropoint', 'heritage', 'vinarske', 'hnanice', 'cejkovice', 'mutenice', 'novotny'}
# checked by hand: different companies despite a shared word (different seat / address)
KNOWN_DIFFERENT = {frozenset({'kamilprokes', 'prokes'}), frozenset({'ingfrantisekzapletal', 'vinnesklepyzapletal'})}
names = {}
for y, d in D.items():
    for m in ('gold', 'silver'):
        for r in d[m]:
            names.setdefault(r['producer_id'], set()).update({r['producer'], r.get('producer_raw') or r['producer']})
    for p in d['producers']:
        names.setdefault(p['producer_id'], set()).add(p['name'])


def toks(n):
    return {t for t in re.findall(r'[a-z]{5,}', unicodedata.normalize('NFKD', n).encode('ascii', 'ignore').decode().lower())} - STOP


tk = {i: set().union(*(toks(n) for n in ns)) for i, ns in names.items()}
ids = sorted(tk)
for i, a in enumerate(ids):
    for b in ids[i + 1:]:
        if tk[a] & tk[b] and frozenset({a, b}) not in KNOWN_DIFFERENT:
            W('same-winery?', a, '<->', b, sorted(names[a]), sorted(names[b]))

o.write('\n=== SUMMARY ===\n' + json.dumps(issues, ensure_ascii=False) + '\n')
o.close()
print(dict(issues))
