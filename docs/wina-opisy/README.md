# Opisy smakowe win ze strony

Profil degustatorów 0–10 (Aromagram z kart Salonu vín 2026) ma 13 z 56 win na stronie (`site/js/aroma.js`). Dla pozostałych 43 takich liczb nie ma nigdzie. Sprawdzone zostały: konkurs regionalny, Enotéka, Vinotrh, Vínovín, Král vín i archiwum NVC, gdzie wykresy z 2024 i 2025 dają 404. Ten katalog zbiera więc **słowne opisy** z innych źródeł.

Plik [opisy-win.json](opisy-win.json) zawiera wszystkie 56 win (klucz jak w `site/js/wines.js`).

## Pola

| Pole | Znaczenie |
|---|---|
| `has_salon_profile` | czy wino ma liczby 0–10 w `site/js/aroma.js` |
| `sources[]` | `source`, `url`, `notes` (opis po czesku, dosłownie ze źródła), `values` (parametry podane przez źródło: cukier, kwasy, alkohol, trasa, okno picia, potrawy…), opcjonalnie `winemaking` (akapity o produkcji), `estimated`, `generic_sentences`, a przy źródłach z dodatkowego researchu `kind` (producent / recenzent / sklep), `quote_confirmed` i `remark` |
| `aroma_groups_from_text` | słowa z opisów przypisane do grup aromatów z metodyki Salonu vín (květnaté, tropické ovoce, citrusové, jádrové, peckové, drobné ovoce, sušené a vařené, karamelizované, bylinné, kořenité, dřevo/barrique, autolyzátové/mléčne, mineralne, zwierzęce/ziemiste) |
| `aroma_groups_estimated_only` | grupy, które pojawiają się wyłącznie w szacunkowym opisie Vínovín |
| `other_vintage` | opis tego samego wina z innego rocznika (`vintage`, `source`, `url`, `why`, `notes`, `aroma_groups`). Jest tylko tam, gdzie brak opisu własnego rocznika |
| `rejected_sources` | strony odrzucone z podanym powodem (opisują inne wino) |

**Grupy oznaczają tylko obecność słowa w opisie, nie natężenie.** Nie wolno ich przeliczać na skalę 0–10 ani rysować jak Aromagramu. Zdania o podawaniu i potrawach („hodí se k…”, „doporučujeme…”) są pomijane.

## Źródła i ich wiarygodność

1. **Strona producenta** (link „Karta wina / zakup” z `wines.js`): opis dla 22 z 43 win. Najlepsze źródło.
2. **Vinotrh** (sklep Enotéki): wina z karty `enoteka.vinotrh.cz/output/wines.json` dopasowane po producencie, roczniku i nazwie, a strona produktu wyszukana po kodzie Vinotrh. Opis dla 20 win. **Uwaga:** krótkie karty VOC mają szablon „Suché bílé víno odrůdy X, 2025, VOC z vinařství Y.” i zdanie typowe dla odmiany. To samo zdanie występuje u różnych winiarni, np. „Aromatické víno s výrazným projevem angreštu, rybízu, broskví a černého bezu.” przy Sauvignonach Piálka i Znovínu. Takie zdania (6 win) są wpisane w `generic_sentences` i nie trafiają do grup.
3. **Vínovín** (vinovin.cz): dopasowanie po odmianie, roczniku, producencie i kategorii jakości w adresie (VOC, kabinet, późny zbiór…). Opis dla 17 win. **Uwaga:** przy 10 z nich sklep sam pisze „Popis vína je odhadem na základě analytiky, polohy a charakteristiky stejného vína minulých ročníků”. To szacunek, nie degustacja, więc te opisy mają `estimated: true` i nie trafiają do `aroma_groups_from_text`.

4. **Dodatkowy research** ([zrodla-dodatkowe.md](zrodla-dodatkowe.md)): osobne przeszukanie recenzji, mediów, konkursów i innych sklepów dla 13 win bez opisu właściwego rocznika. Cytaty są w liście `EXTRA` w `build.py`, a przy każdym budowaniu skrypt sprawdza, czy cytat nadal jest na stronie. Do grup liczą się tylko potwierdzone (`quote_confirmed: true`). Niepotwierdzone zostają zapisane: karta Ampelos AT klony i karta VELTLIN dla Qvevri zwracają dziś 404. W raporcie agenta dwa zdania Moravskiego Hrozenu (Špalek VZ) były sklejone, choć na stronie dzieli je trzecie, więc w danych są jako dwa osobne cytaty.

Ze stron Shoptet (Vinotrh, Vínovín) brany jest tylko krótki i główny opis produktu. Fragmenty kart innych win z tej samej strony (ucięte na „...”) są pomijane, podobnie jak ogólny tekst Znovínu o VOC Znojmo.

## Inny rocznik

Gdy wino nie ma opisu własnego rocznika, można użyć opisu tego samego wina z innego rocznika. Warunki: ten sam producent, ta sama linia lub trasa i ta sama kategoria. Taki opis jest w osobnym polu `other_vintage` z rokiem i uzasadnieniem. Rocznik zmienia głównie akcenty: chłodny rok daje więcej cytrusów, zielonego jabłka i ziół, a ciepły brzoskwinię, owoce tropikalne i miód. Charakter odmiany i trasy zostaje. Grupy z innego rocznika są więc orientacyjne. Parametry (cukier, kwasy, alkohol) zawsze pochodzą z właściwego rocznika.

- Simenon Sauvignon VOC 2025 ← rocznik 2024 z Vinshopu (ta sama trasa Dívčí hora, VOC, suche).
- Oulehla Frankovka Na Nivách 2023 nie potrzebuje już innego rocznika: jest recenzja partii 2350 z MojeLahve.
- **Nie użyto** opisu Ampelos Veritas 2023 z Enotéki. To słodki výběr z bobulí, a na stronie jest wytrawny pozdní sběr 2024, czyli inne wino mimo tej samej odmiany.

## Odrzucone dopasowania

- Znovín Ryzlink rýnský Šobes 2025: Vínovín ma Ryzlink VOC 2025 Znovínu z trasy Dívčí vrch.
- Vinice Hnanice Sauvignon VOC 2025: Enotéka #80 (Vinotrh VIH.0260) to Sauvignon VOC 2025 ze Starých vinic, a na stronie jest wino z U Kapličky (partia 3426/25).
- Simenon Veltlínské zelené VOC 2025: Enotéka (#8) ma wino z trasy Nad Sklepy, Vínovín z Dívčí hory. Strona nie podaje trasy, więc zostaje wersja z Enotéki.
- Znovín Sauvignon VOC 2025: Enotéka #40 to Sauvignon šedý (inna odmiana).
- Thaya Veltlínské zelené 2025 i Špalek Veltlínské zelené 2025: kabinety tej samej odmiany na Vínovín (na stronie jest pozdní sběr / VOC).
- **Gotberg Pálava 2024:** link „Karta wina” na naszej stronie prowadzi do karty Pálavy pozdní sběr **2025** w e-sklepie Gotberga (inny cukier i kwasy). Odrzucony po roczniku w tytule strony. Link w `site/js/wines.js` warto poprawić.

Rocznik jest sprawdzany w tytule strony, a nie w adresie. Špalek ma adres „…-2024”, ale strona pokazuje rocznik 2025.

## Różnice parametrów

- Plaček Frankovka 2023: Vinotrh podaje cukier 0,8 g/l, a karta Salonu vín 2026 i nasza strona 0,1 g/l.

## Pokrycie (43 wina bez profilu Salonu)

41 ma jakikolwiek opis, a 35 ma grupy aromatów z opisu własnego rocznika (producent, recenzent albo sklep, z pominięciem szacunków i szablonów). Bez nich jest 8 win:

- Vinice Hnanice Ryzlink VOC, Veltlín VOC i Sauvignon VOC 2025: tylko szablon Vinotrh i/lub szacunek Vínovín. Cennik producenta i MojeLahve nie mają opisu.
- Simenon Sauvignon VOC 2025: tylko szacunek Vínovín. Jest opis rocznika 2024 w `other_vintage`.
- Ampelos Veritas 2024: Vinotéka u zámku opisuje wino po własnej degustacji (czerwiec 2026), ale bez słów aromatów. Na stronie są dwie partie (2419 i 2523).
- Ampelos Veltlínské zelené AT klony 2024: cytat z karty producenta, która dziś daje 404.
- Kořínek Veltlínské zelené VOC 2023 i PET NAT Ryzlink rýnský 2025: brak opisu w żadnym sprawdzonym źródle.

| Wino | Źródła z opisem | Grupy aromatów z opisów | Tylko w szacunku Vínovín | Inny rocznik |
|---|---|---|---|---|
| Znovín Znojmo · Ryzlink rýnský Šobes 2025 | producent | květnaté, tropické ovoce, peckové ovoce, sušené a vařené ovoce, mineralne |  |  |
| Vinice Hnanice · Ryzlink rýnský VOC 2025 | Vínovín (szacunek) | – | květnaté, citrusové ovoce, mineralne |  |
| Piálek & Jäger · Sauvignon VOC 2025 | producent, Vinotrh (szablon), Vínovín (szacunek) | peckové ovoce | tropické ovoce, citrusové ovoce, drobné ovoce, bylinné, mineralne |  |
| Ampelos · Veritas 2024 | inny sklep | – |  |  |
| Oulehla · Frankovka Na Nivách 2022 | producent | peckové ovoce, drobné ovoce, karamelizované, kořenité, mineralne |  |  |
| DAVINUS · Ryzlink rýnský, kabinet 2022 | producent | tropické ovoce, peckové ovoce, sušené a vařené ovoce |  |  |
| Oulehla · Frankovka Na Nivách 2023 | recenzent | mineralne |  |  |
| VINO HORT · Královský Ryzlink rýnský VOC 2023 | producent, Vinotrh, Vínovín | citrusové ovoce, peckové ovoce, karamelizované, kořenité, mineralne |  |  |
| Hanzel · Rotgipfler Volné pole 2025 | Vinotrh | květnaté, peckové ovoce, karamelizované, kořenité |  |  |
| Znovín Znojmo · Neuburské z Pekla 2025 | producent, Vinotrh | tropické ovoce, peckové ovoce, sušené a vařené ovoce, karamelizované |  |  |
| Znovín Znojmo · Ryzlink rýnský Šobes 2024 | Vinotrh | květnaté, tropické ovoce, peckové ovoce, sušené a vařené ovoce, mineralne |  |  |
| Vinice Hnanice · Veltlínské zelené VOC 2025 | Vinotrh (szablon), Vínovín (szacunek) | – | citrusové ovoce, kořenité, mineralne |  |
| Vinice Hnanice · Sauvignon VOC 2025 | Vínovín (szacunek) | – | mineralne |  |
| Znovín Znojmo · Sauvignon VOC Znojmo 2025 | producent, Vinotrh (szablon), Vínovín (szacunek) | tropické ovoce, citrusové ovoce, drobné ovoce, sušené a vařené ovoce, bylinné | karamelizované, mineralne |  |
| Znovín Znojmo · Veltlínské zelené VOC Znojmo 2025 | producent, Vínovín (szacunek) | květnaté, jádrové ovoce, peckové ovoce, kořenité, autolyzátové / mléčne | karamelizované, mineralne |  |
| Piálek & Jäger · Veltlínské zelené Extra 2024 | producent, Vinotrh, Vínovín | květnaté, kořenité, mineralne |  |  |
| Piálek & Jäger · Hibernal 2025 | producent, Vinotrh, Vínovín | květnaté, tropické ovoce, citrusové ovoce, peckové ovoce, karamelizované, kořenité |  |  |
| Špalek · Veltlínské zelené VOC Znojmo BIO 2025 | Vinotrh (szablon), Vínovín (szacunek), inny sklep | karamelizované, kořenité, mineralne | citrusové ovoce, jádrové ovoce, peckové ovoce, bylinné |  |
| Špalek · Gryllus bílý VOC BIO 2025 | Vinotrh (szablon), Vínovín (szacunek), inny sklep | tropické ovoce, citrusové ovoce, jádrové ovoce, mineralne | květnaté, bylinné |  |
| Thaya · Apri Chardonnay 2024 | producent | květnaté, tropické ovoce, sušené a vařené ovoce, mineralne |  |  |
| Thaya · Veltlínské zelené · Pozdravy z Národního parku 2025 | producent, Vinotrh | citrusové ovoce, kořenité |  |  |
| Thaya · Zweigeltrebe 2023 | producent | kořenité, dřevo / barrique |  |  |
| Waldberg · Ryzlink vlašský 2024 | Vinotrh, Vínovín | peckové ovoce, sušené a vařené ovoce, bylinné, mineralne |  |  |
| Waldberg · Rulandské modré Volné pole 2021 | Vinotrh | sušené a vařené ovoce, kořenité, dřevo / barrique |  |  |
| Oulehla · Chardonnay Karlov Staré keře 2023 | producent | květnaté, citrusové ovoce, jádrové ovoce, peckové ovoce, autolyzátové / mléčne, mineralne |  |  |
| Oulehla · Merlot Grand Reserva 2022 | producent | sušené a vařené ovoce, karamelizované, dřevo / barrique |  |  |
| Lahofer · Veltlínské červené rané Volné pole 2024 | Vinotrh | květnaté, citrusové ovoce, kořenité |  |  |
| Lahofer · Cuvée Rajská VOC 2025 | Vinotrh, Vínovín | drobné ovoce, kořenité, mineralne |  |  |
| Lahofer · Veltlínské zelené Volné pole VOC 2025 | Vinotrh, Vínovín | jádrové ovoce, karamelizované, kořenité, mineralne |  |  |
| Halkoci · Ryzlink TYPIK 2025 | producent, Vinotrh | citrusové ovoce, peckové ovoce, mineralne |  |  |
| Halkoci · Veltlín² 2024 | producent | kořenité, dřevo / barrique |  |  |
| Halkoci · SUPA · suchá Pálava 2025 | producent, Vinotrh | květnaté, kořenité, mineralne |  |  |
| Josef Kořínek · Veltlínské zelené VOC 2023 | – | – |  |  |
| Josef Kořínek · PET NAT Ryzlink rýnský 2025 | – | – |  |  |
| Josef Kořínek · Muškát moravský Fresh 2026 | Vínovín | květnaté, citrusové ovoce |  |  |
| Simenon · Veltlínské zelené VOC 2025 | producent, Vinotrh (szablon) | citrusové ovoce, jádrové ovoce, kořenité, mineralne |  |  |
| Simenon · Ryzlink rýnský VOC 2025 | producent, Vínovín (szacunek) | peckové ovoce, mineralne | květnaté, citrusové ovoce, jádrové ovoce |  |
| Simenon · Sauvignon VOC 2025 | Vínovín (szacunek) | – | citrusové ovoce, drobné ovoce, bylinné, mineralne | 2024: drobné ovoce |
| Ampelos · Trio 2024 | recenzent | kořenité, mineralne |  |  |
| Ampelos · Veltlínské zelené AT klony 2024 | producent (niepotwierdzony) | – |  |  |
| Dobrá Vinice · Crème de Kambrium 2022 | producent | karamelizované, autolyzátové / mléčne, mineralne |  |  |
| Dobrá Vinice · Kambrium cuvée 2022 | producent | květnaté, dřevo / barrique, mineralne |  |  |
| Dobrá Vinice · Veltlínské zelené Qvevri 2019 | recenzent, inny sklep (niepotwierdzony) | citrusové ovoce, karamelizované, autolyzátové / mléčne, zwierzęce / ziemiste |  |  |

## Jak odtworzyć

```sh
W=/tmp/opisy   # katalog roboczy poza repo (pamięć podręczna stron)
node -e "global.window={};require('./site/js/wines.js');require('./site/js/aroma.js');require('fs').writeFileSync(process.argv[1],JSON.stringify({producers:window.WINES.producers,wines:window.WINES.wines,aroma:Object.keys(window.AROMA)}))" $W/site.json
python tools/wina-opisy/build.py $W/site.json $W/cache docs/wina-opisy
```

Tylko biblioteka standardowa Pythona. Strony trafiają do `$W/cache`, więc ponowne uruchomienie ich nie pobiera. Opisy w sklepach się zmieniają, a stan w pliku pochodzi z dnia w polu `generated`. Nowe winiarnie na stronie dostają klucz wyszukiwania z ostatniego słowa nazwy (`PSLUG` w skrypcie), a pary „inny rocznik” są w `OTHER_VINTAGE`.
