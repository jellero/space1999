# Space1999 — front-end prototype

Prototipo statico e responsive della home page Space1999. Il repository documenta layout, navigazione, ricerca, catalogo, hover prodotto, quick view e footer da integrare nel software definitivo.

## Obiettivi

- preservare il comportamento visivo approvato;
- separare contenuti, presentazione e logica;
- fornire componenti accessibili e facilmente sostituibili con dati API;
- evitare dipendenze e passaggi di build non necessari per il prototipo.

## Struttura

```text
.
├── index.html                  # Markup semantico e template delle card
├── assets/
│   ├── styles.css              # Token, componenti e breakpoint responsive
│   └── js/
│       ├── app.js              # Bootstrap dell'applicazione
│       ├── catalog.js          # Rendering sicuro delle card da JSON
│       ├── navigation.js       # Mega-menu e drawer mobile
│       ├── product-modal.js    # Quick view e gestione del focus
│       ├── search.js           # Ricerca semplice e avanzata
│       └── utils.js            # Utility condivise
├── data/
│   ├── menu.json               # Sorgente completa con dati di governance
│   ├── navigation.json         # Payload runtime alleggerito
│   └── products.json           # Dati dimostrativi del catalogo
└── scripts/
    ├── build-navigation.mjs    # Genera il payload runtime dal menu sorgente
    └── validate.mjs            # Controlli di coerenza e sintassi
```

## Avvio locale

I moduli JavaScript e i file JSON richiedono un server HTTP. Dalla root del progetto:

```bash
python3 -m http.server 8080
```

Aprire `http://localhost:8080`. Non aprire direttamente `index.html` con il protocollo `file://`.

## Comandi di controllo

Il progetto non installa pacchetti e richiede Node.js 20 o superiore.

```bash
npm run build:navigation
npm run validate
```

`build:navigation` elimina dal payload browser i metadati di audit non usati dall'interfaccia. `validate` controlla JSON, identificativi, corrispondenza fra sezioni e markup e sintassi dei moduli.

## Contratti dati

### Navigazione

`data/navigation.json` espone:

```json
{
  "version": 1,
  "menu": [
    {
      "label": "MUSIC",
      "href": "#/music",
      "sections": [
        {
          "label": "Vinyl",
          "href": "#/music/vinyl",
          "items": [{ "label": "LP Vinyl", "href": "#/music/vinyl/lp" }]
        }
      ]
    }
  ]
}
```

### Catalogo

`data/products.json` raggruppa i prodotti per `section.id`. Ogni prodotto richiede:

- `id`: identificativo univoco;
- `artist`, `title`, `format`, `label`: contenuto della card e del modal;
- `coverLabel`, `coverVariant`: rappresentazione grafica del prototipo;
- `href`: destinazione della pagina dettaglio.

Nell'applicazione definitiva `coverLabel` e `coverVariant` dovranno essere sostituiti da URL immagine ottimizzati e relativi testi alternativi.

## Integrazione nel software definitivo

1. Sostituire gli endpoint JSON in `assets/js/app.js` con le API del catalogo e della tassonomia.
2. Mantenere i componenti di rendering oppure mapparli nel framework scelto dalla società di sviluppo.
3. Collegare login, registrazione e ricerca agli endpoint reali.
4. Sostituire i testi e i prodotti dimostrativi con dati del CMS/PIM.
5. Servire immagini responsive con `srcset`, dimensioni dichiarate e lazy loading.
6. Applicare Content Security Policy, monitoraggio degli errori e test automatici nel progetto applicativo.

## Accessibilità implementata

- skip link al contenuto principale;
- landmark e titoli semantici;
- stati `aria-expanded`, `aria-hidden` e `aria-busy`;
- focus trap e ripristino del focus per drawer e quick view;
- chiusura con `Esc`, pulsante e overlay;
- blocco dello sfondo con `inert` durante l'apertura del modal;
- supporto a `prefers-reduced-motion`;
- messaggi di errore non bloccanti per menu e catalogo.

## Nota sul perimetro

Questo repository è un prototipo di front-end, non contiene logica e-commerce, autenticazione, carrello, pagamenti, analytics o persistenza. I link a Space1999 sono riferimenti funzionali per la fase di handoff e dovranno essere sostituiti dalle route definitive.
