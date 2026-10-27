# Pubblicazione su kirillbielokon.com

## Stato verificato dopo le modifiche dell’utente

GitHub conferma la pubblicazione riuscita del commit della build `8859e50` nel [deployment Pages #1](https://github.com/KirillBielokon/Portfolio/actions/runs/40536623125), ramo `gh-pages`. L’URL dell’ambiente è `http://kirillbielokon.com/`. Questo è un riscontro di pubblicazione dell’hosting, non una verifica diretta di DNS o HTTPS.

L’utente ha dichiarato di aver completato la configurazione Pages e i record IONOS indicati. Non ripetere né sovrascrivere DNS senza leggerne prima lo stato attuale. Le richieste al dominio e all’API GitHub dall’ambiente continuano a essere respinte dal proxy con HTTP 403 sul tunnel, quindi la propagazione e il certificato non sono stati verificati direttamente. È stato chiesto all’utente cosa vede aprendo `https://kirillbielokon.com` in una finestra privata. Verificare anche **Enforce HTTPS** quando il certificato è disponibile.

Il dominio è registrato su IONOS. Lo screenshot DNS fornito successivamente dall’utente mostra un collegamento già configurato a **ChatGPT Sites**: `www` punta a `custom-domains.chatgpt.site`, con record di verifica OpenAI/Cloudflare. Il contenuto pubblico non è stato verificato dall’ambiente: le richieste sono ancora bloccate dal proxy. I DNS attuali non sono stati modificati.

Il redesign è stato preparato nel repository, non nell’editor Sites. La sessione non espone strumenti per aggiornare o pubblicare il progetto Sites. **GitHub Pages è una destinazione alternativa già predisposta**, non un hosting mancante da acquistare. Aggiornare il progetto Sites originale consentirebbe di mantenere i DNS attuali; per usare la build GitHub occorre invece completare la migrazione dei soli record web dopo aver attivato Pages.

## File pronti

- Sorgente nel ramo `main` del repository `KirillBielokon/Portfolio`.
- Build statica nel ramo `gh-pages`, root `/`, con `CNAME` impostato a `kirillbielokon.com` e `.nojekyll`.
- Per aggiornare i file del ramo: `npm run build`, poi `python3 scripts/publish-pages.py`. Il caricamento non attiva da solo GitHub Pages e non modifica DNS.

## Prerequisiti per la gestione automatica della migrazione

L'ambiente dispone di un accesso GitHub: le operazioni Git di lettura e scrittura sono state verificate. L'API GitHub è inizialmente bloccata dalla policy di rete: il dominio `api.github.com` è stato aggiunto alla bozza e l'accesso API andrà verificato dopo l'applicazione delle impostazioni. Non presumere autorizzazioni di amministrazione Pages dal solo successo di Git push.

La chiave IONOS non serve per modificare i record manualmente nel proprio pannello. Soltanto per delegare la modifica DNS automatica da questo ambiente, creare una chiave API DNS dal portale ufficiale **https://developer.hosting.ionos.com/** e inserirla soltanto nel campo segreto `IONOS_DNS_API_KEY` delle impostazioni dell'ambiente. È un requisito dichiarato: nessun valore è stato fornito o salvato in file/chat.

Nella bozza sono inclusi i domini di rete necessari: `kirillbielokon.com`, `www.kirillbielokon.com`, `api.github.com`, `kirillbielokon.github.io`, `api.hosting.ionos.com` e `developer.hosting.ionos.com`. I preset esistenti dei package manager restano preservati. Rivedere e salvare la configurazione nelle impostazioni, quindi pubblicare l'ambiente quando richiesto. La pubblicazione dell'ambiente non è la pubblicazione del sito.

## Operazioni dopo il collegamento

1. Verificare gli accessi con richieste di sola lettura all'API GitHub Pages e a `https://api.hosting.ionos.com/dns/v1/zones` (intestazione `X-API-Key`, tramite il binding sicuro). Non stampare chiavi o intestazioni di autenticazione.
2. Identificare la zona esatta e leggere/salvare i record DNS attuali prima di qualsiasi cambiamento. Stabilire il servizio che ospita il sito precedente e preservarne il ripristino.
3. Abilitare GitHub Pages per il ramo `gh-pages`, cartella `/`, e configurare il dominio personalizzato. Verificare stato della build ed eventuale richiesta di verifica proprietà.
4. Modificare esclusivamente i record necessari al sito, usando i valori correnti della documentazione GitHub Pages. Preservare record MX, TXT, posta e sottodomini estranei. Non sostituire alla cieca tutta la zona. Valutare eventuali record AAAA o CNAME precedenti che interferiscano con il collegamento.
5. Attendere propagazione DNS e certificato, abilitare HTTPS quando disponibile e verificare l'effettiva nuova homepage e gli asset su dominio principale e `www`.
6. Dichiarare il sito pubblicato solo dopo queste verifiche. Fino ad allora i file su GitHub sono una preparazione al deployment, non prova che il sito pubblico sia stato sostituito.


## Alternativa con i pannelli utente, senza chiave API

1. Aprire https://github.com/KirillBielokon/Portfolio/settings/pages. Selezionare **Deploy from a branch**, ramo **gh-pages**, cartella **/(root)**, e salvare.
2. Impostare **Custom domain** a **kirillbielokon.com** e salvare prima di modificare DNS. Attendere il completamento della build; il controllo DNS può restare in attesa fino al passaggio seguente.
3. Nel pannello IONOS, sostituire i soli due record A `@` visibili nello screenshot (`162.159.143.30` e `172.66.3.26`) con i quattro record A GitHub riportati sotto, modificando quelli presenti e aggiungendo i due mancanti. Modificare il CNAME `www`. Conservare una copia dei valori precedenti. Se compaiono ulteriori record A/AAAA per gli stessi host non presenti nello screenshot, esaminarli prima di procedere.

| Tipo | Nome host | Valore |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | kirillbielokon.github.io |

4. Preservare MX, SPF, DKIM, DMARC, autodiscover, TXT di verifica e `_domainconnect`.
5. Dopo la propagazione verificare sito e certificato, poi attivare **Enforce HTTPS** in GitHub Pages quando disponibile. DNS/HTTPS possono richiedere fino a 24 ore secondo GitHub; non dichiarare completato il passaggio senza verifica.

Valori e ordine verificati nella [documentazione ufficiale GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), tramite il [sorgente ufficiale github/docs](https://github.com/github/docs/blob/main/content/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site.md).
