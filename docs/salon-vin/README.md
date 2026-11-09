# Salon vín ČR – dane 2024–2026

Pełne wyniki finału krajowego konkursu win (Salon vín – Národní soutěž vín ČR, Národní vinařské centrum, Valtice) w formacie JSON. Zestawienie dla win z naszej strony: [../Salon-vin-2024-2026-wina-ze-strony.md](../Salon-vin-2024-2026-wina-ze-strony.md).

## Pliki

| Plik | Złote | w tym z kartą katalogu | Srebrne | Profile producentów |
|---|---|---|---|---|
| [salon-vin-2026.json](salon-vin-2026.json) | 100 | 100 | 278 | 58 |
| [salon-vin-2025.json](salon-vin-2025.json) | 100 | 100 | 286 | 62 |
| [salon-vin-2024.json](salon-vin-2024.json) | 100 | 100 | 281 | 53 |

Każdy plik ma pola `salon_year`, `sources` (adresy źródeł), `counts`, `gold`, `silver`, `producers`.

## Źródła

- **Arkusz XLSX** `zlate-a-stribrne-medaile-salon-vin-RRRR.xlsx` – lista złotych i srebrnych win z punktacją, kategorią konkursową, cukrem, kwasami, alkoholem i partią.
- **Katalog PDF** – karta każdego złotego wina (parcela, data zbioru, cukier moszczu, liczba butelek, ekstrakt, okno picia, opis, inne nagrody) i profile producentów.
- **Strona NVC, tylko 2026** – link do karty wina, e-sklepu, zdjęcia butelki, wykresu aromatów, profilu winiarni i współrzędne parceli z mapy interaktywnej.

## Zasady scalania (żeby dane były spójne)

1. **Złote wina:** główne wartości pochodzą z karty w katalogu PDF, czyli z tego, co widać w ekspozycji i na etykiecie. Gdy arkusz XLSX podaje coś innego, jego wartość jest w `xlsx_diff`. Gdy strona 2026 podaje coś innego, jej wartość jest w `web_diff`. Alkohol w XLSX to zwykle pomiar laboratoryjny z dokładnością do setnych, a w karcie wartość zaokrąglona z etykiety.
2. **Srebrne wina:** tylko z XLSX. Lista srebrnych w PDF gubi producenta na granicach stron, więc nie jest używana.
3. **Producenci:** jedna nazwa dla tej samej winiarni we wszystkich latach (`producer`, wzięta z profilu w najnowszym katalogu) i stały identyfikator `producer_id`. Oryginalny zapis z danego źródła jest w `producer_raw` (lub `name_raw` w profilach), gdy się różni. Poza ujednoliceniem pisowni (spacje, „s.r.o.”, myślniki) połączyłem ręcznie sprawdzone warianty tej samej winiarni: Kamil Prokeš, Jiří Uherek, Martin Čapka, Jan Plaček, Školní statek Mělník, Buriánek („Vinařství Rodiny Buriánkovy”), Habřina, Škrobák (Stanislav i Martin – jedna winiarnia, dwóch sklepmistrzów), Bravenec, Ivičič / U Jeňoura, Kadrnka (ten sam adres w Březí) i Jacina. Celowo **nie** łączę firm o podobnej nazwie, ale innej siedzibie: Kamil Prokeš ≠ VÍNO PROKEŠ (Horní Bojanovice), Ing. František Zapletal ≠ Vinné sklepy Zapletal, Víno Rakvice ≠ Réva Rakvice. Razem: 200 winiarni.
4. **To samo wino w kilku latach:** `wine_id` = producent + rocznik + partia (partia jest unikalna w obrębie producenta i rocznika; gdy jej brak – nazwa wina). Dzięki temu łączą się wpisy, w których to samo wino ma w różnych latach nieco inną nazwę (np. „Rulandské modré rezerva” i „Rulandské modré”, partia 22522). Gdy to samo wino ma medal w więcej niż jednym roku, `other_years` wskazuje pozostałe lata z medalem i punktami. W latach 2024–2026 jest 65 takich win.
5. **Duplikaty:** w obrębie roku nie ma dwóch wpisów o tym samym `wine_id`. Wpisy o tej samej nazwie i roczniku, ale innej partii (np. Thaya Veltlínské zelené 2022, partie VZ/2257 i VZ/2259) to osobne wina i oba zostają.
6. **Poprawki tekstu:** usunięte dzielenia wyrazów z łamania PDF („po-doblast” → „podoblast”), spacje przed przecinkami oraz numery stron doklejone na końcu opisów producentów.

## Pola wina

| Pole | Znaczenie |
|---|---|
| `nr` | numer ewidencyjny w Salonie (tylko złote; numer stanowiska w ekspozycji w Valticach) |
| `medal`, `points` | `zlatá` / `stříbrná`, punkty w finale (skala 100 pkt) |
| `wine`, `wine_label` | nazwa handlowa z arkusza / nazwa z karty z nazwą międzynarodową |
| `vintage`, `quality`, `quality_full` | rocznik, kategoria jakości (np. pozdní sběr, VOC Znojmo), w karcie z określeniem słodyczy |
| `category` | kategoria konkursu: A białe wytrawne, B i F półwytrawne i półsłodkie, C słodkie, D różowe i klarety, E czerwone wytrawne, G musujące |
| `producer`, `producer_id`, `producer_raw`, `producer_town` | patrz zasady 3 |
| `region`, `subregion`, `village`, `vineyard` | obszar, podobszar, gmina winiarska, parcela (viniční trať) |
| `harvest_date`, `yield_t_ha`, `must_nm` | data zbioru, plon w t/ha (tylko katalog 2024 ma to pole), cukier moszczu w °NM |
| `batch`, `bottles`, `batch_volume_l` | partia, liczba butelek (z karty), objętość partii w litrach (ze strony 2026, gdzie opisane jako „počet lahví”) |
| `sugar_gl`, `acid_gl`, `alcohol_pct`, `extract_gl` | cukier resztkowy, kwasy, alkohol, ekstrakt bezcukrowy |
| `drink_window`, `description`, `awards` | okno picia, opis i nagrody (po czesku, bez tłumaczenia) |
| `xlsx_diff`, `web_diff`, `notes` | rozbieżności między źródłami i uwagi do jakości danych |
| `map_point_suspect` | punkt z mapy NVC, który leży poza podobszarem wina (wtedy nie ma `lat`/`lon`) |
| `wine_id`, `other_years` | patrz zasada 4 |
| `url`, `eshop_url`, `producer_url`, `bottle_img`, `aroma_chart_img`, `lat`, `lon` | tylko 2026 |

## Kontrola jakości

Skrypty `tools/salon-vin/audit.py`, `audit2.py` i `audit3.py` sprawdzają duplikaty, warianty nazw, artefakty tekstu, typy pól, numerację 1–100, minimum 84 pkt, cukier zgodny z kategorią konkursu, daty zbioru względem rocznika, okna picia, GPS względem podobszaru, zgodność strony NVC z kartą, format danych w profilach, możliwe duplikaty winiarni pod różnymi nazwami oraz zgodność parametrów win z naszej strony z kartami Salonu (wszystkie zgodne).

Złote wina każdego roku porównałem z tabelami „Statistika kolekce” wydrukowanymi w katalogu przez organizatora. **Zgadzają się 1:1** podobszary, roczniki, liczba firm (54 / 62 / 61), lista najlepszych producentów i podział na białe, czerwone i różowe. Liczba profili producentów też równa się liczbie firm. Jedyne różnice to dwa wina, w których arkusz i karta podają inną kategorię jakości (statystyki organizatora liczą według arkusza):

- 2024 nr 45 (Luděk Vondrák, Ryzlink rýnský): karta „české zemské víno”, arkusz „VOC Mělník”,
- 2025 nr 90 (Čapka, Cabernet Sauvignon): karta „výběr z hroznů”, arkusz „pozdní sběr”.

W danych jest wartość z karty, a wartość z arkusza – w `xlsx_diff.quality`.

Liczba srebrnych win w danych równa się liczbie podanej przez organizatora w katalogu: 281 (2024), 286 (2025), 278 (2026).

## Znane problemy w źródłach

- XLSX 2026: partie win nr 4 (Šoman) i nr 5 (Vinice Hnánice) są zamienione. W `batch` jest wartość z karty, w `xlsx_diff.batch` z arkusza.
- XLSX 2026: przy nr 82 i 83 zamienione są kolumny producenta i nazwy (82 to Vinařství Kubík, Frankovka OP2/23 z Velkých Bílovic; 83 to VÍNO J.STÁVEK „bla bla” z Němčiček). Karta w katalogu i strona NVC są ze sobą zgodne, partia i parametry w arkuszu pasują do numerów, więc punkty są przypisane według numeru. Oznaczone w `notes` i `xlsx_diff`.
- Mapa NVC 2026: 6 punktów leży poza podobszarem wina – trzy wina Zámeckého vinařství Bzenec (Slovácko) mają punkt pod Pálavą, do tego Maňák Žádovice, DAVINUS Popice i B\V Popice. Przeniesione do `map_point_suspect`. Bohemia Sekt (nr 98) nie ma punktu.
- Katalogi 2024–2026: sklepmistrz Zámeckého vinařství Bzenec zapisany w dwóch liniach („Ing. Marcela Křivohlávková” / „Olbrechtová”) – połączone. U Kadrnki (2026) dwie osoby: „Marcela Kadrnková, Martin Halámek”.
- XLSX 2025: kwasy 0 dla DAVINUS Pálava (nr 67) i dla srebrnego Bauman Rulandské bílé – zamienione na brak danych, w karcie nr 67 są kwasy 6,7.
- XLSX 2025, nr 65 (Maděřič Ryzlink rýnský): cukier 18,1 g/l w arkuszu, 31,9 g/l w karcie – oznaczone w `notes`.
- XLSX 2024: srebrny Uherek „Cuvée ČTYŘ” ma rocznik 0, a srebrny Fasora Acolon Barrique alkohol 4,7 % – oznaczone w `notes`.
- Katalog 2026, Vinařství Garčic: roczna produkcja „150 00 lahví” (literówka w źródle, zostawiona z adnotacją; przy 3,1 ha winnic to raczej 15 000).
- Strona 2026: opisy 12 win różnią się nieco od tekstu w PDF (inna redakcja). W danych jest wersja z katalogu.
- Katalog 2024 ma inny układ karty: dodatkowe pole „Výnos (t/ha)” i nagłówek „Dosažená ocenění”. W nagrodach 2024 nie ma bieżącego Salonu (katalog wymienia tylko wcześniejsze nagrody).
- Puste pola w katalogu (nie błąd parsowania): parcela 2025 nr 60 (Tetur) i sekty Bohemia Sekt (2025 nr 97, 2026 nr 98); data zbioru „-” przy 2026 nr 95 i 98; okno picia „2024” (jeden rok) przy 2024 nr 27.
- „Lokus Čevený” (2024 nr 94, J. Stávek, Frankovka fortyfikowana) – taka pisownia jest w obu źródłach, nazwa handlowa zostawiona bez zmian.
- Arkusz 2024 nie ma kolumn gmina/parcela dla srebrnych win.
- To samo srebrne wino w dwóch latach ma czasem nieco inny cukier lub kwasy (np. Gotberg Ryzlink rýnský 2022 G1522: 9,6 g/l w 2024, 7,1 g/l w 2025) – to wartości z arkuszy danego roku, zostawione bez ujednolicania.
- Katalog 2024: przy pięciu winach (Zámecké vinařství Bzenec, Mikrosvín) cukier moszczu podany jest jako zakres, np. „21–23” – wino z kilku zbiorów. `must_nm` jest wtedy tekstem.

## Jak odtworzyć

Skrypty są w [../../tools/salon-vin/](../../tools/salon-vin/README.md).
