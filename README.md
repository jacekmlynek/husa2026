# Husa · Znojmo 2026

Statyczna strona z planem wyjazdu (11–15 XI 2026). Bez backendu i bez budowania, JavaScript służy tylko do nawigacji.

```
site/            ← gotowa strona (to publikujemy)
  index.html
  css/style.css
  js/data.js     ← CAŁA treść: plan, restauracje, wino, spacery, dzieci
  js/app.js      ← render i zakładki
  img/           ← zdjęcia (tablica rejestracyjna zamazana), ikony
  sw.js          ← tryb offline na GitHub Pages
gas/             ← wersja dla Google Apps Script (jeden plik)
tools/build-gas.mjs
tools/salon-vin/ ← skrypty danych Salon vín (pobieranie, parsowanie, scalanie, audyt)
docs/            ← materiały źródłowe i makieta
  salon-vin/     ← wyniki Salon vín ČR 2024–2026 jako JSON (+ README z opisem pól)
```

## Podgląd lokalny

Wystarczy otworzyć `site/index.html` w przeglądarce. Tryb offline działa tylko przez https (GitHub Pages).

## Zmiana treści

Edytuj `site/js/data.js`.

Wina: rejestr win, winiarni, Top 10, czempionów i katalogu jest w `site/js/wines.js`. Zdjęcia butelek i logo pobiera `python tools/build-wine-media.py` (źródła w słowniku `BOTTLES` i `LOGOS`). Skrypt zapisuje `site/img/wina/`, `site/img/logo/` i `site/js/wine-media.js` z podpisami źródeł. Wina bez zdjęcia dostają na stronie stylizowaną butelkę.

Dane Salon vín ČR (krajowy konkurs win, Národní vinařské centrum, Valtice): w `docs/salon-vin/salon-vin-2024.json`, `-2025.json` i `-2026.json` są wszystkie złote wina z pełną kartą z katalogu i punktami, srebrne z punktami oraz profile producentów. Rok 2026 ma dodatkowo linki do kart, e-sklepu, zdjęć i GPS. Opis pól, zasady scalania i znane błędy źródeł: `docs/salon-vin/README.md`. Dopasowanie do win z naszej strony: `docs/Salon-vin-2024-2026-wina-ze-strony.md`. Dane są jeszcze **nie** podłączone do `site/`. Odtworzenie i kontrola jakości (`audit.py`, `audit2.py`, `audit3.py`): `tools/salon-vin/README.md`. Źródłowe PDF/XLSX (ok. 12 MB na rok) nie są w repozytorium, ich adresy są w polu `sources` każdego pliku.

Podglądy map tras: `python tools/build-route-maps.py` składa kafelki OpenStreetMap ze śladem GPX w `site/img/trasy/<id>.webp` (+ `site/js/route-maps.js`). Kafelki są w pamięci podręcznej `docs/trasy-kafelki/`, więc ponowne uruchomienie ich nie pobiera.

Mapa ciekawostek: `python tools/build-facts-map.py` rysuje ponumerowane miejsca z zakładki Ciekawostki na kafelkach OSM (`site/img/historia/mapa-ciekawostek.webp`). Ilustracje do osi czasu pochodzą z Wikimedia Commons (wolne licencje, autorzy podani na stronie).

Zdjęcia restauracji i winiarni: `python tools/build-venue-media.py` (źródła w słowniku `VENUES`: strony lokali, firmy.cz, Wikimedia Commons). Wynik: `site/img/lokale/` i `site/js/venue-media.js` z podpisami źródeł.

Trasy: wrzuć plik GPX do `docs/trasy/`, dopisz go w `SOURCES` w `tools/build-routes.mjs`, uruchom `node tools/build-routes.mjs` i dodaj opis trasy w `walks.gpx` w `data.js`. Skrypt kopiuje GPX do `site/trasy/` i wylicza km, przewyższenia, kształt oraz profil trasy do `site/js/routes.js`. Przy publikacji na GitHub Pages podbij też `VERSION` w `site/sw.js`, żeby telefony pobrały nową wersję.

## Publikacja A: GitHub Pages (zalecana, darmowa)

Na darmowym koncie GitHub Pages działa dla **publicznych** repozytoriów.

1. Na github.com: **New repository** → nazwa np. `husa` → **Public** → bez README → **Create**.
2. W repozytorium: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Wypchnij ten katalog do gałęzi `main` (np. przez GitHub Desktop: *Add existing repository* → *Publish*).
4. Workflow `.github/workflows/pages.yml` sam opublikuje katalog `site/`. Po ok. minucie strona jest pod adresem
   `https://<twój-login>.github.io/husa/`.

Plusy: krótki adres, szybkie ładowanie, działa bez zasięgu po pierwszym otwarciu, brak banera Google.

## Publikacja B: Google Apps Script

1. `node tools/build-gas.mjs` → powstaje `gas/index.html` (ok. 330 KB, wszystko w środku).
2. W [script.google.com](https://script.google.com) nowy projekt: wklej `gas/Code.gs` do `Code.gs`, dodaj plik HTML `index` i wklej `gas/index.html`.
3. **Wdróż → Nowe wdrożenie → Aplikacja internetowa**, „Wykonuj jako: ja”, „Kto ma dostęp: każdy”.
4. Przy zmianach: **Zarządzaj wdrożeniami → edytuj → Nowa wersja**. Nie twórz nowego wdrożenia, bo zmieni się link.

Ograniczenia GAS: szary baner Google u góry, brak trybu offline, wolniejsze otwieranie.
