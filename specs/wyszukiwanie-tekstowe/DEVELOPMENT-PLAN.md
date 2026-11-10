# Wyszukiwanie wina z podpowiedziami, odporne na literówki: plan

Stan na 11 XI 2026. Spec po czterech rundach review (punkt 14), decyzje z punktu 13 podjęte. **Fazy 1 i 2 są zaimplementowane lokalnie** i czekają na przegląd przed publikacją (punkt 15).

Ten spec jest warunkiem dla [wyszukiwania po zdjęciu](../wyszukiwanie-po-zdjeciu/DEVELOPMENT-PLAN.md). Tekst odczytany ze zdjęcia trafia do tej samej funkcji wyszukiwania (punkt 5.8).

## 1. Cel

Na początku zakładki **Wino** jest pole **Znajdź wino**. Użytkownik wpisuje kilka liter, a pod polem od razu pojawiają się pasujące kategorie (region, odmiana, winiarnia) i wina z miniaturką butelki. Dotknięcie wina otwiera istniejące okno szczegółów.

Szukamy po:
- nazwie wina i odmianie („Ryzlink rýnský”, „Hibernal”, „Kambrium”),
- producencie („Špalek”, „Znovín”, „Piálek & Jäger”),
- regionie („Znojmo”, „Mikulov”, „Valtice”, „Velkopavlovicko”, „Slovácko”),
- miejscu: wsi i parceli („Šatov”, „Kraví hora”, „Šobes”, „Havraníky”),
- roczniku i stylu („2019”, „czerwone”, „musujące”),
- nazwach odmian z innych języków („riesling”, „grüner”, „pinot noir”).

Wymagania:
- działa offline, bez serwera. Jedyna biblioteka to MiniSearch (ok. 6 KB po kompresji), trzymana w repo (punkt 5.1),
- toleruje literówki, brak czeskich znaków i przestawione litery,
- wynik pojawia się przy każdym wpisanym znaku, bez zauważalnego opóźnienia,
- działa tak samo na GitHub Pages i w wersji GAS.

## 2. Zakres

| Faza | Zbiór win | Uwagi |
|---|---|---|
| **1** | **56 win ze strony** (`site/js/wines.js`), 25 winiarni | Pełne karty istnieją, więc wystarczy podpiąć wyniki pod `openSheet(id)`. Kategorie: region, odmiana, winiarnia |
| **2** | + **wina z Salonu vín 2024–2026** (`docs/salon-vin/*.json`): **wszystkie złote i srebrne z podobszaru znojemskiego**, czyli 417 win (300 złotych wpisów i 137 srebrnych, bez powtórzeń między latami); 15 z nich jest już na stronie, więc w wyszukiwarce dochodzi 402 | Skrypt budujący indeks, karta wina z Salonu (punkt 8), kategoria „miejsce” z danych strukturalnych (`village`, `vineyard`) |

Poza zakresem: wyszukiwanie w innych zakładkach (restauracje, spacery) i wyszukiwanie po smaku, które już robi „Dobierz wino”.

## 3. Wygląd

### 3.1 Miejsce na stronie
Pole jest **w karcie „Znojmo w kieliszku”** (`.wine-hero`), pod tekstem ze statystyką: białe pole na bordowym tle, pierwszy element zakładki, widoczny bez przewijania. Wyniki rozwijają się pod kartą i **przesuwają resztę treści w dół** (nie jest to warstwa nad treścią). Dzięki temu nie ma problemów z `z-index`, przyklejonym paskiem zakładek ani przewijaniem wewnątrz listy.

### 3.2 Stany

**Pusto** (pole bez tekstu): tylko pole z ikoną lupy i tekstem zastępczym „Wino, winiarnia, wieś…”. Żadnych podpowiedzi.

**1 znak:** pod polem szary tekst „Wpisz co najmniej 2 litery”. Jedna litera daje przypadkowe trafienia, np. „z” trafia w słowo „z” w nazwie „Pozdravy z Národního parku”.

**Od 2 znaków: lista podpowiedzi** z dwiema częściami: kategorie, a pod nimi wina.

```
┌ Znojmo w kieliszku ───────────────────────────┐
│ Top 14 ze Znojemska i reszty Moraw · …        │
│ ┌───────────────────────────────────────────┐ │
│ │ (lupa)  ryzlink                      (✕)  │ │
│ └───────────────────────────────────────────┘ │
└───────────────────────────────────────────────┘
┌───────────────────────────────────────────────┐
│ (W) Odmiana: Ryzlink rýnský (Riesling)   10 › │
│ (W) Odmiana: Ryzlink vlašský              2 › │
├───────────────────────────────────────────────┤
│ ▯ ŠPALEK                                      │
│ ▯ Ryzlink rýnský Velký Sud BIO 2023    330 Kč │
├───────────────────────────────────────────────┤
│ ▯ VINICE HNANICE                              │
│ ▯ Ryzlink rýnský VOC 2025              199 Kč │
├───────────────────────────────────────────────┤
│ ▯ ZNOVÍN ZNOJMO                               │
│ ▯ Ryzlink rýnský Šobes 2025            280 Kč │
└───────────────────────────────────────────────┘
            Pokaż wszystkie wina (12)
```

```
┌───────────────────────────────────────────────┐
│ (P) Region: Znojmo i okolice             47 › │
│ (D) Winiarnia: Znovín Znojmo              5 › │
├───────────────────────────────────────────────┤
│ ▯ wina…                                       │
```

Legenda: (W) ikona kieliszka (`wine`), (P) pinezka (`pin`), (D) dom (nowa ikona `house`), ▯ miniatura butelki.

**Lista wyników** (po dotknięciu kategorii albo „Pokaż wszystkie wina”): lista podpowiedzi znika, a pod kartą pojawia się nagłówek z filtrem, np. „Odmiana: Ryzlink rýnský · 10 win (✕)”, i siatka kafelków `.wtiles`, takich samych jak w „Dobierz wino”. Przycisk ✕ w nagłówku **czyści całe wyszukiwanie** (pole i wyniki), tak samo jak ✕ w polu. Żeby zawęzić wyniki, wystarczy dotknąć pola i dopisać słowo.

**Brak wyników:** „Nic nie znaleziono. Spróbuj nazwy winiarni, wsi albo odmiany”. Pod spodem, jeśli istnieją, najwyżej 3 wina z luźniejszym dopasowaniem pod nagłówkiem „Czy chodziło o:” (punkt 5.6).

### 3.3 Elementy listy podpowiedzi

| Element | Wygląd |
|---|---|
| Wiersz kategorii | wysokość 44 px, ikona z zestawu strony (`icon()`), typ szarym tekstem („Odmiana:”), nazwa pogrubiona, liczba win i strzałka `›` po prawej. Region ma kropkę w swoim kolorze (`.region--znojmo` itd.) |
| Wiersz wina | wysokość 56 px, miniatura butelki 32×52 px (`bottleImg`), w pierwszej linii producent (12 px, wersaliki, jak `.wtile__prod`), w drugiej nazwa i rocznik (15 px, pogrubione) i cena po prawej |
| Dopasowany fragment | `<mark>` bez żółtego tła: pogrubienie w kolorze wina (`font-weight: 800; background: none; color: var(--wine-800)`). Samo pogrubienie ginęło, bo nazwy win już są pogrubione |
| „Pokaż wszystkie wina (N)” | przycisk tekstowy na całą szerokość, 44 px |

Ikony: lupa i dom to dwie nowe ikony w stylu istniejących (`ICONS` w `app.js`, linia 1,8 px). Dla odmiany używamy `wine`, dla regionu i miejsca `pin`. **Bez emoji.**

### 3.4 Ile się mieści (telefon z otwartą klawiaturą)
Na iPhonie SE (667 px wysokości) po otwarciu klawiatury zostaje ok. 300 px pod polem. Dlatego:
- **telefon** (szerokość poniżej 900 px): najwyżej **2 kategorie i 3 wina**, czyli 2 × 44 + 3 × 56 + 44 = 300 px,
- **komputer:** najwyżej 3 kategorie i 5 win.

Po wejściu w pole strona przewija się tak, żeby pole było na górze ekranu (`scrollToEl`, z uwzględnieniem przyklejonego paska na komputerze).

### 3.5 Pasek zakładek na telefonie
Pasek zakładek na telefonie jest przyklejony do dołu (`position: fixed`). Na Androidzie przy otwartej klawiaturze unosi się nad nią i zabiera 64 px z miejsca na podpowiedzi. **Gdy pole ma fokus, pasek jest ukryty** (klasa `is-searching` na `<body>`, tylko poniżej 900 px).

Klasę dodajemy na `focus` pola, a zdejmujemy **z opóźnieniem ok. 300 ms po `blur`**, i tylko wtedy, gdy fokus nie wrócił do pola. Dzięki temu pasek nie wskakuje z powrotem w trakcie dotknięcia wiersza. Inaczej układ skoczyłby pod palcem, a klawiatura chowa się w tym samym momencie.

## 4. Zachowanie

| Zdarzenie | Reakcja |
|---|---|
| wpisanie znaku | nowe podpowiedzi przy każdym znaku, bez opóźniania (zapytanie trwa poniżej 1 ms) |
| dotknięcie wina | otwiera okno szczegółów (`openSheet`). Lista podpowiedzi zostaje, a tekst w polu się nie zmienia. Po zamknięciu okna fokus wraca na dotknięty wiersz (robi to natywny `<dialog>`, o ile lista nie zostanie w tym czasie przerysowana) |
| dotknięcie kategorii lub „Pokaż wszystkie” | lista wyników (punkt 3.2), klawiatura się chowa (`blur`) |
| dotknięcie poza polem i listą | lista podpowiedzi się zwija, tekst zostaje. Ponowne wejście w pole ją rozwija. **Zwijamy na `pointerdown` poza kontenerem wyszukiwania (pole + lista), a nie na `blur` pola.** Przy dotknięciu wiersza pole traci fokus jeszcze przed kliknięciem: zwijanie na `blur` usunęłoby wiersz spod palca, a Safari na iOS nie przenosi fokusu na przycisk, więc `relatedTarget` nic nie mówi |
| ✕ w polu | czyści pole, listę i wyniki, fokus zostaje w polu |
| Escape | pierwszy raz zwija listę, drugi czyści pole. Gdy otwarte jest okno wina, Escape zamyka tylko okno |
| strzałki góra/dół (komputer) | przesuwają zaznaczenie po wierszach kategorii i win. Enter otwiera zaznaczony wiersz |
| Enter bez zaznaczenia | otwiera listę wszystkich wyników |
| wklejenie tekstu | jak wpisanie. Znaki nowej linii zamieniamy na spacje. Pole ma `maxlength="80"`. Limit dotyczy tylko pola: moduł zdjęć woła wyszukiwanie bezpośrednio, z dowolnie długim tekstem z OCR (punkt 5.8) |
| przejście do innej zakładki i powrót | stan zostaje, bo panel Wino jest renderowany tylko raz |

**Telefon:** `type="search"`, `enterkeyhint="search"`, `autocomplete="off"`, `autocorrect="off"`, `autocapitalize="off"`, `spellcheck="false"`, tekst co najmniej 16 px. Mniejszy tekst powoduje, że Safari na iPhonie powiększa stronę przy wejściu w pole.

**Dostępność:** wzorzec ARIA combobox: pole z `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` i ukrytą etykietą „Znajdź wino”, a lista z `role="listbox"` i wierszami kategorii i win jako `role="option"`. „Pokaż wszystkie wina” to zwykły przycisk **pod** listą, poza `listbox`, dostępny klawiszem Tab. Liczba wyników jest ogłaszana przez `aria-live="polite"` z opóźnieniem 500 ms, żeby czytnik nie mówił przy każdej literze. Cele dotyku mają co najmniej 44 px.

## 5. Dopasowanie

### 5.1 Silnik: MiniSearch + nasza warstwa (sprawdzone 10 XI)

Porównanie trzech bibliotek na 56 winach ze strony, z tą samą normalizacją, synonimami i aliasami:

| | [MiniSearch](https://github.com/lucaong/minisearch) 7.2.0 | [Fuse.js](https://github.com/krisk/Fuse) 7.5.0 | [uFuzzy](https://github.com/leeoniya/uFuzzy) 1.0.19 |
|---|---|---|---|
| Rozmiar (zminifikowany, gzip) | ok. 5,8 KB | ok. 9,1 KB | ok. 4,0 KB |
| Licencja | MIT | Apache-2.0 | MIT |
| Działa jako zwykły `<script>` bez budowania | tak (UMD, `window.MiniSearch`) | **nie** (od v7 tylko CJS i ESM) | tak (IIFE) |
| Wagi pól | tak | tak | nie (jeden tekst) |
| Kilka słów naraz (AND) z literówką w każdym | tak: `znovim sauvignon` → 1 trafne | **nie**: 0 wyników | **nie**: 0 wyników |
| Szum przy krótkich i podobnych słowach | mały: `vin` → 20, `spalek` → 3 | duży: `vin` → 56 (wszystko), `spalek` → 8 (m.in. Štěpánek) | średni: `vin` → 33 |

**Wybór: MiniSearch.** Daje indeks z wagami pól (`boost`), wyszukiwanie po początkach słów (`prefix`), literówki zależne od długości słowa (`fuzzy` jako funkcja), tryb AND i ranking BM25. Polska i czeska specyfika zostaje po naszej stronie jako cienka warstwa (punkty 5.2–5.7).

**Czy łączyć kilka bibliotek?** Nie. Fuse.js i uFuzzy nie znalazły niczego, czego nie znalazł MiniSearch, za to dodawały szum. Dwa silniki to dwa zestawy wag do strojenia i wyniki w różnych skalach. Lepsze wyniki daje łączenie **technik** wokół jednego silnika. Dobrze łączy się natomiast wyszukiwanie z OCR ([spec zdjęć](../wyszukiwanie-po-zdjeciu/DEVELOPMENT-PLAN.md)).

**Czeskie znaki: MiniSearch wymaga własnej normalizacji (wariant C).** Bez ustawień MiniSearch zmienia tylko wielkość liter. Test na 56 winach:

| Zapytanie | A: bez ustawień | B: + literówki | **C: + normalizacja (5.2)** |
|---|---|---|---|
| `Špalek` | 3 | 3 | 3 |
| `spalek` | **0** | 3 | 3 |
| `kravi` | **0** | 3 | 3 |
| `rynsky` (zamiast „rýnský”) | 0 | **0** | **10** |
| `rizling` | 0 | 12 | 12 |
| `spalke` (przestawione litery) | 0 | 0 | 0, a z obejściem z 5.6: 3 |

W wariancie B „spalek” działa tylko przypadkiem: brak háčka zużywa limit literówek. Przy dwóch czeskich znakach w krótkim słowie limit się kończy. **Obowiązuje wariant C.**

**Plik biblioteki:** paczka npm ma tylko niezminifikowany UMD (`dist/umd/index.js`, 86 KB, 19 KB po gzip). Minifikujemy go raz (`npx terser dist/umd/index.js -c -m -o minisearch.min.js`, ok. 5,8 KB po gzip) i zapisujemy w `site/vendor/minisearch/` razem z `LICENSE.txt` i `README.md` (wersja, data, polecenie). Bez CDN, żeby działało offline.

### 5.2 Normalizacja (indeks i zapytanie, ta sama funkcja)
1. małe litery,
2. usunięcie znaków diakrytycznych: `normalize('NFD')` i usunięcie znaków łączących `/\p{M}/gu` (`Špalek` → `spalek`, `Kraví` → `kravi`),
3. `ß` → `ss`, `²` → `2`,
4. **ujednolicenie pisowni**: `y` → `i`, `w` → `v`. „rizling” trafia wtedy w „ryzlink” po jednej zmianie, a „weltliner” i „veltliner” to to samo,
5. podział na słowa po każdym znaku spoza `a–z` i `0–9`, więc `&`, `·`, `/` i myślniki rozdzielają słowa.

**Tylko w zapytaniu**, przed wyszukiwaniem:
- znaki nowej linii → spacje,
- usunięcie polskich słów pomocniczych `z`, `ze`, `w`, `we`, `i`, `a`, `o`, `na`, `do`, `od`, `u`, **jeśli w zapytaniu jest też inne słowo**. Bez tego „ze znojma” dawało tylko 11 win, bo „ze” trafiało w początek „zelené”.

```js
function norm(s) {
  return String(s).toLowerCase()
    .normalize('NFD').replace(/\p{M}/gu, '')        // Špalek → spalek, rýnský → rynsky
    .replace(/ß/g, 'ss').replace(/²/g, '2')
    .replace(/y/g, 'i').replace(/w/g, 'v');          // ryzlink → rizlink, weltliner → veltliner
}
function tokenize(s) { return norm(s).split(/[^a-z0-9]+/).filter(Boolean); }
```

### 5.3 Indeks win

| Pole | Faza 1 (strona) | Faza 2 (Salon) | `boost` |
|---|---|---|---|
| `compact`: nazwa bez spacji („petnat”, „velkysud”) | z `w.name` | z `wine_label` | 3 |
| `name`: nazwa wina | `w.name` | `wine_label`, `wine` | 3 |
| `prod`: producent + nazwa bez spacji | `producers[p].name` | `producer`, `producer_raw` | 4 |
| `grape`: odmiana i jej synonimy | **`w.grape`** (punkt 5.4) + słownik synonimów | odmiana z `wine_label` + synonimy | 2 |
| `origin`: miejsce wina | `w.origin` | `village`, `vineyard` | 2 |
| `place`: siedziba producenta | `producers[p].place` | `producer_town` | 1 |
| `region` + aliasy | `w.region`, a jeśli go nie ma, `producers[p].region` i `label`; + aliasy (5.5) | `subregion` + aliasy | 1 |
| `meta`: rocznik, styl, kategoria, partia | `year`, `style` | `vintage`, `quality`, kolor z `category`, `batch` | 1 |

Uwagi:
- **`w.region` ma pierwszeństwo przed regionem producenta.** DAVINUS Sommelier jest spod Pálavy (`Mikulov`), choć producent ma `Znojmo`. Bez tego „mikulov” gubił to wino.
- **`place` ma niższą wagę niż `origin`**, bo to polski opis siedziby („odbiór także Šatov 513”, „uliczka piwnic”). Wino z parceli w Šatovie ma stać wyżej niż wino producenta, który tylko ma tam punkt odbioru.
- **`prod` ma wagę 4, a nie 3.** BM25 premiuje krótkie pola, więc przy wadze 3 krótkie `origin: "Hnanice"` Kořínka wyprzedzało producenta Vinice Hnanice dla zapytania „hna”. Waga 4 przywraca kolejność, a `origin` z wagą 2 dalej trafia w parcele („kravi”, „sobes”). Sprawdzone na wszystkich testach z punktu 7.1.

```js
var wines = new MiniSearch({
  fields: ['compact', 'name', 'prod', 'grape', 'origin', 'place', 'region', 'meta'],
  storeFields: ['id', 'rank'],
  tokenize: tokenize,
  processTerm: function (t) { return norm(t) || null; },
  searchOptions: {
    boost: { compact: 3, name: 3, prod: 4, grape: 2, origin: 2 },
    prefix: function (t) { return t.length >= 2; },
    fuzzy: function (t) { return /^\d+$/.test(t) || t.length <= 3 ? false : (t.length <= 6 ? 1 : 2); },
    combineWith: 'AND'
  }
});
```

**Kolejność wyników („najlepsze najpierw”, decyzja z 11 XI):**
1. wina ze strony (nasz przewodnik) przed winami tylko z Salonu,
2. poziom dopasowania: dokładne słowo > początek słowa > literówka (najsłabsze ze słów zapytania),
3. jakość wina: Salon vín przed konkursem regionalnym, a w obrębie konkursu wyższe punkty wyżej (ta sama zasada co w Top 14 na stronie: „najpierw złote wina krajowego Salonu vín, potem medale konkursu regionalnego”),
4. wynik BM25 z MiniSearch, a na końcu kolejność na stronie (Top 14, katalog, reszta).

Sam BM25 premiował krótkie nazwy: „ryzlink” stawiało na górze Červinkę, a „znojmo” wina Znovínu tylko dlatego, że mają „Znojmo” w nazwie. Moduł zdjęć wyłącza punkty 1–3 (`groupSite: false`), bo tam liczy się wyłącznie dopasowanie.

**Lista wyników** (kategoria albo „Pokaż wszystkie”) jest zawsze sortowana od najlepszych (punkt 3 powyżej), w dwóch grupach: „Z naszego przewodnika” i „Z Salonu vín 2024–2026”, **po 20 win** z przyciskiem „Pokaż kolejne 20 (z N)”.

**Próg literówek** zależy od długości słowa zapytania: 1–3 litery: 0, 4–6 liter: 1, od 7 liter: 2. Liczb (rocznik, partia) nie traktujemy jak literówek: „2019” nie może trafiać w „2018”.

### 5.4 Odmiana jako jawne pole `grape` w `wines.js`
Kategorie odmian budowane z samych nazw win gubią wina, których nazwa nie zawiera odmiany:

| Wino | Nazwa | Odmiana (ze źródeł na stronie) |
|---|---|---|
| `halkoci-typik-2025` | Ryzlink TYPIK | Ryzlink rýnský („Wytrawny Riesling”) |
| `halkoci-vz2-2024` | Veltlín² | Veltlínské zelené („Wytrawny Grüner”) |
| `halkoci-supa-2025` | SUPA · suchá Pálava | Pálava |

Dlatego każde wino w `wines.js` dostaje pole `grape` z czeską nazwą odmiany, zgodną ze słownikiem synonimów, albo `grape: null` dla kupaży (Trio, Kambrium, Gryllus, Cuvée Rajská, Crème de Kambrium). Wartość bierzemy wyłącznie z opisów, które już są na stronie i w `docs/`. Gdy pola nie ma, odmianę wyznaczamy z nazwy wina (najdłuższa pasująca nazwa ze słownika). Test danych (punkt 7.2) pilnuje, żeby każde wino miało odmianę albo jawne `null`.

**Słownik synonimów** (tylko odpowiedniki, które są już w źródłach: ściąga odmian w `data.js` i opisy w `wines.js`):

| Odmiana (czeska nazwa) | Synonimy |
|---|---|
| Veltlínské zelené | Grüner Veltliner, Grüner, GV |
| Veltlínské červené rané | Frühroter Veltliner, Večerka |
| Ryzlink rýnský | Riesling |
| Ryzlink vlašský | Welschriesling |
| Rulandské modré | Pinot Noir |
| Frankovka | Blaufränkisch |
| Neuburské | Neuburger |
| Zweigeltrebe | Zweigelt |
| Tramín červený | Traminer |
| Sylvánské zelené | Silvaner |
| Sauvignon | Sauvignon Blanc |
| Chardonnay, Merlot, Pálava, Hibernal, Veritas, Rotgipfler, Muškát moravský | (bez synonimów) |

W fazie 2 słownik uzupełnia się z danych: `wine_label` z Salonu ma nazwę czeską i międzynarodową („Veltlínské zelené Grüner Veltliner”).

### 5.5 Aliasy regionów

| Region w danych | Aliasy w indeksie | Nazwa kategorii |
|---|---|---|
| Znojmo | Znojemsko, Znojemská | Region: Znojmo i okolice |
| Mikulov | Mikulovská, Pálava | Region: Mikulov i Pálava |
| Pavlovice | Velkopavlovicko, Velkopavlovická | Region: Velkopavlovicko |
| Slovacko | Slovácko, Slovácká | Region: Slovácko |
| Valtice | Valticko | Region: Valtice |

Polska odmiana („ze Znojma”, „z Mikulova”) działa dzięki tolerancji jednej literówki i usuwaniu słów pomocniczych. „Okolice” Znojma to wszystkie wina z regionem Znojmo, czyli także te z Šatova, Hnanic, Havraníků, Nového Šaldorfu i Vrbovca. Test danych pilnuje, żeby każdy region z `wines.js` miał wpis w tej tabeli.

### 5.6 Kolejne próby, gdy nic nie pasuje
1. **Zwykłe wyszukiwanie** (AND, progi z 5.3).
2. **Przestawione litery.** MiniSearch liczy przestawienie dwóch sąsiednich liter jako 2 błędy. Słowa od 7 liter się mieszczą („veltlinkse” działa), krótsze nie. Dla każdego słowa z 4–6 liter tworzymy warianty z zamienioną parą sąsiednich liter („spalke” → … → „spalek”, najwyżej 5 wariantów), szukamy każdego i bierzemy wariant z najlepszym wynikiem. Pokazujemy go jako **zwykłe trafienia**.
3. **„Czy chodziło o”**: tryb OR (wystarczy jedno słowo) i progi o 1 wyższe (od 3 liter 1 błąd, od 6 liter 2 błędy). Najwyżej 3 wina pod nagłówkiem „Czy chodziło o:”.
4. **Nic**: komunikat z punktu 3.2.

Kroki 2–3 uruchamiają się tylko przy pustym wyniku: najwyżej kilkanaście dodatkowych wyszukiwań, czyli ułamek milisekundy.

### 5.7 Kategorie
Drugi, mały indeks MiniSearch z tą samą normalizacją:
- **region:** 5 regionów z aliasami,
- **odmiana:** odmiany ze słownika z punktu 5.4 i ich synonimy,
- **winiarnia:** 25 producentów ze strony (w fazie 2: 200),
- **miejsce (tylko faza 2):** gminy i parcele z pól `village` i `vineyard` Salonu. W fazie 1 miejsca są tylko polem wyszukiwania, bo `origin` i `place` to swobodny tekst.

Kategoria pojawia się tylko, **jeśli ma co najmniej 2 wina**. Jedno wino i tak jest na liście poniżej.

**Kolejność kategorii.** Wynik BM25 nie nadaje się do porównywania kategorii między sobą: „znojmo” stawiało „Winiarnia: Znovín Znojmo” przed „Region: Znojmo”. Sortujemy więc według:
1. poziomu dopasowania: dokładne słowo > początek słowa > literówka (najsłabsze ze słów zapytania),
2. typu: region, odmiana, winiarnia, miejsce,
3. liczby win, malejąco.

### 5.8 Interfejs modułu `wine-search.js`
Moduł nie dotyka DOM ani `location`, więc działa w `app.js`, w testach i w module zdjęć.

```js
// dokumenty buduje adapter z danych strony (faza 1) i z WINE_INDEX (faza 2)
var docs = WineSearch.fromSite(window.WINES);            // [{ id, rank, name, prod, grape, origin, ... }]
var engine = WineSearch.create(docs, { categories: true });

engine.search('ze znojma', { limitWines: 3, limitCats: 2 });
// → { mode: 'normal' | 'przestawka' | 'czy-chodzilo' | 'brak' | 'za-krotkie',
//     query: 'znojma',                               // zapytanie po czyszczeniu
//     total: 47,                                     // liczba wszystkich pasujących win
//     wines: [{ id, score, terms }],                 // terms: dopasowane słowa (do <mark>)
//     cats:  [{ id: 'region:Znojmo', type: 'region', label: 'Znojmo i okolice', ids: [...] }] }

engine.category('odmiana:Ryzlink rýnský');               // → [id, ...] do listy wyników

// moduł zdjęć: długi tekst z OCR, z błędami i obcymi słowami
engine.search(ocrText, { combineWith: 'OR', boost: { meta: 4, prod: 4, name: 3 }, categories: false, fallbacks: false });
```

Opcje wywołania nadpisują ustawienia domyślne. Tekst z OCR zawiera wiele słów, które nie pasują do żadnego wina (adres, „víno”, „alk. 12,5 % obj.”), więc tryb AND by go odrzucił. Dlatego moduł zdjęć używa trybu OR i wyższej wagi pola `meta`, w którym jest numer partii. Kolejne próby z punktu 5.6 i kategorie są wtedy wyłączone. Sprawdzone w prototypie na trzech sztucznych tekstach z etykiet, z literówkami, adresem i zawartością alkoholu: właściwe wino było za każdym razem na 1. miejscu, z wynikiem 2–6 razy wyższym niż drugie (np. „VINICE HNANICE Ryzlink rynsky VOC ZNOJMO 2025 such6 vino sarze 3394/25 alk. 12 % obj.” → `hnanice-rr-2025`). Prawdziwe zdjęcia sprawdzi faza 2 spec zdjęć.

**Podświetlanie (`<mark>`):** `terms` to słowa po normalizacji („rizlink”). Żeby pogrubić je w wyświetlanym tekście, normalizujemy każde słowo nazwy i producenta tą samą funkcją `norm` i porównujemy z `terms` (dokładnie albo po początku). Tekst przed wstawieniem `<mark>` jest escapowany (`&` w „Piálek & Jäger”).

## 6. Wydajność (zmierzone 11 XI na gotowym kodzie)

| | Faza 1 (56 win) | Faza 2 (1072 wina z Salonu) |
|---|---|---|
| Dane | już w `wines.js` | `wine-index.js`: 417 win, 266 KB, **65 KB po gzip** (większość to czeskie opisy z katalogu do karty wina) |
| Budowa indeksu | 7 ms | ok. 130 ms na laptopie, w porcjach po 40 dokumentów (`addAllAsync`), więc strona nie zamarza |
| Zapytanie (pisanie litera po literze, 68 zapytań w `testy.js`) | poniżej 0,1 ms | średnio 0,5 ms, najgorsze 3 ms na laptopie |

Wnioski:
- **Faza 1:** indeks budujemy przy pierwszym wejściu w pole, nie przy starcie strony.
- **Faza 2:** `wine-index.js` **dociągamy dopiero przy pierwszym wejściu w pole** (dynamiczny `<script>`), a indeks budujemy w `requestIdleCallback` (z `setTimeout` jako zapasem). Do czasu załadowania szukamy tylko w winach ze strony. W wersji GAS plik jest wklejony w HTML, więc ładowanie odpada, ale budowa indeksu i tak dzieje się przy pierwszym fokusie.
- **Faza 2: dużo wyników.** „ryzlink” zwraca 96 win (12 ze strony), „znojmo” 214. Dlatego lista wyników ma dwie grupy, sortowanie od najlepszych i stronicowanie po 20.

## 7. Testy

### 7.1 Testy wyszukiwania (zaproponowane przypadki)
Oczekiwania podajemy **po identyfikatorach win**: musi być (`ma`), nie może być (`nie ma`), pierwszy wynik. Liczby to stan danych z 10 XI (56 win). Po zmianie `wines.js` trzeba je zaktualizować, ale identyfikatory zwykle zostają.

Wszystkie przypadki przeszły w prototypie zbudowanym dokładnie według tego spec (MiniSearch 7.2.0, 39/39).

**Przypadki zaproponowane w rozmowie z 10 XI:**

| Zapytanie | Oczekiwany wynik | Co sprawdza |
|---|---|---|
| `Špalek`, `spalek`, `SPÁLEK` | 3 wina Špalka: `spalek-velky-sud-2023`, `spalek-vz-2025`, `spalek-gryllus-2025`; **nie ma** `stepanek-sz-2023` | znaki diakrytyczne, wielkość liter |
| `spalke` | te same 3 wina, tryb `przestawka` (przez „spalek”) | przestawione litery w krótkim słowie |
| `rynsky` | **10** win „Ryzlink rýnský” (9 z nazwą + `halkoci-typik-2025` z polem `grape`); **nie ma** `waldberg-rv-2024`, `cervinka-rv-2022` | dwa czeskie znaki w krótkim słowie |
| `rizling` | 12 ryzlinków: rýnský i vlašský; kategorie „Ryzlink rýnský” i „Ryzlink vlašský” | `y`→`i` + literówka, rozdzielenie odmian |
| `kravi`, `kravi hora` | 3 wina Špalka z Kraví hory | miejsce, kilka słów |
| `sobes` | 2: `znovin-sobes-2025`, `znovin-sobes-2024` | słowo w środku nazwy |
| `petnat`, `pet nat` | 1: `korinek-petnat-2025` | słowa zlepione i rozdzielone |
| `2019` | 1: `dobra-qvevri-2019`; **nie ma** `bv-merlot-2018` | liczby bez literówek |
| `znovim sauvignon` | 1: `znovin-sb-2025` | literówka + AND |
| `vin` | najwyżej 25 win (dziś 20), nie cała lista | brak tolerancji przy krótkich słowach |

**Pozostałe przypadki:**

| Zapytanie | Oczekiwany wynik | Co sprawdza |
|---|---|---|
| `ryzlink` | 12 win; kategorie „Ryzlink rýnský (Riesling)” · 10 i „Ryzlink vlašský (Welschriesling)” · 2 | rozdzielenie odmian |
| `riesling` | ma `hnanice-rr-2025`, `halkoci-typik-2025`, `korinek-petnat-2025`; **nie ma** `waldberg-rv-2024`, `cervinka-rv-2022`; pierwsza kategoria: Ryzlink rýnský | synonim, brak pomyłki z vlašským |
| `gruner` | ma `hnanice-vz-2025`, `halkoci-vz2-2024`; **nie ma** `lahofer-vcr-2024`; kategoria: Veltlínské zelené | synonim, pole `grape` |
| `vetliner`, `veltlinkse` | ma `hnanice-vz-2025`; kategoria: Veltlínské zelené | literówka w synonimie, przestawka w długim słowie |
| `veltlin` | ma `halkoci-vz2-2024` i `hnanice-vz-2025` | początek słowa |
| `hna` | pierwszy: wino Vinice Hnanice; ma też `korinek-vz-2023` | początek słowa, waga producenta > miejsca |
| `satov` | ma `halkoci-typik-2025`, `znovin-sobes-2025` | miejsce |
| `czerwone` | ma `oulehla-fr-2022`, `thaya-zw-2023`, `bv-merlot-2018`; **nie ma** `hnanice-rr-2025` | styl |
| `musujace` | 2: `korinek-petnat-2025`, `dobra-creme-2022` | styl bez znaków diakrytycznych |
| `frankovka 2023` | ma `placek-fr-2023`, `kubik-fr-2023`, `oulehla-fr-2023`, `valtice-fr-2023`; **nie ma** `oulehla-fr-2022` | odmiana + rocznik |
| `pinot noir` | 1: `waldberg-rm-2021`; **bez** kategorii (tylko 1 wino) | synonim, próg 2 win dla kategorii |
| `zweigelt` | ma `thaya-zw-2023` | synonim przez początek słowa |
| `Piálek & Jäger` | ma `pialek-sb-2025`; kategoria: Winiarnia Piálek & Jäger | `&` i znaki diakrytyczne |
| `znovin` | 5 win; kategoria: Winiarnia Znovín Znojmo | winiarnia |
| `spalek ryzlink` | 1: `spalek-velky-sud-2023` | producent + odmiana |
| `mikulov` | 4: `davinus-sommelier-2022`, `gotberg-palava-2024`, `cervinka-rv-2022`, `bv-merlot-2018`; kategoria: Region Mikulov | `w.region` przed regionem producenta |
| `znojmo` | 47 win; **pierwsza** kategoria: Region Znojmo i okolice (przed Winiarnią Znovín Znojmo); **nie ma** `davinus-sommelier-2022` | region, kolejność kategorii |
| `ze znojma`, `znojemsko` | to samo co `znojmo` | słowo pomocnicze, polska odmiana, alias |
| `velkopavlovicko` | 3 wina; kategoria: Region Velkopavlovicko | alias regionu |
| `palava` | ma `gotberg-palava-2024`, `halkoci-supa-2025`, `cervinka-rv-2022`; kategorie: Region Mikulov i Pálava oraz Odmiana Pálava | dwuznaczność |
| `z`, `   ` (spacje) | tryb `za-krotkie`, brak listy, tekst „Wpisz co najmniej 2 litery” (dla `z`) | próg 2 znaków |
| `xqzt` | tryb `brak`, komunikat „Nic nie znaleziono” | pusty wynik |

### 7.2 Testy danych
Pilnują, żeby zmiany w `wines.js` nie psuły wyszukiwania po cichu:
- każde wino ma `grape` ze słownika (5.4) albo jawne `null`,
- każdy region używany w `wines.js` (przy winie lub producencie) ma wpis w tabeli aliasów (5.5),
- każdy identyfikator użyty w testach 7.1 istnieje w `wines.js`.

### 7.3 Gdzie i jak
`specs/wyszukiwanie-tekstowe/testy.html`: otwarty w przeglądarce (także z dysku, przez `file://`) ładuje `site/vendor/minisearch/minisearch.min.js`, `site/js/wines.js` i `site/js/wine-search.js`, uruchamia testy 7.1 i 7.2 i pokazuje wynik zielono/czerwono razem z czasem zapytań. Bez narzędzi do budowania, tak jak reszta projektu. Przypadki są zapisane jako tablica obiektów `{ q, ma, nieMa, pierwszy, liczba, maks, kategoria, kategorie, tryb }`.

### 7.4 Testy ręczne (przed publikacją)

| # | Urządzenie | Co sprawdzić |
|---|---|---|
| 1 | iPhone, Safari | wejście w pole nie powiększa strony; pole przewija się na górę; 2 kategorie i 3 wina mieszczą się nad klawiaturą |
| 2 | Android, Chrome | pasek zakładek znika przy fokusie i wraca po wyjściu; lista nie chowa się pod klawiaturą |
| 3 | oba | dotknięcie wina otwiera okno, zamknięcie wraca do listy z tym samym tekstem |
| 4 | oba | tryb samolotowy po pierwszym otwarciu: wyszukiwanie działa |
| 5 | komputer | strzałki, Enter, Escape (zwinięcie, potem czyszczenie) |
| 6 | iPhone, VoiceOver | pole ogłasza się jako pole wyszukiwania z listą; liczba wyników jest czytana po przerwie w pisaniu |
| 7 | wersja GAS | wyszukiwanie działa w ramce, okno wina się otwiera |
| 8 | oba | obrót ekranu przy otwartej liście nie psuje układu |

## 8. Karta wina tylko z Salonu (faza 2)

Wina spoza strony nie mają zdjęcia ani polskiego opisu. Identyfikator ma przedrostek: `salon:<wine_id>`. `openSheet` rozpoznaje go i rysuje kartę Salonu w tym samym `<dialog>`:
- stylizowana butelka (istniejąca funkcja dla win bez zdjęcia),
- nazwa, producent i jego miejscowość, rocznik, kategoria,
- medal i punkty z rokiem Salonu, a jeśli wino ma medale w kilku latach, wszystkie (`other_years`),
- gmina i parcela, cukier, kwasy, alkohol, okno picia (dla złotych),
- opis po czesku z katalogu, z dopiskiem „opis z katalogu Salonu vín, po czesku”,
- linki: karta w Salonie i e-sklep (tylko 2026),
- informacja: „To wino nie jest w naszym przewodniku. Dane z katalogu Salonu vín RRRR”.

**Duplikaty:** wina ze strony, które mają kartę w Salonie, skrypt łączy według reguły z `docs/Salon-vin-2024-2026-wina-ze-strony.md` (producent, odmiana, rocznik, a gdy jest podana, także partia). W indeksie zostaje wtedy jeden rekord z identyfikatorem ze strony.

**W wynikach** wina z Salonu są w osobnej grupie pod winami ze strony i mają znaczek „Salon vín RRRR” (złoty albo srebrny, jak etykiety punktów na stronie).

## 9. Zmiany w plikach

| Plik | Faza | Zmiana |
|---|---|---|
| `site/vendor/minisearch/` (nowy) | 1 | `minisearch.min.js` (7.2.0, zminifikowany raz), `LICENSE.txt`, `README.md` z wersją i poleceniem |
| `site/js/wine-search.js` (nowy) | 1 | normalizacja, synonimy, aliasy, słowa pomocnicze, kategorie, kolejne próby (5.6), interfejs z 5.8. Bez DOM. Styl ES5 jak reszta kodu |
| `site/js/wines.js` | 1 | pole `grape` przy każdym winie (5.4) |
| `site/js/app.js` | 1 | pole w karcie `.wine-hero`, lista podpowiedzi i wyników, nowe nasłuchy `input`, `keydown`, `focusin` i `focusout` na `#content` (dziś jest tylko `click`), wiersze kategorii z `data-search-cat`, wiersze win z istniejącym `data-wine`, ikony `search` i `house` w `ICONS`, klasa `is-searching` |
| `site/css/style.css` | 1 | pole w karcie hero, lista, wiersze 44 i 56 px, `<mark>`, nagłówek wyników, ukrywanie `.tabs` przy `body.is-searching` poniżej 900 px |
| `site/index.html` | 1 | `vendor/minisearch/minisearch.min.js` i `js/wine-search.js` przed `app.js` |
| `site/sw.js` | 1 | oba pliki w `FILES`, podbicie `VERSION` |
| `tools/build-gas.mjs` | 1 | wklejenie obu plików (w fazie 2 także `wine-index.js`) |
| `specs/wyszukiwanie-tekstowe/testy.js` i `testy.html` (nowe) | 1 | testy z punktu 7: w Node (`node specs/wyszukiwanie-tekstowe/testy.js`) i w przeglądarce |
| `tools/build-wine-index.py` (nowy) | 2 | Salon 2024–2026 → `site/js/wine-index.js`: pola z 5.3, identyfikatory `salon:<wine_id>`, połączone duplikaty |
| `site/js/app.js` | 2 | karta wina z Salonu, ładowanie `wine-index.js` przy pierwszym fokusie, grupa „Z Salonu vín” |
| `site/sw.js` | 2 | `wine-index.js` w pamięci przy pierwszym pobraniu (jak zdjęcia), nie w `FILES` |

## 10. Kryteria akceptacji

- Wszystkie testy z punktów 7.1 i 7.2 przechodzą w `testy.html`.
- Zapytanie trwa poniżej 50 ms na średnim telefonie (iPhone z ostatnich 4 lat, Android ze średniej półki), także w fazie 2. Mierzy to `testy.html` uruchomiony na telefonie.
- Pierwsze wejście w pole w fazie 2 nie blokuje strony na dłużej niż 300 ms.
- Wszystkie punkty z listy testów ręcznych 7.4 są sprawdzone.
- Strona bez wejścia w pole nie ładuje niczego więcej niż dziś poza ok. 6 KB biblioteki i ok. 3 KB `wine-search.js` (po gzip).

## 11. Nakład pracy

| Faza | Zakres | Nakład | Trudność |
|---|---|---|---|
| **1** | pole `grape`, `wine-search.js`, interfejs, testy | ok. 1 dnia | 2 na 5 |
| **2** | indeks Salonu, karta wina z Salonu, ładowanie na żądanie, grupowanie wyników | 1–1,5 dnia | 3 na 5 |

Logika wyszukiwania jest już sprawdzona w prototypie. Najwięcej czasu zajmie interfejs na telefonie (klawiatura, przewijanie, pasek zakładek) i testy ręczne.

## 12. Ryzyka

| Ryzyko | Co robimy |
|---|---|
| Za duża tolerancja: śmieci w wynikach | brak tolerancji dla słów do 3 liter i dla liczb, AND, testy z wartościami „nie ma” |
| Za mała tolerancja: „rizling” nic nie znajduje | normalizacja `y`/`i` i `w`/`v`, synonimy, przestawki, „Czy chodziło o” |
| Nowe wino w `wines.js` bez `grape` albo nowy region bez aliasu | testy danych 7.2 |
| Klawiatura zasłania podpowiedzi | lista w treści strony, przewinięcie pola na górę, limit 2+3 na telefonie, ukryty pasek zakładek |
| Faza 2: 1072 wina zasłaniają nasze 56 | osobna grupa, `boostDocument`, znaczek „Salon vín RRRR”, stronicowanie po 20 |
| Faza 2: wolniejsze pierwsze wejście w pole | ładowanie i budowa indeksu na żądanie, w czasie bezczynności |
| Nazwy z Salonu WIELKIMI LITERAMI („PINOT NOIR Auslese”) | normalizacja; w karcie nazwa jak w źródle |
| Aktualizacja MiniSearch | wersja przypięta w `site/vendor/minisearch/README.md`; aktualizacja tylko z ponownym przejściem testów |

## 13. Decyzje (podjęte 10–11 XI)

1. **Fazy 1 i 2 robimy od razu** (11 XI), przed publikacją przegląd kodu i zrzutów ekranu.
2. **Zakres Salonu: wszystkie złote wina i srebrne z podobszaru znojemskiego** (417 win). Liczba win nie wpływa na szybkość (zapytanie poniżej 1 ms), tylko na ilość wyników i rozmiar pliku.
3. **Link do wyszukiwania: nice to have**, zrobiony, bo był tani: `#wino/szukaj/ryzlink` otwiera listę wyników. Lista wyników zapisuje zapytanie w adresie, a wyczyszczenie wyszukiwania je usuwa. W wersji GAS adres się nie zmienia (ramka), więc link działa tylko na GitHub Pages.
4. **Sortowanie i stronicowanie** (prośba z 11 XI): najlepsze wina najpierw, po 20 na stronę (punkt 5.3).

## 14. Review (10 XI)

Cztery rundy z czterech perspektyw: senior frontend developer, architekt, QA i projektant interfejsu. Każdą rundę kończyły poprawki w spec, a następna sprawdzała już poprawioną wersję. Logikę wyszukiwania sprawdzał prototyp zbudowany dokładnie według spec (MiniSearch 7.2.0, 39 testów z punktu 7.1), uruchomiony na danych z `site/js/wines.js` i `docs/salon-vin/`. Rundę 4 zakończył brak nowych ustaleń.

**Runda 1: przegląd poprzedniej wersji, prototyp i pomiary. 12 istotnych ustaleń**

| Perspektywa | Ustalenie | Poprawka |
|---|---|---|
| Frontend | W kodzie normalizacji zamiast zakresu U+0300–U+036F zapisanego jako tekst były w pliku same niewidoczne znaki łączące, więc kod mógłby się zepsuć przy kopiowaniu | `/\p{M}/gu` (5.2) |
| Frontend | Na Androidzie przyklejony pasek zakładek unosi się nad klawiaturą i zabiera 64 px z podpowiedzi | ukrywanie paska przy fokusie (3.5) |
| Frontend | Model punktów (1,0 / 0,8 / premie +0,5 / +0,3) nie istniał w MiniSearch, który liczy BM25 | ranking opisany w kategoriach MiniSearch (5.3) |
| Architekt | Kategorie odmian z samych nazw gubiły Ryzlink TYPIK, Veltlín² i SUPA | jawne pole `grape` (5.4) |
| Architekt | Kategoria „miejsce” nie miała danych strukturalnych, bo `origin` i `place` to polski opis | „miejsce” dopiero w fazie 2; `place` z wagą 1 (5.3, 5.7) |
| Architekt | Brak umowy dla modułu, którego używa też spec zdjęć | interfejs `wine-search.js` (5.8) |
| Architekt | Faza 2: indeks z Salonu to 234 KB i 60 ms budowy na laptopie; ładowany przy starcie spowalniałby każde wejście na stronę | ładowanie i budowa przy pierwszym fokusie, w czasie bezczynności (6) |
| QA | Sprzeczne i błędne oczekiwania: `znojmo` 48 zamiast 47, `mikulov` dwa razy z różnymi wynikami, w makiecie „Ryzlink vlašský” 3 zamiast 2, `pinot noir` z kategorią mimo jednego wina | testy po identyfikatorach, poprawione liczby (7.1) |
| QA | Kolejność kategorii według wyniku BM25 stawiała „Winiarnia: Znovín Znojmo” przed „Region: Znojmo”, a próg „połowa najlepszego wyniku” gubił „Ryzlink vlašský” przy „rizling” | kolejność według poziomu dopasowania, typu i liczby win (5.7) |
| Projekt | Brak budżetu miejsca: z klawiaturą na iPhonie SE zostaje ok. 300 px | limit 2 kategorie + 3 wina na telefonie, wymiary wierszy (3.3, 3.4) |
| Projekt | Emoji w makietach zamiast zestawu ikon strony; pole jako osobny blok zamiast w karcie hero | ikony z `ICONS`, pole w `.wine-hero` (3.1, 3.3) |
| Projekt | Faza 2: „ryzlink” zwraca 236 win, więc „Pokaż wszystkie” stałoby się niekończącą się listą | osobna grupa „Z Salonu vín”, stronicowanie po 20 (6) |

Drobniejsze z rundy 1: zachowanie Escape, wklejanie tekstu z nowymi liniami, ogłaszanie liczby wyników z opóźnieniem, minifikacja biblioteki z licencją, nowe nasłuchy zdarzeń w `app.js`, testy negatywne („nie ma”), testy danych, lista testów ręcznych, format adresu w decyzji 3, `<mark>` bez żółtego tła, metoda pomiaru kryterium 50 ms.

**Runda 2: przegląd przepisanego spec. 3 istotne ustalenia i 5 drobnych**

| Perspektywa | Ustalenie | Poprawka |
|---|---|---|
| Frontend | Zwijanie listy na `blur` pola usuwało wiersz spod palca: pole traci fokus przed kliknięciem, a Safari na iOS nie przenosi fokusu na przycisk | zwijanie na `pointerdown` poza kontenerem (4) |
| Frontend / projekt | Pasek zakładek wracał od razu po `blur`, więc układ skakał pod palcem w trakcie dotknięcia wiersza | zdejmowanie `is-searching` z opóźnieniem ok. 300 ms (3.5) |
| Architekt | Tekst z OCR to wiele słów spoza danych, więc tryb AND by go odrzucił; limit 80 znaków był opisany jako pomoc dla OCR, a w praktyce by mu przeszkadzał | opcje wywołania `combineWith: 'OR'` i `boost`, limit tylko w polu; tryb OR sprawdzony na 3 tekstach w stylu OCR (5.8) |

Drobne z rundy 2: nieaktualne progi literówek i własny model punktów w spec zdjęć (poprawione tam), podświetlanie `<mark>` przez porównanie znormalizowanych słów, zbędne `boostDocument`, ✕ w nagłówku wyników czyści całe wyszukiwanie, „Pokaż wszystkie” jako przycisk poza `listbox`, wyrównanie makiet.

**Runda 3: ponowne uruchomienie testów na dokładnie tej konfiguracji, która jest w spec. 1 średnie ustalenie i 2 drobne**

| Perspektywa | Ustalenie | Poprawka |
|---|---|---|
| QA | Po rozdzieleniu pola miejsca na `origin` (2) i `place` (1) test `hna` nie przechodził: BM25 premiuje krótkie pola, więc `origin: "Hnanice"` Kořínka wyprzedzało producenta Vinice Hnanice | waga `prod` 4 zamiast 3; sprawdzone dwa warianty, oba 39/39, wybrany ten, który nie osłabia trafień w parcele (5.3) |

Drobne z rundy 3: błędny odsyłacz na początku spec (punkt 6 zamiast 5.8) i dwa niewidoczne znaki łączące w tekście tej sekcji.

**Runda 4: bez nowych ustaleń.** Sprawdzone:
- 39/39 testów na konfiguracji końcowej,
- OCR w trybie OR: 3/3 na 1. miejscu (przewaga 2,2–5,8 raza),
- wszystkie odsyłacze wskazują istniejące punkty,
- w obu specach nie ma niewidocznych znaków łączących,
- spec zdjęć jest spójny z tym spec (progi, tryb OR, plik `wine-search.js`).

Uwaga kosmetyczna: ceny w makietach to dzisiejsze dane i mogą się zmienić.

## 15. Implementacja (11 XI)

Zrobione lokalnie, **bez commita i bez publikacji**: czeka na przegląd kodu i zrzutów ekranu.

| Plik | Co |
|---|---|
| `site/vendor/minisearch/` | MiniSearch 7.2.0 zminifikowany (18 KB, 5,9 KB po gzip), `LICENSE.txt`, `README.md` z poleceniem |
| `site/js/wine-search.js` | moduł z punktów 5.2–5.8: normalizacja, synonimy, aliasy, kategorie, kolejne próby, sortowanie „najlepsze najpierw”, łączenie win i winiarni ze strony i z Salonu, budowa w porcjach |
| `tools/build-wine-index.py` → `site/js/wine-index.js` | 417 win z Salonu (złote + srebrne ze Znojemska), 266 KB, 65 KB po gzip |
| `site/js/wines.js` | pole `grape` przy 7 winach (2 odmiany ze źródeł, 5 kupaży `null`) |
| `site/js/app.js` | pole w karcie „Znojmo w kieliszku”, podpowiedzi, lista wyników po 20 od najlepszych, karta wina z Salonu, klawiatura, ARIA, link `#wino/szukaj/…` |
| `site/css/style.css` | style wyszukiwarki, ukrywanie paska zakładek przy wpisywaniu na telefonie |
| `site/index.html`, `site/sw.js` (wersja v12), `tools/build-gas.mjs` | nowe skrypty; w GAS wklejone razem z `wine-index.js` |
| `specs/wyszukiwanie-tekstowe/testy.js`, `testy.html` | testy z punktu 7 |

**Sprawdzone:**
- testy: 39/39 w fazie 1, 11/11 w fazie 2, 4/4 testy danych (Node i Edge),
- przeglądarka Edge w trybie telefonu (390 × 844) i komputera: pole, 1 litera, podpowiedzi, przestawka, brak wyników, kategoria → lista od najlepszych, „Pokaż kolejne 20” (20 → 40), karta wina z Salonu i ze strony, link `#wino/szukaj/frankovka`, strzałki i Escape, ukrywanie paska zakładek; bez błędów w konsoli,
- wersja GAS się buduje (`node tools/build-gas.mjs`).

**Niesprawdzone** (wymaga prawdziwych urządzeń, lista w punkcie 7.4): Safari na iPhonie (powiększanie przy wejściu w pole, klawiatura), Chrome na Androidzie, VoiceOver, tryb offline na GitHub Pages i wersja GAS po wdrożeniu.
