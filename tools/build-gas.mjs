// Składa site/ w jeden plik HTML dla Google Apps Script: CSS, JS i obrazy wklejone do środka.
// Użycie: node tools/build-gas.mjs   →   gas/index.html
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const site = join(root, 'site');
const read = (p) => readFileSync(join(site, p), 'utf8');
const dataUri = (p) => {
  const ext = p.split('.').pop();
  const mime = { webp: 'image/webp', png: 'image/png', svg: 'image/svg+xml', jpg: 'image/jpeg', gpx: 'application/gpx+xml' }[ext];
  return `data:${mime};base64,${readFileSync(join(site, p)).toString('base64')}`;
};
const inlineImages = (text) => text.replace(/(["'])((?:img|trasy)\/[\w./-]+\.(?:webp|png|svg|jpg|gpx))\1/g, (_, q, p) => q + dataUri(p) + q);

let html = read('index.html');

// GAS ignoruje <meta>, <title> i favicon z HTML (ustawia je Code.gs) — usuwamy, żeby nie mylić.
html = html
  .replace(/<meta name="viewport"[^>]*>\n?/, '')
  .replace(/<meta name="theme-color"[^>]*>\n?/, '')
  .replace(/<meta name="robots"[^>]*>\n?/, '')
  .replace(/<link rel="(icon|apple-touch-icon|manifest)"[^>]*>\n?/g, '');

// tel: i mailto: w ramce GAS muszą otwierać się poza ramką.
html = html.replace('<meta charset="utf-8">', '<meta charset="utf-8">\n<base target="_top">');

html = html.replace('<link rel="stylesheet" href="css/style.css">', () => `<style>\n${read('css/style.css')}\n</style>`);
html = html.replace('<script src="js/data.js"></script>', () => `<script>window.__GAS__ = true;</script>\n<script>\n${inlineImages(read('js/data.js'))}\n</script>`);
html = html.replace('<script src="js/wines.js"></script>', () => `<script>
${read('js/wines.js')}
</script>`);
html = html.replace('<script src="js/wine-media.js"></script>', () => `<script>
${inlineImages(read('js/wine-media.js'))}
</script>`);
html = html.replace('<script src="js/wine-map.js"></script>', () => `<script>\n${inlineImages(read('js/wine-map.js'))}\n</script>`);
html = html.replace('<script src="js/aroma.js"></script>', () => `<script>\n${read('js/aroma.js')}\n</script>`);
html = html.replace('<script src="js/venue-media.js"></script>', () => `<script>\n${inlineImages(read('js/venue-media.js'))}\n</script>`);
html = html.replace('<script src="js/routes.js"></script>', () => `<script>\n${inlineImages(read('js/routes.js'))}\n</script>`);
html = html.replace('<script src="js/route-maps.js"></script>', () => `<script>
${inlineImages(read('js/route-maps.js'))}
</script>`);
html = html.replace('<script src="js/app.js"></script>', () => `<script>\n${read('js/app.js')}\n</script>`);

if (/(src|href)="(css|js|img|trasy)\//.test(html) || /["']trasy\/[\w.-]+\.gpx["']/.test(html)) throw new Error('Zostały względne ścieżki do plików — GAS ich nie obsłuży.');

mkdirSync(join(root, 'gas'), { recursive: true });
writeFileSync(join(root, 'gas', 'index.html'), html);
console.log(`gas/index.html: ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB`);
