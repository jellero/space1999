# Guida di integrazione

## Dal mockup al software definitivo

Il prototipo fornisce un view model e comportamenti verificabili, non un'architettura backend. La società di sviluppo può riutilizzare CSS e markup oppure trasporli nel design system scelto mantenendo i contratti descritti in questa cartella.

## Mappatura consigliata

| Prototipo | Sistema definitivo |
|---|---|
| `content.json` | CMS headless o endpoint contenuti |
| `products.json` | PIM/catalog service |
| `navigation.json` | category/taxonomy service |
| `localStorage` lingua | preferenza account/cookie/router |
| link assoluti Space1999 | route generate dal router |
| `image.desktop/mobile` | media field CMS con due asset obbligatori |
| `console.error` | piattaforma di observability |
| form newsletter demo | marketing automation/CRM |

## Strategia API

1. Recuperare contenuto, catalogo e navigazione in parallelo.
2. Validare le risposte lato server e, se utile, anche nel client con uno schema.
3. Convertire i payload in un view model stabile.
4. Renderizzare stati `loading`, `success`, `empty` ed `error` per ogni blocco.
5. Applicare cache e invalidazione in base alla frequenza reale di aggiornamento.

L'interfaccia non deve dipendere direttamente dai nomi dei campi del database o del fornitore CMS.

## Immagini

Nel mockup le copertine sono collegate ai domini pubblici Space1999. Per la produzione:

- verificare diritti, hotlink policy e strategia CDN;
- richiedere nel backoffice un asset desktop e uno mobile per slider e banner;
- validare formato e proporzioni al caricamento, mostrando un'anteprima per entrambi;
- generare formati moderni e varianti responsive dalla rispettiva sorgente;
- fornire `width`, `height`, `srcset` e `sizes`;
- mantenere fallback e placeholder per risorse mancanti;
- evitare URL di cache considerati permanenti senza un contratto esplicito.

## Funzioni da collegare

- autenticazione e registrazione;
- disponibilità e prezzi in tempo reale;
- ricerca, filtri e ricerca avanzata;
- pagina dettaglio e-commerce;
- carrello e checkout;
- newsletter con consenso e double opt-in;
- analytics, consent management e monitoraggio errori.

## Test minimi richiesti

- unit test per adapter e risoluzione lingua;
- contract test per CMS, PIM e tassonomia;
- component test per card, hover, modal e drawer;
- end-to-end per ricerca, lingua e navigazione;
- audit automatici di accessibilità;
- visual regression su desktop, tablet e mobile;
- test di errore, timeout, immagini mancanti e catalogo vuoto.

## Checklist pre-produzione

- [ ] endpoint e route definitivi approvati;
- [ ] Content Security Policy configurata;
- [ ] immagini migrate o autorizzate;
- [ ] asset desktop/mobile di slider e banner verificati nei formati editoriali;
- [ ] cookie e consensi verificati legalmente;
- [ ] form collegati e protetti da abuso;
- [ ] traduzioni revisionate;
- [ ] metriche Core Web Vitals entro budget;
- [ ] logging privo di dati personali;
- [ ] test accessibilità e browser matrix completati;
- [ ] fallback per indisponibilità di CMS/PIM verificati.
