# Salon vín – skrypty danych

Odtwarzają pliki `docs/salon-vin/salon-vin-RRRR.json` i dokument `docs/Salon-vin-2024-2026-wina-ze-strony.md`. Tylko biblioteka standardowa Pythona, plus `pdftotext` (Poppler) do PDF i Node do odczytu `site/js/wines.js`.

Pliki źródłowe (PDF ok. 12 MB każdy, XLSX) nie są w repozytorium. Serwer NVC bywa bardzo wolny, więc do pobierania PDF używaj `curl -C -` z ponawianiem.

## Kolejność

```sh
W=/tmp/salon   # katalog roboczy poza repo
mkdir -p $W/dl $W/out $W/cache

# 1. Pobranie źródeł (dla RRRR = 2024, 2025, 2026)
curl -L -C - -o $W/dl/salonRRRR.pdf https://www.vinarskecentrum.cz/storage/files/Katalog-Salon-vin-RRRR-web.pdf   # 2024: Katalog-Salon-vin-2024.pdf
curl -L -o $W/dl/medaileRRRR.xlsx https://www.vinarskecentrum.cz/download/zlate-a-stribrne-medaile-salon-vin-RRRR.xlsx

# 2. PDF -> tekst -> karty złotych win, profile producentów
pdftotext -enc UTF-8 -layout $W/dl/salonRRRR.pdf $W/dl/salonRRRR.txt
python tools/salon-vin/parse_pdf.py $W/dl/salonRRRR.txt RRRR $W/out/pdfRRRR.json

# 3. XLSX -> złote i srebrne z punktami
python tools/salon-vin/parse_xlsx.py $W/dl/medaileRRRR.xlsx $W/out/xlsxRRRR.json

# 4. Strona 2026: karty win, e-sklep, zdjęcia, GPS z mapy, profile winiarni
python tools/salon-vin/scrape2026.py $W/out/salon2026.json $W/cache

# 5. Scalenie i normalizacja (zasady w docs/salon-vin/README.md)
python tools/salon-vin/merge.py docs/salon-vin $W/out 2024 2025 2026

# 6. Kontrola jakości: duplikaty, warianty nazw, artefakty tekstu, wartości spoza zakresu
python tools/salon-vin/audit.py docs/salon-vin $W/out/audit.txt
#    + porównanie z tabelami statystyk katalogu, typy pól, daty, kategorie vs cukier, profile producentów
python tools/salon-vin/audit2.py docs/salon-vin $W/out/audit2.txt
#    + nagłówki kart vs arkusz, srebrne PDF vs XLSX, format profili, GPS vs podobszar, nasza strona vs Salon, duplikaty winiarni
#      (site-wines.json – patrz krok 7)
python tools/salon-vin/audit3.py docs/salon-vin $W/out $W/out/site-wines.json $W/out/audit3.txt

# 7. Dokument dla win z naszej strony
node -e "global.window={};require('./site/js/wines.js');require('fs').writeFileSync(process.argv[1],JSON.stringify({producers:window.WINES.producers,wines:window.WINES.wines}))" $W/out/site-wines.json
python tools/salon-vin/make_doc.py docs/salon-vin $W/out/site-wines.json docs/Salon-vin-2024-2026-wina-ze-strony.md
```

Na Windows ustaw `PYTHONIOENCODING=utf-8`, żeby komunikaty z czeskimi znakami nie psuły konsoli.
