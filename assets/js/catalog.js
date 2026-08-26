import { fetchJson } from "./utils.js";

const COVER_VARIANTS = new Set(["red", "cream", "dark", "blue", "orange", "grey"]);

function createProductCard(product, template) {
  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector("[data-product-card]");
  const link = fragment.querySelector("[data-product-link]");
  const cover = fragment.querySelector("[data-product-cover]");
  const variant = COVER_VARIANTS.has(product.coverVariant) ? product.coverVariant : "grey";
  const meta = [product.format, product.label].filter(Boolean).join(" · ");

  card.dataset.productTitle = product.title;
  card.dataset.productArtist = product.artist;
  card.dataset.productMeta = meta;
  card.dataset.productHref = product.href;

  link.href = product.href;
  link.setAttribute("aria-label", `${product.artist}: ${product.title}`);
  cover.classList.add(`cover--${variant}`);

  fragment.querySelector("[data-product-cover-label]").textContent = product.coverLabel;
  fragment.querySelector("[data-product-title]").textContent = product.title;
  fragment.querySelector("[data-product-artist]").textContent = product.artist;
  fragment.querySelector("[data-product-meta]").textContent = meta;

  return fragment;
}

export async function loadCatalog({ endpoint, template }) {
  const grids = new Map(
    [...document.querySelectorAll("[data-catalog-grid]")].map((grid) => [grid.dataset.catalogGrid, grid]),
  );

  try {
    const data = await fetchJson(endpoint);

    if (!Array.isArray(data.sections)) {
      throw new TypeError("Il payload catalogo non contiene un array sections valido.");
    }

    for (const section of data.sections) {
      const grid = grids.get(section.id);
      if (!grid || !Array.isArray(section.products)) continue;

      const fragment = document.createDocumentFragment();
      for (const product of section.products) {
        fragment.append(createProductCard(product, template));
      }

      grid.replaceChildren(fragment);
      grid.setAttribute("aria-busy", "false");

      const status = document.querySelector(`[data-catalog-status="${section.id}"]`);
      if (status) status.hidden = true;
    }
  } catch (error) {
    for (const [id, grid] of grids) {
      grid.setAttribute("aria-busy", "false");
      const status = document.querySelector(`[data-catalog-status="${id}"]`);
      if (status) status.textContent = "Catalogo temporaneamente non disponibile.";
    }
    throw error;
  }
}
