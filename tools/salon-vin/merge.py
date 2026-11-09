"""Merge xlsx (points) + pdf (cards, producers) + web (2026 links/GPS) into consistent docs/salon-vin/salon-vin-YYYY.json.

Rules (documented in docs/salon-vin/README.md):
- gold: main values from the catalogue card (PDF); xlsx values that differ go to `xlsx_diff`.
- silver: xlsx only (the PDF silver list loses producers at page breaks).
- producer names unified across years -> `producer` + `producer_id`; original kept in `producer_raw` when different.
- `wine_id` = producer_id + wine + vintage + batch; `other_years` links the same wine across Salon years.
"""
import json, re, sys, unicodedata
from collections import Counter, defaultdict
from pathlib import Path

out_dir = Path(sys.argv[1]); work = Path(sys.argv[2]); years = sorted(int(y) for y in sys.argv[3:])
out_dir.mkdir(parents=True, exist_ok=True)
NVC = 'https://www.vinarskecentrum.cz'
# rough lon/lat boxes of the wine sub-regions, used to catch map points that cannot belong to the stated village
SUBREGION_BOX = {'Znojemská': (15.5, 16.55, 48.6, 49.2), 'Mikulovská': (16.3, 16.95, 48.7, 49.0),
                 'Velkopavlovická': (16.4, 17.15, 48.75, 49.2), 'Slovácká': (16.8, 17.8, 48.7, 49.2), 'Mělnická': (14.2, 14.8, 50.2, 50.6)}
NUMF = ('sugar_gl', 'acid_gl', 'alcohol_pct', 'extract_gl', 'must_nm', 'points')


def key(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '', s)


LEGAL = re.compile(r'(,?\s*(spol\.\s*s\s*r\.\s*o\.?|s\.\s*r\.\s*o\.?|a\.\s*s\.?|o\.\s*p\.\s*s\.?))+\s*$', re.I)


def pkey(name):
    n = re.sub(r',\s*Hlavní 169.*$', '', str(name or ''))          # address glued to name in xlsx
    n = re.sub(r'\s+[-–]\s+(Stanislav|Martin) Škrobák$', '', n)     # two Škrobák entities = one winery in catalogue
    n = LEGAL.sub('', n)
    k = key(n)
    for pre in ('vinarstvi', 'rodinnevinarstvi', 'vino'):
        if k.startswith(pre) and len(k) > len(pre) + 3: k = k[len(pre):]
    k = k or key(name)
    return ALIAS.get(k, k)


# same winery written differently in wine lists vs. producer profiles (verified in catalogues)
ALIAS = {
    'kamilprokeskamilprokes': 'kamilprokes', 'kamilprokesvinarstvikamilprokes': 'kamilprokes', 'kamilprokesvinarstvi': 'kamilprokes',
    'vinarjiriuherekjiriuherek': 'vinarjiriuherek',
    'skolnistatekstredoceskehokrajestrediskomelnik': 'skolnistatekstredoceskehokraje',
    'martincapka': 'capkamartincapka',
    'janplacekingjanplacek': 'placekingjanplacek',
    'rodinyburiankovy': 'jaroslavburianek',          # 2024: card "Vinařství Rodiny Buriánkovy", xlsx "Jaroslav Buriánek"
    'habrina': 'miroslavhabrina',                    # 2024: card "Vinařství Habřina", xlsx/profile "Miroslav Habřina"
    'stanislavskrobakvinarstviskrobak': 'skrobak',   # one winery, two cellar masters (Stanislav / Martin Škrobák)
    'skrobakmartinskrobak': 'skrobak',
    'bravenec': 'bravenecingmartinbravenec',         # Čejč
    'vinnesklepyujenouraprusankynechoryjanivicic': 'janivicicvinnesklepyujenoura',
    'jindrichkadrnka': 'kadrnka',                    # same address Mládežnická 411, Březí
    'petrjacina': 'jacinavinarstviuceskehoraje',     # Mnichovo Hradiště
}


def clean(s):
    if not isinstance(s, str): return s
    s = s.replace(' ', ' ')
    s = re.sub(r'\b(po|pod)-\s?(doblast|oblast)', 'podoblast', s)       # hyphenation from PDF line breaks
    s = re.sub(r'\s+,', ',', s)
    s = re.sub(r'\s{2,}', ' ', s)
    return s.strip()


def nbatch(b):
    return re.sub(r'^L(?=\d)', '', re.sub(r'(^|/)0+(\d)', r'\1\2', str(b or '').upper().replace(' ', '')))


def load(p):
    p = work / p
    return json.loads(p.read_text(encoding='utf-8')) if p.exists() else None


docs = {}
for y in years:
    xl = load(f'xlsx{y}.json') or {}
    pdf = load(f'pdf{y}.json') or {'gold': [], 'silver': [], 'producers': []}
    web = load(f'salon{y}.json') if y == 2026 else None
    gold_x = next((v for k, v in xl.items() if 'Zlat' in k), [])
    silver_x = next((v for k, v in xl.items() if 'Zlat' not in k), [])
    cards = {c['nr']: c for c in pdf['gold']}
    webw = {w['nr']: w for w in (web or {}).get('wines', []) if isinstance(w.get('nr'), int)}
    gold = []
    nrs = [g['nr'] for g in gold_x] or sorted(cards)
    gx = {g['nr']: g for g in gold_x}
    for n in nrs:
        g, c, w = gx.get(n, {}), cards.get(n, {}), webw.get(n, {})
        r = {'nr': n, 'medal': 'zlatá', 'points': g.get('points'),
             'wine': g.get('wine') or c.get('wine'), 'wine_label': ' '.join(x for x in (c.get('wine'), c.get('wine_alt')) if x) or None,
             'vintage': c.get('vintage') or g.get('vintage'),
             'quality': (c.get('quality') or '').split(',')[0].strip() or g.get('quality'),
             'quality_full': c.get('quality'), 'category': g.get('category'),
             'producer_raw': c.get('producer') or g.get('producer'), 'producer_town': g.get('producer_town'),
             'region': c.get('region') or (g.get('region') or '/').split('/')[0] or None,
             'subregion': c.get('subregion') or (g.get('region') or '').split('/')[-1] or None,
             'village': c.get('village') or g.get('village'), 'vineyard': c.get('vineyard') or g.get('vineyard'),
             'harvest_date': c.get('harvest_date'), 'yield_t_ha': c.get('yield_t_ha'), 'must_nm': c.get('must_nm'), 'batch': c.get('batch') or g.get('batch'),
             'bottles': c.get('bottles'), 'sugar_gl': c.get('sugar_gl'), 'acid_gl': c.get('acid_gl'),
             'alcohol_pct': c.get('alcohol_pct'), 'extract_gl': c.get('extract_gl'),
             'drink_window': c.get('drink_window'), 'description': c.get('description'), 'awards': c.get('awards')}
        diff = {}
        for f in ('sugar_gl', 'acid_gl', 'alcohol_pct'):
            xv = g.get(f)
            if r[f] is None and xv not in (None, 0):
                r[f] = xv
            elif xv is not None and r[f] is not None and abs(float(xv) - float(r[f])) > 0.05:
                diff[f] = xv
        if g.get('producer') and pkey(g['producer']) != pkey(r['producer_raw']):
            diff['producer'] = g['producer']
            card_ids = {pkey(cc.get('producer')) for nn, cc in cards.items() if nn != n}
            if pkey(g['producer']) in card_ids:
                # xlsx row names a winery that owns another gold card this year -> name/producer columns swapped in xlsx
                diff['wine'] = g.get('wine')
                r['wine'] = r['wine_label'] or r['wine']
                r['_note'] = ('w arkuszu przy tym numerze producent i nazwa innego złotego wina (zamienione wiersze); '
                              'karta w katalogu i strona NVC są zgodne, punkty przypisane według numeru')
        if g.get('quality') and r.get('quality') and not key(r['quality']).startswith(key(g['quality'])):
            diff['quality'] = g['quality']
        if g.get('vintage') and r.get('vintage') and g['vintage'] != r['vintage']:
            diff['vintage'] = g['vintage']
        if g.get('batch') is not None and nbatch(g['batch']) != nbatch(r['batch']):
            diff['batch'] = str(g['batch'])
        if diff: r['xlsx_diff'] = diff
        for k in ('url', 'eshop_url', 'producer_url', 'bottle_img', 'aroma_chart_img', 'lat', 'lon'):
            if w.get(k) is not None: r[k] = w[k]
        if 'lat' in r:
            b = SUBREGION_BOX.get(r.get('subregion'))
            if b and not (b[0] <= r['lon'] <= b[1] and b[2] <= r['lat'] <= b[3]):
                r['map_point_suspect'] = {'lat': r.pop('lat'), 'lon': r.pop('lon')}
                r['_note_gps'] = f'punkt z mapy NVC leży poza podobszarem {r.get("subregion")} – nie odpowiada gminie {r.get("village")}'
        if w:
            # web "počet lahví partie" is actually the batch volume in litres (PDF bottles x bottle size)
            if isinstance(w.get('bottles'), (int, float)): r['batch_volume_l'] = w['bottles']
            wd = {}
            for f in ('sugar_gl', 'acid_gl', 'alcohol_pct', 'extract_gl', 'must_nm'):
                a, b = r.get(f), w.get(f)
                if isinstance(a, (int, float)) and isinstance(b, (int, float)) and abs(a - b) > 0.05: wd[f] = b
            for f in ('batch', 'village', 'vineyard', 'drink_window'):
                a, b = r.get(f), w.get(f)
                if a and b and key(a) != key(b): wd[f] = b
            if wd: r['web_diff'] = wd
        if y == 2026 and 'url' not in r: r['url'] = f'{NVC}/salon-vin/vina-v-salonu/26{n:03d}'
        gold.append(r)
    silver = []
    for s in silver_x:
        silver.append({'medal': 'stříbrná', 'points': s.get('points'), 'wine': s.get('wine'), 'vintage': s.get('vintage'),
                       'quality': s.get('quality'), 'category': s.get('category'), 'producer_raw': s.get('producer'),
                       'producer_town': s.get('producer_town'), 'region': (s.get('region') or '/').split('/')[0] or None,
                       'subregion': (s.get('region') or '').split('/')[-1] or None,
                       'village': s.get('village'), 'vineyard': s.get('vineyard'), 'batch': s.get('batch'),
                       'sugar_gl': s.get('sugar_gl'), 'acid_gl': s.get('acid_gl'), 'alcohol_pct': s.get('alcohol_pct')})
    silver.sort(key=lambda r: -(r.get('points') or 0))
    producers = pdf.get('producers', [])
    if web:
        wp = {pkey(p['name']): p for p in web.get('producers', [])}
        for p in producers:
            m = wp.get(pkey(p['name']))
            if m: p['nvc_url'] = m['url']
    docs[y] = {'gold': gold, 'silver': silver, 'producers': producers}

# ---------- data fixes & sanity ----------
for d in docs.values():
    for r in d['gold']:
        for t in ('_note', '_note_gps'):
            if t in r: r.setdefault('notes', []).append(r.pop(t))
for y, d in docs.items():
    for r in d['gold'] + d['silver']:
        notes = r.pop("notes", [])
        for f in list(r):
            r[f] = clean(r[f])
        if r.get('vintage') in (0, '0'):
            r['vintage'] = None; notes.append('rocznik w arkuszu = 0 (brak danych)')
        if r.get('acid_gl') == 0:
            r['acid_gl'] = None; notes.append('kwasy w arkuszu = 0 (brak danych)')
        if r.get('must_nm') in ('-', '–'):
            r['must_nm'] = None
        if isinstance(r.get('alcohol_pct'), (int, float)) and r['alcohol_pct'] < 7 and (r.get('sugar_gl') or 0) < 45:
            notes.append(f'podejrzany alkohol {r["alcohol_pct"]} % (wytrawne wino) – prawdopodobnie błąd w arkuszu')
        if 'xlsx_diff' in r and 'sugar_gl' in r['xlsx_diff'] and abs(r['xlsx_diff']['sugar_gl'] - (r.get('sugar_gl') or 0)) > 3:
            notes.append('duża różnica cukru między kartą a arkuszem')
        if notes: r['notes'] = notes
    for p in d['producers']:
        for f in list(p):
            if isinstance(p[f], str): p[f] = clean(p[f])
        if p.get('description'):  # page number / running header glued to the end of the text
            p['description'] = re.sub(r'(?<=[.!?)“"”])\s*\d{3,6}\s*$', '', p['description']).strip()
        if p.get('cellar_master', '').endswith(','): p['cellar_master'] = p['cellar_master'].rstrip(',')
        if p.get('annual_production') == '150 00 lahví': p['annual_production'] = '150 00 lahví (literówka w katalogu; przy 3,1 ha winnic prawdopodobnie 15 000)'

# ---------- canonical producer names ----------
raw_by_key = defaultdict(Counter)
profile_name = {}
for y in years:
    for p in docs[y]['producers']:
        profile_name[pkey(p['name'])] = p['name']              # latest year wins
    for r in docs[y]['gold'] + docs[y]['silver']:
        raw_by_key[pkey(r['producer_raw'])][r['producer_raw']] += 1
canon = {}
for k, cnt in raw_by_key.items():
    canon[k] = profile_name.get(k) or sorted(cnt.items(), key=lambda t: (-t[1], '\\' in t[0], t[0]))[0][0]
for k, n in profile_name.items():
    canon.setdefault(k, n)
for y in years:
    for r in docs[y]['gold'] + docs[y]['silver']:
        k = pkey(r['producer_raw'])
        r['producer'] = canon[k]; r['producer_id'] = k
        if r['producer'] == r['producer_raw']: del r['producer_raw']
    for p in docs[y]['producers']:
        k = pkey(p['name'])
        p['producer_id'] = k
        if canon.get(k) and canon[k] != p['name']:
            p['name_raw'] = p['name']; p['name'] = canon[k]

# ---------- wine ids & cross-year links ----------
occ = defaultdict(list)
for y in years:
    for medal in ('gold', 'silver'):
        for r in docs[y][medal]:
            b = nbatch(r.get('batch'))
            r['wine_id'] = f"{r['producer_id']}|{r.get('vintage')}|{b}" if b else f"{r['producer_id']}|{r.get('vintage')}|{key(r.get('wine'))}"
            occ[r['wine_id']].append((y, r))
for wid, lst in occ.items():
    if len(lst) > 1:
        for y, r in lst:
            r['other_years'] = [{'salon_year': y2, 'medal': r2['medal'], 'points': r2.get('points'), **({'nr': r2['nr']} if r2.get('nr') else {})}
                                for y2, r2 in lst if (y2, id(r2)) != (y, id(r))]
# duplicates inside a year (same wine_id twice) -> keep higher points
dups = []
for y in years:
    for medal in ('gold', 'silver'):
        seen = {}
        keep = []
        for r in docs[y][medal]:
            if r['wine_id'] in seen:
                dups.append((y, medal, r['wine_id'])); continue
            seen[r['wine_id']] = r; keep.append(r)
        docs[y][medal] = keep

ORDER = ['nr', 'medal', 'points', 'wine', 'wine_label', 'vintage', 'quality', 'quality_full', 'category', 'producer', 'producer_id',
         'producer_raw', 'producer_town', 'region', 'subregion', 'village', 'vineyard', 'harvest_date', 'yield_t_ha', 'must_nm', 'batch', 'bottles',
         'sugar_gl', 'acid_gl', 'alcohol_pct', 'extract_gl', 'drink_window', 'description', 'awards', 'batch_volume_l', 'xlsx_diff', 'web_diff', 'notes',
         'wine_id', 'other_years', 'url', 'eshop_url', 'producer_url', 'bottle_img', 'aroma_chart_img', 'lat', 'lon', 'map_point_suspect']


def tidy(r):
    return {k: r[k] for k in ORDER + [k for k in r if k not in ORDER] if k in r and r[k] not in (None, '', [], {})}


for y in years:
    d = docs[y]
    src = {'catalogue_pdf': f'{NVC}/storage/files/Katalog-Salon-vin-{y}' + ('.pdf' if y == 2024 else '-web.pdf'),
           'medals_xlsx': f'{NVC}/download/zlate-a-stribrne-medaile-salon-vin-{y}.xlsx'}
    if y == 2026:
        src.update({'wines_web': f'{NVC}/salon-vin/vina-v-salonu', 'map_web': f'{NVC}/salon-vin/vina-v-salonu/interaktivni-mapa'})
    doc = {'salon_year': y, 'title': f'Salon vín – Národní soutěž vín ČR {y}', 'generated': '2026-11-09', 'sources': src,
           'counts': {'gold': len(d['gold']), 'silver': len(d['silver']), 'producers': len(d['producers']),
                      'gold_with_card': sum(1 for r in d['gold'] if r.get('description'))},
           'gold': [tidy(r) for r in d['gold']], 'silver': [tidy(r) for r in d['silver']],
           'producers': [tidy(p) for p in d['producers']]}
    (out_dir / f'salon-vin-{y}.json').write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding='utf-8')
    print(y, doc['counts'], 'diffs', sum(1 for r in d['gold'] if r.get('xlsx_diff')), 'notes', sum(1 for r in d['gold'] + d['silver'] if r.get('notes')))
print('in-year duplicates removed:', dups)
print('producers canonical:', len(set(canon.values())), 'cross-year wines:', sum(1 for v in occ.values() if len(v) > 1))
