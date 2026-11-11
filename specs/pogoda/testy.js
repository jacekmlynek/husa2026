/*
 * Testy zakładki Pogoda (spec: specs/pogoda/DEVELOPMENT-PLAN.md, punkty 5–6).
 *   node specs/pogoda/testy.js          funkcje czyste na małych danych wzorcowych (o kształcie odpowiedzi API)
 *   node specs/pogoda/testy.js --live   dodatkowo zapytania na żywo do Open-Meteo i GeoSphere
 */
'use strict';
var path = require('path');
var W = require(path.join(__dirname, '..', '..', 'site', 'js', 'weather.js'));
var results = [];
function test(name, fn) {
  try { var r = fn(); results.push({ name: name, ok: r === true, msg: r === true ? '' : String(r) }); }
  catch (e) { results.push({ name: name, ok: false, msg: e.stack }); }
}
function eq(a, b, label) { return JSON.stringify(a) === JSON.stringify(b) ? true : (label || '') + ' oczekiwano ' + JSON.stringify(b) + ', jest ' + JSON.stringify(a); }

/* ---------- dane wzorcowe (kształt jak w odpowiedziach z 11 XI 2026) ---------- */
function omFixture() {
  // 4 miejsca; ALADIN liczy do 13 XI 19:00, ECMWF do końca; pola dzienne Z PRZYROSTKIEM modelu (tak zwraca Open-Meteo przy kilku modelach)
  var times = [], keys = ['2026-11-13T18:00', '2026-11-13T19:00', '2026-11-13T20:00', '2026-11-13T21:00'];
  keys.forEach(function (k) { times.push(k); });
  function loc(shift) {
    return {
      hourly: {
        time: times,
        temperature_2m_chmi_aladin_cz_1km: [5 + shift, 4.6 + shift, null, null],
        precipitation_chmi_aladin_cz_1km: [0, 0.4, null, null],
        precipitation_probability_chmi_aladin_cz_1km: [null, null, null, null],
        weather_code_chmi_aladin_cz_1km: [3, 61, null, null],
        cloud_cover_chmi_aladin_cz_1km: [100, 100, null, null],
        wind_speed_10m_chmi_aladin_cz_1km: [10, 12, null, null],
        wind_gusts_10m_chmi_aladin_cz_1km: [20, 25, null, null],
        temperature_2m_ecmwf_ifs: [6, 5, 4.4, -0.4],
        precipitation_ecmwf_ifs: [0, 0.2, 0.0, 0.0],
        precipitation_probability_ecmwf_ifs: [10, 40, 20, 5],
        weather_code_ecmwf_ifs: [2, 51, 3, 0],
        cloud_cover_ecmwf_ifs: [50, 90, 100, 0],
        wind_speed_10m_ecmwf_ifs: [8, 9, 10, 11],
        wind_gusts_10m_ecmwf_ifs: [18, 19, 21, 22]
      },
      daily: { time: ['2026-11-13'], sunrise_chmi_aladin_cz_1km: ['2026-11-13T06:58'], sunset_chmi_aladin_cz_1km: ['2026-11-13T16:21'] }
    };
  }
  return [loc(0), loc(-1), loc(0.5), loc(0.2)];
}
function gsFixture() {
  // GeoSphere: czas UTC (17:00Z = 18:00 w Pradze), wiatr w m/s, opad z ostatniej godziny
  function f(t) {
    return { type: 'Feature', geometry: { type: 'Point', coordinates: [16, 48.8] }, properties: { parameters: {
      '2t': { data: [t, t - 0.5] }, tp: { data: [0, 1.0] }, sf: { data: [0, 0.9] }, tcc: { data: [10, 100] },
      '10u': { data: [3, 0] }, '10v': { data: [4, 2] }, '10fg': { data: [10, 5] } } } };
  }
  return { reference_time: '2026-11-13T06:00+00:00', timestamps: ['2026-11-13T17:00+00:00', '2026-11-13T18:00+00:00'], features: [f(8), f(2), f(5), f(5)] };
}

/* ---------- czas ---------- */
test('UTC → czas Pragi (listopad: UTC+1)', function () { return eq(W.utcToKey('2026-11-13T17:00+00:00'), '2026-11-13T18'); });
test('UTC → czas Pragi przez północ', function () { return eq(W.utcToKey('2026-11-13T23:30+00:00'), '2026-11-14T00'); });
test('etykieta dnia po polsku', function () { return eq([W.dayLabel('2026-11-12'), W.dayLabel('2026-11-15')], ['Czwartek 12 XI', 'Niedziela 15 XI']); });

/* ---------- odczyt odpowiedzi ---------- */
test('Open-Meteo: modele z przyrostkami, puste godziny pomijane', function () {
  var p = W.parseOM(omFixture());
  return eq([Object.keys(p.places.znojmo.aladin), Object.keys(p.places.znojmo.ecmwf).length], [['2026-11-13T18', '2026-11-13T19'], 4]);
});
test('Open-Meteo: wschód i zachód słońca z polem z przyrostkiem modelu', function () {
  return eq(W.parseOM(omFixture()).sun.znojmo['2026-11-13'], { rise: '06:58', set: '16:21' });
});
test('GeoSphere: wiatr z u/v w km/h, porywy z m/s, udział śniegu', function () {
  var r = W.parseGS(gsFixture()).places.znojmo.arome['2026-11-13T18'];
  var r2 = W.parseGS(gsFixture()).places.znojmo.arome['2026-11-13T19'];
  return eq([Math.round(r.w), Math.round(r.g), r2.snow], [18, 36, 0.9]);
});
test('GeoSphere: godzina przebiegu', function () { return eq(W.parseGS(gsFixture()).run, Date.parse('2026-11-13T06:00Z')); });

/* ---------- rodzaj pogody ---------- */
test('kody WMO', function () {
  return eq([0, 2, 3, 45, 53, 63, 66, 73, 81, 95].map(function (c) { return W.classify({ code: c }); }),
    ['clear', 'partly', 'cloudy', 'fog', 'drizzle', 'rain', 'sleet', 'snow', 'rain', 'storm']);
});
test('AROME bez kodu: opad i zachmurzenie', function () {
  return eq([
    W.classify({ code: null, p: 1, snow: 0.9, cc: 100 }), W.classify({ code: null, p: 1, snow: 0.5, cc: 100 }),
    W.classify({ code: null, p: 1, snow: 0, cc: 100 }), W.classify({ code: null, p: 0.15, snow: 0, cc: 100 }),
    W.classify({ code: null, p: 0, cc: 10 }), W.classify({ code: null, p: 0, cc: 50 }), W.classify({ code: null, p: 0, cc: 95 })
  ], ['snow', 'sleet', 'rain', 'drizzle', 'clear', 'partly', 'cloudy']);
});
test('noc według wschodu i zachodu słońca', function () {
  var sun = { '2026-11-13': { rise: '06:58', set: '16:21' } };
  return eq(['05', '07', '16', '17'].map(function (h) { return W.isNight('2026-11-13T' + h, sun); }), [true, false, false, true]);
});

/* ---------- łańcuch modeli, granica ECMWF, druga opinia ---------- */
function data() { return { om: W.parseOM(omFixture()), gs: W.parseGS(gsFixture()) }; }
test('Znojmo: ALADIN, potem ECMWF; zmiana źródła zaznaczona', function () {
  var h = W.build('znojmo', data(), '2026-11-13T18').days[0].hours;
  return eq(h.map(function (x) { return [x.hour, x.src, x.change]; }), [['18:00', 'aladin', true], ['19:00', 'aladin', false], ['20:00', 'ecmwf', true], ['21:00', 'ecmwf', false]]);
});
test('Hardegg: AROME pierwszy, potem ALADIN, potem ECMWF', function () {
  var h = W.build('hardegg', data(), '2026-11-13T18').days[0].hours;
  return eq(h.map(function (x) { return x.src; }), ['arome', 'arome', 'ecmwf', 'ecmwf']);
});
test('druga opinia i rozbieżność: temperatura o 3° lub więcej', function () {
  var h = W.build('znojmo', data(), '2026-11-13T18').days[0].hours;
  // 18:00 ALADIN 5° vs AROME 8° → 3° → rozbieżność; 19:00 4,6° vs 7,5° (2,9°) i oba pada (0,4 vs 1,0 mm) → nie
  return eq([h[0].alt.src, h[0].diff, h[1].diff, h[2].alt, h[2].diff], ['arome', true, false, null, false]);
});
test('rozbieżność opadu: wyraźny opad w jednym modelu, prawie żaden w drugim', function () {
  return eq([
    W.differs({ t: 5, p: 0.6 }, { t: 5, p: 0.05 }), W.differs({ t: 5, p: 0.6 }, { t: 5, p: 0.2 }),
    W.differs({ t: 5, p: 0.13 }, { t: 5, p: 0.06 }), W.differs({ t: 5, p: 0 }, { t: 7.9, p: 0 })
  ], [true, false, false, false]);
});
test('prawdopodobieństwo opadu tylko dla godzin ECMWF', function () {
  var h = W.build('znojmo', data(), '2026-11-13T18').days[0].hours;
  return eq(h.map(function (x) { return x.pp; }), [null, null, 20, 5]);
});
test('godziny sprzed teraz są pomijane, dzisiejszy dzień oznaczony „od teraz”', function () {
  var f = W.build('znojmo', data(), '2026-11-13T20');
  return eq([f.days[0].hours.length, f.days[0].partial], [2, true]);
});
test('po 15 XI: wyjazd się skończył', function () { return eq(W.build('znojmo', data(), '2026-11-16T09').ended, true); });
test('tylko jedno źródło (GeoSphere nie odpowiada): łańcuch bierze pozostałe', function () {
  var h = W.build('hardegg', { om: W.parseOM(omFixture()), gs: null }, '2026-11-13T18').days[0].hours;
  return eq(h.map(function (x) { return x.src; }), ['aladin', 'aladin', 'ecmwf', 'ecmwf']);
});
test('podsumowanie dnia: min/maks, suma opadu, porywy, opad ma pierwszeństwo przy ≥ 3 godzinach', function () {
  var hrs = ['08', '09', '10', '11'].map(function (hh, i) { return { hour: hh + ':00', t: i, p: i < 3 ? 0.5 : 0, g: 10 + i, type: i < 3 ? 'rain' : 'clear' }; });
  var s = W.summarize(hrs);
  return eq([s.tmin, s.tmax, s.p, s.g, s.type], [0, 3, 1.5, 13, 'rain']);
});

/* ---------- zapis w telefonie ---------- */
function memStorage() { var m = {}; return { getItem: function (k) { return k in m ? m[k] : null; }, setItem: function (k, v) { m[k] = String(v); } }; }
test('zapis i odczyt, osobno dla każdego źródła', function () {
  var st = memStorage();
  var a = W.merge({}, { om: { ok: true, value: omFixture() }, gs: { ok: true, value: gsFixture() }, runs: { aladin: 1 } }, 1000);
  W.saveCache(st, a.cache);
  var b = W.merge(W.loadCache(st), { om: { ok: true, value: omFixture() }, gs: { ok: false, error: 'timeout' }, runs: {} }, 2000);
  return eq([b.status, b.cache.om.at, b.cache.gs.at, b.cache.runs.aladin], [{ om: 'fresh', gs: 'cached' }, 2000, 1000, 1]);
});
test('uszkodzony zapis i brak localStorage nie psują strony', function () {
  var bad = { getItem: function () { return '{nie json'; }, setItem: function () { throw new Error('QuotaExceeded'); } };
  return eq([W.loadCache(bad), W.saveCache(bad, {})], [{}, false]);
});
test('błąd odczytu odpowiedzi jest zgłaszany, a nie ukrywany', function () {
  var p = W.parsed({ om: { at: 1, data: [{ hourly: { time: ['x'] }, daily: { time: ['2026-11-13'] } }] }, gs: { at: 1, data: { features: [{ properties: {} }], timestamps: ['2026-11-13T17:00Z'] } } });
  return eq([!!p.om, !!p.errors.gs], [true, true]);
});
test('formatowanie: polski przecinek, „—” poniżej 0,05 mm, bez „-0°”', function () {
  return eq([W.fmtPrecip(0.04), W.fmtPrecip(0.45), W.fmtTemp(-0.4), W.fmtTemp(2.6), W.fmtWind(12.6)], ['—', '0,5 mm', '0°', '3°', '13']);
});

/* ---------- na żywo ---------- */
function live() {
  var key = W.pragueKey(new Date());
  return W.fetchAll(fetch, key.slice(0, 10), 20000).then(function (res) {
    test('na żywo: Open-Meteo odpowiada', function () { return res.om.ok || res.om.error; });
    test('na żywo: GeoSphere odpowiada', function () { return res.gs.ok || res.gs.error; });
    test('na żywo: godziny przebiegów ALADIN i ECMWF', function () { return !!(res.runs.aladin && res.runs.ecmwf) || 'brak'; });
    var data = W.parsed(W.merge({}, res, Date.now()).cache);
    W.PLACES.forEach(function (pl) {
      test('na żywo: ' + pl.name + ' ma prognozę do końca wyjazdu i sensowne wartości', function () {
        var f = W.build(pl.id, data, key), hrs = [];
        f.days.forEach(function (d) { hrs = hrs.concat(d.hours); });
        if (!hrs.length) return 'brak godzin';
        var last = hrs[hrs.length - 1].key;
        var bad = hrs.filter(function (h) { return h.t < -30 || h.t > 40 || h.p < 0 || h.p > 50 || (h.w !== null && h.w > 200); });
        if (last !== W.TRIP.end + 'T23' && key <= W.TRIP.end + 'T23') return 'ostatnia godzina ' + last;
        if (bad.length) return 'dziwne wartości: ' + JSON.stringify(bad[0]);
        if (hrs[0].src !== pl.chain[0]) return 'pierwsze źródło ' + hrs[0].src + ' zamiast ' + pl.chain[0];
        return true;
      });
    });
  });
}

(process.argv.indexOf('--live') >= 0 ? live() : Promise.resolve()).then(function () {
  var fail = results.filter(function (r) { return !r.ok; });
  results.forEach(function (r) { console.log((r.ok ? 'ok   ' : 'FAIL ') + r.name + (r.ok ? '' : '\n       → ' + r.msg)); });
  console.log(fail.length ? '\n' + fail.length + ' błędów' : '\nwszystko ok (' + results.length + ')');
  process.exitCode = fail.length ? 1 : 0;
});
