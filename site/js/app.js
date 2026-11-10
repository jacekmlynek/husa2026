/* Husa · Znojmo 2026 — render strony z window.TRIP i nawigacja. */
(function () {
  'use strict';

  var T = window.TRIP;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------------- Ikony (inline SVG) ---------------- */
  var ICONS = {
    calendar: '<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
    wine: '<path d="M8 2.5h8l-.6 6.2a3.4 3.4 0 0 1-6.8 0L8 2.5z"/><path d="M12 12.2v8.3M8.5 20.5h7"/><path d="M8.3 6h7.4"/>',
    food: '<path d="M6 2.5v8M3.5 2.5v5a2.5 2.5 0 0 0 5 0v-5M6 10.5v11"/><path d="M17.5 21.5v-19c-2.2 0-4 2.5-4 7 0 2 1 3 2.2 3.2h1.8"/>',
    walk: '<circle cx="13" cy="4" r="2"/><path d="M10 21l2.2-6.5L15 17v4.5M8 11.5l2.5-4.5 3.5 1.5 2.5 3.5 2.5 1M12.2 14.5l-1.5-4.2"/>',
    kid: '<circle cx="12" cy="5" r="2.5"/><path d="M12 8.5v6M8 11l4-1.5 4 1.5M9.5 21l2.5-6.5 2.5 6.5"/>',
    bed: '<path d="M2.5 19.5v-12M2.5 15.5h19v4M21.5 15.5v-3.5a3 3 0 0 0-3-3h-7.5v6.5"/><circle cx="6.8" cy="11.8" r="2"/>',
    parking: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9.5 17V7.5h3.3a2.8 2.8 0 0 1 0 5.6H9.5"/>',
    car: '<path d="M4 16.5V12l2-5.5h12L20 12v4.5"/><path d="M2.5 12h19v4.5h-19z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    coffee: '<path d="M4 8.5h13v5.5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8.5z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M7.5 2.5v3M11 2.5v3"/>',
    towel: '<path d="M5 3.5h14v13H5z"/><path d="M5 16.5v4h14v-4M5 8h14"/>',
    pin: '<path d="M12 21.5s-7-6.2-7-11.5a7 7 0 0 1 14 0c0 5.3-7 11.5-7 11.5z"/><circle cx="12" cy="10" r="2.5"/>',
    phone: '<path d="M5 3.5h3.5l1.8 4.5-2.3 1.5a11 11 0 0 0 6.5 6.5l1.5-2.3 4.5 1.8V19a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3 5.5a2 2 0 0 1 2-2z"/>',
    mail: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M3 6.5l9 6.5 9-6.5"/>',
    link: '<path d="M14 4.5h5.5V10M19.5 4.5L11 13M17.5 14v4.5a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5V8.5A1.5 1.5 0 0 1 6 7h4.5"/>',
    pdf: '<path d="M6 2.5h8.5l4 4v15H6z"/><path d="M14 2.5v4.5h4.5M9 13h6M9 16.5h6"/>',
    chev: '<path d="M6 9.5l6 6 6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.5l3.5 2"/>',
    download: '<path d="M12 3.5v11M7 10l5 5 5-5M4.5 19.5h15"/>',
    book: '<path d="M3.5 5.5c3-1.3 5.8-1.3 8.5.5v13.5c-2.7-1.8-5.5-1.8-8.5-.5z"/><path d="M20.5 5.5c-3-1.3-5.8-1.3-8.5.5v13.5c2.7-1.8 5.5-1.8 8.5-.5z"/>',
    photo: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10.5" r="1.8"/><path d="M21 16l-5-5-8 8"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5l5 5"/>',
    house: '<path d="M3.5 11L12 4l8.5 7"/><path d="M6 9.5v10h12v-10M10 19.5v-5h4v5"/>',
    close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>'
  };
  function icon(name, cls) {
    return '<svg class="icon' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  /* ---------------- Pomocnicze ---------------- */
  function attr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }
  function ext(url, inner, cls) {
    return '<a' + (cls ? ' class="' + cls + '"' : '') + ' href="' + attr(url) + '" target="_blank" rel="noopener noreferrer">' + inner + '</a>';
  }
  function telHref(t) { return 'tel:' + t.replace(/[^\d+]/g, ''); }

  /*
   * Akcje karty w dwóch poziomach:
   *  - przyciski: Mapy i telefony (to, czego używa się w biegu),
   *  - pod nimi drobne linki tekstowe: strony WWW, PDF-y i e-maile.
   */
  function actions(links, contacts) {
    links = links || [];
    contacts = contacts || {};
    var buttons = links.filter(function (l) { return l.kind === 'map'; }).map(function (l) {
      return ext(l.url, icon('pin') + '<span>' + l.label + '</span>', 'btn btn--map');
    });
    (contacts.tel || []).forEach(function (t) {
      buttons.push('<a class="btn" href="' + telHref(t) + '">' + icon('phone') + '<span>' + t + '</span></a>');
    });
    var more = links.filter(function (l) { return l.kind !== 'map'; }).map(function (l) {
      return ext(l.url, icon(l.kind === 'pdf' ? 'pdf' : 'link') + '<span>' + l.label + '</span>', 'tlink');
    });
    (contacts.email || []).forEach(function (e) {
      more.push('<a class="tlink" href="mailto:' + attr(e) + '">' + icon('mail') + '<span>' + e + '</span></a>');
    });
    var out = '';
    if (buttons.length) out += '<div class="actions">' + buttons.join('') + '</div>';
    if (more.length) out += '<div class="more">' + more.join('') + '</div>';
    return out;
  }
  function place(p) {
    return p ? '<p class="place">' + icon('pin') + '<span>' + p + '</span></p>' : '';
  }
  function facts(list) {
    if (!list || !list.length) return '';
    return '<dl class="facts">' + list.map(function (f) { return '<dt>' + f[0] + '</dt><dd>' + f[1] + '</dd>'; }).join('') + '</dl>';
  }
  var STATUS = {
    confirmed: 'Potwierdzone', tbc: 'Do potwierdzenia', optional: 'Opcjonalnie', alt: 'Wariant', rain: 'Na deszcz'
  };
  function statusChip(status, tag) {
    if (!status && !tag) return '';
    return '<span class="status status--' + (status || 'neutral') + '">' + (tag || STATUS[status]) + '</span>';
  }
  function acc(title, sub, body, open, id) {
    return '<details class="acc"' + (id ? ' id="' + id + '"' : '') + (open ? ' open' : '') + '><summary><span><span class="acc__title">' + title + '</span>' +
      (sub ? '<span class="acc__sub">' + sub + '</span>' : '') + '</span>' + icon('chev', 'chev') + '</summary>' +
      '<div class="acc__body">' + body + '</div></details>';
  }

  /* ---------------- Czas w Znojmie ---------------- */
  // Do testów można podać ?teraz=2026-11-13T15:30 (czas lokalny Znojma).
  function pragueNow() {
    var m = /[?&]teraz=(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/.exec(location.search);
    if (m) return { date: m[1], minutes: +m[2] * 60 + +m[3] };
    try {
      var parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: T.meta.timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false
      }).formatToParts(new Date());
      var p = {};
      parts.forEach(function (x) { p[x.type] = x.value; });
      return { date: p.year + '-' + p.month + '-' + p.day, minutes: (parseInt(p.hour, 10) % 24) * 60 + parseInt(p.minute, 10) };
    } catch (e) {
      var d = new Date();
      var pad = function (n) { return (n < 10 ? '0' : '') + n; };
      return { date: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()), minutes: d.getHours() * 60 + d.getMinutes() };
    }
  }
  function toMin(hhmm) { var a = hhmm.split(':'); return +a[0] * 60 + +a[1]; }
  function todayId(now) {
    var id = null;
    T.days.forEach(function (d) { if (d.date === now.date) id = d.id; });
    return id;
  }

  var NOW = pragueNow();
  var TODAY = todayId(NOW);

  /* ---------------- Nagłówek ---------------- */
  function renderHero() {
    $('#hero-dates').textContent = T.meta.dates;
    $('#hero-sub').textContent = T.meta.subtitle;
    $('#hero-quick').innerHTML = T.quick.map(function (q) {
      return ext(q.url, icon(q.icon) + '<span><span class="quick__label">' + q.label + '</span><span class="quick__sub">' + q.sub + '</span></span>', 'quick');
    }).join('');
  }

  /* ---------------- Plan ---------------- */
  function renderInfo(open) {
    var cards = T.info.cards.map(function (c) {
      var imgs = '';
      if (c.images) {
        imgs = '<div class="figures">' + c.images.map(function (im) {
          return '<figure class="figure"><img src="' + im.src + '" width="' + im.w + '" height="' + im.h + '" alt="' + attr(im.alt) + '" loading="lazy" decoding="async"><figcaption>' + im.caption + '</figcaption></figure>';
        }).join('') + '</div>';
      }
      return '<div class="info-card"><div class="info-card__head"><h3>' + icon(c.icon) + '<span>' + c.title + '</span></h3>' + statusChip(c.status, c.tag) + '</div>' +
        (c.text ? '<p class="small">' + c.text + '</p>' : '') + facts(c.facts) + imgs + actions(c.links) + '</div>';
    }).join('');
    return '<details class="info" id="info"' + (open ? ' open' : '') + '><summary>' +
      '<span class="info__sum"><span class="info__title">' + T.info.title + '</span>' +
      '<span class="info__keys"><span>Parking za szlabanem</span><span>Wymeldowanie nd. 10:00</span></span></span>' +
      icon('chev', 'chev') + '</summary><div class="info__body">' + cards + '</div></details>';
  }

  function nextIndex(d) {
    if (d.id !== TODAY) return -1;
    for (var i = 0; i < d.items.length; i++) {
      if (d.items[i].at && toMin(d.items[i].at) + 45 >= NOW.minutes) return i;
    }
    return -1;
  }

  /* Zdjęcia lokali (tools/build-venue-media.py): baner w karcie restauracji, miniatura w planie dnia. */
  var VM = window.VENUE_MEDIA || {};
  function venueCredit(id) {
    var v = VM[id];
    return v && v.img ? '<p class="vcredit">Zdjęcie: ' + ext(v.creditUrl, v.credit, 'credit') + '</p>' : '';
  }
  function venueBanner(id, name) {
    var v = VM[id];
    if (!v || !v.img) return '';
    return '<figure class="vbanner"><img src="' + v.img + '" width="720" height="480" alt="' + attr('Wejście i szyld: ' + name) + '" loading="lazy" decoding="async">' +
      (v.logo ? '<span class="vbanner__logo' + (v.logoDark ? ' vbanner__logo--dark' : '') + '"><img src="' + v.logo + '" alt="' + attr('Logo: ' + name) + '" loading="lazy"></span>' : '') +
      '<figcaption>Zdjęcie: ' + ext(v.creditUrl, v.credit, 'credit') + '</figcaption></figure>';
  }
  function venueThumb(id, name) {
    var v = VM[id];
    return v && v.img ? '<img class="vthumb" src="' + v.img + '" width="720" height="480" alt="' + attr('Wejście: ' + name) + '" loading="lazy" decoding="async">' : '';
  }
  function titled(tag, title, place_, venue) {
    var head = '<' + tag + '>' + title + '</' + tag + '>' + place(place_);
    return venue && VM[venue] && VM[venue].img ? '<div class="vhead"><div class="vhead__txt">' + head + '</div>' + venueThumb(venue, title) + '</div>' : head;
  }

  function renderItem(it, isNext) {
    var cls = 'item' + (it.highlight ? ' item--hl' : '') + (isNext ? ' item--next' : '');
    var alt = '';
    if (it.alt) {
      var a = it.alt;
      alt = '<div class="alt' + (a.status === 'rain' ? ' alt--rain' : '') + '">' +
        '<div class="alt__label">' + (a.status ? statusChip(a.status, a.label) : a.label) + '</div>' +
        titled('h4', a.title, a.place, a.venue) + '<p class="small">' + a.text + '</p>' + actions(a.links, a.contacts) +
        (a.route ? routeLink(a.route) : '') + (a.venue ? venueCredit(a.venue) : '') + '</div>';
    }
    return '<li class="' + cls + '">' +
      '<div class="item__top"><span class="time">' + it.time + '</span>' +
      (isNext ? '<span class="next-label">Następne</span>' : '') + statusChip(it.status, it.tag) + '</div>' +
      titled('h3', it.title, it.place, it.venue) +
      (it.text ? '<p>' + it.text + '</p>' : '') +
      (it.note ? '<p class="item__note">' + it.note + '</p>' : '') +
      actions(it.links, it.contacts) +
      (it.route ? routeLink(it.route) : '') +
      (it.infoLink ? '<button type="button" class="tlink tlink--btn" data-open-info>' + icon('photo') + '<span>' + it.infoLink + '</span></button>' : '') +
      (it.venue ? venueCredit(it.venue) : '') +
      alt + '</li>';
  }

  function renderDay(d) {
    var nextIdx = nextIndex(d);
    var also = d.also ? '<div class="card card--note"><h3>' + d.also.title + '</h3><p class="small">' + d.also.text + '</p>' + actions(d.also.links) + '</div>' : '';
    return '<div class="day" id="day-' + d.id + '" hidden>' +
      '<div class="day-head"><div class="day-head__kicker">' + d.name + (d.id === TODAY ? ' · dziś' : '') + '</div>' +
      '<h2>' + d.title + '</h2><p>' + d.lead + '</p></div>' +
      '<ol class="timeline">' + d.items.map(function (it, idx) { return renderItem(it, idx === nextIdx); }).join('') + '</ol>' +
      (also ? '<div class="day-also">' + also + '</div>' : '') + '</div>';
  }

  function renderPlan(infoOpen) {
    var chips = T.days.map(function (d) {
      return '<button class="day-btn" type="button" data-day="' + d.id + '" aria-pressed="false" aria-label="' + attr(d.name + ' · ' + d.theme) + '">' +
        (d.id === TODAY ? '<span class="today-dot">dziś</span>' : '') +
        '<span class="day-btn__d">' + d.short + '</span><span class="day-btn__n">' + d.num + '</span><span class="day-btn__t">' + d.theme + '</span></button>';
    }).join('');
    return renderInfo(infoOpen) +
      '<div class="days" role="group" aria-label="Dni wyjazdu">' + chips + '</div>' +
      T.days.map(renderDay).join('');
  }

  /* ---------------- Restauracje ---------------- */
  function renderRestaurant(r) {
    var rating = r.rating ? '<span class="rating"><span class="star" aria-hidden="true">★</span> ' + r.rating +
      (r.reviews ? ' <span class="muted">(' + r.reviews + ')</span>' : '') + '<span class="sr"> w Google</span></span>' : '';
    return '<article class="card">' + (r.venue ? venueBanner(r.venue, r.name) : '') +
      (r.when ? '<div class="when">' + r.when + '</div>' : '') +
      '<div class="rest__head"><h3>' + r.name + '</h3>' + rating + '</div>' +
      place(r.address) + '<p class="small">' + r.text + '</p>' +
      (r.hours ? '<p class="small muted hours">' + icon('clock') + '<span>' + r.hours + '</span></p>' : '') +
      actions(r.links, r.contacts) + '</article>';
  }
  function renderFood() {
    var R = T.restaurants;
    return '<div class="panel-head"><h2>Restauracje</h2><p>' + R.intro + '</p></div>' +
      R.groups.map(function (g) {
        return '<h2 class="section-title">' + g.title + '</h2>' +
          '<div class="rest' + (g.compact ? ' grid-3' : '') + '">' + g.items.map(renderRestaurant).join('') + '</div>';
      }).join('');
  }

  /* ---------------- Wino ---------------- */
  var WN = window.WINES || { wines: {}, producers: {}, topZnojmo: [], topMorava: [], champions: [], catalog: [], flavors: [], samples: [], grapeWines: {} };
  var WM = window.WINE_MEDIA || { bottles: {}, logos: {} };
  var FLAV = {};
  WN.flavors.forEach(function (f) { FLAV[f.id] = f; });

  function wine(id) { return WN.wines[id]; }
  function producer(w) { return WN.producers[w.p] || { name: '', place: '', region: '' }; }
  function fmt(n) { return String(n).replace('.', ','); }
  var TOP14 = (WN.topZnojmo || []).concat(WN.topMorava || []);
  // Punkty konkursowe: regionalne z dwoma miejscami po przecinku (średnia z trzech ocen), Salon z jednym.
  function ptsTxt(w) { return fmt(w.pts.toFixed(/regionalny/.test(w.comp) ? 2 : 1)); }
  var COMP_SHORT = { 'konkurs regionalny 2026': 'regionalny 2026', 'Salon vín 2026': 'Salon 2026', 'Salon vín 2025': 'Salon 2025' };
  // Poziom konkursu: Salon vín (krajowy finał) = złota etykieta z pucharem, konkurs regionalny = brązowa z medalem.
  var LEVEL_ICON = {
    salon: '<svg class="score__i" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h10v4a5 5 0 0 1-10 0V4ZM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M12 13v3M8.5 20h7M10 16h4l.5 4h-5l.5-4Z"/></svg>',
    reg: '<svg class="score__i" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3l3 7M16 3l-3 7"/><circle cx="12" cy="15.5" r="5"/><path d="M12 13.2v4.6"/></svg>'
  };
  var LEVEL_WHY = {
    salon: '<strong>Salon vín</strong> to krajowy finał. Wino przeszło konkurs regionalny i dwie kolejne rundy, a złoto dostaje tylko 100 win z całych Czech.',
    reg: '<strong>Konkurs regionalny</strong> to pierwszy etap: oceniane są tylko wina z jednego podobszaru. Tych punktów nie porównuj wprost z punktami Salonu vín.'
  };
  function level(w) {
    var s = (w.comp || '') + ' ' + (w.award || '');
    return /Salon/.test(s) ? 'salon' : /regionaln/.test(s) ? 'reg' : '';
  }
  function scoreEl(w) {
    var lv = level(w), cls = 'score' + (lv ? ' score--' + lv : ''), ic = LEVEL_ICON[lv] || '';
    if (w.pts) return '<span class="' + cls + '">' + ic + '<b class="score__n">' + ptsTxt(w) + ' pkt</b><span class="score__t">' + w.award + ' · ' + (COMP_SHORT[w.comp] || w.comp) + '</span></span>';
    if (w.award) return '<span class="' + cls + '">' + ic + '<span class="score__t">' + w.award + '</span></span>';
    return w.pick ? '<span class="pick">' + w.pick + '</span>' : '';
  }
  function scoreLegend() {
    return '<div class="score-legend">' + ['salon', 'reg'].map(function (lv) {
      return '<p><span class="score score--' + lv + '">' + LEVEL_ICON[lv] + '<span class="score__t">' + (lv === 'salon' ? 'Salon vín' : 'regionalny') + '</span></span> ' +
        LEVEL_WHY[lv].replace(/^<strong>[^<]*<\/strong> to /, '') + '</p>';
    }).join('') + '</div>';
  }
  // Na liście sam kolor i słodycz; kategoria z nawiasu („výběr z hroznů”) jest w oknie wina.
  function plainStyle(w) { return w.style.replace(/\s*\([^)]*\)/, ''); }
  function sugarLine(w) {
    var t = [];
    if (w.sugar != null) t.push('cukier ' + fmt(w.sugar) + ' g/l');
    if (w.acid != null) t.push('kwasy ' + fmt(w.acid) + ' g/l');
    return t.length ? '<span class="wrow__sugar">' + t.join(' · ') + '</span>' : '';
  }
  function wineTitle(w) { return producer(w).name + ' · ' + w.name + ' ' + w.year; }

  // Zdjęcie butelki albo — gdy źródła go nie mają — stylizowana butelka w kolorze wina.
  function bottleImg(id, cls) {
    var w = wine(id), m = WM.bottles[id];
    cls = cls || 'bimg';
    if (m) return '<img class="' + cls + '" src="' + m.img + '" alt="' + attr('Butelka: ' + wineTitle(w)) + '" width="300" height="500" loading="lazy" decoding="async">';
    var red = /czerwone/.test(w.style), fizz = /musuj/.test(w.style);
    var glass = red ? '#4a0d1a' : (fizz ? '#3f5f46' : '#6f7d3a');
    var label = producer(w).name.split(' ')[0].slice(0, 9).toUpperCase();
    return '<svg class="' + cls + ' bimg--fallback" viewBox="0 0 300 500" role="img" aria-label="' + attr('Brak zdjęcia: ' + wineTitle(w)) + '">' +
      '<rect width="300" height="500" fill="#fff"/>' +
      '<path d="M135 30h30v95c0 18 45 40 45 95v240c0 12-8 20-20 20H110c-12 0-20-8-20-20V220c0-55 45-77 45-95z" fill="' + glass + '"/>' +
      '<rect x="100" y="280" width="100" height="120" rx="6" fill="#fbf6ef"/>' +
      '<text x="150" y="335" text-anchor="middle" font-family="Georgia,serif" font-size="17" fill="#4a0014">' + label + '</text>' +
      '<text x="150" y="362" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="#6b5a5d">' + w.year + '</text></svg>';
  }
  function logoEl(pid) {
    var m = WM.logos[pid], p = WN.producers[pid] || { name: pid };
    if (m) return '<span class="wlogo' + (m.dark ? ' wlogo--dark' : '') + '"><img src="' + m.img + '" alt="' + attr('Logo: ' + p.name) + '" loading="lazy"></span>';
    return '<span class="wlogo wlogo--text">' + p.name + '</span>';
  }
  // Podobszar: z wina (gdy parcela leży gdzie indziej niż siedziba producenta) albo z producenta.
  function regionChip(p, w) {
    var r = (w && w.region) || p.region, label = (w && w.region) || p.label || p.region;
    return r ? '<span class="region region--' + r.toLowerCase() + '">' + label + '</span>' : '';
  }
  function flavorChips(w, max) {
    return (w.tags || []).slice(0, max || 8).map(function (t) {
      var f = FLAV[t];
      return f ? '<span class="fchip" style="--fc:' + f.color + '">' + (f.short || f.label) + '</span>' : '';
    }).join('');
  }
  function meters(w) {
    if (w.sugar == null && w.acid == null) return '';
    var row = function (label, val, cls) {
      if (val == null) return '';
      var pct = Math.max(4, Math.min(100, val * 10)); // skala 0–10 g/l
      return '<span class="meter ' + cls + '"><span class="meter__l">' + label + '</span><span class="meter__bar"><i style="width:' + pct + '%"></i></span><span class="meter__v">' + fmt(val) + ' g/l</span></span>';
    };
    return '<span class="meters">' + row('Cukier', w.sugar, 'meter--sugar') + row('Kwasy', w.acid, 'meter--acid') + '</span>';
  }
  function wineTile(id, extra, cls) {
    var w = wine(id);
    if (!w) return '';
    return '<button type="button" class="wtile' + (cls ? ' ' + cls : '') + '" data-wine="' + id + '">' +
      '<span class="wtile__img">' + bottleImg(id) + '</span>' +
      '<span class="wtile__body"><span class="wtile__prod">' + producer(w).name + '</span>' +
      '<span class="wtile__name">' + w.name + ' ' + w.year + '</span>' +
      (w.pts ? '<span class="wtile__pts wtile__pts--' + level(w) + '">' + (LEVEL_ICON[level(w)] || '') + ptsTxt(w) + ' pkt</span>' : '') + (extra || '') +
      (w.price ? '<span class="wtile__price">' + w.price + '</span>' : '') + '</span></button>';
  }
  function wineRow(id, rank, showRegion) {
    var w = wine(id), p = producer(w);
    return '<button type="button" class="wrow" data-wine="' + id + '">' +
      '<span class="wrow__rank">' + rank + '</span>' +
      '<span class="wrow__img">' + bottleImg(id) + '</span>' +
      '<span class="wrow__body">' +
        '<span class="wrow__top">' + logoEl(w.p) + (showRegion ? regionChip(p, w) : '') + '</span>' +
        '<span class="wrow__name">' + w.name + ' ' + w.year + '</span>' +
        '<span class="wrow__prod">' + p.name + ' · ' + plainStyle(w) + '</span>' +
        scoreEl(w) +
        '<span class="wrow__short">' + w.short + '</span>' + sugarLine(w) +
        '<span class="wrow__foot">' +
          (w.price ? '<span class="price">' + w.price + '</span>' : '<span class="price--na">cena do sprawdzenia</span>') + '</span>' +
      '</span></button>';
  }
  function champCard(id) {
    var w = wine(id), p = producer(w);
    return '<button type="button" class="wchamp" data-wine="' + id + '">' +
      '<span class="wchamp__img">' + bottleImg(id) + '</span>' +
      '<span class="wchamp__body">' + scoreEl(w) +
        '<span class="wrow__name">' + w.name + ' ' + w.year + '</span>' +
        '<span class="wrow__prod">' + p.name + ' · ' + w.origin + '</span>' +
        '<span class="wchamp__warn' + (w.avail ? ' wchamp__warn--ok' : '') + '">' + (w.avail || 'Trudno dostępne') + ' · szczegóły</span></span></button>';
  }

  /* Okno szczegółów wina (natywny <dialog>, na telefonie wysuwa się od dołu). */
  function sheetHtml(id) {
    var w = wine(id), p = producer(w), m = WM.bottles[id];
    var credit = m ? 'Zdjęcie: ' + ext(m.creditUrl, m.credit, 'credit') : 'Brak zdjęcia butelki w źródłach';
    return '<div class="sheet__grid">' +
      '<div class="sheet__img">' + bottleImg(id, 'bimg bimg--big') + '<p class="credit-line">' + credit + '</p></div>' +
      '<div class="sheet__info">' + logoEl(w.p) +
        '<h3 class="sheet__title" id="sheet-title">' + w.name + ' ' + w.year + '</h3>' +
        '<p class="muted small">' + p.name + (p.place ? ' · ' + p.place : '') + '</p>' +
        '<div class="sheet__badges">' + regionChip(p, w) + '<span class="tag">' + w.style + '</span>' + scoreEl(w) + '</div>' +
        (LEVEL_WHY[level(w)] ? '<p class="score-why">' + LEVEL_WHY[level(w)] + '</p>' : '') +
        (w.price ? '<p class="sheet__price">' + w.price + '</p>' : '') +
        meters(w) + (w.alc ? '<p class="small muted">Alkohol ' + fmt(w.alc) + '% obj.</p>' : '') +
        (w.tags && w.tags.length ? '<div class="fchips">' + flavorChips(w) + '</div>' : '') +
        (w.origin ? '<p class="origin">' + w.origin + '</p>' : '') +
        '<p class="small">' + w.text + '</p>' + (w.note ? '<p class="item__note">' + w.note + '</p>' : '') +
        actions(w.links) +
      '</div></div>' + aromaBlock(id);
  }

  /* Profil degustatorów Salonu vín 2026: liczby odczytane z ich wykresów (tools/read-aroma-charts.py). */
  var AR = window.AROMA || {};
  function bars(obj, keys) {
    return '<div class="abars">' + keys.map(function (k) {
      var v = obj[k];
      return '<div class="abar' + (/mineraln/.test(k) ? ' abar--min' : '') + '"><span class="abar__l">' + k + '</span>' +
        '<span class="abar__bar"><i style="width:' + (v * 10) + '%"></i></span><span class="abar__v">' + fmt(v) + '</span></div>';
    }).join('') + '</div>';
  }
  /* Wina bez wykresu Salonu: grupy aromatów ze słownych opisów (tools/build-wine-notes.py). Bez skali: słowo pada albo nie. */
  var WNOTES = window.WINE_NOTES || {};
  function nchips(gs, cls) {
    return '<div class="nchips">' + gs.map(function (g) {
      return '<span class="nchip' + (/mineraln/.test(g) ? ' nchip--min' : '') + (cls || '') + '">' + g + '</span>';
    }).join('') + '</div>';
  }
  function nquote(q, src) {
    return '<blockquote class="nquote"><p>„' + q + '”</p><footer>' + src + '</footer></blockquote>';
  }
  function notesBlock(id) {
    var N = WNOTES[id] || { groups: [], quotes: [] };
    var noChart = 'Profil degustatorów w skali 0–10 jest tylko dla ' + Object.keys(AR).length + ' win: Salon vín publikuje wykresy aromatów wyłącznie dla 100 złotych win finału 2026, a tego wina wśród nich nie ma.';
    var quotes = N.quotes.map(function (q) {
      return nquote(q.q, ext(q.url, q.src, 'credit') + (q.remark ? ' · ' + q.remark : ''));
    });
    if (N.other) quotes.push(nquote(N.other.q, 'Rocznik ' + N.other.year + ', nie ' + wine(id).year + ' · ' + ext(N.other.url, N.other.src, 'credit')));
    var h = '<section class="aroma aroma--text"><h4>Co piszą o nim źródła <span class="muted">· bez skali</span></h4>';
    if (N.groups.length) h += '<p class="aroma__h">Aromaty wymienione w opisach</p>' + nchips(N.groups);
    else if (!N.est && !N.other) h += '<p class="small muted">Żadne sprawdzone źródło nie opisuje smaku tego rocznika.</p>';
    if (N.other && N.other.groups.length) h += '<p class="aroma__h">Z opisu rocznika ' + N.other.year + '</p>' + nchips(N.other.groups, ' nchip--soft');
    if (N.est) h += '<p class="aroma__h">Tylko w szacunku sklepu, nie z degustacji</p>' + nchips(N.est, ' nchip--soft') +
      '<p class="credit-line">' + ext(N.estUrl, 'Vínovín', 'credit') + ' sam pisze, że opis to „odhad” z analizy, położenia i poprzednich roczników.</p>';
    if (quotes.length) h += '<p class="aroma__h">' + (quotes.length > 1 ? 'Opisy' : 'Opis') + ' w tłumaczeniu z czeskiego</p>' + quotes.join('');
    return h + '<p class="credit-line">Grupy aromatów jak w arkuszu Salonu, ale oznaczają tylko, że słowo pada w opisie, a nie jego natężenie. ' + noChart + '</p></section>';
  }
  function aromaBlock(id) {
    var A = AR[id];
    if (!A) return notesBlock(id);
    var aromaKeys = Object.keys(A.aroma).sort(function (a, b) { return A.aroma[b] - A.aroma[a]; });
    var top = aromaKeys.filter(function (k) { return A.aroma[k] >= 2; }).slice(0, 7);
    var minKey = aromaKeys.filter(function (k) { return /mineraln/.test(k); })[0];
    if (minKey && top.indexOf(minKey) < 0) top.push(minKey); // mineralność pokazujemy zawsze, gdy jest na wykresie
    return '<section class="aroma">' +
      '<h4>Profil degustatorów Salonu vín 2026 <span class="muted">· skala 0–10</span></h4>' +
      '<div class="aroma__cols"><div><p class="aroma__h">Struktura</p>' + bars(A.structure, Object.keys(A.structure)) + '</div>' +
      '<div><p class="aroma__h">Najmocniejsze aromaty</p>' + bars(A.aroma, top) + '</div></div>' +
      (minKey ? '' : '<p class="muted">Arkusz Salonu dla win czerwonych nie ma osi mineralności, jest za to „grzyby i ziemiste”.</p>') +
      '<p class="credit-line">Odczyt z wykresu Salonu (dokładność ok. ±0,3) · ' + ext(A.chart, 'oryginalny wykres', 'credit') + '</p></section>';
  }

  /* Ściąga „Jak czytać czeskie wino”: kategorie, słodycz, regiony, mineralność. */
  function renderGuide() {
    var G = T.wine.guide, M = window.WINE_MAP;
    if (!G) return '';
    var NM_MIN = 12, NM_MAX = 34;
    var ladder = '<div class="ladder">' + G.ladder.map(function (r, i) {
      var head = (r.priv && !G.ladder[i - 1].priv) ? '<p class="ladder__group">Jakostní víno s přívlastkem, czyli z „przydomkiem”</p>' : '';
      var w = Math.max(6, (r.nm - NM_MIN) / (NM_MAX - NM_MIN) * 100);
      return head + '<div class="lad">' +
        '<div class="lad__name"><strong lang="cs">' + r.cz + '</strong><span>' + r.pl + '</span></div>' +
        '<div class="lad__bar"><i style="width:' + w + '%"></i><b>' + r.nm + ' °NM</b></div>' +
        '<div class="lad__stat">' + (r.note ? r.note + ' · ' : '') + fmt(r.pts) + ' pkt · ' + r.dry9 + '% do 9 g/l · ' + r.n + ' win</div></div>';
    }).join('') + '</div>' +
      '<p class="lad__legend">Pasek: minimalna dojrzałość gron według ustawy. Pod paskiem: średnia ocena (pkt na 100), udział win do 9 g/l cukru i liczba nagrodzonych win w Salonie vín 2024–2026.</p>';
    var panes = {
      kategorie: '<p class="small">' + G.ladderIntro + '</p>' + ladder +
        '<ul class="takeaways">' + G.takeaways.slice(0, 2).map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' +
        '<details class="guide__more"><summary>Więcej: wino ziemskie, dosładzanie, VOC</summary><ul class="takeaways">' +
        G.takeaways.slice(2).map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul></details>',
      slodycz: '<div class="sweet">' + G.sweetness.map(function (s, i) {
          return '<div class="sweet__row"><span class="sweet__sw sweet__sw--' + i + '"></span><div><strong lang="cs">' + s.cz + '</strong> · ' + s.pl +
            ' <span class="sweet__range">' + s.range + '</span>' + (s.ext ? '<span class="sweet__ext">' + s.ext + '</span>' : '') + '</div></div>';
        }).join('') + '</div>' +
        '<div class="sweetbar" aria-hidden="true"><i class="sb0"></i><i class="sb1"></i><i class="sb2"></i><i class="sb3"></i></div>' +
        '<div class="sweetbar__ticks" aria-hidden="true"><span>0</span><span>4–9</span><span>12–18</span><span>45 g/l</span></div>' +
        '<p class="item__note">' + G.sweetExample + '</p>',
      regiony: M ? '<figure class="wmap"><img src="' + M.img + '" width="' + M.w + '" height="' + M.h + '" alt="Mapa winiarskiej Moraw: cztery podoblasti, 14 apelacji VOC i winnice złotych win Salonu 2026" loading="lazy" decoding="async">' +
          '<figcaption>Kropki: winnice ' + M.goldPoints + ' złotych win Salonu 2026. Barwne tło jest poglądowe, dokładne granice podoblasti: ' +
          ext(G.sources[3].url, 'mapa w Commons', 'credit') + ' · © OpenStreetMap contributors</figcaption></figure>' +
          '<p class="small">Morawy to jeden obszar winiarski (vinařská oblast Morava) z czterema podobszarami. Znojmo, Šatov i Nový Šaldorf leżą w <strong>znojemskiej</strong>, a Mikulov, Pálava i Valtice w <strong>mikulowskiej</strong>.</p>' +
          '<div class="subs">' + M.subregions.map(function (s) {
            var vocs = M.voc.filter(function (v) { return v.subregion === s.id; });
            return '<div class="sub"><p class="sub__h"><span class="sub__dot" style="background:' + s.color + '"></span><strong lang="cs">' + s.id + '</strong>' +
              '<span class="muted"> · ' + s.gold2026 + ' złotych win 2026</span></p><ol class="sub__voc">' + vocs.map(function (v) {
                return '<li value="' + v.n + '">' + v.name + ' <span class="muted">(' + v.village + ')</span></li>';
              }).join('') + '</ol></div>';
          }).join('') + '</div>' +
          '<p class="small muted">VOC (víno originální certifikace) to apelacje zakładane przez stowarzyszenia winiarzy z danego miejsca. Lista według broszury „Vína z Moravy, vína z Čech” 2021–2022 i win VOC w Salonie 2024–2026. W Czechach jest jeszcze VOC Mělník.</p>' : '',
      mineralnosc: '<p class="small">' + G.minerality.text + '</p><p class="small">' + G.minerality.scale + '</p>' + actions(G.minerality.links)
    };
    var tabs = [['kategorie', 'Kategorie'], ['slodycz', 'Słodycz'], ['regiony', 'Regiony'], ['mineralnosc', 'Mineralność']];
    return '<section class="card guide" id="w-sciaga"><h2 class="guide__title">' + G.title + '</h2>' +
      '<div class="seg" role="group" aria-label="Ściąga">' + tabs.map(function (t, i) {
        return '<button type="button" class="seg__b" data-guide="' + t[0] + '" aria-pressed="' + (i === 0) + '">' + t[1] + '</button>';
      }).join('') + '</div>' +
      tabs.map(function (t, i) { return '<div class="guide__pane" data-pane="' + t[0] + '"' + (i ? ' hidden' : '') + '>' + panes[t[0]] + '</div>'; }).join('') +
      '<details class="guide__src"><summary>Źródła</summary>' + actions(G.sources) + '</details></section>';
  }
  function sheetEl() {
    var d = document.getElementById('wine-sheet');
    if (d) return d;
    d = document.createElement('dialog');
    d.id = 'wine-sheet';
    d.className = 'sheet';
    d.setAttribute('aria-labelledby', 'sheet-title');
    d.innerHTML = '<button type="button" class="sheet__close" data-close-sheet aria-label="Zamknij">✕</button><div class="sheet__content"></div>';
    document.body.appendChild(d);
    d.addEventListener('click', function (e) {
      if (e.target === d || e.target.closest('[data-close-sheet]')) closeSheet();
    });
    return d;
  }
  function openSheet(id) {
    var salon = /^salon:/.test(id);
    if (salon ? !SALON_BY_ID[id] : !wine(id)) return;
    var d = sheetEl();
    d.querySelector('.sheet__content').innerHTML = salon ? salonSheetHtml(SALON_BY_ID[id]) : sheetHtml(id);
    if (typeof d.showModal === 'function') { if (!d.open) d.showModal(); } else d.setAttribute('open', '');
    d.querySelector('.sheet__content').scrollTop = 0;
  }
  function closeSheet() {
    var d = document.getElementById('wine-sheet');
    if (!d) return;
    if (typeof d.close === 'function' && d.open) d.close(); else d.removeAttribute('open');
  }

  /* ---------------- Znajdź wino (spec: specs/wyszukiwanie-tekstowe/DEVELOPMENT-PLAN.md) ----------------
   * Faza 1: 56 win ze strony, indeks budowany przy pierwszym wejściu w pole.
   * Faza 2: wina z Salonu vín (js/wine-index.js), dociągane przy pierwszym wejściu w pole i indeksowane w porcjach.
   * Lista podpowiedzi: według dopasowania. Lista wyników (kategoria, „Pokaż wszystkie”): od najwyżej ocenionych, po 20. */
  var WSX = window.WineSearch;
  var SALON_BY_ID = {};
  var SRCH = { engine: null, site: null, full: false, loading: false, failed: false, q: '', view: '', list: null, pages: null, active: -1, live: 0, blurT: 0 };
  // Lista wyników: każda grupa (przewodnik, Salon) zaczyna od 8 win, „Pokaż kolejne” dokłada po 20.
  // Dzięki temu przy dużych kategoriach (Region Znojmo: 47 + 167) obie grupy są widoczne od razu.
  var PAGE_FIRST = 8, PAGE = 20;
  var CAT_ICON = { region: 'pin', odmiana: 'wine', winiarnia: 'house', miejsce: 'pin' };
  var SALON_CAT = { A: 'białe · wytrawne', B: 'białe · półwytrawne lub półsłodkie', F: 'półwytrawne lub półsłodkie', C: 'słodkie', D: 'różowe lub klaret', E: 'czerwone · wytrawne', G: 'musujące' };
  var REGION_CLASS = { Znojmo: 'znojmo', Mikulov: 'mikulov', Pavlovice: 'pavlovice', Slovacko: 'slovacko', Valtice: 'valtice' };

  function searchBox() {
    if (!WSX || !window.MiniSearch) return '';
    return '<div class="wsearch" id="wsearch" role="search">' +
      '<label class="sr-only" for="wsearch-q">Znajdź wino</label>' +
      '<div class="wsearch__field">' + icon('search', 'wsearch__icon') +
        '<input id="wsearch-q" class="wsearch__input" type="search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="wsug"' +
        ' autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" maxlength="80" placeholder="Wino, winiarnia, wieś…">' +
        '<button type="button" class="wsearch__clear" data-wsearch-clear aria-label="Wyczyść wyszukiwanie" hidden>' + icon('close') + '</button>' +
      '</div><p class="wsearch__scope" id="wsearch-scope">' + scopeText() + '</p>' +
      '<p class="sr-only" id="wsearch-live" aria-live="polite"></p></div>';
  }
  // Liczby nad polem liczone z danych, żeby nie zestarzały się przy dodawaniu win (wcześniej: „ponad 50 butelek” na sztywno).
  function guideCounts() {
    var ids = Object.keys(WN.wines), prods = {};
    ids.forEach(function (id) { prods[WN.wines[id].p] = 1; });
    var np = Object.keys(prods).length;
    return ids.length + ' ' + plural(ids.length) + ' z ' + np + ' winiarni w przewodniku';
  }
  // Pod polem: to, czego nie ma w napisie nad nim. Dokładna liczba win z Salonu (bez duplikatów ze strony) jest znana
  // dopiero po wczytaniu indeksu; wcześniej „ponad 400” (pilnuje tego test w specs/wyszukiwanie-tekstowe/testy.js).
  function scopeText(salonCount) {
    return 'Wyszukiwarka obejmuje też ' + (salonCount || 'ponad 400') + ' medalistów Salonu vín 2024–2026.';
  }
  function isPhone() { return window.innerWidth < 900; }
  function plural(n) { return n === 1 ? 'wino' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'wina' : 'win'); }

  /* Indeks: faza 1 od razu, faza 2 (Salon) w tle. */
  // retry = true tylko przy wejściu w pole: bez internetu nie ponawiamy pobierania przy każdej literze.
  function ensureEngine(retry) {
    if (!SRCH.engine) {
      SRCH.site = WSX.fromSite(WN);
      SRCH.engine = WSX.create(SRCH.site);
    }
    if (SRCH.full || SRCH.loading || (SRCH.failed && !retry)) return;
    if (window.WINE_INDEX) { buildFull(); return; }
    if (window.__GAS__) return;
    SRCH.loading = true;
    var s = document.createElement('script');
    s.src = 'js/wine-index.js';
    s.onload = function () { SRCH.loading = false; SRCH.failed = false; buildFull(); };
    s.onerror = function () { // offline przy pierwszym użyciu: zostają wina ze strony
      SRCH.loading = false; SRCH.failed = true;
      if (s.parentNode) s.parentNode.removeChild(s);
      if (SRCH.view === 'list' && SRCH.list) refreshList();
    };
    document.head.appendChild(s);
  }
  function buildFull() {
    if (SRCH.full || !window.WINE_INDEX) return;
    SRCH.loading = true;
    var idle = window.requestIdleCallback || function (f) { return setTimeout(f, 50); };
    idle(function () {
      window.WINE_INDEX.wines.forEach(function (r) { SALON_BY_ID[r.id] = r; });
      var sal = WSX.fromSalon(window.WINE_INDEX, SRCH.site, SRCH.site.length);
      WSX.createAsync(SRCH.site.concat(sal)).then(function (eng) {
        SRCH.engine = eng; SRCH.full = true; SRCH.loading = false;
        var sc = $('#wsearch-scope');
        if (sc) sc.textContent = scopeText(sal.length);
        // Przy otwartym oknie wina nie przerysowujemy listy pod nim: po zamknięciu fokus ma wrócić na dotknięty wiersz.
        var sheet = document.getElementById('wine-sheet');
        if (sheet && sheet.open) { sheet.addEventListener('close', refreshView, { once: true }); return; }
        refreshView();
      });
    });
  }

  function refreshView() {
    if (SRCH.view === 'sug' && SRCH.q && !$('#wsout').hidden) renderSuggest();
    else if (SRCH.view === 'list' && SRCH.list) refreshList();
  }

  /* Elementy listy. */
  function hl(text, terms) { return WSX.highlight(text, terms, attr); }
  function salonBottle(r, cls) {
    var glass = r.c === 'E' ? '#4a0d1a' : (r.c === 'G' ? '#3f5f46' : (r.c === 'D' ? '#b5566a' : '#6f7d3a'));
    // na etykiecie pierwsze znaczące słowo nazwy producenta, bez „Vinařství”, tytułów i form prawnych
    var words = r.p.split(/[\s,]+/).filter(function (x) { return x && !/^(vinařství|vinné|sklepy|víno|rodiny|ing\.?|mgr\.?|bc\.?|rndr\.?|spol\.?|s\.?r\.?o\.?|a\.s\.?|-)$/i.test(x); });
    var person = /^(ing|mgr|bc|rndr)\.?\s/i.test(r.p); // osoba z tytułem: nazwisko, nie imię
    var label = ((person ? words[words.length - 1] : words[0]) || r.p).slice(0, 9).toUpperCase();
    return '<svg class="' + (cls || 'bimg') + ' bimg--fallback" viewBox="0 0 300 500" role="img" aria-label="' + attr('Brak zdjęcia: ' + r.p + ' · ' + r.w + ' ' + r.r) + '">' +
      '<rect width="300" height="500" fill="#fff"/>' +
      '<path d="M135 30h30v95c0 18 45 40 45 95v240c0 12-8 20-20 20H110c-12 0-20-8-20-20V220c0-55 45-77 45-95z" fill="' + glass + '"/>' +
      '<rect x="100" y="280" width="100" height="120" rx="6" fill="#fbf6ef"/>' +
      '<text x="150" y="335" text-anchor="middle" font-family="Georgia,serif" font-size="17" fill="#4a0014">' + attr(label) + '</text>' +
      '<text x="150" y="362" text-anchor="middle" font-family="Georgia,serif" font-size="15" fill="#6b5a5d">' + attr(r.r) + '</text></svg>';
  }
  // Nazwa producenta z Salonu na kafelkach i w podpowiedziach: jak na stronie, gdy to ta sama winiarnia
  // („ZNOVÍN ZNOJMO, a.s.” → „Znovín Znojmo”), w przeciwnym razie bez formy prawnej. Pełna nazwa jest w oknie wina.
  function salonProd(r) {
    var d = SRCH.engine && SRCH.engine.doc(r.id);
    if (d && /^site:/.test(d.pid)) return d.prodName;
    return r.p.replace(/,?\s*(spol\.\s*s\s*r\.\s*o\.|s\.\s*r\.\s*o\.|a\.\s*s\.|v\.\s*o\.\s*s\.)\s*$/i, '').trim();
  }
  // Najlepszy medal (najwięcej punktów): ten sam, według którego sortujemy listę wyników.
  function bestMedal(r) {
    return r.m.reduce(function (a, m) { return (m[2] || 0) > (a[2] || 0) ? m : a; }, r.m[0]);
  }
  function salonPts(r) {
    var m = bestMedal(r);
    return '<span class="wtile__pts wtile__pts--salon">' + LEVEL_ICON.salon + (m[2] ? fmt(m[2]) + ' pkt · ' : '') + (m[1] === 'G' ? 'złoto' : 'srebro') + ' Salon ' + m[0] + '</span>';
  }
  function salonTile(r) {
    return '<button type="button" class="wtile wtile--salon" data-wine="' + attr(r.id) + '">' +
      '<span class="wtile__img">' + salonBottle(r) + '</span>' +
      '<span class="wtile__body"><span class="wtile__prod">' + attr(salonProd(r)) + '</span>' +
      '<span class="wtile__name">' + attr(r.w || r.n) + ' ' + attr(r.r) + '</span>' + salonPts(r) +
      '<span class="wtile__note">' + attr([r.v, r.vy].filter(Boolean).join(' · ') || r.sub || '') + '</span></span></button>';
  }
  function sugWine(res, i) {
    var id = res.id, terms = res.terms, img, prod, name, side;
    if (res.src === 'salon') {
      var r = SALON_BY_ID[id];
      if (!r) return '';
      img = salonBottle(r); prod = salonProd(r); name = hl(r.w || r.n, terms) + ' ' + attr(r.r);
      side = '<span class="wsug__badge">' + (bestMedal(r)[1] === 'G' ? 'złoto' : 'srebro') + ' Salon</span>';
    } else {
      var w = wine(id);
      img = bottleImg(id); prod = producer(w).name; name = hl(w.name, terms) + ' ' + w.year;
      side = w.price ? '<span class="wsug__price">' + w.price + '</span>' : '';
    }
    return '<li class="wsug__opt wsug__wine" role="option" id="wso-' + i + '" data-wine="' + attr(id) + '">' +
      '<span class="wsug__img">' + img + '</span>' +
      '<span class="wsug__body"><span class="wsug__prod">' + hl(prod, terms) + '</span><span class="wsug__name">' + name + '</span></span>' + side + '</li>';
  }
  function sugCat(c, i) {
    var dot = c.type === 'region' && REGION_CLASS[c.key] ? '<span class="wsug__dot region--' + REGION_CLASS[c.key] + '"></span>' : '';
    return '<li class="wsug__opt wsug__cat" role="option" id="wso-' + i + '" data-wcat="' + attr(c.id) + '">' +
      '<span class="wsug__ic">' + icon(CAT_ICON[c.type]) + '</span>' +
      '<span class="wsug__t"><span class="wsug__type">' + WSX.TYPE_LABEL[c.type] + ':</span> ' + dot + '<b>' + attr(c.label) + '</b></span>' +
      '<span class="wsug__n">' + c.ids.length + '</span><span class="wsug__go" aria-hidden="true">›</span></li>';
  }

  /* Widok 1: podpowiedzi przy wpisywaniu. */
  function setExpanded(on) {
    var inp = $('#wsearch-q');
    if (inp) { inp.setAttribute('aria-expanded', String(on)); if (!on) inp.removeAttribute('aria-activedescendant'); }
    SRCH.active = -1;
  }
  function announce(txt) {
    clearTimeout(SRCH.live);
    SRCH.live = setTimeout(function () { var l = $('#wsearch-live'); if (l) l.textContent = txt; }, 500);
  }
  function renderSuggest() {
    var out = $('#wsout');
    SRCH.view = 'sug';
    if (!SRCH.q.trim()) { out.hidden = true; out.innerHTML = ''; setExpanded(false); return; }
    var r = SRCH.engine.search(SRCH.q), html = '', i = 0;
    var maxCats = isPhone() ? 2 : 3, maxWines = isPhone() ? 3 : 5;
    if (r.mode === 'za-krotkie') {
      html = '<p class="wsout__hint">Wpisz co najmniej 2 litery</p>';
      announce('');
    } else if (r.mode === 'brak' || r.mode === 'czy-chodzilo') {
      html = '<p class="wsout__empty">Nic nie znaleziono. Spróbuj nazwy winiarni, wsi albo odmiany.</p>';
      if (r.wines.length) html += '<p class="wsout__label">Czy chodziło o:</p><ul class="wsug" id="wsug" role="listbox" aria-label="Czy chodziło o">' +
        r.wines.map(function (w) { return sugWine(w, i++); }).join('') + '</ul>';
      announce('Nic nie znaleziono');
    } else {
      var cats = r.cats.slice(0, maxCats), wines = r.wines.slice(0, maxWines);
      html = '<ul class="wsug" id="wsug" role="listbox" aria-label="Podpowiedzi">' +
        cats.map(function (c) { return sugCat(c, i++); }).join('') +
        wines.map(function (w) { return sugWine(w, i++); }).join('') + '</ul>' +
        (r.total > wines.length ? '<button type="button" class="wsug__all" data-wsearch-all>Pokaż wszystkie wina (' + r.total + ')</button>' : '');
      announce(r.total + ' ' + plural(r.total) + (cats.length ? ', ' + cats.length + (cats.length === 1 ? ' kategoria' : ' kategorie') : ''));
    }
    out.innerHTML = html;
    out.hidden = false;
    setExpanded(!!$('#wsug'));
  }
  function collapseSuggest() {
    if (SRCH.view !== 'sug') return;
    var out = $('#wsout');
    if (out) out.hidden = true;
    setExpanded(false);
  }

  /* Widok 2: lista wyników — od najwyżej ocenionych, po 20, wina ze strony przed winami z Salonu. */
  // Jakość z indeksu: Salon vín przed konkursem regionalnym, potem punkty (jak w Top 14 na stronie).
  function ptsOf(id) { var d = SRCH.engine && SRCH.engine.doc(id); return d && d.qual || 0; }
  function byBest(ids) {
    return ids.map(function (id, i) { return { id: id, p: ptsOf(id), i: i }; })
      .sort(function (a, b) { return b.p - a.p || a.i - b.i; }).map(function (x) { return x.id; });
  }
  function showList(list) {
    SRCH.view = 'list'; SRCH.list = list; SRCH.pages = { site: 0, salon: 0 };
    state.searchQ = list.q || ''; writeHash();
    setExpanded(false);
    var inp = $('#wsearch-q');
    if (inp) inp.blur();
    refreshList();
    scrollToEl($('#wsearch'));
  }
  function refreshList() {
    var L = SRCH.list, out = $('#wsout');
    var ids = L.cat ? (SRCH.engine.category(L.cat) || { ids: [] }).ids : SRCH.engine.search(L.q, { fallbacks: false, categories: false }).wines.map(function (w) { return w.id; });
    if (L.cat && !SRCH.engine.category(L.cat)) ids = L.ids || [];
    L.ids = ids;
    var site = byBest(ids.filter(function (id) { return !/^salon:/.test(id); }));
    var sal = byBest(ids.filter(function (id) { return /^salon:/.test(id) && SALON_BY_ID[id]; }));
    var total = site.length + sal.length;
    var head = L.cat ? attr(L.label) : 'Wyniki dla „' + attr(L.q) + '”';
    function limit(g) { return PAGE_FIRST + SRCH.pages[g] * PAGE; }
    function more(g, list) {
      var rest = list.length - limit(g);
      return rest > 0 ? '<button type="button" class="btn wres__more" data-wsearch-more="' + g + '">Pokaż kolejne ' + Math.min(PAGE, rest) +
        ' <span class="wres__n">(zostało ' + rest + ')</span></button>' : '';
    }
    var html = '<div class="wres__head"><p class="wres__title">' + head + ' <span class="wres__n">· ' + total + ' ' + plural(total) + '</span></p>' +
      '<button type="button" class="wres__close" data-wsearch-clear aria-label="Wyczyść wyszukiwanie">' + icon('close') + '</button></div>' +
      '<p class="wres__sort">Od najwyżej ocenionych.</p>';
    if (site.length) html += '<h3 class="wres__group">Z naszego przewodnika <span class="wres__n">· ' + site.length + '</span></h3>' +
      '<div class="wtiles">' + site.slice(0, limit('site')).map(function (id) { return wineTile(id); }).join('') + '</div>' + more('site', site);
    if (sal.length) html += '<h3 class="wres__group" id="wres-salon">Z Salonu vín 2024–2026 <span class="wres__n">· ' + sal.length + '</span></h3>' +
      '<p class="wres__note">Złote wina finału i srebrne ze Znojemska. Opisy po czesku, z katalogu Salonu.</p>' +
      '<div class="wtiles">' + sal.slice(0, limit('salon')).map(function (id) { return salonTile(SALON_BY_ID[id]); }).join('') + '</div>' + more('salon', sal);
    if (!SRCH.full && SRCH.loading) html += '<p class="wres__note">Wczytuję wina z Salonu vín…</p>';
    else if (!SRCH.full && SRCH.failed) html += '<p class="wres__note">Wina z Salonu vín wczytają się, gdy telefon połączy się z internetem.</p>';
    if (!total) html += '<p class="wsout__empty">Nic nie znaleziono.</p>';
    out.innerHTML = html;
    out.hidden = false;
    announce(total + ' ' + plural(total));
  }

  function clearSearch(keepFocus) {
    var inp = $('#wsearch-q'), out = $('#wsout');
    SRCH.q = ''; SRCH.view = ''; SRCH.list = null;
    if (state.searchQ) { state.searchQ = ''; writeHash(); }
    if (inp) { inp.value = ''; if (keepFocus) inp.focus(); }
    var x = $('[data-wsearch-clear].wsearch__clear');
    if (x) x.hidden = true;
    if ($('#wsearch')) $('#wsearch').classList.remove('has-q');
    if (out) { out.hidden = true; out.innerHTML = ''; }
    setExpanded(false);
  }
  function moveActive(step) {
    var opts = $$('#wsug [role="option"]');
    if (!opts.length) return;
    SRCH.active = (SRCH.active + step + opts.length) % opts.length;
    opts.forEach(function (o, i) { o.classList.toggle('is-active', i === SRCH.active); });
    var a = opts[SRCH.active];
    $('#wsearch-q').setAttribute('aria-activedescendant', a.id);
    if (a.scrollIntoView) a.scrollIntoView({ block: 'nearest' });
  }

  // Kliknięcia w obrębie wyszukiwarki (wołane z głównej delegacji w render()). true = obsłużone.
  function searchClick(e) {
    var t = e.target;
    var cat = t.closest('[data-wcat]');
    if (cat) {
      var c = SRCH.engine && SRCH.engine.category(cat.dataset.wcat);
      if (c) showList({ cat: c.id, label: WSX.TYPE_LABEL[c.type] + ': ' + c.label, ids: c.ids });
      return true;
    }
    if (t.closest('[data-wsearch-all]')) { showList({ q: SRCH.q }); return true; }
    var moreBtn = t.closest('[data-wsearch-more]');
    if (moreBtn) { SRCH.pages[moreBtn.dataset.wsearchMore]++; refreshList(); return true; }
    if (t.closest('[data-wsearch-clear]')) { clearSearch(t.closest('.wsearch__clear') !== null); return true; }
    return false;
  }

  function bindSearch() {
    var content = $('#content');
    if (!$('#wsearch-q')) return;
    content.addEventListener('input', function (e) {
      if (e.target.id !== 'wsearch-q') return;
      ensureEngine();
      SRCH.q = e.target.value.replace(/[\r\n]+/g, ' ');
      $('.wsearch__clear').hidden = !SRCH.q;
      $('#wsearch').classList.toggle('has-q', !!SRCH.q);
      if (!SRCH.q) { clearSearch(true); return; }
      renderSuggest();
    });
    content.addEventListener('keydown', function (e) {
      if (e.target.id !== 'wsearch-q') return;
      var listOpen = !$('#wsout').hidden && SRCH.view === 'sug' && $('#wsug');
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!listOpen) { if (SRCH.q) renderSuggest(); return; }
        e.preventDefault(); moveActive(e.key === 'ArrowDown' ? 1 : -1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        var opts = $$('#wsug [role="option"]');
        if (listOpen && SRCH.active >= 0 && opts[SRCH.active]) opts[SRCH.active].click();
        else if (WSX.cleanQuery(SRCH.q).length >= 2) showList({ q: SRCH.q }); // po 1 literze Enter nic nie robi
      } else if (e.key === 'Escape') {
        if (listOpen) { e.preventDefault(); collapseSuggest(); } else if (SRCH.q) { e.preventDefault(); clearSearch(true); }
      }
    });
    content.addEventListener('focusin', function (e) {
      if (e.target.id !== 'wsearch-q') return;
      clearTimeout(SRCH.blurT);
      document.body.classList.add('is-searching');
      ensureEngine(true); // przy wejściu w pole można ponowić pobieranie win z Salonu
      if (SRCH.q && SRCH.view !== 'list') renderSuggest();
      if (isPhone()) setTimeout(function () { scrollToEl($('#wsearch')); }, 300); // po otwarciu klawiatury
    });
    content.addEventListener('focusout', function (e) {
      if (e.target.id !== 'wsearch-q') return;
      // pasek zakładek wraca z opóźnieniem, żeby układ nie skakał pod palcem w trakcie dotknięcia wiersza
      SRCH.blurT = setTimeout(function () {
        if (document.activeElement !== $('#wsearch-q')) document.body.classList.remove('is-searching');
      }, 300);
    });
    // Zwijamy podpowiedzi przy dotknięciu poza wyszukiwarką (nie na blur: wiersz znikałby spod palca).
    document.addEventListener('pointerdown', function (e) {
      if (SRCH.view !== 'sug' || $('#wsout').hidden) return;
      if (e.target.closest && (e.target.closest('#wsearch') || e.target.closest('#wsout') || e.target.closest('#wine-sheet'))) return;
      collapseSuggest();
    });
  }

  // Wejście z linku #wino/szukaj/…: wpisany tekst i lista wyników (wina z Salonu dojdą, gdy się wczytają).
  function openSearchLink(q) {
    var inp = $('#wsearch-q');
    if (!inp || !WSX) return;
    inp.value = q; SRCH.q = q;
    $('.wsearch__clear').hidden = false;
    $('#wsearch').classList.add('has-q');
    ensureEngine();
    showList({ q: q });
  }

  /* Karta wina tylko z Salonu (punkt 8 spec). */
  function salonSheetHtml(r) {
    var key = WSX.SUBREGION[r.sub], cls = REGION_CLASS[key];
    var year = r.m[0][0];
    var links = [];
    if (r.u) links.push({ label: 'Karta w Salonie vín', url: r.u, kind: 'web' });
    if (r.e) links.push({ label: 'E-sklep Salonu vín', url: r.e, kind: 'web' });
    return '<div class="sheet__grid">' +
      '<div class="sheet__img">' + salonBottle(r, 'bimg bimg--big') + '<p class="credit-line">Brak zdjęcia butelki w danych Salonu</p></div>' +
      '<div class="sheet__info">' +
        '<h3 class="sheet__title" id="sheet-title">' + attr(r.w || r.n) + ' ' + attr(r.r) + '</h3>' +
        '<p class="muted small">' + attr(r.p) + (r.t ? ' · ' + attr(r.t) : '') + '</p>' +
        '<div class="sheet__badges">' + (r.sub ? '<span class="region' + (cls ? ' region--' + cls : ' region--other') + '">' + attr(r.sub) + '</span>' : '') +
          (r.q ? '<span class="tag" lang="cs">' + attr(r.q) + '</span>' : '') + (SALON_CAT[r.c] ? '<span class="tag">' + SALON_CAT[r.c] + '</span>' : '') + '</div>' +
        r.m.map(function (m) { return '<span class="score score--salon">' + LEVEL_ICON.salon + (m[2] ? '<b class="score__n">' + fmt(m[2]) + ' pkt</b>' : '') + '<span class="score__t">' + (m[1] === 'G' ? 'Złoty medal' : 'Srebrny medal') + ' · Salon vín ' + m[0] + '</span></span>'; }).join(' ') +
        meters({ sugar: r.s, acid: r.a }) + (r.al ? '<p class="small muted">Alkohol ' + fmt(r.al) + '% obj.</p>' : '') +
        ((r.v || r.vy) ? '<p class="origin">' + attr([r.v, r.vy].filter(Boolean).join(' · ')) + (r.b ? ' · partia ' + attr(r.b) : '') + '</p>' : (r.b ? '<p class="origin">partia ' + attr(r.b) + '</p>' : '')) +
        (r.dw ? '<p class="small">Okno picia: ' + attr(r.dw) + '</p>' : '') +
        (r.d ? '<blockquote class="nquote" lang="cs"><p>„' + attr(r.d) + '”</p><footer>Opis z katalogu Salonu vín ' + year + ', po czesku</footer></blockquote>' : '') +
        '<p class="item__note">To wino nie jest w naszym przewodniku. Dane z katalogu Salonu vín ' + r.m.map(function (m) { return m[0]; }).join(', ') + '.</p>' +
        actions(links) +
      '</div></div>';
  }

  /* Dobierz wino: przyciski smaków + koło. */
  function allWineIds() {
    var seen = {}, out = [];
    var add = function (id) { if (id && !seen[id] && WN.wines[id]) { seen[id] = 1; out.push(id); } };
    TOP14.forEach(add);
    WN.catalog.forEach(function (c) { c.wines.forEach(add); });
    add(WN.bonus);
    Object.keys(WN.wines).forEach(add);
    return out;
  }
  function winesFor(fid) {
    var list = allWineIds().filter(function (id) { return (wine(id).tags || []).indexOf(fid) >= 0; });
    if (fid === 'slodsze') {
      var sweet = function (w) { return w.sugar || 0; };
      list.sort(function (a, b) { return sweet(wine(b)) - sweet(wine(a)); });
    }
    return list;
  }
  function wheelSvg() {
    var F = WN.flavors, R = 100, seg = 360 / F.length, out = '';
    F.forEach(function (f, i) {
      var a0 = (i * seg - 90 - seg / 2) * Math.PI / 180, a1 = ((i + 1) * seg - 90 - seg / 2) * Math.PI / 180;
      out += '<path d="M100 100L' + (100 + R * Math.cos(a0)).toFixed(2) + ' ' + (100 + R * Math.sin(a0)).toFixed(2) +
        'A100 100 0 0 1 ' + (100 + R * Math.cos(a1)).toFixed(2) + ' ' + (100 + R * Math.sin(a1)).toFixed(2) + 'Z" fill="' + f.color + '" stroke="#fff" stroke-width="1.5"/>';
      out += '<text x="100" y="30" transform="rotate(' + (i * seg) + ' 100 100)" text-anchor="middle" font-size="10" font-weight="700" fill="#fff">' + (f.short || f.label) + '</text>';
    });
    return '<svg class="wheel__svg" viewBox="0 0 200 200" aria-hidden="true"><g class="wheel__rot">' + out +
      '<circle cx="100" cy="100" r="17" fill="#fff"/><circle cx="100" cy="100" r="7" fill="#4a0014"/></g></svg>';
  }
  function renderPicker() {
    return '<div class="card picker">' +
      '<p class="small muted">Wybierz smak albo zakręć kołem. Pokażemy pasujące butelki z Top 14 i katalogu. Dotknij butelki, żeby zobaczyć szczegóły.</p>' +
      '<div class="pchips" role="group" aria-label="Smaki">' + WN.flavors.map(function (f) {
        return '<button type="button" class="pchip" data-flavor="' + f.id + '" aria-pressed="false" style="--fc:' + f.color + '">' + f.label + '</button>';
      }).join('') + '</div>' +
      '<div class="wheel"><div class="wheel__stage"><span class="wheel__pointer" aria-hidden="true"></span>' + wheelSvg() + '</div>' +
        '<button type="button" class="btn btn--map wheel__btn" data-spin>Zakręć kołem smaków</button></div>' +
      '<div class="presult" id="picker-result" aria-live="polite"></div></div>';
  }
  function showFlavor(fid, lucky) {
    var f = FLAV[fid];
    if (!f) return;
    $$('.pchip').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.flavor === fid)); });
    var ids = winesFor(fid);
    var luckyId = lucky && ids.length ? ids[Math.floor(Math.random() * ids.length)] : null;
    if (luckyId) ids = [luckyId].concat(ids.filter(function (x) { return x !== luckyId; }));
    var head = '<p class="presult__head"><span class="fchip" style="--fc:' + f.color + '">' + f.label + '</span> ' + ids.length + ' ' + (ids.length === 1 ? 'wino' : (ids.length < 5 ? 'wina' : 'win')) +
      (fid === 'slodsze' ? ' · wytrawne od 6 g/l cukru, od najsłodszych' : '') + '</p>';
    $('#picker-result').innerHTML = head + '<div class="wtiles">' + ids.map(function (id) {
      return wineTile(id, id === luckyId ? '<span class="wtile__lucky">Wylosowane dla Ciebie</span>' : '', id === luckyId ? 'wtile--lucky' : '');
    }).join('') + '</div>';
  }
  var wheelRot = 0;
  function spinWheel() {
    var g = $('.wheel__rot');
    if (!g || g.dataset.spinning) return;
    var n = WN.flavors.length, seg = 360 / n, k = Math.floor(Math.random() * n);
    var jitter = (Math.random() - 0.5) * seg * 0.6;
    var target = 360 - k * seg + jitter;
    wheelRot += 360 * 5 + ((target - wheelRot) % 360 + 360) % 360;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    g.dataset.spinning = '1';
    g.style.transform = 'rotate(' + wheelRot + 'deg)';
    setTimeout(function () {
      delete g.dataset.spinning;
      showFlavor(WN.flavors[k].id, true);
      var res = $('#picker-result');
      if (res && res.getBoundingClientRect().top > window.innerHeight * 0.7) scrollToEl(res);
    }, reduce ? 50 : 3300);
  }

  function renderWine() {
    var V = T.wine, E = V.enoteka;
    var jump = [['w-sciaga', 'Etykieta i regiony'], ['w-czempioni', 'Czempioni'], ['w-top', 'Top 14'], ['w-dobierz', 'Dobierz wino'], ['w-degustacja', 'Degustacja'],
      ['w-enoteka', 'Enotéka'], ['w-katalog', 'Katalog'], ['w-odmiany', 'Odmiany']];
    var html = '';
    html += '<div class="card wine-hero"><h2>Znojmo w kieliszku</h2><p>' + V.stats + ' · ' + guideCounts() + '</p>' + searchBox() + '</div>' +
      '<div class="wsout" id="wsout" hidden></div>';
    html += '<nav class="jump" aria-label="Na tej stronie">' + jump.map(function (j) {
      return '<a href="#' + j[0] + '" data-jump="' + j[0] + '">' + j[1] + '</a>';
    }).join('') + '</nav>';
    html += renderGuide();

    // Czempioni — na samej górze, z uczciwą informacją o dostępności
    html += '<h2 class="section-title" id="w-czempioni">Czempioni konkursu 2026</h2>' +
      '<p class="section-sub">Najwyżej ocenione partie regionalnego konkursu na Znojemsku. Ryzlinka DAVINUS trudno kupić. Frankovka Oulehli jest w karcie Enotéki, ale bez numeru partii.</p>' +
      '<div class="wchamps">' + WN.champions.map(champCard).join('') + '</div>';

    // Top 14: 7 ze Znojemska + 7 z reszty Moraw, z punktami z konkursów
    var SC = V.scoring;
    html += '<h2 class="section-title" id="w-top">Top 14: co warto spróbować</h2>' +
      '<p class="section-sub">Siedem win ze Znojemska i siedem najwyżej ocenionych z reszty Moraw. Przy każdym winie są punkty z konkursu. Dotknij wina, żeby zobaczyć szczegóły.</p>' +
      scoreLegend() + (SC ? acc(SC.title, SC.sub, SC.items.map(function (t) { return '<p class="small">' + t + '</p>'; }).join('') + actions(SC.links), false, 'w-punkty') : '') +
      '<h3 class="sub-h" id="w-top-znojmo">Ze Znojemska: do spróbowania w vinotékach w mieście</h3>' +
      '<p class="small muted">Najpierw złote wina krajowego Salonu vín 2026 (złota etykieta), potem medale konkursu regionalnego (brązowa). Na końcu Znovín Šobes: bez oceny w konkursie, ale z udokumentowanej parceli Šobes.</p>' +
      '<div class="wrows">' + WN.topZnojmo.map(function (id, i) { return wineRow(id, i + 1, false); }).join('') + '</div>' +
      '<h3 class="sub-h" id="w-top-morava">Z reszty Moraw: najlepsze w Salonie vín 2026</h3>' +
      '<p class="small muted">Nie ma ich w karcie Enotéki, więc pytaj w innych vinotékach w Znojmie. Ceny pochodzą z e-sklepu Salonu vín.</p>' +
      '<div class="wrows">' + WN.topMorava.map(function (id, i) { return wineRow(id, i + 8, true); }).join('') + '</div>' +
      (WN.alsoSalon && WN.alsoSalon.length ? '<p class="small muted">Też złote w Salonie 2026, spod Pálavy i z Valtic:</p><div class="wtiles wtiles--row">' +
        WN.alsoSalon.map(function (id) { return wineTile(id); }).join('') + '</div>' : '');
    if (WN.bonus) {
      html += '<div class="card card--soft bonus"><h3>Trop od lokalnego sommeliera</h3>' + wineTile(WN.bonus, '<span class="wtile__note">' + wine(WN.bonus).short + '</span>', 'wtile--wide') + '</div>';
    }

    // Dobierz wino
    html += '<h2 class="section-title" id="w-dobierz">Dobierz wino</h2>' + renderPicker();

    // Jedna degustacja
    var Q = WN.quick;
    html += '<h2 class="section-title" id="w-degustacja">' + Q.title + '</h2>' +
      '<ol class="qsteps">' + Q.steps.map(function (s, i) {
        return '<li class="qstep"><span class="qstep__n">' + (i + 1) + '</span>' +
          wineTile(s.id, '<span class="wtile__nr">' + s.nr + ' w karcie Enotéki</span><span class="wtile__note">' + s.text + '</span>') + '</li>';
      }).join('') + '</ol>' +
      '<p class="item__note">' + Q.total + '</p>';

    // Enotéka
    html += '<h2 class="section-title" id="w-enoteka">' + E.title + '</h2>' +
      '<div class="card">' + (E.venue ? venueBanner(E.venue, 'Enotéka znojemských vín') : '') + place(E.place) + '<p class="small muted hours">' + icon('clock') + '<span>' + E.hours + '</span></p>' +
      acc('Jak działa karta i dyspenser', '', '<p class="small">' + E.how + '</p>') +
      '<h3 class="sub-h">Kolejność sześciu próbek</h3>' +
      WN.samples.map(function (g) {
        return '<div class="sgroup"><p class="sgroup__h">' + g.group + '</p><div class="wtiles wtiles--row">' +
          g.items.map(function (s) { return wineTile(s.id, '<span class="wtile__nr">' + s.nr + ' · ' + s.pour + '</span>'); }).join('') + '</div>' +
          (g.alt ? '<p class="small muted">Zamiennik z części rotacyjnej: <button type="button" class="tlink tlink--btn tlink--inline" data-wine="' + g.alt.id + '">' + wine(g.alt.id).name + ' ' + wine(g.alt.id).year + ' (' + g.alt.nr + ', ' + g.alt.pour + ')</button></p>' : '') +
          '<p class="small">' + g.hint + '</p></div>';
      }).join('') +
      '<p class="item__note">' + E.total + '</p>' + actions(E.links) + '</div>';

    // Na święto i ocena przed zakupem — zwinięte, żeby nie przytłaczać tekstem
    html += '<h2 class="section-title">Co nalać na święcie</h2><div>' +
      V.festival.map(function (f) { return acc(f.title, '', '<p class="small">' + f.text + '</p>' + actions(f.links)); }).join('') +
      acc(V.tasting.title, '', '<p class="small">' + V.tasting.text + '</p>' + actions(V.tasting.links)) + '</div>';

    // Ściąga odmian z miniaturami wspomnianych win
    html += '<h2 class="section-title" id="w-odmiany">Ściąga: odmiany i etykiety</h2><div>' +
      V.grapes.map(function (g) {
        var ws = (WN.grapeWines || {})[g.title] || [];
        return acc(g.title, '', '<p class="small">' + g.text + '</p>' +
          (ws.length ? '<div class="wtiles wtiles--row">' + ws.map(function (id) { return wineTile(id); }).join('') + '</div>' : '') + actions(g.links));
      }).join('') + '</div>';

    // Katalog z logo winiarni
    html += '<h2 class="section-title" id="w-katalog">Katalog: 13 winiarni ze Znojemska</h2><p class="section-sub">Po trzy wina na producenta. Dotknij nazwy winiarni, a potem butelki.</p><div>' +
      WN.catalog.map(function (c, i) {
        var p = WN.producers[c.p];
        return '<details class="acc acc--winery"><summary><span class="acc__logo">' + logoEl(c.p) + '</span><span><span class="acc__title">' +
          (i + 1 < 10 ? '0' : '') + (i + 1) + '. ' + p.name + '</span><span class="acc__sub">' + p.place + '</span></span>' + icon('chev', 'chev') + '</summary>' +
          '<div class="acc__body"><p class="small muted">' + c.text + '</p><div class="wtiles">' + c.wines.map(function (id) {
            return wineTile(id, '<span class="wtile__note">' + wine(id).short + '</span>');
          }).join('') + '</div></div></details>';
      }).join('') + '</div>';

    html += '<div class="spaced">' + acc(V.about.title, 'Jak powstała selekcja, źródła i zdjęcia', '<p class="small">' + V.about.text + '</p>' +
      '<p class="small">Siedem win spoza Znojemska w Top 14 to najwyżej ocenione wina wytrawne i półwytrawne Salonu vín ČR 2026 (sto najlepszych win w Czechach). Dane o cukrze, kwasach i punktach pochodzą z katalogu i arkusza medali Salonu, wyników konkursu regionalnego i stron producentów. Ceny w Enotéce według jej karty z 10 listopada 2026.</p>' +
      '<p class="small">Zdjęcia butelek i logo pochodzą ze sklepów i stron producentów oraz z Salonu vín ČR 2026. Źródło każdego zdjęcia jest podane w szczegółach wina. Gdy źródło nie miało zdjęcia, pokazujemy stylizowaną butelkę.</p>' +
      actions(V.about.links.concat([{ label: 'Salon vín ČR 2026', url: 'https://www.vinarskecentrum.cz/salon-vin/', kind: 'web' }]))) + '</div>';
    return html;
  }

  /* ---------------- Trasy GPX ---------------- */
  var ROUTES = window.ROUTES || {};
  function num(n) { return String(n).replace('.', ','); }
  function routeLink(id) {
    var r = ROUTES[id];
    if (!r) return '';
    return '<button type="button" class="tlink tlink--btn" data-route="' + id + '">' + icon('walk') +
      '<span>Trasa piesza: ' + num(r.km) + ' km · mapa i GPX</span></button>';
  }
  // Link do trasy w trybie ramki, ze środkiem i powiększeniem dopasowanym do całej trasy.
  function frameUrl(url, r) {
    if (r.center) {
      url = url.replace(/([?&]x=)[^&]*/, '$1' + r.center[0])
        .replace(/([?&]y=)[^&]*/, '$1' + r.center[1])
        .replace(/([?&]z=)[^&]*/, '$1' + r.zoom);
    }
    return url + (url.indexOf('?') < 0 ? '?' : '&') + 'frame=1';
  }
  function renderRoute(g) {
    var r = ROUTES[g.id];
    if (!r) return '';
    var hours = Math.round(r.hours * 2) / 2;
    var tags = ['ok. ' + num(r.km) + ' km', '↑ ' + r.up + ' m', '↓ ' + r.down + ' m', 'ok. ' + num(hours) + ' h marszu', r.loop ? 'pętla' : 'w jedną stronę'];
    var label = 'Kształt trasy ' + g.title + ', ' + num(r.km) + ' km';
    // Domyślnie lekki podgląd z GPX. Mapa turystyczna Mapy.com ładuje się dopiero po dotknięciu
    // i zawsze tylko jedna naraz (każda ramka to cała aplikacja Mapy; kilka naraz dławi telefon).
    // Podgląd: statyczna mapa OSM ze śladem trasy (tools/build-route-maps.py), a gdy jej brak — sam kształt z GPX.
    var RM = (window.ROUTE_MAPS || {})[g.id];
    var preview = RM
      ? '<img class="route__mapimg" src="' + RM.img + '" width="' + RM.w + '" height="' + RM.h + '" alt="' + attr('Mapa trasy ' + g.title + ' ze startem i metą') + '" loading="lazy" decoding="async">'
      : '<svg class="route__map" viewBox="0 0 320 200" role="img" aria-label="' + attr(label) + '">' +
        '<path class="route__casing" d="' + r.shape + '"/><path class="route__line" d="' + r.shape + '"/>' +
        '<circle class="route__start" cx="' + r.start[0] + '" cy="' + r.start[1] + '" r="6"/>' +
        '<circle class="route__end" cx="' + r.end[0] + '" cy="' + r.end[1] + '" r="6"/>' +
      '</svg>';
    var map = '<div class="route__mapbox"' + (g.mapy ? ' data-frame-src="' + attr(frameUrl(g.mapy, r)) + '" data-frame-title="' + attr('Mapa trasy: ' + g.title + ' (Mapy.com)') + '"' : '') + '>' +
        preview +
        (g.mapy ? '<button type="button" class="route__load" data-load-map>' + icon('pin') + '<span>Pokaż mapę turystyczną</span></button>' +
          '<button type="button" class="route__close" data-close-map aria-label="Zamknij mapę">✕</button>' : '') +
      '</div>';
    var legend = '<span class="route__legend"><i class="dot dot--start"></i>start</span><span class="route__legend"><i class="dot dot--end"></i>meta</span>' +
      (RM ? '<span class="route__legend">Mapa: ' + ext(RM.attributionUrl, RM.attribution, 'credit') + '</span>' : '');
    return '<article class="card route" id="trasa-' + g.id + '">' +
      '<div class="when">' + g.when + '</div><h3>' + g.title + '</h3>' +
      '<div class="tags">' + tags.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div>' +
      '<figure class="route__fig">' + map +
        '<svg class="route__profile" viewBox="0 0 320 64" preserveAspectRatio="none" aria-hidden="true">' +
          '<path class="route__area" d="' + r.profileArea + '"/><path class="route__pline" d="' + r.profile + '"/>' +
        '</svg>' +
        '<figcaption>' + legend + '<span>Profil wysokości: ' + r.minEle + '–' + r.maxEle + ' m n.p.m.</span></figcaption>' +
      '</figure>' +
      '<p class="small">' + g.text + '</p>' +
      '<div class="actions">' + ext(g.mapy, icon('pin') + '<span>Otwórz w Mapy.com</span>', 'btn btn--map') +
        '<a class="btn" href="' + r.gpx + '" download="' + g.id + '.gpx">' + icon('download') + '<span>Pobierz GPX</span></a></div>' +
      actions(g.links) + '</article>';
  }

  /* ---------------- Spacery ---------------- */
  function renderWalks() {
    var S = T.walks;
    var html = '<div class="panel-head"><h2>Spacery i trasy</h2><p>Nasze trasy z mapą i plikiem GPX oraz trasy z planu wyjazdu.</p></div>';
    html += '<h2 class="section-title">Nasze trasy</h2><p class="section-sub">Czas marszu to szacunek: 4 km/h plus godzina na każde 600 m podejścia, bez postojów.</p>';
    html += S.gpx.map(renderRoute).join('');
    html += '<div class="card card--soft"><p class="small">Wszystkie zaznaczone przez nas miejsca w jednej mapie.</p>' +
      '<div class="actions">' + ext(S.allPoints.url, icon('pin') + '<span>' + S.allPoints.label + '</span>', 'btn btn--map') + '</div></div>';
    html += '<h2 class="section-title">Trasy z planu</h2>';
    html += S.routes.map(function (r) {
      return '<article class="card"><div class="when">' + r.when + '</div><h3>' + r.title + '</h3>' +
        '<div class="tags">' + r.tags.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join('') + '</div>' +
        '<p class="small">' + r.text + '</p>' + actions(r.links) + (r.route ? routeLink(r.route) : '') + '</article>';
    }).join('');
    html += '<div class="card card--soft"><p class="small with-icon">' + icon('kid') + '<span>' + S.kidsNote + '</span></p></div>';
    html += '<div class="card card--soft"><p class="small with-icon">' + icon('book') + '<span>Historia miasta, legenda o Sobieskim i polscy oficerowie nad Dyją są w zakładce <strong>Ciekawostki</strong>.</span></p>' +
      '<button type="button" class="tlink tlink--btn" data-goto-tab="ciekawostki">' + icon('book') + '<span>Przejdź do Ciekawostek</span></button></div>';
    return html;
  }

  /* ---------------- Ciekawostki ---------------- */
  function renderFacts() {
    var F = T.facts;
    var srcs = function (ns) {
      return ns && ns.length ? '<p class="fact__src">Źródła: ' + ns.map(function (n) {
        var s = F.sources[n - 1];
        return ext(s.url, '[' + n + ']', 'credit') ;
      }).join(' ') + '</p>' : '';
    };
    var fig = function (im) {
      return '<figure class="fact__fig"><img src="' + im.src + '" width="' + im.w + '" height="' + im.h + '" alt="' + attr(im.alt) + '" loading="lazy" decoding="async">' +
        '<figcaption>' + (im.caption ? '<span class="fact__cap">' + im.caption + '</span> ' : '') + ext(im.creditUrl, im.credit, 'credit') + '</figcaption></figure>';
    };
    var h = F.hero;
    var html = '<figure class="facts-hero"><img src="' + h.src + '" width="' + h.w + '" height="' + h.h + '" alt="' + attr(h.alt) + '" decoding="async">' +
      '<figcaption class="facts-hero__txt"><h2>' + F.title + '</h2></figcaption></figure>' +
      '<p class="credit-line">Zdjęcie: ' + ext(h.creditUrl, h.credit, 'credit') + '</p>' +
      '<p class="facts-intro">' + F.intro + '</p>';
    if (F.map) {
      var M = F.map;
      html += '<figure class="facts-map"><img src="' + M.src + '" width="' + M.w + '" height="' + M.h + '" alt="' + attr(M.alt) + '" loading="lazy" decoding="async">' +
        '<figcaption>Mapa ciekawostek · ' + ext(M.creditUrl, M.credit, 'credit') + '</figcaption></figure>' +
        '<ol class="pins">' + M.legend.map(function (l) {
          return '<li>' + ext(l.url, '<span class="pin">' + l.n + '</span><span class="pins__txt"><strong>' + l.label + '</strong><span>' + l.when + '</span></span>', 'pins__a') + '</li>';
        }).join('') + '</ol>';
    }
    html += '<ol class="tl">' + F.timeline.map(function (f) {
      return '<li class="tl__item"><span class="tl__when">' + f.when + '</span>' +
        (f.pin != null ? '<span class="pin pin--sm" title="Numer na mapie ciekawostek">' + f.pin + '</span>' : '') + '<article class="card fact">' +
        '<h3>' + f.title + '</h3><p class="fact__hook">' + f.hook + '</p>' + (f.img ? fig(f.img) : '') +
        '<p class="small">' + f.text + '</p>' + actions((f.where || []).concat(f.links || [])) +
        (f.route ? routeLink(f.route) : '') + srcs(f.sources) + '</article></li>';
    }).join('') + '</ol>';
    html += '<div class="card card--accent"><h3>' + F.walk.title + '</h3><p class="small">' + F.walk.text + '</p>' + actions(F.walk.stops) + routeLink('zamek-park') + '</div>';
    html += '<div class="spaced">' + acc('Źródła', 'Z „Krótkiego przewodnika historycznego” i kudyznudy.cz', '<ol class="srcs">' + F.sources.map(function (s) {
      return '<li id="zrodlo-' + s.n + '">' + ext(s.url, s.label, 'tlink') + '</li>';
    }).join('') + '</ol>') + '</div>';
    return html;
  }

  /* ---------------- Dzieci ---------------- */
  function kidCard(k) {
    return '<article class="card"><h3>' + k.title + '</h3>' + place(k.where) + '<p class="small">' + k.text + '</p>' + facts(k.facts) + actions(k.links) + '</article>';
  }
  function renderKids() {
    var K = T.kids;
    var html = '<div class="panel-head"><h2>Z dziećmi</h2><p>' + K.intro + '</p></div>';
    html += renderFamilyCity(K.featured);
    html += '<h2 class="section-title">Pod dachem</h2><p class="section-sub">Na zimny albo deszczowy dzień.</p>';
    html += K.indoor.map(kidCard).join('');
    html += '<h2 class="section-title">Na dworze</h2><p class="section-sub">Leśny plac zabaw, gra na starówce i trasy na hulajnogę.</p>';
    html += K.outdoor.map(kidCard).join('');
    html += '<h2 class="section-title">Bez samochodu</h2><p class="section-sub">Bezpośrednie autobusy z centrum. Przykłady z rozkładu na listopad 2026.</p>';
    html += K.buses.map(function (b) {
      return '<article class="card"><div class="bus"><span class="bus__line" aria-label="Linia ' + b.line + '">' + b.line + '</span><div><h3>' + b.title + '</h3>' +
        '<p class="small bus__route">' + b.text + '</p></div></div>' + facts(b.facts) + actions(b.links) + '</article>';
    }).join('');
    return html;
  }
  function renderFamilyCity(F) {
    if (!F) return '';
    var photos = '<div class="fc__photos">' + F.photos.map(function (p) {
      return '<figure class="fc__photo"><img src="' + p.src + '" width="' + p.w + '" height="' + p.h + '" alt="' + attr(p.alt) + '" loading="lazy" decoding="async">' +
        '<figcaption>' + p.caption + ' · ' + ext(p.creditUrl, p.credit, 'credit') + '</figcaption></figure>';
    }).join('') + '</div>';
    var attractions = F.attractions.map(function (a) {
      return '<div class="fc__attr"><h4>' + a.name + '</h4><p class="small">' + a.text + '</p>' + facts(a.facts) + actions(a.links) + '</div>';
    }).join('');
    return '<article class="card fc" id="family-city">' +
      '<div class="when">Najlepsze na wypad z dziećmi</div>' +
      '<h3 class="fc__title">' + F.title + '</h3><p class="muted small">' + F.sub + '</p>' + place(F.place) +
      photos +
      '<p class="item__note fc__alert">' + F.alert + '</p>' +
      '<h4 class="fc__h">Dojazd</h4>' + facts(F.travel) +
      actions(F.links) +
      '<h4 class="fc__h">Co tam jest</h4>' + attractions +
      '</article>';
  }

  /* ---------------- Zakładki i stan ---------------- */
  var TABS = [
    { id: 'plan', label: 'Plan', icon: 'calendar' },
    { id: 'wino', label: 'Wino', icon: 'wine', render: renderWine },
    { id: 'jedzenie', label: 'Jedzenie', icon: 'food', render: renderFood },
    { id: 'spacery', label: 'Spacery', icon: 'walk', render: renderWalks },
    { id: 'ciekawostki', label: 'Ciekawostki', short: 'Ciekawe', icon: 'book', render: renderFacts },
    { id: 'dzieci', label: 'Dzieci', icon: 'kid', render: renderKids }
  ];
  var state = { tab: 'plan', day: TODAY || 'sr' };

  function readHash() {
    var h = (location.hash || '').replace(/^#/, '').split('/');
    if (h[0] && TABS.some(function (t) { return t.id === h[0]; })) state.tab = h[0];
    if (h[1] && T.days.some(function (d) { return d.id === h[1]; })) state.day = h[1];
    // link do wyszukiwania: #wino/szukaj/ryzlink (do wysłania w grupie)
    if (h[0] === 'wino' && h[1] === 'szukaj' && h[2]) {
      try { state.searchQ = decodeURIComponent(h.slice(2).join('/')).slice(0, 80); } catch (e) { state.searchQ = ''; }
    }
  }
  function writeHash() {
    var h = '#' + state.tab + (state.tab === 'plan' ? '/' + state.day : '') +
      (state.tab === 'wino' && state.searchQ ? '/szukaj/' + encodeURIComponent(state.searchQ) : '');
    try { history.replaceState(null, '', location.pathname + location.search + h); } catch (e) { /* np. w ramce GAS */ }
  }
  function navOffset() {
    return window.innerWidth >= 900 ? ($('#tabs').offsetHeight + 8) : 8;
  }
  function scrollToEl(el) {
    var top = el.getBoundingClientRect().top + window.pageYOffset - navOffset();
    window.scrollTo(0, Math.max(0, top));
  }

  function showTab(id, scroll) {
    state.tab = id;
    $$('.tab').forEach(function (b) {
      if (b.dataset.tab === id) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    $$('.panel').forEach(function (p) { p.hidden = p.id !== 'panel-' + id; });
    closeMaps(); // otwarta mapa Mapy.com nie musi działać w tle
    writeHash();
    if (scroll) {
      var content = $('#content');
      if (content.getBoundingClientRect().top < 0) scrollToEl(content);
    }
  }
  /* Mapy tras: co najwyżej jedna żywa ramka Mapy.com naraz. */
  function closeMaps(except) {
    $$('.route__mapbox.is-live').forEach(function (b) {
      if (b === except) return;
      var f = b.querySelector('iframe');
      if (f) f.parentNode.removeChild(f);
      b.classList.remove('is-live');
    });
  }
  function openMap(box, btn) {
    if (navigator.onLine === false) {
      btn.querySelector('span').textContent = 'Mapa wymaga internetu';
      return;
    }
    closeMaps(box);
    if (box.querySelector('iframe')) return;
    var f = document.createElement('iframe');
    f.className = 'route__iframe';
    f.src = box.dataset.frameSrc;
    f.title = box.dataset.frameTitle;
    f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    box.appendChild(f);
    box.classList.add('is-live');
  }

  function showDay(id) {
    state.day = id;
    $$('.day-btn').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.day === id)); });
    $$('.day').forEach(function (p) { p.hidden = p.id !== 'day-' + id; });
    writeHash();
  }

  function paintPlan() {
    var info = $('#info');
    var open = info ? info.open : false; // domyślnie zwinięte, żeby plan dnia był na pierwszym ekranie
    $('#panel-plan').innerHTML = renderPlan(open);
    showDay(state.day);
  }

  function render() {
    renderHero();
    $('#tabs').innerHTML = TABS.map(function (t) {
      return '<button class="tab" type="button" data-tab="' + t.id + '">' + icon(t.icon) + (t.short ? '<span class="tab__full">' + t.label + '</span><span class="tab__short">' + t.short + '</span>' : '<span>' + t.label + '</span>') + '</button>';
    }).join('');
    $('#content').innerHTML = TABS.map(function (t) {
      return '<section class="panel" id="panel-' + t.id + '" aria-label="' + t.label + '" hidden>' + (t.render ? t.render() : '') + '</section>';
    }).join('');
    $('#footer').innerHTML = '<p>' + T.meta.checked + '</p><p class="footer__sig"><strong>Husa · Znojmo 2026</strong></p>';
    readHash();
    paintPlan();

    $('#tabs').addEventListener('click', function (e) {
      var b = e.target.closest('.tab');
      if (b) showTab(b.dataset.tab, true);
    });
    $('#content').addEventListener('click', function (e) {
      var day = e.target.closest('.day-btn');
      if (day) { showDay(day.dataset.day); return; }
      if (e.target.closest('[data-open-info]')) {
        var info = $('#info');
        info.open = true;
        scrollToEl(info);
        return;
      }
      var goTab = e.target.closest('[data-goto-tab]');
      if (goTab) { showTab(goTab.dataset.gotoTab, true); return; }
      var guideBtn = e.target.closest('[data-guide]');
      if (guideBtn) {
        var g = guideBtn.closest('.guide');
        $$('.seg__b', g).forEach(function (b) { b.setAttribute('aria-pressed', String(b === guideBtn)); });
        $$('.guide__pane', g).forEach(function (p) { p.hidden = p.dataset.pane !== guideBtn.dataset.guide; });
        return;
      }
      if (searchClick(e)) return;
      var wineBtn = e.target.closest('[data-wine]');
      if (wineBtn) { openSheet(wineBtn.dataset.wine); return; }
      var flavor = e.target.closest('[data-flavor]');
      if (flavor) { showFlavor(flavor.dataset.flavor); return; }
      if (e.target.closest('[data-spin]')) { spinWheel(); return; }
      var load = e.target.closest('[data-load-map]');
      if (load) { openMap(load.parentNode, load); return; }
      var close = e.target.closest('[data-close-map]');
      if (close) { closeMaps(); return; }
      var route = e.target.closest('[data-route]');
      if (route) {
        showTab('spacery');
        scrollToEl(document.getElementById('trasa-' + route.dataset.route));
        return;
      }
      var jump = e.target.closest('[data-jump]');
      if (jump) {
        e.preventDefault(); // nie psujemy hasha z zakładką
        scrollToEl(document.getElementById(jump.dataset.jump));
      }
    });
    bindSearch();
    window.addEventListener('hashchange', function () { readHash(); showTab(state.tab); showDay(state.day); });

    // Strona otwarta na długo (np. od rana): odśwież „dziś” i „Następne”.
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'visible') return;
      var now = pragueNow();
      var changed = now.date !== NOW.date || Math.floor(now.minutes / 15) !== Math.floor(NOW.minutes / 15);
      NOW = now;
      if (!changed) return;
      var newToday = todayId(NOW);
      if (newToday !== TODAY && newToday) state.day = newToday;
      TODAY = newToday;
      paintPlan();
    });

    showTab(state.tab);
    if (state.searchQ) openSearchLink(state.searchQ);
  }

  render();

  /* ---------------- Offline (tylko na zwykłym hostingu, nie w GAS) ---------------- */
  if ('serviceWorker' in navigator && !window.__GAS__ && location.protocol === 'https:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
