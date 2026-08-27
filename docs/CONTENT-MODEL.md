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
| `slider` | `slides`, `autoplayMs`, `image.desktop/mobile`, etichette controlli | campagne art-directed; indicatori e swipe su mobile |
| `banner` | `image.desktop/mobile`, `imageAlt`, `href`, `mobile` | banner desktop e scheda promozionale mobile |
| `products` | `productIds`, `viewAllLabel`, `layout` | griglia di card |
| `editorial` | `description`, `ctaLabel` | banner testuale |
| `features` | `items[]`, `image`, `variant` | due promozioni visuali |
| `services` | `items[].title/description` | fascia servizi |

### Layout delle griglie prodotto

| `layout` | Uso previsto |
|---|---|
| `six` | cataloghi standard, fino a 6 colonne desktop |
| `four` | selezioni compatte, 4 colonne desktop |
| `featured` | prima card in evidenza e griglia densa |

Il renderer applica soltanto valori presenti nella whitelist; un layout sconosciuto viene rifiutato dalla validazione.

### Varianti mobile

Slider e banner non vengono semplicemente ridotti. Sotto `700px` lo slider usa una superficie `4:5`, mantiene visibile la creatività mobile sopra uno sfondo derivato dalla stessa immagine e aggiunge indicatori e gesture orizzontale. Il banner usa una superficie `4:3` e diventa una scheda composta da media e contenuto localizzato.

Ogni creatività dichiara obbligatoriamente i due asset richiesti dal backoffice:

```json
{
  "image": {
    "desktop": "https://cdn.example/slider-desktop.jpg",
    "mobile": "https://cdn.example/slider-mobile.jpg"
  },
  "imageAlt": "Descrizione della campagna"
}
```

Il renderer produce un elemento `<picture>` con breakpoint `700px`: il browser scarica la risorsa adatta alla viewport. Formati editoriali consigliati: `1250 × 395px` per lo slider desktop, `750 × 938px` per lo slider mobile, `2000 × 430px` per il banner desktop e `900 × 675px` per il banner mobile.

Il secondo campo `mobile` dei banner contiene invece il copy breve della scheda:

```json
{
  "eyebrow": "Catalogo in evidenza",
  "title": "Le novità Space1999",
  "ctaLabel": "Apri il catalogo"
}
```

La separazione consente al CMS di fornire sia un'immagine con art direction mobile sia un copy corto adatto a schermi stretti, senza duplicare URL e metadati della campagna.

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
