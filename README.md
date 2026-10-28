# Kirill Bielokon — Un’altra dimensione.

Portfolio in italiano per sviluppo web e social media management. Pubblicato con GitHub Pages su **https://kirillbielokon.com/**; IONOS gestisce il dominio. DNS, custom domain e HTTPS sono già configurati: gli aggiornamenti del sito non richiedono interventi sul dominio.

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

I 14 test Playwright avviano la preview di produzione sulla porta 4173. Verificano layout a 320/390/768/1440 px, fallback e pausa, movimento ridotto, laboratorio web/social, concept, finestre, FAQ, menu da tastiera e brief WhatsApp completo. Usano `/usr/bin/chromium` se disponibile; altrove impostare `CHROMIUM_PATH` o installare il browser Playwright.

## Architettura

- `src/main.jsx` e `src/styles.css`: layout blu notte, blu elettrico e viola, tipografia Sora/DM Sans, superfici in prospettiva, identità estrusa, orbite, animazioni di ingresso e pausa globale.
- `src/HeroScene.jsx`: K estrusa e materiali iridescenti Three.js, sfere, cristallo, particelle e reazione al puntatore. Three viene importato soltanto dopo il controllo della GPU. Renderer software, assenza di WebGL e movimento ridotto usano una composizione SVG completa.
- `src/OrbitScene.jsx`: browser, feed, cubo e anelli in CSS 3D. Le scene sospendono il movimento fuori schermo e nelle schede nascoste.
- `src/ProofLab.jsx`: tre identità dimostrative, sito realmente adattabile a mobile, menu e note, post social con didascalie e obiettivi. I controlli trasformano la composizione senza servizi esterni.
- `src/Dialogs.jsx`: dialog nativi e preparazione del brief nel browser, con email facoltativa, copia, download e invio volontario tramite WhatsApp.
- `src/content.js`: concept e contatto confermato. I brand sono immaginari; non vengono inventati clienti, testimonianze o risultati.
- `public/images/`: concept originali, con fotografie generate per gli studi Forma/Aether incorporate negli SVG. Font distribuiti con licenze OFL in `public/fonts/`.

Il numero WhatsApp è `+39 389 632 2180`. Il sito non invia messaggi automaticamente, non salva i dati del form e non include tracker.

## Pubblicazione

```sh
npm run build
python3 scripts/publish-pages.py
```

Lo script aggiorna `gh-pages` con un indice temporaneo, preserva il checkout e la storia remota e rifiuta aggiornamenti concorrenti, senza force-push. Conservare `public/CNAME` (`kirillbielokon.com`) e `.nojekyll`. Verificare il deployment GitHub Pages e la risposta HTTPS prima di dichiarare pubblicato un aggiornamento.

[Verifiche](docs/VERIFICHE.md) · [Pubblicazione e storico](docs/PUBBLICAZIONE.md)

[Desktop](docs/anteprima-desktop.png) · [Mobile](docs/anteprima-mobile.png) · [Pagina completa](docs/anteprima-completa.png)

Per rigenerare anteprime e immagine social, avviare il server e usare `PREVIEW_ORIGIN=http://127.0.0.1:5173 node scripts/capture-previews.mjs`.
