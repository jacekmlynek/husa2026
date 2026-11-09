// Z plików GPX w docs/trasy robi: site/trasy/<id>.gpx (kopie do pobrania)
// oraz site/js/routes.js (statystyki, kształt trasy i profil wysokości jako ścieżki SVG).
// Użycie: node tools/build-routes.mjs
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// id trasy → plik źródłowy w docs/trasy
const SOURCES = {
  'zamek-park': 'znojmo-zamek-kamien-park-altana.gpx',
  'kraluv-stolec': 'znojmo Studentská-Vyhlídka Králův stolec.gpx',
  'saldorf': 'znojmo-saldrov-10k.gpx',
  'cizov-hardegg': 'znojmo Parkoviště Čížov Zamek Hardegg nad Dyją.gpx'
};

const W = 320, H = 200, PH = 64, PAD = 12;

function parse(xml) {
  const re = /<trkpt lat="([\d.]+)" lon="([\d.]+)">\s*<ele>([\d.-]+)<\/ele>/g;
  const pts = [];
  let m;
  while ((m = re.exec(xml))) pts.push({ lat: +m[1], lon: +m[2], ele: +m[3] });
  return pts;
}
function dist(a, b) {
  const R = 6371000, r = Math.PI / 180;
  const dp = (b.lat - a.lat) * r, dl = (b.lon - a.lon) * r;
  const h = Math.sin(dp / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
// Douglas–Peucker na punktach 2D
function simplify(p, tol) {
  if (p.length < 3) return p;
  const keep = new Uint8Array(p.length); keep[0] = keep[p.length - 1] = 1;
  const stack = [[0, p.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let max = 0, idx = -1;
    const [x1, y1] = p[a], [x2, y2] = p[b];
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1e-9;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * p[i][0] - dx * p[i][1] + x2 * y1 - y2 * x1) / len;
      if (d > max) { max = d; idx = i; }
    }
    if (max > tol) { keep[idx] = 1; stack.push([a, idx], [idx, b]); }
  }
  return p.filter((_, i) => keep[i]);
}
const f1 = (n) => Math.round(n * 10) / 10;
const pathOf = (pts) => pts.map(([x, y], i) => (i ? 'L' : 'M') + f1(x) + ' ' + f1(y)).join('');

const out = {};
mkdirSync(join(root, 'site', 'trasy'), { recursive: true });

for (const [id, file] of Object.entries(SOURCES)) {
  const src = join(root, 'docs', 'trasy', file);
  const pts = parse(readFileSync(src, 'utf8'));
  copyFileSync(src, join(root, 'site', 'trasy', id + '.gpx'));

  // dystans i przewyższenia (próg 3 m odcina szum wysokości)
  let km = 0, up = 0, down = 0, ref = pts[0].ele;
  const cum = [0];
  for (let i = 1; i < pts.length; i++) {
    km += dist(pts[i - 1], pts[i]);
    cum.push(km);
    const e = pts[i].ele;
    if (e - ref >= 3) { up += e - ref; ref = e; } else if (ref - e >= 3) { down += ref - e; ref = e; }
  }
  const eles = pts.map((p) => p.ele);
  const minE = Math.min(...eles), maxE = Math.max(...eles);

  // kształt trasy: rzut równoodległościowy, północ u góry, dopasowanie do W×H
  const lat0 = pts[0].lat * Math.PI / 180;
  const xy = pts.map((p) => [p.lon * Math.cos(lat0), -p.lat]);
  const xs = xy.map((p) => p[0]), ys = xy.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
  const s = Math.min((W - 2 * PAD) / (maxX - minX || 1), (H - 2 * PAD) / (maxY - minY || 1));
  const offX = (W - (maxX - minX) * s) / 2, offY = (H - (maxY - minY) * s) / 2;
  const scr = xy.map(([x, y]) => [offX + (x - minX) * s, offY + (y - minY) * s]);
  const shape = simplify(scr, 0.6);

  // profil wysokości: dystans → wysokość
  const prof = pts.map((p, i) => [PAD / 2 + (cum[i] / km) * (W - PAD), PH - 4 - ((p.ele - minE) / (maxE - minE || 1)) * (PH - 12)]);
  const profS = simplify(prof, 0.4);

  // Środek i powiększenie mapy Mapy.com tak, żeby cała trasa mieściła się w ramce telefonu (~300×225 px).
  const lats = pts.map((p) => p.lat), lons = pts.map((p) => p.lon);
  const cLat = (Math.min(...lats) + Math.max(...lats)) / 2, cLon = (Math.min(...lons) + Math.max(...lons)) / 2;
  const spanX = dist({ lat: cLat, lon: Math.min(...lons) }, { lat: cLat, lon: Math.max(...lons) });
  const spanY = dist({ lat: Math.min(...lats), lon: cLon }, { lat: Math.max(...lats), lon: cLon });
  const mPerPx0 = 156543.03 * Math.cos(cLat * Math.PI / 180); // metrów na piksel przy z=0 (kafle 256 px)
  const fit = (span, px) => Math.log2(mPerPx0 * px / Math.max(span, 50));
  // +1: skala „z” w Mapy.com jest o jeden poziom przesunięta względem standardowych kafli 256 px (sprawdzone na zrzutach).
  const zoom = Math.floor((Math.min(fit(spanX, 300 * 0.72), fit(spanY, 225 * 0.62)) + 1) * 10) / 10;

  out[id] = {
    center: [Math.round(cLon * 1e6) / 1e6, Math.round(cLat * 1e6) / 1e6],
    zoom,
    km: Math.round(km / 100) / 10,
    up: Math.round(up / 5) * 5,
    down: Math.round(down / 5) * 5,
    minEle: Math.round(minE),
    maxEle: Math.round(maxE),
    hours: Math.round((km / 4000 + up / 600) * 4) / 4,
    loop: dist(pts[0], pts[pts.length - 1]) < 300,
    gpx: 'trasy/' + id + '.gpx',
    shape: pathOf(shape),
    start: scr[0].map(f1),
    end: scr[scr.length - 1].map(f1),
    profile: pathOf(profS),
    profileArea: pathOf(profS) + 'L' + f1(W - PAD / 2) + ' ' + PH + 'L' + f1(PAD / 2) + ' ' + PH + 'Z'
  };
  console.log(`${id}: ${out[id].km} km, ↑${out[id].up} m, ${shape.length} pkt kształtu, ${profS.length} pkt profilu`);
}

writeFileSync(join(root, 'site', 'js', 'routes.js'),
  '/* Wygenerowane przez tools/build-routes.mjs z docs/trasy/*.gpx — nie edytuj ręcznie. */\n' +
  'window.ROUTES = ' + JSON.stringify(out, null, 1) + ';\n');
console.log('site/js/routes.js zapisany');
