/*
 * Rejestr win i winiarni dla zakładki „Wino”.
 * Źródła: docs/Znojmo-przewodnik-winiarski-2026-V2.md, katalog Salon vín ČR 2026 (vinarskecentrum.cz),
 * strony produktów u producentów (cukier, kwasy, ceny). Zdjęcia: site/js/wine-media.js.
 *
 * Tagi smaków (filtr „Dobierz wino”) przypisane według opisów aromatów w źródłach:
 *   kwiatowe, owocowe, mineralne, beczka, korzenne, czerwone, babelki, slodsze
 *   „slodsze” = najsłodsze z wytrawnych: cukier resztkowy od 6 g/l (półwytrawnych nie liczymy).
 */
(function () {
  'use strict';
  var web = function (label, url) { return { label: label, url: url, kind: 'web' }; };
  var pdf = function (label, url) { return { label: label, url: url, kind: 'pdf' }; };
  var REGIONAL = 'https://www.narodnisoutezvin.cz/media/459/download/Dle_zeme_prihlasovatele_bodu.pdf?v=1';
  var SALON = function (nr) { return 'https://www.vinarskecentrum.cz/salon-vin/vina-v-salonu/260' + (nr < 10 ? '0' : '') + nr; };

  var producers = {
    hnanice: { name: 'Vinice Hnanice', place: 'Hnanice · odbiór także Šatov 513', region: 'Znojmo' },
    znovin: { name: 'Znovín Znojmo', place: 'Šatov · sklep przy klasztorze Louka', region: 'Znojmo' },
    pialek: { name: 'Piálek & Jäger', place: 'Nový Šaldorf · Vinařská 47', region: 'Znojmo' },
    spalek: { name: 'Špalek', place: 'Nový Šaldorf · Sklepní 104/E', region: 'Znojmo' },
    thaya: { name: 'Thaya', place: 'Havraníky 145', region: 'Znojmo' },
    waldberg: { name: 'Waldberg', place: 'Vrbovec · piwnica w Chvalovicach', region: 'Znojmo' },
    oulehla: { name: 'Oulehla', place: 'Dolní Kounice / Nové Bránice', region: 'Znojmo' },
    lahofer: { name: 'Lahofer', place: 'Dobšice · Vinice 579', region: 'Znojmo' },
    halkoci: { name: 'Halkoci', place: 'Šatov · uliczka piwnic', region: 'Znojmo' },
    korinek: { name: 'Josef Kořínek', place: 'Hnanice · Okružní 10', region: 'Znojmo' },
    simenon: { name: 'Simenon', place: 'Chvalovice 112', region: 'Znojmo' },
    ampelos: { name: 'Ampelos', place: 'Vrbovec · stacja hodowli winorośli', region: 'Znojmo' },
    dobravinice: { name: 'Dobrá Vinice', place: 'Nový Šaldorf-Sedlešovice', region: 'Znojmo' },
    davinus: { name: 'DAVINUS', place: 'we współpracy z Waldbergiem', region: 'Znojmo' },
    gotberg: { name: 'Gotberg', place: 'Popice pod Pálavą', region: 'Mikulov' },
    cervinka: { name: 'Vinařství Červinka', place: 'Horní Věstonice pod Pálavą', region: 'Mikulov' },
    valtice: { name: 'Château Valtice', place: 'Vinné sklepy Valtice', region: 'Valtice' },
    vinohort: { name: 'VINO HORT', place: 'Znojemsko', region: 'Znojmo' },
    hanzel: { name: 'Hanzel', place: 'Znojemsko', region: 'Znojmo' }
  };

  var wines = {
    /* ---------- Top 10 ---------- */
    'znovin-sobes-2025': {
      p: 'znovin', name: 'Ryzlink rýnský Šobes', year: 2025, style: 'białe · wytrawne', price: '280 Kč', sugar: 6.2, acid: 7.2,
      origin: 'Naše klenoty · partia 5390 · Podmolí / Šobes', tags: ['owocowe', 'kwiatowe', 'slodsze'],
      short: 'Mirabelka, suszona morela i lipa z najsłynniejszej parceli Podyjí.',
      text: 'Wytrawny Riesling z jednej rozpoznawalnej parceli Podyjí. Producent wymienia mirabelkę, suszoną morelę, lipę i nektarynkę. Spróbuj z pieczonym drobiem, potem wróć do kieliszka po kilku minutach. O partię 5390 zapytaj w sklepie przy klasztorze Louka.',
      links: [web('Karta wina / zakup', 'https://www.znovin.cz/e-shop/ryzlink-rynsky-pozdni-sber-2025-z-5390'), web('Sklep w Znojmie', 'https://www.znovin.cz/vydejni-mista/znojmo-prodejna-vin-loucky-klaster')]
    },
    'hnanice-rr-2025': {
      p: 'hnanice', name: 'Ryzlink rýnský VOC', year: 2025, style: 'białe · wytrawne', price: '199 Kč', sugar: 7.2, acid: 7.1, alc: 12,
      award: 'Wielkie złoto · 93,33 pkt', origin: 'Havraníky / Staré vinice · partia 3394/25', tags: ['owocowe', 'kwiatowe', 'mineralne', 'slodsze'],
      short: 'Cytryna i lipa, mineralny podton. Wielkie złoto regionalne 2026.',
      text: 'Wielkie złoto w regionalnej edycji 2026. Karta winiarni wyświetla numer 3394/2, więc przy zakupie porównaj etykietę z protokołem. Najlepszy drugi zakup do porównania parceli Šobes ze Starými vinicami. Do porównania odmian z tej samej parceli dobierz Hnanice Veltlín VOC 2025.',
      links: [web('Karta wina', 'https://www.vinice-hnanice.cz/produkt/ryzlink-rynsky-voc-znojmo-2025/'), web('Vínovín · 3394/25', 'https://www.vinovin.cz/ryzlink-rynsky--voc--suche-vino--2025-vinice-hnanice/'), pdf('Wyniki regionalne, s. 4', REGIONAL)]
    },
    'pialek-sb-2025': {
      p: 'pialek', name: 'Sauvignon VOC', year: 2025, style: 'białe · wytrawne', price: '220 Kč', sugar: 7.4, acid: 6.1,
      origin: 'U Hájku (Dobšice) i Šác (Vrbovec)', tags: ['owocowe', 'slodsze'],
      short: 'Dojrzała brzoskwinia i łagodny finisz, dla tych, którzy wolą owoc od trawy.',
      text: 'Jedna odmiana z dwóch parcel. Producent opisuje dojrzałą brzoskwinię. Przy 7,4 g/l cukru i 6,1 g/l kwasów finisz może wydać się łagodniejszy niż w bardzo wytrawnym Sauvignon. Dobry kontrast z Sauvignon Hnanice z U Kapličky.',
      links: [web('Karta wina / zakup', 'https://e-shop.pialek.cz/sauvignon-voc-2025/'), web('Najlepsza kolekcja regionalna 2026', 'https://www.narodnisoutezvin.cz/aktuality/narodni-soutez-vin-na-znojemsku-sampionem-je-ryzlink-rynsky')]
    },
    'spalek-velky-sud-2023': {
      p: 'spalek', name: 'Ryzlink rýnský Velký Sud BIO', year: 2023, style: 'białe · wytrawne', price: '330 Kč', sugar: 4, acid: 7.7, alc: 13,
      award: 'Złoto Salon vín 2026', origin: 'Kraví hora · Nový Šaldorf · partia 1723', tags: ['beczka', 'owocowe', 'mineralne'],
      short: 'Rok w dębie: miód, kandyzowane cytrusy i słony finisz.',
      text: 'Fermentował spontanicznie przez rok w dębowej beczce 2000 l. Miód, kandyzowane cytrusy i suszone morele, a słony ślad w smaku oddaje podłoże Kraví hory. Dobry, żeby zestawić rozwinięty aromat z młodszym Rieslingiem ze Šobesu.',
      links: [web('Karta wina / zakup', 'https://www.spalek.bio/product-page/ryzlink-r%C3%BDnsk%C3%BD-velk%C3%BD-sud'), web('Salon vín 2026', SALON(33))]
    },
    'waldberg-ch-2022': {
      p: 'waldberg', name: 'Chardonnay Lampelberg', year: 2022, style: 'białe · wytrawne', price: '160 Kč', sugar: 0.6, acid: 6, alc: 14,
      award: 'Złoto Salon vín 2026', origin: 'Vrbovec / Lampelberg · partia 22/152', tags: ['beczka', 'mineralne', 'owocowe'],
      short: '15 miesięcy w dębie: wanilia, tytoń i kandyzowany ananas.',
      text: 'Wytrawne, 15 miesięcy w dębie. Salon opisuje wanilię, kandyzowanego ananasa, suszony tytoń i mineralną końcówkę. Za 160 Kč według karty Enotéki można zabrać do domu dojrzalszą, beczkową butelkę. Najpierw spróbuj małego nalewu.',
      links: [web('Karta Enotéki', 'https://enoteka.vinotrh.cz/detail/4'), web('Vínovín · 231 Kč', 'https://www.vinovin.cz/chardonnay--vyber-z-hroznu--suche-vino--2022---waldberg/'), web('Salon vín 2026', SALON(16))]
    },
    'ampelos-veritas-2024': {
      p: 'ampelos', name: 'Veritas', year: 2024, style: 'białe · wytrawne', price: '209 Kč', sugar: 7.3, acid: 5.7,
      origin: 'Nad sklepy · Vrbovec', tags: ['kwiatowe', 'owocowe', 'slodsze'],
      short: 'Lokalna odmiana z Vrbovca: kwiaty, delikatny owoc i miód.',
      text: 'Wytrawne wino z rzadkiej odmiany wyhodowanej w miejscowej stacji (Ryzlink červený × Bouvierův hrozen). Szukaj delikatnego owocu, kwiatów i nuty miodu. Zacznij od Veritas, a dopiero potem aromatyczna Pálava, bo potrafi zdominować nos.',
      links: [web('Karta wina / zakup', 'https://ampelos.cz/veritas-2024-c284')]
    },
    'oulehla-fr-2022': {
      p: 'oulehla', name: 'Frankovka Na Nivách', year: 2022, style: 'czerwone · wytrawne', price: '253 Kč', sugar: 0.2, acid: 5.3, alc: 12,
      origin: 'Dolní Kounice / Na nivách · partia 2250', tags: ['czerwone', 'owocowe', 'korzenne'],
      short: 'Wiśnia i korzenny finisz. Czerwone do gęsi.',
      text: 'Wytrawna czerwień o profilu wiśniowo-korzennym, 18 miesięcy w dużej beczce. Wybór do gęsi ze względu na profil i cenę. Partia 2250 ma 84,00 pkt w edycji regionalnej 2026.',
      links: [web('Karta wina / zakup', 'https://eshop.oulehlavinarstvi.cz/frankovka-2022-pozdni-sber/')]
    },
    'gotberg-palava-2024': {
      p: 'gotberg', name: 'Pálava', year: 2024, style: 'białe · wytrawne (pozdní sběr)', price: '', sugar: 6.5, acid: 5.9, alc: 12.5,
      award: 'Złoto Salon vín 2026', origin: 'Popice · trať Unédy · partia G0224', tags: ['kwiatowe', 'owocowe', 'slodsze'],
      short: 'Wytrawna Pálava: kwiaty, lukrecja i liczi.',
      text: 'Pálava z dojrzałych gron, z typowym charakterem odmiany. Kwiatowo-owocowy aromat z nutami lukrecji i liczi. W smaku pełna i owocowa, z harmonijną kwasowością, która dodaje świeżości na finiszu.',
      note: 'Rocznika 2024 nie ma już w e-sklepie Gotberga. Jest tam Pálava pozdní sběr 2025 za 290 Kč (3,8 g/l cukru, 6,5 g/l kwasów).',
      links: [web('Salon vín 2026', SALON(48)), web('Gotberg: Pálava 2025', 'https://gotberg.cz/cs/eshop/palava-pozdni-sber-2025:514/')]
    },
    'cervinka-rv-2022': {
      p: 'cervinka', name: 'Ryzlink vlašský VOC Pálava', year: 2022, style: 'białe · wytrawne', price: '', sugar: 4.2, acid: 5.2, alc: 13,
      award: 'Złoto Salon vín 2026', origin: 'Horní Věstonice · trať Pod Martinkou · partia 30/22', tags: ['kwiatowe', 'owocowe', 'mineralne'],
      short: 'Kwiaty spod Pálavy, cytrusy i mineralna struktura.',
      text: 'Z najstarszych winnic Červinki, z naciskiem na terroir Pálavy. W kieliszku pálavska flora razem z cytrusami i owocami pestkowymi, w smaku strukturalne i mineralne. Ryzlink vlašský to sztandarowa odmiana wzgórz Pálava.',
      note: 'Ceny w sprzedaży nie udało się potwierdzić. Pytaj u producenta w Horních Věstonicach.',
      links: [web('Salon vín 2026', SALON(24))]
    },
    'valtice-fr-2023': {
      p: 'valtice', name: 'Frankovka barrique', year: 2023, style: 'czerwone · wytrawne (výběr z hroznů)', price: '', sugar: 0.5, acid: 5.3, alc: 13.5,
      award: 'Złoto Salon vín 2026', origin: 'Dolní Dunajovice · trať Pod Slunným · partia 23229', tags: ['czerwone', 'beczka', 'owocowe'],
      short: 'Beczka barrique: jeżyny, wanilia i dojrzałe wiśnie.',
      text: 'Ciemnoczerwone, bardzo pełne i ekstraktywne, z przyjemną taniną. Leżakowanie w beczkach barrique daje w aromacie jeżyny, wanilię, dojrzałe wiśnie i dżem żurawinowy.',
      note: 'Ceny w sprzedaży nie udało się potwierdzić. Pytaj w Vinných sklepach Valtice.',
      links: [web('Salon vín 2026', SALON(85))]
    },

    /* ---------- Czempioni ---------- */
    'davinus-rr-2022': {
      p: 'davinus', name: 'Ryzlink rýnský, kabinet', year: 2022, style: 'białe · wytrawne', price: '189 Kč', alc: 13,
      award: 'Czempion regionalny 2026', origin: 'partia 22/127', tags: [],
      short: 'Oficjalny czempion regionalnego konkursu na Znojemsku.',
      text: 'DAVINUS Ryzlink rýnský 2022, kabinet, partia 22/127, to oficjalny czempion regionalny. Powstał we współpracy z Waldbergiem.',
      note: 'Trudno dostępne. W e-sklepie DAVINUS jest Ryzlink rýnský 2022 kabinet za 189 Kč, ale bez numeru partii. Zapytaj o partię 22/127.',
      links: [web('E-sklep DAVINUS', 'https://www.eshop.davinus.cz/ryzlink-rynsky-2022-kabinetni-vino-davinus/'), pdf('Wyniki regionalne, s. 1–2', REGIONAL)]
    },
    'oulehla-fr-2023': {
      p: 'oulehla', name: 'Frankovka Na Nivách', year: 2023, style: 'czerwone · wytrawne', price: '',
      award: 'Najlepsze wytrawne czerwone · 90,67 pkt', origin: 'Dolní Kounice / Na nivách · partia 2350', tags: [],
      short: 'Zwycięzca kategorii wytrawnych czerwonych w konkursie regionalnym 2026.',
      text: 'Oulehla Frankovka Na nivách 2023, partia 2350, wygrała kategorię wytrawnych czerwonych z 90,67 pkt.',
      note: 'Trudno dostępne. W e-sklepie Oulehli jest tylko rocznik 2022 (253 Kč). Na zdjęciu butelka rocznika 2022.',
      links: [web('Czerwone wina Oulehli', 'https://eshop.oulehlavinarstvi.cz/cervene-vino/'), pdf('Wyniki regionalne, s. 1–2', REGIONAL)]
    },

    /* ---------- Trop od sommeliera, ściąga odmian ---------- */
    'vinohort-kralovsky-2023': {
      p: 'vinohort', name: 'Královský Ryzlink rýnský VOC', year: 2023, style: 'białe · wytrawne', price: '423 Kč',
      origin: 'U Tří dubů · partia 11/23', tags: ['owocowe'],
      short: 'Wyróżniony przez sommeliera Františka Koudelę.',
      text: 'František Koudela, przewodniczący VOC Znojmo, wyróżnił to wino za regionalny charakter, elegancję i głębię. Morela, skórka pomarańczy i nuta naftowa.',
      links: [web('Ocena Koudeli', 'https://www.vocznojmo.cz/cs/aktualita/ryzlink-rynsky-od-vino-hort-v-kralovske-rade-voc-znojmo-405/'), web('Karta wina / zakup', 'https://www.vinotrh.cz/kralovsky-ryzlink-rynsky/')]
    },
    'hanzel-rotgipfler-2025': {
      p: 'hanzel', name: 'Rotgipfler Volné pole', year: 2025, style: 'białe · wytrawne', price: '205 Kč', tags: ['owocowe', 'kwiatowe'],
      short: 'Mirabelka i akacja. Odmiana spokrewniona z Grünerem.',
      text: 'Rotgipfler to Traminer × Roter Veltliner, więc z Grünerem dzieli jednego rodzica. Wytrawny, z mirabelką i akacją. 205 Kč na wynos według karty Enotéki.',
      links: [web('Karta wina', 'https://www.vinotrh.cz/rotgipfler-volne-pole-2025-p-s-/')]
    },
    'znovin-neuburske-2025': {
      p: 'znovin', name: 'Neuburské z Pekla', year: 2025, style: 'białe', price: '', tags: [],
      short: 'Migdał i miód ze Šatova.',
      text: 'Neuburské to odrębna odmiana z rodziny Roter Veltliner. Znovín Neuburské z Pekla 2025 ze Šatova daje migdał i miód.',
      links: [web('Karta wina', 'https://www.znovin.cz/e-shop/neuburske-pozdni-sber-2025-z5355')]
    },
    'znovin-sobes-2024': {
      p: 'znovin', name: 'Ryzlink rýnský Šobes', year: 2024, style: 'białe · wytrawne', price: '', tags: ['owocowe', 'kwiatowe'],
      short: 'W Enotéce nalewany jest rocznik 2024.',
      text: 'Ten rocznik jest w karcie Enotéki (#10). Do zakupu przewodnik poleca rocznik 2025 (w Top 10).',
      links: [web('Karta Enotéki', 'https://enoteka.vinotrh.cz/')]
    },

    /* ---------- Katalog ---------- */
    'hnanice-vz-2025': { p: 'hnanice', name: 'Veltlínské zelené VOC', year: 2025, style: 'białe · wytrawne', price: '179 Kč', award: 'Złoto · 89,33 pkt', origin: 'Staré vinice · partia 5432/25', tags: ['owocowe', 'korzenne'], short: 'Gruszka, pieprz i migdał.', text: 'Wytrawny Grüner ze Starých vinic w Havraníkach. Szukaj gruszki, pieprzu i migdału. 179 Kč w Enotéce lub Vinotrh.', links: [web('Karta wina / zakup', 'https://www.vinice-hnanice.cz/produkt/veltlinske-zelene-voc-znojmo-2025/')] },
    'hnanice-sb-2025': { p: 'hnanice', name: 'Sauvignon VOC', year: 2025, style: 'białe · wytrawne', price: '199 Kč', award: 'Wielkie złoto · 92,00 pkt', origin: 'U Kapličky · partia 3426/25', tags: ['owocowe'], short: 'Agrest i liść porzeczki.', text: 'Wytrawny Sauvignon Blanc z U Kapličky w Hnanicach. Szukaj agrestu i liścia porzeczki.', links: [web('Karta wina / zakup', 'https://www.vinice-hnanice.cz/produkt/sauvignon-voc-znojmo-2025/')] },
    'znovin-sb-2025': { p: 'znovin', name: 'Sauvignon VOC Znojmo', year: 2025, style: 'białe · wytrawne', price: '190 Kč', origin: 'Kokusovy hory · Dobelice · 5334', tags: ['owocowe'], short: 'Agrest, porzeczka, trawa, limonka.', text: 'Wytrawny Sauvignon Blanc z Kokusovych hor w Dobelicach. Agrest, porzeczka, trawa i limonka.', links: [web('Karta wina / zakup', 'https://www.znovin.cz/e-shop/sauvignon-voc-znojmo-2025-z5334')] },
    'znovin-vz-2025': { p: 'znovin', name: 'Veltlínské zelené VOC Znojmo', year: 2025, style: 'białe · wytrawne', price: '190 Kč', origin: 'Kokusovy hory · 5337', tags: ['owocowe', 'korzenne'], short: 'Jabłko, gruszka, pieprz.', text: 'Wytrawny Grüner Veltliner z tej samej parceli co Sauvignon. Jabłko, gruszka, pieprz.', links: [web('Karta wina / zakup', 'https://www.znovin.cz/e-shop/veltlinske-zelene-voc-znojmo-2025-z5337')] },
    'pialek-vz-extra-2024': { p: 'pialek', name: 'Veltlínské zelené Extra', year: 2024, style: 'białe · wytrawne', price: 'ok. 240 Kč', origin: 'Načeratický kopec · Znojmo', tags: ['owocowe', 'beczka'], short: 'Starsze krzewy, część w akacji.', text: 'Wytrawny Grüner ze starszych krzewów. Część dojrzewała w akacji. Pełniejsze, owocowe, długie.', links: [web('Karta wina / zakup', 'https://e-shop.pialek.cz/veltlinske-zelene-extra-2024/')] },
    'pialek-hibernal-2025': { p: 'pialek', name: 'Hibernal', year: 2025, style: 'białe · półwytrawne', price: '240 Kč', origin: 'Šác · Vrbovec', tags: ['owocowe'], short: 'Mango, brzoskwinia, limonka, miód.', text: 'Półwytrawna odmiana z hodowli w Geisenheim. Mango, brzoskwinia, limonka, miód.', links: [web('Karta wina / zakup', 'https://e-shop.pialek.cz/hibernal-2025/')] },
    'spalek-vz-2025': { p: 'spalek', name: 'Veltlínské zelené VOC Znojmo BIO', year: 2025, style: 'białe · wytrawne', price: '240 Kč', sugar: 1.4, origin: 'Kraví hora', tags: ['owocowe', 'korzenne'], short: 'Jabłko i biały pieprz.', text: 'Wytrawny Grüner z Kraví hory, 1,4 g/l cukru. Szukaj jabłka i białego pieprzu.', links: [web('Karta wina / zakup', 'https://www.spalek.bio/product-page/veltl%C3%ADnsk%C3%A9-zelen%C3%A9-bio-voc-znojmo-2024')] },
    'spalek-gryllus-2025': { p: 'spalek', name: 'Gryllus bílý VOC BIO', year: 2025, style: 'białe · wytrawne', price: '250 Kč', origin: 'Kraví hora · kupaż', tags: [], short: 'Kupaż Sauvignon, Rieslinga i Grünera.', text: 'Wytrawny kupaż Sauvignon, Rieslinga i Grünera z Kraví hory. Sprawdź, jak kwasowość łączy się z aromatem i pełnią.', links: [web('Karta wina / zakup', 'https://www.spalek.bio/product-page/cuv%C3%A9e-gryllus-voc-znojmo')] },
    'thaya-apri-2024': { p: 'thaya', name: 'Apri Chardonnay', year: 2024, style: 'białe · wytrawne', price: '575 Kč', origin: 'Znojemsko · beczki 400 l', tags: ['beczka', 'owocowe'], short: 'Ananas, żółty owoc, długi finisz.', text: 'Fermentacja i dojrzewanie w beczkach 400 l. Ananas, żółty owoc, długi finisz.', links: [web('Karta wina / zakup', 'https://eshop.vinarstvithaya.cz/apri-chardonnay-2024/')] },
    'thaya-vz-2025': { p: 'thaya', name: 'Veltlínské zelené · Pozdravy z Národního parku', year: 2025, style: 'białe · wytrawne', price: '215 Kč', award: 'Wielkie złoto · 93,33 pkt', origin: 'pozdní sběr · partia VZ/2548', tags: [], short: 'Drugi punkt odniesienia do veltlína Hnanice.', text: 'Wytrawny Grüner, pozdní sběr, partia VZ/2548. Wielkie złoto regionalne 2026 (93,33 pkt).', links: [web('Karta wina', 'https://eshop.vinarstvithaya.cz/veltlinske-zelene-2025/')] },
    'thaya-zw-2023': { p: 'thaya', name: 'Zweigeltrebe', year: 2023, style: 'czerwone · wytrawne', price: '365 Kč', origin: 'Fládnická · Hnanice', tags: ['czerwone', 'korzenne', 'beczka'], short: 'Owoce, przyprawy, lukrecja.', text: 'Wytrawne czerwone. Owoce, przyprawy i lukrecja. 16 miesięcy w beczce 400 l.', links: [web('Karta wina / zakup', 'https://eshop.vinarstvithaya.cz/zweigeltrebe-2023/')] },
    'waldberg-rv-2024': { p: 'waldberg', name: 'Ryzlink vlašský', year: 2024, style: 'białe · wytrawne', price: '160 Kč', origin: 'Waldberg', tags: ['owocowe'], short: 'Zielone jabłko, cytryna, zioła.', text: 'Wytrawny Welschriesling. Szukaj zielonego jabłka, cytryny i ziołowej końcówki. 160 Kč na wynos w Enotéce.', links: [web('Oferta Vinotrh', 'https://www.vinotrh.cz/waldberg/')] },
    'waldberg-rm-2021': { p: 'waldberg', name: 'Rulandské modré Volné pole', year: 2021, style: 'czerwone · wytrawne', price: '160 Kč', origin: 'Hostěradice', tags: ['czerwone', 'korzenne', 'beczka'], short: 'Tytoń, słodka papryka, wanilia.', text: 'Wytrawny Pinot Noir z Hostěradic. Tytoń, słodka papryka, waniliowy ślad beczki. 160 Kč na wynos w Enotéce.', links: [web('Karta wina / zakup', 'https://www.vinotrh.cz/rulandske-modre-volne-pole-2021-v-h--3/')] },
    'oulehla-ch-2023': { p: 'oulehla', name: 'Chardonnay Karlov Staré keře', year: 2023, style: 'białe · wytrawne', price: '293 Kč', award: 'Wielkie złoto · 92,67 pkt', origin: 'Karlov · partia 2345', tags: [], short: 'Stare krzewy, wielkie złoto regionalne.', text: 'Wytrawne Chardonnay ze starych krzewów w Karlovie, partia 2345. Wielkie złoto regionalne 2026 (92,67 pkt).', links: [web('Karta wina / zakup', 'https://eshop.oulehlavinarstvi.cz/chardonnay-karlov-2023-moravske-zemske-stare-kere/')] },
    'oulehla-merlot-2022': { p: 'oulehla', name: 'Merlot Grand Reserva', year: 2022, style: 'czerwone · wytrawne', price: '519 Kč', award: 'Złoto · 88,67 pkt', origin: 'Šibeniční hora · partia 2258', tags: ['czerwone', 'owocowe'], short: 'Owoc leśny, śliwka, kakao.', text: 'Wytrawny Merlot z Šibeniční hory. Owoc leśny, śliwka i kakao według producenta.', links: [web('Karta wina / zakup', 'https://eshop.oulehlavinarstvi.cz/merlot-grand-reserva-2022/')] },
    'lahofer-vcr-2024': { p: 'lahofer', name: 'Veltlínské červené rané Volné pole', year: 2024, style: 'białe · półwytrawne', price: '119 Kč', origin: 'Hostěradice', tags: ['owocowe', 'korzenne'], short: 'Soczyste, przyprawy, czerwona pomarańcza.', text: 'Półwytrawny Frühroter Veltliner z Hostěradic. Soczyste, z przyprawami i czerwoną pomarańczą.', links: [web('Karta wina / zakup', 'https://www.vinotrh.cz/veltlinske-cervene-rane-volne-pole-2024-kab-/')] },
    'lahofer-rajska-2025': { p: 'lahofer', name: 'Cuvée Rajská VOC', year: 2025, style: 'białe · wytrawne', price: '250 Kč', origin: 'Rajská zahrada · Znojmo', tags: ['owocowe'], short: 'Kupaż z winnicy w samym Znojmie.', text: 'Wytrawny kupaż Sauvignon, Grünera i Rieslinga z Rajskiej zahrady w Znojmie. Szukaj aromatu Sauvignon i świeżości Rieslinga.', links: [web('Karta wina / zakup', 'https://www.vinotrh.cz/cuvee-rajska-rajska-vinice-2025-voc/')] },
    'lahofer-vz-2025': { p: 'lahofer', name: 'Veltlínské zelené Volné pole VOC', year: 2025, style: 'białe · wytrawne', price: '195 Kč', origin: 'Hostěradice', tags: ['owocowe', 'korzenne'], short: 'Letnie jabłko, biały pieprz, migdał.', text: 'Wytrawny Grüner z Hostěradic. Letnie jabłko, biały pieprz i migdał. 195 Kč na wynos w Enotéce.', links: [web('Karta wina / zakup', 'https://www.vinotrh.cz/veltlinske-zelene-volne-pole-2025-voc/')] },
    'halkoci-typik-2025': { p: 'halkoci', name: 'Ryzlink TYPIK', year: 2025, style: 'białe · wytrawne', price: '249 Kč', origin: 'Šatov', tags: ['owocowe'], short: 'Morela, soczysta kwasowość.', text: 'Wytrawny Riesling. Morela, soczysta kwasowość i dłuższy owocowy finisz.', links: [web('Karta wina / zakup', 'https://vinarstvihalkoci.cz/produkt/ryzlink-typik-2025/')] },
    'halkoci-vz2-2024': { p: 'halkoci', name: 'Veltlín²', year: 2024, style: 'białe · wytrawne', price: '', sugar: 1.5, acid: 7.2, award: 'Złoto · 89,33 pkt', origin: 'beczka 1000 l · partia VZS24', tags: ['owocowe', 'korzenne', 'beczka'], short: 'Żółte owoce, pieprz, subtelne drewno.', text: 'Wytrawny Grüner z beczki 1000 l. Żółte owoce, pieprz i subtelne drewno. Cenę sprawdź u producenta.', links: [web('Karta wina / zakup', 'https://vinarstvihalkoci.cz/produkt/veltlin%C2%B2-2024/')] },
    'halkoci-supa-2025': { p: 'halkoci', name: 'SUPA · suchá Pálava', year: 2025, style: 'białe · wytrawne', price: '249 Kč', origin: 'Šatov', tags: ['kwiatowe', 'korzenne', 'owocowe'], short: 'Wytrawna Pálava: kwiaty i przyprawy.', text: 'Wytrawna Pálava, pojedyncza odmiana. Kwiaty, delikatne przyprawy, dojrzały owoc.', links: [web('Karta wina / zakup', 'https://vinarstvihalkoci.cz/produkt/supa-25/')] },
    'korinek-vz-2023': { p: 'korinek', name: 'Veltlínské zelené VOC', year: 2023, style: 'białe · wytrawne', price: '205 Kč', origin: 'Knížecí vrch · partia VZ21/23', tags: ['owocowe', 'korzenne'], short: 'Jabłko i pieprz.', text: 'Wytrawny Grüner z Knížecího vrchu w Hnanicach. Jabłko i pieprz.', links: [web('Karta wina / zakup', 'https://www.vinovin.cz/veltlinske-zelene--voc--suche-vino--2023-josef-korinek/')] },
    'korinek-petnat-2025': { p: 'korinek', name: 'PET NAT Ryzlink rýnský', year: 2025, style: 'musujące', price: '155 Kč', origin: 'Hnanice', tags: ['babelki', 'owocowe'], short: 'Riesling z bąbelkami i cytrusami.', text: 'Riesling z bąbelkami. Szukaj cytrusów i sprawdź, czy drobne perlenie wzmacnia świeżość.', links: [web('Karta wina / zakup', 'https://eshop.vinarstvi-korinek.cz/vinarstvi-korinek-josef-pet-nat-ryzlink-rynsky-2025')] },
    'korinek-muskat-2026': { p: 'korinek', name: 'Muškát moravský Fresh', year: 2026, style: 'białe · półwytrawne', price: '', origin: 'Hnanice', tags: ['kwiatowe', 'owocowe'], short: 'Młody muszkat: winogrona i kwiaty.', text: 'Półwytrawny młody muszkat. Świeże winogrona i kwiaty. Parcelę ustal przy zakupie.', links: [web('Karta wina / zakup', 'https://www.vinovin.cz/muskat-moravsky-fresh-zemske-polosuche-vino-2026-korinek/')] },
    'simenon-vz-2025': { p: 'simenon', name: 'Veltlínské zelené VOC', year: 2025, style: 'białe · wytrawne', price: '220 Kč', origin: 'Chvalovice', tags: ['owocowe', 'korzenne', 'mineralne'], short: 'Zielone jabłko, przyprawy, słonawy finisz.', text: 'Wytrawny Grüner z Chvalovic. Zielone jabłko, cytrusy, przyprawy i lekko słonawy finisz.', links: [web('Karta wina / zakup', 'https://shop.vinarstvisimenon.cz/veltlinske-zelene-voc-2025/')] },
    'simenon-rr-2025': { p: 'simenon', name: 'Ryzlink rýnský VOC', year: 2025, style: 'białe · wytrawne', price: '220 Kč', origin: 'Chvalovice i Vrbovec', tags: ['owocowe', 'mineralne'], short: 'Dojrzała morela, mineralna końcówka.', text: 'Wytrawny Riesling. Dojrzała morela, świeża kwasowość, mineralna końcówka.', links: [web('Karta wina / zakup', 'https://shop.vinarstvisimenon.cz/ryzlink-rynsky-voc-2025/')] },
    'simenon-sb-2025': { p: 'simenon', name: 'Sauvignon VOC', year: 2025, style: 'białe · wytrawne', price: '220 Kč', origin: 'Dívčí hora · Chvalovice', tags: ['owocowe'], short: 'Agrest, porzeczka, trawa.', text: 'Wytrawny Sauvignon Blanc z Dívčí hory. Agrest, porzeczka, trawa i cytrusy.', links: [web('Vínovín', 'https://www.vinovin.cz/sauvignon--voc--suche-vino--2025-simenon/')] },
    'ampelos-trio-2024': { p: 'ampelos', name: 'Trio', year: 2024, style: 'białe · wytrawne', price: '199 Kč', sugar: 6.2, acid: 5.4, origin: 'Vrbovec · kupaż', tags: ['owocowe', 'slodsze'], short: 'Kupaż trzech klasyków: owoc i zioła.', text: 'Kupaż Grünera, Rieslinga i Sauvignon. Szukaj połączenia owocu i ziół.', links: [web('Karta wina / zakup', 'https://ampelos.cz/trio-2024-c274')] },
    'ampelos-at-2024': { p: 'ampelos', name: 'Veltlínské zelené AT klony', year: 2024, style: 'białe · wytrawne', price: '209 Kč', origin: 'Vrbovec', tags: ['owocowe', 'korzenne'], short: 'Grüner z austriackich klonów.', text: 'Wytrawny Grüner z austriackich selekcji klonalnych. Jabłko i pieprz.', links: [web('Oferta Vinotrh', 'https://www.vinotrh.cz/ampelos-2/')] },
    'dobra-creme-2022': { p: 'dobravinice', name: 'Crème de Kambrium', year: 2022, style: 'musujące', price: '280 Kč', sugar: 1.9, origin: 'Nový Šaldorf-Sedlešovice', tags: ['babelki', 'mineralne'], short: 'Perlisty kupaż, ton chlebowy.', text: 'Perlisty kupaż Grünera, Rieslinga i Sauvignon. Kończy fermentację w butelce. Chlebowy ton i mineralny profil.', links: [web('Karta wina / zakup', 'https://www.dobravinice.cz/p/creme-de-kambrium-2022')] },
    'dobra-kambrium-2022': { p: 'dobravinice', name: 'Kambrium cuvée', year: 2022, style: 'białe · wytrawne', price: '310 Kč', origin: 'stare francuskie beczki', tags: ['kwiatowe', 'beczka'], short: 'Kwiatowe, pełne, ze starych beczek.', text: 'Wytrawne: 60% Grüner, po 20% Riesling i Sauvignon. Stare francuskie beczki, kwiatowy aromat i pełnia.', links: [web('Karta wina / zakup', 'https://www.dobravinice.cz/p/kambrium-cuvee-2022')] },
    'dobra-qvevri-2019': { p: 'dobravinice', name: 'Veltlínské zelené Qvevri', year: 2019, style: 'pomarańczowe · wytrawne', price: '660 Kč', sugar: 0, origin: 'glina qvevri', tags: [], short: 'Dziewięć miesięcy na skórkach w glinie.', text: 'Wytrawne pomarańczowe. Dziewięć miesięcy na skórkach w glinie, później beczka. Szukaj herbacianej cierpkości.', links: [web('Karta wina / zakup', 'https://www.dobravinice.cz/p/veltlinske-zelene-qvevri-2019')] }
  };

  window.WINES = {
    producers: producers,
    wines: wines,
    champions: ['davinus-rr-2022', 'oulehla-fr-2023'],
    top10: ['znovin-sobes-2025', 'hnanice-rr-2025', 'pialek-sb-2025', 'spalek-velky-sud-2023', 'waldberg-ch-2022',
      'ampelos-veritas-2024', 'oulehla-fr-2022', 'gotberg-palava-2024', 'cervinka-rv-2022', 'valtice-fr-2023'],
    bonus: 'vinohort-kralovsky-2023',
    quick: {
      title: 'Jeśli masz czas na jedną degustację',
      steps: [
        { id: 'hnanice-vz-2025', nr: '#3', text: 'Zacznij od Grünera z Hnanic.' },
        { id: 'lahofer-vz-2025', nr: '#15', text: 'Porównaj z Grünerem Lahofera.' },
        { id: 'znovin-sobes-2024', nr: '#10', text: 'Na koniec Riesling ze Šobesu.' }
      ],
      total: 'Trzy małe porcje kosztują według karty <strong>51 Kč</strong>. Przy zakupie w mieście zacznij od pary Hnanice ze Starých vinic: ten sam rocznik i parcela pozwalają porównać Grünera i Rieslinga.'
    },
    samples: [
      { group: '1–3 · Grüner w trzech odsłonach', items: [{ id: 'hnanice-vz-2025', nr: '#3', pour: '16 Kč' }, { id: 'simenon-vz-2025', nr: '#8', pour: '16 Kč' }, { id: 'lahofer-vz-2025', nr: '#15', pour: '16 Kč' }],
        alt: { id: 'ampelos-at-2024', nr: '#110', pour: '16 Kč' }, hint: 'Porównaj jabłko, pieprz i to, w którym winie przyprawowy finisz trwa najdłużej.' },
      { group: '4–6 · Trzy inne profile', items: [{ id: 'halkoci-typik-2025', nr: '#12', pour: '19 Kč' }, { id: 'waldberg-rv-2024', nr: '#11', pour: '14 Kč' }, { id: 'waldberg-ch-2022', nr: '#4', pour: '14 Kč' }],
        hint: 'Sprawdź różnicę między dwoma „ryzlinkami”, a beczkowe Chardonnay zostaw na koniec.' }
    ],
    catalog: [
      { p: 'hnanice', text: 'Najprostszy zestaw do poznania całej trójki VOC. Riesling i veltlín są z jednej parceli w Havraníkach.', wines: ['hnanice-vz-2025', 'hnanice-rr-2025', 'hnanice-sb-2025'] },
      { p: 'znovin', text: 'Najlepszy punkt wyjścia do porównania parcel: dwa wina VOC z Kokusovych hor i Šobes w Podyjí.', wines: ['znovin-sobes-2025', 'znovin-sb-2025', 'znovin-vz-2025'] },
      { p: 'pialek', text: 'Najlepsza kolekcja w regionalnej edycji Národní soutěž vín 2026.', wines: ['pialek-sb-2025', 'pialek-vz-extra-2024', 'pialek-hibernal-2025'] },
      { p: 'spalek', text: 'Ekologiczna uprawa i trzy interpretacje Kraví hory.', wines: ['spalek-vz-2025', 'spalek-velky-sud-2023', 'spalek-gryllus-2025'] },
      { p: 'thaya', text: 'Vinařství roku 2023. Lekkie białe, wina z beczki i ambitniejsza czerwień.', wines: ['thaya-apri-2024', 'thaya-vz-2025', 'thaya-zw-2023'] },
      { p: 'waldberg', text: 'Dobre miejsce, żeby wyjść poza trójkę VOC.', wines: ['waldberg-ch-2022', 'waldberg-rv-2024', 'waldberg-rm-2021'] },
      { p: 'oulehla', text: 'Najmocniejszy adres dla szukających wytrawnych czerwieni z udokumentowanym wynikiem.', wines: ['oulehla-fr-2022', 'oulehla-ch-2023', 'oulehla-merlot-2022'] },
      { p: 'lahofer', text: 'Dwa Veltlinery z jednej parceli Volné pole i kupaż z Rajskiej zahrady w samym Znojmie.', wines: ['lahofer-vcr-2024', 'lahofer-rajska-2025', 'lahofer-vz-2025'] },
      { p: 'halkoci', text: 'Trzy gwiazdki w przewodniku 2025/26. Świeża linia i wina dojrzewające w drewnie.', wines: ['halkoci-typik-2025', 'halkoci-vz2-2024', 'halkoci-supa-2025'] },
      { p: 'korinek', text: 'Mały producent znad Podyjí, ręczny zbiór.', wines: ['korinek-vz-2023', 'korinek-petnat-2025', 'korinek-muskat-2026'] },
      { p: 'simenon', text: 'Rodzinny producent. Trzy wytrawne VOC w jednej cenie do porównania odmian.', wines: ['simenon-vz-2025', 'simenon-rr-2025', 'simenon-sb-2025'] },
      { p: 'ampelos', text: 'Najciekawszy adres, żeby spróbować lokalnie wyhodowanej odmiany.', wines: ['ampelos-veritas-2024', 'ampelos-trio-2024', 'ampelos-at-2024'] },
      { p: 'dobravinice', text: 'Najwięcej różnic w teksturze: bąbelki, beczka i długi kontakt ze skórkami.', wines: ['dobra-creme-2022', 'dobra-kambrium-2022', 'dobra-qvevri-2019'] }
    ],
    // wina wspomniane w ściądze odmian (pokazywane jako miniatury pod tekstem)
    grapeWines: {
      'Veltlínské červené rané = Frühroter Veltliner': ['lahofer-vcr-2024', 'lahofer-vz-2025'],
      'Rotgipfler, Neuburger i klony': ['hanzel-rotgipfler-2025', 'znovin-neuburske-2025', 'ampelos-at-2024'],
      'Krzyżówka, klon i kupaż': ['ampelos-veritas-2024', 'ampelos-trio-2024', 'lahofer-rajska-2025']
    },
    flavors: [
      { id: 'kwiatowe', label: 'Kwiatowe', color: '#c0577a' },
      { id: 'owocowe', label: 'Owocowe', color: '#d9822b' },
      { id: 'mineralne', label: 'Mineralne', color: '#6b7f8e' },
      { id: 'korzenne', label: 'Korzenne', color: '#8a6d3b' },
      { id: 'beczka', label: 'Z beczki', color: '#9a6a40' },
      { id: 'czerwone', label: 'Czerwone', color: '#7a1020' },
      { id: 'babelki', label: 'Z bąbelkami', color: '#4f8f8a' },
      { id: 'slodsze', label: 'Najsłodsze z wytrawnych', short: 'Słodsze', color: '#b45309' }
    ]
  };
})();
