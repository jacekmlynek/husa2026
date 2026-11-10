# MiniSearch 7.2.0

Biblioteka wyszukiwania pełnotekstowego dla wyszukiwarki win (`site/js/wine-search.js`).

- Źródło: paczka npm [`minisearch@7.2.0`](https://github.com/lucaong/minisearch), plik `dist/umd/index.js`.
- Licencja: MIT, tekst w `LICENSE.txt` obok.
- Zminifikowana raz, 10 XI 2026, poleceniem `npx terser@5 dist/umd/index.js -c -m --comments false -o minisearch.min.js` (terser 5.51.2). Wynik: 18 KB, ok. 5,9 KB po gzip.
- Ładowana zwykłym `<script>`, ustawia `window.MiniSearch`. Bez CDN, żeby strona działała offline.

Aktualizacja: pobierz nową wersję, zminifikuj tym samym poleceniem, zmień numer wersji tutaj i uruchom testy w `specs/wyszukiwanie-tekstowe/testy.html`.
