/*
 * Husa · Znojmo 2026 — wszystkie treści strony.
 * Źródła: docs/*.md, docs/*.pdf oraz informacje organizacyjne od autora.
 * Tekst może zawierać proste znaczniki HTML (<strong>, <em>).
 *
 * Statusy punktów planu:
 *   confirmed  – potwierdzone
 *   tbc        – do potwierdzenia (np. stolik)
 *   optional   – opcjonalnie
 *   alt        – wariant
 *   rain       – na deszcz
 */
(function () {
  'use strict';

  var map = function (label, url) { return { label: label, url: url, kind: 'map' }; };
  var web = function (label, url) { return { label: label, url: url, kind: 'web' }; };
  var pdf = function (label, url) { return { label: label, url: url, kind: 'pdf' }; };

  var M = {
    marienhof: 'https://www.google.com/maps/search/?api=1&query=Apartm%C3%A1ny+Marienhof%2C+Studentsk%C3%A1+948%2F9%2C+Znojmo',
    parking: 'https://www.google.com/maps/search/?api=1&query=48.855118%2C16.05358',
    maxwilliam: 'https://www.google.com/maps/search/?api=1&query=Hosp%C5%AFdka+MaxWilliam+Znojmo&query_place_id=ChIJdQ3ltwdVbUcRqcUMTIfqpkI',
    mikulas: 'https://www.google.com/maps/search/?api=1&query=Mikul%C3%A1%C5%A1+Bistro+Znojmo&query_place_id=ChIJhfVC6iVVbUcR8lB9QN8bQ60',
    bufet: 'https://www.google.com/maps/search/?api=1&query=Bufet+Masarykovo+n%C3%A1m%C4%9Bst%C3%AD+16+Znojmo&query_place_id=ChIJSeq4mNhVbUcRz0uxAy6e4Tg',
    karel: 'https://www.google.com/maps/search/?api=1&query=Restaurace+U+Karla+Mikul%C3%A1%C5%A1sk%C3%A9+n%C3%A1m%C4%9Bst%C3%AD+Znojmo&query_place_id=ChIJNxYFeAhVbUcR1T25i68zmOo',
    konev: 'https://www.google.com/maps/search/?api=1&query=U+Zlat%C3%A9+Konve+Znojmo&query_place_id=ChIJYTKeBwdVbUcR-baeVKur5K0',
    divadlo: 'https://www.google.com/maps/search/?api=1&query=Restaurace+U+Divadla+Znojmo&query_place_id=ChIJB_Fc50VVbUcRrdm2GBCjD3Q',
    jasanu: 'https://www.google.com/maps/search/?api=1&query=Penzion+U+T%C5%99%C3%AD+Jasan%C5%AF+Nov%C3%BD+%C5%A0aldorf&query_place_id=ChIJQSKRvjZUbUcRZ722doBEdSs',
    pichler: 'https://www.google.com/maps/search/?api=1&query=Gasthaus+zum+Thayatal+Waschbach&query_place_id=ChIJWyx9f9CuckcRFOxkdFtf7rs',
    jezuitska: 'https://www.google.com/maps/search/?api=1&query=Vinot%C3%A9ka%20Jezuitsk%C3%A1%20Jezuitsk%C3%A1%20176%2F10%20Znojmo',
    csob: 'https://www.google.com/maps/search/?api=1&query=%C4%8CSOB%20Masarykovo%20n%C3%A1m%C4%9Bst%C3%AD%20324%2F1%20Znojmo',
    satovKostel: 'https://www.google.com/maps/search/?api=1&query=Kostel%20sv.%20Martina%20%C5%A0atov%2012%20%C5%A0atov',
    satovKD: 'https://www.google.com/maps/search/?api=1&query=48.7931741%2C16.0099240'
  };

  var W = {
    beseda: 'https://znojemskabeseda.com/svatomartinske_2026/',
    podzemi: 'https://znojemskabeseda.com/znojemske_podzemi/',
    vyhlidky: 'https://znojmoregion.cz/cs/vyhlidky-ve-znojme',
    bus818: 'https://vyhledavanispojeni.idsjmk.cz/timetables/links-routes',
    enoteka: 'https://www.vinotrh.cz/enoteka/',
    enotekaKarta: 'https://enoteka.vinotrh.cz/',
    regional: 'https://www.narodnisoutezvin.cz/media/459/download/Dle_zeme_prihlasovatele_bodu.pdf?v=1',
    salon: 'https://www.vinarskecentrum.cz/storage/files/Katalog-Salon-vin-2026-web.pdf',
    nvcBile: 'https://www.vinarskecentrum.cz/o-vine/bile-odrudy',
    vocProfile: 'https://www.vocznojmo.cz/cs/aktualita/voc-znojmo-ma-zatrideno-397/',
    gruner: 'https://www.bmluk.gv.at/themen/lebensmittel/trad-lebensmittel/getraenke/gruener_veltliner.html',
    znovinShop: 'https://www.znovin.cz/vydejni-mista/znojmo-prodejna-vin-loucky-klaster',
    vinovin: 'https://www.vinovin.cz/kontakty/'
  };

  window.TRIP = {
    meta: {
      title: 'Husa · Znojmo 2026',
      subtitle: 'Święty Marcin · Znojmo, Hardegg, Šatov i Nový Šaldorf',
      dates: '11–15 listopada 2026',
      route: 'Wrocław → Znojmo',
      start: '2026-11-11',
      end: '2026-11-15',
      timeZone: 'Europe/Prague',
      checked: 'Godziny, ceny i oceny według sprawdzenia z 7–8 XI 2026. Przed wyjściem warto zerknąć w link źródłowy.'
    },

    quick: [
      { label: 'Nocleg', sub: 'Marienhof', url: M.marienhof, icon: 'bed' },
      { label: 'Parking', sub: 'za szlabanem', url: M.parking, icon: 'parking' }
    ],

    /* ------------------------------------------------------------------ */
    info: {
      title: 'Nocleg i dojazd',
      cards: [
        {
          icon: 'bed',
          title: 'Apartmány Marienhof',
          text: 'Studentská 948/9, Znojmo.',
          facts: [
            ['Zameldowanie', 'śr. 11 XI, po przyjeździe'],
            ['Wymeldowanie', '<strong>nd. 15 XI do 10:00</strong>']
          ],
          links: [map('Nocleg w Mapach', M.marienhof)]
        },
        {
          icon: 'parking',
          title: 'Parking',
          text: 'Parking jest płatny i nie stoi przy samych apartamentach, tylko kawałek dalej. Wjeżdża się przez szlaban, a na ścianie przy parkingu wisi tabliczka <strong>Marienhof</strong>.',
          images: [
            { src: 'img/parking.webp', w: 960, h: 720, alt: 'Szlaban przy wjeździe na parking, na ścianie budynku tabliczka Marienhof', caption: 'Wjazd na parking: szlaban i tabliczka Marienhof na ścianie.' },
            { src: 'img/parking-mapa.webp', w: 580, h: 658, alt: 'Mapka dojazdu: ze Studentskiej przez rondo na Mariánském náměstí w Čermákovą i w lewo na parking', caption: 'Dojazd od apartamentów: ze Studentskiej przez rondo w Čermákovą, potem w lewo na parking.' }
          ],
          links: [map('Parking w Mapach', M.parking)]
        },
        {
          icon: 'car',
          title: 'Trasa i opłaty drogowe',
          facts: [
            ['Dojazd', 'z Wrocławia ok. 4,5 godziny'],
            ['Winiety', 'najprawdopodobniej potrzebne']
          ],
          links: [web('Oficjalny sklep z winietami (edalnice.cz)', 'https://edalnice.cz/pl/')]
        },
        {
          icon: 'coffee',
          title: 'Śniadanie',
          text: 'W budynku nie ma restauracji, więc każdy organizuje śniadanie sam. Można zamówić koszyk śniadaniowy albo zjeść na mieście. Podobno apartamenty dają też bon ze zniżką do pobliskiej śniadaniowni, ale tego nikt nie potwierdzał.',
          tag: 'Każdy we własnym zakresie'
        },
        {
          icon: 'towel',
          title: 'Ręczniki',
          text: 'Michał musi zabrać własne 😉'
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    days: [
      {
        id: 'sr', date: '2026-11-11', short: 'Śr', num: '11', name: 'Środa 11 XI', theme: 'Przyjazd',
        title: 'Przyjazd i obiadokolacja w Znojmie',
        lead: 'Dojazd z Wrocławia, zakwaterowanie, krótki spacer i wspólna obiadokolacja.',
        items: [
          {
            time: 'Po południu', title: 'Zakwaterowanie · Apartmány Marienhof',
            text: 'Studentská 948/9. Parking jest kawałek dalej, za szlabanem z tabliczką Marienhof.',
            links: [map('Mapy', M.marienhof), map('Parking', M.parking)],
            infoLink: 'Zdjęcie szlabanu i mapka dojazdu'
          },
          {
            time: 'Po przyjeździe', title: 'Spacer po starówce lub przez Karolíniny sady',
            text: 'Krótki spacer po starówce albo przez Karolíniny sady przy Rajskiej vinice, jeśli wystarczy światła. Przy deszczu albo późnym przyjeździe od razu do gospody.',
            links: [web('Punkty widokowe Znojma', W.vyhlidky)]
          },
          {
            time: 'Około 18:00', at: '18:00', status: 'tbc', highlight: true,
            title: 'Hospůdka MaxWilliam', venue: 'maxwilliam',
            place: 'U Brány 435/1, Znojmo',
            text: 'Pierwszy wybór na obiadokolację dla 4 dorosłych i dziecka. Golonka i żeberka. <strong>Stół do uzgodnienia.</strong>',
            contacts: { tel: ['+420 603 892 962'], email: ['info@maxwilliam.cz'] },
            links: [map('Mapy', M.maxwilliam), web('Kontakt lokalu', 'https://maxwilliam.cz/kontakt/')],
            alt: {
              label: 'W rezerwie',
              title: 'Mikuláš Bistro', venue: 'mikulas',
              place: 'Staré Město 109/1, Znojmo',
              text: 'Na 11 XI gęsie udko z kapustą i knedlikami za 650 Kč lub menu za 990 Kč. O stół i gęsinę zapytajcie co najmniej dzień wcześniej. Lokal nie łączy stolików.',
              contacts: { tel: ['+420 773 722 884'] },
              links: [map('Mapy', M.mikulas), pdf('Menu', 'https://www.mikulasznojmo.cz/wp-content/uploads/2026/10/mikulas-menu-husa-2026.pdf')]
            }
          }
        ],
        also: {
          title: 'Też dziś',
          text: '11 XI to premiera wina Svatomartinské. Enotéka w Znojmie jest czynna w środę do 21:00. Po południu lokalni winiarze nalewają młode wina na rynku w Jaroslavicach. Kalendarze podają 16:00 i 16:30, a organizator prosi o własny kieliszek.',
          links: [web('Enotéka: godziny', W.enoteka), web('Jaroslavice: organizator', 'https://jaroslavictivinari.cz/nase-akce/')]
        }
      },

      {
        id: 'czw', date: '2026-11-12', short: 'Czw', num: '12', name: 'Czwartek 12 XI', theme: 'Hardegg i Jezuitská',
        title: 'Hardegg, obiad i Jezuitská',
        lead: 'Rano dolina Dyji po austriackiej stronie, obiad w austriackiej gospodzie, po południu degustacja w Znojmie.',
        items: [
          {
            time: 'Przed południem', at: '09:30', tag: 'Przy dobrej pogodzie',
            title: 'Hardegg po austriackiej stronie Dyji',
            text: 'Spacer nad rzeką i przez most pieszo-rowerowy. Dojazd autem od strony Austrii.',
            route: 'cizov-hardegg',
            links: [web('Park Thayatal · most i dojazd', 'https://www.np-thayatal.at/de/pages/kontakt--anreise-49.aspx')],
            alt: {
              label: 'Na deszcz', status: 'rain',
              title: 'Znojemské podzemí',
              place: 'Slepičí trh 2, Znojmo',
              text: 'Trasa klasyczna, około godziny pod ziemią. Wybierzcie godzinę wejścia.',
              links: [web('Informacje o podziemiach', W.podzemi)]
            }
          },
          {
            time: 'Około 12:00', at: '12:00', status: 'tbc',
            title: 'Gasthaus zum Thayatal (Pichler)',
            place: 'Waschbach 35, Austria',
            text: 'Austriacka gospoda na trasie wycieczki. W czwartek 8:00–24:00, ciepła kuchnia przez cały dzień. <strong>Stół do uzgodnienia.</strong>',
            contacts: { tel: ['+43 2948 85123'], email: ['lenka.pichler@aon.at'] },
            links: [map('Mapy', M.pichler), web('Kuchnia i godziny', 'https://www.np-thayatal.at/de/pages/gasthaus-zum-thayatal-pichler-182.aspx')]
          },
          {
            time: 'Po drodze', status: 'optional',
            title: 'Vinothek Weinquartier w Retz', venue: 'weinquartier',
            place: 'Hauptplatz 4–5, Retz',
            text: 'Czynna w czwartek 10:00–18:00. Poproście o wytrawnego Grüner Veltlinera. Grupy od 10 osób zgłaszają się wcześniej.',
            contacts: { email: ['office@weinquartier.at'] },
            links: [web('Winoteka i degustacje', 'https://weinquartier.at/vinothek/')]
          },
          {
            time: 'Jeśli obiad w Znojmie', status: 'alt',
            title: 'Bufet na rynku lub U Zlaté Konve',
            text: 'Bufet przy Masarykovo náměstí 16 do 15:00, U Zlaté Konve do 16:00.',
            links: [map('Bufet', M.bufet), map('U Zlaté Konve', M.konev)]
          },
          {
            time: '16:00', at: '16:00', status: 'confirmed', highlight: true,
            title: 'Vinárna Jezuitská', venue: 'jezuitska',
            place: 'Jezuitská 176/10, Znojmo',
            text: '<strong>Degustacja wina od 16:00.</strong> W trakcie mogą pojawić się drobne przekąski. Do wina można też zamówić np. zapiekany hermelín, sery albo pastę ze skwarków. O młode wina rocznika 2026 zapytajcie obsługę.',
            note: 'Lokal działa w czwartek 16:00–23:00 i ma ponad 40 win na kieliszki.',
            contacts: { tel: ['+420 739 080 154'], email: ['jezuitska@vinshop.cz'] },
            links: [map('Mapy', M.jezuitska), web('Godziny i przekąski', 'https://www.vinoteka-jezuitska.cz/vinoteka-vinarna.html')]
          }
        ]
      },

      {
        id: 'pt', date: '2026-11-13', short: 'Pt', num: '13', name: 'Piątek 13 XI', theme: 'Święty Marcin',
        title: 'Święty Marcin na rynku w Znojmie',
        lead: 'Poświęcenie młodych win na rynku, stoiska winiarzy, pochód św. Marcina i wieczór w Enotéce.',
        items: [
          {
            time: 'Rano', at: '08:30', status: 'alt', tag: 'Przy dobrej pogodzie',
            title: 'Hardegger Warte i Čížov',
            text: 'Park opisuje pętlę od mostu do punktu widokowego (ok. 6 km, 2 godz. marszu) i osobne odbicie do Čížova. Doliczcie czas na odbicie i przerwy.',
            links: [web('Park Thayatal · szlak', 'https://www.np-thayatal.at/cz/pages/hardegger-warte---hardeggskss-vyhlidka-299.aspx')]
          },
          {
            time: 'Od 11:00', at: '11:00', highlight: true,
            title: 'Obchody na Masarykovo náměstí',
            text: 'Start o 11:00: poświęcenie młodych win i muzyka cymbałowa. Od 15:00 gra CM Dyjavan. Wina próbuje się przy stoiskach (13 winiarzy na liście organizatora), jedzenie zapewnia Catering Ducka. Wstęp wolny. Po stoiskach przejdźcie przez starówkę w stronę zamku i rotundy św. Katarzyny.',
            links: [web('Program obchodów', W.beseda)]
          },
          {
            time: 'Przed pochodem',
            title: 'Spacer: Karolíniny sady i dolina Gránice',
            text: 'Spacer przez Karolíniny sady i, przy suchej pogodzie, krótki odcinek doliny Gránice. Przy deszczu skróćcie spacer i zjedzcie wcześniej.',
            links: [web('Karolíniny sady', W.vyhlidky)],
            alt: {
              label: 'Jeśli jest więcej czasu',
              title: 'Punkt widokowy Králův stolec',
              text: 'Dłuższy spacer ze Studentskiej nad zbiornik na Dyi, 5,5 km w jedną stronę. Według legendy stąd Jan III Sobieski obserwował przeprawę wojsk w 1683 roku.',
              route: 'kraluv-stolec'
            }
          },
          {
            time: 'Obiad', at: '13:00',
            title: 'Szybki obiad przy rynku', venue: 'bufet',
            text: 'Bufet Masarykovo náměstí 16, czynny do 15:00. Na późniejszy posiłek lub kolację sprawdźcie U Divadla.',
            links: [map('Bufet', M.bufet), map('U Divadla', M.divadlo)]
          },
          {
            time: '16:00 lub 17:00', at: '16:00', highlight: true,
            title: 'Pochód św. Marcina',
            place: 'Start: przed ČSOB, Masarykovo náměstí 324/1',
            text: 'Dwa wyjścia sprzed oddziału banku, od strony rynku. Pochód idzie przez stare miasto, z inscenizacją legendy o św. Marcinie. Organizator nie publikuje listy ulic. Po dłuższym spacerze celujcie w 17:00.',
            links: [map('Start pochodu', M.csob), web('Program', W.beseda)]
          },
          {
            time: 'Wieczorem', at: '19:00',
            title: 'Enotéka znojemských vín', venue: 'enoteka',
            place: 'Hradní 2, teren browaru',
            text: 'W piątek czynna do 24:00. Instrukcja i kolejność próbek są w zakładce <strong>Wino</strong>. Dla chętnych dyskoteka.',
            links: [web('Godziny i zasady', W.enoteka)]
          },
          {
            time: 'Kolacja', status: 'optional',
            title: 'Restaurace U Divadla', venue: 'divadlo',
            place: 'Náměstí Republiky 878/16',
            text: 'Konfitowana gęś z kapustą i knedlikami za 399 Kč, pełne menu z gęsią za 599 Kč. Warto zarezerwować.',
            contacts: { email: ['recepce@udivadlahotel.cz'] },
            links: [map('Mapy', M.divadlo), web('Menu', 'https://www.restaurantznojmo.cz/akce/svatomartinske-menu-v-hotelu-u-divadla-znojmo-2026')]
          },
          {
            time: 'Wieczorem', status: 'alt',
            title: 'Košt w Jezuitskiej', venue: 'jezuitska',
            text: 'Osobny wieczór świętomarciński za 800 Kč/os.: ponad 20 próbek młodych win i długo pieczona gęś bez kości z chlebem. Godzinę, miejsca i warunki dla dzieci potwierdźcie w lokalu.',
            contacts: { tel: ['+420 739 080 154'] },
            links: [web('Program koštu', 'https://www.vinoteka-jezuitska.cz/degustace-akce.html')]
          }
        ]
      },

      {
        id: 'sob', date: '2026-11-14', short: 'Sob', num: '14', name: 'Sobota 14 XI', theme: 'Šatov i Šaldorf',
        title: 'Młode wina i obiad w Novým Šaldorfie',
        lead: 'Do wyboru Šatov (pochód i degustacja pod dachem) albo otwarte piwnice w Novým Šaldorfie. O 16:30 wspólny obiad.',
        items: [
          {
            time: 'Rano', at: '09:30', status: 'alt', tag: 'Wariant Šatov · pieszo',
            title: 'Marsz przez winnice do Šatova',
            text: 'Przy dobrej pogodzie przez Kraví horę, Konice, Popice i Havraníky. Pełna trasa z centrum ma ponad 5–6 km, krótsza zaczyna się w Popicach. Celujcie w dotarcie przed 13:00. Przy deszczu dojazd autobusem 818.',
            links: [web('Autobus 818', W.bus818)]
          },
          {
            time: '13:00', at: '13:00', status: 'alt', tag: 'Wariant A',
            title: 'Šatov · Festival mladých vín',
            text: '<strong>13:00</strong> poświęcenie wina w kościele św. Marcina (Šatov 12), potem pochód za św. Marcinem na białym koniu do domu kultury. <strong>14:00</strong> degustacja w Kulturním domě. <strong>15:00</strong> kapela cymbałowa Počůvaj, <strong>20:00</strong> zabawa z zespołem Teraboys. W programie dania z gęsi.',
            note: 'Bilety 200 Kč, na miejscu w dniu imprezy. Kieliszek własny albo za 100 Kč. Cena dla dzieci do sprawdzenia u organizatora. Zostawcie czas na przejazd do Nového Šaldorfa przed obiadem.',
            contacts: { tel: ['+420 777 591 159'], email: ['info@vinarisatov.cz'] },
            links: [map('Kościół', M.satovKostel), map('Dom kultury', M.satovKD), web('Program i bilety', 'https://www.kudyznudy.cz/akce/festival-mladych-vin-satov'), web('ZnojmoRegion', 'https://znojmoregion.cz/cs/akce/3482')]
          },
          {
            time: '14:00', at: '14:00', status: 'alt', tag: 'Wariant B',
            title: 'Nový Šaldorf · Svatý Martin v Šaldorfských sklepech',
            place: 'Areál Modrých sklepů, Nový Šaldorf-Sedlešovice',
            text: '<strong>14:00</strong> poświęcenie młodych win przy zabytkowej prasie, <strong>15:00–19:00</strong> degustacje w otwartych piwnicach. Najpierw kierujcie się do prasy wśród piwnic.',
            note: 'Wstęp wolny. Kieliszek 100 Kč: od 14:00 przy prasie albo od 15:00 w piwnicach. Organizator zapowiada kartę z mapą otwartych piwnic.',
            route: 'saldorf',
            links: [map('Dojście od przystanku', 'https://mapy.com/pl/zakladni?source=pubt&id=15713357&x=16.0494804&y=48.8278345&z=17'), web('Mapa piwnic', 'https://saldorfske-sklepy.cz/mapa-sklepu'), web('Program', 'https://saldorfske-sklepy.cz/nase-akce/svaty-martin-v-saldorfskych-sklepech')]
          },
          {
            time: '16:30', at: '16:30', status: 'tbc', highlight: true,
            title: 'Restaurace & Penzion U Tří Jasanů', venue: 'jasanu',
            place: 'Vinařská 56/S, Nový Šaldorf',
            text: 'Obiad dla 9 dorosłych i 2 siedmiolatków. Sala ma 50 miejsc i osobny salonik. <strong>Wspólny stół i gęsina do potwierdzenia.</strong>',
            contacts: { tel: ['+420 777 808 385'], email: ['penzionutrijasanu@seznam.cz'] },
            links: [map('Mapy', M.jasanu), web('Kontakt i godziny', 'http://penzion-u-tri-jasanu.cz/')]
          },
          {
            time: 'Wieczorem', at: '19:00',
            title: 'Powrót do Znojma',
            text: 'Kurs autobusu 818 do ustalenia. Potem winoteka i opcjonalna dyskoteka.',
            links: [web('Autobus 818', W.bus818)]
          }
        ],
        also: {
          title: 'Który wariant?',
          text: 'Z dziećmi wygodniej w Šatovie, bo łączy pochód z degustacją pod dachem. Jeśli wolicie chodzić po piwnicach, wybierzcie Nový Šaldorf. Oba programy nakładają się w czasie. Na powrót po degustacji zaplanujcie transport albo kierowcę, który nie pije.'
        }
      },

      {
        id: 'nd', date: '2026-11-15', short: 'Nd', num: '15', name: 'Niedziela 15 XI', theme: 'Powrót',
        title: 'Wymeldowanie i powrót',
        lead: 'Spokojne pakowanie i droga do Wrocławia.',
        items: [
          {
            time: 'Do 10:00', at: '10:00', status: 'confirmed', highlight: true,
            title: 'Wymeldowanie z Apartmány Marienhof',
            text: 'Pokoje trzeba zwolnić do 10:00.'
          },
          {
            time: 'Po drodze', status: 'optional',
            title: 'Wino na drogę',
            text: 'Sklep Znovínu przy klasztorze Louka albo Vínovín przy Pražskiej. Lista butelek jest w zakładce <strong>Wino</strong>.',
            links: [web('Sklep Znovínu', W.znovinShop), web('Vínovín: adres i godziny', W.vinovin)]
          },
          {
            time: 'Powrót',
            title: 'Droga do Wrocławia',
            text: 'Około 4,5 godziny jazdy.'
          }
        ]
      }
    ],

    /* ------------------------------------------------------------------ */
    restaurants: {
      intro: 'Centrum Znojma jest w zasięgu spaceru. Oceny Google sprawdzone 8 XI 2026.',
      groups: [
        {
          title: 'Główne rekomendacje w centrum',
          items: [
            {
              name: 'Hospůdka MaxWilliam', venue: 'maxwilliam', rating: '4,7', reviews: '1 022', when: 'Środa · pierwszy wybór',
              address: 'U Brány 435/1, Znojmo',
              text: 'Najwyższa ocena wśród sprawdzonych gospód z pasującym menu. Specjalności to pieczona golonka i marynowane żeberka.',
              hours: 'Śr.–czw. 13:00–23:00, pt. 13:00–24:00',
              contacts: { tel: ['+420 603 892 962'], email: ['info@maxwilliam.cz'] },
              links: [map('Mapy', M.maxwilliam), web('Specjalności', 'https://maxwilliam.cz/'), web('Godziny i rezerwacje', 'https://maxwilliam.cz/kontakt/')]
            },
            {
              name: 'Mikuláš Bistro', venue: 'mikulas', rating: '4,6', reviews: '840', when: 'Środa · rezerwa',
              address: 'Staré Město 109/1, Znojmo',
              text: 'Regionalne bistro w nowoczesnym wydaniu. Na 11, 13 i 14 XI gęsie udko z kapustą i knedlikami za 650 Kč, czterodaniowe menu 990 Kč. Rezerwacja co najmniej dzień wcześniej. Lokal nie łączy stolików.',
              contacts: { tel: ['+420 773 722 884'], email: ['info@mikulasznojmo.cz'] },
              links: [map('Mapy', M.mikulas), web('Zasady rezerwacji', 'https://www.mikulasznojmo.cz/'), pdf('Menu świętomarcińskie', 'https://www.mikulasznojmo.cz/wp-content/uploads/2026/10/mikulas-menu-husa-2026.pdf')]
            },
            {
              name: 'Restaurace U Divadla', venue: 'divadlo', rating: '4,5', reviews: '136', when: 'Piątek · gęsina',
              address: 'Náměstí Republiky 878/16, Znojmo',
              text: 'Tradycyjna gęś lub kaczka z kapustą i knedlikami. Menu specjalne 5–15 XI: gęś 399 Kč, pełne menu z gęsią 599 Kč. Lokal zaleca wcześniejszą rezerwację.',
              hours: '7:00–24:00',
              contacts: { email: ['recepce@udivadlahotel.cz'] },
              links: [map('Mapy', M.divadlo), web('Menu i rezerwacja', 'https://www.restaurantznojmo.cz/akce/svatomartinske-menu-v-hotelu-u-divadla-znojmo-2026'), web('Godziny', 'https://www.udivadlahotel.cz/restaurace')]
            }
          ]
        },
        {
          title: 'Na obiad w ciągu dnia',
          compact: true,
          items: [
            {
              name: 'Bufet Masarykovo náměstí 16', venue: 'bufet', rating: '4,7', reviews: '60',
              address: 'Masarykovo náměstí 16',
              text: 'Prosty bufet, bywają czeskie dania dnia, np. segedyn z knedlikiem.',
              hours: 'Pon.–pt. 8:00–15:00',
              contacts: { tel: ['+420 603 370 992'] },
              links: [map('Mapy', M.bufet), web('Godziny', 'https://www.firmy.cz/detail/12756461-bufet-masarykovo-namesti-16-znojmo.html')]
            },
            {
              name: 'Restaurace U Karla', venue: 'karel', rating: '4,5', reviews: '587',
              address: 'Mikulášské náměstí 48/6',
              text: 'Czeski lokal obiadowy. Menu dnia do sprawdzenia telefonicznie.',
              hours: '11–14 XI 10:30–15:00',
              contacts: { tel: ['+420 515 222 560'] },
              links: [map('Mapy', M.karel), web('Godziny', 'https://www.firmy.cz/detail/336380-restaurace-u-karla-znojmo.html')]
            },
            {
              name: 'U Zlaté Konve', venue: 'konev', rating: '4,0', reviews: '664',
              address: 'Masarykovo náměstí 331/9',
              text: 'Zapas na obiad: svíčková i znojemska pieczeń.',
              hours: 'Śr.–nd. 9:00–16:00',
              contacts: { tel: ['+420 608 832 830'] },
              links: [map('Mapy', M.konev), web('Menu i godziny', 'https://uzlatekonve.cz/')]
            }
          ]
        },
        {
          title: 'Sobota · Nový Šaldorf',
          items: [
            {
              name: 'Restaurace & Penzion U Tří Jasanů', venue: 'jasanu', rating: '4,3', reviews: '1 131', when: 'Sobota 16:30 · wspólny obiad',
              address: 'Vinařská 56/S, Nový Šaldorf',
              text: 'Plan dla 9 dorosłych i 2 siedmiolatków. Sala ma 50 miejsc i osobny salonik. Wspólny stół w środku i gęsina do potwierdzenia. Ocena Google to wspólna wizytówka pensjonatu i restauracji.',
              contacts: { tel: ['+420 777 808 385'], email: ['penzionutrijasanu@seznam.cz'] },
              links: [map('Mapy', M.jasanu), web('Kontakt i godziny', 'http://penzion-u-tri-jasanu.cz/'), web('Pojemność sali', 'https://www.firmy.cz/detail/13141043-restaurace-u-tri-jasanu-novy-saldorf-sedlesovice-novy-saldorf.html')]
            }
          ]
        },
        {
          title: 'Czwartek · Austria',
          items: [
            {
              name: 'Gasthaus zum Thayatal (Pichler)', when: 'Czwartek ok. 12:00',
              address: 'Waschbach 35, Austria',
              text: 'Austriacka gospoda na trasie wycieczki do Hardeggu. Ciepła kuchnia przez cały dzień.',
              hours: 'Czw. 8:00–24:00',
              contacts: { tel: ['+43 2948 85123'], email: ['lenka.pichler@aon.at'] },
              links: [map('Mapy', M.pichler), web('Kuchnia i godziny', 'https://www.np-thayatal.at/de/pages/gasthaus-zum-thayatal-pichler-182.aspx')]
            }
          ]
        }
      ]
    },

    /* ------------------------------------------------------------------ */
    wine: {
      stats: 'Top 10 ze Znojemska, spod Mikulova i z Valtic · 17 winiarni · ponad 40 butelek',
      enoteka: {
        title: 'Enotéka krok po kroku', venue: 'enoteka',
        place: 'Hradní 2, teren browaru w centrum Znojma',
        hours: 'Środa 10:00–21:00 · piątek 10:00–24:00',
        how: 'Przy wejściu kup i doładuj kartę, podejdź do dyspensera i wybierz jeden z trzech rozmiarów porcji. Karta obejmuje 70 pozycji stałych, 30 tematycznych i 20 bieżących. Do porównywania bierz najmniejszy nalew. W karcie <strong>s sebou</strong> oznacza butelkę na wynos, a <strong>otevřít</strong> cenę otwarcia całej butelki na miejscu. Numery przy winach mogą się zmieniać, więc szukaj też po nazwie i roczniku.',
        total: 'Sześć małych nalewów to razem orientacyjnie <strong>95 Kč</strong> według karty.',
        links: [web('Godziny, dojazd i zasady', W.enoteka), web('Karta Enotéki', W.enotekaKarta), web('Sklep Znovínu', W.znovinShop), web('Vínovín', W.vinovin)]
      },
      festival: [
        {
          title: 'Środa 11 i piątek 13 listopada',
          text: '<strong>11.11:</strong> w dzień Enotéka w Znojmie, po południu młode wina lokalnych producentów na rynku w Jaroslavicach (własny kieliszek, kalendarze podają 16:00 i 16:30). <strong>13.11:</strong> Masarykovo náměstí, 11:00 poświęcenie wina, wstęp wolny, pochody o 16:00 i 17:00.',
          links: [web('Znojmo: program', W.beseda), web('Jaroslavice: organizator', 'https://jaroslavictivinari.cz/nase-akce/'), web('Jaroslavice: godziny', 'https://www.daniz.cz/o-svazku/kalendar-akci/svatomartinske-oslavy-1076_36cs903.html')]
        },
        {
          title: 'Młode wina 2026: o co pytać',
          text: 'Víno Náprava zapowiada wytrawne Rulandské bílé, półwytrawne Sylvánské zelené, półsłodkie Rulandské šedé i swój pierwszy sekt. W ofertach wystawców: <strong>Znovín První letošní Sauvignon</strong> (wytrawne), <strong>LAHOFER ’26</strong> (półwytrawne białe z Müllera i muszkatu), <strong>Hanzel Martin Růžový</strong> (półwytrawne rosé z Modrého Portugalu), <strong>Piálek & Jäger Rizvanec</strong> (półwytrawny Müller). O nalew tych czterech zapytaj na stoisku.',
          links: [web('Víno Náprava', 'https://www.vinonaprava.cz/'), web('Vinotrh: młode wina 2026', 'https://www.vinotrh.cz/prvni-vina-noveho-rocniku-2/')]
        },
        {
          title: 'Co oznacza św. Marcin na etykiecie',
          text: '<strong>Svatomartinské</strong> to odrębna marka. Do białych dopuszcza Müller Thurgau, Muškát moravský i Frühroter Veltliner, do czerwonych Modrý Portugal i Saint Laurent, a w rosé i klaretach dochodzi Zweigeltrebe. Do gęsiny z kwaśną kapustą spróbuj młodego czerwonego <strong>Svatovavřinecké</strong> (Saint Laurent) albo świeżego wytrawnego veltlína. Porównaj łyk przed kęsem i po kęsie.',
          links: [web('Vinařský fond: zasady znaku', 'https://vinarskyfond.cz/svatomartinske/'), web('Komunikat o roczniku 2026', 'https://vinarskyfond.cz/2026/11/04/tiskova-zprava-svatomartinske-2026/')]
        }
      ],

      tasting: {
        title: 'Co ocenić przed zakupem',
        text: 'Powąchaj, zakręć kieliszkiem i spróbuj małego łyku. Daj zimnemu winu chwilę. Wybieraj próbki z wyraźnym owocem i przyjemnym finiszem. Jeżeli po łyku zostaje głównie pieczenie, gorycz lub lepka słodycz, odpuść zakup. Mokry karton i stłumiony owoc sugerują wadę korkową, a ocet i zmywacz problem z lotną kwasowością. Zapach obitego jabłka wraz z przygaszeniem owocu może wskazywać na utlenienie młodego białego. Przy podejrzeniu wady poproś o próbkę ze świeżej butelki. Przed zapłatą porównaj rocznik i partię z etykietą degustowanego wina.',
        links: [web('WSET: technika degustacji', 'https://www.wsetglobal.com/news-insights/insight-opinion/how-to-taste-wine/'), web('AWRI: wady wina', 'https://www.awri.com.au/industry_support/winemaking_resources/sensory_assessment/recognition-of-wine-faults-and-taints/wine_faults/')]
      },

      grapes: [
        {
          title: 'Veltlínské zelené = Grüner Veltliner',
          text: 'Stara odmiana z naturalnej krzyżówki <strong>Traminer/Savagnin × St. Georgener-Rebe</strong>. Drugiego rodzica długo nie znano. Stary, porzucony krzew odnaleziono w Burgenlandzie, koło St. Georgen. W kieliszku wypatruj białego pieprzu, jabłka, gruszki i czasem migdału. Lekki styl ma bliskie porównanie po drugiej stronie granicy, w Weinviertel.',
          links: [web('Pochodzenie Grünera', W.gruner), web('Weinviertel DAC', 'https://www.weinvierteldac.at/en/weinviertel-dac/origin-of-gruener-veltliner/')]
        },
        {
          title: 'Veltlínské červené rané = Frühroter Veltliner',
          text: 'Po czesku także <strong>Večerka</strong>. To <strong>Roter Veltliner × Silvaner</strong>. Różowoczerwona skórka daje tu białe wino. Profil zwykle łagodniejszy, z migdałem, owocami sadu i czasem nutą chleba. Dobry test: <strong>Lahofer Volné pole</strong> w wersji Frühroter 2024 i Grüner VOC 2025.',
          links: [web('NVC: odmiany białe', W.nvcBile), web('Lahofer Frühroter', 'https://www.vinotrh.cz/veltlinske-cervene-rane-volne-pole-2024-kab-/')]
        },
        {
          title: 'Rotgipfler, Neuburger i klony',
          text: '<strong>Rotgipfler</strong> to Traminer × Roter Veltliner, więc z Grünerem dzieli jednego rodzica. Spróbuj <strong>Hanzel Rotgipfler Volné pole 2025</strong>, wytrawnego, z mirabelką i akacją (205 Kč na wynos według karty Enotéki). <strong>Neuburské</strong> to odrębna odmiana z rodziny Roter Veltliner: Znovín <strong>Neuburské z Pekla 2025</strong> ze Šatova daje migdał i miód. <strong>AT klony</strong> Ampelos to selekcje w obrębie odmiany Grüner Veltliner.',
          links: [web('Hanzel Rotgipfler', 'https://www.vinotrh.cz/rotgipfler-volne-pole-2025-p-s-/'), web('Znovín Neuburské', 'https://www.znovin.cz/e-shop/neuburske-pozdni-sber-2025-z5355')]
        },
        {
          title: 'Ryzlink rýnský i Ryzlink vlašský',
          text: '<strong>Rýnský</strong> to Riesling, stara odmiana znad Renu: cytryna, lipa i morela, a przy dojrzewaniu czasem delikatna nafta. <strong>Vlašský</strong> to Welschriesling, osobna odmiana o niepewnym pochodzeniu: w młodym winie częściej jabłko, cytrusy i zioła. Porównaj oba w Enotéce.',
          links: [web('NVC: odmiany białe', W.nvcBile), web('Plantgrape: Riesling', 'https://www.plantgrape.fr/fr/varietes/varietes-a-fruits/236/export')]
        },
        {
          title: 'Sauvignon Blanc i Savagnin',
          text: 'Czeskie <strong>Sauvignon</strong> w VOC to Sauvignon Blanc: agrest, liść porzeczki i pokrzywa albo brzoskwinia i limonka. <strong>Savagnin</strong>, odmiana kojarzona z Jurą i rodziną Traminer, pojawia się w pochodzeniu Grünera. Warto rozdzielić te dwie podobnie brzmiące nazwy.',
          links: [web('NVC: odmiany białe', W.nvcBile), web('VOC Znojmo: profile', W.vocProfile)]
        },
        {
          title: 'Krzyżówka, klon i kupaż',
          text: '<strong>Veritas</strong> to lokalna odmiana z hodowli w Vrbovcu (Ryzlink červený × Bouvierův hrozen). <strong>Hibernal</strong> pochodzi z Geisenheim. <strong>Müller Thurgau</strong> to Riesling × Madeleine Royale, <strong>Pálava</strong> to Tramín červený × Müller Thurgau, a <strong>Zweigeltrebe</strong> to Saint Laurent × Blaufränkisch. <strong>Trio</strong> Ampelos czy <strong>Rajská</strong> Lahofera to kupaże trzech odmian. Na etykiecie szukaj: <em>vinařská obec</em> (miejscowość), <em>viniční trať</em> (parcela), <em>šarže</em> (partia). <em>Suché</em> to wytrawne, <em>polosuché</em> półwytrawne, <em>polosladké</em> półsłodkie.',
          links: [web('VOC Znojmo: zasady', 'https://www.vocznojmo.cz/cs/zpusoby-znaceni-vin/')]
        },
        {
          title: 'Jak czytać VOC Znojmo',
          text: 'Banderola na szyjce identyfikuje wino z apelacji. VOC obejmuje Grünera, Rieslinga, Sauvignon Blanc oraz ich kupaże z wyznaczonych parcel. <em>Pozdní sběr</em> i <em>výběr z hroznů</em> mówią o dojrzałości gron przy zbiorze. Słodycz gotowego wina sprawdzaj w oznaczeniu <em>suché</em>, <em>polosuché</em> lub <em>polosladké</em>.',
          links: [web('VOC: zasady certyfikacji', 'https://www.vocznojmo.cz/cs/zpusoby-znaceni-vin/'), web('VOC: banderola i partia', 'https://www.vocznojmo.cz/voc/informace-o-sdruzeni/cesta-vina-voc-znojmo-z-vinice-az-na-vas-stul/')]
        }
      ],

      about: {
        title: 'O przewodniku',
        text: 'Top 7 to kolejność zakupowa ułożona na podstawie źródeł: typowość dla Znojemska, wyniki konkretnych partii, różnorodność stylów i możliwość zakupu. Opisy aromatów pochodzą z kart win albo są wskazówkami, czego szukać w kieliszku. Wyróżnienia pochodzą z regionalnego konkursu 2026 i krajowego Salonu vín 2026. Ceny to odczyty z ofert przy winach. Stan w sklepie i nalew w Enotéce sprawdź przed wizytą. Głosy lokalnych sommelierów: <strong>František Koudela</strong> (przewodniczący VOC Znojmo), <strong>Jakub Přibyl</strong> i <strong>Klára Kollárová</strong>, która zwraca uwagę, że o parowaniu z gęsiną decyduje też kwaśność kapusty.',
        links: [pdf('Wyniki regionalne 2026', W.regional), pdf('Salon vín 2026', W.salon), web('VOC Znojmo: profile', W.vocProfile), web('Kollárová: wino do gęsiny', 'https://www.vinazmoravyvinazcech.cz/cs/aktuality/N4mTcsMAT8-vw0ShZC7JFw-svatomartinske-je-zpet-prvni-vina-noveho-rocniku-miri-na-stoly')]
      }
    },

    /* ------------------------------------------------------------------ */
    walks: {
      allPoints: { label: 'Wszystkie nasze punkty w Mapy.com', url: 'https://mapy.com/s/loteperote' },
      gpx: [
        {
          id: 'zamek-park', when: 'Znojmo · ze Studentskiej',
          title: 'Zamek, park i Polski Kamień',
          text: 'Ze Studentskiej przez park i obok Polskiego Kamienia nad Dyją w stronę zamku. Kamień upamiętnia około stu polskich oficerów, którzy po powstaniu listopadowym (1831–1832) przebywali w Znojmie. Przy zamku stoi rotunda św. Katarzyny. Więcej o obu miejscach w zakładce Ciekawostki.',
          mapy: 'https://mapy.com/pl/turisticka?planovani-trasy&dim=6aefa43d1dc75f3b916f19e1&x=16.0325221&y=48.8616478&z=14.248'
        },
        {
          id: 'kraluv-stolec', when: 'Piątek · jeśli jest więcej czasu',
          title: 'Punkt widokowy Králův stolec',
          text: 'Ze Studentskiej do punktu widokowego nad zbiornikiem na Dyi. Według legendy Jan III Sobieski obserwował stąd w 1683 roku przeprawę wojsk przez Dyję w drodze na odsiecz Wiednia.',
          mapy: 'https://mapy.com/pl/turisticka?planovani-trasy&dim=6af0e7162a9053ff68e5f2bb&x=15.9949312&y=48.8372131&z=13.562',
          links: [web('Králův stolec (kudyznudy.cz)', 'https://www.kudyznudy.cz/aktivity/vyhlidka-kraluv-stolec')]
        },
        {
          id: 'saldorf', when: 'Sobota · wariant Nový Šaldorf',
          title: 'Pieszo do Nového Šaldorfu',
          text: 'Ze Studentskiej do Nového Šaldorfu, gdzie w sobotę są otwarte piwnice (od 15:00) i obiad w U Tří Jasanů (16:30).',
          mapy: 'https://mapy.com/pl/turisticka?planovani-trasy&dim=6af0e69fe16bd64adcadaeab&x=16.0394382&y=48.8384244&z=14'
        },
        {
          id: 'cizov-hardegg', when: 'Czwartek · Hardegg',
          title: 'Z Čížova do zamku Hardegg',
          text: 'Z parkingu w Čížovie, po czeskiej stronie, w dół do Hardeggu i zamku po austriackiej stronie Dyji.',
          mapy: 'https://mapy.com/pl/turisticka?planovani-trasy&dim=6af0e7d5d845f8bbbae17713&x=15.8665752&y=48.8669450&z=14',
          links: [web('Park Thayatal · most i dojazd', 'https://www.np-thayatal.at/de/pages/kontakt--anreise-49.aspx')]
        }
      ],
      routes: [
        {
          title: 'Hardegg i most nad Dyją', when: 'Czwartek rano', tags: ['Austria', 'dolina Dyji'],
          text: 'Hardegg po austriackiej stronie Dyji. Spacer nad rzeką i przez most pieszo-rowerowy. Dojazd autem od strony Austrii.',
          route: 'cizov-hardegg',
          links: [web('Park Thayatal · most i dojazd', 'https://www.np-thayatal.at/de/pages/kontakt--anreise-49.aspx')]
        },
        {
          title: 'Hardegger Warte i Čížov', when: 'Piątek rano · wariant', tags: ['ok. 6 km', 'ok. 2 h', '+ odbicie do Čížova'],
          text: 'Pętla od mostu do punktu widokowego i osobne odbicie do Čížova. Doliczcie czas na odbicie i przerwy.',
          links: [web('Park Thayatal · szlak', 'https://www.np-thayatal.at/cz/pages/hardegger-warte---hardeggskss-vyhlidka-299.aspx')]
        },
        {
          title: 'Karolíniny sady i dolina Gránice', when: 'Środa lub piątek', tags: ['Znojmo', 'krótko'],
          text: 'Spacer przez Karolíniny sady przy Rajskiej vinice i, przy suchej pogodzie, krótki odcinek doliny Gránice. Przy deszczu skróćcie spacer.',
          links: [web('Punkty widokowe Znojma', W.vyhlidky)]
        },
        {
          title: 'Przez winnice do Šatova', when: 'Sobota rano · wariant', tags: ['ponad 5–6 km', 'krócej od Popic'],
          text: 'Przez Kraví horę, Konice, Popice i Havraníky. Celujcie w dotarcie przed 13:00 na poświęcenie wina. Przy deszczu autobus 818.',
          links: [web('Autobus 818', W.bus818)]
        }
      ],
      kidsNote: 'Krótsze trasy z dziećmi (ścieżka salamandry Hugo, nad Dyją na hulajnodze, Hradiště) są w zakładce <strong>Dzieci</strong>.'
    },

    /* ------------------------------------------------------------------ */
    facts: {
      title: 'Ciekawostki',
      intro: 'Historia Znojma w kilku opowieściach na spacer: od rzymskiego noża do winorośli po polskich oficerów nad Dyją. Na podstawie „Znojmo – krótki przewodnik historyczny” i podanych w nim źródeł.',
      hero: { src: 'img/historia/panorama.webp', w: 728, h: 364, alt: 'Panorama starego miasta Znojma z kościołem św. Mikołaja, widziana od strony zamku', credit: 'Fot. Uoaei1, CC BY-SA 4.0', creditUrl: 'https://commons.wikimedia.org/wiki/File:Znojmo_Old_Town_Panorama_from_Castle_20190217.jpg' },
      map: {
        src: 'img/historia/mapa-ciekawostek.webp', w: 960, h: 640,
        alt: 'Mapa centrum Znojma z ponumerowanymi miejscami: 1 Hradiště, 2 rotunda i zamek, 3 Polski Kamień, 4 kościół św. Mikołaja, 5 rynek, oraz strzałka do Králova stolca',
        credit: '© OpenStreetMap contributors', creditUrl: 'https://www.openstreetmap.org/copyright',
        legend: [
          { n: 1, label: 'Hradiště sv. Hypolita', when: 'IX w.', url: 'https://www.google.com/maps/search/?api=1&query=48.8589621%2C16.0332038' },
          { n: 2, label: 'Rotunda św. Katarzyny i zamek', when: 'XI w. · XIX w.', url: 'https://www.google.com/maps/search/?api=1&query=48.8554143%2C16.0435315' },
          { n: 3, label: 'Polski Kamień', when: '1831–1832', url: 'https://www.google.com/maps/search/?api=1&query=48.8548129%2C16.0412843' },
          { n: 4, label: 'Kościół św. Mikołaja', when: 'na spacer', url: 'https://www.google.com/maps/search/?api=1&query=48.8547141%2C16.0454913' },
          { n: 5, label: 'Masarykovo náměstí (rynek)', when: '1226', url: 'https://www.google.com/maps/search/?api=1&query=48.8542647%2C16.0498779' },
          { n: '→', label: 'Králův stolec (3,5 km)', when: '1683', url: 'https://www.google.com/maps/search/?api=1&query=48.8440148%2C16.0033777' }
        ]
      },
      timeline: [
        {
          when: 'II w. n.e.', title: 'Rzymski nóż do winorośli?',
          hook: 'Wino na Morawach mogło zacząć się od Rzymian, ale to wciąż tylko hipoteza.',
          text: 'W II wieku n.e. Rzymianie mieli bazę w Hradisku koło Mušova. Z tego stanowiska pochodzi zakrzywione ostrze, które bywa uznawane za nóż do przycinania winorośli. Podobne narzędzia mogły jednak służyć również do cięcia witek czy innych pędów. Hipoteza o winnicach legionistów pozostaje otwarta.',
          img: { src: 'img/historia/musov.webp', w: 960, h: 673, alt: 'Czerwona rzymska misa terra sigillata z reliefami', caption: 'Rzymska misa terra sigillata z obozu w Mušovie (175–180 n.e.)', credit: 'Fot. Jan Sapák, CC BY-SA 3.0', creditUrl: 'https://commons.wikimedia.org/wiki/File:Mu%C5%A1ov_-_Roman_fortress.JPG' },
          sources: [5, 6]
        },
        {
          when: 'IX w.', title: 'Gród wielkomorawski na Hradišti',
          hook: 'Zanim był zamek, po drugiej stronie wąwozu stał gród Wielkich Moraw.',
          text: 'Stań przy rotundzie św. Katarzyny i spójrz przez dolinę potoku Gránice. Po drugiej stronie leży Hradiště św. Hipolita. Tam w IX wieku działał gród wielkomorawski. O jego skali mówią badania umocnień i rozległego cmentarzyska.',
          pin: 1,
          img: { src: 'img/historia/hradiste.webp', w: 960, h: 640, alt: 'Zalesione wzgórze z zabudowaniami i wieżami kościoła św. Hipolita na szczycie', caption: 'Wzgórze Hradiště z kościołem św. Hipolita', credit: 'Fot. Uoaei1, CC BY-SA 4.0', creditUrl: 'https://commons.wikimedia.org/wiki/File:Znojmo_P%C3%B6ltenberg_20190217.jpg' },
          where: [map('Hradiště sv. Hypolita', 'https://www.google.com/maps/search/?api=1&query=Hradi%C5%A1t%C4%9B+svat%C3%A9ho+Hypolita+Znojmo')],
          sources: [1, 2]
        },
        {
          when: 'Wczesne średniowiecze', title: 'Co mówią nasiona winorośli',
          hook: 'Nasiona z Hradiště wyglądają na stare, ale ich wiek budzi wątpliwości.',
          text: 'Mocniejszą wskazówkę niż rzymski nóż dają Mikulčice, jeden z ośrodków Wielkich Moraw: wśród wczesnośredniowiecznych nasion są okazy o cechach winorośli uprawnej. Nasiona znaleziono też na znojemskim Hradišti, ale archeobotaniczka Michaela Látková zwraca uwagę, że ich datowanie budzi poważne wątpliwości. Dlatego ostrożnie z przypisywaniem Znojmu winnic już w czasach Wielkich Moraw. Upowszechnienie uprawy badacze wiążą m.in. z chrystianizacją i zapotrzebowaniem na wino do liturgii.',
          img: { src: 'img/historia/mikulcice.webp', w: 800, h: 600, alt: 'Kamienne fundamenty dawnego kościoła na trawie w lesie', caption: 'Fundamenty wielkomorawskiego kościoła w Mikulčicach', credit: 'Fot. Palickap, CC BY-SA 4.0', creditUrl: 'https://commons.wikimedia.org/wiki/File:Mikul%C4%8Dice-Valy,_VI._kostel_(3).jpg' },
          sources: [6, 7]
        },
        {
          when: 'XI w.', title: 'Oracz w kaplicy',
          hook: 'Przemyślidzi kazali namalować w rotundzie legendę o własnym rodowodzie.',
          text: 'Na cyplu, na którym dziś stoi zamek, w XI wieku powstała siedziba morawskich Przemyślidów. Według legendy księżna Libusza wysłała posłów po Przemysła Oracza. Zastali go przy pługu i wezwali do objęcia władzy. Muzeum rozpoznaje tę scenę w romańskich malowidłach rotundy św. Katarzyny. Malowidło pokazuje, jak dynastia opowiadała o własnych początkach.',
          pin: 2,
          img: { src: 'img/historia/premysl.webp', w: 734, h: 600, alt: 'Romański fresk: Przemysł Oracz przy pługu z parą wołów i posłowie', caption: 'Przemysł Oracz przy pługu: fresk z rotundy św. Katarzyny', credit: 'Domena publiczna', creditUrl: 'https://commons.wikimedia.org/wiki/File:Premysl_Orac.jpg' },
          where: [map('Rotunda św. Katarzyny', 'https://www.google.com/maps/search/?api=1&query=Rotunda+svat%C3%A9+Kate%C5%99iny+Znojmo')],
          sources: [1, 3]
        },
        {
          when: '1226', title: 'Miasto królewskie bez aktu lokacyjnego',
          hook: 'Skąd data 1226, skoro dokument lokacyjny się nie zachował?',
          text: 'Na początku lat 20. XIII wieku Przemysł Ottokar I zaczął przekształcać Znojmo w obwarowane miasto królewskie. Akt lokacyjny się nie zachował, ale dwa dokumenty królewskie z 1226 roku dotyczą spraw wynikłych już z lokacji. Źródła wspominają też fosę i bramę wschodnią.',
          pin: 5,
          img: { src: 'img/historia/veduta1523.webp', w: 800, h: 590, alt: 'Czarno-biała rycina: panorama obwarowanego Znojma z wieżami nad doliną', caption: 'Znojmo w 1523 roku (weduta)', credit: 'Domena publiczna', creditUrl: 'https://commons.wikimedia.org/wiki/File:Veduta_Znojma_r._1523.png' },
          sources: [1]
        },
        {
          when: '1683', title: 'Sobieski nad Dyją',
          hook: 'Legenda mówi, że polski król patrzył stąd na swoje wojska.',
          text: 'Według legendy z punktu widokowego Králův stolec nad zbiornikiem na Dyi król Jan III Sobieski obserwował przeprawę wojsk przez rzekę w drodze na odsiecz Wiednia. Na punkt widokowy prowadzi jedna z naszych tras.',
          pin: '→',
          img: { src: 'img/historia/matejko.webp', w: 960, h: 479, alt: 'Obraz Jana Matejki: król Jan III Sobieski na koniu wśród wojsk po bitwie pod Wiedniem', caption: 'Jan Matejko, „Sobieski pod Wiedniem” (1883)', credit: 'Domena publiczna', creditUrl: 'https://commons.wikimedia.org/wiki/File:King_John_III_Sobieski_sending_Message_of_Victory_to_the_Pope,_after_the_Battle_of_Vienna_111.png' },
          route: 'kraluv-stolec',
          links: [web('Králův stolec (kudyznudy.cz)', 'https://www.kudyznudy.cz/aktivity/vyhlidka-kraluv-stolec')]
        },
        {
          when: '1831–1832', title: 'Polscy oficerowie w Znojmie',
          hook: 'Po powstaniu listopadowym nad Dyją zamieszkało około stu polskich oficerów.',
          text: 'Na przełomie 1831 i 1832 roku w Znojmie przebywało około stu polskich oficerów po klęsce powstania listopadowego. Zostały po nich wspomnienia, z których historyk Josef Černý odtwarzał ich codzienność, oraz pamięć o Polskim Kamieniu nad Dyją. To ślad uchodźców, którzy na Morawach próbowali ułożyć sobie życie po przegranej. Obok Polskiego Kamienia prowadzi nasza trasa zamkowa.',
          img: { src: 'img/historia/dyje.webp', w: 960, h: 433, alt: 'Dolina Dyi pod Znojmem: rzeka, zapora i tarasy pod murami miasta', caption: 'Dolina Dyi pod murami Znojma', credit: 'Fot. Pudelek (Marcin Szala), CC BY-SA 3.0', creditUrl: 'https://commons.wikimedia.org/wiki/File:Znojmo_a_Dyje_(Znaim_und_Thaya)_-_panorama.JPG' },
          pin: 3,
          route: 'zamek-park',
          sources: [4]
        },
        {
          when: 'XIX w.', title: 'Świnie w rotundzie',
          hook: 'Romańska kaplica była kiedyś chlewem, a nawet piwiarnią z salą do tańca.',
          text: 'Rotunda z malowidłami Przemyślidów służyła później jako skład drewna, chlew, a nawet piwiarnia z salą do tańca. W XIX wieku na zagrożony zabytek zwrócił uwagę kustosz z Brna Moritz Trapp. Miasto zleciło restaurację malowideł. Dziś muzeum uzależnia wejście do rotundy od wilgotności i pogody.',
          img: { src: 'img/historia/rotunda.webp', w: 960, h: 654, alt: 'Kamienna romańska rotunda św. Katarzyny z czerwonym dachem na tle błękitnego nieba', caption: 'Rotunda św. Katarzyny dziś', credit: 'Fot. ViktorEP, CC BY-SA 3.0', creditUrl: 'https://commons.wikimedia.org/wiki/File:Rotunda_svat%C3%A9_Kate%C5%99iny_Znojmo.jpg' },
          pin: 2,
          sources: [3]
        }
      ],
      walk: {
        title: 'Trzy miejsca na spacer',
        text: 'Zacznij na Masarykovo náměstí. Podejdź do kościoła św. Mikołaja, skąd można spojrzeć na dolinę Dyji, a potem przejdź pod rotundę św. Katarzyny. Z zamkowego cypla wypatrz Hradiště po drugiej stronie wąwozu. Wejście do rotundy zależy od wilgotności i pogody.',
        stops: [
          map('Masarykovo náměstí', 'https://www.google.com/maps/search/?api=1&query=Masarykovo+n%C3%A1m%C4%9Bst%C3%AD+Znojmo'),
          map('Kościół św. Mikołaja', 'https://www.google.com/maps/search/?api=1&query=Kostel+svat%C3%A9ho+Mikul%C3%A1%C5%A1e+Znojmo'),
          map('Rotunda św. Katarzyny', 'https://www.google.com/maps/search/?api=1&query=Rotunda+svat%C3%A9+Kate%C5%99iny+Znojmo')
        ]
      },
      sources: [
        { n: 1, label: 'Czeskie Ministerstwo Kultury: opracowanie o zabytkowym Znojmie, s. 14–16', url: 'https://mk.gov.cz/doc/cms_library/oop-c-2_2022-o-prohlaseni-pz-znojmo-a-urceni-podminek-jeji-ochrany-16491.pdf', kind: 'pdf' },
        { n: 2, label: 'Uniwersytet Masaryka: badania archeologiczne na Hradišti', url: 'https://www.muni.cz/vyzkum/publikace/1834861', kind: 'web' },
        { n: 3, label: 'Jihomoravské muzeum ve Znojmě: rotunda św. Katarzyny', url: 'https://www.muzeumznojmo.cz/Rotunda-', kind: 'web' },
        { n: 4, label: 'Josef Černý: polscy oficerowie w Znojmie (omówienie wykładu)', url: 'https://www.muzeumznojmo.cz/Vystavy-42.-p%C5%99edn%C3%A1%C5%A1kov%C3%BD-cyklus-JMM_314', kind: 'web' },
        { n: 5, label: 'Instytut Archeologii czeskiej Akademii Nauk w Brnie: badania w Mušovie', url: 'https://www.arub.cz/en/research-centres/centre-for-protohistoric-archaeology/', kind: 'web' },
        { n: 6, label: 'M. Látková: On the origin and cultivation of grapevine…, Archeologické rozhledy', url: 'https://doi.org/10.35686/AR.2024.245', kind: 'web' },
        { n: 7, label: 'M. Látková, M. Hajnalová, M. Havlík: Grape vine and viticulture tradition in Mikulčice', url: 'https://www.arub.cz/prehled-vydanych-cisel/pv_60_2_latkova_et_al.pdf', kind: 'pdf' }
      ]
    },

    /* ------------------------------------------------------------------ */
    kids: {
      intro: 'Atrakcje pieszo i krótkie przejazdy autobusem. Rozkłady to przykłady z listopada 2026. Przed wyjściem sprawdźcie oba kierunki na dany dzień.',
      featured: {
        title: 'Family City w Hatě',
        sub: 'Kinderwelt, farma ze zwierzętami, muzeum LEGO i samochodziki w jednym miejscu',
        place: 'Chvalovice-Hatě 183, przy granicy z Austrią, obok Excalibur City i Freeport',
        alert: 'Merlinův dětský svět (Kinderwelt) w listopadzie działa tylko od piątku do niedzieli: <strong>13–15 XI, 10:00–19:00</strong>. W środę i czwartek jest zamknięty. Farma i muzeum LEGO są czynne codziennie.',
        travel: [
          ['Autem', 'ok. 15 min. Parking przy farmie i muzeum LEGO jest bezpłatny.'],
          ['Autobusem', 'linia 819 z dworca autobusowego (Autobusové nádraží) do przystanku Chvalovice, Hatě, FREEPORT: ok. 22 min w weekend (np. 11:00 → 11:22), ok. 30 min w dzień roboczy (np. 12:20 → 12:50). Powroty np. 14:24 lub 18:14 w weekend.']
        ],
        photos: [
          { src: 'img/fc-osiolki.webp', w: 800, h: 600, alt: 'Dwa jasne osiołki wyglądają zza drewnianego płotu', caption: 'Osiołki na farmie', credit: 'Fot. Family City', creditUrl: 'https://www.familycity.com/merlin-s-farm/' },
          { src: 'img/fc-autka.webp', w: 800, h: 600, alt: 'Tor terenowy z autkami i jeepami na pilota', caption: 'Autka na pilota w Blue Cafe', credit: 'Fot. Family City', creditUrl: 'https://www.familycity.com/auta-na-dalkove-ovladani/' },
          { src: 'img/fc-kucyk.webp', w: 800, h: 600, alt: 'Kucyk z długą grzywą skubie trawę', caption: 'Kucyki na farmie', credit: 'Fot. Family City', creditUrl: 'https://www.familycity.com/merlin-s-farm/' },
          { src: 'img/fc-nandu.webp', w: 800, h: 600, alt: 'Nandu z pisklętami na łące', caption: 'Nandu z pisklętami', credit: 'Fot. Family City', creditUrl: 'https://www.familycity.com/merlin-s-farm/' },
          { src: 'img/kinderwelt-brama.webp', w: 960, h: 643, alt: 'Kolorowa brama wejściowa do Merlinova Kinderwelt z figurą czarodzieja Merlina', caption: 'Wejście do Kinderwelt', credit: 'Fot. Хомелка, CC BY-SA 3.0', creditUrl: 'https://commons.wikimedia.org/wiki/File:Excalibur_City_06.JPG' },
          { src: 'img/excalibur-smok.webp', w: 960, h: 640, alt: 'Biały zamek z kolorowym smokiem na szczycie w Excalibur City', caption: 'Zamek ze smokiem w sąsiednim Excalibur City', credit: 'Fot. Dennis G. Jarvis, CC BY-SA 2.0', creditUrl: 'https://commons.wikimedia.org/wiki/File:Czech-03549_-_Excalibur_City_(32976125826).jpg' }
        ],
        attractions: [
          {
            name: 'Merlinův dětský svět (Kinderwelt)',
            text: 'Ponad 200 atrakcji pod dachem i na zewnątrz. Wstęp na teren i na część atrakcji jest bezpłatny, reszta działa na żetony. W listopadzie żetony są o połowę tańsze: 25 Kč daje 2 żetony.',
            facts: [['13–15 XI', '10:00–19:00'], ['11–12 XI', 'zamknięte']],
            links: [web('Kinderwelt', 'https://www.merlinuvdetskysvet.cz/'), web('Atrakcje', 'https://www.merlinuvdetskysvet.cz/atrakce/'), web('Godziny otwarcia', 'https://www.merlinuvdetskysvet.cz/oteviraci-doba/'), web('Cennik żetonów', 'https://www.merlinuvdetskysvet.cz/cenik-tokenu/')]
          },
          {
            name: 'Merlinova farma',
            text: 'Zoo kontaktowe z ponad 300 zwierzętami: alpaki, osiołki, kozy, kucyki, emu, a nawet kangury.',
            facts: [['Wstęp', '4 żetony (100 Kč), w kantorze przed wejściem'], ['Godziny', 'strona podaje 10:00–16:00, a w opisie 10:00–17:00 (pt–nd do 18:00). Lepiej sprawdzić.']],
            links: [web('Farma', 'https://www.familycity.com/merlin-s-farm/')]
          },
          {
            name: 'Museum of Bricks (LEGO)',
            text: '2500 modeli z ponad 500 000 klocków w 15 tematycznych ekspozycjach, kącik do budowania i sklep LEGO.',
            facts: [['Godziny', 'śr.–czw. 10:00–18:00, pt.–nd. 10:00–19:00'], ['Bilety', 'dziecko 200 Kč (do 120 cm 150 Kč), dorosły 275 Kč, rodzina 2+2 700 Kč. Online taniej.']],
            links: [web('Muzeum', 'https://www.familycity.com/museum-of-bricks/'), web('Bilety online', 'https://vstupenky.museumofbricks.cz/muzeum-hate')]
          },
          {
            name: 'Samochodziki',
            text: 'W Kinderwelt są m.in. gokarty, tor samochodowy i dziecięca szkoła jazdy. W Blue Cafe można sterować koparkami, ciężarówkami i jeepami na pilota na torze terenowym.',
            facts: [['Blue Cafe', 'pn.–czw. 9:00–19:00, pt.–nd. 9:00–20:00']],
            links: [web('Auta na pilota', 'https://www.familycity.com/auta-na-dalkove-ovladani/')]
          }
        ],
        links: [
          map('Family City w Mapach', 'https://www.google.com/maps/search/?api=1&query=Family+City%2C+Chvalovice-Hat%C4%9B+183%2C+Znojmo'),
          web('Mapa areału', 'https://www.familycity.com/mapa-arealu/'),
          web('Galeria zdjęć', 'https://www.merlinuvdetskysvet.cz/fotogalerie-venkovni-areal/'),
          pdf('Rozkład 819', 'https://www.idsjmk.cz/jrady/819.pdf'),
          web('Wyszukiwarka połączeń IDOS', 'https://idos.cz/vlakyautobusymhdvse/spojeni/')
        ]
      },
      indoor: [
        {
          title: 'Herna RUBIK', where: 'Vídeňská třída 707/25 · pieszo z okolic dworca',
          text: 'Kryta sala zabaw ze zjeżdżalniami, basenem z piłeczkami, linowymi przejściami i koszem do rzucania. Dla dorosłych kawiarnia.',
          facts: [['Godziny', 'codziennie 9:00–19:00'], ['Cena', '1. godzina: 170 Kč w dzień roboczy przed południem, 250 Kč po południu i w weekend. Opiekun bezpłatnie.']],
          links: [web('Godziny i cennik', 'https://hernarubik.cz/cenik/')]
        },
        {
          title: 'Kryty basen Louka', where: 'Melkusova 3963/44 · autobus 809',
          text: 'Basen pływacki, basen do nauki i mały basen dziecięcy z wodą 30°C. Dobry wybór na krótsze wyjście.',
          facts: [['Cena', '100 Kč dorosły, 80 Kč dziecko (za godzinę)'], ['Otwarcie', 'pon.–sob. od 9:00, nd. od 11:00 (w sprawdzonym tygodniu)']],
          links: [web('Godziny i cennik', 'https://www.sportovisteznojmo.cz/bazen-louka?container-default-news-c82952d974388ea587d7532b0bea93e7-vp-page=2')]
        },
        {
          title: 'Znojemské podzemí', where: 'Slepičí trh 2, starówka',
          text: 'Około godziny w podziemnym labiryncie. Trasa klasyczna ma efekty świetlne i dźwiękowe, figurki i szkielety. Trasy przygodowe są od 15 lat.',
          facts: [['Bilet', 'dziecko 6–15 lat: 100 Kč']],
          links: [web('Opis tras i rezerwacja', W.podzemi)]
        },
        {
          title: 'Muzeum motorismu', where: 'Koželužská 44, nad Dyją',
          text: 'Przedwojenne samochody, motocykle, traktory, maszyny parowe i stare auta na pedały. Można połączyć ze spacerem w dolinie Gránice. Ze starówki schodzi się w dół, powrót jest pod górę.',
          facts: [['Godziny', 'listopad–luty: sob. i nd. 9:00–17:00']],
          links: [web('Strona muzeum', 'https://www.muzeum-motorismu.cz/'), web('Godziny zimowe', 'https://www.portalridice.cz/akce/muzeum-motorismu-znojmo')]
        },
        {
          title: 'Muzeum w klasztorze minorytów', where: 'Přemyslovců 8, starówka',
          text: 'Przyroda okolic Znojma i prehistoria. Na wystawie o dawnych rolnikach są elementy do samodzielnego odkrywania.',
          facts: [['Godziny', 'weekend 10:00–17:00, w tygodniu 9:00–11:30 i 12:00–17:00']],
          links: [web('Wystawy', 'https://www.muzeumznojmo.cz/Minoritsk%C3%BD-kl%C3%A1%C5%A1ter'), web('Godziny', 'https://www.muzeumznojmo.cz/Navstivte-nas/Oteviraci-doba')]
        }
      ],
      outdoor: [
        {
          title: 'Ścieżka salamandry Hugo', where: 'dolina Gránice · wejście od Dyji lub willi Krammera',
          text: 'Leśny plac zabaw: drewniane zwierzęta, memory i wielki wąż do balansowania. Po drodze stoi prawie trzymetrowa salamandra. Można zawrócić przy pierwszych punktach albo iść dalej do domku Czerwonego Kapturka.',
          facts: [['Długość', 'podstawowy odcinek ok. 2,4 km']],
          links: [web('Trasa i mapa', 'https://www.granice.cz/trasy/naucna-stezka/'), web('Wariant do domku', 'https://znojmoregion.cz/cs/naucna-stezka-mloka-huga')]
        },
        {
          title: 'Dolní park i park Kolonka', where: 'przy starówce · Pražská / Slovenská / Jugoslávská',
          text: 'Dolní park ma plac zabaw tuż przy starówce. Kolonka ma odnowiony plac i więcej miejsca do zabawy. Fontanny działają tylko latem.',
          links: [map('Dolní park', 'https://mapy.com/cs/?source=base&id=2114478'), web('Park Kolonka', 'https://www.znojmocity.cz/oblibeny-park-kolonka-prosel-kompletni-revitalizaci-nabizi-klidovou-zonu-nove-hriste-i-vodni-prvky/d-85621')]
        },
        {
          title: 'Gra na starówce i wieża ratuszowa', where: 'starówka · wieża przy Obroková 12',
          text: 'Znojemská hledačka to karta gry do wydrukowania. Dziecko szuka detali i zbiera litery do hasła. Całość zajmuje ok. 1,5 godziny, ale w listopadzie można wybrać kilka punktów.',
          facts: [['Wieża', 'wt.–nd. 10:00–12:15 i 13:00–16:00']],
          links: [web('Karta gry', 'https://www.muzeumznojmo.cz/Stranka/Znojemsk%C3%A1-hleda%C4%8Dka'), web('Wieża ratuszowa', 'https://znojemskabeseda.com/radnicni_vez/')]
        },
        {
          title: 'Hulajnoga nad Dyją', where: 'od basenu Louka przez Sedlešovický most',
          text: 'Od Louki przejdźcie przez Sedlešovický most i skręćcie w prawo. Płaski, asfaltowy odcinek. Można przejść kawałek i wrócić na autobus.',
          facts: [['Długość', 'ok. 2 km w jedną stronę']],
          links: [web('Opis trasy', 'https://znojmoregion.cz/cs/znojmem-bez-barier')]
        },
        {
          title: 'Hradiště i widok spod kaplicy Eliasza', where: 'druga strona doliny Gránice · autobusy 801 i 817',
          text: 'Krótki wypad na drugą stronę doliny. Z okolic dworca do przystanku Hradiště, Sýpka jedzie się ok. 10 minut. Można wybrać sam spacer do punktu widokowego. Zwiedzanie Muzeum Wielkich Moraw warto wcześniej uzgodnić.',
          links: [web('Dojazd i kontakt', 'https://www.muzeumvelkemoravy.cz/kontakt/'), web('Punkty widokowe', W.vyhlidky)]
        }
      ],
      buses: [
        {
          line: '809', title: 'Kryty basen Louka',
          text: 'Železniční stanice (dworzec kolejowy) → Melkusova, plavecký bazén. Powrót z przystanku Melkusova w stronę dworca.',
          facts: [['Weekend', '11:07 → 11:13'], ['Powrót', '13:36 → 13:45']],
          links: [pdf('Rozkład 809', 'https://www.idsjmk.cz/jrady/809.pdf'), pdf('Linia 802', 'https://www.idsjmk.cz/jrady/802.pdf')]
        },
        {
          line: '819', title: 'Plac zabaw w Chvalovicach',
          text: 'Przystanek Chvalovice. Plac jest przy boisku nad potokiem Daníž, obok ścieżki na spacer lub hulajnogę.',
          facts: [['Weekend', '11:00 → 11:17'], ['Powrót', '14:29 → 14:47']],
          links: [web('Plac i ścieżka', 'https://znojmoregion.cz/cs/okruh-podel-danize')]
        }
      ]
    }
  };
})();
