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
    photo: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10.5" r="1.8"/><path d="M21 16l-5-5-8 8"/>'
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

  function renderItem(it, isNext) {
    var cls = 'item' + (it.highlight ? ' item--hl' : '') + (isNext ? ' item--next' : '');
    var alt = '';
    if (it.alt) {
      var a = it.alt;
      alt = '<div class="alt' + (a.status === 'rain' ? ' alt--rain' : '') + '">' +
        '<div class="alt__label">' + (a.status ? statusChip(a.status, a.label) : a.label) + '</div>' +
        '<h4>' + a.title + '</h4>' + place(a.place) + '<p class="small">' + a.text + '</p>' + actions(a.links, a.contacts) +
        (a.route ? routeLink(a.route) : '') + '</div>';
    }
    return '<li class="' + cls + '">' +
      '<div class="item__top"><span class="time">' + it.time + '</span>' +
      (isNext ? '<span class="next-label">Następne</span>' : '') + statusChip(it.status, it.tag) + '</div>' +
      '<h3>' + it.title + '</h3>' + place(it.place) +
      (it.text ? '<p>' + it.text + '</p>' : '') +
      (it.note ? '<p class="item__note">' + it.note + '</p>' : '') +
      actions(it.links, it.contacts) +
      (it.route ? routeLink(it.route) : '') +
      (it.infoLink ? '<button type="button" class="tlink tlink--btn" data-open-info>' + icon('photo') + '<span>' + it.infoLink + '</span></button>' : '') +
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
    return '<article class="card">' +
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
  var WN = window.WINES || { wines: {}, producers: {}, top10: [], champions: [], catalog: [], flavors: [], samples: [], grapeWines: {} };
  var WM = window.WINE_MEDIA || { bottles: {}, logos: {} };
  var FLAV = {};
  WN.flavors.forEach(function (f) { FLAV[f.id] = f; });

  function wine(id) { return WN.wines[id]; }
  function producer(w) { return WN.producers[w.p] || { name: '', place: '', region: '' }; }
  function fmt(n) { return String(n).replace('.', ','); }
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
  function regionChip(p) { return p.region ? '<span class="region region--' + p.region.toLowerCase() + '">' + p.region + '</span>' : ''; }
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
      '<span class="wtile__name">' + w.name + ' ' + w.year + '</span>' + (extra || '') +
      (w.price ? '<span class="wtile__price">' + w.price + '</span>' : '') + '</span></button>';
  }
  function wineRow(id, rank) {
    var w = wine(id), p = producer(w);
    return '<button type="button" class="wrow" data-wine="' + id + '">' +
      '<span class="wrow__rank">' + rank + '</span>' +
      '<span class="wrow__img">' + bottleImg(id) + '</span>' +
      '<span class="wrow__body">' +
        '<span class="wrow__top">' + logoEl(w.p) + regionChip(p) + '</span>' +
        '<span class="wrow__name">' + w.name + ' ' + w.year + '</span>' +
        '<span class="wrow__prod">' + p.name + ' · ' + w.style + '</span>' +
        (w.award ? '<span class="award">' + w.award + '</span>' : '') +
        '<span class="wrow__short">' + w.short + '</span>' + meters(w) +
        '<span class="wrow__foot"><span class="fchips">' + flavorChips(w, 3) + '</span>' +
          (w.price ? '<span class="price">' + w.price + '</span>' : '<span class="price price--na">cena do sprawdzenia</span>') + '</span>' +
      '</span></button>';
  }
  function champCard(id) {
    var w = wine(id), p = producer(w);
    return '<button type="button" class="wchamp" data-wine="' + id + '">' +
      '<span class="wchamp__img">' + bottleImg(id) + '</span>' +
      '<span class="wchamp__body"><span class="award award--gold">' + w.award + '</span>' +
        '<span class="wrow__name">' + w.name + ' ' + w.year + '</span>' +
        '<span class="wrow__prod">' + p.name + ' · ' + w.origin + '</span>' +
        '<span class="wchamp__warn">Trudno dostępne · szczegóły</span></span></button>';
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
        '<div class="sheet__badges">' + regionChip(p) + '<span class="tag">' + w.style + '</span>' + (w.award ? '<span class="award">' + w.award + '</span>' : '') + '</div>' +
        (w.price ? '<p class="sheet__price">' + w.price + '</p>' : '') +
        meters(w) + (w.alc ? '<p class="small muted">Alkohol ' + fmt(w.alc) + '% obj.</p>' : '') +
        (w.tags && w.tags.length ? '<div class="fchips">' + flavorChips(w) + '</div>' : '') +
        (w.origin ? '<p class="origin">' + w.origin + '</p>' : '') +
        '<p class="small">' + w.text + '</p>' + (w.note ? '<p class="item__note">' + w.note + '</p>' : '') +
        actions(w.links) +
      '</div></div>';
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
    if (!wine(id)) return;
    var d = sheetEl();
    d.querySelector('.sheet__content').innerHTML = sheetHtml(id);
    if (typeof d.showModal === 'function') { if (!d.open) d.showModal(); } else d.setAttribute('open', '');
    d.querySelector('.sheet__content').scrollTop = 0;
  }
  function closeSheet() {
    var d = document.getElementById('wine-sheet');
    if (!d) return;
    if (typeof d.close === 'function' && d.open) d.close(); else d.removeAttribute('open');
  }

  /* Dobierz wino: przyciski smaków + koło. */
  function allWineIds() {
    var seen = {}, out = [];
    var add = function (id) { if (id && !seen[id] && WN.wines[id]) { seen[id] = 1; out.push(id); } };
    WN.top10.forEach(add);
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
      '<p class="small muted">Wybierz smak albo zakręć kołem. Pokażemy pasujące butelki z Top 10 i katalogu. Dotknij butelki, żeby zobaczyć szczegóły.</p>' +
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
    var jump = [['w-czempioni', 'Czempioni'], ['w-top10', 'Top 10'], ['w-dobierz', 'Dobierz wino'], ['w-degustacja', 'Degustacja'],
      ['w-enoteka', 'Enotéka'], ['w-katalog', 'Katalog'], ['w-odmiany', 'Ściąga']];
    var html = '';
    html += '<div class="card wine-hero"><h2>Znojmo w kieliszku</h2><p>' + V.stats + '</p></div>';
    html += '<nav class="jump" aria-label="Na tej stronie">' + jump.map(function (j) {
      return '<a href="#' + j[0] + '" data-jump="' + j[0] + '">' + j[1] + '</a>';
    }).join('') + '</nav>';

    // Czempioni — na samej górze, z uczciwą informacją o dostępności
    html += '<h2 class="section-title" id="w-czempioni">Czempioni konkursu 2026</h2>' +
      '<p class="section-sub">Najwyżej ocenione partie regionalnego konkursu na Znojemsku. Trudno je kupić, więc warto pytać w sklepach i u producentów.</p>' +
      '<div class="wchamps">' + WN.champions.map(champCard).join('') + '</div>';

    // Top 10
    html += '<h2 class="section-title" id="w-top10">Top 10 win: Znojmo, Mikulov i Valtice</h2>' +
      '<p class="section-sub">Siedem butelek ze Znojemska z przewodnika i trzy złote wina Salonu vín 2026 spod Pálavy i z Valtic. Dotknij, żeby zobaczyć szczegóły.</p>' +
      '<div class="wrows">' + WN.top10.map(function (id, i) { return wineRow(id, i + 1); }).join('') + '</div>';
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
      '<div class="card">' + place(E.place) + '<p class="small muted hours">' + icon('clock') + '<span>' + E.hours + '</span></p>' +
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
      '<p class="small">Top 10 uzupełniają trzy wina z katalogu Salonu vín ČR 2026 (sto najlepszych win w Czechach) z podoblasti mikulowskiej. Dane o cukrze i kwasach pochodzą z katalogu Salonu i stron producentów.</p>' +
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
  }
  function writeHash() {
    var h = '#' + state.tab + (state.tab === 'plan' ? '/' + state.day : '');
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
    $('#footer').innerHTML = '<p>' + T.meta.checked + '</p><p class="footer__sig"><strong>Husa · Znojmo 2026</strong> · Ekipa Wrocław</p>';
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
  }

  render();

  /* ---------------- Offline (tylko na zwykłym hostingu, nie w GAS) ---------------- */
  if ('serviceWorker' in navigator && !window.__GAS__ && location.protocol === 'https:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }
})();
