# Pubblicazione su kirillbielokon.com

Il dominio è registrato su IONOS. Non è stato confermato un piano Web Hosting: per il portfolio statico si prepara quindi **GitHub Pages**, usando il repository pubblico esistente. Non richiede di acquistare hosting IONOS.

## File pronti

- Sorgente nel ramo `main` del repository `KirillBielokon/Portfolio`.
- Build statica nel ramo `gh-pages`, root `/`, con `CNAME` impostato a `kirillbielokon.com` e `.nojekyll`.
- Per aggiornare i file del ramo: `npm run build`, poi `python3 scripts/publish-pages.py`. Il caricamento non attiva da solo GitHub Pages e non modifica DNS.

## Prerequisiti ancora necessari

L'ambiente dispone di un accesso GitHub: le operazioni Git di lettura e scrittura sono state verificate. L'API GitHub è inizialmente bloccata dalla policy di rete: il dominio `api.github.com` è stato aggiunto alla bozza e l'accesso API andrà verificato dopo l'applicazione delle impostazioni. Non presumere autorizzazioni di amministrazione Pages dal solo successo di Git push.

Per operare sui DNS senza condividere la password IONOS, creare una chiave API DNS dal portale ufficiale **https://developer.hosting.ionos.com/** e inserirla soltanto nel campo segreto `IONOS_DNS_API_KEY` delle impostazioni dell'ambiente. È un requisito dichiarato: nessun valore è stato fornito o salvato in file/chat.

Nella bozza sono inclusi i domini di rete necessari: `kirillbielokon.com`, `www.kirillbielokon.com`, `api.github.com`, `kirillbielokon.github.io`, `api.hosting.ionos.com` e `developer.hosting.ionos.com`. I preset esistenti dei package manager restano preservati. Rivedere e salvare la configurazione nelle impostazioni, quindi pubblicare l'ambiente quando richiesto. La pubblicazione dell'ambiente non è la pubblicazione del sito.

## Operazioni dopo il collegamento

1. Verificare gli accessi con richieste di sola lettura all'API GitHub Pages e a `https://api.hosting.ionos.com/dns/v1/zones` (intestazione `X-API-Key`, tramite il binding sicuro). Non stampare chiavi o intestazioni di autenticazione.
2. Identificare la zona esatta e leggere/salvare i record DNS attuali prima di qualsiasi cambiamento. Stabilire il servizio che ospita il sito precedente e preservarne il ripristino.
3. Abilitare GitHub Pages per il ramo `gh-pages`, cartella `/`, e configurare il dominio personalizzato. Verificare stato della build ed eventuale richiesta di verifica proprietà.
4. Modificare esclusivamente i record necessari al sito, usando i valori correnti della documentazione GitHub Pages. Preservare record MX, TXT, posta e sottodomini estranei. Non sostituire alla cieca tutta la zona. Valutare eventuali record AAAA o CNAME precedenti che interferiscano con il collegamento.
5. Attendere propagazione DNS e certificato, abilitare HTTPS quando disponibile e verificare l'effettiva nuova homepage e gli asset su dominio principale e `www`.
6. Dichiarare il sito pubblicato solo dopo queste verifiche. Fino ad allora i file su GitHub sono una preparazione al deployment, non prova che il sito pubblico sia stato sostituito.
