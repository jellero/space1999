# Space1999

Prototipo statico, responsive e multilingue di Space1999. Comprende la home pubblica, i flussi di accesso B2B e una shell dimostrativa dell’area clienti. Il repository è un riferimento tecnico front-end: markup, contenuti JSON e comportamenti JavaScript sono separati e non richiedono build obbligatoria per essere pubblicati.

## Stato attuale

- header responsive con mega-menu desktop e drawer mobile;
- home, footer, menu e catalogo dimostrativo alimentati da JSON;
- slider, banner, griglie prodotto e quick view;
- interfaccia italiana e inglese tramite `?lang=it` e `?lang=en`;
- accesso, richiesta abilitazione e reset password B2B come flussi dimostrativi;
- area privata con `dashboard`, `cart`, `orders`, `shipments`, `documents`, `profile` e `carriers`;
- menu privato senza voce `Catalogo` e senza link “Torna al catalogo”;
- nell’header dell’area privata il form login viene sostituito da `Carrello` con badge quantità e `Area riservata`;
- il form login resta nella home pubblica e ha `z-index: 999`;
- i target navigabili verso `space1999.com` e relativi sottodomini sono bloccati in tutto il frontend;
- eventuali immagini remote possono ancora usare domini Space1999 come sorgente asset, ma non diventano link navigabili.

## Pubblicazione

Il progetto è statico. È sufficiente pubblicare il contenuto del repository su un server HTTP/HTTPS. Node.js è necessario soltanto per gli script di manutenzione/validazione, non per il runtime del sito.

## Struttura

```text
.
├── index.html                       # Home pubblica
├── access.html                      # Login, richiesta accesso e reset B2B
├── account.html                     # Shell area privata dimostrativa
├── assets/
│   ├── styles.css                   # Stili condivisi del sito pubblico
│   ├── b2b.css                      # Componenti dell’area B2B
│   ├── b2b-chrome.css               # Allineamento chrome B2B al sito pubblico
│   ├── b2b-private-chrome.css       # Varianti header dell’area autenticata
│   └── js/
│       ├── app.js                   # Bootstrap home
│       ├── content.js               # Renderer main/footer
│       ├── catalog.js               # Card prodotto
│       ├── navigation.js            # Mega-menu e drawer mobile
│       ├── i18n.js                  # Lingua e traduzioni UI
│       ├── search.js                # Comportamento ricerca locale/dimostrativo
│       ├── product-modal.js         # Quick view
│       ├── slider.js                # Slider
│       ├── utils.js                 # Primitive DOM, fetch e filtro URL
│       ├── space1999-link-guard.js  # Guardia globale contro target Space1999
│       ├── b2b-utils.js             # Primitive condivise B2B
│       ├── b2b-chrome.js            # Header/footer condivisi nelle pagine B2B
│       ├── b2b-private-chrome.js    # Header autenticato e badge carrello
│       ├── b2b-access.js            # Flussi access/request/reset
│       └── b2b-account.js           # Viste e interazioni area privata
├── data/
│   ├── content.json                 # Home/footer/UI IT-EN
│   ├── navigation.json              # Navigazione pubblica
│   ├── products.json                # Snapshot demo catalogo
│   ├── b2b.json                     # Stringhe funzionali B2B
│   ├── b2b-demo.json                # Dataset dimostrativo area privata
│   └── clients/
│       └── demo-distributor.json    # Feature e navigazione cliente demo
├── docs/
│   ├── ARCHITECTURE.md
│   ├── B2B-AREA.md
│   ├── CONTENT-MODEL.md
│   └── INTEGRATION.md
└── scripts/
    ├── build-navigation.mjs
    └── validate.mjs
```

## Politica dei link esterni

Il frontend non deve navigare verso `space1999.com` o un suo sottodominio.

La protezione è applicata su più livelli:

1. gli URL hardcoded di navigazione sono stati rimossi dalle shell HTML e dalla chrome B2B;
2. `utils.js` e `b2b-utils.js` non impostano `href`, `action` o `data-url` quando il target appartiene a `space1999.com` o a un suo sottodominio;
3. `space1999-link-guard.js` ripulisce anche elementi creati o modificati dinamicamente tramite `MutationObserver`.

La regola riguarda la navigazione. Gli URL usati esclusivamente come `src`/`srcset` di immagini non vengono rimossi da questa guardia.

## Area privata B2B

La configurazione cliente demo espone soltanto:

- Dashboard
- Carrello
- Ordini
- Spedizioni
- Documenti e pagamenti
- Profilo aziendale
- Corrieri

`Catalogo` non fa parte della navigazione privata. La sidebar non contiene un ritorno al catalogo pubblico.

L’header dell’area privata non mostra campi e-mail/password: `b2b-private-chrome.js` sostituisce l’entry point pubblico con `Carrello` e `Area riservata`. Il badge del carrello usa la stessa quantità calcolata nella navigazione privata.

## Dati dimostrativi

`data/products.json` e `data/b2b-demo.json` sono snapshot/dataset dimostrativi, non feed aggiornati automaticamente. Possono contenere riferimenti storici o asset remoti utili al mockup.

I dati e i comportamenti del prototipo non costituiscono automaticamente requisiti definitivi del software SP19. Le decisioni di business, i contratti API, i permessi e i workflow devono essere validati separatamente.

## Documentazione

- [Architettura](docs/ARCHITECTURE.md)
- [Area clienti B2B](docs/B2B-AREA.md)
- [Modello contenuti](docs/CONTENT-MODEL.md)
- [Guida di integrazione](docs/INTEGRATION.md)

## Perimetro

Il repository implementa un front-end dimostrativo. Autenticazione reale, autorizzazione, disponibilità, prenotazione, pagamenti, documenti, persistenza e integrazione SP19 non sono implementati lato server.