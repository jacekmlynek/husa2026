"""
Odczytuje wartości 0–10 z wykresów aromatów Salonu vín 2026 (Aromagrafy_2026-NN.jpg).

  python tools/read-aroma-charts.py

Każdy wykres ma dwa radary: strukturę (6 osi) i aromaty (13 osi). Odczyt: od środka radaru wzdłuż
każdej osi szukamy najdalszego czerwonego piksela linii profilu; odległość dzieloną przez promień
pierścienia „10” to wartość. Skrypt zapisuje site/js/aroma.js oraz obrazy kontrolne
(docs/salon-vin/aroma-kontrola/), na których odczytany wielokąt narysowany jest na oryginale.
"""
import json, math, os, urllib.request
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) HusaTripPage/1.0'}
URL = 'https://www.vinarskecentrum.cz/img/grafy/2026/Aromagrafy_2026-{}.jpg'
CACHE = os.path.join(ROOT, 'docs', 'salon-vin', 'aroma-kontrola')

# id wina na stronie -> numer w Salonie 2026
WINES = {'waldberg-ch-2022': 16, 'cervinka-rv-2022': 24, 'spalek-velky-sud-2023': 33, 'gotberg-palava-2024': 48, 'valtice-fr-2023': 85}
RED_WINES = {'valtice-fr-2023'}

STRUCT = ['intensywność zapachu', 'intensywność smaku', 'ciało', 'złożoność', 'równowaga', 'potencjał dojrzewania']
AROMA_WHITE = ['kwiatowe', 'owoce tropikalne', 'cytrusy', 'owoce ziarnkowe', 'owoce pestkowe', 'drobne owoce', 'owoce suszone i gotowane',
               'karmelowe', 'ziołowe', 'korzenne', 'beczka', 'drożdżowe i mleczne', 'mineralne i inne']
AROMA_RED = ['kwiatowe', 'owoce ziarnkowe lub tropikalne', 'owoce pestkowe', 'drobne jasne owoce', 'drobne ciemne owoce', 'owoce suszone i gotowane',
             'karmelowe', 'korzenne', 'zioła świeże', 'zioła suszone', 'beczka barrique', 'zwierzęce', 'grzyby i ziemiste']


def is_red(p):
    return p[0] > 150 and p[1] < 90 and p[2] < 90


def is_grid(p):
    return 110 < p[0] < 200 and abs(p[0] - p[1]) < 18 and abs(p[1] - p[2]) < 18


def find_center(im, approx):
    """Środek i promień pierścienia „10”: najszerszy poziomy przekrój zewnętrznego okręgu.
    (Pionowa oś wychodzi poza pierścień do podpisu, więc pionowy pomiar zawyżał promień.)"""
    px = im.load()
    ax, ay = approx
    best = None
    for y in range(ay - 40, ay + 41):
        xs = [x for x in range(ax - 200, ax + 201) if is_grid(px[x, y])]
        if len(xs) < 2:
            continue
        w = xs[-1] - xs[0]
        if best is None or w > best[0]:
            best = (w, y, (xs[0] + xs[-1]) / 2)
    w, cy, cx = best
    return cx, cy, w / 2


def find_center_vertical(im, approx):
    """Dla radaru aromatów (13 osi, prawie poziome osie wychodzą poza okrąg): pomiar pionowy."""
    px = im.load()
    ax, ay = approx
    best = max(range(ax - 8, ax + 9), key=lambda x: sum(is_grid(px[x, y]) for y in range(ay - 150, ay + 150)))
    up = [y for y in range(ay - 190, ay) if is_grid(px[best, y])]
    down = [y for y in range(ay, ay + 190) if is_grid(px[best, y]) or is_grid(px[best + 1, y])]
    top, bottom = min(up), max(down)
    return best, (top + bottom) / 2, (bottom - top) / 2


def read_radar(im, center, r10, n):
    px = im.load()
    cx, cy = center
    vals = []
    for i in range(n):
        ang = math.radians(i * 360 / n)  # 0 = góra, zgodnie z ruchem wskazówek zegara
        far = 0
        for r10x in range(0, int(r10 * 1.06) * 10):
            r = r10x / 10
            for off in (-1.5, -0.75, 0, 0.75, 1.5):
                x = cx + r * math.sin(ang) + off * math.cos(ang)
                y = cy - r * math.cos(ang) + off * math.sin(ang)
                if is_red(px[int(round(x)), int(round(y))]):
                    far = r
                    break
        vals.append(round(min(10, far / r10 * 10), 1))
    return vals


def main():
    os.makedirs(CACHE, exist_ok=True)
    out = {}
    for wid, nr in WINES.items():
        path = os.path.join(CACHE, f'{nr}.jpg')
        if not os.path.exists(path):
            open(path, 'wb').write(urllib.request.urlopen(urllib.request.Request(URL.format(nr), headers=UA), timeout=40).read())
        im = Image.open(path).convert('RGB')
        sx, sy, sr = find_center(im, (287, 257))
        ax, ay, ar = find_center_vertical(im, (287, 757))
        assert abs(ar - sr) < 6, f'różne promienie radarów {sr} vs {ar}'
        struct = read_radar(im, (sx, sy), sr, 6)
        aroma = read_radar(im, (ax, ay), ar, 13)
        labels = AROMA_RED if wid in RED_WINES else AROMA_WHITE
        out[wid] = {
            'salonNr': nr,
            'chart': URL.format(nr),
            'structure': dict(zip(STRUCT, struct)),
            'aroma': dict(zip(labels, aroma)),
        }
        # obraz kontrolny: odczytane punkty na oryginale
        d = ImageDraw.Draw(im)
        for (cx, cy, r10, vals) in ((sx, sy, sr, struct), (ax, ay, ar, aroma)):
            n = len(vals)
            pts = [(cx + v / 10 * r10 * math.sin(math.radians(i * 360 / n)), cy - v / 10 * r10 * math.cos(math.radians(i * 360 / n))) for i, v in enumerate(vals)]
            d.line(pts + [pts[0]], fill=(0, 90, 255), width=2)
            for p in pts:
                d.ellipse((p[0] - 3, p[1] - 3, p[0] + 3, p[1] + 3), outline=(0, 90, 255), width=2)
        im.save(os.path.join(CACHE, f'{nr}-odczyt.png'))
        print(wid, 'struktura', struct, '\n   aromaty', aroma, f'(środki {sx},{sy:.0f} r={sr:.0f} | {ax},{ay:.0f} r={ar:.0f})')
    js = ('/* Wygenerowane przez tools/read-aroma-charts.py z wykresów Salonu vín 2026 — nie edytuj ręcznie.\n'
          '   Skala 0–10 jak na wykresach degustatorów; odczyt z obrazka z dokładnością ok. ±0,3. */\n'
          'window.AROMA = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')
    open(os.path.join(ROOT, 'site', 'js', 'aroma.js'), 'w', encoding='utf-8').write(js)


if __name__ == '__main__':
    main()
