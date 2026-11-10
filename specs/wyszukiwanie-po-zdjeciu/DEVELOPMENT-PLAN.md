# Wyszukiwanie wina po zdjęciu etykiety: plan

Stan na 10 XI 2026. To propozycja. Kodu jeszcze nie ma, a decyzje do podjęcia są w punkcie 11.

## 1. Cel

W zakładce **Wino** jest przycisk **Znajdź wino**. Użytkownik może:

1. wpisać nazwę wina, winiarni albo miejsca i wybrać wynik z podpowiedzi (wyszukiwanie tekstowe, osobna funkcja, patrz punkt 4),
2. albo dotknąć **Zrób zdjęcie etykiety**. Wtedy włącza się aparat telefonu, a strona pokazuje 1–3 najbardziej pasujące wina. Po dotknięciu wina otwiera się jego karta.

Warunki:
- wszystko działa w przeglądarce telefonu na GitHub Pages, bez serwera i bez kluczy API,
- zdjęcie nie opuszcza telefonu,
- po pierwszym użyciu funkcja działa offline, bo w piwnicach zasięg bywa słaby.

## 2. Czy do tego potrzebne jest AI?

**Chmurowe AI nie jest potrzebne. Mały model rozpoznawania tekstu (OCR) uruchomiony w telefonie jest.**

- Każdy dobry OCR do zdjęć to dziś mała sieć neuronowa. Tesseract od wersji 4 używa sieci LSTM, a PaddleOCR używa sieci do wykrywania i do czytania tekstu. Klasyczny OCR bez sieci radzi sobie ze skanem kartki, ale nie ze zdjęciem zaokrąglonej, błyszczącej etykiety.
- Te modele działają **w przeglądarce** dzięki WebAssembly, więc nie trzeba wysyłać zdjęcia do zewnętrznej usługi ani płacić za API.
- Duży model wizyjny w chmurze, np. Claude albo Gemini, rozpoznałby etykietę najlepiej. Wymagałby jednak klucza API, którego na GitHub Pages nie da się ukryć, a do tego pośrednika (np. GAS), opłat i zasięgu. Patrz wariant F w punkcie 5: nie polecam go jako pierwszego.

## 3. Najważniejsza obserwacja: zamknięta lista win

Nie rozpoznajemy dowolnego wina na świecie. Wybieramy wino z **naszej listy**, więc OCR nie musi przeczytać etykiety bezbłędnie. Wystarczy kilka dobrze odczytanych słów: producent, odmiana, rocznik, a najlepiej numer partii.

Lista kandydatów:

| Źródło | Liczba | Uwagi |
|---|---|---|
| Wina ze strony (`site/js/wines.js`) | 56 | pełne karty, opisy po polsku, zdjęcia butelek (48 w `site/img/wina/`) |
| Salon vín 2024–2026 (`docs/salon-vin/*.json`) | 1145 wpisów, **1072 unikalne wina**, 200 winiarni | 300 złotych i 845 srebrnych. Każde wino ma partię (`batch`). Złote mają gminę i parcelę, a złote z 2026 także zdjęcie butelki (100 szt.) |

Co jest na etykiecie i jak dobrze to wyróżnia wino:

| Element etykiety | Pole w danych | Wartość dla dopasowania |
|---|---|---|
| Numer partii (*šarže*, *číslo šarže*, *L.*) | `batch` | **bardzo duża**: unikalny w obrębie producenta i rocznika |
| Producent | `producer`, `producers[].name` | duża |
| Rocznik (4 cyfry 19xx/20xx) | `vintage`, `year` | średnia, ale łatwo go przeczytać |
| Odmiana (Ryzlink rýnský, Veltlínské zelené…) | `wine`, `name` | średnia: ta sama odmiana jest u wielu producentów |
| Kategoria (pozdní sběr, VOC Znojmo…) | `quality` | mała |
| Gmina i parcela (Šobes, Kraví hora…) | `village`, `vineyard`, `origin` | średnia |

## 4. Zależność: wyszukiwanie tekstowe idzie pierwsze

Rozpoznawanie ze zdjęcia to **OCR + to samo dopasowanie co w wyszukiwaniu tekstowym**. Dlatego najpierw budujemy wyszukiwanie tekstowe z podpowiedziami (faza 1). Szczegóły są w osobnym specu: [wyszukiwanie-tekstowe/DEVELOPMENT-PLAN.md](../wyszukiwanie-tekstowe/DEVELOPMENT-PLAN.md). W skrócie ono:

- używa biblioteki MiniSearch z naszą normalizacją: małe litery, bez znaków diakrytycznych, `y`=`i`, `w`=`v` (`Špalek` → `spalek`),
- toleruje literówki: 0 błędów dla słów do 3 liter, 1 dla słów z 4–6 liter, 2 od 7 liter; liczby (rocznik, partia) tylko dokładnie,
- dopasowuje początki słów (`hna` → `hnanice`),
- zna synonimy odmian (`riesling` ↔ `ryzlink rýnský`, `grüner` ↔ `veltlínské zelené`),
- liczy ranking z wagami pól, a wina ze strony stoją przed winami tylko z Salonu.

Po zrobieniu zdjęcia tekst z OCR trafia do tej samej funkcji `search` z modułu `wine-search.js`, ale w **trybie OR** i z własnymi wagami (punkt 5.8 spec wyszukiwania tekstowego, punkt 6.4 niżej). Tryb AND odrzuciłby tekst z OCR, bo zawiera on słowa spoza danych (adres, „alk. 12,5 % obj.”).

## 5. Porównanie sposobów

| | Sposób | Jak działa | Plusy | Minusy | Ocena |
|---|---|---|---|---|---|
| **A** | Natywne rozpoznawanie tekstu w telefonie | iPhone (Live Text w aparacie) i Android (Google Lens) już czytają tekst ze zdjęcia. Użytkownik kopiuje tekst i wkleja go w pole wyszukiwania | Zero kodu i zero MB. Najlepsza jakość OCR. Działa od razu po fazie 1 | Kilka dotknięć zamiast jednego. Trzeba to pokazać grupie | **Zrobić od razu**: krótka instrukcja pod polem wyszukiwania |
| **B** | [PaddleOCR](https://www.paddleocr.ai/v3.5.0/en/version3.x/deployment/browser.html) w przeglądarce (`@paddleocr/paddleocr-js`, model PP-OCRv5, ONNX Runtime Web) | Jedna sieć wykrywa obszary tekstu, druga je czyta | Model stworzony do zdjęć sceny, a nie skanów. Oficjalny pakiet SDK do przeglądarki | Młody pakiet (pierwsza wersja w IV 2026). Rozmiar modeli i obsługę czeskich znaków trzeba zmierzyć. Większe pobranie niż przy C | **Faworyt**, do potwierdzenia w teście (faza 2) |
| **C** | [Tesseract.js](https://github.com/naptha/tesseract.js) v7 | Sieć LSTM czyta tekst, dane języków `ces`, `deu`, `eng` | Dojrzały, prosty w użyciu, dobra dokumentacja. Wersja 7 jest o ok. 15–35% szybsza od v6 | Słabszy na zdjęciach (krzywizna butelki, odblaski, ozdobne fonty). Potrzebuje wstępnej obróbki obrazu | **Plan B**, gdy B zawiedzie lub będzie za ciężki |
| **D** | Kod kreskowy EAN (`BarcodeDetector`, zxing-js) | Skan kodu z tylnej etykiety | Bardzo pewny, bez AI | **W naszych danych nie ma kodów EAN.** `BarcodeDetector` nie działa w Safari na iPhonie | Odrzucony |
| **E** | Porównanie wyglądu butelki (embeddingi, np. MobileNet lub CLIP) | Wektor zdjęcia porównany z wektorami zdjęć referencyjnych | Nie zależy od czytelności czcionki | Zdjęcia referencyjne są tylko dla 148 win (48 nasze i 100 z Salonu 2026), i to sklepowe packshoty na białym tle. Model ma dziesiątki MB | Odrzucony na teraz |
| **F** | Chmurowe AI z obsługą obrazów | Zdjęcie wysłane do modelu, który zwraca producenta, odmianę i rocznik | Najwyższa skuteczność, radzi sobie z ozdobnymi etykietami | Klucz API musi być ukryty w pośredniku (GAS). Opłaty, wymaga zasięgu, zdjęcie opuszcza telefon | Tylko jeśli B i C nie osiągną celu z punktu 9 |

**Rekomendacja:** A od razu (po fazie 1), potem test porównawczy B i C na prawdziwych etykietach (faza 2) i wdrożenie zwycięzcy (faza 3).

## 6. Architektura (dla wariantu B lub C)

```
[Zrób zdjęcie] → <input type="file" accept="image/*" capture="environment">
      ↓
zmniejszenie zdjęcia na <canvas> (dłuższy bok ok. 1280 px), opcjonalnie skala szarości i kontrast
      ↓
OCR w Web Workerze (interfejs nie zamarza); modele ładowane dopiero przy pierwszym użyciu
      ↓
tekst → normalizacja → tokeny (słowa, 4-cyfrowe roczniki, ciągi przypominające numer partii)
      ↓
dopasowanie do indeksu win (ta sama funkcja co w wyszukiwaniu tekstowym, inne wagi)
      ↓
top 3 z pewnością dopasowania → użytkownik wybiera → karta wina
      ↓ (słabe dopasowanie)
odczytany tekst wpisany w pole wyszukiwania, żeby użytkownik mógł go poprawić
```

### 6.1 Aparat
- Używamy `<input type="file" accept="image/*" capture="environment">`, a **nie** `getUserMedia`. Ten sposób działa na iOS i Androidzie, nie wymaga własnego podglądu kamery, a użytkownik może też wybrać zdjęcie z galerii.
- GitHub Pages działa po HTTPS, więc aparat jest dostępny.

### 6.2 Ładowanie modeli i tryb offline
- Biblioteki i modele OCR **nie** trafiają do `FILES` w `site/sw.js`, bo każdy dostałby wtedy kilka–kilkanaście MB przy pierwszym wejściu. Pobieramy je przy pierwszym dotknięciu przycisku, z komunikatem „Pobieram moduł rozpoznawania (ok. X MB), tylko za pierwszym razem”.
- Service Worker zapisuje je w pamięci przy pierwszym pobraniu, tak jak dziś robi ze zdjęciami butelek. Potem funkcja działa offline.
- Pliki trzymamy w `site/vendor/ocr/`, a nie na CDN, żeby nie zależeć od zewnętrznej usługi i żeby SW mógł je cache'ować z tego samego źródła.

### 6.3 Ograniczenie GitHub Pages: brak wielowątkowości
ONNX Runtime Web i Tesseract.js działają szybciej na kilku wątkach, ale to wymaga `SharedArrayBuffer`, a więc nagłówków COOP/COEP. **GitHub Pages nie pozwala ustawić własnych nagłówków.** Możliwości:
- WASM na jednym wątku: wolniej, ale prosto (domyślnie),
- WebGPU, gdzie przeglądarka go ma (ONNX Runtime Web): do sprawdzenia w fazie 2,
- obejście przez Service Worker, który dokleja nagłówki (np. `coi-serviceworker`): kłóci się z naszym `sw.js` i jest kruche. Nie polecam.

### 6.4 Dopasowanie OCR do listy win
Indeks budowany skryptem `tools/build-wine-index.py`, który zapisuje `site/js/wine-index.js`. Każdy rekord to: `id`, źródło (`site` / `salon-RRRR`), producent, nazwa, rocznik, kategoria, gmina, parcela, partia, medal i punkty. Szacunkowo 1072 + 56 rekordów, ok. 200–250 KB przed kompresją. Wina ze strony, które mają kartę w Salonie, łączymy w jeden rekord według zasad z `docs/Salon-vin-2024-2026-wina-ze-strony.md`.

Wyszukiwanie to `engine.search(ocrText, { combineWith: 'OR', boost: … })` z modułu `wine-search.js`. Wagi pól (`boost`) i jedna poprawka po wyszukiwaniu (kara za inny rocznik) mają dać w przybliżeniu taką punktację:

| Trafienie | Waga (wartości startowe, do strojenia w fazie 2) |
|---|---|
| numer partii (dokładnie, po usunięciu spacji, `/` i `-`) | +10 |
| producent (słowo kluczowe nazwy, z tolerancją literówek) | +5 |
| rocznik | +3, a **−3** gdy OCR odczytał inny rocznik |
| odmiana | +3 |
| parcela lub gmina | +2 |
| kategoria | +1 |

Wynik pokazujemy jako „pewne” (jeden kandydat wyraźnie prowadzi), „prawdopodobne” (top 3) albo „nie rozpoznano” (powrót do pola tekstowego z odczytanym tekstem).

### 6.5 Wina spoza naszej listy
Gdy dopasowanie jest słabe, komunikat brzmi: „Tego wina nie ma w naszej bazie (56 win ze strony i medaliści Salonu vín 2024–2026). Odczytany tekst: …”. Nie zgadujemy na siłę.

### 6.6 Wersja GAS
W Google Apps Script modele nie zmieszczą się sensownie w jednym pliku HTML, a tryb offline nie działa. **W wersji GAS przycisk zdjęcia jest ukryty** (`window.__GAS__`). Wyszukiwanie tekstowe i wariant A działają w obu wersjach.

## 7. Zmiany w plikach

| Plik | Zmiana |
|---|---|
| `tools/build-wine-index.py` (nowy) | indeks win ze strony i z Salonu → `site/js/wine-index.js` |
| `site/js/wine-search.js` | powstaje w spec wyszukiwania tekstowego; tu używany w trybie OR z wagami z punktu 6.4 |
| `site/js/wine-photo.js` (nowy) | aparat, obróbka obrazu, Web Worker z OCR, prezentacja top 3 |
| `site/vendor/ocr/` (nowy) | biblioteka OCR i modele (wersje zapisane w README katalogu) |
| `site/js/app.js` | pole „Znajdź wino” w `renderWine()`, karta dla wina tylko z Salonu (bez zdjęcia i polskiego opisu) |
| `site/css/style.css` | pole wyszukiwania, lista podpowiedzi, wynik zdjęcia |
| `site/index.html` | nowe skrypty |
| `site/sw.js` | nowe pliki w `FILES`, podbicie `VERSION`, cache modeli przy pierwszym użyciu |
| `tools/build-gas.mjs` | wklejenie `wine-index.js` i `wine-search.js`; pominięcie `wine-photo.js` i `vendor/ocr/` |

## 8. Fazy i nakład pracy

| Faza | Zakres | Nakład | Kiedy |
|---|---|---|---|
| **1** | Wyszukiwanie tekstowe z podpowiedziami + indeks z Salonem + instrukcja wariantu A | ok. 1 dzień | przed wyjazdem albo w trakcie |
| **2** | Test porównawczy B i C: zestaw ok. 30 zdjęć etykiet, pomiar trafności top 1 i top 3, czasu i rozmiaru pobrania na iPhonie i Androidzie | 0,5–1 dnia + zdjęcia | **zdjęcia zrobić na wyjeździe**, test po powrocie |
| **3** | Wdrożenie zwycięzcy: Worker, ładowanie na żądanie, cache, interfejs top 3 | 1–2 dni | po fazie 2 |
| **4** | Strojenie wag i obróbki obrazu na podstawie błędów z fazy 2 | 0,5 dnia | po fazie 3 |

Trudność: faza 1 to **2 na 5**, fazy 2–4 razem to **3–4 na 5**. Ryzyko leży głównie w jakości OCR na prawdziwych etykietach, a nie w kodzie.

**Zestaw testowy (do zrobienia na wyjeździe, 11–15 XI):** zdjęcia przodu i tyłu etykiet win, które spotkamy w Enotéce, sklepach i piwnicach, robione zwykłym telefonem w realnym świetle. Zapisujemy je w `specs/wyszukiwanie-po-zdjeciu/testy/` z nazwą pliku = `id` wina (albo `poza-baza-N.jpg`). To najcenniejsza rzecz, której nie da się zrobić później.

## 9. Kryteria akceptacji

- Na zestawie testowym właściwe wino jest **w top 3 w co najmniej 80% zdjęć** i **na 1. miejscu w co najmniej 60%** (cel startowy, do korekty po fazie 2).
- Dla win spoza bazy w co najmniej 90% przypadków nie pokazujemy wyniku „pewne”.
- Na średnim telefonie (iPhone z ostatnich 4 lat, Android ze średniej półki) czas od zrobienia zdjęcia do wyniku jest **poniżej 6 s**, gdy modele są już w pamięci.
- Po pierwszym użyciu funkcja działa w trybie samolotowym.
- Działa w Safari na iOS i w Chrome na Androidzie. W wersji GAS przycisku zdjęcia nie ma.
- Zdjęcie nie jest nigdzie wysyłane (sprawdzone w zakładce Network).

## 10. Ryzyka

| Ryzyko | Skutek | Co robimy |
|---|---|---|
| Ozdobne fonty, pismo odręczne, sam logotyp | OCR nie przeczyta producenta | waga partii i rocznika z tylnej etykiety; podpowiedź „zrób zdjęcie tylnej etykiety” |
| Zaokrąglona butelka, odblaski, słabe światło w piwnicy | gorszy odczyt | obróbka obrazu, podpowiedź „przybliż i unikaj lampy błyskowej”; wariant A jako zapas |
| Rozmiar modeli | długie pierwsze pobranie | pobieranie na żądanie z informacją o rozmiarze; pomiar w fazie 2 |
| Brak wielowątkowości na GitHub Pages | wolniejsze rozpoznawanie | pomiar w fazie 2; WebGPU, gdzie jest dostępne |
| Młody pakiet PaddleOCR (od IV 2026) | zmiany API, błędy | przypięta wersja w `site/vendor/ocr/`, bez CDN |
| Dane Salonu po czesku, bez zdjęć dla większości win | uboższa karta dla win spoza strony | prosta karta: dane z Salonu + link do źródła |

## 11. Decyzje do podjęcia

1. Czy w wynikach pokazujemy wszystkie 1072 wina z Salonu, czy tylko złote (300), albo tylko z Moraw południowych / podobszaru znojemskiego?
2. Jak wygląda karta wina tylko z Salonu (bez zdjęcia i polskiego opisu)?
3. Czy robimy zdjęcia testowe na wyjeździe (punkt 8)? Bez nich faza 2 nie ma sensu.
4. Czy wariant F (chmurowe AI przez GAS) dopuszczamy jako ostatnią deskę ratunku, czy wykluczamy z zasady (koszt, prywatność)?

## Źródła

- [PaddleOCR: wdrożenie w przeglądarce](https://www.paddleocr.ai/v3.5.0/en/version3.x/deployment/browser.html)
- [`@paddleocr/paddleocr-js` na DepScope](https://depscope.dev/pkg/npm/@paddleocr/paddleocr-js) (pierwsza publikacja 2 IV 2026)
- [ppu-paddle-ocr](https://github.com/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr): alternatywny port PaddleOCR (Node, Bun, Deno, przeglądarka)
- [Tesseract.js](https://github.com/naptha/tesseract.js) i [informacja o wydaniu 7.0.0](https://newreleases.io/project/npm/tesseract.js/release/7.0.0)
- Dane win: [docs/salon-vin/README.md](../../docs/salon-vin/README.md), [docs/Salon-vin-2024-2026-wina-ze-strony.md](../../docs/Salon-vin-2024-2026-wina-ze-strony.md), `site/js/wines.js`
