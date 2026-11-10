/*
 * Wyszukiwarka win: warstwa wokół MiniSearch (site/vendor/minisearch/).
 * Spec: specs/wyszukiwanie-tekstowe/DEVELOPMENT-PLAN.md (punkty 5.2–5.8).
 * Bez DOM i bez location: działa w app.js, w testach (specs/wyszukiwanie-tekstowe/testy.html) i w module zdjęć.
 */
(function () {
  'use strict';

  /* ---------- 5.2 Normalizacja ---------- */
  var MARKS = /\p{M}/gu; // znaki łączące po rozkładzie NFD (háček, čárka, kroužek, umlaut…)
  function norm(s) {
    return String(s == null ? '' : s).toLowerCase()
      .normalize('NFD').replace(MARKS, '')        // Špalek → spalek, rýnský → rynsky
      .replace(/ß/g, 'ss').replace(/²/g, '2')
      .replace(/y/g, 'i').replace(/w/g, 'v');      // ryzlink → rizlink, weltliner → veltliner
  }
  function tokenize(s) { return norm(s).split(/[^a-z0-9]+/).filter(Boolean); }
  var STOP = { z: 1, ze: 1, w: 1, we: 1, i: 1, a: 1, o: 1, na: 1, 'do': 1, od: 1, u: 1 };
  function cleanQuery(q) {
    var t = tokenize(String(q || '').replace(/[\r\n]+/g, ' '));
    var kept = t.filter(function (x) { return !STOP[norm(x)]; });
    return (kept.length ? kept : t).join(' ');
  }
  function isNum(t) { return /^\d+$/.test(t); }
  function fuzzyLimit(t) { return isNum(t) || t.length <= 3 ? 0 : (t.length <= 6 ? 1 : 2); }
  function looseLimit(t) { return isNum(t) || t.length <= 2 ? 0 : (t.length <= 5 ? 1 : 2); }
  function lev(a, b) {
    var prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      for (j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[b.length];
  }

  /* ---------- 5.4 Odmiany i synonimy (tylko odpowiedniki ze źródeł: ściąga w data.js, opisy w wines.js, wine_label z Salonu) ---------- */
  var GRAPES = {
    'Ryzlink rýnský': ['Riesling'],
    'Ryzlink vlašský': ['Welschriesling'],
    'Veltlínské zelené': ['Grüner Veltliner', 'Grüner', 'GV'],
    'Veltlínské červené rané': ['Frühroter Veltliner', 'Večerka'],
    'Sauvignon': ['Sauvignon blanc'],
    'Chardonnay': [],
    'Rulandské šedé': ['Pinot gris'],
    'Rulandské bílé': ['Pinot blanc'],
    'Rulandské modré': ['Pinot noir'],
    'Pálava': [],
    'Frankovka': ['Blaufränkisch'],
    'Tramín červený': ['Gewürztraminer', 'Gewürtztraminer', 'Traminer'],
    'Sylvánské zelené': ['Grüner Silvaner', 'Silvaner'],
    'Neuburské': ['Neuburger'],
    'Merlot': [],
    'Cabernet Sauvignon': [],
    'Cabernet Moravia': [],
    'Cabernet blanc': [],
    'Hibernal': [],
    'Zweigeltrebe': ['Zweigelt'],
    'Müller Thurgau': [],
    'Muškát moravský': [],
    'Muškát žlutý': ['Gelber Muskateller'],
    'Kerner': [],
    'André': [],
    'Alibernet': [],
    'Neronet': [],
    'Svatovavřinecké': ['Saint Laurent'],
    'Veritas': [],
    'Rotgipfler': []
  };
  // Do rozpoznawania odmiany z nazwy: najdłuższe wzorce najpierw („cabernet sauvignon” przed „sauvignon”). Bez krótkiego „GV”.
  var GRAPE_PATTERNS = [];
  Object.keys(GRAPES).forEach(function (g) {
    [g].concat(GRAPES[g]).forEach(function (n) { if (n.length > 3) GRAPE_PATTERNS.push({ p: ' ' + tokenize(n).join(' ') + ' ', g: g }); });
  });
  GRAPE_PATTERNS.sort(function (a, b) { return b.p.length - a.p.length; });
  function grapeFromName(name) {
    var n = ' ' + tokenize(name).join(' ') + ' ';
    for (var i = 0; i < GRAPE_PATTERNS.length; i++) if (n.indexOf(GRAPE_PATTERNS[i].p) >= 0) return GRAPE_PATTERNS[i].g;
    return null;
  }
  function grapeWords(g) { return g ? [g].concat(GRAPES[g] || []).join(' ') : ''; }

  /* ---------- 5.5 Regiony i aliasy ---------- */
  var REGIONS = {
    Znojmo: { label: 'Znojmo i okolice', aliases: ['Znojemsko', 'Znojemská'] },
    Mikulov: { label: 'Mikulov i Pálava', aliases: ['Mikulovská', 'Pálava'] },
    Pavlovice: { label: 'Velkopavlovicko', aliases: ['Velkopavlovicko', 'Velkopavlovická'] },
    Slovacko: { label: 'Slovácko', aliases: ['Slovácko', 'Slovácká'] },
    Valtice: { label: 'Valtice', aliases: ['Valticko'] },
    Melnik: { label: 'Mělnicko', aliases: ['Mělník', 'Mělnická'] },
    Litomerice: { label: 'Litoměřicko', aliases: ['Litoměřice', 'Litoměřická'] }
  };
  var SUBREGION = { 'Znojemská': 'Znojmo', 'Mikulovská': 'Mikulov', 'Velkopavlovická': 'Pavlovice', 'Slovácká': 'Slovacko', 'Mělnická': 'Melnik', 'Litoměřická': 'Litomerice' };
  function regionWords(key, extra) {
    var R = REGIONS[key];
    return [key].concat(R ? R.aliases : [], extra || []).join(' ');
  }

  /* ---------- 5.3 Dokumenty ---------- */
  // Wina ze strony: kolejność (rank) jak na stronie: Top 14, katalog, reszta.
  function fromSite(WN) {
    var order = [], seen = {};
    function add(id) { if (id && !seen[id] && WN.wines[id]) { seen[id] = 1; order.push(id); } }
    (WN.topZnojmo || []).forEach(add); (WN.alsoSalon || []).forEach(add); (WN.topMorava || []).forEach(add);
    (WN.catalog || []).forEach(function (c) { c.wines.forEach(add); });
    add(WN.bonus); Object.keys(WN.wines).forEach(add);
    return order.map(function (id, i) {
      var w = WN.wines[id], p = WN.producers[w.p] || {};
      var g = w.grape !== undefined ? w.grape : grapeFromName(w.name);
      var reg = w.region || p.region || '';
      return {
        id: id, src: 'site', rank: i, pts: w.pts || 0, qual: quality(w), grapeName: g, regionKey: reg, pid: 'site:' + w.p, prodName: p.name || '',
        year: String(w.year), links: (w.links || []).map(function (l) { return l.url; }).join(' '),
        compact: tokenize(w.name).join(''), name: w.name, prod: (p.name || '') + ' ' + tokenize(p.name).join(''),
        grape: grapeWords(g), origin: w.origin || '', place: p.place || '',
        region: regionWords(reg, p.label ? [p.label] : []), meta: w.year + ' ' + w.style
      };
    });
  }
  // Jakość do sortowania „od najlepszych”: Salon vín przed konkursem regionalnym, potem punkty (jak w Top 14 na stronie).
  function quality(w) {
    if (!w.pts) return 0;
    return (/Salon/.test((w.comp || '') + ' ' + (w.award || '')) ? 1000 : 500) + w.pts;
  }
  // Wina z Salonu (site/js/wine-index.js). Wina, które są też na stronie, pomijamy (punkt 8: jeden rekord, z id strony).
  // Producent z Salonu, który jest też na stronie („ZNOVÍN ZNOJMO, a.s.” = „Znovín Znojmo”), dostaje identyfikator ze strony,
  // żeby kategoria winiarni była jedna. Kolejność dowodów:
  //   1. to samo wino jest na stronie i w Salonie → ten producent Salonu (producer_id) to producent ze strony,
  //   2. bez takiego wina: wszystkie słowa nazwy ze strony muszą wystąpić w nazwie z Salonu.
  // Reguła 2 nie działa dla producenta ze strony, który ma już dowód z reguły 1: „Ing. František Zapletal” to inna firma
  // niż „Vinné sklepy Zapletal” (docs/salon-vin/README.md), choć oba mają w nazwie „Zapletal”.
  function fromSalon(WI, siteDocs, rankStart) {
    var dup = 0, out = [], siteProd = {}, bySalonPid = {};
    (siteDocs || []).forEach(function (d) { if (d.prodName) siteProd[d.pid] = { name: d.prodName, words: tokenize(d.prodName), salonPids: [] }; });
    var recs = (WI && WI.wines) || [];
    var isDup = recs.map(function (r) {
      var d = siteDocs ? sameAsSite(r, siteDocs) : null;
      if (d && siteProd[d.pid]) { siteProd[d.pid].salonPids.push(r.pid); bySalonPid[r.pid] = d.pid; }
      return !!d;
    });
    function prodMatch(r) {
      if (bySalonPid[r.pid]) return bySalonPid[r.pid];
      var ws = ' ' + tokenize(r.p).join(' ') + ' ';
      for (var pid in siteProd) {
        if (siteProd[pid].salonPids.length) continue; // ten producent ma już pewne dopasowanie
        if (siteProd[pid].words.every(function (w) { return ws.indexOf(' ' + w + ' ') >= 0; })) return pid;
      }
      return null;
    }
    recs.forEach(function (r, k) {
      if (isDup[k]) { dup++; return; }
      var g = grapeFromName(r.n) || grapeFromName(r.w);
      var reg = SUBREGION[r.sub] || '';
      var sp = prodMatch(r);
      out.push({
        id: r.id, src: 'salon', rank: rankStart + out.length, pts: r.best || 0, qual: r.best ? 1000 + r.best : 0, grapeName: g, regionKey: reg,
        pid: sp || 'salon:' + r.pid, prodName: sp ? siteProd[sp].name : r.p,
        compact: tokenize(r.w || r.n).join(''), name: r.n + (r.w && r.w !== r.n ? ' ' + r.w : ''), prod: r.p + ' ' + tokenize(r.p).join(''),
        grape: grapeWords(g), origin: [r.v, r.vy].join(' '), place: r.t || '',
        region: regionWords(reg, [r.sub]), meta: [r.r, r.q, r.b].join(' '),
        village: r.v || '', vineyard: r.vy || ''
      });
    });
    out.dup = dup;
    return out;
  }
  // To samo wino na stronie: ten sam rocznik i albo link do karty Salonu 2026 (nr ev.), albo ta sama partia w opisie pochodzenia
  // u tego samego producenta. Partia jest unikalna tylko w obrębie producenta i rocznika (Maňák i Oulehla mają obaj partię 2250
  // z 2022), więc przy partii musi się też zgadzać charakterystyczne słowo nazwy producenta.
  var GENERIC = { vinarstvi: 1, vinice: 1, vinne: 1, sklepi: 1, chateau: 1, rodini: 1, spol: 1 };
  function sameProducer(siteName, salonName) {
    var s = ' ' + tokenize(salonName).join(' ') + ' ';
    return tokenize(siteName).some(function (w) { return w.length >= 4 && !GENERIC[w] && s.indexOf(' ' + w + ' ') >= 0; });
  }
  function sameAsSite(r, siteDocs) {
    var nr26 = null;
    r.m.forEach(function (m) { if (m[0] === 2026 && m[1] === 'G' && m[3]) nr26 = m[3]; });
    var batch = r.b ? r.b.replace(/\s+/g, '') : '';
    for (var i = 0; i < siteDocs.length; i++) {
      var d = siteDocs[i];
      if (d.year !== r.r) continue;
      if (nr26 && d.links.indexOf('vina-v-salonu/26' + (nr26 < 10 ? '00' : (nr26 < 100 ? '0' : '')) + nr26) >= 0) return d;
      if (batch && (' ' + d.origin.replace(/\s+/g, ' ') + ' ').indexOf('partia ' + batch + ' ') >= 0 && sameProducer(d.prodName, r.p)) return d;
    }
    return null;
  }

  /* ---------- 5.7 Kategorie ---------- */
  var TYPE_ORDER = { region: 0, odmiana: 1, winiarnia: 2, miejsce: 3 };
  var TYPE_LABEL = { region: 'Region', odmiana: 'Odmiana', winiarnia: 'Winiarnia', miejsce: 'Miejsce' };
  function buildCategories(docs) {
    var by = {}, list = [];
    function put(type, key, label, words, id) {
      var k = type + ':' + key;
      if (!by[k]) { by[k] = { id: k, type: type, key: key, label: label, words: words, ids: [] }; list.push(by[k]); }
      if (by[k].ids.indexOf(id) < 0) by[k].ids.push(id);
    }
    var places = {};
    docs.forEach(function (d) {
      if (d.regionKey && REGIONS[d.regionKey]) put('region', d.regionKey, REGIONS[d.regionKey].label, regionWords(d.regionKey), d.id);
      if (d.grapeName) put('odmiana', d.grapeName, d.grapeName + (GRAPES[d.grapeName] && GRAPES[d.grapeName][0] ? ' (' + GRAPES[d.grapeName][0] + ')' : ''), grapeWords(d.grapeName), d.id);
      if (d.prodName) put('winiarnia', d.pid, d.prodName, d.prodName, d.id);
      // Miejsca (faza 2): gminy i parcele z Salonu.
      [d.village, d.vineyard].forEach(function (pl) {
        if (!pl) return;
        var k = norm(pl);
        places[k] = pl;
        put('miejsce', k, pl, pl, d.id);
      });
    });
    // Wina ze strony trafiają do miejsca, gdy jego nazwa pada w opisie pochodzenia (np. „Kraví hora”, „Šatov”).
    var keys = Object.keys(places).map(function (k) { return { k: k, pat: ' ' + tokenize(places[k]).join(' ') + ' ' }; });
    docs.forEach(function (d) {
      if (d.src !== 'site') return;
      var txt = ' ' + tokenize(d.origin + ' ' + d.place).join(' ') + ' ';
      keys.forEach(function (x) { if (txt.indexOf(x.pat) >= 0) put('miejsce', x.k, places[x.k], places[x.k], d.id); });
    });
    return list.filter(function (c) { return c.ids.length >= 2; });
  }
  // Poziom dopasowania kategorii: 3 dokładne słowo, 2 początek słowa, 1 literówka, 0 brak (najsłabsze ze słów zapytania).
  function tier(terms, words) {
    var ws = tokenize(words), worst = 3;
    terms.forEach(function (t) {
      var best = 0;
      ws.forEach(function (w) {
        var v = w === t ? 3 : (w.indexOf(t) === 0 ? 2 : (fuzzyLimit(t) && lev(t, w) <= fuzzyLimit(t) ? 1 : 0));
        if (v > best) best = v;
      });
      if (best < worst) worst = best;
    });
    return worst;
  }

  /* ---------- Silnik ---------- */
  var FIELDS = ['compact', 'name', 'prod', 'grape', 'origin', 'place', 'region', 'meta'];
  var BOOST = { compact: 3, name: 3, prod: 4, grape: 2, origin: 2 };

  // create: budowa od razu (faza 1, 56 win, kilka ms). createAsync: budowa w porcjach po 40 dokumentów
  // (MiniSearch.addAllAsync), żeby przy ok. 450 winach strona nie zamarzała na kilkaset ms na telefonie.
  function create(docs, opts) { return engine(docs, opts || {}, false); }
  function createAsync(docs, opts) { return engine(docs, opts || {}, true); }
  function engine(docs, opts, async) {
    var MS = window.MiniSearch;
    var byId = {};
    docs.forEach(function (d) { byId[d.id] = d; });
    var ms = new MS({
      fields: FIELDS, storeFields: ['id'], tokenize: tokenize,
      processTerm: function (t) { return norm(t) || null; },
      searchOptions: {
        boost: BOOST, combineWith: 'AND',
        prefix: function (t) { return t.length >= 2; },
        fuzzy: function (t) { return fuzzyLimit(t) || false; }
      }
    });
    var cats = opts.categories === false ? [] : buildCategories(docs);
    var cs = new MS({
      fields: ['words'], storeFields: ['id'], tokenize: tokenize,
      processTerm: function (t) { return norm(t) || null; },
      searchOptions: { combineWith: 'AND', prefix: function (t) { return t.length >= 2; }, fuzzy: function (t) { return fuzzyLimit(t) || false; } }
    });
    var catById = {};
    cats.forEach(function (c) { catById[c.id] = c; });

    // Kolejność wyników (dla pola wyszukiwania):
    //   1. wina ze strony (nasz przewodnik) przed winami tylko z Salonu,
    //   2. poziom dopasowania: dokładne słowo > początek słowa > literówka (najsłabsze ze słów zapytania),
    //   3. jakość wina: Salon vín przed konkursem regionalnym, wyższe punkty wyżej („najlepsze najpierw”),
    //   4. wynik BM25 z MiniSearch i kolejność na stronie.
    // Moduł zdjęć woła search z { groupSite: false }: wtedy liczy się wyłącznie dopasowanie (BM25).
    function matchTier(r, qTerms) {
      var worst = 3;
      qTerms.forEach(function (qt) {
        var best = 1;
        r.terms.forEach(function (t) { var v = t === qt ? 3 : (t.indexOf(qt) === 0 ? 2 : 1); if (v > best) best = v; });
        if (best < worst) worst = best;
      });
      return worst;
    }
    function wrap(rs, byQuality, qTerms) {
      rs.forEach(function (r) { r.tier = byQuality ? matchTier(r, qTerms) : 0; });
      return rs.sort(function (a, b) {
        var da = byId[a.id], db = byId[b.id];
        if (!byQuality) return b.score - a.score || da.rank - db.rank;
        return ((da.src === 'site' ? 0 : 1) - (db.src === 'site' ? 0 : 1)) || b.tier - a.tier ||
          (db.qual || 0) - (da.qual || 0) || b.score - a.score || da.rank - db.rank;
      }).map(function (r) { return { id: r.id, src: byId[r.id].src, score: r.score, terms: r.terms }; });
    }
    function swaps(t) {
      var o = [];
      if (t.length < 4 || t.length > 6) return o;
      for (var i = 0; i < t.length - 1; i++) o.push(t.slice(0, i) + t[i + 1] + t[i] + t.slice(i + 2));
      return o;
    }

    function search(raw, o) {
      o = o || {};
      var q = cleanQuery(raw);
      var res = { mode: 'normal', query: q, wines: [], cats: [], total: 0 };
      if (q.replace(/[^a-z0-9]/g, '').length < 2) { res.mode = 'za-krotkie'; return res; }
      var so = {};
      if (o.combineWith) so.combineWith = o.combineWith;
      if (o.boost) so.boost = o.boost;
      var r = ms.search(q, so);
      if (!r.length && o.fallbacks !== false) {
        // 5.6 krok 2: przestawione sąsiednie litery w słowach 4–6 liter
        var terms = q.split(' '), best = null;
        terms.forEach(function (t, k) {
          swaps(t).forEach(function (v) {
            var rr = ms.search(terms.map(function (x, j) { return j === k ? v : x; }).join(' '));
            if (rr.length && (!best || rr[0].score > best[0].score)) best = rr;
          });
        });
        if (best) { r = best; res.mode = 'przestawka'; }
      }
      if (!r.length && o.fallbacks !== false) {
        // 5.6 krok 3: „Czy chodziło o” — OR i luźniejsze progi
        r = ms.search(q, { combineWith: 'OR', fuzzy: function (t) { return looseLimit(t) || false; } }).slice(0, 3);
        res.mode = r.length ? 'czy-chodzilo' : 'brak';
      }
      res.wines = wrap(r, o.groupSite !== false, (res.mode === 'przestawka' ? (r[0] && r[0].queryTerms) || q.split(' ') : q.split(' ')));
      res.total = res.wines.length;
      if (opts.categories !== false && o.categories !== false && res.mode === 'normal') {
        var qt = q.split(' ');
        var cr = cs.search(q).map(function (x) { var c = catById[x.id]; return { c: c, t: tier(qt, c.words) }; })
          .filter(function (x) { return x.t > 0; })
          .sort(function (a, b) { return b.t - a.t || TYPE_ORDER[a.c.type] - TYPE_ORDER[b.c.type] || b.c.ids.length - a.c.ids.length; });
        // kategorie trafione tylko literówką pokazujemy wyłącznie wtedy, gdy nie ma lepszych („hnanice” ≠ „stanice”)
        if (cr.length && cr[0].t > 1) cr = cr.filter(function (x) { return x.t > 1; });
        res.cats = cr.map(function (x) { return x.c; });
      }
      return res;
    }
    var api = {
      search: search,
      category: function (id) { return catById[id] || null; },
      doc: function (id) { return byId[id] || null; },
      size: docs.length
    };
    if (!async) { ms.addAll(docs); cs.addAll(cats); return api; }
    return ms.addAllAsync(docs, { chunkSize: 40 })
      .then(function () { return cs.addAllAsync(cats, { chunkSize: 80 }); })
      .then(function () { return api; });
  }

  // Pogrubienie dopasowanych słów: porównanie słów tekstu po normalizacji z terms z MiniSearch.
  function highlight(text, terms, esc) {
    var ts = (terms || []).map(norm);
    return String(text).split(/([^0-9A-Za-zÀ-ž²]+)/).map(function (part) {
      var n = norm(part);
      var hit = n && ts.some(function (t) { return n === t || (t.length >= 2 && n.indexOf(t) === 0) || (t.indexOf(n) === 0 && n.length >= 3); });
      return hit ? '<mark>' + esc(part) + '</mark>' : esc(part);
    }).join('');
  }

  window.WineSearch = {
    norm: norm, tokenize: tokenize, cleanQuery: cleanQuery, grapeFromName: grapeFromName,
    GRAPES: GRAPES, REGIONS: REGIONS, SUBREGION: SUBREGION, TYPE_LABEL: TYPE_LABEL,
    fromSite: fromSite, fromSalon: fromSalon, create: create, createAsync: createAsync, highlight: highlight
  };
})();
