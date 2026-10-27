# Verifiche — Studio 02

Redesign successivo alla conferma dell’utente che il dominio pubblico funziona. Dominio, record DNS e configurazione HTTPS non vengono modificati per questo aggiornamento.

## Comportamento

- Build Vite completata.
- **12 test Playwright superati**, 0 falliti, sulla build di produzione.
- Rendering reale del canvas, tre composizioni differenti, pausa e movimento ridotto verificati tramite contenuto pixel, oltre allo stato accessibile dei controlli.
- Layout a 320, 390, 768 e 1440 px: nessuno scorrimento orizzontale.
- Galleria desktop: selezione e scroll tra i concept, apertura/chiusura delle finestre e disclosure degli studi personali.
- Mobile: tutti e tre i concept in sequenza verticale.
- Menu mobile: focus contenuto, Escape, ripristino dello sfondo e passaggio a desktop.
- Form: email facoltativa, brief, modifica, download e link WhatsApp corretto. Nessun messaggio inviato al numero reale durante i test.
- Controlli axe: nessuna violazione rilevata su homepage, modalità Social, contatti, menu mobile e progetto Campo nelle schermate verificate.
- Nessun errore JavaScript o richiesta fallita nelle sessioni di verifica funzionale locale.

## Movimento e prestazioni

Il laboratorio sospende l’animazione fuori schermo e a scheda nascosta, supporta una pausa esplicita e la preferenza di movimento ridotto. La regia di scroll usa un driver nativo con misure memorizzate: durante lo scroll non vengono richiesti nuovi calcoli di layout. I contenuti restano visibili anche scorrendo velocemente. Il carattere dei titoli è locale e precaricato.

I risultati di Lighthouse sono misure di laboratorio sulla build locale, non dati dei visitatori reali. Audit finale mobile isolato, sulla build `index-D8RTiwBZ.js`: **prestazioni 95, accessibilità 100, best practice 100, SEO 100**. FCP/LCP 0,8 s; TBT 250 ms; CLS 0; Speed Index 1,2 s. Le scene e il canvas sono attivi durante la misura.
