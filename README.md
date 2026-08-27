# Space1999 — professional front-end handoff

Prototipo statico, responsive e multilingue della home page Space1999. Il repository è organizzato come riferimento tecnico per la società che realizzerà il software definitivo: contenuti, presentazione e comportamenti sono separati; non sono presenti dipendenze runtime o passaggi di build obbligatori.

## Stato della consegna

- header responsive con mega-menu full-width e drawer mobile;
- ricerca semplice e avanzata indirizzata alle route Space1999;
- main e footer generati integralmente da JSON;
- slider automatico con le cinque campagne reali, indicatori e gesture mobile;
- banner full-width su desktop e schede promozionali dedicate su mobile;
- griglie prodotto con layout `six`, `four` e `featured`;
- interfaccia italiana e inglese selezionabile con `?lang=it` e `?lang=en`;
- prodotti, copertine, cataloghi e link reali rilevati dal sito pubblico Space1999;
- hover prodotto e quick view accessibile;
- validazione automatica dei contratti dati e della sintassi JavaScript.

## Avvio locale

I moduli ES e i file JSON richiedono HTTP. Dalla root:

```bash
python3 -m http.server 8080
```

Aprire `http://localhost:8080/?lang=it` oppure `http://localhost:8080/?lang=en`.

## Comandi

Il progetto non installa pacchetti e richiede Node.js 20 o superiore.

```bash
npm run build:navigation
npm run validate
```

- `build:navigation` genera il payload runtime alleggerito da `data/menu.json`.
- `validate` controlla lingue, sezioni, riferimenti prodotto, campi obbligatori, hook HTML e sintassi dei moduli.

## Struttura

```text
.
├── index.html                  # Shell semantica e hook dell'applicazione
├── assets/
│   ├── styles.css              # Token, componenti, stati e breakpoint
│   └── js/
│       ├── app.js              # Bootstrap e isolamento degli errori
│       ├── catalog.js          # Card prodotto e route localizzate
│       ├── content.js          # Renderer di main e footer
│       ├── i18n.js             # Risoluzione lingua e traduzioni UI
│       ├── navigation.js       # Mega-menu e drawer mobile
│       ├── product-modal.js    # Quick view, focus trap e inert
│       ├── search.js           # Ricerca semplice e avanzata
│       ├── slider.js           # Slider accessibile e autoplay controllato
│       └── utils.js            # Fetch, DOM e accessibilità condivisi
├── data/
│   ├── content.json            # Main, footer e UI in IT/EN
│   ├── menu.json               # Sorgente completa della tassonomia
│   ├── navigation.json         # Payload menu ottimizzato per il browser
│   └── products.json           # Snapshot demo del catalogo reale
├── docs/
│   ├── ARCHITECTURE.md         # Flusso applicativo e responsabilità
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
- Slider fermato su hover/focus, navigabile tramite swipe e disattivato con `prefers-reduced-motion`.
- Varianti mobile dei banner alimentate dallo stesso JSON multilingue delle sezioni desktop.
- Stato del modal sincronizzato con `hidden`, `aria-hidden`, focus e `inert`.

## Dati dimostrativi

`data/products.json` è uno snapshot dei contenuti visibili sul sito pubblico Space1999 al **26 agosto 2026**. Non è un feed e non deve essere considerato aggiornato automaticamente. Le immagini sono referenziate dai domini Space1999 esclusivamente per il mockup.

Nel prodotto definitivo i contenuti devono arrivare da CMS/PIM/API autorizzati, con immagini servite dall'infrastruttura concordata e regole di cache definite dal team backend.

## Documentazione per lo sviluppo

- [Architettura](docs/ARCHITECTURE.md)
- [Modello contenuti](docs/CONTENT-MODEL.md)
- [Guida di integrazione](docs/INTEGRATION.md)

## Perimetro

Il repository descrive il front-end. Login, registrazione, newsletter, carrello, disponibilità, prezzi, pagamenti, analytics e persistenza non sono implementati. I form senza backend sono intenzionalmente dimostrativi; le route pubbliche Space1999 servono a verificare navigazione e contenuti.
