# Space1999

Prototipo statico, responsive e multilingue di Space1999. Comprende la home pubblica e una proposta funzionale per l’area clienti B2B. Il repository è organizzato come riferimento tecnico per la società che realizzerà il software definitivo: contenuti, presentazione e comportamenti sono separati; non sono presenti dipendenze runtime o passaggi di build obbligatori.

## Stato della consegna

- header responsive con mega-menu full-width e drawer mobile;
- ricerca semplice e avanzata indirizzata alle route Space1999;
- main e footer generati integralmente da JSON;
- slider automatico con cinque creatività mobile `4:5` dedicate, indicatori e gesture;
- banner art-directed desktop e due creatività mobile `4:3` dedicate;
- griglie prodotto con layout `six`, `four` e `featured`;
- interfaccia italiana e inglese selezionabile con `?lang=it` e `?lang=en`;
- prodotti, copertine, cataloghi e link reali rilevati dal sito pubblico Space1999;
- hover prodotto e quick view accessibile;
- accesso, richiesta abilitazione e reset password con punto di integrazione anti-bot;
- area B2B personalizzata da configurazione JSON cliente;
- dashboard, carrello, ordini, spedizioni, documenti, profilo e corrieri;
- separazione esplicita fra carrello, prenotazione ordine e richiesta di spedizione;
- script facoltativi per validare i dati e rigenerare la navigazione durante la manutenzione.

## Pubblicazione

Il progetto è un sito statico e non richiede build, dipendenze runtime o Node.js sul server. È sufficiente pubblicare il contenuto del repository su un normale server HTTP/HTTPS.

## Struttura

```text
.
├── index.html                  # Shell semantica e hook dell’applicazione
├── access.html                 # Login, richiesta accesso e reset B2B
├── account.html                # Shell area privata dimostrativa
├── assets/
│   ├── styles.css              # Sito pubblico
│   ├── b2b.css                 # Componenti e responsive dell’area B2B
│   └── js/
│       ├── app.js              # Bootstrap e isolamento degli errori
│       ├── catalog.js          # Card prodotto e route localizzate
│       ├── content.js          # Renderer di main e footer
│       ├── i18n.js             # Risoluzione lingua e traduzioni UI
│       ├── navigation.js       # Mega-menu e drawer mobile
│       ├── product-modal.js    # Quick view, focus trap e inert
│       ├── search.js           # Ricerca semplice e avanzata
│       ├── slider.js           # Slider accessibile e autoplay controllato
│       ├── utils.js            # Fetch, DOM e accessibilità condivisi
│       ├── b2b-utils.js         # Primitive UI, lingua e formati B2B
│       ├── b2b-access.js        # Flussi pubblici B2B dimostrativi
│       └── b2b-account.js       # Shell, viste e interazioni B2B
├── data/
│   ├── b2b.json                # Copy funzionale B2B in IT/EN
│   ├── b2b-demo.json           # Dataset fittizio dell’area riservata
│   ├── clients/                # Configurazioni cliente allowlisted
│   ├── content.json            # Main, footer e UI in IT/EN
│   ├── menu.json               # Sorgente completa della tassonomia
│   ├── navigation.json         # Payload menu ottimizzato per il browser
│   └── products.json           # Snapshot demo del catalogo reale
├── docs/
│   ├── ARCHITECTURE.md         # Flusso applicativo e responsabilità
│   ├── B2B-AREA.md             # Mappa, flussi, API, sicurezza e decisioni
│   ├── CONTENT-MODEL.md        # Contratti JSON e multilingua
│   └── INTEGRATION.md          # Passaggio a CMS/API e checklist produzione
└── scripts/
    ├── build-navigation.mjs
    └── validate.mjs
```

## Scelte tecniche

- Rendering DOM con `textContent`, senza HTML proveniente dai JSON.
- Caricamento parallelo di contenuti, prodotti e navigazione.
- Errori del menu isolati dagli errori del main/footer.
- Lingua risolta nell'ordine: query string, preferenza salvata, browser, fallback `it`.
- URL localizzati mantenuti nel modello dati, non ricostruiti implicitamente per i prodotti.
- Immagini con dimensioni dichiarate, lazy loading e decoding asincrono.
- Slider e banner renderizzati con `<picture>` e due asset obbligatori pronti per il backoffice.
- Slider fermato su hover/focus, navigabile tramite swipe e disattivato con `prefers-reduced-motion`.
- Varianti mobile dei banner alimentate dallo stesso JSON multilingue delle sezioni desktop.
- Stato del modal sincronizzato con `hidden`, `aria-hidden`, focus e `inert`.

## Dati dimostrativi

`data/products.json` è uno snapshot dei contenuti visibili sul sito pubblico Space1999 al **26 agosto 2026**. Non è un feed e non deve essere considerato aggiornato automaticamente. Le immagini sono referenziate dai domini Space1999 esclusivamente per il mockup.

Nel prodotto definitivo i contenuti devono arrivare da CMS/PIM/API autorizzati, con immagini servite dall'infrastruttura concordata e regole di cache definite dal team backend.

## Documentazione per lo sviluppo

- [Architettura](docs/ARCHITECTURE.md)
- [Area clienti B2B](docs/B2B-AREA.md)
- [Modello contenuti](docs/CONTENT-MODEL.md)
- [Guida di integrazione](docs/INTEGRATION.md)

## Perimetro

Il repository descrive il front-end e i contratti funzionali. Login, anti-bot, disponibilità, prenotazione, pagamenti, documenti e persistenza sono rappresentati come stati dimostrativi ma non sono implementati lato server. Le pagine B2B dichiarano esplicitamente questo confine: la sicurezza e la conferma delle operazioni dipenderanno dalle API e dalla sessione SP19.
