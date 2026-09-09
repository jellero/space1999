# Area clienti B2B

## Scopo del documento

Questo documento descrive lo stato attuale del prototipo B2B presente nel repository. Le scelte di interfaccia e i comportamenti qui riportati non devono essere interpretati automaticamente come requisiti definitivi SP19: workflow, regole di business, API, permessi e sicurezza devono essere validati separatamente.

## Pagine

- `access.html?mode=login`: accesso cliente;
- `access.html?mode=request`: richiesta pubblica di accesso;
- `access.html?mode=reset`: recupero password;
- `account.html?client=demo-distributor&view=dashboard`: area privata dimostrativa;
- `lang=it|en`: selezione lingua.

## Navigazione privata attuale

La configurazione `data/clients/demo-distributor.json` espone queste voci:

| Voce | View |
|---|---|
| Dashboard | `dashboard` |
| Carrello | `cart` |
| Ordini | `orders` |
| Spedizioni | `shipments` |
| Documenti e pagamenti | `documents` |
| Profilo aziendale | `profile` |
| Corrieri | `carriers` |

La voce `Catalogo` non è presente nella navigazione privata e la sidebar non contiene il link “Torna al catalogo”.

`returns` resta una feature disabilitata nella configurazione demo.

## Header dell’area privata

La chrome condivisa viene caricata anche su `account.html`, ma in stato privato viene adattata da `assets/js/b2b-private-chrome.js`:

- il form pubblico con e-mail/password non viene mostrato;
- al suo posto compaiono `Carrello` e `Area riservata`;
- il badge Carrello usa la quantità totale già calcolata nella navigazione privata;
- la stessa logica viene applicata alla versione mobile.

## Link esterni

Le pagine B2B non devono creare navigazione verso `space1999.com` o suoi sottodomini.

La protezione è applicata dalla chrome B2B, dalle primitive DOM condivise e dalla guardia globale `assets/js/space1999-link-guard.js`, che rimuove `href`, `action` e `data-url` bloccati anche quando vengono introdotti dinamicamente.

Gli URL usati esclusivamente per caricare immagini non sono trattati come link navigabili.

## Accesso pubblico B2B

La pagina `access.html` contiene soltanto i flussi funzionali di login, richiesta accesso e reset. Il copy promozionale precedentemente presente nella pagina di accesso è stato rimosso anche dal payload B2B.

Nel prototipo i form non implementano autenticazione reale. L’esito positivo porta alla sessione cliente demo; nel prodotto reale autenticazione, anti-bot, rate limiting, sessione e autorizzazione dovranno essere gestiti dal backend.

## Configurazione cliente

`data/clients/demo-distributor.json` contiene un view model client-side con:

- identificativo configurazione demo;
- moduli abilitati;
- ordine della navigazione privata;
- sorgente badge carrello;
- widget dashboard;
- permessi di presentazione;
- feature disabilitate.

Estratto:

```json
{
  "clientId": "demo-distributor",
  "features": {
    "cart": true,
    "orders": true,
    "shipments": true,
    "documents": true,
    "profile": true,
    "carriers": true,
    "returns": false
  },
  "navigation": [
    {"id": "dashboard", "labelKey": "navigation.dashboard", "icon": "home"},
    {"id": "cart", "labelKey": "navigation.cart", "icon": "cart", "badgeSource": "cart"},
    {"id": "orders", "labelKey": "navigation.orders", "icon": "orders"}
  ]
}
```

La configurazione client-side non è una fonte affidabile per autorizzazioni. Nel prodotto reale identità, tenant, permessi e feature effettive devono arrivare dalla sessione e dal backend.

## Dati dimostrativi

| File | Responsabilità |
|---|---|
| `data/b2b.json` | stringhe IT/EN usate dall’interfaccia |
| `data/clients/demo-distributor.json` | configurazione e navigazione cliente demo |
| `data/b2b-demo.json` | dati di dominio dimostrativi |

I dati demo non devono essere considerati dati reali o specifiche contrattuali.

## Stato dei flussi

Il prototipo rappresenta visualmente carrello, ordini, spedizioni, documenti, profilo e corrieri. Eventuali regole presenti nei dati o nei messaggi del mockup devono essere trattate come ipotesi di interfaccia finché non vengono validate con SP19.

In particolare non vanno assunti come definitivi senza conferma:

- regole di disponibilità e prenotazione;
- transizioni ordine/spedizione;
- gestione di sostituzioni o quantità ridotte;
- spedizioni parziali o multiple;
- struttura documenti/pagamenti;
- campi profilo modificabili;
- gestione corrieri;
- processo resi.

## Contratti backend da definire

Il front-end richiederà almeno servizi per:

- autenticazione/sessione;
- contesto cliente e permessi;
- profilo e indirizzi;
- carrello;
- ordini;
- richieste di spedizione;
- documenti e pagamenti;
- corrieri.

Nomi endpoint, payload e semantica non sono definitivi nel prototipo.

## Sicurezza minima attesa nel prodotto reale

- autenticazione e autorizzazione server-side;
- filtro tenant su ogni risorsa;
- protezione da IDOR/BOLA;
- cookie/sessione configurati in modo sicuro;
- protezione CSRF quando applicabile;
- rate limiting su login/reset/richiesta accesso;
- anti-bot verificato server-side;
- download documenti autorizzato al momento della richiesta;
- log e audit senza esposizione non necessaria di dati personali.

## Responsive e accessibilità

Il prototipo usa:

- sidebar desktop e drawer mobile;
- tabelle trasformate in schede alle larghezze ridotte;
- dialog e drawer richiudibili con `Esc`;
- focus ripristinato dopo la chiusura;
- `prefers-reduced-motion` per ridurre le transizioni.

## Decisioni ancora aperte

Restano da definire con SP19, tra le altre:

- autenticazione e regole password/reset;
- anti-bot;
- campi e consensi della richiesta accesso;
- permessi reali per cliente;
- campi profilo modificabili;
- regole di disponibilità e ordine;
- stati ordine/spedizione;
- spedizioni parziali/multiple;
- documenti, pagamenti e retention;
- corrieri;
- resi;
- integrazioni e payload API.

Questi punti non devono essere risolti unilateralmente nel solo front-end.