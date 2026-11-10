"""
Pobiera zdjęcia butelek i logo winiarni, ujednolica je i zapisuje do strony.

  python tools/build-wine-media.py            # pobiera brakujące i przetwarza wszystko
  python tools/build-wine-media.py --refresh  # pobiera wszystko od nowa

Wynik:
  site/img/wina/<id>.webp     zdjęcia butelek 300x500, białe tło
  site/img/logo/<id>.(webp|svg)
  site/js/wine-media.js       window.WINE_MEDIA = { bottles: {...}, logos: {...} } ze źródłami do podpisów
Oryginały trafiają do docs/wina-zrodla/ (w .gitignore).
"""
import io, json, os, re, ssl, sys, html, urllib.request, urllib.parse
from PIL import Image, ImageChops

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'docs', 'wina-zrodla')
OUT_B = os.path.join(ROOT, 'site', 'img', 'wina')
OUT_L = os.path.join(ROOT, 'site', 'img', 'logo')
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Husa-trip-page'}
SALON = 'https://www.vinarskecentrum.cz/img/etikety/2026/Lahve-pro-web-2026-{}.png'
SALON_PAGE = 'https://www.vinarskecentrum.cz/salon-vin/vina-v-salonu/260{:02d}'

# id wina -> źródło zdjęcia: 'page' (bierzemy og:image), 'img' (bezpośredni adres), 'salon' (nr w Salonie vín 2026),
#            'alias' (to samo zdjęcie co inne wino), brak = zamiennik rysowany na stronie
BOTTLES = {
    'hnanice-vz-2025': {'page': 'https://www.vinice-hnanice.cz/produkt/veltlinske-zelene-voc-znojmo-2025/'},
    'hnanice-rr-2025': {'page': 'https://www.vinice-hnanice.cz/produkt/ryzlink-rynsky-voc-znojmo-2025/'},
    'hnanice-sb-2025': {'page': 'https://www.vinice-hnanice.cz/produkt/sauvignon-voc-znojmo-2025/'},
    'pialek-sb-2025': {'page': 'https://e-shop.pialek.cz/sauvignon-voc-2025/'},
    'pialek-vz-extra-2024': {'page': 'https://e-shop.pialek.cz/veltlinske-zelene-extra-2024/'},
    'pialek-hibernal-2025': {'page': 'https://e-shop.pialek.cz/hibernal-2025/'},
    'spalek-vz-2025': {'page': 'https://www.spalek.bio/product-page/veltl%C3%ADnsk%C3%A9-zelen%C3%A9-bio-voc-znojmo-2024'},
    'spalek-velky-sud-2023': {'salon': 33},
    'spalek-gryllus-2025': {'page': 'https://www.spalek.bio/product-page/cuv%C3%A9e-gryllus-voc-znojmo'},
    'thaya-apri-2024': {'page': 'https://eshop.vinarstvithaya.cz/apri-chardonnay-2024/'},
    'thaya-vz-2025': {'page': 'https://eshop.vinarstvithaya.cz/veltlinske-zelene-2025/'},
    'thaya-zw-2023': {'page': 'https://eshop.vinarstvithaya.cz/zweigeltrebe-2023/'},
    'waldberg-ch-2022': {'salon': 16},
    'waldberg-rm-2021': {'page': 'https://www.vinotrh.cz/rulandske-modre-volne-pole-2021-v-h--3/'},
    'oulehla-fr-2022': {'page': 'https://eshop.oulehlavinarstvi.cz/frankovka-2022-pozdni-sber/'},
    'oulehla-fr-2023': {'alias': 'oulehla-fr-2022'},
    'oulehla-ch-2023': {'page': 'https://eshop.oulehlavinarstvi.cz/chardonnay-karlov-2023-moravske-zemske-stare-kere/'},
    'oulehla-merlot-2022': {'page': 'https://eshop.oulehlavinarstvi.cz/merlot-grand-reserva-2022/'},
    'lahofer-vcr-2024': {'page': 'https://www.vinotrh.cz/veltlinske-cervene-rane-volne-pole-2024-kab-/'},
    'lahofer-rajska-2025': {'page': 'https://www.vinotrh.cz/cuvee-rajska-rajska-vinice-2025-voc/'},
    'lahofer-vz-2025': {'page': 'https://www.vinotrh.cz/veltlinske-zelene-volne-pole-2025-voc/'},
    'halkoci-typik-2025': {'page': 'https://vinarstvihalkoci.cz/produkt/ryzlink-typik-2025/'},
    'halkoci-vz2-2024': {'page': 'https://vinarstvihalkoci.cz/produkt/veltlin%C2%B2-2024/'},
    'halkoci-supa-2025': {'page': 'https://vinarstvihalkoci.cz/produkt/supa-25/'},
    'korinek-vz-2023': {'page': 'https://www.vinovin.cz/veltlinske-zelene--voc--suche-vino--2023-josef-korinek/'},
    'korinek-petnat-2025': {'page': 'https://eshop.vinarstvi-korinek.cz/vinarstvi-korinek-josef-pet-nat-ryzlink-rynsky-2025'},
    'korinek-muskat-2026': {'page': 'https://www.vinovin.cz/muskat-moravsky-fresh-zemske-polosuche-vino-2026-korinek/'},
    'simenon-vz-2025': {'img': 'https://cdn.myshoptet.com/usr/shop.vinarstvisimenon.cz/user/shop/big/286_veltlinske-zelene-2025.jpg',
                        'credit': 'shop.vinarstvisimenon.cz', 'creditUrl': 'https://shop.vinarstvisimenon.cz/veltlinske-zelene-voc-2025/'},
    'simenon-rr-2025': {'img': 'https://cdn.myshoptet.com/usr/shop.vinarstvisimenon.cz/user/shop/big/289_ryzlink-rynsky-2025.jpg',
                        'credit': 'shop.vinarstvisimenon.cz', 'creditUrl': 'https://shop.vinarstvisimenon.cz/ryzlink-rynsky-voc-2025/'},
    'simenon-sb-2025': {'page': 'https://www.vinovin.cz/sauvignon--voc--suche-vino--2025-simenon/'},
    'ampelos-veritas-2024': {'page': 'https://ampelos.cz/veritas-2024-c284'},
    'ampelos-trio-2024': {'page': 'https://ampelos.cz/trio-2024-c274'},
    'dobra-creme-2022': {'page': 'https://www.dobravinice.cz/p/creme-de-kambrium-2022'},
    'dobra-kambrium-2022': {'page': 'https://www.dobravinice.cz/p/kambrium-cuvee-2022'},
    'dobra-qvevri-2019': {'page': 'https://www.dobravinice.cz/p/veltlinske-zelene-qvevri-2019'},
    'davinus-rr-2022': {'page': 'https://www.eshop.davinus.cz/ryzlink-rynsky-2022-kabinetni-vino-davinus/'},
    'gotberg-palava-2024': {'salon': 48},
    'cervinka-rv-2022': {'salon': 24},
    'valtice-fr-2023': {'salon': 85},
    'pialek-vz-extra-2023': {'salon': 2},
    'placek-fr-2023': {'salon': 81},
    'kubik-fr-2023': {'salon': 82},
    'stepanek-sz-2023': {'salon': 11},
    'skrobak-tc-2023': {'salon': 49},
    'bv-merlot-2018': {'salon': 72},
    'davinus-sommelier-2022': {'salon': 55},
    'zapletal-vz-2024': {'salon': 1},
    'vinohort-kralovsky-2023': {'page': 'https://www.vinotrh.cz/kralovsky-ryzlink-rynsky/'},
    'hanzel-rotgipfler-2025': {'page': 'https://www.vinotrh.cz/rotgipfler-volne-pole-2025-p-s-/'},
    # bez zdjęcia w źródłach (Znovín podaje tylko zdjęcia poglądowe): znovin-sobes-2025, znovin-sobes-2024, znovin-sb-2025, znovin-vz-2025, znovin-neuburske-2025, waldberg-rv-2024, ampelos-at-2024
}

# id winiarni -> strona główna (logo wykrywane automatycznie) albo bezpośredni adres logo
LOGOS = {
    'hnanice': {'home': 'https://www.vinice-hnanice.cz/'},
    'znovin': {'home': 'https://www.znovin.cz/'},
    'pialek': {'home': 'https://www.pialek.cz/'},
    'thaya': {'home': 'https://www.vinarstvithaya.cz/', 'dark': True},  # białe logo
    'waldberg': {'home': 'https://www.waldberg.cz/'},
    'oulehla': {'home': 'https://www.oulehlavinarstvi.cz/'},
    'lahofer': {'home': 'https://www.lahofer.cz/'},
    'halkoci': {'home': 'https://vinarstvihalkoci.cz/'},
    'korinek': {'home': 'https://www.vinarstvi-korinek.cz/', 'dark': True},  # białe logo
    'simenon': {'home': 'https://www.vinarstvisimenon.cz/'},
    'ampelos': {'home': 'https://ampelos.cz/'},
    'dobravinice': {'home': 'https://www.dobravinice.cz/'},
    'davinus': {'img': 'https://www.davinus.cz/assets/images/logo/logo.svg', 'home': 'https://www.davinus.cz/'},
    'gotberg': {'img': 'https://files.gotberg.cz/site/logo.svg', 'home': 'https://www.gotberg.cz/'},
    'valtice': {'home': 'https://www.vinnesklepyvaltice.cz/'},
}

_ctx = ssl.create_default_context()  # zawsze z weryfikacją certyfikatu; strony, które jej nie przejdą, są pomijane


def fetch(url):
    p = urllib.parse.urlsplit(url)  # spacje i znaki diakrytyczne w ścieżce trzeba zakodować
    url = urllib.parse.urlunsplit(p._replace(path=urllib.parse.quote(p.path, safe='/%:@')))
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=40, context=_ctx) as r:
        return r.read(), r.headers.get('Content-Type', '')


def og_image(page):
    body, _ = fetch(page)
    h = body.decode('utf-8', 'replace')
    m = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)', h) or \
        re.search(r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image', h)
    return html.unescape(m.group(1)) if m else None


def find_logo(home):
    body, _ = fetch(home)
    h = body.decode('utf-8', 'replace')
    cands = []
    for m in re.finditer(r'<img\b[^>]*>', h, re.I):
        tag = m.group(0)
        if re.search(r'logo', tag, re.I):
            s = re.search(r'\b(?:src|data-src)=["\']([^"\']+)', tag)
            if s and not s.group(1).startswith('data:'):
                cands.append(s.group(1))
    if not cands:  # czasem logo jest tylko w ikonie strony
        m = re.search(r'<link[^>]+rel=["\'](?:apple-touch-icon|icon)["\'][^>]+href=["\']([^"\']+)', h, re.I)
        if m:
            cands.append(m.group(1))
    return urllib.parse.urljoin(home, html.unescape(cands[0])) if cands else None


def cached(name, url, refresh):
    os.makedirs(CACHE, exist_ok=True)
    ext = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower() or '.img'
    path = os.path.join(CACHE, name + ext)
    if refresh or not os.path.exists(path):
        data, _ = fetch(url)
        open(path, 'wb').write(data)
    return path


def flatten(im):
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        bg = Image.new('RGB', im.size, 'white')
        bg.paste(im, mask=im.split()[3])
        return bg
    return im.convert('RGB')


def trim(im):
    bg = Image.new('RGB', im.size, (255, 255, 255))
    diff = ImageChops.difference(im, bg).convert('L').point(lambda p: 255 if p > 18 else 0)
    box = diff.getbbox()
    return im.crop(box) if box else im


def bottle(src, dst):
    im = trim(flatten(Image.open(src)))
    W, H = 300, 500
    im.thumbnail((W - 20, H - 16), Image.LANCZOS)
    canvas = Image.new('RGB', (W, H), 'white')
    canvas.paste(im, ((W - im.width) // 2, (H - im.height) // 2))
    canvas.save(dst, 'WEBP', quality=76, method=6)


def logo(src, dst_base):
    if src.lower().endswith('.svg'):
        data = open(src, 'rb').read()
        if re.search(rb'<script|on\w+=', data, re.I):
            raise RuntimeError('SVG z treścią aktywną — pomijam')
        open(dst_base + '.svg', 'wb').write(data)
        return dst_base + '.svg'
    im = Image.open(src).convert('RGBA')
    box = im.getbbox()
    if box:
        im = im.crop(box)
    im.thumbnail((360, 120), Image.LANCZOS)
    im.save(dst_base + '.webp', 'WEBP', quality=86, method=6)
    return dst_base + '.webp'


def main():
    refresh = '--refresh' in sys.argv
    os.makedirs(OUT_B, exist_ok=True)
    os.makedirs(OUT_L, exist_ok=True)
    media = {'bottles': {}, 'logos': {}}
    for wid, src in BOTTLES.items():
        if 'alias' in src:
            continue
        try:
            if 'salon' in src:
                url, credit, credit_url = SALON.format(src['salon']), 'Salon vín ČR 2026', SALON_PAGE.format(src['salon'])
            elif 'img' in src:
                url, credit, credit_url = src['img'], src['credit'], src['creditUrl']
            else:
                url = og_image(src['page'])
                credit, credit_url = urllib.parse.urlparse(src['page']).netloc.replace('www.', ''), src['page']
            if not url:
                raise RuntimeError('brak og:image')
            path = cached('b_' + wid, url, refresh)
            bottle(path, os.path.join(OUT_B, wid + '.webp'))
            media['bottles'][wid] = {'img': 'img/wina/' + wid + '.webp', 'credit': credit, 'creditUrl': credit_url}
            print('OK  butelka', wid)
        except Exception as e:  # noqa: BLE001 — chcemy przejść przez całą listę
            print('BRAK butelka', wid, '-', e)
    for wid, src in BOTTLES.items():
        if 'alias' in src and src['alias'] in media['bottles']:
            media['bottles'][wid] = dict(media['bottles'][src['alias']], alias=src['alias'])
    for pid, src in LOGOS.items():
        try:
            url = src.get('img') or find_logo(src['home'])
            if not url:
                raise RuntimeError('nie znaleziono logo')
            path = cached('l_' + pid, url, refresh)
            out = logo(path, os.path.join(OUT_L, pid))
            media['logos'][pid] = {'img': 'img/logo/' + os.path.basename(out), 'credit': urllib.parse.urlparse(src['home']).netloc.replace('www.', ''), 'creditUrl': src['home'], 'dark': bool(src.get('dark'))}
            print('OK  logo', pid, url)
        except Exception as e:  # noqa: BLE001
            print('BRAK logo', pid, '-', e)
    js = '/* Wygenerowane przez tools/build-wine-media.py — nie edytuj ręcznie. */\nwindow.WINE_MEDIA = ' + json.dumps(media, ensure_ascii=False, indent=1) + ';\n'
    open(os.path.join(ROOT, 'site', 'js', 'wine-media.js'), 'w', encoding='utf-8').write(js)
    print('zdjęcia butelek:', len(media['bottles']), ' logo:', len(media['logos']))


if __name__ == '__main__':
    main()
