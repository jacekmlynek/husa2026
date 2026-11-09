"""Audit merged salon-vin JSON: duplicates, producer-name variants, xlsx vs pdf conflicts, text artifacts."""
import json, re, sys, unicodedata
from collections import defaultdict
from pathlib import Path

d_dir, out = Path(sys.argv[1]), Path(sys.argv[2])
D = {int(p.stem[-4:]): json.loads(p.read_text(encoding='utf-8')) for p in sorted(d_dir.glob('salon-vin-*.json'))}
o = open(out, 'w', encoding='utf-8')
W = lambda *a: o.write(' '.join(str(x) for x in a) + '\n')


def key(s):
    s = unicodedata.normalize('NFKD', str(s or '')).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '', s)


def pkey(s):
    k = key(s)
    for suf in ('spolsro', 'sro', 'as', 'spol', 'vinarstvi', 'vino', 'rodinne'):
        k = k.replace(suf, '')
    return k


W('== 1. Duplicates within a year (same producer+wine+vintage+quality) ==')
for y, d in D.items():
    for medal in ('gold', 'silver'):
        seen = defaultdict(list)
        for i, r in enumerate(d[medal]):
            seen[(r.get('producer_id'), key(r.get('wine')), r.get('vintage'), key(r.get('quality')))].append(r)
        for k, v in seen.items():
            if len(v) > 1:
                W(y, medal, len(v), '|', v[0].get('producer'), '|', v[0].get('wine'), v[0].get('vintage'), v[0].get('quality'),
                  '| batches', [x.get('batch') for x in v], 'pts', [x.get('points') for x in v])
    # gold vs silver same batch
    gb = {(r.get('producer_id'), str(r.get('batch'))) for r in d['gold'] if r.get('batch')}
    for r in d['silver']:
        if (r.get('producer_id'), str(r.get('batch'))) in gb:
            W(y, 'GOLD+SILVER same batch:', r.get('producer'), r.get('wine'), r.get('batch'))

W('\n== 2. Producer name variants (same normalized key, different spelling) ==')
names = defaultdict(set)
for y, d in D.items():
    for medal in ('gold', 'silver'):
        for r in d[medal]:
            names[r.get('producer_id')].add(r.get('producer'))
    for p in d.get('producers', []):
        names[p.get('producer_id')].add(p.get('name'))
for k, v in sorted(names.items()):
    if len(v) > 1: W(k, '->', sorted(v))

W('\n== 3. Same wine across years (repeat entries) ==')
acc = defaultdict(list)
for y, d in D.items():
    for medal in ('gold', 'silver'):
        for r in d[medal]:
            acc[(r.get('producer_id'), key(r.get('wine'))[:14], r.get('vintage'), str(r.get('batch') or ''))].append((y, medal, r.get('points')))
n = 0
for k, v in acc.items():
    if len({x[0] for x in v}) > 1:
        n += 1; W(k, v)
W('repeat count', n)

W('\n== 4. Text artifacts ==')
for y, d in D.items():
    for medal in ('gold', 'silver'):
        for r in d[medal]:
            for f in ('wine', 'wine_label', 'producer', 'description', 'awards', 'vineyard', 'village'):
                v = r.get(f)
                if not isinstance(v, str): continue
                if re.search(r'\w-\s?\w', v) and re.search(r'(po-doblast|pod-oblast|[a-zá-ž]- [a-zá-ž])', v) or '  ' in v or v != v.strip() or ' ,' in v:
                    W(y, medal, r.get('nr', ''), f, repr(v[:120]))

W('\n== 5. Value sanity ==')
for y, d in D.items():
    for medal in ('gold', 'silver'):
        for r in d[medal]:
            pts = r.get('points')
            if pts is not None and not (80 <= pts <= 100): W(y, medal, 'points?', r.get('producer'), r.get('wine'), pts)
            for f, lo, hi in (('sugar_gl', 0, 400), ('acid_gl', 3, 15), ('alcohol_pct', 5, 17), ('extract_gl', 15, 80), ('must_nm', 15, 50)):
                v = r.get(f)
                if isinstance(v, (int, float)) and not (lo <= v <= hi): W(y, medal, f, v, r.get('producer'), r.get('wine'))
                if v is not None and not isinstance(v, (int, float)): W(y, medal, f, 'non-numeric', repr(v), r.get('producer'))
            if not r.get('vintage'): W(y, medal, 'no vintage', r)
o.close()
