"""Scrape Salon vín 2026 wine detail pages + producer pages + map coordinates into JSON."""
import html, json, re, sys, time, urllib.request
from pathlib import Path

BASE = 'https://www.vinarskecentrum.cz'
OUT = Path(sys.argv[1])
CACHE = Path(sys.argv[2]); CACHE.mkdir(parents=True, exist_ok=True)


def get(path):
    f = CACHE / (re.sub(r'[^a-zA-Z0-9]+', '_', path).strip('_') + '.html')
    if f.exists() and f.stat().st_size > 1000:
        return f.read_text(encoding='utf-8')
    for attempt in range(4):
        try:
            req = urllib.request.Request(BASE + path, headers={'User-Agent': 'Mozilla/5.0'})
            data = urllib.request.urlopen(req, timeout=60).read().decode('utf-8', 'replace')
            f.write_text(data, encoding='utf-8')
            time.sleep(0.4)
            return data
        except Exception as e:  # noqa
            print('retry', path, e, file=sys.stderr); time.sleep(3)
    raise RuntimeError(path)


def text(s):
    s = re.sub(r'<br\s*/?>', '\n', s)
    s = html.unescape(re.sub(r'<[^>]+>', ' ', s))
    return re.sub(r'[ \t\r\f\v]+', ' ', re.sub(r'\s*\n\s*', '\n', s)).strip()


KEYS = {
    'ev. číslo': 'nr', 'přívlastek': 'quality', 'vinařská oblast': 'region', 'vinařská podoblast': 'subregion',
    'vinařská obec': 'village', 'viniční trať': 'vineyard', 'zbytkový cukr slovně': 'sweetness',
    'datum sběru': 'harvest_date', 'cukernatost moštu (°NM)': 'must_nm', 'číslo výr. partie': 'batch',
    'počet lahví partie': 'bottles', 'obsah zbytk. cukru (g/l)': 'sugar_gl', 'obsah kyselin (g/l)': 'acid_gl',
    'obsah alkoholu (% obj.)': 'alcohol_pct', 'bezcukerný extrakt (g/l)': 'extract_gl', 'archivace': 'drink_window',
    'charakteristika vína': 'description', 'další info': 'awards', 'výrobce': 'producer',
}


def num(v):
    try:
        return float(v.replace(',', '.').replace(' ', ''))
    except Exception:
        return v


def parse_wine(h, wid):
    m = re.search(r'<h1[^>]*>(.*?)</h1>', h, re.S)
    title = text(m.group(1)) if m else ''
    body = h[m.end():h.find('Předchozí víno') if 'Předchozí víno' in h else h.find('footer')]
    w = {'id': wid, 'url': f'{BASE}/salon-vin/vina-v-salonu/{wid}', 'title': title}
    # label/value pairs: find "label:" followed by value text
    t = text(body)
    lines = [l for l in t.split('\n') if l.strip()]
    i = 0
    while i < len(lines):
        l = lines[i].strip()
        if l.endswith(':') and l[:-1] in KEYS and i + 1 < len(lines):
            v = lines[i + 1].strip()
            if v.endswith(':') and v[:-1] in KEYS:
                v = ''
            else:
                i += 1
            w[KEYS[l[:-1]]] = v
        i += 1
    for k in ('nr', 'bottles'):
        if k in w: w[k] = int(num(w[k])) if isinstance(num(w[k]), float) else w[k]
    for k in ('must_nm', 'sugar_gl', 'acid_gl', 'alcohol_pct', 'extract_gl'):
        if k in w and w[k]: w[k] = num(w[k])
    for href in re.findall(r'href="([^"]+)"', body):
        if '/e-shop/produkt/' in href: w['eshop_url'] = BASE + href
        if '/vinari-v-salonu/' in href: w['producer_url'] = BASE + href
    for src in re.findall(r'src="([^"]+)"', body):
        if '/etikety/' in src: w['bottle_img'] = BASE + src.split('?')[0]
        if '/grafy/' in src: w['aroma_chart_img'] = BASE + src.split('?')[0]
    # title: "<Odrůda> <ročník>, <přívlastek>, <výrobce>"
    tm = re.match(r'(.+?) (\d{4}), ', title)
    if tm:
        w['wine'] = tm.group(1); w['vintage'] = int(tm.group(2))
    return w


def parse_producer(h, url):
    m = re.search(r'<h1[^>]*>(.*?)</h1>', h, re.S)
    end = h.find('Novinky', m.end() if m else 0)
    body = h[m.end():end] if m else ''
    p = {'url': url, 'name': text(m.group(1)) if m else '', 'text': text(body)[:3000]}
    links = [x for x in re.findall(r'href="(https?://[^"]+)"', body) if 'vinarskecentrum' not in x]
    if links: p['links'] = sorted(set(links))
    return p


lst = get('/salon-vin/vina-v-salonu')
ids = sorted(set(re.findall(r'/salon-vin/vina-v-salonu/(26\d{3})', lst)))
wines = [parse_wine(get(f'/salon-vin/vina-v-salonu/{i}'), int(i)) for i in ids]

# map coordinates
mapa = get('/salon-vin/vina-v-salonu/interaktivni-mapa')
for lon, lat, wid in re.findall(r'longitude\d+ = "([\d.]+)";\s*let latitude\d+ = "([\d.]+)";.*?vina-v-salonu/(26\d{3})', mapa, re.S):
    for w in wines:
        if w['id'] == int(wid): w['lat'], w['lon'] = float(lat), float(lon)

producers = {}
for w in wines:
    u = w.get('producer_url')
    if u and u not in producers:
        producers[u] = parse_producer(get(u.replace(BASE, '')), u)

OUT.write_text(json.dumps({'salon_year': 2026, 'source': BASE + '/salon-vin/vina-v-salonu',
                           'wines': wines, 'producers': list(producers.values())}, ensure_ascii=False, indent=1), encoding='utf-8')
print(len(wines), 'wines', len(producers), 'producers')
