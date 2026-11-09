"""
Zdjęcia (wejście, szyld, wnętrze) i logo restauracji oraz winiarni.

  python tools/build-venue-media.py            # przetwarza wybrane zdjęcia
  python tools/build-venue-media.py --sheet    # dodatkowo zapisuje arkusz kandydatów do obejrzenia

Wynik: site/img/lokale/<id>.webp (3:2), site/img/lokale/<id>-logo.(webp|svg), site/js/venue-media.js.
Oryginały: docs/lokale-zrodla/ (w .gitignore). Źródła: strony lokali, katalog firmy.cz (Seznam), Wikimedia Commons.
"""
import html, io, json, os, re, ssl, sys, urllib.parse, urllib.request
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = os.path.join(ROOT, 'docs', 'lokale-zrodla')
OUT = os.path.join(ROOT, 'site', 'img', 'lokale')
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) HusaTripPage/1.0'}
_ctx = ssl.create_default_context()

FIRMY = 'firmy.cz (Seznam)'
COMMONS = 'Wikimedia Commons'

# id lokalu -> zdjęcie i logo. Zdjęcie: 'og' (og:image ze strony), 'img' (adres), 'commons' (tytuł pliku).
VENUES = {
    'maxwilliam': {'photo': {'og': 'https://www.firmy.cz/detail/13370396-hospudka-maxwilliam-znojmo.html', 'credit': FIRMY},
                   'logo': 'https://maxwilliam.cz/wp-content/uploads/2022/11/logo-maxw-tm.png', 'logoDark': True},  # białe logo
    'mikulas': {'photo': {'og': 'https://www.firmy.cz/detail/13361706-mikulas-bistro-znojmo.html', 'credit': FIRMY},
                'logo': 'https://www.mikulasznojmo.cz/wp-content/uploads/2024/01/logo-mikulasznojmo.jpg'},
    'divadlo': {'photo': {'og': 'https://www.firmy.cz/detail/13715115-restaurace-u-divadla-znojmo.html', 'credit': FIRMY}},
    'bufet': {'photo': {'og': 'https://www.firmy.cz/detail/12756461-bufet-masarykovo-namesti-16-znojmo.html', 'credit': FIRMY}},
    'karel': {'photo': {'og': 'https://www.firmy.cz/detail/336380-restaurace-u-karla-znojmo.html', 'credit': FIRMY}},
    'konev': {'photo': {'img': 'https://uzlatekonve.cz/wp-content/uploads/2020/06/konev-1.jpeg', 'credit': 'uzlatekonve.cz', 'creditUrl': 'https://uzlatekonve.cz/'},
              'logo': 'https://uzlatekonve.cz/wp-content/uploads/2020/03/logo.png'},
    'jasanu': {'photo': {'og': 'https://www.firmy.cz/detail/13141043-restaurace-u-tri-jasanu-novy-saldorf-sedlesovice-novy-saldorf.html', 'credit': FIRMY}},
    'jezuitska': {'photo': {'commons': 'File:Znojmo, Vinotéka Jezuitská (1).jpg'}},
    'enoteka': {'photo': {'commons': 'File:GuentherZ 2013-08-03 00744 Znojmo-Znaim Brauerei.JPG'},
                'logo': 'https://cdn.myshoptet.com/usr/www.vinotrh.cz/user/logos/vinotrh_logo.png'},
    'weinquartier': {'photo': {'commons': 'File:Retz - Hauptplatz (1).JPG'},
                     'logo': 'https://weinquartier.at/wp-content/uploads/2019/04/Weinquartier_Logo_800.jpg'},
}
# dodatkowi kandydaci do arkusza porównawczego (--sheet)
EXTRA = {
    'mikulas-www': 'https://www.mikulasznojmo.cz/wp-content/uploads/2024/02/mikulas-znojmo-2024-03.jpg',
    'jasanu-www': 'http://penzion-u-tri-jasanu.cz/wp-content/uploads/2017/02/header4.jpg',
    'maxwilliam-og': 'https://maxwilliam.cz/wp-content/uploads/2022/12/og-maxwilliam-1200x630-1.jpg',
    'konev-2': 'https://uzlatekonve.cz/wp-content/uploads/2020/06/konev-1.jpeg',
    'jezuitska-2': 'commons:File:Znojmo, Vinotéka Jezuitská (2).jpg',
    'enoteka-2': 'commons:File:GuentherZ 2013-08-03 00747 Znojmo-Znaim Brauerei.JPG',
    'divadlo-hotel': 'og:https://www.firmy.cz/detail/13715109-hotel-u-divadla-znojmo.html',
}


def fetch(url):
    p = urllib.parse.urlsplit(url)
    url = urllib.parse.urlunsplit(p._replace(path=urllib.parse.quote(p.path, safe='/%:@')))
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40, context=_ctx) as r:
        return r.read()


def og_image(page):
    h = fetch(page).decode('utf-8', 'replace')
    m = re.search(r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)', h)
    return html.unescape(m.group(1)) if m else None


def commons(title):
    u = 'https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1000&format=json&titles=' + urllib.parse.quote(title)
    page = list(json.loads(fetch(u))['query']['pages'].values())[0]
    ii = page['imageinfo'][0]
    m = ii['extmetadata']
    artist = re.sub(r'<[^>]+>', '', m.get('Artist', {}).get('value', '')).strip()
    lic = m.get('LicenseShortName', {}).get('value', '')
    return ii['thumburl'], 'Fot. ' + artist + ', ' + lic, ii['descriptionurl']


def resolve(spec):
    """Zwraca (adres obrazu, podpis, link do źródła)."""
    if 'commons' in spec:
        return commons(spec['commons'])
    if 'og' in spec:
        return og_image(spec['og']), spec['credit'], spec['og']
    return spec['img'], spec['credit'], spec.get('creditUrl', spec['img'])


def load(name, url):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, name + '.img')
    if not os.path.exists(path):
        open(path, 'wb').write(fetch(url))
    return Image.open(path)


def photo(im, dst):
    im = im.convert('RGB')
    w, h = im.size
    tw, th = (w, int(w * 2 / 3)) if w * 2 / 3 <= h else (int(h * 3 / 2), h)
    im = im.crop(((w - tw) // 2, (h - th) // 2, (w - tw) // 2 + tw, (h - th) // 2 + th)).resize((720, 480), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=70, method=6)


def logo(im, dst, dark=False):
    im = im.convert('RGBA')
    if dark:  # białe logo: przycinamy według przezroczystości, nie według bieli
        box = im.getchannel('A').point(lambda a: 255 if a > 16 else 0).getbbox()
        if box:
            im = im.crop(box)
        im.thumbnail((360, 140), Image.LANCZOS)
        im.save(dst, 'WEBP', quality=88, method=6)
        return
    bg = Image.new('RGBA', im.size, (255, 255, 255, 255))
    flat = Image.alpha_composite(bg, im).convert('RGB')
    diff = Image.eval(flat.convert('L'), lambda p: 255 if p < 235 else 0)
    box = diff.getbbox()
    if box:
        im = im.crop(box)
    im.thumbnail((360, 140), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=88, method=6)


def main():
    os.makedirs(OUT, exist_ok=True)
    media, sheet = {}, []
    for vid, v in VENUES.items():
        entry = {}
        try:
            url, credit, credit_url = resolve(v['photo'])
            im = load(vid, url)
            photo(im, os.path.join(OUT, vid + '.webp'))
            entry.update(img='img/lokale/' + vid + '.webp', credit=credit, creditUrl=credit_url)
            sheet.append((vid, im))
            print('OK  zdjęcie', vid, credit)
        except Exception as e:  # noqa: BLE001
            print('BRAK zdjęcie', vid, '-', e)
        if v.get('logo'):
            try:
                im = load(vid + '-logo', v['logo'])
                logo(im, os.path.join(OUT, vid + '-logo.webp'), dark=bool(v.get('logoDark')))
                entry['logo'] = 'img/lokale/' + vid + '-logo.webp'
                entry['logoDark'] = bool(v.get('logoDark'))
                print('OK  logo', vid)
            except Exception as e:  # noqa: BLE001
                print('BRAK logo', vid, '-', e)
        if entry:
            media[vid] = entry
    js = '/* Wygenerowane przez tools/build-venue-media.py — nie edytuj ręcznie. */\nwindow.VENUE_MEDIA = ' + json.dumps(media, ensure_ascii=False, indent=1) + ';\n'
    open(os.path.join(ROOT, 'site', 'js', 'venue-media.js'), 'w', encoding='utf-8').write(js)

    if '--sheet' in sys.argv:
        for k, u in EXTRA.items():
            try:
                if u.startswith('commons:'):
                    u = commons(u[8:])[0]
                elif u.startswith('og:'):
                    u = og_image(u[3:])
                sheet.append((k, load(k, u)))
            except Exception as e:  # noqa: BLE001
                print('BRAK kandydat', k, '-', e)
        cols = 6
        s = Image.new('RGB', (cols * 250, ((len(sheet) + cols - 1) // cols) * 200), 'white')
        d = ImageDraw.Draw(s)
        for i, (k, im) in enumerate(sheet):
            t = im.convert('RGB')
            t.thumbnail((240, 170))
            x, y = (i % cols) * 250, (i // cols) * 200
            s.paste(t, (x, y))
            d.text((x + 2, y + 180), k, fill='black')
        s.save(os.path.join(CACHE, '_arkusz.png'))
        print('arkusz:', os.path.join(CACHE, '_arkusz.png'))


if __name__ == '__main__':
    main()
