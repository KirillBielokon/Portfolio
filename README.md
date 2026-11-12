# Kirill Bielokon — Siti web e software su misura

Portfolio in italiano: siti web, landing page, gestionali su misura e social media. Pubblicato con GitHub Pages su **https://kirillbielokon.com/**; IONOS gestisce il dominio. DNS, custom domain e HTTPS sono già configurati: gli aggiornamenti del sito non richiedono interventi sul dominio.

## Sviluppo

Node.js 22.12+ (verificato su Node 24), npm, Python 3 per il caricamento statico.

```sh
npm ci --cache /tmp/portfolio-npm-cache --no-audit --no-fund
npm run dev -- --port 5173
```

Il checkout cloud `/workspace/Portfolio` è già isolato. Non servono worktree aggiuntivi, API o credenziali per sviluppare il sito. Font, immagini e scene sono locali.

## Build e verifiche

```sh
npm run build
npm test
```

I 21 test Playwright avviano la preview di produzione sulla porta 4173. Verificano contenuti leggibili senza JavaScript, layout a 320/390/768/1024/1440 px senza scroll orizzontale, immagini, navigazione, menu mobile, FAQ, movimento ridotto e brief WhatsApp. Coprono anche la demo Forma: navigazione, cronologia e refresh, filtri, gallerie, menu mobile e form locale senza invii esterni. Usano `/usr/bin/chromium` se disponibile; altrove impostare `CHROMIUM_PATH` o installare il browser Playwright.

## Architettura (studio-05, novembre 2026)

Pagina **statica** (`index.html`): tutti i testi sono nell'HTML, quindi Google li legge subito senza eseguire JavaScript. Niente React né Three.js sulla home: JS di circa 4 kB.

- `index.html`: contenuti, meta SEO, Open Graph e dati strutturati `ProfessionalService` (JSON-LD).
- `src/site.css`: carta + inchiostro + un accento elettrico (`--accent`). Font Geist, Geist Mono e Instrument Serif corsivo, tutti locali.
- `src/site.js`: comparsa al scroll, inclinazione 3D della scena in apertura, menu mobile, FAQ, pulsante WhatsApp flottante e brief che prepara il messaggio per WhatsApp o email (nessun dato salvato o inviato dal sito). Rispetta “riduci movimento”.
- `public/images/lavori/`: schermate WebP dei progetti reali (Pianura Bonsai, gestionale Studio) con dati di prova.
- `public/images/*.svg`: concept degli studi personali (Forma, Aether, Campo).

### Statistiche visite

In `src/site.js` imposta `GOATCOUNTER_CODE` con il codice del tuo account gratuito [GoatCounter](https://www.goatcounter.com) (senza cookie, nessun banner necessario). Vengono contati anche i clic su WhatsApp, email e brief (`clic-…`).

### Lighthouse (build di produzione, mobile)

Prestazioni 99 · Accessibilità 100 · Best practice 100 · SEO 100.

## Demo completa di Forma

Aprire **`/demo/forma/`** sul server di sviluppo o in produzione. Ha un ingresso HTML e un bundle separati, configurati in `vite.config.js`: non viene caricata insieme al portfolio.

- `src/demos/forma/`: homepage, progetti filtrabili, tre schede, studio e contatti.
- Percorsi hash come `/demo/forma/#/progetti/loft-luce`: navigazione, cronologia e refresh funzionano su GitHub Pages senza un server applicativo o regole di riscrittura.
- Il modulo valida i campi e prepara un riepilogo locale, copiabile e scaricabile. Non invia email, non salva dati e non finge richieste ricevute.
- Brand, architetture e visualizzazioni sono dimostrativi; la dichiarazione resta visibile e la demo ha `noindex,follow`.
- Immagini WebP locali in `public/images/forma-demo/`; visualizzazioni generate per questo progetto personale.

## Pubblicazione

```sh
npm run build
python3 scripts/publish-pages.py
```

Lo script aggiorna `gh-pages` con un indice temporaneo, preserva il checkout e la storia remota e rifiuta aggiornamenti concorrenti, senza force-push. Conservare `public/CNAME` (`kirillbielokon.com`) e `.nojekyll`. Dopo il successo del deployment GitHub Pages, eseguire `python3 scripts/verify-publication.py --cache-key SHA_GH_PAGES --output /tmp/portfolio-live.json`: confronta via HTTPS le due pagine, i bundle, le immagini della demo e il redirect www con la build locale. La verifica TLS resta abilitata.

[Verifiche](docs/VERIFICHE.md) · [Pubblicazione e storico](docs/PUBBLICAZIONE.md)

[Desktop](docs/anteprima-desktop.png) · [Mobile](docs/anteprima-mobile.png) · [Pagina completa](docs/anteprima-completa.png) · [Demo Forma](docs/anteprima-forma.png)

