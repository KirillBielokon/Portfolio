# Verifiche — Studio 03

Redesign scuro, blu elettrico e viola, con scene WebGL/CSS 3D e laboratorio web/social. Le impostazioni del dominio restano invariate.

## Comportamento verificato

- Build Vite completata; 14 test Playwright superati, nessun test saltato.
- Nessun errore JavaScript o richiesta fallita nella verifica locale degli asset.
- Nessuno scorrimento orizzontale a 320, 390, 768 e 1440 px; contatti raggiungibili.
- Composizione SVG completa senza GPU, movimento effettivo e pausa verificati; preferenza di movimento ridotto rispettata.
- Laboratorio: cambio settore, dimensioni, menu, note, didascalie dei post, vista coordinata e accesso ai contatti.
- Tre concept esplorabili su desktop e telefono, dichiarazione esplicita dei brand immaginari, Escape e ripristino del focus.
- Menu mobile con focus contenuto, Escape e ripristino al passaggio desktop.
- FAQ con stato accessibile; servizio social preselezionato nel brief.
- Form con email facoltativa, messaggio completo, download e modifica. Nessun messaggio di test inviato al numero reale.
- Axe: zero violazioni WCAG A/AA e 2.1 AA rilevate nei cinque stati controllati: desktop, progetto Forma, contatti, menu mobile e homepage a 390 px. Questo non sostituisce una valutazione completa con tecnologie assistive.

## Scene e prestazioni

La scena hero usa Three.js su GPU compatibili e conserva una composizione SVG negli altri casi. Il controllo esplicito dei renderer software avviene prima dell’import di Three: evita il costo del rendering 3D su CPU. Una seconda scena usa CSS 3D, senza un secondo contesto WebGL. Pausa, movimento ridotto e visibilità delle scene controllano il movimento continuo.

Lighthouse mobile isolato sulla build locale: **prestazioni 99, accessibilità 100, best practice 100, SEO 100**. FCP/LCP 0,9 s; TBT 140 ms; CLS 0; Speed Index 1,4 s. Il browser di laboratorio usa la composizione SVG, perché dispone di un renderer software. Queste misure non descrivono le prestazioni WebGL su ogni dispositivo reale.

## Hosting

Verifica API in sola lettura: Pages dal ramo `gh-pages`, dominio `kirillbielokon.com`, HTTPS forzato. Prima dell’aggiornamento, il dominio principale risponde HTTPS 200 e `www` reindirizza a quello principale con 301. Deployment Studio 03 riuscito: run `40677881602`, build `414cf5f4b63b2958ef8906b1a853fc63ca7e2f38`. Homepage, JS, CSS, favicon e immagine social pubblici coincidono con la build verificata; `www` restituisce lo stesso HTML dopo il redirect. La navigazione remota Chromium resta limitata dal trust store dell’ambiente; richieste HTTPS Python/OS con verifica TLS e test funzionali locali sono completati.
