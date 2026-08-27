import { createProductCard, getSectionProducts } from "./catalog.js?v=20260827-3";
import { configureLocale, resolveLocale } from "./i18n.js?v=20260827-3";
import { createElement, fetchJson } from "./utils.js?v=20260827-3";

const PRODUCT_LAYOUTS = new Set(["six", "four", "featured"]);

function renderSlider(sectionData) {
  const section = createElement("section", {
    className: "home-slider container",
    attributes: {
      "data-slider": "",
      "data-autoplay-ms": sectionData.autoplayMs,
      "data-status-template": sectionData.statusLabel,
      "aria-label": sectionData.ariaLabel,
    },
  });
  const viewport = createElement("div", { className: "home-slider__viewport" });
  const track = createElement("div", {
    className: "home-slider__track",
    attributes: { "data-slider-track": "" },
  });
  const status = createElement("p", {
    className: "visually-hidden",
    attributes: { "data-slider-status": "", "aria-live": "polite", "aria-atomic": "true" },
  });

  sectionData.slides.forEach((slideData, index) => {
    const slide = createElement("article", {
      className: `home-slider__slide${index === 0 ? " is-active" : ""}`,
      attributes: {
        "data-slider-slide": "",
        "aria-hidden": String(index !== 0),
        inert: index === 0 ? null : "",
      },
    });
    const link = createElement("a", {
      attributes: { href: slideData.href, tabindex: index === 0 ? 0 : -1 },
    });
    const image = createElement("img", {
      attributes: {
        src: slideData.image,
        alt: slideData.imageAlt,
        width: 1250,
        height: 395,
        loading: index === 0 ? "eager" : "lazy",
        decoding: "async",
        fetchpriority: index === 0 ? "high" : "auto",
      },
    });

    link.append(image);
    slide.append(link);
    track.append(slide);
  });

  const previous = createElement("button", {
    className: "home-slider__control home-slider__control--previous",
    attributes: { type: "button", "data-slider-previous": "", "aria-label": sectionData.previousLabel },
  });
  const next = createElement("button", {
    className: "home-slider__control home-slider__control--next",
    attributes: { type: "button", "data-slider-next": "", "aria-label": sectionData.nextLabel },
  });
  previous.append(createElement("span", { text: "‹", attributes: { "aria-hidden": "true" } }));
  next.append(createElement("span", { text: "›", attributes: { "aria-hidden": "true" } }));
  viewport.append(track, previous, next);
  section.append(viewport, status);
  return section;
}

function renderBanner(sectionData) {
  const section = createElement("section", {
    className: "campaign-banner container",
    attributes: { id: sectionData.id, "aria-label": sectionData.imageAlt },
  });
  const link = createElement("a", { attributes: { href: sectionData.href } });
  const image = createElement("img", {
    attributes: {
      src: sectionData.image,
      alt: sectionData.imageAlt,
      width: 2000,
      height: 430,
      loading: "lazy",
      decoding: "async",
    },
  });
  link.append(image);
  section.append(link);
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
  const layout = PRODUCT_LAYOUTS.has(sectionData.layout) ? sectionData.layout : "six";
  const grid = createElement("div", {
    className: `product-grid product-grid--${layout}`,
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
  slider: renderSlider,
  banner: renderBanner,
  products: renderProductSection,
  editorial: renderEditorial,
  features: renderFeatures,
  services: renderServices,
};

function renderMain(root, mainData, context) {
  const fragment = document.createDocumentFragment();

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
