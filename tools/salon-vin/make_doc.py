"""Build docs/Salon-vin-2024-2026-wina-ze-strony.md from docs/salon-vin/*.json and the site wine registry."""
import json, re, sys, unicodedata
from pathlib import Path

data_dir, site_json, out_md = Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3])
YEARS = [2026, 2025, 2024]
D = {y: json.loads((data_dir / f'salon-vin-{y}.json').read_text(encoding='utf-8')) for y in YEARS if (data_dir / f'salon-vin-{y}.json').exists()}
site = json.loads(site_json.read_text(encoding='utf-8'))


def key(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '', s)


PMAP = {
    'hnanice': ['vinicehnanice'], 'znovin': ['znovin'], 'pialek': ['pialek'], 'spalek': ['spalkovy', 'spalek'],
    'thaya': ['thaya'], 'waldberg': ['waldberg'], 'oulehla': ['oulehla'], 'lahofer': ['lahofer'], 'halkoci': ['halkoci'],
    'korinek': ['korinek'], 'simenon': ['simenon'], 'ampelos': ['ampelos'], 'dobravinice': ['dobravinice'],
    'davinus': ['davinus'], 'gotberg': ['gotberg'], 'cervinka': ['cervinka'], 'valtice': ['chateauvaltice'],
    'vinohort': ['vinohort'], 'hanzel': ['hanzel'],
}
VARIETY = [('ryzlinkrynsky', ['ryzlinkrynsky', 'riesling', 'rr']), ('ryzlinkvlassky', ['ryzlinkvlassky', 'welsch']),
           ('veltlinskecervene', ['veltlinskecervene', 'fruhroter']), ('veltlinskezelene', ['veltlinskezelene', 'veltlin']),
           ('sauvignon', ['sauvignon']), ('chardonnay', ['chardonnay']), ('frankovka', ['frankovka']),
           ('palava', ['palava', 'supa']), ('merlot', ['merlot']), ('rulandskemodre', ['rulandskemodre', 'pinotnoir']),
           ('zweigeltrebe', ['zweigelt']), ('hibernal', ['hibernal']), ('muskat', ['muskat']), ('neuburske', ['neubur']),
           ('rotgipfler', ['rotgipfler']), ('veritas', ['veritas'])]


def variety(name):
    words = [key(x) for x in re.split(r'[\s,/()-]+', str(name or '')) if x]
    k = key(name)
    for v, pats in VARIETY:
        for p in pats:
            if k.startswith(p) or (len(p) >= 6 and p in k) or p in words:
                return v
    return k[:10]


def is_rose(name):
    return 'rose' in key(name) or 'klaret' in key(name)


def prod_of(row):
    k = key(row.get('producer'))
    return [pid for pid, pats in PMAP.items() if any(p in k for p in pats)]


def batch_of(w):
    m = re.search(r'partia ([^\s·]+)', w.get('origin', ''))
    return m.group(1) if m else None


def fmt(v, unit=''):
    if v is None: return '–'
    if isinstance(v, float):
        v = ('%.1f' % v).replace('.', ',') if v != int(v) else str(int(v))
    return f'{v}{unit}'


def nvc_link(y, r):
    return r.get('url') or (D[y]['sources']['catalogue_pdf'])


rows_by_pid = {pid: [] for pid in PMAP}
for y, d in D.items():
    for medal in ('gold', 'silver'):
        for r in d[medal]:
            for pid in prod_of(r):
                rows_by_pid[pid].append((y, medal, r))

L = []
A = L.append
A('# Salon vín ČR 2024–2026: wina i winiarnie z naszej strony')
A('')
A('*Zestawienie z katalogów Salon vín – Národní soutěž vín ČR (Národní vinařské centrum, Valtice). Stan danych: 9 listopada 2026.*')
A('')
A('## Skąd są dane')
A('')
A('Salon vín to finał krajowego konkursu win. Co roku 100 win dostaje złoty medal i trafia do stałej ekspozycji w piwnicach zamku w Valticach, a kilkaset kolejnych dostaje srebrny medal. Do zestawienia użyłem trzech rodzajów źródeł dla każdego roku:')
A('')
A('- **Arkusz medali (XLSX)** – wszystkie złote i srebrne wina z **punktacją** (skala 100 pkt O.I.V.), cukrem, kwasami i alkoholem.')
A('- **Katalog PDF** – pełna karta każdego złotego wina (parcela, data zbioru, cukier moszczu, wielkość partii, ekstrakt, okno picia, opis sensoryczny i inne nagrody) oraz profile producentów.')
A('- **Strona „Vína v Salonu” 2026 i mapa interaktywna** – link do karty wina, e-sklepu, zdjęcia butelki, wykresu aromatów i współrzędne GPS parceli.')
A('')
for y, d in D.items():
    s = d['sources']
    A(f'- {y}: [katalog PDF]({s["catalogue_pdf"]}) · [medale XLSX]({s["medals_xlsx"]})' + (f' · [wina na stronie]({s["wines_web"]}) · [mapa]({s["map_web"]})' if 'wines_web' in s else '')
      + f' — {d["counts"]["gold"]} złotych, {d["counts"]["silver"]} srebrnych, {d["counts"]["producers"]} profili producentów')
A('')
A('Pełne dane (wszystkie wina, nie tylko nasze) są w [docs/salon-vin/](salon-vin/README.md) jako JSON. Opisy win cytuję w oryginale po czesku, tak jak w katalogu.')
A('')

# ---------- 1. exact matches ----------
A('## 1. Wina ze strony, które mają kartę w Salonie')
A('')
A('Dopasowanie: ten sam producent, odmiana i rocznik, a gdy na stronie podana jest partia – także numer partii.')
A('')
matched_any = False
unmatched = []
near = []
for wid, w in site['wines'].items():
    hits = []
    b = batch_of(w)
    for y, medal, r in rows_by_pid.get(w['p'], []):
        if r.get('vintage') != w.get('year'): continue
        if variety(r.get('wine')) != variety(w['name']): continue
        if is_rose(r.get('wine')) != is_rose(w['name']): continue
        rb = str(r.get('batch') or '').replace(' ', '')
        nb = lambda s: re.sub(r'(^|/)0+(\d)', r'', s.upper())
        exact = bool(b and rb and nb(b) == nb(rb))
        hits.append((exact, y, medal, r))
    exacts = [h for h in hits if h[0]]
    if b and not exacts:
        if hits: near.append((wid, w, hits))
        else: unmatched.append(wid)
        continue
    if not hits:
        unmatched.append(wid); continue
    use = exacts or hits
    matched_any = True
    pname = site['producers'][w['p']]['name']
    A(f'### {pname} · {w["name"]} {w["year"]}  `{wid}`')
    A('')
    if not b:
        A('> Na stronie nie ma numeru partii – dopasowanie po producencie, odmianie i roczniku.')
        A('')
    for exact, y, medal, r in use:
        med = 'Złoty medal' if medal == 'gold' else 'Srebrny medal'
        head = f'**Salon vín {y}: {med}'
        if r.get('nr'): head += f', nr ev. {r["nr"]}'
        head += f' · {fmt(r.get("points"))} pkt**'
        A(head)
        A('')
        A(f'- Wino w katalogu: {r.get("wine_label") or r.get("wine")} · {r.get("quality_full") or r.get("quality")} · partia {r.get("batch", "–")}'
          + (f' (w XLSX: {r["batch_xlsx"]})' if r.get('batch_xlsx') else ''))
        loc = ', '.join(x for x in (r.get('village'), r.get('vineyard')) if x)
        if loc: A(f'- Parcela: {loc} · podobszar {r.get("subregion", "–")}')
        params = [f'cukier {fmt(r.get("sugar_gl"))} g/l', f'kwasy {fmt(r.get("acid_gl"))} g/l', f'alkohol {fmt(r.get("alcohol_pct"))} %']
        if r.get('extract_gl') is not None: params.append(f'ekstrakt bezcukrowy {fmt(r.get("extract_gl"))} g/l')
        if r.get('must_nm') is not None: params.append(f'moszcz {fmt(r.get("must_nm"))} °NM')
        A('- Parametry: ' + ', '.join(params))
        if r.get('xlsx_diff'):
            lab = {'sugar_gl': 'cukier', 'acid_gl': 'kwasy', 'alcohol_pct': 'alkohol', 'batch': 'partia'}
            A('- Arkusz konkursowy podaje inaczej: ' + ', '.join(f'{lab[k]} {fmt(v)}' for k, v in r['xlsx_diff'].items()))
        if r.get('other_years'):
            A('- To samo wino w innych latach: ' + ', '.join(f'{o["salon_year"]} {"złoto" if o["medal"] == "zlatá" else "srebro"} {fmt(o.get("points"))} pkt' for o in r['other_years']))
        if r.get('notes'):
            A('- Uwagi do danych: ' + '; '.join(r['notes']))
        extra = []
        if r.get('harvest_date'): extra.append(f'zbiór {r["harvest_date"]}')
        if r.get('bottles'): extra.append(f'{r["bottles"]:,} butelek w partii'.replace(',', ' '))
        if r.get('drink_window'): extra.append(f'okno picia {r["drink_window"]}')
        if extra: A('- ' + ', '.join(extra))
        if r.get('description'): A(f'- Opis (CZ): „{r["description"]}”')
        if r.get('awards'): A(f'- Nagrody (CZ): {r["awards"]}')
        links = []
        if r.get('url'): links.append(f'[karta w Salonie]({r["url"]})')
        if r.get('eshop_url'): links.append(f'[e-sklep NVC]({r["eshop_url"]})')
        if r.get('aroma_chart_img'): links.append(f'[wykres aromatów]({r["aroma_chart_img"]})')
        if r.get('bottle_img'): links.append(f'[zdjęcie butelki]({r["bottle_img"]})')
        if r.get('lat'): links.append(f'[parcela na mapie](https://mapy.com/?q={r["lat"]},{r["lon"]})')
        if not r.get('url'): links.append(f'[katalog {y}]({D[y]["sources"]["catalogue_pdf"]})')
        A('- ' + ' · '.join(links))
        A('')
if near:
    A('### Ta sama odmiana i rocznik, ale inna partia')
    A('')
    A('Te wina ze strony mają w Salonie „rodzeństwo” – to samo wino z innej partii lub inną linię producenta. To nie jest ta sama butelka.')
    A('')
    for wid, w, hits in near:
        pname = site['producers'][w['p']]['name']
        items = '; '.join(f'{y} {"złoto" if m == "gold" else "srebro"} {fmt(r.get("points"))} pkt – {r.get("wine")}, {r.get("quality")}, partia {r.get("batch", "–")}' for _, y, m, r in hits)
        A(f'- **{pname} · {w["name"]} {w["year"]}** (na stronie partia {batch_of(w)}): {items}')
    A('')
if unmatched:
    A('Win ze strony bez karty w Salonie 2024–2026: ' + ', '.join(f'`{u}`' for u in unmatched) + '. Ich producentów mogą dotyczyć inne medale – patrz sekcja 2.')
    A('')

# ---------- 2. per producer ----------
A('## 2. Producenci ze strony w Salonie 2024–2026')
A('')
A('Wszystkie medale Salonu dla winiarni, które mamy na stronie. Złote wina mają pełną kartę w katalogu, srebrne tylko wpis w arkuszu. Sortowanie: rok Salonu, potem punkty.')
A('')
for pid, p in site['producers'].items():
    rows = sorted(rows_by_pid.get(pid, []), key=lambda t: (-t[0], t[1] != 'gold', -(t[2].get('points') or 0)))
    A(f'### {p["name"]} ({p["place"]})')
    A('')
    if not rows:
        A('Brak medali w Salonie 2024–2026 (w arkuszach złotych i srebrnych nie ma tej winiarni).')
        A('')
        continue
    A('| Salon | Medal | Pkt | Wino | Rocznik | Jakość | Partia | Cukier g/l | Kwasy g/l | Parcela |')
    A('|---|---|---|---|---|---|---|---|---|---|')
    for y, medal, r in rows:
        name = r.get('wine') or ''
        if r.get('url'): name = f'[{name}]({r["url"]})'
        par = ', '.join(x for x in (r.get('village'), r.get('vineyard')) if x)
        A(f'| {y} | {"złoty" + (" #" + str(r["nr"]) if r.get("nr") else "") if medal == "gold" else "srebrny"} | {fmt(r.get("points"))} | {name} | {r.get("vintage", "")} | {r.get("quality", "")} | {r.get("batch", "")} | {fmt(r.get("sugar_gl"))} | {fmt(r.get("acid_gl"))} | {par} |')
    A('')
    # profile from newest catalogue
    for y in YEARS:
        prof = next((x for x in D.get(y, {}).get('producers', []) if any(pt in key(x['name']) for pt in PMAP[pid])), None)
        if prof:
            bits = [prof.get('address')]
            if prof.get('cellar_master'): bits.append(f'sklepmistr {prof["cellar_master"]}')
            if prof.get('vineyard_area'): bits.append(f'winnice {prof["vineyard_area"]}')
            if prof.get('annual_production'): bits.append(f'produkcja {prof["annual_production"]}')
            A(f'Profil z katalogu {y}: ' + ' · '.join(b for b in bits if b) + (f' · [{prof["web"]}](https://{prof["web"].removeprefix("https://").removeprefix("http://")})' if prof.get('web') else ''))
            A('')
            if prof.get('description'): A(f'> {prof["description"]}')
            A('')
            break

# ---------- 3. Znojemsko gold ----------
A('## 3. Złote wina Znojemska w Salonie 2026 i 2025')
A('')
A('Przydatne na wyjazd: wszystkie złote medale z podobszaru znojemskiego. Pogrubione winiarnie są na naszej stronie.')
A('')
for y in (2026, 2025):
    if y not in D: continue
    rows = [r for r in D[y]['gold'] if 'znojem' in key(r.get('subregion'))]
    rows.sort(key=lambda r: -(r.get('points') or 0))
    A(f'### Salon {y} – {len(rows)} win')
    A('')
    A('| Nr | Pkt | Wino | Rocznik | Jakość | Producent | Parcela | Cukier g/l |')
    A('|---|---|---|---|---|---|---|---|')
    for r in rows:
        pr = r.get('producer', '')
        if prod_of(r): pr = f'**{pr}**'
        name = r.get('wine_label') or r.get('wine')
        if r.get('url'): name = f'[{name}]({r["url"]})'
        par = ', '.join(x for x in (r.get('village'), r.get('vineyard')) if x)
        A(f'| {r.get("nr")} | {fmt(r.get("points"))} | {name} | {r.get("vintage")} | {r.get("quality_full") or r.get("quality")} | {pr} | {par} | {fmt(r.get("sugar_gl"))} |')
    A('')

# ---------- 4. from the photos ----------
A('## 4. Tropy z papierowych katalogów (zdjęcia)')
A('')
A('### Salon vín 2023, nr 88: Ing. Ladislav Musil · Frankovka 2019')
A('')
A('Karta przepisana ze zdjęcia katalogu Salon vín 2023 (na serwerze NVC nie ma już PDF ani arkusza za 2023).')
A('')
A('- Frankovka (Blaufränkisch) 2019, pozdní sběr, suché · Morava / Znojemská')
A('- Parcela: Dolní Kounice, Karlov · zbiór 14. 10. 2019 · wydajność 7 t/ha · moszcz 22 °NM')
A('- Partia 7 · 2000 butelek · cukier 0,7 g/l, kwasy 6,6 g/l, alkohol 12,5 %, ekstrakt bezcukrowy 29,4 g/l · okno picia 2023–2026')
A('- Opis (CZ): „Naše nejcennější vinařská trať, Karlov, má vysoký podíl granodioritu v půdě a dává vínům mineralitu a hlavně „kouřovinu“ nebo „připáleninu“, kterou nikde jinde nenajdete. Barva této Frankovky je sytě rubínová, ve vůni i chuti cítíme lesní ovoce a černou třešeň i jemný pepř a hlavně onu zmíněnou mineralitu.”')
A('- Nagrody (CZ): Stříbrná medaile Národní soutěž vín – Znojemská podoblast 2022, Zlatá medaile Salon vín 2023')
A('')
musil = [(y, m, r) for y, d in D.items() for m in ('gold', 'silver') for r in d[m] if 'musil' in key(r.get('producer'))]
if musil:
    A('Musil w kolejnych latach Salonu:')
    A('')
    for y, m, r in sorted(musil, key=lambda t: -t[0]):
        A(f'- {y}: {"złoty" if m == "gold" else "srebrny"} medal, {r.get("wine")} {r.get("vintage")}, {r.get("quality")}, partia {r.get("batch", "–")}, {fmt(r.get("points"))} pkt')
    A('')
A('Dlaczego to ważne dla nas: Karlov w Dolních Kounicach to ta sama parcela, z której pochodzi **Oulehla Chardonnay Karlov Staré keře 2023** z naszej strony (wielkie złoto regionalne 2026). Granodioryt i „dymna” mineralność to dobry trop do opisu win z Karlova. Dolní Kounice formalnie należą do podobszaru znojemskiego, choć leżą daleko na północ od Znojma.')
A('')
A('### Broszura „Land of wine 2021–2022”: VOC Znojmo')
A('')
A('Ze zdjęcia mapy apelacji VOC: VOC Znojmo to pierwszy system apelacji w Czechach, obejmujący trzy najbardziej typowe odmiany Znojemska – Sauvignon, Ryzlink rýnský i Veltlínské zelené – lub ich kupaż. Wina muszą mieć regionalnie typowy profil smakowy i pochodzić z wybranych i uznanych winnic. Wina VOC Znojmo są co roku prezentowane 8 maja na Festiwalu Wina VOC Znojmo i do kupienia w Centrum Informacyjnym VOC w wieży Vlkova věž w Znojmie.')
A('')

out_md.write_text('\n'.join(L) + '\n', encoding='utf-8')
print('written', out_md, len(L), 'lines; unmatched', len(unmatched))
