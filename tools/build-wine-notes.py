"""Opisy smakowe ze źródeł dla win bez profilu Salonu vín -> site/js/wine-notes.js.

Wejście: docs/wina-opisy/opisy-win.json (tworzy go tools/wina-opisy/build.py, opis pól w docs/wina-opisy/README.md).
Na stronę trafiają tylko wina bez wykresu Salonu (has_salon_profile = false):
  - groups: grupy aromatów ze słów w opisach własnego rocznika (obecność, nie natężenie),
  - est:    grupy tylko z szacunkowego opisu Vínovín (sklep sam pisze, że to „odhad”, nie degustacja),
  - quotes: zdania o smaku i zapachu, dosłownie po czesku; bez zdań-szablonów sklepu, bez podawania i potraw,
            bez niepotwierdzonych cytatów; szacunki Vínovín oznaczone,
  - other:  opis tego samego wina z innego rocznika (tylko gdy brak własnego).
Tylko biblioteka standardowa:  python tools/build-wine-notes.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'docs' / 'wina-opisy' / 'opisy-win.json'
OUT = ROOT / 'site' / 'js' / 'wine-notes.js'

# Grupy z metodyki Salonu vín, nazwy jak w site/js/aroma.js (kolejność jak na wykresie Salonu).
GROUPS = [
    ('květnaté', 'kwiatowe'), ('tropické ovoce', 'owoce tropikalne'), ('citrusové ovoce', 'cytrusy'),
    ('jádrové ovoce', 'owoce ziarnkowe'), ('peckové ovoce', 'owoce pestkowe'), ('drobné ovoce', 'drobne owoce'),
    ('sušené a vařené ovoce', 'owoce suszone i gotowane'), ('karamelizované', 'karmelowe'), ('bylinné', 'ziołowe'),
    ('kořenité', 'korzenne'), ('dřevo / barrique', 'beczka'), ('autolyzátové / mléčne', 'drożdżowe i mleczne'),
    ('mineralne', 'mineralne'), ('zwierzęce / ziemiste', 'zwierzęce i ziemiste'),
]
PL = dict(GROUPS)
ORDER = [cz for cz, _ in GROUPS]

# Zdania o podawaniu, potrawach, alkoholu i cukrze, które nie mówią nic o smaku.
SKIP = re.compile(r'hodí se|doporuč|teplot|podáv|servír|pokrm|párov|k jídl|ke grilov|sýr|ryb|drůbe|těstovin|zákazník|'
                  r'milovník|alkohol \d|g/l|% obj|vegan|potenciál|archiv', re.I)
# Zdania o smaku i zapachu (jak TASTE w tools/wina-opisy/build.py, plus nazwy owoców i przypraw).
TASTE = re.compile(r'vůn|chuť|chuti|aroma|tón|dochu|ovoc|minerál|kyselin|buket|na patře|pepř|kořen|broskv|meruň|citrus|'
                   r'jablk|hrušk|ananas|mang|liči|ryngl|višn|třešn|švestk|květ|bylin|med|perník|kakao|káv|vanilk|dub|'
                   r'zemit|slan|kamenit|textur|tříslo|tanin|krém|petrolej|jazyk', re.I)
MAX_QUOTE = 320  # znaków na źródło; dłuższe opisy są ucinane na całym zdaniu
MAX_SOURCES = 2  # reszta źródeł jest w docs/wina-opisy/opisy-win.json


def sentences(t):
    t = re.sub(r'(?<=[a-zá-ž]\.)(?=[A-ZÁ-Ž])', ' ', t)   # „nabídky.Ve vůni” w opisach sklepów
    return [x.strip() for x in re.split(r'(?<=[.!?])\s+', t) if x.strip()]


def words(t):
    return {x.lower() for x in re.findall(r'\w{4,}', t)}


def groups(d):
    return [PL[g] for g in ORDER if g in (d or {})]


def source_label(s):
    lab = s['source']
    lab = re.sub(r'^strona: ', '', lab)
    if lab.startswith('Karta wina') or lab.startswith('Gotberg'):
        lab = 'producent'
    return lab


def quote_text(s, generic, shown):
    out, n = [], 0
    for note in s['notes']:
        for x in sentences(note):
            if x in generic or SKIP.search(x) or not TASTE.search(x):
                continue
            wx = words(x)
            if len(wx & shown) >= .5 * len(wx):  # to samo zdanie (albo prawie) już było w tym lub wcześniejszym źródle
                continue
            shown |= wx
            if n + len(x) > MAX_QUOTE and out:
                return ' '.join(out) + ' […]'
            out.append(x)
            n += len(x) + 1
    return ' '.join(out)


def main():
    data = json.loads(SRC.read_text(encoding='utf-8'))
    res = {}
    for wid, w in data['wines'].items():
        if w['has_salon_profile']:
            continue
        quotes, shown, est_src = [], set(), None
        for s in w['sources']:
            if not s['notes'] or s.get('quote_confirmed') is False:
                continue
            if s.get('estimated'):      # szacunek sklepu: bez cytatu, tylko link przy grupach z szacunku
                est_src = est_src or s['url']
                continue
            if len(quotes) == MAX_SOURCES:
                continue
            q = quote_text(s, set(s.get('generic_sentences', [])), shown)
            if len(q) < 25:             # nic nowego względem wcześniejszego źródła
                continue
            e = {'src': source_label(s), 'url': s['url'], 'q': q}
            if s.get('remark'):
                e['remark'] = s['remark']
            quotes.append(e)
        r = {'groups': groups(w.get('aroma_groups_from_text')), 'quotes': quotes}
        est = [g for g in groups(w.get('aroma_groups_estimated_only')) if g not in r['groups']]
        if est:
            r['est'] = est
            r['estUrl'] = est_src
        o = w.get('other_vintage')
        if o and o.get('notes'):
            r['other'] = {'year': o['vintage'], 'src': o['source'], 'url': o['url'],
                          'q': ' '.join(o['notes']), 'groups': groups(o.get('aroma_groups'))}
        res[wid] = r
    body = json.dumps(res, ensure_ascii=False, indent=1)
    OUT.write_text('/* Wygenerowane przez tools/build-wine-notes.py z docs/wina-opisy/opisy-win.json (' + data['generated'] +
                   ') — nie edytuj ręcznie.\n   Słowne opisy win bez profilu Salonu vín: grupy aromatów oznaczają obecność słowa, nie natężenie. */\n'
                   'window.WINE_NOTES = ' + body + ';\n', encoding='utf-8', newline='\n')
    n_g = sum(1 for r in res.values() if r['groups'])
    n_q = sum(1 for r in res.values() if r['quotes'] or r.get('other'))
    print(f'{len(res)} win bez profilu; z grupami: {n_g}; z jakimkolwiek cytatem: {n_q} -> {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    sys.exit(main())
