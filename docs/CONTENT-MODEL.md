# Modello dei contenuti

## Separazione dei dati

Il contenuto editoriale e il catalogo sono separati per riflettere due responsabilità tipiche:

- `data/content.json`: CMS, traduzioni, ordine delle sezioni e footer;
- `data/products.json`: PIM/catalogo, schede prodotto e immagini;
- `data/navigation.json`: tassonomia e-commerce ottimizzata per il browser.

## Risoluzione della lingua

Sono supportate `it` ed `en`, con fallback `it`. L'ordine di precedenza è:

1. parametro URL `?lang=it|en`;
2. preferenza in `localStorage`;
3. lingua del browser;
4. `defaultLocale`.

Il parametro URL rende ogni variante condivisibile e testabile. Il cambio lingua ricarica intenzionalmente la pagina per mantenere una navigazione progressivamente migliorabile anche senza router client-side.

## `content.json`

Struttura principale:

```json
{
  "defaultLocale": "it",
  "supportedLocales": ["it", "en"],
  "locales": {
    "it": {
      "meta": {},
      "ui": {},
      "main": {
        "hero": {},
        "sections": []
      },
      "footer": {}
    }
  }
}
```

### Tipi di sezione

| `type` | Campi specifici | Renderer |
|---|---|---|
| `products` | `productIds`, `viewAllLabel`, `compact` | griglia di card |
| `editorial` | `description`, `ctaLabel` | banner testuale |
| `features` | `items[]`, `image`, `variant` | due promozioni visuali |
| `services` | `items[].title/description` | fascia servizi |

Gli ID e l'ordine delle sezioni devono coincidere in tutte le lingue. `npm run validate` applica questa regola.

## `products.json`

Ogni prodotto ha un ID stabile e URL espliciti per lingua:

```json
{
  "id": "airbourne-airbourne",
  "artist": "Airbourne",
  "title": "Airbourne",
  "format": "LP Vinyl",
  "label": "Spinefarm",
  "image": "https://cover.space1999.com/...jpg",
  "href": {
    "it": "https://space1999.com/it/shop/item/99438756",
    "en": "https://space1999.com/en/shop/item/99438756"
  }
}
```

Le sezioni referenziano i prodotti tramite `productIds`; in questo modo una scheda può essere riutilizzata senza duplicare i dati di catalogo.

## Provenienza e aggiornamento

Il blocco `source` dichiara provenienza, data di acquisizione e natura dello snapshot. I dati inclusi sono stati rilevati dalla home pubblica Space1999 il 26 agosto 2026 e servono soltanto per il mockup.

In produzione sostituire lo snapshot con una risposta API versionata. Se il backend restituisce un modello differente, introdurre un adapter che produca lo stesso view model invece di accoppiare i componenti direttamente alla risposta di rete.

## Regole di evoluzione

- Incrementare `version` per cambi incompatibili.
- Non riutilizzare un `id` per contenuti semanticamente diversi.
- Aggiungere prima il renderer, poi il nuovo `type` ai JSON.
- Mantenere le stesse sezioni per tutte le lingue oppure definire esplicitamente una policy di fallback.
- Non inserire HTML nei campi testuali.
