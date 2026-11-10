"""
Mapa winiarska Moraw: podoblasti (podregiony), apelacje VOC i winnice złotych win Salonu vín 2026.

  python tools/build-wine-map.py   ->   site/img/wino/mapa-regionow.webp + site/js/wine-map.js

Kolorowe tło podoblasti jest poglądowe: rozmyte koła wokół prawdziwych punktów (winnice złotych win
Salonu 2026 z docs/salon-vin/salon-vin-2026.json oraz gminy winiarskie z listy niżej). Dokładne granice
podoblasti: https://commons.wikimedia.org/wiki/File:Vina%C5%99sk%C3%A1_mapa_-_ji%C5%BEn%C3%AD_Morava.png
Współrzędne gmin z OpenStreetMap (Nominatim), pamięć podręczna docs/trasy-kafelki/geokod.json.
"""
import importlib.util, json, math, os, time, urllib.parse, urllib.request
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
spec = importlib.util.spec_from_file_location('rm', os.path.join(HERE, 'build-route-maps.py'))
rm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rm)  # world_px(), tile()

GEO_CACHE = os.path.join(ROOT, 'docs', 'trasy-kafelki', 'geokod.json')
UA = {'User-Agent': 'HusaTripPage/1.0 (prywatna strona; jednorazowe geokodowanie gmin winiarskich)'}

SUB = {  # kolor podoblasti (RGB) i podpis
    'Znojemská': ((93, 122, 58), 'ZNOJEMSKA'),
    'Mikulovská': ((138, 90, 158), 'MIKULOWSKA'),
    'Velkopavlovická': ((192, 87, 122), 'WIELKOPAWŁOWICKA'),
    'Slovácká': ((205, 150, 40), 'SŁOWACKA'),
}
# gminy winiarskie wg podoblasti (uzupełniają punkty z Salonu, żeby tło pokrywało cały obszar)
VILLAGES = {
    'Znojemská': ['Znojmo', 'Šatov', 'Hnanice', 'Miroslav', 'Hostěradice', 'Jaroslavice', 'Hrádek', 'Božice', 'Dolní Kounice', 'Horní Dunajovice', 'Tasovice', 'Vrbovec'],
    'Mikulovská': ['Mikulov', 'Valtice', 'Pavlov', 'Perná', 'Drnholec', 'Dolní Dunajovice', 'Pasohlávky', 'Sedlec', 'Novosedly', 'Ivaň'],
    'Velkopavlovická': ['Velké Pavlovice', 'Hustopeče', 'Bořetice', 'Kobylí', 'Velké Bílovice', 'Rakvice', 'Šakvice', 'Čejkovice', 'Velké Němčice', 'Rajhrad', 'Němčičky'],
    'Slovácká': ['Mutěnice', 'Bzenec', 'Kyjov', 'Strážnice', 'Uherský Ostroh', 'Blatnice pod Svatým Antonínkem', 'Dolní Bojanovice', 'Polešovice', 'Lanžhot', 'Břeclav', 'Hýsly'],
}
# apelacje VOC na Morawach: (numer, nazwa, gmina dla pinezki, podoblast)
VOC = [
    (1, 'VOC Znojmo', 'Znojmo', 'Znojemská'),
    (2, 'VOC Mikulovsko', 'Mikulov', 'Mikulovská'),
    (3, 'VOC Pálava', 'Pavlov', 'Mikulovská'),
    (4, 'VOC Valtice', 'Valtice', 'Mikulovská'),
    (5, 'VOC Hustopečsko', 'Hustopeče', 'Velkopavlovická'),
    (6, 'VOC Vinice Velké Pavlovice', 'Velké Pavlovice', 'Velkopavlovická'),
    (7, 'VOC Modré Hory', 'Němčičky', 'Velkopavlovická'),
    (8, 'VOC Kraví hora', 'Bořetice', 'Velkopavlovická'),
    (9, 'VOC Růžové hory', 'Rakvice', 'Velkopavlovická'),
    (10, 'VOC Mutěnice', 'Mutěnice', 'Slovácká'),
    (11, 'VOC Bzenec', 'Bzenec', 'Slovácká'),
    (12, 'VOC Kyjov', 'Hýsly', 'Slovácká'),
    (13, 'VOC Slovácko', 'Dolní Bojanovice', 'Slovácká'),
    (14, 'VOC Blatnice', 'Blatnice pod Svatým Antonínkem', 'Slovácká'),
]
# powiat dla każdej gminy: wiele nazw się powtarza (Čejkovice, Němčičky, Sedlec, Hrádek, Tasovice…)
OKRES = {
    'Znojmo': 'Znojmo', 'Šatov': 'Znojmo', 'Hnanice': 'Znojmo', 'Miroslav': 'Znojmo', 'Hostěradice': 'Znojmo', 'Jaroslavice': 'Znojmo',
    'Hrádek': 'Znojmo', 'Božice': 'Znojmo', 'Dolní Kounice': 'Brno-venkov', 'Horní Dunajovice': 'Znojmo', 'Tasovice': 'Znojmo', 'Vrbovec': 'Znojmo',
    'Mikulov': 'Břeclav', 'Valtice': 'Břeclav', 'Pavlov': 'Břeclav', 'Perná': 'Břeclav', 'Drnholec': 'Břeclav', 'Dolní Dunajovice': 'Břeclav',
    'Pasohlávky': 'Brno-venkov', 'Sedlec': 'Břeclav', 'Novosedly': 'Břeclav', 'Ivaň': 'Brno-venkov',
    'Velké Pavlovice': 'Břeclav', 'Hustopeče': 'Břeclav', 'Bořetice': 'Břeclav', 'Kobylí': 'Břeclav', 'Velké Bílovice': 'Břeclav', 'Rakvice': 'Břeclav',
    'Šakvice': 'Břeclav', 'Čejkovice': 'Hodonín', 'Velké Němčice': 'Břeclav', 'Rajhrad': 'Brno-venkov', 'Němčičky': 'Břeclav',
    'Mutěnice': 'Hodonín', 'Bzenec': 'Hodonín', 'Kyjov': 'Hodonín', 'Strážnice': 'Hodonín', 'Uherský Ostroh': 'Uherské Hradiště',
    'Blatnice pod Svatým Antonínkem': 'Hodonín', 'Dolní Bojanovice': 'Hodonín', 'Polešovice': 'Uherské Hradiště', 'Lanžhot': 'Břeclav',
    'Břeclav': 'Břeclav', 'Hýsly': 'Hodonín', 'Brno': 'Brno-město',
}
W, H = 1300, 760
OUT = os.path.join(ROOT, 'site', 'img', 'wino')


def geocode(name, cache):
    key = name + ', okres ' + OKRES[name]
    if key in cache:
        return cache[key]
    q = urllib.parse.urlencode({'format': 'jsonv2', 'limit': 1, 'countrycodes': 'cz', 'q': key})
    r = json.load(urllib.request.urlopen(urllib.request.Request('https://nominatim.openstreetmap.org/search?' + q, headers=UA), timeout=30))
    time.sleep(1.2)  # zasady Nominatim: najwyżej 1 zapytanie na sekundę
    cache[key] = (float(r[0]['lat']), float(r[0]['lon'])) if r else None
    json.dump(cache, open(GEO_CACHE, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    return cache[key]


def font(size, bold=True):
    for n in (('arialbd.ttf', 'DejaVuSans-Bold.ttf') if bold else ('arial.ttf', 'DejaVuSans.ttf')):
        try:
            return ImageFont.truetype(n, size)
        except OSError:
            pass
    return ImageFont.load_default()


def main():
    cache = json.load(open(GEO_CACHE, encoding='utf-8')) if os.path.exists(GEO_CACHE) else {}
    pts = {s: [] for s in SUB}
    for s, names in VILLAGES.items():
        for n in names:
            g = geocode(n, cache)
            if g:
                pts[s].append(g)
            else:
                print('BRAK geokodu', n)
    salon = json.load(open(os.path.join(ROOT, 'docs', 'salon-vin', 'salon-vin-2026.json'), encoding='utf-8'))
    gold = [(w['subregion'], w['lat'], w['lon']) for w in salon['gold'] if w.get('lat') and w.get('subregion') in SUB]
    for s, la, lo in gold:
        pts[s].append((la, lo))
    for s in SUB:
        G = [(la, lo) for ss, la, lo in gold if ss == s]
        box = (min(p[0] for p in G) - .2, max(p[0] for p in G) + .2, min(p[1] for p in G) - .2, max(p[1] for p in G) + .2)
        for n in VILLAGES[s]:
            la, lo = geocode(n, cache)
            if not (box[0] <= la <= box[1] and box[2] <= lo <= box[3]):
                raise SystemExit(f'Gmina {n} ({la:.3f}, {lo:.3f}) leży poza zasięgiem podoblasti {s} — sprawdź geokod')
    voc = [(n, name, geocode(v, cache), s) for n, name, v, s in VOC]
    brno = geocode('Brno', cache)

    z = 10
    allp = [p for L in pts.values() for p in L] + [brno]
    xy = [rm.world_px(la, lo, z) for la, lo in allp]
    xs, ys = [p[0] for p in xy], [p[1] for p in xy]
    cx, cy = (min(xs) + max(xs)) / 2 - 70, (min(ys) + max(ys)) / 2 + 10
    x0, y0 = cx - W / 2, cy - H / 2
    to = lambda la, lo: (rm.world_px(la, lo, z)[0] - x0, rm.world_px(la, lo, z)[1] - y0)

    base = Image.new('RGB', (W, H), 'white')
    for tx in range(int(x0 // 256), int((x0 + W) // 256) + 1):
        for ty in range(int(y0 // 256), int((y0 + H) // 256) + 1):
            base.paste(rm.tile(z, tx, ty), (int(tx * 256 - x0), int(ty * 256 - y0)))
    base = Image.blend(base, Image.new('RGB', (W, H), 'white'), 0.45)  # przygaszony podkład

    # tło podoblasti: rozmyte koła wokół punktów
    for s, (col, _) in SUB.items():
        mask = Image.new('L', (W, H), 0)
        md = ImageDraw.Draw(mask)
        for la, lo in pts[s]:
            px, py = to(la, lo)
            md.ellipse((px - 34, py - 34, px + 34, py + 34), fill=255)
        mask = mask.filter(ImageFilter.GaussianBlur(14)).point(lambda v: min(130, v))
        base.paste(Image.new('RGB', (W, H), col), (0, 0), mask)

    d = ImageDraw.Draw(base)
    # winnice złotych win Salonu 2026
    for s, la, lo in gold:
        px, py = to(la, lo)
        d.ellipse((px - 5, py - 5, px + 5, py + 5), fill=SUB[s][0], outline='white', width=2)
    # podpisy podoblasti w środku ciężkości punktów
    f_reg = font(30)
    for s, (col, label) in SUB.items():
        P = [to(*p) for p in pts[s]]
        mx, my = sum(p[0] for p in P) / len(P), sum(p[1] for p in P) / len(P)
        off = {'Znojemská': (0, -95), 'Mikulovská': (-40, 95), 'Velkopavlovická': (-10, -135), 'Slovácká': (20, 95)}[s]
        tw = d.textlength(label, font=f_reg)
        tx, ty = mx + off[0] - tw / 2, my + off[1]
        d.text((tx, ty), label, font=f_reg, fill=tuple(int(c * 0.7) for c in col), stroke_width=4, stroke_fill='white')
    # Brno dla orientacji
    bx, by = to(*brno)
    d.rectangle((bx - 6, by - 6, bx + 6, by + 6), fill=(60, 60, 60), outline='white', width=2)
    d.text((bx + 12, by - 16), 'Brno', font=font(26), fill=(40, 40, 40), stroke_width=4, stroke_fill='white')
    # pinezki VOC
    f_num = font(24)
    for n, name, g, s in voc:
        px, py = to(*g)
        d.ellipse((px - 19, py - 19, px + 19, py + 19), fill='white')
        d.ellipse((px - 15, py - 15, px + 15, py + 15), fill=(74, 0, 20))
        t = str(n)
        tw = d.textlength(t, font=f_num)
        d.text((px - tw / 2, py - 14), t, font=f_num, fill='white')
    # nasza baza: Znojmo (gwiazdka obok pinezki 1)
    zx, zy = to(*geocode('Znojmo', cache))
    star = [(zx - 46 + 18 * math.cos(math.radians(a)) * (1 if i % 2 == 0 else 0.45), zy + 6 + 18 * math.sin(math.radians(a)) * (1 if i % 2 == 0 else 0.45))
            for i, a in enumerate(range(-90, 270, 36))]
    d.polygon(star, fill=(180, 83, 9), outline='white')
    d.text((zx - 150, zy + 28), 'nasza baza', font=font(24), fill=(180, 83, 9), stroke_width=4, stroke_fill='white')
    att = '© OpenStreetMap contributors · punkty: Salon vín ČR 2026'
    fa = font(18, bold=False)
    aw = d.textlength(att, font=fa)
    d.rectangle((W - aw - 16, H - 28, W, H), fill='white')
    d.text((W - aw - 8, H - 26), att, font=fa, fill=(60, 60, 60))

    os.makedirs(OUT, exist_ok=True)
    out = base.resize((960, int(960 * H / W)), Image.LANCZOS)
    out.save(os.path.join(OUT, 'mapa-regionow.webp'), 'WEBP', quality=74, method=6)
    meta = {
        'img': 'img/wino/mapa-regionow.webp', 'w': 960, 'h': int(960 * H / W),
        'subregions': [{'id': s, 'color': '#%02x%02x%02x' % SUB[s][0], 'gold2026': sum(1 for g in gold if g[0] == s)} for s in SUB],
        'voc': [{'n': n, 'name': name, 'village': v, 'subregion': s} for (n, name, v, s) in VOC],
        'goldPoints': len(gold),
    }
    open(os.path.join(ROOT, 'site', 'js', 'wine-map.js'), 'w', encoding='utf-8').write(
        '/* Wygenerowane przez tools/build-wine-map.py — nie edytuj ręcznie. */\nwindow.WINE_MAP = ' + json.dumps(meta, ensure_ascii=False, indent=1) + ';\n')
    print('OK mapa, złotych winnic:', len(gold), {s: len(v) for s, v in pts.items()})


if __name__ == '__main__':
    main()
