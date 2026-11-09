# Husa · Znojmo 2026 — plan budowy strony

Stan na 8 XI 2026. Wyjazd zaczyna się 11 XI, więc zostały **około 3 dni**. Ten termin wpływa na każdą decyzję poniżej.

> **Decyzje z 8 XI (po rozmowie):** termin 11–15 XI, wymeldowanie 15 XI do 10:00 (Booking). Nikt nie zmienia planu w trakcie, więc strona jest statyczna. Hosting główny: **GitHub Pages** (offline, krótki link), a GAS jako zapas z tego samego kodu. Zamiast Vite i Tailwind: czysty HTML, CSS i JS bez budowania, treść w `site/js/data.js`. Wszystkie zakładki na podstawie `docs/`, a ozdobniki z makiety usunięte. Instrukcja wdrożenia jest w `README.md`.

---

## 1. Cel i założenia

- Strona tylko do czytania, mobile-first, dla ok. 9 dorosłych (+2 dzieci) na wyjeździe.
- Treść z `docs/*.md`: plan dnia, restauracje, przewodnik winiarski, trasy i miejsca dla dzieci.
- JavaScript tylko do nawigacji: zakładek, wyboru dnia i zwijania sekcji. Żadnych formularzy ani backendu.
- Hosting docelowy: **Google Apps Script (web app)**. Ten sam plik ma też działać jako zwykły statyczny hosting (plan B).

## 2. Ograniczenia Google Apps Script (sprawdzone w dokumentacji)

| Ograniczenie | Skutek dla projektu |
|---|---|
| Strona jest serwowana w **sandboxowanym iframe** (tryb IFRAME, innych już nie ma). Brak `allow-top-navigation`. | Każdy link musi mieć `target="_blank"` albo `_top`. Najprościej dodać `<base target="_top">`. Linki do Google Maps lepiej dać z `_blank`, wtedy na telefonie otworzy się aplikacja Map. |
| **`<meta>` w HTML są ignorowane**. Dozwolone tylko przez `HtmlOutput.addMetaTag()`: `viewport`, `mobile-web-app-capable`, `apple-mobile-web-app-capable`, `google-site-verification`. | Bez `addMetaTag('viewport', 'width=device-width, initial-scale=1')` strona na telefonie wyświetli się jako pomniejszony desktop. To błąd numer 1 w projektach GAS. |
| `<title>` i `<link rel=icon>` w HTML są ignorowane. | Trzeba użyć `setTitle()` i `setFaviconUrl()`. Favicon musi być pod publicznym URL z rozszerzeniem `.png` lub `.ico`. |
| Skrypty i CSS z zewnątrz tylko przez HTTPS. | Google Fonts działają. Tailwind CDN technicznie też, ale go nie używamy (pkt 4). |
| Brak plików statycznych w projekcie: są tylko pliki `.gs` i `.html`. | Obrazy trzeba osadzić jako base64 (data URI) albo hostować gdzie indziej. Linki do Google Drive w `<img>` są zawodne i lepiej ich nie używać. |
| URL strony wierzchniej się nie zmienia, a hash działa tylko wewnątrz iframe. | Głębokie linki (np. „otwórz piątek”) wymagają `google.script.history` / `google.script.url` albo parametru `?day=fri` czytanego w `doGet(e)`. |
| Konta prywatne (gmail.com) pokazują **szary baner** „Ta aplikacja została utworzona przez użytkownika Google Apps Script”. | Kosmetyka, ale na telefonie zabiera miejsce u góry. Nie da się go wyłączyć od strony autora. |
| Brak Service Workera i trybu offline. | W podziemiach i w piwnicach winnych zasięg bywa słaby. Bez sieci strona się nie załaduje. |
| Każde wejście to wykonanie `doGet` („zimny start” ok. 1–3 s). Limit 30 jednoczesnych wykonań na użytkownika. | Dla 11 osób limity nie grają roli. Czuć tylko opóźnienie przy otwieraniu. |
| Wdrożenie: `/dev` widzi tylko edytor, `/exec` jest publiczne. **Nowe wdrożenie = nowy URL.** | Przy aktualizacji trzeba podbijać wersję **istniejącego** wdrożenia (`clasp deploy -i <deploymentId>`), inaczej link wysłany znajomym przestanie pokazywać nowości. |
| Dostęp „Każdy” (bez logowania) przy „Wykonuj jako: ja”. | Każdy z linkiem widzi stronę. Zobacz uwagę o prywatności w pkt 7. |

Źródła: [HTML Service: Restrictions](https://developers.google.com/apps-script/guides/html/restrictions), [HtmlOutput reference](https://developers.google.com/apps-script/reference/html/html-output), [Web Apps](https://developers.google.com/apps-script/guides/web), [Best practices](https://developers.google.com/apps-script/guides/html/best-practices), [Quotas](https://developers.google.com/apps-script/guides/services/quotas).

## 3. Architektura

```
husa/
  content/trip.json          ← jedno źródło prawdy: dni, punkty, restauracje, wina, trasy
  content/wine-guide.md      ← długi tekst przewodnika (renderowany przy buildzie)
  src/index.html             ← szkielet strony
  src/main.js                ← render z JSON + zakładki + wybór dnia
  src/styles.css             ← Tailwind v4 (kompilowany) + tokeny z DESIGN.md
  assets/parking.webp, parking-map.webp
  gas/Code.gs                ← doGet: plik HTML + addMetaTag + setTitle
  gas/appsscript.json
  dist/index.html            ← JEDEN plik: CSS, JS, dane i obrazy inline
```

- **Build:** Vite + `vite-plugin-singlefile` wkleja wszystko do jednego `dist/index.html`. Skrypt kopiuje go do `gas/index.html`, a `clasp push` wysyła na serwer.
- **Jeden artefakt, dwa hostingi:** ten sam `dist/index.html` trafia do GAS i, jeśli trzeba, na GitHub Pages lub Cloudflare Pages. Warunek: zero względnych URL-i, linki z `target` i brak zależności od `location` okna nadrzędnego.
- **Model danych punktu planu:**
  `{ day, time, title, place, address, mapsUrl, links[], contacts{tel,email}, status: confirmed|tbc|optional|rain, tags[], note }`
  Pole `status` jest najważniejsze, bo grupa musi wiedzieć, co jest **potwierdzone**, a co **do potwierdzenia**.
- **`Code.gs` (ok. 10 linii):**
  ```js
  function doGet(e) {
    return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Husa · Znojmo 2026')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
      .addMetaTag('mobile-web-app-capable', 'yes')
      .setFaviconUrl('https://…/goose.png');
  }
  ```
- **Logika „dziś”:** jeśli data w strefie Europe/Prague mieści się w terminie wyjazdu, strona otwiera bieżący dzień i wyróżnia najbliższy punkt. W przeciwnym razie otwiera dzień 1.

## 4. Etapy

| # | Etap | Czas | Kryterium „gotowe” |
|---|---|---|---|
| 0 | **Decyzje i zamrożenie treści** (pytania w pkt 8) | 15 min | Znany termin (11–14 czy 11–15) i lista zakładek na v1 |
| 1 | **Spike GAS:** hello-world z viewportem, obrazem base64 i linkami do Maps oraz `tel:`. Test na iPhonie i Androidzie. | 30–45 min | Działa przewijanie, linki do Maps otwierają aplikację, baner jest akceptowalny. W przeciwnym razie przechodzimy na plan B. |
| 2 | Szkielet: Vite, Tailwind v4, singlefile, `clasp` | 30 min | `npm run deploy` wysyła stronę do GAS |
| 3 | **Ekstrakcja treści do `trip.json`** z plików md. Linki 1:1 ze źródeł, z `query_place_id`. | 1–2 h | Każdy fakt na stronie ma źródło w `docs/` |
| 4 | Komponenty: nagłówek, info o noclegu, nawigacja, dzień, karta punktu, restauracje, wina, trasy, dzieci | 2–3 h | Zgodność z makietą po poprawkach z pkt 6 |
| 5 | Zachowanie: zakładki, „dziś”, `?day=` / `google.script.history`, zwijanie | 1 h | Odświeżenie strony nie gubi wybranego dnia |
| 6 | Obrazy: kompresja do WebP (ok. 60–120 KB), **zamazanie tablicy rejestracyjnej** | 20 min | Cały HTML < 600 KB |
| 7 | QA: 2 telefony, kontrast, skrypt sprawdzający wszystkie linki (HTTP 200) | 45 min | Zero martwych linków |
| 8 | Wdrożenie, skrócony link i QR do wysłania grupie | 15 min | Link działa w Messengerze i WhatsAppie (wbudowana przeglądarka!) |

Razem ok. 1–1,5 dnia pracy, czyli realnie do zrobienia przed 11 XI.

---

## 5. Sceptyczna krytyka planu

**5.1. Czy GAS to w ogóle dobry wybór?**
Słabych stron jest sporo. Brak offline, baner Google, zimny start przy każdym wejściu, długi i brzydki URL, ryzyko „nowe wdrożenie = nowy link”. Do tego dochodzi wbudowana przeglądarka Messengera lub WhatsAppa: tam iframe GAS bywa kapryśny (ciasteczka stron trzecich, przewijanie). GitHub Pages lub Cloudflare Pages dają czysty URL, natychmiastowe ładowanie i **offline przez Service Worker**. Zaletą GAS jest jedno: dane mogą żyć w **Arkuszu Google** i dają się edytować z telefonu w trakcie wyjazdu. **Wniosek:** jeśli nie planujesz edycji z telefonu przez Arkusz, GAS daje same minusy. Plan budujemy tak, żeby przełączenie hostingu kosztowało 5 minut. Spike z etapu 1 rozstrzyga sprawę na prawdziwych telefonach.

**5.2. Czy build (Vite, Tailwind, singlefile) to nie przerost formy na 3 dni?**
Częściowo tak. Alternatywą jest jeden ręcznie poprawiony `index.html` z makiety. Szybciej na start, ale wtedy dane są rozsiane po 1000 linii HTML, a każda zmiana godziny to grzebanie w markupie. Przy czterech dokumentach źródłowych i zmianach na ostatnią chwilę model danych zwraca się już przy drugiej poprawce. **Kompromis:** build tak, ale minimalny. Bez frameworka, vanilla JS i szablony w template literals.

**5.3. Największe ryzyko to treść, nie technologia.**
Makieta ze Stitcha zawiera **zmyślone lub przekręcone fakty** (lista w pkt 6.1). Gdy ktoś pójdzie „do Enotéki na zamku”, a ona jest na terenie browaru, strona zaszkodzi. Ekstrakcję danych trzeba robić ze źródeł md, nie z makiety, i porównać dwa razy.

**5.4. Kto i jak aktualizuje stronę w trakcie wyjazdu?**
Plan nie ma na to odpowiedzi. Jeśli zmiany robi tylko autor z laptopa, wystarczy `clasp`. Jeśli ma być „poprawię godzinę z telefonu w knajpie”, to dane w Arkuszu Google (GAS) albo edycja `trip.json` w aplikacji GitHub, a wtedy Pages publikuje sam. To trzeba ustalić teraz.

**5.5. Brak offline jest realnym problemem.**
Podziemia, piwnice w Novým Šaldorfie, roaming na granicy CZ/AT w Hardeggu (Austria to też UE, ale zasięg w dolinie Dyji jest słaby). Minimum w GAS: strona ma być na tyle lekka, żeby po jednorazowym otwarciu karta przeglądarki trzymała treść, i **nie** przeładowywać jej przy zmianie zakładki (SPA). Plus PDF lub zrzut ekranu jako awaryjna kopia.

**5.6. Ryzyka pominięte w pierwotnym pomyśle:**
- prywatność: publiczny link, imię „Michał”, tablica rejestracyjna na zdjęciu parkingu;
- obraz w makiecie pochodzi z tymczasowego CDN Stitcha (`lh3.googleusercontent.com/aida-public/…`) i z czasem wygaśnie;
- ceny i godziny mogą się zmienić. Strona powinna mówić „stan na 8 XI” i linkować do źródła.

---

## 6. Review makiety (Stitch v2)

### 6.1. Zgodność treści ze źródłami (najważniejsze)

| Makieta | Źródło w `docs/` | Ocena |
|---|---|---|
| Termin 11–15 XI, zakładka „Niedziela” (wymeldowanie 10:30, sklep Znovínu w Louce) | Plan: **11–14 XI**, brak niedzieli i godziny wymeldowania | Do potwierdzenia. 10:30 nie ma w żadnym źródle |
| Enotéka „Hradní 2 · **Zamek**”, „na zamku” | „Hradní 2, **teren browaru**” | **Błąd** |
| Marsz do Šatova: „8–11 km (skrócona ~5 km)” | „więcej niż 5–6 km, krótsza od Popic” | **Rozjazd liczb** |
| „Pochód na białym koniu”, „komentowana degustacja w piwnicach jezuickich”, „najlepsza kolekcja win 2026”, „Sauvignon Roku”, „Enotéka hit na wynos” | Brak w źródłach | Ozdobniki od AI. Usunąć albo zweryfikować |
| Etykiety „DOCUMENT_4”, „DOCUMENT_5”, „Zabytek UNESCO candidate” | — | Artefakty generatora |
| Linki do Map budowane z adresu, bez `query_place_id` | Źródła mają `query_place_id` | Gorsza precyzja. Brać linki 1:1 |
| Brak telefonów i maili do rezerwacji, brak informacji, co jest „do potwierdzenia” | Plan podaje kontakty i statusy | **Utrata najbardziej praktycznej informacji** |
| Brak mapki dojazdu na parking (`Parkovani Cermakova cesta.png`) | Jest w `docs/` | Mapka jest przydatniejsza niż samo zdjęcie szlabanu |
| Wariant na deszcz tylko w czwartek | Plan ma warianty pogodowe także w piątek i w sobotę | Niespójne |
| Nieużyte: PDF „Znojmo z dzieckiem bez samochodu”, przewodnik historyczny, katalog 13 winiarni (w makiecie 10) | — | Do decyzji, co wchodzi do v1 |

### 6.2. Wygląd i czytelność

**Co działa:**
- spójna, „winna” paleta i dobra hierarchia: godzina, nazwa, opis;
- duże cele dotyku (44 px), kafle z czasem po lewej, dwa najważniejsze skróty (nocleg, parking) od razu w nagłówku;
- karta „główny wybór” z zagnieżdżoną „rezerwą”: dobry wzorzec, warto go powielić.

**Co poprawić (od najważniejszego):**
1. **Plan dnia jest za nisko.** Rozwinięta sekcja „Nocleg i info” i dwie siatki przycisków (5 sekcji i 5 dni, na telefonie po 3 rzędy każda) dają ok. 1,5 ekranu, zanim widać pierwszy punkt. Rozwiązanie: sekcję info zwinąć domyślnie po pierwszym dniu (albo przenieść do zakładki „Info”), główną nawigację dać jako **dolny pasek z ikonami**, a dni jako **poziomy pasek chipów** przypięty pod nagłówkiem.
2. **Brak „dziś / teraz”.** Na wyjeździe najważniejsze pytanie brzmi „co teraz i gdzie?”. Trzeba automatycznie wybierać bieżący dzień i wyróżniać następny punkt.
3. **Za dużo znaczeń kolorów.** Złoty raz oznacza „główny wybór”, raz „obiad”, raz „pochód”, raz „oficjalny start”. Do tego zielony, kamienny, różowy i po dwie plakietki na kartę. Proponuję stały słownik: plakietka czasu + **jeden** status (`Potwierdzone` / `Do potwierdzenia` / `Opcjonalnie` / `Na deszcz`). Kolor niesie znaczenie, a nie dekoruje.
4. **Makieta łamie własny `DESIGN.md`.** Złoto `#d4af37` (system przewiduje bursztyn `#B45309` tylko do wyróżnień), font Space Grotesk w nagłówkach (system: wyłącznie Hanken Grotesk) i dziesiątki stylów inline z gradientami i wewnętrznymi cieniami. Efekt: wizualny szum. Uprościć do jednego akcentu.
5. **Za mały tekst w miejscach praktycznych.** Adresy, partie win i godziny otwarcia mają 12 px (`text-xs`) na różowym tle. Na słońcu albo po degustacji to za mało. Minimum 14 px dla treści, 12 px tylko dla etykiet wersalikami.
6. **Kontakty powinny być klikalne:** `tel:` i `mailto:` jako przyciski w kartach restauracji.
7. **Niespójne CTA:** „Nawiguj do… w Mapach Google ↗”, „Otwórz adres w Mapach ↗”, tytuł jako link. Wybrać jeden wzorzec, np. tytuł plus ikonka pinezki.
8. **Emoji jako ikony** wyglądają różnie na iOS, Androidzie i Windowsie. 🪿 (gęś, Unicode 15) na starszych Androidach pokaże się jako pusty kwadrat. Do logo lepiej użyć SVG.
9. **Długie listy** (7 butelek, 10 winiarni) warto zwijać albo pokazać jako kompaktową tabelę: nazwa, cena, link.
10. Tailwind z CDN (ok. 300 KB JS, kompilacja w przeglądarce, ostrzeżenie „not for production”) daje mignięcie niestylowanej strony na słabym LTE. Kompilujemy CSS przy buildzie.
11. Dostępność: zakładki bez `role="tab"` i `aria-selected`. Drobiazg, ale tani do naprawienia.

---

## 7. Prywatność

Publiczny link „Każdy z linkiem” oznacza, że strona może trafić dalej. Przed publikacją:
- zamazać tablicę rejestracyjną na `parking.jpg`;
- rozważyć usunięcie imion i adresu noclegu z nagłówka (albo świadomie zostawić);
- kontakty do restauracji są publiczne, więc mogą zostać.

## 8. Otwarte pytania

Zebrane w rozmowie z autorem. Po odpowiedziach plan zostanie zaktualizowany.
