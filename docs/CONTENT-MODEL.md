# Modello dei contenuti

## Separazione dei dati

Il prototipo separa contenuti, catalogo, navigazione pubblica e configurazione B2B:

- `data/content.json`: UI, sezioni home e footer;
- `data/products.json`: prodotti e immagini demo;
- `data/navigation.json`: tassonomia pubblica;
- `data/b2b.json`: stringhe UI B2B;
- `data/b2b-demo.json`: dati dimostrativi area privata;
- `data/clients/demo-distributor.json`: feature e navigazione cliente demo.

## Lingua

Sono supportate `it` ed `en`, con fallback `it`. La precedenza è:

1. `?lang=it|en`;
2. preferenza `localStorage`;
3. lingua browser;
4. `defaultLocale`.

## `content.json`

Struttura semplificata:

```json
{
  "defaultLocale": "it",
  "supportedLocales": ["it", "en"],
  "locales": {
    "it": {
      "meta": {},
      "ui": {},
      "main": { "sections": [] },
      "footer": {}
    }
  }
}
```

Tipi di sezione attualmente renderizzati:

| `type` | Contenuto principale |
|---|---|
| `slider` | `slides`, immagini desktop/mobile, autoplay |
| `banner` | immagine desktop/mobile e copy mobile |
| `products` | `productIds`, layout e label sezione |
| `editorial` | titolo, descrizione e CTA |
| `features` | card visuali |
| `services` | elementi testuali |

## `products.json`

Ogni prodotto ha un ID stabile, dati descrittivi, immagine e un campo `href` demo.

Esempio strutturale:

```json
{
  "id": "example-product",
  "artist": "Artist",
  "title": "Title",
  "format": "LP Vinyl",
  "label": "Label",
  "image": "https://cdn.example/image.jpg",
  "href": {
    "it": "https://legacy.example.invalid/it/item/123",
    "en": "https://legacy.example.invalid/en/item/123"
  }
}
```

Gli URL presenti nei dataset storici non implicano che siano navigabili nel frontend.

## Blocco dei target Space1999

Il prototipo non deve creare navigazione verso `space1999.com` o relativi sottodomini, anche quando questi URL sono ancora presenti come dati di snapshot.

La regola viene applicata durante la costruzione DOM:

- `utils.js` scarta `href`, `action` e `data-url` bloccati;
- `b2b-utils.js` applica lo stesso filtro ai componenti B2B;
- `space1999-link-guard.js` rimuove gli stessi attributi anche se vengono aggiunti successivamente.

Questa policy non rimuove URL usati come `src`/`srcset` delle immagini.

## Configurazione B2B

La configurazione cliente demo contiene feature e navigazione privata. La navigazione corrente comprende:

- `dashboard`
- `cart`
- `orders`
- `shipments`
- `documents`
- `profile`
- `carriers`

`catalog` non fa parte della configurazione privata corrente.

Esempio:

```json
{
  "features": {
    "cart": true,
    "orders": true,
    "returns": false
  },
  "navigation": [
    {"id": "dashboard", "labelKey": "navigation.dashboard", "icon": "home"},
    {"id": "cart", "labelKey": "navigation.cart", "icon": "cart", "badgeSource": "cart"}
  ]
}
```

## Provenienza dei dati

I dataset pubblici e B2B sono dimostrativi. Non sono feed e non devono essere interpretati come dati aggiornati o requisiti definitivi.

Nel prodotto reale i dati dovranno arrivare da CMS/PIM/API autorizzati e passare attraverso adapter che producano un view model stabile.

## Regole di evoluzione

- incrementare `version` per cambi incompatibili;
- non riutilizzare un ID per contenuti semanticamente diversi;
- mantenere allineate le strutture IT/EN;
- non inserire HTML nei campi testuali;
- trattare URL e permessi come dati da validare, non come valori implicitamente affidabili.