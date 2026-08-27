import { createElement } from "./utils.js?v=20260827-2";

/**
 * Restituisce la route prodotto per la lingua attiva, con fallback esplicito.
 * Il contratto supporta anche una stringa per facilitare l'integrazione con API
 * che restituiscono URL già localizzati.
 */
export function resolveProductHref(product, locale, fallbackLocale = "it") {
  if (typeof product.href === "string") return product.href;
  return product.href?.[locale] ?? product.href?.[fallbackLocale] ?? "#";
}

/** Crea una card senza innerHTML: tutti i valori JSON passano da textContent. */
export function createProductCard(product, { locale, fallbackLocale = "it" }) {
  const href = resolveProductHref(product, locale, fallbackLocale);
  const meta = [product.format, product.label].filter(Boolean).join(" · ");
  const card = createElement("article", {
    className: "product-card",
    attributes: { "data-product-card": "", "data-product-id": product.id },
  });
  const link = createElement("a", {
    className: "product-card__link",
    attributes: {
      href,
      "data-product-link": "",
      "aria-label": `${product.artist}: ${product.title}`,
    },
  });
  const cover = createElement("div", {
    className: "cover",
    attributes: { "data-product-cover": "", "aria-hidden": "true" },
  });
  const image = createElement("img", {
    attributes: {
      src: product.image,
      alt: "",
      width: 1000,
      height: 1000,
      loading: "lazy",
      decoding: "async",
    },
  });

  card.dataset.productTitle = product.title;
  card.dataset.productArtist = product.artist;
  card.dataset.productMeta = meta;
  card.dataset.productHref = href;

  cover.append(image);
  link.append(
    cover,
    createElement("h3", { text: product.artist }),
    createElement("p", { text: product.title }),
    createElement("small", { text: meta }),
  );
  card.append(link);

  return card;
}

/** Risolve gli ID dichiarati nel contenuto editoriale contro il catalogo. */
export function getSectionProducts(section, productsById) {
  return section.productIds.map((id) => {
    const product = productsById.get(id);
    if (!product) throw new Error(`Prodotto ${id} non disponibile per la sezione ${section.id}.`);
    return product;
  });
}
