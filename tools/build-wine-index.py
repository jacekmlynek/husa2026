"""Wina z Salonu vín 2024–2026 do wyszukiwarki w zakładce Wino -> site/js/wine-index.js.

Wejście: docs/salon-vin/salon-vin-RRRR.json (opis pól: docs/salon-vin/README.md).
Zakres (decyzja z 10 XI 2026, specs/wyszukiwanie-tekstowe/DEVELOPMENT-PLAN.md):
  - wszystkie złote wina (100 na rok),
  - srebrne wina tylko z podobszaru znojemskiego (subregion = "Znojemská").
To samo wino w kilku latach (ten sam wine_id) to jeden rekord: dane z najnowszego roku, a medale ze wszystkich lat.
Wina, które są też na stronie (site/js/wines.js), łączy przeglądarka (site/js/wine-search.js), bo ma oba zbiory naraz.
Tylko biblioteka standardowa:  python tools/build-wine-index.py
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'docs' / 'salon-vin'
OUT = ROOT / 'site' / 'js' / 'wine-index.js'
YEARS = (2026, 2025, 2024)  # najnowszy pierwszy: jego dane wygrywają przy powtórzeniach
SILVER_SUBREGION = 'Znojemská'


def num(v):
    """'12.5' -> 12.5, '' / None / tekst -> None."""
    try:
        return float(str(v).replace(',', '.'))
    except (TypeError, ValueError):
        return None


def clean(v):
    return str(v).strip() if v not in (None, '') else ''


def main():
    recs = {}
    for year in YEARS:
        data = json.loads((SRC / f'salon-vin-{year}.json').read_text(encoding='utf-8'))
        rows = [(w, 'G') for w in data['gold']] + \
               [(w, 'S') for w in data['silver'] if w.get('subregion') == SILVER_SUBREGION]
        for w, medal in rows:
            wid = w['wine_id']
            medal_row = [year, medal, num(w.get('points'))] + ([int(w['nr'])] if medal == 'G' and w.get('nr') else [])
            if wid in recs:
                recs[wid]['m'].append(medal_row)
                continue
            r = {
                'id': 'salon:' + wid,
                'n': clean(w.get('wine_label') or w.get('wine')),   # nazwa z karty (z nazwą międzynarodową) albo z arkusza
                'w': clean(w.get('wine')),                          # nazwa handlowa z arkusza
                'p': clean(w.get('producer')),
                'pid': w.get('producer_id', ''),
                't': clean(w.get('producer_town')),
                'sub': clean(w.get('subregion')),
                'v': clean(w.get('village')),
                'vy': clean(w.get('vineyard')),
                'r': clean(w.get('vintage')),
                'q': clean(w.get('quality_full') or w.get('quality')),
                'c': clean(w.get('category')),
                'b': clean(w.get('batch')),
                's': num(w.get('sugar_gl')),
                'a': num(w.get('acid_gl')),
                'al': num(w.get('alcohol_pct')),
                'dw': clean(w.get('drink_window')),
                'd': clean(w.get('description')),
                'u': clean(w.get('url')),
                'e': clean(w.get('eshop_url')),
                'm': [medal_row],
            }
            recs[wid] = {k: v for k, v in r.items() if v not in ('', None)}
    out = list(recs.values())
    for r in out:
        r['m'].sort(key=lambda m: -m[0])
        r['best'] = max((m[2] or 0) for m in r['m'])
    out.sort(key=lambda r: (-r['best'], r['p'], r['n']))
    gold = sum(1 for r in out if any(m[1] == 'G' for m in r['m']))
    payload = {
        'source': 'docs/salon-vin/salon-vin-2024..2026.json',
        'scope': 'złote wina + srebrne z podobszaru znojemskiego',
        'count': len(out), 'withGold': gold, 'wines': out,
    }
    OUT.write_text('/* Wygenerowane przez tools/build-wine-index.py — nie edytuj ręcznie. */\n'
                   'window.WINE_INDEX = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n',
                   encoding='utf-8')
    print(f'{OUT.relative_to(ROOT)}: {len(out)} win ({gold} ze złotym medalem), {OUT.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
