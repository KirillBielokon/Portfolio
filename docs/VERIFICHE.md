# Verifiche — Studio 04

Apertura concreta, accesso diretto ai progetti, demo completa di Forma Studio, email visibile e servizi chiariti. Dominio e impostazioni HTTPS restano invariati.

## Comportamento

- Build Vite multipagina completata: portfolio e `/demo/forma/` hanno ingressi separati.
- **25/25 test Playwright superati**, 0 falliti e 0 saltati: 16 portfolio, 9 demo.
- Layout senza scorrimento orizzontale a 320, 390, 768 e 1440 px.
- Apertura richiesta, pulsante `#progetti`, accesso diretto alla demo dalla scheda e dal dialog, email `mailto:kirillbielokon@gmail.com` in pagina, footer e contatti.
- Portfolio: laboratorio, concept e disclosure, focus dei dialog, menu mobile, FAQ, selezione servizio, brief WhatsApp completo con email facoltativa, modifica e download. Nessun messaggio inviato al numero reale.
- Forma: quattro pagine principali e tre approfondimenti, filtri, zoom immagini, progetto successivo, cronologia, refresh e collegamenti diretti a pagine interne.
- Modulo Forma: validazione nativa, riferimento al progetto preselezionato, riepilogo completo, copia, download e modifica con dati e focus conservati. Nessuna richiesta POST e nessuna falsa conferma di invio.
- Dichiarazione di progetto personale dimostrativo visibile; studio, progetti e visualizzazioni sono immaginari. Demo esclusa dall’indicizzazione con `noindex,follow`.
- Axe: **zero violazioni** WCAG A/AA e 2.1 AA nei sette stati verificati: portfolio, Forma home, archivio, dettaglio, contatti, riepilogo e menu mobile. Non sostituisce una valutazione completa con tecnologie assistive.

## JavaScript e animazioni

Le scene condividono `useSceneActivity`: una gestione unica per visibilità, scheda nascosta, pausa e preferenza di movimento ridotto. La GPU si inizializza soltanto al primo ingresso effettivo in una scena visibile. I renderer software mantengono la composizione SVG senza scaricare Three.

Verifiche mirate aggiuntive del ciclo WebGL: cambio della preferenza di movimento ridotto a runtime, pausa, uscita dallo schermo, scheda nascosta, errore durante inizializzazione, perdita e ripristino del contesto, rilascio all’unmount. Tutti i casi verificati hanno mantenuto un’immagine completa e non hanno prodotto errori JavaScript. Il damping tiene conto del tempo trascorso anziché del numero di frame.

Il movimento del portfolio aggiorna le proprietà CSS solo se cambia l’avanzamento. Le inclinazioni del puntatore usano al massimo un aggiornamento per frame, geometria memorizzata e correzione della posizione dopo lo scroll. I dati di progetti, servizi e FAQ provengono da `content.js`, evitando copie incoerenti.

## Prestazioni

Lighthouse mobile isolato sul portfolio: **99 prestazioni, 100 accessibilità, 100 best practice, 100 SEO**. FCP/LCP 1,1 s, TBT 130 ms, CLS 0,001. L’ambiente usa il fallback SVG perché il renderer è software: questi numeri non descrivono le prestazioni WebGL su ogni dispositivo.

La demo è passata da 82 a **96 prestazioni**, con **100 accessibilità e 100 best practice**: FCP 0,9 s, LCP 2,8 s, TBT 10 ms, CLS 0,001, Speed Index 0,9 s. Le fotografie hanno varianti WebP 640/1024/1280/1536, con `srcSet` e `sizes`; la villa mobile a 1024 px passa da 342 KB a 105 KB. La risorsa viene anticipata solo sulla homepage, mentre lo zoom conserva gli originali. La fotografia principale è visibile subito; le animazioni di ingresso restano su titoli e dettagli. La categoria SEO della demo non è inclusa nel punteggio perché la pagina è intenzionalmente `noindex`. Sono misure di laboratorio locali, non dati reali dei visitatori.

## Pubblicazione

Deployment riuscito della build `6630ebb195a7be8b5654a49fe9b9f29a3b98dcc8`, run GitHub Pages `40956940095`. Il controllo HTTPS confronta 26 pagine e asset pubblici con la build locale, incluse homepage, demo, bundle e varianti fotografiche: tutti corrispondono. Anche `www` restituisce la homepage corretta dopo il redirect. Dettagli in `PUBBLICAZIONE.md`. I test funzionali sono eseguiti sulla build locale. Le richieste HTTPS al dominio mantengono la verifica TLS; il browser remoto di questo ambiente ha in precedenza mostrato limiti nel proprio trust store, senza disabilitare tale verifica.
