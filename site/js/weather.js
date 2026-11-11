/*
 * Prognoza pogody na wyjazd (zakładka „Pogoda”). Spec: specs/pogoda/DEVELOPMENT-PLAN.md
 * Źródła pobierane na żywo z telefonu (bez serwera, bez klucza API):
 *   - ČHMÚ ALADIN 1 km i ECMWF IFS 9 km przez Open-Meteo (api.open-meteo.com),
 *   - GeoSphere Austria AROME 1 km z oficjalnego API (dataset.api.hub.geosphere.at).
 * Bez DOM: funkcje czyste + pobieranie przez przekazany fetch. Testy: specs/pogoda/testy.js
 */
(function (root) {
  'use strict';

  var TZ = 'Europe/Prague';
  var TRIP = { start: '2026-11-11', end: '2026-11-15' };
  var CACHE_KEY = 'husa-pogoda-v1';

  var MODELS = {
    aladin: { id: 'aladin', name: 'ČHMÚ ALADIN', short: 'ALADIN', desc: 'model czeskiej służby ČHMÚ, 1 km', om: 'chmi_aladin_cz_1km' },
    arome: { id: 'arome', name: 'GeoSphere AROME', short: 'AROME', desc: 'model austriackiej służby GeoSphere, 1 km' },
    ecmwf: { id: 'ecmwf', name: 'ECMWF', short: 'ECMWF', desc: 'model globalny, 9 km', om: 'ecmwf_ifs' }
  };
  // Łańcuch: pierwszy model, który ma daną godzinę (spec, punkt 2).
  var PLACES = [
    { id: 'znojmo', name: 'Znojmo', lat: 48.8555, lon: 16.0488, chain: ['aladin', 'arome', 'ecmwf'], plan: 'Nocleg, środa, piątek i niedziela.' },
    { id: 'hardegg', name: 'Hardegg', lat: 48.8504, lon: 15.8601, chain: ['arome', 'aladin', 'ecmwf'], plan: 'Czwartek: spacer nad Dyją przed południem (Austria).' },
    { id: 'satov', name: 'Šatov', lat: 48.7826, lon: 16.0094, chain: ['aladin', 'arome', 'ecmwf'], plan: 'Sobota: marsz przez winnice i święto młodego wina.' },
    { id: 'saldorf', name: 'Nový Šaldorf', short: 'Šaldorf', lat: 48.8297, lon: 16.0567, chain: ['aladin', 'arome', 'ecmwf'], plan: 'Sobota: otwarte piwnice i obiad.' }
  ];
  var REGIONAL = { aladin: 1, arome: 1 };

  /* ---------- czas (wszystko w czasie Pragi, klucz godziny „RRRR-MM-DDTHH”) ---------- */
  var fmtCache = null;
  function pragueParts(date) {
    if (!fmtCache) {
      fmtCache = new Intl.DateTimeFormat('en-GB', {
        timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
      });
    }
    var p = {};
    fmtCache.formatToParts(date).forEach(function (x) { p[x.type] = x.value; });
    return { date: p.year + '-' + p.month + '-' + p.day, hour: ('0' + (parseInt(p.hour, 10) % 24)).slice(-2), minute: p.minute };
  }
  function pragueKey(date) { var p = pragueParts(date); return p.date + 'T' + p.hour; }
  function utcToKey(iso) { return pragueKey(new Date(iso)); }
  function pragueTime(ms) { var p = pragueParts(new Date(ms)); return p.hour + ':' + p.minute; }
  var MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  var WEEKDAYS = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
  function dayLabel(date) {
    var a = date.split('-'), d = new Date(Date.UTC(+a[0], +a[1] - 1, +a[2], 12));
    var w = WEEKDAYS[d.getUTCDay()];
    return w.charAt(0).toUpperCase() + w.slice(1) + ' ' + (+a[2]) + ' ' + MONTHS[+a[1] - 1];
  }
  function stampLabel(ms) { var p = pragueParts(new Date(ms)); var a = p.date.split('-'); return (+a[2]) + ' ' + MONTHS[+a[1] - 1] + ', ' + (+p.hour) + ':' + p.minute; }

  /* ---------- adresy zapytań ---------- */
  function urls(today) {
    var start = today > TRIP.start ? today : TRIP.start;
    var lat = PLACES.map(function (p) { return p.lat; }).join(','), lon = PLACES.map(function (p) { return p.lon; }).join(',');
    return {
      om: 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
        '&hourly=temperature_2m,precipitation,precipitation_probability,weather_code,cloud_cover,wind_speed_10m,wind_gusts_10m' +
        '&daily=sunrise,sunset&models=' + MODELS.aladin.om + ',' + MODELS.ecmwf.om +
        '&timezone=Europe%2FPrague&start_date=' + start + '&end_date=' + TRIP.end,
      gs: 'https://dataset.api.hub.geosphere.at/v1/timeseries/forecast/nwp-v2-1h-1km?parameters=2t,tp,sf,tcc,10u,10v,10fg' +
        PLACES.map(function (p) { return '&lat_lon=' + p.lat + ',' + p.lon; }).join(''),
      meta: {
        aladin: 'https://api.open-meteo.com/data/' + MODELS.aladin.om + '/static/meta.json',
        ecmwf: 'https://api.open-meteo.com/data/' + MODELS.ecmwf.om + '/static/meta.json'
      }
    };
  }

  /* ---------- odczyt odpowiedzi ---------- */
  function num(v) { return typeof v === 'number' && isFinite(v) ? v : null; }
  // Open-Meteo: tablica (jedno miejsce = jeden element), pola godzinowe z przyrostkiem modelu.
  function parseOM(json) {
    var list = Array.isArray(json) ? json : [json], out = { places: {}, sun: {} };
    PLACES.forEach(function (pl, i) {
      var loc = list[i];
      if (!loc || !loc.hourly) return;
      var h = loc.hourly, models = {};
      ['aladin', 'ecmwf'].forEach(function (m) {
        var sfx = '_' + MODELS[m].om, rows = {};
        (h.time || []).forEach(function (time, k) {
          var t = num((h['temperature_2m' + sfx] || [])[k]);
          if (t === null) return; // model nie liczy tej godziny
          rows[time.slice(0, 13)] = {
            t: t, p: Math.max(0, num((h['precipitation' + sfx] || [])[k]) || 0),
            pp: num((h['precipitation_probability' + sfx] || [])[k]),
            code: num((h['weather_code' + sfx] || [])[k]), cc: num((h['cloud_cover' + sfx] || [])[k]),
            w: num((h['wind_speed_10m' + sfx] || [])[k]), g: num((h['wind_gusts_10m' + sfx] || [])[k])
          };
        });
        models[m] = rows;
      });
      out.places[pl.id] = models;
      // Przy kilku modelach Open-Meteo dodaje przyrostek modelu także do pól dziennych (sunrise_chmi_aladin_cz_1km).
      var sun = {}, D = loc.daily || {};
      var field = function (name) { var k = Object.keys(D).filter(function (x) { return x === name || x.indexOf(name + '_') === 0; })[0]; return k ? D[k] : []; };
      var rise = field('sunrise'), set = field('sunset');
      (D.time || []).forEach(function (d, k) {
        sun[d] = { rise: String(rise[k] || '').slice(11, 16), set: String(set[k] || '').slice(11, 16) };
      });
      out.sun[pl.id] = sun;
    });
    return out;
  }
  // GeoSphere: GeoJSON, punkty w kolejności zapytania, czas w UTC, wiatr w m/s.
  function parseGS(json) {
    var out = { places: {}, run: json && json.reference_time ? Date.parse(json.reference_time) : null };
    var ts = (json && json.timestamps) || [];
    PLACES.forEach(function (pl, i) {
      var f = json && json.features && json.features[i];
      if (!f) return;
      var P = f.properties.parameters, rows = {};
      function v(name, k) { return P[name] ? num(P[name].data[k]) : null; }
      ts.forEach(function (iso, k) {
        var t = v('2t', k);
        if (t === null) return;
        var tp = Math.max(0, v('tp', k) || 0), sf = Math.max(0, v('sf', k) || 0);
        var u = v('10u', k), vv = v('10v', k), g = v('10fg', k);
        rows[utcToKey(iso)] = {
          t: t, p: tp, pp: null, code: null, cc: v('tcc', k),
          snow: tp > 0 ? Math.min(1, sf / tp) : 0,
          w: u === null || vv === null ? null : Math.sqrt(u * u + vv * vv) * 3.6,
          g: g === null ? null : g * 3.6
        };
      });
      out.places[pl.id] = { arome: rows };
    });
    return out;
  }

  /* ---------- rodzaj pogody (wspólny dla wszystkich modeli) ---------- */
  var TYPE_LABEL = {
    clear: 'bezchmurnie', partly: 'częściowe zachmurzenie', cloudy: 'pochmurno', fog: 'mgła', drizzle: 'mżawka',
    rain: 'deszcz', sleet: 'deszcz ze śniegiem', snow: 'śnieg', storm: 'burza'
  };
  var WET = { drizzle: 1, rain: 1, sleet: 1, snow: 1, storm: 1 };
  function classify(h) {
    var c = h.code;
    if (c !== null && c !== undefined) { // kod pogody WMO z Open-Meteo
      if (c >= 95) return 'storm';
      if ((c >= 71 && c <= 77) || c === 85 || c === 86) return 'snow';
      if (c === 66 || c === 67 || c === 56 || c === 57) return 'sleet';
      if ((c >= 61 && c <= 65) || (c >= 80 && c <= 82)) return 'rain';
      if (c >= 51 && c <= 55) return 'drizzle';
      if (c === 45 || c === 48) return 'fog';
      if (c === 3) return 'cloudy';
      if (c === 2) return 'partly';
      return 'clear';
    }
    // AROME: z opadu, udziału śniegu i zachmurzenia (spec, punkt 4)
    if (h.p >= 0.1) {
      if (h.snow > 0.7) return 'snow';
      if (h.snow > 0.2) return 'sleet';
      return h.p < 0.3 ? 'drizzle' : 'rain';
    }
    if (h.cc === null || h.cc === undefined) return 'cloudy';
    return h.cc < 20 ? 'clear' : (h.cc < 70 ? 'partly' : 'cloudy');
  }
  function isNight(key, sun) {
    var hour = +key.slice(11, 13), s = sun && sun[key.slice(0, 10)];
    var rise = s && s.rise ? +s.rise.slice(0, 2) + (+s.rise.slice(3, 5) >= 30 ? 1 : 0) : 7;
    var set = s && s.set ? +s.set.slice(0, 2) + (+s.set.slice(3, 5) >= 30 ? 1 : 0) : 16;
    return hour < rise || hour > set;
  }
  // Rozbieżność modeli. Review 11 XI:
  //   runda 1: próg 2 °C / 0,1 mm zaznaczał co czwartą godzinę, także różnice niewidoczne po zaokrągleniu i samą mżawkę;
  //   runda 2: reguła „drugi < 0,1 mm” przepuszczała 0,1 mm wobec 3,1 mm.
  // Teraz: temperatura różni się o 3 °C lub więcej albo większy opad ma co najmniej 0,5 mm i jest co najmniej 4 razy
  // większy od mniejszego.
  function differs(a, b) {
    if (!a || !b) return false;
    var hi = Math.max(a.p, b.p), lo = Math.min(a.p, b.p);
    return Math.abs(a.t - b.t) >= 3 || (hi >= 0.5 && lo * 4 <= hi);
  }

  /* ---------- prognoza dla miejsca ---------- */
  // data: { om: parseOM(...) | null, gs: parseGS(...) | null }, fromKey: klucz bieżącej godziny w czasie Pragi.
  function build(placeId, data, fromKey) {
    var place = PLACES.filter(function (p) { return p.id === placeId; })[0];
    var series = {};
    if (data.om && data.om.places[placeId]) { series.aladin = data.om.places[placeId].aladin; series.ecmwf = data.om.places[placeId].ecmwf; }
    if (data.gs && data.gs.places[placeId]) series.arome = data.gs.places[placeId].arome;
    var sun = data.om && data.om.sun[placeId];
    var endKey = TRIP.end + 'T23', keys = {};
    Object.keys(series).forEach(function (m) {
      Object.keys(series[m] || {}).forEach(function (k) { if (k >= fromKey && k <= endKey) keys[k] = 1; });
    });
    var hours = Object.keys(keys).sort().map(function (k) {
      var src = null;
      for (var i = 0; i < place.chain.length; i++) { var m = place.chain[i]; if (series[m] && series[m][k]) { src = m; break; } }
      var h = series[src][k], alt = null;
      if (REGIONAL[src]) {
        var other = src === 'aladin' ? 'arome' : 'aladin';
        if (series[other] && series[other][k]) alt = { src: other, t: series[other][k].t, p: series[other][k].p };
      }
      var type = classify(h);
      return { key: k, date: k.slice(0, 10), hour: k.slice(11, 13) + ':00', src: src, t: h.t, p: h.p, pp: src === 'ecmwf' ? h.pp : null,
        w: h.w, g: h.g, type: type, night: isNight(k, sun), alt: alt, diff: differs(h, alt) };
    });
    hours.forEach(function (h, i) { h.change = i === 0 || hours[i - 1].src !== h.src; });
    var byDate = {}, days = [];
    hours.forEach(function (h) {
      if (!byDate[h.date]) { byDate[h.date] = { date: h.date, label: dayLabel(h.date), hours: [] }; days.push(byDate[h.date]); }
      byDate[h.date].hours.push(h);
    });
    days.forEach(function (d) { d.summary = summarize(d.hours); d.partial = d.date === fromKey.slice(0, 10) && d.hours[0].hour !== '00:00'; });
    return { place: place, days: days, ended: fromKey > endKey };
  }
  function summarize(hours) {
    var t = hours.map(function (h) { return h.t; }), s = { tmin: Math.min.apply(null, t), tmax: Math.max.apply(null, t), p: 0, g: null };
    var count = {}, wet = {};
    hours.forEach(function (h) {
      s.p += h.p;
      if (h.g !== null && (s.g === null || h.g > s.g)) s.g = h.g;
      var hr = +h.hour.slice(0, 2);
      if (hr >= 8 && hr <= 18) count[h.type] = (count[h.type] || 0) + 1;
      if (WET[h.type]) wet[h.type] = (wet[h.type] || 0) + 1;
    });
    if (!Object.keys(count).length) hours.forEach(function (h) { count[h.type] = (count[h.type] || 0) + 1; }); // dzień bez godzin 8–18
    var top = function (o) { return Object.keys(o).sort(function (a, b) { return o[b] - o[a]; })[0]; };
    var wetTop = top(wet);
    s.type = wetTop && wet[wetTop] >= 3 ? wetTop : top(count);
    return s;
  }

  /* ---------- pobieranie z limitem czasu ---------- */
  function getJSON(fetchFn, url, ms) {
    return new Promise(function (resolve, reject) {
      var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); reject(new Error('timeout')); }, ms);
      fetchFn(url, ctrl ? { signal: ctrl.signal } : {}).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (j) { clearTimeout(timer); resolve(j); }, function (e) { clearTimeout(timer); reject(e); });
    });
  }
  function settle(p) { return p.then(function (v) { return { ok: true, value: v }; }, function (e) { return { ok: false, error: String(e && e.message || e) }; }); }
  // Limity czasu: Open-Meteo odpowiada w ok. 50 ms, GeoSphere w 1–16 s (pomiar 11 XI), więc dla niego 30 s.
  var TIMEOUT = { om: 12000, gs: 30000, meta: 12000 };
  // Każde źródło zgłasza się osobno (onPart), żeby szybkie Open-Meteo nie czekało na wolniejsze GeoSphere.
  // Zwraca { om, gs, runs } z polami { ok, value | error }. Nigdy nie odrzuca.
  function fetchAll(fetchFn, today, onPart, timeouts) {
    var u = urls(today), T = timeouts || TIMEOUT, out = { runs: {} };
    var run = function (x) { return x.ok && x.value && x.value.last_run_initialisation_time ? x.value.last_run_initialisation_time * 1000 : null; };
    function part(name, p) {
      return settle(p).then(function (r) {
        if (name === 'aladin' || name === 'ecmwf') { out.runs[name] = run(r); if (onPart) onPart('runs', out.runs); }
        else { out[name] = r; if (onPart) onPart(name, r); }
      });
    }
    return Promise.all([
      part('om', getJSON(fetchFn, u.om, T.om)), part('gs', getJSON(fetchFn, u.gs, T.gs)),
      part('aladin', getJSON(fetchFn, u.meta.aladin, T.meta)), part('ecmwf', getJSON(fetchFn, u.meta.ecmwf, T.meta))
    ]).then(function () { return out; });
  }

  /* ---------- zapis w telefonie: osobno dla każdego źródła, z godziną pobrania ---------- */
  function loadCache(storage) {
    try { return JSON.parse(storage.getItem(CACHE_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveCache(storage, cache) {
    try { storage.setItem(CACHE_KEY, JSON.stringify(cache)); return true; } catch (e) { return false; }
  }
  // Łączy wynik jednego źródła z zapisem. Źródło, które nie odpowiedziało, zostaje przy ostatnim zapisie (z jego godziną).
  // Zwraca nowy zapis i stan źródła: 'fresh' | 'cached' | 'missing'.
  function mergePart(cache, name, result, nowMs) {
    var next = { om: cache.om || null, gs: cache.gs || null, runs: {} }, st;
    Object.keys(cache.runs || {}).forEach(function (k) { next.runs[k] = cache.runs[k]; });
    if (name === 'runs') { Object.keys(result || {}).forEach(function (k) { if (result[k]) next.runs[k] = result[k]; }); return { cache: next, status: null }; }
    if (result && result.ok) { next[name] = { at: nowMs, data: result.value }; st = 'fresh'; }
    else st = next[name] ? 'cached' : 'missing';
    return { cache: next, status: st };
  }
  // Wszystkie źródła naraz (testy, pierwsze wczytanie).
  function merge(cache, res, nowMs) {
    var c = cache, status = {};
    ['om', 'gs'].forEach(function (s) { var m = mergePart(c, s, res[s], nowMs); c = m.cache; status[s] = m.status; });
    c = mergePart(c, 'runs', res.runs, nowMs).cache;
    return { cache: c, status: status };
  }
  // Błąd odczytu nie może udawać braku danych: trafia do out.errors i jest pokazywany jako niedziałające źródło.
  function parsed(cache) {
    var out = { om: null, gs: null, errors: {} };
    try { if (cache.om) out.om = parseOM(cache.om.data); } catch (e) { out.errors.om = String(e && e.message || e); }
    try { if (cache.gs) out.gs = parseGS(cache.gs.data); } catch (e) { out.errors.gs = String(e && e.message || e); }
    return out;
  }

  /* ---------- formatowanie ---------- */
  function fmtNum(n, dec) { return n.toFixed(dec).replace('.', ','); }
  function fmtTemp(t) { var r = Math.round(t); return (r === 0 ? 0 : r) + '°'; }
  function fmtPrecip(p) { return p < 0.05 ? '—' : fmtNum(p, 1) + ' mm'; }
  function fmtWind(w) { return w === null || w === undefined ? '—' : String(Math.round(w)); }

  var api = {
    TZ: TZ, TRIP: TRIP, MODELS: MODELS, PLACES: PLACES, TYPE_LABEL: TYPE_LABEL, WET: WET, CACHE_KEY: CACHE_KEY,
    pragueKey: pragueKey, utcToKey: utcToKey, pragueTime: pragueTime, dayLabel: dayLabel, stampLabel: stampLabel,
    urls: urls, parseOM: parseOM, parseGS: parseGS, classify: classify, isNight: isNight, differs: differs,
    build: build, summarize: summarize, fetchAll: fetchAll, loadCache: loadCache, saveCache: saveCache, merge: merge, mergePart: mergePart, parsed: parsed,
    fmtTemp: fmtTemp, fmtPrecip: fmtPrecip, fmtWind: fmtWind, fmtNum: fmtNum
  };
  root.Weather = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : this);
