"""Opisy smakowe win ze strony: zbiera opisy producentów i czeskich sklepów-portali, przypisuje aromaty do grup Salonu vín.

Nie tworzy skal 0–10. Zapisuje tylko to, co źródło podaje, z linkiem; grupy aromatów = słowa z opisu
przypisane do kategorii z metodyki Salonu vín (katalog, s. 23–24: przykłady dla każdej grupy).

usage: python tools/wina-opisy/build.py site-wines.json CACHE_DIR docs/wina-opisy
  site-wines.json: node -e "global.window={};require('./site/js/wines.js');require('./site/js/aroma.js');
                   require('fs').writeFileSync('site-wines.json',JSON.stringify({producers:window.WINES.producers,
                   wines:window.WINES.wines,aroma:Object.keys(window.AROMA)}))"
"""
import hashlib, html, json, re, sys, time, unicodedata, urllib.parse, urllib.request
from pathlib import Path

site = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
CACHE = Path(sys.argv[2]); CACHE.mkdir(parents=True, exist_ok=True)
OUT = Path(sys.argv[3]); OUT.mkdir(parents=True, exist_ok=True)


def key(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '', s)


def get(url, timeout=90):
    f = CACHE / (hashlib.md5(url.encode()).hexdigest()[:12] + '.html')
    if f.exists() and f.stat().st_size > 500:
        return f.read_text(encoding='utf-8', errors='replace')
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'cs,en'})
            data = urllib.request.urlopen(req, timeout=timeout).read().decode('utf-8', 'replace')
            f.write_text(data, encoding='utf-8'); time.sleep(0.4)
            return data
        except Exception as e:  # noqa
            err = e; time.sleep(3)
    print('  FAIL', url, str(err)[:60], file=sys.stderr)
    return ''


def text_of(fragment):
    fragment = re.sub(r'<script.*?</script>|<style.*?</style>', '', fragment, flags=re.S | re.I)
    fragment = re.sub(r'<br\s*/?>|</p>|</li>|</div>|</h\d>', '\n', fragment)
    t = html.unescape(re.sub(r'<[^>]+>', ' ', fragment))
    return re.sub(r'[ \t\xa0]+', ' ', re.sub(r'\s*\n\s*', '\n', t)).strip()


TASTE = re.compile(r'(vůn|vůně|chuť|chuti|aroma|barv|tón|dochuť|ovoc|minerál|kyselin|buket|nos\b|na patře)', re.I)


def tasting_paragraphs(h):
    """Paragraph-level texts that read like a tasting note (>=2 taste words)."""
    h = re.sub(r'<script.*?</script>|<style.*?</style>|<nav.*?</nav>|<footer.*?</footer>|<header.*?</header>', '', h, flags=re.S | re.I)
    out, seen = [], set()
    for b in re.split(r'</p>|<br\s*/?>|</li>|</div>|</td>|</h\d>', h):
        t = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', b))).strip()
        if 60 <= len(t) <= 1500 and len(TASTE.findall(t)) >= 2 and t not in seen and 'cookies' not in t.lower():
            seen.add(t); out.append(t)
    # drop paragraphs fully contained in a longer one
    return [t for t in out if not any(t != u and t in u for u in out)]


LABELS = {  # label in source -> field
    'Zbytkový cukr': 'sugar', 'Cukr': 'sugar', 'Kyseliny': 'acid', 'K yseliny': 'acid', 'Obsah kyselin': 'acid', 'Alkohol': 'alcohol',
    'Bezcukerný extrakt': 'extract', 'Doporučená teplota': 'serving_temp', 'Teplota podávání': 'serving_temp',
    'Odhadovaná doba názrávání': 'aging', 'Archivace': 'aging', 'Doporučená lahvová zralost': 'aging', 'Potenciál zrání': 'aging', 'Potenciál': 'aging',
    'Viniční trať': 'vineyard', 'Vinařská obec': 'village', 'Šarže': 'batch', 'Číslo šarže': 'batch', 'Ročník': 'vintage',
}


def labelled_values(t):
    vals = {}
    for lab, f in LABELS.items():
        m = re.search(r'(?:^|\n)\s*' + re.escape(lab) + r'\s*:?\s*\n?\s*([^\n]{1,80})', t)
        if m and f not in vals:
            v = m.group(1).strip(' :,;')
            if v and not v.startswith(('Kategorie', 'Hmotnost')): vals[f] = v
    m = re.search(r'Doporučená teplota[^\n]*?(\d{1,2}\s*[–-]\s*\d{1,2}\s*°C)', t)
    if m: vals['serving_temp'] = m.group(1)
    m = re.search(r'Odhadovaná doba ná?zrávání\s*([^\n]{1,60})', t)
    if m: vals['aging'] = m.group(1).strip()
    food = re.findall(r'Vhodné k\s+([^\n]{2,40})', t)
    if food: vals['food'] = sorted(set(x.strip() for x in food))
    m = re.search(r'Párování:\s*\n?((?:[^\n:]{3,40}\n){1,8})', t)
    if m and 'food' not in vals:
        food = []
        for x in m.group(1).split('\n'):
            if x.strip() in ('Parametry', 'Barva vína'): break
            if x.strip(): food.append(x.strip())
        vals['food'] = food
    # listing pages (filters like "Cukr / sladkost", "Ročník 2023 2") produce junk: keep only plausible values
    for f in ('sugar', 'acid', 'alcohol', 'extract'):
        if f in vals and not re.match(r'\d', vals[f]): del vals[f]
    if 'vintage' in vals and not re.fullmatch(r'(19|20)\d\d', vals['vintage']): del vals['vintage']
    return vals


TECH = re.compile(r'(macerac|kvasil|kvašen|zrál|zrání|sud|barrique|qvevri|amfor|nefiltr|sur lie|sur-lie|kvasnic|ruční sběr|ručně sbír|spontánn)', re.I)


def winemaking_paragraphs(h):
    """Paragraphs about how the wine was made (no aroma words): kept separately, never mapped to aroma groups."""
    h = re.sub(r'<script.*?</script>|<style.*?</style>|<nav.*?</nav>|<footer.*?</footer>|<header.*?</header>', '', h, flags=re.S | re.I)
    out = []
    for b in re.split(r'</p>|</li>|</div>|</td>|</h\d>', h):
        t = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', b))).strip()
        if 60 <= len(t) <= 1200 and len(set(m.lower()[:5] for m in TECH.findall(t))) >= 2 and t not in out and 'cookies' not in t.lower() \
                and not t.endswith(('...', '…')):
            out.append(t)
    return [t for t in out if not any(t != u and t in u for u in out)][:2]


def shoptet_notes(h):
    """Shoptet shops (Vinotrh, Vínovín): only the product's own short + basic description.
    Product cards of *other* wines on the same page ("p-desc" in related lists) are deliberately ignored."""
    parts = []
    m = re.search(r'<div class="p-short-description"[^>]*>(.*?)</div>', h, re.S)
    if m: parts.append(text_of(m.group(1)))
    m = re.search(r'<div class="basic-description">(.*?)(?:<div class="extended-description"|<h3|id="productDiscussion"|</div>\s*</div>\s*</div>)', h, re.S)
    if m: parts += [p for p in text_of(m.group(1)).split('\n')]
    out = []
    for p in parts:
        p = p.strip()
        if len(p) >= 40 and not p.endswith(('...', '…')) and p not in out and not any(p in o for o in out):
            out.append(p)
    return out


SITE_Q = [('voc', r'\bvoc\b'), ('kabinet', r'kabinet'), ('pozdni-sber', r'pozdní sběr|pozdni-sber'), ('vyber-z-hroznu', r'výběr z hroznů'),
          ('zemske', r'zemsk')]


def quality_of(text):
    t = text.lower()
    return {q for q, rx in SITE_Q if re.search(rx, t)}


def url_quality(u):
    m = re.search(r'--(voc|kabinet|kabinetni-vino|pozdni-sber|vyber-z-hroznu|zemske|jakostni)--', u)
    return {'kabinet' if m.group(1).startswith('kabinet') else m.group(1)} if m else set()


# ---------------- aroma groups from the Salon vín methodology (catalogue p. 23–24) ----------------
GROUPS = [
    ('květnaté', r'květ|kvet|lip(ov|a\b|y\b)|akát|bezov|růž|ruz(e|ov)|pivoň|fialk|šeřík|jasmín|luční'),
    ('tropické ovoce', r'liči|maracuj|mučenk|meloun|mang|banán|ananas|papáj|kiwi|tropick|exotick'),
    ('citrusové ovoce', r'limet|grep|pomeranč|mandarink|citron(?!ov[áé] tráv)|citrus|pomel|bergamot'),
    ('jádrové ovoce', r'jabl|kdoul|hrušk|hrušek|hruška'),
    ('peckové ovoce', r'broskv|meruň|ryngl|mirabel|nektarin|švestk|třešn|višn|pecko'),
    ('drobné ovoce', r'angrešt|rybíz|moruš|jost|malin|jahod|ostruž|borůvk|brusin|aroni|bezink|lesní ovoce|drobn[éého]+ ovoc'),
    ('sušené a vařené ovoce', r'rozink|hrozink|kompot|sušen|datl|fík|džem|marmelád|povidl|kandovan|cibéb|botryt'),
    ('karamelizované', r'\bmed\b|\bmedu\b|medov|medem|oříš|ořech|mandl|karamel|chlebov|čokolád|kakao|perník|nugát|brioš'),
    ('bylinné', r'tráv|bylin|kopřiv|list(?:y|ů)? (?:černého )?rybíz|černorybízov[ýé] list|mát[ay]|seno|sena\b|čaj|heřmán|hluchavk|zelen[áé] papri|travnat'),
    ('kořenité', r'pepř|kořen(?!í ?\w*vin)|kořeni|zázvor|skořic|hřebíč|lékořic|anýz|kmín|muškátov[ýé] oříšek'),
    ('dřevo / barrique', r'dřev|dub(?:ov|u\b)|barik|barrique|vanil|kouř|toast|káv[ay]|kávov|kokos|cedr|tabák|pálen'),
    ('autolyzátové / mléčne', r'másl|brioš|kvasnic|droždí|smetan|krémov|na kalech|batonáž'),
    ('mineralne', r'minerál|minerali|slan|petrolej|křemen|kamen|kámen|vosk|pazourek|granit|železit'),
    ('zwierzęce / ziemiste', r'kůže|zvěřin|zemit|houb|lesní půd'),
]
GROUPS = [(g, re.compile(p, re.I)) for g, p in GROUPS]
WORD = re.compile(r'[A-Za-zÁ-žá-ž]+')


FOOD = re.compile(r'(hodí|vhodné|doporučujeme|podávejte|podávat|snoubit|kombinovat|ideální volba|ideální k|k pokrm|ke zvěřin|'
                  r'k sýr|k ryb|k mas|teplot)', re.I)


def aroma_groups(text):
    # aroma words only from sentences describing the wine, not from food-pairing / serving sentences
    text = ' '.join(x for x in re.split(r'(?<=[.!?])\s+', text) if not FOOD.search(x))
    found = {}
    for g, rx in GROUPS:
        hits = []
        for m in rx.finditer(text):
            # the whole word around the match, e.g. "meruňky", "lipový"
            s = text.rfind(' ', 0, m.start()) + 1
            e = m.end() + (len(WORD.match(text[m.end():]).group(0)) if WORD.match(text[m.end():]) else 0)
            w = text[s:e].strip(' ,.;:()„“"')
            if w and w.lower() not in [h.lower() for h in hits] and 'medail' not in w.lower(): hits.append(w)
        if hits: found[g] = hits
    return found


# ---------------- sources per wine ----------------
eno = json.loads(get('https://enoteka.vinotrh.cz/output/wines.json') or '[]')
PSLUG = {'hnanice': 'hnanice', 'znovin': 'znovin', 'pialek': 'pialek', 'spalek': 'spal', 'thaya': 'thaya', 'waldberg': 'waldberg',
         'oulehla': 'oulehla', 'lahofer': 'lahofer', 'halkoci': 'halkoci', 'korinek': 'korinek', 'simenon': 'simenon', 'ampelos': 'ampelos',
         'dobravinice': 'dobra', 'davinus': 'davinus', 'gotberg': 'gotberg', 'cervinka': 'cervinka', 'valtice': 'valtice',
         'vinohort': 'hort', 'hanzel': 'hanzel', 'placek': 'placek', 'kubik': 'kubik', 'stepanek': 'stepanek', 'skrobak': 'skrobak',
         'bv': 'bvvinar', 'zapletal': 'zapletal'}
for _p, _v in site['producers'].items():      # new producers on the site: fall back to the last word of the name
    PSLUG.setdefault(_p, key(_v['name'].split()[-1]))
STOP = {'voc', 'bio', 'znojmo', 'vino', 'suche', 'pozdni', 'sber'}


def name_tokens(s):
    return {t for t in re.findall(r'[a-z0-9]{3,}', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower())} - STOP


def enoteka_matches(wid, w):
    ps = PSLUG[w['p']]
    cands = [e for e in eno if ps in key(e['vyrobce']) and e['rocnik'] == w['year']]
    wt = name_tokens(w['name'])
    best = [e for e in cands if len(wt & name_tokens(e['nazev'])) >= max(1, min(2, len(wt)))]
    # a colour mutation is another variety: "Sauvignon šedý" is not "Sauvignon"
    return [e for e in best if not ((name_tokens(e['nazev']) & MUTATION) - wt)]


MUTATION = {'sedy', 'seda', 'cerveny', 'cervene', 'modry', 'modre', 'bily', 'bile'}
BOILERPLATE = ('VOC Znojmo – víno originální certifikace', 'Na Šobesu dějí se věci')


def vinotrh_by_code(code):
    h = get('https://www.vinotrh.cz/vyhledavani/?string=' + urllib.parse.quote(code))
    m = re.search(r'<a href="((?:https://www\.vinotrh\.cz)?/[^"?#]+/)" class="name"', h)
    if m: return urllib.parse.urljoin('https://www.vinotrh.cz/', m.group(1))
    # Shoptet redirects straight to the product when the code is unique
    if code in h and 'p-detail' in h:
        m = re.search(r'<link rel="canonical" href="([^"]+)"', h)
        return m.group(1) if m else None
    return None


VARIETY_SLUG = [('ryzlink rynsky', 'ryzlink-rynsky'), ('ryzlink vlassky', 'ryzlink-vlassky'), ('veltlinske zelene', 'veltlinske-zelene'),
                ('veltlinske cervene', 'veltlinske-cervene'), ('sauvignon', 'sauvignon'), ('chardonnay', 'chardonnay'),
                ('frankovka', 'frankovka'), ('merlot', 'merlot'), ('rulandske modre', 'rulandske-modre'), ('zweigeltrebe', 'zweigeltrebe'),
                ('hibernal', 'hibernal'), ('muskat', 'muskat'), ('neuburske', 'neuburske'), ('rotgipfler', 'rotgipfler'),
                ('veritas', 'veritas'), ('palava', 'palava'), ('gryllus', 'gryllus'), ('trio', 'trio'), ('kambrium', 'kambrium'),
                ('pet nat', 'pet-nat'), ('cuvee', 'cuvee')]


def vinovin_matches(w):
    nm = unicodedata.normalize('NFKD', w['name']).encode('ascii', 'ignore').decode().lower()
    vs = next((s for v, s in VARIETY_SLUG if v in nm), None)
    if not vs: return []
    q = f"{site['producers'][w['p']]['name'].split()[-1]} {vs.replace('-', ' ')}"
    h = get('https://www.vinovin.cz/vyhledavani/?string=' + urllib.parse.quote(q))
    links = sorted({urllib.parse.urljoin('https://www.vinovin.cz/', u)
                    for u in re.findall(r'href="((?:https://www\.vinovin\.cz)?/[^"?#]+/)"', h)})
    ps = PSLUG[w['p']]
    cands = [u for u in links if vs in u and str(w['year']) in u and ps in u.replace('-', '')]
    sq = quality_of(' '.join(str(w.get(k, '')) for k in ('name', 'style', 'origin', 'award')))
    keep = []
    for u in cands:
        uq = url_quality(u)
        if sq and uq and not (sq & uq):
            continue          # e.g. site wine is VOC, this product is a kabinet of the same variety -> different wine
        keep.append(u)
    return keep if (sq or len(keep) == 1) else []


result = {}
for wid, w in site['wines'].items():
    print(wid, file=sys.stderr)
    srcs = []
    for l in w.get('links', []):
        u = l['url']
        if u.endswith('.pdf') or 'narodnisoutezvin' in u or u.rstrip('/') in ('https://enoteka.vinotrh.cz', 'https://www.vinotrh.cz/waldberg', 'https://www.vinotrh.cz/ampelos-2'):
            continue
        srcs.append(('strona: ' + l['label'], u))
    for e in enoteka_matches(wid, w):
        u = vinotrh_by_code(e['kod'])
        if u: srcs.append((f'Vinotrh (Enotéka #{e["pozice"]}, kod {e["kod"]})', u))
    for u in vinovin_matches(w):
        srcs.append(('Vínovín', u))
    seen, entries = set(), []
    for label, u in srcs:
        if u in seen: continue
        seen.add(u)
        h = get(u)
        if not h: continue
        t_all = text_of(h)
        if 'vinotrh.cz' in u or 'vinovin.cz' in u:
            notes = [p for p in shoptet_notes(h) if TASTE.search(p)][:4]
        else:
            notes = [p for p in tasting_paragraphs(h) if not p.endswith(('...', '…')) and not p.startswith(BOILERPLATE)][:4]
        vals = labelled_values(t_all)
        e = {'source': label, 'url': u, 'notes': notes, 'values': vals}
        mt = re.search(r'<title[^>]*>(.*?)</title>', h, re.S)
        e['_title_years'] = set(re.findall(r'(?<!\d)(20[0-2]\d)(?!\d)', html.unescape(mt.group(1)))) if mt else set()
        if 'odhadem na základě analytiky' in h:
            # Vínovín: "Popis vína je odhadem na základě analytiky, polohy a charakteristiky stejného vína minulých ročníků"
            e['estimated'] = True
        if 'vinovin.cz' not in u and 'vinotrh.cz' not in u:      # shops: generic texts about the appellation, skip
            tech = [p for p in winemaking_paragraphs(h) if p not in notes and not any(p in n for n in notes)]
            if tech: e['winemaking'] = tech
        entries.append(e)
    # Vineyard check for shop pages: a shop may sell several wines of the same producer, variety and vintage
    # (e.g. Znovín Ryzlink VOC 2025 from Dívčí vrch vs. the Šobes one on our site).
    ref = key(w['name'] + ' ' + w.get('origin', ''))

    def vy_ok(v):
        return all(t[:5] in ref for t in re.findall(r'[a-z0-9]+', unicodedata.normalize('NFKD', v).encode('ascii', 'ignore').decode().lower()))

    shop = lambda e: 'vinovin.cz' in e['url'] or 'vinotrh.cz' in e['url']
    ref_has_vy = any(vy_ok(e['values']['vineyard']) for e in entries if e['values'].get('vineyard'))
    eno_vy = {key(e['values']['vineyard']) for e in entries if e['source'].startswith('Vinotrh (Enotéka') and e['values'].get('vineyard')}
    rejected = []
    for e in entries:
        yrs = e.pop('_title_years')       # page title, not URL: shops keep old slugs (Špalek "...-2024" shows the 2025 wine)
        if (yrs and str(w['year']) not in yrs) or (e['values'].get('vintage') and e['values']['vintage'] != str(w['year'])):
            # e.g. our link for Gotberg Pálava 2024 points to the 2025 product page
            rejected.append({'source': e['source'], 'url': e['url'], 'reason': f'inny rocznik ({", ".join(sorted(yrs)) or e["values"]["vintage"]}) niż wino na stronie ({w["year"]})'})
            continue
        v = e['values'].get('vineyard')
        if not (shop(e) and v): continue
        why = None
        if ref_has_vy and not vy_ok(v):
            why = f'inna trasa ({v}) niż wino na stronie'
        elif not ref_has_vy and e['source'] == 'Vínovín' and eno_vy and key(v) not in eno_vy:
            why = f'inna trasa ({v}) niż wino z Enotéki'
        if why: rejected.append({'source': e['source'], 'url': e['url'], 'reason': why})
    entries = [e for e in entries if e['url'] not in {r['url'] for r in rejected}]
    result[wid] = {
        'producer': site['producers'][w['p']]['name'], 'wine': w['name'], 'year': w['year'],
        'has_salon_profile': wid in site['aroma'],
        'sources': [e for e in entries if e['notes'] or e['values'] or e.get('winemaking')],
    }
    if rejected: result[wid]['rejected_sources'] = rejected


def sentences(n):
    return [x.strip() for x in re.split(r'(?<=[.!?])\s+', n) if x.strip()]


# Shop templates: the same sentence used for wines of different producers (Vinotrh writes one text per variety + VOC,
# e.g. "Aromatické víno s výrazným projevem angreštu, rybízu, broskví a černého bezu." for Piálek and Znovín).
# Such sentences say nothing about the particular wine: kept in notes, listed in generic_sentences, not mapped to groups.
owners = {}
for r in result.values():
    for s in r['sources']:
        for n in s['notes']:
            for x in sentences(n):
                if len(x) > 40: owners.setdefault(x, set()).add(r['producer'])
GENERIC = {x for x, p in owners.items() if len(p) > 1}
VOC_TEMPLATE = re.compile(r'^\s*(suché|polosuché) bílé víno [^.]*?\b20\d\d, VOC z vinařství', re.I)

for wid, r in result.items():
    ver, est = [], []
    for s in r['sources']:
        sn = [x for n in s['notes'] for x in sentences(n)]
        # Vinotrh's VOC card: "Suché bílé víno odrůdy Sauvignon, 2025, VOC z vinařství X." + a sentence typical of the variety
        tmpl = {x for n in s['notes'] if 'vinotrh.cz' in s['url'] and VOC_TEMPLATE.match(n) for x in sentences(n)}
        gen = sorted({x for x in sn if x in GENERIC or x in tmpl})
        GENERIC.update(tmpl)
        if gen: s['generic_sentences'] = gen
        (est if s.get('estimated') else ver).append(' '.join(x for x in sn if x not in GENERIC))
    r['aroma_groups_from_text'] = aroma_groups(' '.join(ver))
    if any(est):
        only_est = {k: v for k, v in aroma_groups(' '.join(est)).items() if k not in r['aroma_groups_from_text']}
        if only_est: r['aroma_groups_estimated_only'] = only_est     # groups named only in the shop's estimate

# Other vintage of the same wine, only for wines with no usable description of their own vintage.
# Same producer, same line and category; picked by hand after checking the pages. Kept apart from the wine's own data.
OTHER_VINTAGE = {
    'oulehla-fr-2023': {'from_wine': 'oulehla-fr-2022', 'why': 'ta sama Frankovka z trasy Na Nivách (Dolní Kounice), rocznik 2022 jest na naszej stronie'},
    'simenon-sb-2025': {'url': 'https://www.vinotrh.cz/sauvignon-voc-112/', 'vintage': 2024, 'source': 'Vinotrh',
                        'why': 'Sauvignon VOC Znojmo Simenonu z poprzedniego rocznika; strona sklepu nie podaje trasy'},
}
# Checked and NOT used: Ampelos Veritas 2023 in Enotéka is a sweet výběr z bobulí, our Veritas 2024 is a dry pozdní sběr.
for wid, o in OTHER_VINTAGE.items():
    if wid not in result or result[wid]['aroma_groups_from_text']: continue
    if 'from_wine' in o:
        src = result[o['from_wine']]
        notes = [n for s in src['sources'] if not s.get('estimated') for n in s['notes']]
        url = next(s['url'] for s in src['sources'] if s['notes'])
        vintage, source = src['year'], 'strona producenta'
    else:
        notes = [p for p in shoptet_notes(get(o['url'])) if TASTE.search(p)][:4]
        url, vintage, source = o['url'], o['vintage'], o['source']
    if notes:
        result[wid]['other_vintage'] = {'vintage': vintage, 'source': source, 'url': url, 'why': o['why'], 'notes': notes,
                                        'aroma_groups': aroma_groups(' '.join(x for n in notes for x in sentences(n) if x not in GENERIC))}

OUT.joinpath('opisy-win.json').write_text(json.dumps({
    'generated': time.strftime('%Y-%m-%d'),
    'method': 'notes = opisy degustacyjne ze źródeł (po czesku, bez zmian); aroma_groups_from_text = słowa z tych opisów '
              'przypisane do grup aromatów z metodyki Salonu vín (obecność, nie natężenie); values = parametry podane przez źródło; winemaking = akapity o produkcji (nie trafiają do grup aromatów); estimated = opis sklepu Vínovín, który sam podaje, że jest odhadem (szacunkiem z analityki, położenia i poprzednich roczników), nie degustacją: nie trafia do aroma_groups_from_text, grupy występujące tylko tam '
              'są w aroma_groups_estimated_only; generic_sentences = zdania-szablony sklepu użyte dla win różnych producentów '
              '(nie trafiają do grup); rejected_sources = strony odrzucone, bo opisują inne wino (inna trasa lub rocznik); '
              'other_vintage = opis tego samego wina z innego rocznika, tylko gdy brak opisu własnego rocznika (orientacyjnie)',
    'wines': result}, ensure_ascii=False, indent=1), encoding='utf-8')
n_notes = sum(1 for r in result.values() if any(s['notes'] for s in r['sources']))
print(f'wines {len(result)}, with tasting notes {n_notes}, without Salon profile but with notes '
      f'{sum(1 for r in result.values() if not r["has_salon_profile"] and any(s["notes"] for s in r["sources"]))}')
