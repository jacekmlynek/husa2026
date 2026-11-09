/**
 * Husa · Znojmo 2026 — web app w Google Apps Script.
 * W projekcie GAS potrzebne są dwa pliki: Code.gs (ten) i index.html (z `node tools/build-gas.mjs`).
 * Wdrożenie: Wdróż → Nowe wdrożenie → Aplikacja internetowa, wykonuj jako: ja, dostęp: każdy.
 * Aktualizacja: Wdróż → Zarządzaj wdrożeniami → edytuj → Nowa wersja (link zostaje ten sam).
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Husa · Znojmo 2026')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .addMetaTag('mobile-web-app-capable', 'yes')
    .addMetaTag('apple-mobile-web-app-capable', 'yes');
}
