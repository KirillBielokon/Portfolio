# Kirill Bielokon — Portfolio

Portfolio in italiano dedicato a **sviluppo web e social media management**. React, Vite, CSS e asset locali; nessun CMS, account o chiave API necessari.

## Avvio

Richiede Node.js 22.12+ (verificato con Node 24) e npm.

```sh
npm ci
npm run dev
```

In questo ambiente cloud, usare `npm ci --cache /tmp/portfolio-npm-cache` per mantenere la cache in un percorso scrivibile.

## Build e verifiche

```sh
npm run build
npm test
```

I test Playwright avviano automaticamente la build in anteprima sulla porta 4173. Verificano layout a quattro larghezze, progetti, accordion, WhatsApp, compilazione del brief, tastiera e movimento ridotto. Usano Chromium di sistema se presente; altrove installare il browser con `npx playwright install chromium` o specificare `CHROMIUM_PATH`.

## Contenuti e contatti

- `src/content.js`: servizi, progetti, FAQ e numero WhatsApp confermato da Kirill.
- `src/main.jsx`: sezioni, finestre dei concept e generatore del brief.
- `src/styles.css`: identità visiva, animazioni e layout responsive.
- `public/images/`: asset locali. I concept di Forma, Aether e Campo sono studi per brand immaginari, dichiarati esplicitamente; non vengono attribuiti a clienti reali.
- La scultura della hero è un’immagine generata per questa direzione visiva. I mockup web/social sono illustrazioni SVG originali; i caratteri sono distribuiti dai pacchetti Fontsource con licenza OFL.

Il contatto principale apre WhatsApp sul numero `+39 389 632 2180`. Il brief è composto esclusivamente nel browser; il visitatore deve scegliere di aprire WhatsApp e inviare il messaggio. Non esiste un finto invio server. Non sono integrati tracker, analytics, cookie applicativi o storage del form.

## Pubblicazione

`npm run build` genera il sito statico in `dist/`. Configurazione hosting:

- comando di installazione: `npm ci`
- comando di build: `npm run build`
- directory pubblica: `dist`

Il sito può essere distribuito su un hosting statico, ad esempio Cloudflare Pages, Netlify o Vercel. In alternativa, caricare il contenuto di `dist` nella document root dell’hosting esistente. Non caricare soltanto `index.html`: servono anche `assets/` e `images/`.

Questo repository non era collegato a un deployment e conteneva soltanto un README. Il redesign è stato costruito e verificato localmente: non è stato pubblicato su `kirillbielokon.com` né nel progetto Sites collegato, per cui non erano disponibili strumenti in questa sessione. Il dominio in canonical, sitemap e metadati corrisponde al dominio indicato da Kirill; se si usa un altro dominio, aggiornare questi riferimenti prima della pubblicazione.

L’ambiente cloud è già isolato: usare questo checkout, senza creare worktree aggiuntivi.

## Anteprime e risultati

- [Anteprima desktop](docs/anteprima-desktop.png)
- [Anteprima mobile](docs/anteprima-mobile.png)
- [Pagina completa](docs/anteprima-completa.png)
- [Verifiche eseguite](docs/VERIFICHE.md)

## Collegamento al dominio IONOS

È stata predisposta una destinazione GitHub Pages per il repository esistente, senza acquistare hosting. Il sorgente e il ramo di distribuzione non bastano a collegare il dominio: attivazione Pages, autorizzazione DNS IONOS e verifica pubblica sono passaggi distinti. Vedi [stato e procedura di pubblicazione](docs/PUBBLICAZIONE.md).
