import { createProductCard, getSectionProducts } from "./catalog.js?v=20260826-11";
import { configureLocale, resolveLocale } from "./i18n.js?v=20260826-11";
import { createElement, fetchJson } from "./utils.js?v=20260826-11";

function renderHero(hero) {
  const section = createElement("section", {
    className: "hero container",
    attributes: { "aria-labelledby": "hero-title" },
  });
  const copy = createElement("div", { className: "hero__copy" });
  const title = createElement("h1", { text: hero.title, attributes: { id: "hero-title" } });
  const mediaLink = createElement("a", {
    className: "hero__media",
    attributes: { href: hero.href, "aria-label": hero.ctaLabel },
  });
  const image = createElement("img", {
    attributes: {
      src: hero.image,
      alt: hero.imageAlt,
      width: 1250,
      height: 395,
      decoding: "async",
    },
  });

  copy.append(
    createElement("p", { className: "eyebrow", text: hero.eyebrow }),
    title,
    createElement("p", { text: hero.description }),
    createElement("a", {
      className: "button button--dark",
      text: hero.ctaLabel,
      attributes: { href: hero.href },
    }),
  );
  mediaLink.append(image);
  section.append(copy, mediaLink);
  return section;
}

function renderProductSection(sectionData, productsById, locale, fallbackLocale) {
  const section = createElement("section", {
    className: "product-section container",
    attributes: { id: sectionData.id, "aria-labelledby": `${sectionData.id}-title` },
  });
  const heading = createElement("div", { className: "section-heading" });
  const headingCopy = createElement("div");
  const viewAll = createElement("a", {
    attributes: { href: sectionData.href },
  });
  const grid = createElement("div", {
    className: `product-grid${sectionData.compact ? " product-grid--compact" : ""}`,
    attributes: { "data-catalog-grid": sectionData.id },
  });

  headingCopy.append(
    createElement("p", { className: "eyebrow", text: sectionData.eyebrow }),
    createElement("h2", {
      text: sectionData.title,
      attributes: { id: `${sectionData.id}-title` },
    }),
  );
  viewAll.append(
    document.createTextNode(`${sectionData.viewAllLabel} `),
    createElement("span", { text: "→", attributes: { "aria-hidden": "true" } }),
  );
  heading.append(headingCopy, viewAll);

  const products = getSectionProducts(sectionData, productsById);
  grid.append(...products.map((product) => createProductCard(product, { locale, fallbackLocale })));
  section.append(heading, grid);
  return section;
}

function renderEditorial(sectionData) {
  const section = createElement("section", {
    className: "editorial-banner",
    attributes: { "aria-labelledby": `${sectionData.id}-title` },
  });
  const inner = createElement("div", { className: "container editorial-banner__inner" });
  const heading = createElement("div");

  heading.append(
    createElement("p", { className: "eyebrow", text: sectionData.eyebrow }),
    createElement("h2", {
      text: sectionData.title,
      attributes: { id: `${sectionData.id}-title` },
    }),
  );
  inner.append(
    heading,
    createElement("p", { text: sectionData.description }),
    createElement("a", {
      className: "button button--light",
      text: sectionData.ctaLabel,
      attributes: { href: sectionData.href },
    }),
  );
  section.append(inner);
  return section;
}

function renderFeatures(sectionData) {
  const section = createElement("section", {
    className: "split-feature container",
    attributes: { "aria-label": sectionData.ariaLabel },
  });

  for (const item of sectionData.items) {
    const link = createElement("a", {
      className: `feature-card feature-card--${item.variant}`,
      attributes: { href: item.href },
    });
    link.append(
      createElement("img", {
        className: "feature-card__image",
        attributes: {
          src: item.image,
          alt: "",
          loading: "lazy",
          decoding: "async",
          width: 1000,
          height: 1000,
        },
      }),
      createElement("span", { text: item.eyebrow }),
      createElement("strong", { text: item.title }),
      createElement("em", { text: `${item.ctaLabel} →` }),
    );
    section.append(link);
  }

  return section;
}

function renderServices(sectionData) {
  const section = createElement("section", {
    className: "service-strip",
    attributes: { "aria-label": sectionData.ariaLabel },
  });
  const grid = createElement("div", { className: "container service-strip__grid" });

  for (const item of sectionData.items) {
    const service = createElement("div");
    service.append(
      createElement("strong", { text: item.title }),
      createElement("span", { text: item.description }),
    );
    grid.append(service);
  }

  section.append(grid);
  return section;
}

const MAIN_RENDERERS = {
  products: renderProductSection,
  editorial: renderEditorial,
  features: renderFeatures,
  services: renderServices,
};

function renderMain(root, mainData, context) {
  const fragment = document.createDocumentFragment();
  fragment.append(renderHero(mainData.hero));

  for (const sectionData of mainData.sections) {
    const renderer = MAIN_RENDERERS[sectionData.type];
    if (!renderer) throw new Error(`Tipo sezione non supportato: ${sectionData.type}.`);
    fragment.append(renderer(sectionData, context.productsById, context.locale, context.fallbackLocale));
  }

  root.replaceChildren(fragment);
  root.setAttribute("aria-busy", "false");
}

function createFooterGroup(group) {
  const section = createElement("section");
  const list = createElement("ul");

  for (const item of group.links) {
    const listItem = createElement("li");
    listItem.append(createElement("a", { text: item.label, attributes: { href: item.href } }));
    list.append(listItem);
  }

  section.append(createElement("h2", { text: group.title }), list);
  return section;
}

function createNewsletter(newsletter) {
  const section = createElement("section", { className: "footer-newsletter" });
  const form = createElement("form", { attributes: { "data-newsletter-form": "" } });
  const field = createElement("div", { className: "footer-newsletter__field" });
  const input = createElement("input", {
    attributes: {
      type: "email",
      autocomplete: "email",
      required: "",
      placeholder: newsletter.placeholder,
      "aria-label": newsletter.inputLabel,
    },
  });
  const status = createElement("p", {
    className: "newsletter-status",
    attributes: { role: "status", hidden: "" },
  });

  field.append(input, createElement("button", { text: newsletter.submitLabel, attributes: { type: "submit" } }));
  form.append(field, status);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = newsletter.demoMessage;
    status.hidden = false;
  });

  section.append(
    createElement("h2", { text: newsletter.title }),
    createElement("p", { text: newsletter.description }),
    form,
  );
  return section;
}

function renderFooter(root, footerData) {
  const grid = createElement("div", { className: "container footer-grid" });
  const bottom = createElement("div", { className: "container footer-bottom" });

  grid.append(createNewsletter(footerData.newsletter), ...footerData.groups.map(createFooterGroup));
  bottom.append(...footerData.legal.map((item) => createElement("span", { text: item })));
  root.replaceChildren(grid, bottom);
  root.setAttribute("aria-busy", "false");
}

/**
 * Carica il modello editoriale e il catalogo in parallelo, seleziona la lingua
 * e compone main/footer. La funzione restituisce il contesto utile agli altri
 * moduli senza creare dipendenze globali.
 */
export async function loadPageContent({ contentEndpoint, productsEndpoint, mainRoot, footerRoot }) {
  const [content, catalog] = await Promise.all([
    fetchJson(contentEndpoint),
    fetchJson(productsEndpoint),
  ]);

  if (!Array.isArray(content.supportedLocales) || !content.locales) {
    throw new TypeError("Configurazione multilingue non valida.");
  }
  if (!Array.isArray(catalog.items)) {
    throw new TypeError("Catalogo prodotti non valido.");
  }

  const locale = resolveLocale(content);
  const localeContent = content.locales[locale] ?? content.locales[content.defaultLocale];
  const productsById = new Map(catalog.items.map((product) => [product.id, product]));
  const context = { locale, fallbackLocale: content.defaultLocale, productsById };

  configureLocale({ locale, localeContent });
  renderMain(mainRoot, localeContent.main, context);
  renderFooter(footerRoot, localeContent.footer);

  return { locale, localeContent, source: catalog.source };
}
