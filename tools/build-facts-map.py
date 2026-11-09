"""
Mapa ciekawostek: kafelki OpenStreetMap z ponumerowanymi pinezkami miejsc z zakładki „Ciekawostki”.

  python tools/build-facts-map.py   ->   site/img/historia/mapa-ciekawostek.webp

Współrzędne z OpenStreetMap (Nominatim), sprawdzone 9 XI 2026. Kafelki z pamięci podręcznej
docs/trasy-kafelki/ (wspólnej z tools/build-route-maps.py).
"""
import math, os, sys
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importlib.util
spec = importlib.util.spec_from_file_location('rm', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'build-route-maps.py'))
rm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rm)  # world_px(), tile()

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# nr, podpis na mapie, szer., dł.  (kolejność = kolejność legendy na stronie)
PLACES = [
    (1, 'Hradiště', 48.8589621, 16.0332038),
    (2, 'Rotunda i zamek', 48.8554143, 16.0435315),
    (3, 'Polski Kamień', 48.8548129, 16.0412843),
    (4, 'Kościół św. Mikołaja', 48.8547141, 16.0454913),
    (5, 'Rynek', 48.8542647, 16.0498779),
]
FAR = ('Králův stolec 3,5 km', 48.8440148, 16.0033777)  # poza kadrem: strzałka przy krawędzi
W, H, MARGIN = 960, 640, 90
WINE, AMBER = (106, 19, 39), (180, 83, 9)


def font(size, bold=True):
    for name in (('arialbd.ttf', 'DejaVuSans-Bold.ttf') if bold else ('arial.ttf', 'DejaVuSans.ttf')):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def main():
    for z in range(17, 12, -1):
        xy = [rm.world_px(la, lo, z) for _, _, la, lo in PLACES]
        xs, ys = [p[0] for p in xy], [p[1] for p in xy]
        if max(xs) - min(xs) <= W - 2 * MARGIN and max(ys) - min(ys) <= H - 2 * MARGIN:
            break
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    x0, y0 = cx - W / 2, cy - H / 2
    img = Image.new('RGB', (W, H), 'white')
    for tx in range(int(x0 // 256), int((x0 + W) // 256) + 1):
        for ty in range(int(y0 // 256), int((y0 + H) // 256) + 1):
            img.paste(rm.tile(z, tx, ty), (int(tx * 256 - x0), int(ty * 256 - y0)))
    img = Image.blend(img, Image.new('RGB', (W, H), 'white'), 0.25)
    d = ImageDraw.Draw(img)
    f_num, f_lab, f_small = font(38), font(34), font(19, bold=False)

    # strzałka do Králova stolca przy krawędzi kadru
    fx, fy = rm.world_px(FAR[1], FAR[2], z)
    fx, fy = fx - x0, fy - y0
    ang = math.atan2(fy - H / 2, fx - W / 2)
    ex, ey = W / 2 + math.cos(ang) * (W / 2 - 40), H / 2 + math.sin(ang) * (H / 2 - 40)
    ex, ey = max(40, min(W - 40, ex)), max(40, min(H - 40, ey))
    tip = (ex, ey)
    base = (ex - math.cos(ang) * 70, ey - math.sin(ang) * 70)
    left = (base[0] + math.cos(ang + math.pi / 2) * 22, base[1] + math.sin(ang + math.pi / 2) * 22)
    right = (base[0] + math.cos(ang - math.pi / 2) * 22, base[1] + math.sin(ang - math.pi / 2) * 22)
    d.polygon([tip, left, right], fill=AMBER, outline='white')
    tw = d.textlength(FAR[0], font=f_lab)
    lx = min(max(tip[0] - 14, 10), W - tw - 18)    # podpis pod strzałką, zawsze w kadrze
    ly = min(max(tip[1] + 26, 10), H - 70)
    d.rounded_rectangle((lx - 10, ly - 4, lx + tw + 10, ly + 44), 10, fill=(255, 255, 255))
    d.text((lx, ly), FAR[0], fill=AMBER, font=f_lab)

    # duże ponumerowane pinezki; podpisy są w legendzie pod mapą (na telefonie tekst na mapie byłby za mały)
    for (n, label, la, lo) in PLACES:
        px, py = rm.world_px(la, lo, z)
        px, py = px - x0, py - y0
        d.ellipse((px - 30, py - 30, px + 30, py + 30), fill='white')
        d.ellipse((px - 25, py - 25, px + 25, py + 25), fill=WINE)
        nw = d.textlength(str(n), font=f_num)
        d.text((px - nw / 2, py - 21), str(n), fill='white', font=f_num)

    att = '© OpenStreetMap contributors'
    aw = d.textlength(att, font=f_small)
    d.rectangle((W - aw - 16, H - 30, W, H), fill=(255, 255, 255))
    d.text((W - aw - 8, H - 27), att, fill=(60, 60, 60), font=f_small)
    out = os.path.join(ROOT, 'site', 'img', 'historia', 'mapa-ciekawostek.webp')
    img.save(out, 'WEBP', quality=74, method=6)
    print('OK', out, 'z =', z)


if __name__ == '__main__':
    main()
