"""
Statyczne podglądy map tras: kafelki OpenStreetMap + ślad GPX, start i meta.

  python tools/build-route-maps.py

Czyta docs/trasy/*.gpx (te same pliki co tools/build-routes.mjs), zapisuje
site/img/trasy/<id>.webp oraz site/js/route-maps.js. Kafelki trafiają do pamięci podręcznej
docs/trasy-kafelki/ (w .gitignore), więc ponowne uruchomienie nie obciąża serwerów OSM.
Zasady korzystania z kafelków: https://operations.osmfoundation.org/policies/tiles/
"""
import io, json, math, os, re, time, urllib.request
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCES = {  # musi odpowiadać SOURCES w tools/build-routes.mjs
    'zamek-park': 'znojmo-zamek-kamien-park-altana.gpx',
    'kraluv-stolec': 'znojmo Studentská-Vyhlídka Králův stolec.gpx',
    'saldorf': 'znojmo-saldrov-10k.gpx',
    'cizov-hardegg': 'znojmo Parkoviště Čížov Zamek Hardegg nad Dyją.gpx',
}
W, H, MARGIN = 960, 720, 70          # obraz 4:3, renderowany w 2× względem karty na telefonie
TILE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
UA = {'User-Agent': 'HusaTripPage/1.0 (prywatna strona wyjazdu; jednorazowe statyczne podglady tras)'}
CACHE = os.path.join(ROOT, 'docs', 'trasy-kafelki')
OUT = os.path.join(ROOT, 'site', 'img', 'trasy')
WINE, GREEN, AMBER = (106, 19, 39), (47, 107, 58), (180, 83, 9)


def gpx_points(path):
    s = open(path, encoding='utf-8').read()
    return [(float(a), float(b)) for a, b in re.findall(r'<trkpt lat="([\d.]+)" lon="([\d.]+)"', s)]


def world_px(lat, lon, z):
    n = 256 * 2 ** z
    x = (lon + 180) / 360 * n
    y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n
    return x, y


def tile(z, x, y):
    os.makedirs(CACHE, exist_ok=True)
    p = os.path.join(CACHE, f'{z}_{x}_{y}.png')
    if not os.path.exists(p):
        req = urllib.request.Request(TILE.format(z=z, x=x, y=y), headers=UA)
        with urllib.request.urlopen(req, timeout=30) as r:
            open(p, 'wb').write(r.read())
        time.sleep(0.2)  # grzecznie wobec serwera kafelków
    return Image.open(p).convert('RGB')


def render(rid, pts):
    # największe powiększenie, przy którym cała trasa mieści się w kadrze z marginesem
    for z in range(17, 9, -1):
        xy = [world_px(la, lo, z) for la, lo in pts]
        xs, ys = [p[0] for p in xy], [p[1] for p in xy]
        if max(xs) - min(xs) <= W - 2 * MARGIN and max(ys) - min(ys) <= H - 2 * MARGIN:
            break
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    x0, y0 = cx - W / 2, cy - H / 2
    canvas = Image.new('RGB', (W, H), 'white')
    for tx in range(int(x0 // 256), int((x0 + W) // 256) + 1):
        for ty in range(int(y0 // 256), int((y0 + H) // 256) + 1):
            canvas.paste(tile(z, tx, ty), (int(tx * 256 - x0), int(ty * 256 - y0)))
    # lekkie rozjaśnienie, żeby trasa była czytelna
    canvas = Image.blend(canvas, Image.new('RGB', (W, H), 'white'), 0.18)
    d = ImageDraw.Draw(canvas)
    line = [(x - x0, y - y0) for x, y in xy]
    d.line(line, fill='white', width=14, joint='curve')
    d.line(line, fill=WINE, width=8, joint='curve')
    for (px, py), col in ((line[0], GREEN), (line[-1], AMBER)):
        d.ellipse((px - 15, py - 15, px + 15, py + 15), fill='white')
        d.ellipse((px - 10, py - 10, px + 10, py + 10), fill=col)
    try:
        font = ImageFont.truetype('arial.ttf', 20)
    except OSError:
        font = ImageFont.load_default()
    label = '© OpenStreetMap contributors'
    tw = d.textlength(label, font=font)
    d.rectangle((W - tw - 16, H - 32, W, H), fill=(255, 255, 255))
    d.text((W - tw - 8, H - 29), label, fill=(60, 60, 60), font=font)
    os.makedirs(OUT, exist_ok=True)
    canvas.save(os.path.join(OUT, rid + '.webp'), 'WEBP', quality=72, method=6)
    return z


def main():
    out = {}
    for rid, f in SOURCES.items():
        z = render(rid, gpx_points(os.path.join(ROOT, 'docs', 'trasy', f)))
        out[rid] = {'img': 'img/trasy/' + rid + '.webp', 'w': W, 'h': H, 'zoom': z,
                    'attribution': '© OpenStreetMap contributors', 'attributionUrl': 'https://www.openstreetmap.org/copyright'}
        print('OK', rid, 'z =', z)
    js = '/* Wygenerowane przez tools/build-route-maps.py — nie edytuj ręcznie. */\nwindow.ROUTE_MAPS = ' + json.dumps(out, indent=1) + ';\n'
    open(os.path.join(ROOT, 'site', 'js', 'route-maps.js'), 'w', encoding='utf-8').write(js)


if __name__ == '__main__':
    main()
