# Guida di integrazione

## Dal mockup al software definitivo

Il repository fornisce un front-end dimostrativo e alcuni view model. Non definisce l’architettura backend definitiva e non deve essere usato per dedurre automaticamente requisiti di business non approvati.

## Mappatura indicativa

| Prototipo | Sistema definitivo |
|---|---|
| `content.json` | CMS o endpoint contenuti |
| `products.json` | PIM/catalog service |
| `navigation.json` | taxonomy/category service |
| `data/clients/*.json` | configurazione derivata dalla sessione/tenant |
| `localStorage` lingua | preferenza account/cookie/router |
| target esterni bloccati nel mockup | route interne generate dal router definitivo |
| immagini remote demo | media/CDN autorizzato |
| `console.error` | observability |
| form newsletter demo | CRM/marketing automation |

## Routing e link

Nel mockup la navigazione verso `space1999.com` e relativi sottodomini è bloccata intenzionalmente.

Il prodotto definitivo dovrà sostituire i riferimenti demo con route applicative approvate. Non va rimossa la protezione senza avere prima definito routing, destinazioni e responsabilità del sistema definitivo.

La guardia client-side attuale non è un controllo di sicurezza sufficiente per la produzione: serve un router coerente e, dove opportuno, una Content Security Policy restrittiva.

## Area privata

La navigazione privata corrente comprende Dashboard, Carrello, Ordini, Spedizioni, Documenti e pagamenti, Profilo aziendale e Corrieri.

Non sono presenti:

- voce Catalogo;
- link “Torna al catalogo”.

Nell’header privato il login pubblico viene sostituito da `Carrello` con badge quantità e `Area riservata`.

## Strategia API

Una possibile integrazione tecnica dovrà definire almeno:

1. sessione e identità cliente;
2. tenant e autorizzazioni;
3. configurazione/feature effettive;
4. catalogo e disponibilità;
5. carrello e ordini;
6. spedizioni;
7. documenti/pagamenti;
8. profilo e corrieri.

Endpoint, payload, idempotenza, errori e transizioni devono essere concordati con SP19 e non sono definiti dal solo mockup.

## Immagini

Alcune immagini del prototipo possono essere ancora referenziate da domini Space1999. Sono asset remoti, non link di navigazione.

Per la produzione:

- verificare diritti e hotlink policy;
- migrare gli asset su infrastruttura autorizzata;
- definire CDN/cache;
- produrre formati responsive e moderni;
- mantenere dimensioni, fallback e placeholder coerenti.

## Funzioni da collegare

- autenticazione e richiesta accesso;
- disponibilità/prezzi;
- ricerca e filtri;
- dettaglio prodotto;
- carrello e ordini;
- spedizioni;
- documenti e pagamenti;
- profilo e corrieri;
- newsletter;
- analytics/consent/monitoraggio errori.

## Test minimi

- unit test per adapter e lingua;
- test del filtro URL e del router;
- contract test per CMS/PIM/API;
- component test per card, modal, drawer e chrome privata;
- end-to-end per lingua, accesso, navigazione e area privata;
- test specifico che verifichi l’assenza di navigazione verso domini bloccati;
- audit accessibilità;
- visual regression desktop/tablet/mobile;
- test errori, timeout e dataset vuoti.

## Checklist pre-produzione

- [ ] endpoint e route definitivi approvati;
- [ ] permessi/tenant definiti server-side;
- [ ] Content Security Policy configurata;
- [ ] immagini migrate o autorizzate;
- [ ] autenticazione e sessione implementate;
- [ ] anti-bot/rate limiting definiti dove necessari;
- [ ] cookie e consensi verificati;
- [ ] traduzioni revisionate;
- [ ] logging privo di dati personali non necessari;
- [ ] test accessibilità e browser matrix completati;
- [ ] fallback per indisponibilità dei servizi verificati.