# Zakładka „Pogoda”: plan

Stan na 11 XI 2026. Decyzje z rozmowy 11 XI: zakładka po „Dzieciach”, prognoza godzinowa na czas wyjazdu, modele krajowych służb meteorologicznych, pobierana na nowo przy każdym otwarciu strony i po dotknięciu „Sprawdź nową prognozę”.

## 1. Cel

Zakładka **Pogoda** pokazuje godzinową prognozę na czas wyjazdu (11–15 XI 2026) dla miejsc z planu. Źródłem są modele numeryczne krajowych służb meteorologicznych (odpowiedniki IMGW):

| Służba | Model | Rozdzielczość | Zasięg | Dostęp |
|---|---|---|---|---|
| **ČHMÚ** (Czechy) | ALADIN, domena CZ | 1 km | ok. 68 godzin, nowy przebieg co 6 h | Open-Meteo (`models=chmi_aladin_cz_1km`), czyli otwarte dane ČHMÚ w formacie JSON |
| **GeoSphere Austria** (dawniej ZAMG) | AROME | 1 km | ok. 56 godzin, nowy przebieg co 3 h | oficjalne API GeoSphere (`nwp-v2-1h-1km`) |
| **ECMWF** | IFS | 9 km | 15 dni | Open-Meteo (`models=ecmwf_ifs`) |

Wszystkie trzy źródła sprawdzone 11 XI: odpowiadają z nagłówkiem `Access-Control-Allow-Origin: *` i bez klucza API. Strona na GitHub Pages pobiera dane **bezpośrednio z telefonu**, bez serwera. W repo nie ma żadnych danych pogodowych.

## 2. Który model gdzie (uzasadnienie)

Według raportów weryfikacyjnych publikowanych przez ECMWF modele regionalne wysokiej rozdzielczości (AROME, ALADIN) dają zwykle lepsze prognozy pogody przy powierzchni na krótki termin na swoim terenie, a ECMWF jest najlepszym modelem globalnym w średnim terminie. Niezależnego porównania ALADIN-a z AROME dla okolic Znojma nie znaleźliśmy, dlatego pokazujemy oba.

| Miejsce | Po co w planie | Łańcuch modeli (pierwszy, który ma daną godzinę) | Druga opinia |
|---|---|---|---|
| **Znojmo** (centrum) | nocleg, środa, piątek, niedziela | ČHMÚ ALADIN → GeoSphere AROME → ECMWF | drugi model regionalny, jeśli ma tę godzinę |
| **Hardegg** (Austria) | czwartek, spacer przed południem | GeoSphere AROME → ČHMÚ ALADIN → ECMWF | jw. |
| **Šatov** | sobota, marsz przez winnice i święto | ČHMÚ ALADIN → GeoSphere AROME → ECMWF | jw. |
| **Nový Šaldorf** | sobota, otwarte piwnice i obiad | ČHMÚ ALADIN → GeoSphere AROME → ECMWF | jw. |

Każda godzina ma podpisane źródło. Łańcuch rozwiązuje dwie sytuacje naraz: różne zasięgi modeli (AROME kończy się ok. 13 XI rano, ALADIN wieczorem, ECMWF liczy dalej) i awarię jednego źródła (np. gdy GeoSphere nie odpowiada, Hardegg dostaje ALADIN-a). Lista pokazuje wyraźną granicę przy każdej zmianie modelu („Od czwartku 19:00: ECMWF, model globalny 9 km”). Domyślne miejsce to Znojmo.

## 3. Wygląd

- **Nagłówek:** „Pogoda na wyjazd”, godzina pobrania i przycisk **„Sprawdź nową prognozę”**.
- **Wybór miejsca:** przełącznik w stylu istniejącego `.seg` (Znojmo · Hardegg · Šatov · Nový Šaldorf), a pod nim jedna linia, po co to miejsce w planie i który model jest główny („Czwartek: spacer przed południem. Model główny: GeoSphere AROME 1 km”). Wybór zapamiętany na czas wizyty.
- **Pasek zakładek:** siódma zakładka „Pogoda” musi zmieścić się na 320 px bez ucinania podpisów (sprawdzić; w razie potrzeby krótsze podpisy jak istniejące „Ciekawe”).
- **Dni:** dla każdego dnia od dziś do 15 XI karta z podsumowaniem (ikona, min/maks temperatury, suma opadu, najsilniejszy poryw) i godzinami w rozwijanej liście. Dzisiejszy dzień jest otwarty, pozostałe zwinięte. Podsumowanie dzisiejszego dnia liczone tylko z pozostałych godzin i oznaczone „od teraz”. Ikona dnia: najczęstsza pogoda między 8:00 a 18:00, a opad ma pierwszeństwo, gdy pada w co najmniej 3 godzinach.
- **Wiersz godziny:** godzina, ikona pogody, temperatura, opad (mm, a dla ECMWF także prawdopodobieństwo), wiatr i porywy (km/h). Pod spodem drobna linia „druga opinia”: nazwa drugiego modelu, jego temperatura i opad. Gdy temperatura różni się o 3 °C lub więcej albo większy opad ma co najmniej 0,5 mm i jest co najmniej 4 razy większy od mniejszego, wiersz jest podświetlony na bursztynowo (sygnał niepewności), a nad listą jest jednozdaniowe wyjaśnienie tego koloru. Na telefonie (320–420 px) wiersz ma dwie linie, na komputerze druga opinia jest w osobnej kolumnie.
- **Zaokrąglenia:** temperatura w pełnych °C, opad z jednym miejscem po przecinku (poniżej 0,05 mm: „—”), wiatr w pełnych km/h, polski przecinek dziesiętny.
- **Dostępność:** każda ikona ma opis słowny (`aria-label`, np. „deszcz”), godziny dnia są listą z czytelnym tekstem („14:00, deszcz, 6 °C, opad 0,4 mm, wiatr 12 km/h, porywy 25”), a przełącznik miejsc ma `aria-pressed` jak istniejący `.seg`.
- **Ikony:** własne ikony SVG w stylu strony (słońce, księżyc, częściowe zachmurzenie, chmury, mgła/niskie chmury, deszcz, śnieg, deszcz ze śniegiem, burza). Liczone z kodu pogody WMO (Open-Meteo) albo, dla AROME, z zachmurzenia, opadu i rodzaju opadu, tak samo dla wszystkich modeli. Dzień i noc według wschodu i zachodu słońca z Open-Meteo.
- **Stopka:** źródła z licencją: ČHMÚ (ALADIN) i ECMWF przez Open-Meteo, GeoSphere Austria, CC BY 4.0.

## 4. Zachowanie

| Sytuacja | Reakcja |
|---|---|
| pierwsze wejście w zakładkę po otwarciu strony (także wejście linkiem `#pogoda`) | pobranie prognozy: 4 zapytania równolegle. Open-Meteo dla 4 miejsc naraz (ALADIN + ECMWF), GeoSphere dla 4 miejsc naraz (AROME) i dwa małe pliki z godziną ostatniego przebiegu (`/data/<model>/static/meta.json`, pole `last_run_initialisation_time`). Brak godziny przebiegu nie blokuje prognozy |
| „Sprawdź nową prognozę” | ponowne pobranie, przycisk pokazuje stan „Pobieram…” |
| powrót do strony otwartej od dawna (ponad 60 min od pobrania) | automatyczne ponowne pobranie przy wejściu w zakładkę albo przy powrocie do karty przeglądarki (`visibilitychange`), gdy zakładka Pogoda jest otwarta |
| zakres dni | od bieżącej godziny w czasie Pragi do 15 XI, 23:00. Po 15 XI komunikat „Wyjazd się skończył” zamiast pustej listy |
| `localStorage` niedostępny (np. tryb prywatny Safari) | prognoza działa, tylko bez zapisu na później (`try/catch`). Klucz zapisu ma wersję (`husa-pogoda-v1`), żeby zmiana formatu nie psuła odczytu |
| brak internetu albo błąd jednego źródła | każde źródło (Open-Meteo, GeoSphere) ma w telefonie osobny zapis z własną godziną pobrania. Gdy źródło nie odpowiada, używamy jego ostatniego zapisu i piszemy to wprost („GeoSphere nie odpowiada, AROME z 11 XI, 9:05”). Bez żadnego zapisu: łańcuch modeli (punkt 2) bierze pozostałe źródło |
| przekroczony czas (Open-Meteo 12 s, GeoSphere 30 s) | jak brak internetu. GeoSphere odpowiada w 1–16 s (pomiar 11 XI), Open-Meteo w ok. 50 ms, dlatego każde źródło rysuje się od razu po nadejściu, a status mówi, które jeszcze się wczytuje |
| godziny, które już minęły | ukryte (od bieżącej godziny w czasie Pragi) |

Czas: Open-Meteo zwraca godziny w strefie `Europe/Prague`, GeoSphere w UTC. Wszystko przeliczamy na czas Pragi przez `Intl.DateTimeFormat` z `timeZone: 'Europe/Prague'`.

Opad: w obu źródłach wartość o godzinie T to suma z godziny poprzedzającej (Open-Meteo: „preceding hour”, GeoSphere: „in the last forecast interval”), więc są porównywalne. GeoSphere podaje kg/m², czyli mm. Rodzaj opadu w AROME: udział śniegu `sf` w opadzie `tp` (ponad 70% śnieg, 20–70% deszcz ze śniegiem). Wiatr w AROME: prędkość z `10u` i `10v`, porywy `10fg`, z m/s na km/h (× 3,6).

## 5. Pliki

| Plik | Zmiana |
|---|---|
| `site/js/weather.js` (nowy) | pobieranie z obu źródeł, przeliczenia (wiatr z u/v, m/s → km/h, UTC → Praga), łączenie modeli godzina po godzinie, wybór ikony, zapis i odczyt `localStorage`. Bez DOM, żeby dało się testować w Node |
| `site/js/app.js` | zakładka `pogoda` po `dzieci`, render, przełącznik miejsc, przycisk odświeżania, stany ładowania i błędu, ikony pogody |
| `site/css/style.css` | style zakładki |
| `site/index.html`, `site/sw.js`, `tools/build-gas.mjs` | nowy skrypt; podbicie wersji SW. Zapytania do API są spoza domeny, więc Service Worker ich nie przechwytuje |
| `specs/pogoda/testy.js` | testy funkcji czystych na małych danych wzorcowych zapisanych w teście (przeliczenie UTC → Praga, wiatr z u/v, rodzaj opadu, ikona, łączenie modeli i granica ECMWF, podświetlenie rozbieżności, podsumowania dni, zakres dni) oraz osobny test na żywo obu API (`node specs/pogoda/testy.js --live`): odpowiedź, nagłówek CORS, liczba godzin, sensowne zakresy wartości |

## 6. Kryteria akceptacji

- Prognoza pobiera się przy każdym otwarciu strony (pierwsze wejście w zakładkę) i po przycisku. Widać godzinę pobrania i godzinę przebiegu modelu.
- Godziny od teraz do 15 XI, każda z podpisanym źródłem; granica ALADIN/AROME → ECMWF widoczna.
- Bez internetu: ostatnia prognoza z wyraźną datą. Gdy padnie jedno źródło, drugie dalej działa.
- Brak przewijania w poziomie i cele dotyku ≥ 44 px na szerokościach 320–1440 px; kontrast ≥ 4,5:1.
- Testy z `specs/pogoda/testy.js` przechodzą.

## 7. Ryzyka

| Ryzyko | Co robimy |
|---|---|
| Zmiana API (jak wyłączony 4 XI zbiór AROME 2,5 km) | dwa niezależne źródła, czytelny komunikat, test na żywo w `testy.js` |
| Wersja GAS: zapytania z ramki Google | nie sprawdzone; GitHub Pages jest wersją główną |
| Różnice między modelami mylą użytkownika | podpis źródła przy każdej godzinie, podświetlenie rozbieżności z krótkim wyjaśnieniem |

## 8. Review spec (11 XI)

Perspektywy: architekt, frontend developer, tester, projektant interfejsu, meteorolog (poprawność danych).

| Runda | Perspektywa | Ustalenie | Poprawka |
|---|---|---|---|
| 1 | architekt | Spec obiecywał godzinę przebiegu modelu, ale nie mówił skąd | pliki `meta.json` Open-Meteo (`last_run_initialisation_time`), `reference_time` z GeoSphere; brak godziny nie blokuje prognozy |
| 1 | meteorolog | Nie było ustalone, czy opad z obu źródeł oznacza to samo | oba to suma z poprzedniej godziny; rodzaj opadu w AROME z udziału `sf` w `tp`, wiatr z `10u`/`10v` (punkt 4) |
| 1 | tester | Brak zachowania po 15 XI, bez `localStorage` i przy długo otwartej stronie | komunikat po wyjeździe, `try/catch`, wersja klucza, odświeżenie po 60 min także przy `visibilitychange` |
| 1 | projektant | Wiersz z 6 kolumnami nie mieści się na 320 px | na telefonie dwie linie: dane i „druga opinia”; zasady zaokrągleń; wyjaśnienie koloru rozbieżności |
| 1 | projektant | Siódma zakładka w dolnym pasku może ucinać podpisy na 320 px | wymaganie i sprawdzenie w review kodu |
| 1 | frontend | Brak opisu dla czytników ekranu | `aria-label` ikon, tekstowy opis godziny, `aria-pressed` przełącznika |
| 1 | tester | Testy opisane ogólnie | lista funkcji czystych z danymi wzorcowymi i osobny test na żywo `--live` |
| 2 | architekt | „Model główny, potem ECMWF” marnował ALADIN-a w Hardeggu (AROME kończy się ok. 12 h wcześniej) i nie mówił, co przy awarii jednego źródła | łańcuch modeli dla każdego miejsca (punkt 2) |
| 2 | tester | Przy awarii jednego źródła wymieszany stan „świeże + zapisane” bez opisu | osobny zapis i godzina pobrania dla każdego źródła, komunikat wprost |
| 2 | projektant | Podsumowanie dzisiejszego dnia z części godzin wyglądało jak całodzienne | „od teraz”; zasada wyboru ikony dnia |
| 3 | wszystkie | bez istotnych ustaleń | — |
