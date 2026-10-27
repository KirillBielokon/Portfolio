# Kirill Bielokon — Fatti notare.

Portfolio personale in italiano per **sviluppo web e social media management**, pubblicato con GitHub Pages sul dominio `kirillbielokon.com`. Il dominio è registrato su IONOS; l’utente ha confermato che sito e HTTPS funzionano. Per aggiornare il design non occorre riconfigurare DNS o rimuovere il dominio.

## Sviluppo

Node.js 22.12+ (verificato con Node 24), npm e Python 3 per il caricamento della build.

```sh
npm ci
npm run dev
```

Nell’ambiente cloud usare `npm ci --cache /tmp/portfolio-npm-cache` per la cache scrivibile. Il checkout è già isolato: non servono worktree aggiuntivi.

## Build e verifiche

```sh
npm run build
npm test
```

I 12 test Playwright avviano la build in anteprima sulla porta 4173. Coprono quattro larghezze, rendering e trasformazioni del laboratorio canvas, pausa, movimento ridotto, selezione dei concept, dialog, accordion, menu da tastiera e WhatsApp/brief. Usano Chromium di sistema se presente; altrove eseguire `npx playwright install chromium` o specificare `CHROMIUM_PATH`.

## Pubblicazione

```sh
npm run build
python3 scripts/publish-pages.py
```

Lo script carica il contenuto di `dist/` nel ramo `gh-pages`, senza cambiare il checkout sorgente, usando un indice temporaneo. Conserva la storia remota e rifiuta aggiornamenti concorrenti, senza force-push. GitHub Pages pubblica quel ramo. Attendere il successo del deployment prima di dichiarare completato l’aggiornamento.

`public/CNAME` deve restare `kirillbielokon.com`; `.nojekyll` conserva il sito statico. Non rimuovere il dominio dal pannello Pages per aggiornare codice o grafica. Conservare le impostazioni DNS e HTTPS già funzionanti.

## Architettura e direzione visiva

- `src/main.jsx`: layout da manifesto, galleria desktop guidata dallo scroll, sequenza mobile, sezioni e regia del movimento con un driver nativo e geometria memorizzata.
- `src/useScrollScene.js`: avanzamento delle scene con un singolo frame per evento, misure memorizzate e aggiornamenti tramite proprietà CSS; nessuna libreria di animazione.
- `src/Playground.jsx`: K modulare disegnata in Canvas2D, che si trasforma in un layout web o tre post social. Puntatore/touch, pausa, preferenza di movimento ridotto, sospensione fuori schermo e a scheda nascosta. Nessuna risorsa remota.
- `src/Dialogs.jsx`: finestre dei concept e generatore del brief con dialog nativi, focus, Escape, copia/download e invio volontario tramite WhatsApp.
- `src/content.js`: servizi, concept, FAQ e contatto confermato da Kirill.
- `src/styles.css`: identità nera/lime/lilla, tipografia Anton/DM Sans/IBM Plex Mono e layout responsive. Font locali con licenza OFL.
- `public/images/`: concept SVG originali per brand immaginari. Restano esplicitamente studi personali, senza clienti o metriche inventati.

Il contatto apre WhatsApp su `+39 389 632 2180`. Il brief è composto nel browser e non viene inviato automaticamente. Nessun backend, tracker o storage del form; nessuna chiave API necessaria per lo sviluppo del sito.

## Anteprime

- [Desktop](docs/anteprima-desktop.png)
- [Mobile](docs/anteprima-mobile.png)
- [Pagina completa, layout lineare](docs/anteprima-completa.png)
- [Storico del collegamento del dominio](docs/PUBBLICAZIONE.md)

Per rigenerare anteprime e immagine social con il server locale in esecuzione: `PREVIEW_ORIGIN=http://127.0.0.1:5173 node scripts/capture-previews.mjs`.
