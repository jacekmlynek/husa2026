/*
 * Testy wyszukiwarki win (spec: punkt 7). Uruchamianie:
 *   - w przeglądarce: otwórz testy.html (także z dysku, przez file://),
 *   - w Node:        node specs/wyszukiwanie-tekstowe/testy.js
 * Oczekiwania są po identyfikatorach win. Liczby (liczba, maks) to stan danych z 10 XI 2026: po zmianie wines.js
 * albo zakresu Salonu trzeba je przejrzeć, identyfikatory zwykle zostają.
 */
(function (root) {
  'use strict';

  // Faza 1: tylko 56 win ze strony.
  var FAZA1 = [
    // przypadki zaproponowane 10 XI
    { q: 'Špalek', liczba: 3, ma: ['spalek-velky-sud-2023', 'spalek-vz-2025', 'spalek-gryllus-2025'], nieMa: ['stepanek-sz-2023'] },
    { q: 'spalek', liczba: 3, ma: ['spalek-velky-sud-2023', 'spalek-vz-2025', 'spalek-gryllus-2025'], nieMa: ['stepanek-sz-2023'] },
    { q: 'SPÁLEK', liczba: 3 },
    { q: 'spalke', liczba: 3, tryb: 'przestawka' },
    { q: 'rynsky', liczba: 10, ma: ['halkoci-typik-2025'], nieMa: ['waldberg-rv-2024', 'cervinka-rv-2022'] },
    { q: 'rizling', liczba: 12, ma: ['hnanice-rr-2025', 'waldberg-rv-2024', 'halkoci-typik-2025'], kategorie: ['odmiana:Ryzlink rýnský', 'odmiana:Ryzlink vlašský'] },
    { q: 'kravi', liczba: 3 },
    { q: 'kravi hora', liczba: 3 },
    { q: 'sobes', liczba: 2, ma: ['znovin-sobes-2025', 'znovin-sobes-2024'] },
    { q: 'petnat', liczba: 1, ma: ['korinek-petnat-2025'] },
    { q: 'pet nat', liczba: 1, ma: ['korinek-petnat-2025'] },
    { q: '2019', liczba: 1, ma: ['dobra-qvevri-2019'], nieMa: ['bv-merlot-2018'] },
    { q: 'znovim sauvignon', liczba: 1, pierwszy: ['znovin-sb-2025'] },
    { q: 'vin', maks: 25 },
    // pozostałe
    { q: 'ryzlink', liczba: 12, kategorie: ['odmiana:Ryzlink rýnský', 'odmiana:Ryzlink vlašský'] },
    { q: 'riesling', ma: ['hnanice-rr-2025', 'halkoci-typik-2025', 'korinek-petnat-2025'], nieMa: ['waldberg-rv-2024', 'cervinka-rv-2022'], kategoria: 'odmiana:Ryzlink rýnský' },
    { q: 'gruner', ma: ['hnanice-vz-2025', 'halkoci-vz2-2024'], nieMa: ['lahofer-vcr-2024'], kategoria: 'odmiana:Veltlínské zelené' },
    { q: 'vetliner', ma: ['hnanice-vz-2025'], kategorie: ['odmiana:Veltlínské zelené'] },
    { q: 'veltlinkse', ma: ['hnanice-vz-2025', 'lahofer-vcr-2024'] },
    { q: 'veltlin', ma: ['halkoci-vz2-2024', 'hnanice-vz-2025'] },
    { q: 'hna', pierwszy: ['hnanice-rr-2025', 'hnanice-vz-2025', 'hnanice-sb-2025'], ma: ['korinek-vz-2023'] },
    { q: 'satov', ma: ['halkoci-typik-2025', 'znovin-sobes-2025'] },
    { q: 'czerwone', ma: ['oulehla-fr-2022', 'thaya-zw-2023', 'bv-merlot-2018'], nieMa: ['hnanice-rr-2025'] },
    { q: 'musujace', liczba: 2, ma: ['korinek-petnat-2025', 'dobra-creme-2022'] },
    { q: 'frankovka 2023', ma: ['placek-fr-2023', 'kubik-fr-2023', 'oulehla-fr-2023', 'valtice-fr-2023'], nieMa: ['oulehla-fr-2022'] },
    { q: 'pinot noir', liczba: 1, ma: ['waldberg-rm-2021'], bezKategorii: true },
    { q: 'zweigelt', ma: ['thaya-zw-2023'] },
    { q: 'Piálek & Jäger', ma: ['pialek-sb-2025'], kategoria: 'winiarnia:site:pialek' },
    { q: 'znovin', liczba: 5, kategoria: 'winiarnia:site:znovin' },
    { q: 'spalek ryzlink', liczba: 1, ma: ['spalek-velky-sud-2023'] },
    { q: 'mikulov', liczba: 4, ma: ['davinus-sommelier-2022', 'gotberg-palava-2024', 'cervinka-rv-2022', 'bv-merlot-2018'], kategoria: 'region:Mikulov' },
    { q: 'znojmo', liczba: 47, kategoria: 'region:Znojmo', nieMa: ['davinus-sommelier-2022'] },
    { q: 'ze znojma', liczba: 47, kategoria: 'region:Znojmo' },
    { q: 'znojemsko', liczba: 47, kategoria: 'region:Znojmo' },
    { q: 'velkopavlovicko', liczba: 3, kategoria: 'region:Pavlovice' },
    { q: 'palava', ma: ['gotberg-palava-2024', 'halkoci-supa-2025', 'cervinka-rv-2022'], kategorie: ['odmiana:Pálava', 'region:Mikulov'] },
    { q: 'z', liczba: 0, tryb: 'za-krotkie' },
    { q: '   ', liczba: 0, tryb: 'za-krotkie' },
    { q: 'xqzt', liczba: 0, tryb: 'brak' }
  ];

  // Faza 2: strona + Salon vín (złote + srebrne ze Znojemska).
  var FAZA2 = [
    { q: 'spalek', ma: ['spalek-velky-sud-2023'], nieMaId: /\|2023\|1723$/ },               // Velký Sud tylko raz (rekord ze strony)
    { q: 'chardonnay lampelberg', liczba: 1, ma: ['waldberg-ch-2022'] },                       // duplikat z Salonu 2026 pominięty
    { q: 'ryzlink', minimum: 60, kategorie: ['odmiana:Ryzlink rýnský', 'odmiana:Ryzlink vlašský'], stronaNajpierw: 12 },
    { q: 'znojmo', minimum: 150, kategoria: 'region:Znojmo', kategorie: ['winiarnia:site:znovin'] },
    { q: 'znovin', kategoria: 'winiarnia:site:znovin', minimum: 20 },                           // „ZNOVÍN ZNOJMO, a.s.” scalony ze stroną
    { q: 'hnanice', kategorie: ['winiarnia:site:hnanice', 'miejsce:hnanice'], bezKategoriiTypu: 'winiarnia:salon:' },
    { q: 'kravi hora', kategoria: 'miejsce:kravi hora', ma: ['spalek-velky-sud-2023'] },
    { q: 'satov', kategoria: 'miejsce:satov' },
    { q: 'pinot noir', kategoria: 'odmiana:Rulandské modré', ma: ['waldberg-rm-2021'] },
    { q: 'cabernet', kategorie: ['odmiana:Cabernet Sauvignon'] },
    { q: 'xqzt', liczba: 0, tryb: 'brak' }
  ];

  function siteFirst(res) {
    var seenSalon = false;
    return res.wines.every(function (w) { if (w.src === 'salon') seenSalon = true; return !(seenSalon && w.src === 'site'); });
  }

  function check(engine, t) {
    var r = engine.search(t.q), ids = r.wines.map(function (w) { return w.id; }), e = [];
    var catIds = r.cats.map(function (c) { return c.id; });
    if (t.tryb && r.mode !== t.tryb) e.push('tryb ' + r.mode + ' zamiast ' + t.tryb);
    if (t.liczba != null && ids.length !== t.liczba) e.push('liczba ' + ids.length + ' zamiast ' + t.liczba);
    if (t.maks != null && ids.length > t.maks) e.push('za dużo: ' + ids.length + ' (maks. ' + t.maks + ')');
    if (t.minimum != null && ids.length < t.minimum) e.push('za mało: ' + ids.length + ' (min. ' + t.minimum + ')');
    if (t.pierwszy && t.pierwszy.indexOf(ids[0]) < 0) e.push('pierwszy ' + ids[0]);
    (t.ma || []).forEach(function (id) { if (ids.indexOf(id) < 0) e.push('brak ' + id); });
    (t.nieMa || []).forEach(function (id) { if (ids.indexOf(id) >= 0) e.push('niechciany ' + id); });
    if (t.nieMaId && ids.some(function (id) { return t.nieMaId.test(id); })) e.push('duplikat z Salonu');
    if (t.kategoria && catIds[0] !== t.kategoria) e.push('pierwsza kategoria ' + (catIds[0] || '—'));
    (t.kategorie || []).forEach(function (c) { if (catIds.indexOf(c) < 0) e.push('brak kategorii ' + c); });
    if (t.bezKategorii && catIds.length) e.push('niepotrzebna kategoria ' + catIds[0]);
    if (t.bezKategoriiTypu && catIds.some(function (c) { return c.indexOf(t.bezKategoriiTypu) === 0; })) e.push('kategoria ' + t.bezKategoriiTypu + ' (nie scalona)');
    if (t.stronaNajpierw && ids.slice(0, t.stronaNajpierw).some(function (id) { return /^salon:/.test(id); }) && !siteFirst(r)) e.push('wina ze strony nie są przed Salonem');
    return { q: t.q, ok: !e.length, errors: e, n: ids.length, mode: r.mode, cats: r.cats.slice(0, 3).map(function (c) { return c.label + ' · ' + c.ids.length; }) };
  }

  // Testy danych (punkt 7.2).
  function dataTests(WS, WINES, ALL) {
    var out = [];
    var noGrape = Object.keys(WINES.wines).filter(function (id) {
      var w = WINES.wines[id];
      return w.grape === undefined ? !WS.grapeFromName(w.name) : (w.grape !== null && !WS.GRAPES[w.grape]);
    });
    out.push({ q: 'dane: każde wino ma odmianę ze słownika albo grape: null', ok: !noGrape.length, errors: noGrape });
    var regs = {};
    Object.keys(WINES.wines).forEach(function (id) { var w = WINES.wines[id]; regs[w.region || (WINES.producers[w.p] || {}).region] = 1; });
    var noAlias = Object.keys(regs).filter(function (r) { return r && !WS.REGIONS[r]; });
    out.push({ q: 'dane: każdy region ma aliasy', ok: !noAlias.length, errors: noAlias });
    var used = [];
    FAZA1.concat(FAZA2).forEach(function (t) { used = used.concat(t.ma || [], t.nieMa || [], t.pierwszy || []); });
    var missing = used.filter(function (id) { return !WINES.wines[id]; });
    out.push({ q: 'dane: identyfikatory z testów istnieją', ok: !missing.length, errors: missing });
    if (ALL) {
      var ids = {}, dupIds = ALL.filter(function (d) { if (ids[d.id]) return true; ids[d.id] = 1; return false; }).map(function (d) { return d.id; });
      out.push({ q: 'dane: brak powtórzonych identyfikatorów (strona + Salon)', ok: !dupIds.length, errors: dupIds });
    }
    return out;
  }

  function timing(engine, queries) {
    var t0 = Date.now(), n = 0, worst = 0;
    queries.forEach(function (q) {
      for (var i = 2; i <= q.length; i++) { var a = Date.now(); engine.search(q.slice(0, i)); worst = Math.max(worst, Date.now() - a); n++; }
    });
    return { n: n, avg: (Date.now() - t0) / n, worst: worst };
  }

  function run(env) {
    var WS = env.WineSearch, site = WS.fromSite(env.WINES);
    var e1 = WS.create(site);
    var res = { faza1: FAZA1.map(function (t) { return check(e1, t); }) };
    var all = null;
    if (env.WINE_INDEX) {
      var sal = WS.fromSalon(env.WINE_INDEX, site, site.length);
      all = site.concat(sal);
      var e2 = WS.create(all);
      res.faza2 = FAZA2.map(function (t) { return check(e2, t); });
      res.salon = { wina: sal.length, duplikaty: sal.dup };
      // Regresje z review 11 XI: partia jest unikalna tylko u producenta; „Ing. František Zapletal” ≠ „Vinné sklepy Zapletal”.
      var byProd = function (re) { return sal.filter(function (d) { return re.test(env.WINE_INDEX.wines.filter(function (r) { return r.id === d.id; })[0].p); }); };
      var manak = byProd(/Maňák/).filter(function (d) { return / 2250\b/.test(d.meta); });
      var zap = byProd(/František Zapletal/);
      res.faza2.push({ q: 'dane: wino Maňáka z partią 2250 nie jest brane za duplikat Oulehli', ok: manak.length === 1, errors: manak.length ? [] : ['brak w indeksie'], n: manak.length, mode: '' });
      res.faza2.push({ q: 'dane: „Ing. František Zapletal” to osobna winiarnia', ok: zap.length > 0 && zap.every(function (d) { return d.pid.indexOf('salon:') === 0; }), errors: zap.map(function (d) { return d.pid; }), n: zap.length, mode: '' });
      res.faza2.push({ q: 'dane: napis „ponad 400 medalistów Salonu” jest prawdziwy', ok: sal.length > 400, errors: ['jest ' + sal.length], n: sal.length, mode: '' });
      res.faza2.push({ q: 'dane: duplikaty strona–Salon to dokładnie 14 win', ok: sal.dup === 14, errors: ['jest ' + sal.dup], n: sal.dup, mode: '' });
      res.czas = timing(e2, ['znojmo', 'ryzlink rynsky', 'veltlinske zelene', 'frankovka 2022', 'kravi hora', 'spalek', 'cabernet']);
    }
    res.dane = dataTests(WS, env.WINES, all);
    return res;
  }

  root.WINE_SEARCH_TESTS = { FAZA1: FAZA1, FAZA2: FAZA2, run: run };

  // Node: node specs/wyszukiwanie-tekstowe/testy.js
  if (typeof module !== 'undefined' && module.exports && typeof require === 'function' && require.main === module) {
    var path = require('path'), site = path.join(__dirname, '..', '..', 'site');
    global.window = global;
    global.MiniSearch = require(path.join(site, 'vendor', 'minisearch', 'minisearch.min.js'));
    require(path.join(site, 'js', 'wines.js')); require(path.join(site, 'js', 'wine-index.js')); require(path.join(site, 'js', 'wine-search.js'));
    var r = run({ WineSearch: global.WineSearch, WINES: global.WINES, WINE_INDEX: global.WINE_INDEX });
    var fail = 0;
    ['faza1', 'faza2', 'dane'].forEach(function (k) {
      if (!r[k]) return;
      console.log('\n== ' + k);
      r[k].forEach(function (x) {
        if (!x.ok) fail++;
        console.log((x.ok ? 'ok   ' : 'FAIL ') + x.q + (x.n != null ? '  (' + x.n + ', ' + x.mode + ')' : '') + (x.ok ? '' : '  → ' + x.errors.join('; ')));
      });
    });
    if (r.salon) console.log('\nSalon: ' + r.salon.wina + ' win, pominięte duplikaty ze strony: ' + r.salon.duplikaty);
    if (r.czas) console.log('Czas: ' + r.czas.n + ' zapytań, średnio ' + r.czas.avg.toFixed(2) + ' ms, najgorsze ' + r.czas.worst + ' ms');
    console.log(fail ? '\n' + fail + ' błędów' : '\nwszystko ok');
    process.exitCode = fail ? 1 : 0;
  }
})(typeof window !== 'undefined' ? window : this);
