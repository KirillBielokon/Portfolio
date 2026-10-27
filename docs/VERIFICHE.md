# Verifiche del redesign

Eseguite il 27 ottobre 2026 sulla nuova versione locale. Non costituiscono una verifica del dominio pubblico o del progetto Sites, che non sono stati aggiornati da questa sessione.

- Installazione riproducibile: `npm ci --cache /tmp/portfolio-npm-cache --no-audit --no-fund` completata.
- Build di produzione: `npm run build` completata.
- Test Playwright: 10 superati, 0 falliti. Coprono layout a 320/390/768/1440 px, finestre progetto, dichiarazione dei concept, accordion, WhatsApp e brief, menu da tastiera e movimento ridotto.
- Controlli axe: nessuna violazione rilevata su homepage, tre finestre progetto, contatti, brief e menu mobile dopo il completamento delle animazioni.
- Lighthouse mobile emulato, build di produzione locale: prestazioni 98, accessibilità 100, best practice 100, SEO 100. LCP 2,3 s; CLS 0; TBT 60 ms. Sono misure di laboratorio, non dati degli utenti reali.
- Nessun errore JavaScript o richiesta fallita rilevata nelle sessioni di verifica.
- Immagine hero responsive: varianti 640/960/1536 px, con caricamento della versione da 72 KB nel profilo mobile Lighthouse.
- Controllati pausa dello scorrimento decorativo, ripristino del menu al resize desktop e link WhatsApp diretto nella sezione contatti.
- Nessun messaggio di prova è stato inviato al numero WhatsApp reale; sono stati verificati solamente indirizzi e testo precompilato.

## Stato di consegna

Il codice, gli asset, le anteprime e la build `dist/` sono presenti nel checkout. Installazione e avvio sono salvati nella bozza della configurazione cloud. La bozza richiede revisione/salvataggio nelle impostazioni e pubblicazione dell’ambiente; questa operazione è distinta dalla pubblicazione del sito web.

Non sono disponibili strumenti di modifica o pubblicazione del progetto Sites collegato. Il sito pubblico `kirillbielokon.com` non è stato sostituito. Il pacchetto `/workspace/portfolio-pronto-da-pubblicare.zip` contiene i file statici da caricare sul proprio hosting; README.md descrive la configurazione.
