"""Second, deeper data review of docs/salon-vin/*.json.

1. gold collection vs the statistics tables printed in each catalogue (subregions, vintages, quality levels, firms, top producers)
2. schema/type consistency across years
3. numbering, points vs statute (min. 84 pts), category vs residual sugar
4. harvest date vs vintage, drink window format, GPS bounds, URLs vs nr
5. gold producers without a catalogue profile, truncated texts, awards mention of the right Salon year
6. same wine across years with conflicting parameters
"""
import json, re, sys, unicodedata
from collections import Counter, defaultdict
from pathlib import Path

d_dir, out = Path(sys.argv[1]), Path(sys.argv[2])
D = {int(p.stem[-4:]): json.loads(p.read_text(encoding='utf-8')) for p in sorted(d_dir.glob('salon-vin-*.json'))}
o = open(out, 'w', encoding='utf-8')
issues = Counter()


def W(sec, *a):
    issues[sec] += 1
    o.write(f'[{sec}] ' + ' '.join(str(x) for x in a) + '\n')


def key(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '', s)


# reference tables copied from the "Statistika kolekce" pages of each catalogue
REF = {
    2024: {'subregion': {'Mikulovská': 31, 'Velkopavlovická': 29, 'Slovácká': 23, 'Znojemská': 14, 'Litoměřická': 2, 'Mělnická': 1},
           'vintage': {2022: 44, 2021: 42, 2020: 6, 2018: 5, 2019: 3},
           'quality': {'pozdní sběr': 54, 'výběr z hroznů': 29, 'VOC Znojmo': 4, 'výběr z cibéb': 3, 'moravské zemské víno': 2,
                       'pěstitelský sekt': 2, 'jakostní víno odrůdové': 1, 'kabinetní víno': 1, 'likérové víno': 1,
                       'VOC Hustopečsko': 1, 'VOC Mělník': 1, 'výběr z bobulí': 1},
           'firms': 54, 'colour': {'white': 87, 'red': 11, 'rose': 2},
           'top': {'Zámecké vinařství Bzenec': 10, 'Volařík': 6, 'Kamil Prokeš': 6, 'Štěpán Maňák': 5, 'Mikrosvín': 4,
                   'U Kapličky': 4, 'VÍNO Mikulov': 4, 'Znovín': 4, 'Skoupil': 3}},
    2025: {'subregion': {'Velkopavlovická': 29, 'Mikulovská': 27, 'Slovácká': 22, 'Znojemská': 18, 'Mělnická': 3, 'bez podoblasti': 1},
           'vintage': {2018: 1, 2019: 5, 2020: 2, 2021: 22, 2022: 34, 2023: 36},
           'quality': {'pozdní sběr': 52, 'výběr z hroznů': 23, 'moravské zemské víno': 6, 'VOC Znojmo': 4, 'výběr z cibéb': 4,
                       'výběr z bobulí': 3, 'kabinetní víno': 2, 'jakostní šumivé víno': 2, 'VOC Slovácko': 1, 'VOC Modré hory': 1,
                       'české zemské víno': 1, 'VOC Mikulovsko': 1},
           'firms': 62, 'colour': {'white': 76, 'red': 22, 'rose': 2},
           'top': {'Hanzel': 5, 'Volařík': 4, 'Štěpán Maňák': 4, 'DAVINUS': 4, 'LAHOFER': 3, 'U Kapličky': 3, 'Mikrosvín': 3,
                   'Lechovice': 3, 'Skoupil': 3, 'Kněží hora': 3, 'Vít Sedláček': 3, 'Zámecké vinařství Bzenec': 3}},
    2026: {'subregion': {'Mikulovská': 29, 'Slovácká': 27, 'Velkopavlovická': 25, 'Znojemská': 16, 'Mělnická': 2, 'bez podoblasti': 1},
           'vintage': {2023: 37, 2024: 31, 2022: 14, 2021: 7, 2018: 6, 2019: 3, 2015: 1, 2020: 1},
           'quality': {'pozdní sběr': 40, 'výběr z hroznů': 38, 'moravské zemské víno': 6, 'výběr z bobulí': 4, 'VOC Znojmo': 3,
                       'pěstitelský sekt': 2, 'VOC Pálava': 2, 'české zemské víno': 1, 'jakostní šumivé víno': 1, 'slámové víno': 1,
                       'VOC Bzenec': 1, 'výběr z cibéb': 1},
           'firms': 61, 'colour': {'white': 72, 'red': 26, 'rose': 2},
           'top': {'B/V vinařství': 6, 'Zámecké vinařství Bzenec': 5, 'Volařík': 4, 'Buchtovi': 4, 'Gotberg': 3, 'Kamil Prokeš': 3,
                   'Štěpán Maňák': 3, 'Bíza Čejkovice': 3, 'Garčic': 3, 'ŠTĚPÁNEK': 3, 'DAVINUS': 2, 'HABÁNSKÉ': 2, 'Kosík': 2,
                   'Bunža': 2, 'Hanzel': 2, 'Plaček': 2, 'Mikrosvín': 2, 'Plešingr': 2, 'Špalkovy': 2, 'ŠOMAN': 2,
                   'J.STÁVEK': 2, 'Znovín': 2}},
}


def colour(r):
    c = r.get('category', '')
    name = key(r.get('wine')) + key(r.get('wine_label'))
    if c == 'D' or 'rose' in name or 'klaret' in name: return 'rose'
    if 'fortifik' in key(r.get('description')): return 'red'   # e.g. 2024 J. Stávek port-style Frankovka
    if c in ('E', 'F') or 'cerven' in name and 'tramin' not in name and 'veltlin' not in name: return 'red'
    return 'white'


o.write('=== 1. Gold vs catalogue statistics ===\n')
for y, d in D.items():
    g = d['gold']; ref = REF.get(y)
    if not ref: continue
    sub = Counter((r.get('subregion') or 'bez podoblasti').replace('bez podoblasti', 'bez podoblasti') for r in g)
    for k in set(sub) | set(ref['subregion']):
        if sub.get(k, 0) != ref['subregion'].get(k, 0): W('stat', y, 'subregion', k, 'data', sub.get(k, 0), 'catalogue', ref['subregion'].get(k, 0))
    vin = Counter(r.get('vintage') for r in g)
    for k in set(vin) | set(ref['vintage']):
        if vin.get(k, 0) != ref['vintage'].get(k, 0): W('stat', y, 'vintage', k, 'data', vin.get(k, 0), 'catalogue', ref['vintage'].get(k, 0))
    q = Counter((r.get('quality_full') or r.get('quality') or '').split(',')[0].strip() for r in g)
    for k in set(q) | set(ref['quality']):
        if q.get(k, 0) != ref['quality'].get(k, 0): W('stat', y, 'quality', repr(k), 'data', q.get(k, 0), 'catalogue', ref['quality'].get(k, 0))
    firms = len({r['producer_id'] for r in g})
    if firms != ref['firms']: W('stat', y, 'firms', 'data', firms, 'catalogue', ref['firms'])
    col = Counter(colour(r) for r in g)
    for k, v in ref['colour'].items():
        if col.get(k, 0) != v: W('stat', y, 'colour', k, 'data', col.get(k, 0), 'catalogue', v)
    for name, n in ref['top'].items():
        cnt = sum(1 for r in g if key(name) in key(r['producer']))
        if cnt != n: W('stat', y, 'top producer', name, 'data', cnt, 'catalogue', n)

o.write('\n=== 2. Schema / types ===\n')
types = defaultdict(lambda: defaultdict(set))
for y, d in D.items():
    for m in ('gold', 'silver'):
        for r in d[m]:
            for k, v in r.items():
                types[(m, k)][type(v).__name__].add(y)
for (m, k), t in sorted(types.items()):
    if len(t) > 1:
        W('type', m, k, {kk: sorted(vv) for kk, vv in t.items()})
for m in ('gold', 'silver'):
    fields = {y: set().union(*(r.keys() for r in d[m])) for y, d in D.items()}
    allf = set().union(*fields.values())
    for y, f in fields.items():
        miss = allf - f - {'url', 'eshop_url', 'producer_url', 'bottle_img', 'aroma_chart_img', 'lat', 'lon', 'batch_volume_l', 'web_diff'}
        if miss: W('schema', y, m, 'fields missing vs other years:', sorted(miss))

o.write('\n=== 3. Numbering, points, category vs sugar ===\n')
CAT_SUGAR = {'A': (0, 9), 'E': (0, 4), 'B': (4, 45), 'F': (4, 45), 'C': (45, 1000), 'D': (0, 45)}
for y, d in D.items():
    nrs = [r.get('nr') for r in d['gold']]
    if sorted(nrs) != list(range(1, 101)): W('nr', y, 'gold numbering not 1..100', sorted(set(range(1, 101)) - set(nrs)))
    for m in ('gold', 'silver'):
        for r in d[m]:
            p = r.get('points')
            if p is None: W('points', y, m, 'missing', r.get('producer'), r.get('wine'))
            elif p < 84: W('points', y, m, 'below 84 (statute minimum)', p, r.get('producer'), r.get('wine'))
            c, s = r.get('category'), r.get('sugar_gl')
            if c in CAT_SUGAR and isinstance(s, (int, float)):
                lo, hi = CAT_SUGAR[c]
                if not (lo - 0.5 <= s <= hi + 0.5): W('category', y, m, f'cat {c} sugar {s}', r.get('producer'), r.get('wine'), r.get('nr', ''))
    if d['gold'] and d['silver']:
        if min(r['points'] for r in d['gold'] if r.get('points')) < 84: W('points', y, 'gold min < 84')

o.write('\n=== 4. Dates, windows, GPS, URLs ===\n')
for y, d in D.items():
    for r in d['gold']:
        hd = r.get('harvest_date')
        if hd:
            m = re.match(r'(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$', hd)
            if not m: W('date', y, r['nr'], 'unparsed harvest_date', repr(hd))
            else:
                dd, mm, yy = map(int, m.groups())
                ok = (yy == r.get('vintage') and 8 <= mm <= 12) or (yy == (r.get('vintage') or 0) + 1 and mm <= 2)
                if not ok: W('date', y, r['nr'], 'harvest', hd, 'vs vintage', r.get('vintage'), r.get('producer'))
        dw = r.get('drink_window')
        if dw and not re.fullmatch(r'(19|20)\d{2}[–-](19|20)\d{2}', dw): W('window', y, r['nr'], repr(dw))
        elif dw:
            a, b = map(int, re.split('[–-]', dw))
            if not (a <= b and a >= y - 1): W('window', y, r['nr'], 'odd window', dw)
        if 'lat' in r and not (48.5 <= r['lat'] <= 51.1 and 12 <= r['lon'] <= 19): W('gps', y, r['nr'], r['lat'], r['lon'])
        if r.get('url') and not r['url'].endswith(f"{y % 100}{r['nr']:03d}"): W('url', y, r['nr'], r['url'])
        if not r.get('description'): W('card', y, r['nr'], 'no description')
        elif not re.search(r'[.!?…“”"\)]\s*$', r['description']): W('card', y, r['nr'], 'description may be truncated:', r['description'][-60:])
        aw = r.get('awards', '')
        if aw and y != 2024 and str(y) not in aw: W('awards', y, r['nr'], 'awards text does not mention Salon year', aw[-80:])
        for f in ('village', 'vineyard', 'batch', 'bottles', 'sugar_gl', 'acid_gl', 'alcohol_pct'):
            if r.get(f) in (None, ''): W('missing', y, r['nr'], f, r.get('producer'), r.get('wine'))

o.write('\n=== 5. Producers / profiles ===\n')
for y, d in D.items():
    prof = {p['producer_id'] for p in d['producers']}
    gp = {r['producer_id']: r['producer'] for r in d['gold']}
    for pid, name in gp.items():
        if pid not in prof: W('profile', y, 'gold producer without profile:', name)
    for p in d['producers']:
        if p['producer_id'] not in gp: W('profile', y, 'profile without gold wine:', p['name'])
        for f in ('address', 'web', 'description'):
            if not p.get(f): W('profile', y, p['name'], 'missing', f)

o.write('\n=== 6. Same wine across years with conflicting parameters ===\n')
by = defaultdict(list)
for y, d in D.items():
    for m in ('gold', 'silver'):
        for r in d[m]:
            by[r['wine_id']].append((y, m, r))
for wid, lst in by.items():
    if len(lst) < 2: continue
    for f, tol in (('sugar_gl', 1.0), ('acid_gl', 0.5), ('alcohol_pct', 0.6), ('vintage', 0)):
        vals = {(y, m): r.get(f) for y, m, r in lst if r.get(f) is not None}
        nums = [v for v in vals.values() if isinstance(v, (int, float))]
        if nums and max(nums) - min(nums) > tol: W('cross', wid, f, vals)
    names = {key(r.get('wine'))[:12] for _, _, r in lst}
    if len({key(r.get('wine'))[:6] for _, _, r in lst}) > 1: W('cross-name', wid, [(y, r.get('wine')) for y, _, r in lst])

o.write('\n=== SUMMARY ===\n' + json.dumps(issues, ensure_ascii=False) + '\n')
o.close()
print(dict(issues))
