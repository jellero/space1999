import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readText = (relativePath) => readFile(path.join(projectRoot, relativePath), "utf8");
const readJson = async (relativePath) => JSON.parse(await readText(relativePath));

const [navigation, content, products, html, css] = await Promise.all([
  readJson("data/navigation.json"),
  readJson("data/content.json"),
  readJson("data/products.json"),
  readText("index.html"),
  readText("assets/styles.css"),
]);

if (!Array.isArray(navigation.menu) || navigation.menu.length !== 7) {
  throw new Error("La navigazione runtime deve contenere le 7 categorie principali.");
}

if (!content.defaultLocale || !Array.isArray(content.supportedLocales)) {
  throw new Error("Il file contenuti deve dichiarare defaultLocale e supportedLocales.");
}

if (!content.supportedLocales.includes(content.defaultLocale)) {
  throw new Error("defaultLocale deve essere incluso in supportedLocales.");
}

const supportedMainTypes = new Set(["slider", "banner", "products", "editorial", "features", "services"]);
const requiredMainTypes = new Set(["slider", "banner", "products"]);
const supportedProductLayouts = new Set(["six", "four", "featured"]);
let referenceSectionIds = null;
const referencedProductIds = new Set();

function validateResponsiveImage(image, context) {
  if (!image || typeof image !== "object") {
    throw new Error(`Immagine responsive non valida in ${context}.`);
  }
  for (const viewport of ["desktop", "mobile"]) {
    if (typeof image[viewport] !== "string" || image[viewport].length === 0) {
      throw new Error(`Asset ${viewport} mancante in ${context}.`);
    }
  }
}

for (const locale of content.supportedLocales) {
  const localeContent = content.locales?.[locale];
  if (!localeContent?.meta || !localeContent?.ui || !localeContent?.main || !localeContent?.footer) {
    throw new Error(`Contenuto incompleto per la lingua ${locale}.`);
  }

  const sectionIds = localeContent.main.sections.map((section) => section.id);
  if (new Set(sectionIds).size !== sectionIds.length) {
    throw new Error(`ID sezione duplicato nella lingua ${locale}.`);
  }
  if (referenceSectionIds && sectionIds.join("|") !== referenceSectionIds.join("|")) {
    throw new Error(`Le sezioni della lingua ${locale} non corrispondono alla lingua di riferimento.`);
  }
  referenceSectionIds ??= sectionIds;
  const localeSectionTypes = new Set(localeContent.main.sections.map((section) => section.type));
  for (const requiredType of requiredMainTypes) {
    if (!localeSectionTypes.has(requiredType)) {
      throw new Error(`La lingua ${locale} non contiene una sezione ${requiredType}.`);
    }
  }

  for (const section of localeContent.main.sections) {
    if (!supportedMainTypes.has(section.type)) {
      throw new Error(`Tipo sezione non supportato: ${section.type}.`);
    }
    if (section.type === "products") {
      if (!Array.isArray(section.productIds) || section.productIds.length === 0) {
        throw new Error(`La sezione ${section.id} non contiene productIds.`);
      }
      if (!supportedProductLayouts.has(section.layout)) {
        throw new Error(`Layout prodotti non supportato in ${section.id}: ${section.layout}.`);
      }
      section.productIds.forEach((id) => referencedProductIds.add(id));
    }
    if (section.type === "slider") {
      for (const field of ["ariaLabel", "previousLabel", "nextLabel", "statusLabel"]) {
        if (!section[field]) throw new Error(`Campo ${field} mancante nello slider ${section.id}.`);
      }
      if (!Array.isArray(section.slides) || section.slides.length < 2) {
        throw new Error(`Lo slider ${section.id} deve contenere almeno due slide.`);
      }
      if (!Number.isInteger(section.autoplayMs) || section.autoplayMs < 3000) {
        throw new Error(`Autoplay non valido nello slider ${section.id}.`);
      }
      for (const [index, slide] of section.slides.entries()) {
        for (const field of ["href", "image", "imageAlt"]) {
          if (!slide[field]) throw new Error(`Campo ${field} mancante nella slide ${index + 1}.`);
        }
        validateResponsiveImage(slide.image, `slide ${index + 1} di ${section.id}`);
      }
    }
    if (section.type === "banner") {
      for (const field of ["href", "image", "imageAlt"]) {
        if (!section[field]) throw new Error(`Campo ${field} mancante nel banner ${section.id}.`);
      }
      validateResponsiveImage(section.image, `banner ${section.id}`);
      for (const field of ["eyebrow", "title", "ctaLabel"]) {
        if (!section.mobile?.[field]) {
          throw new Error(`Campo mobile.${field} mancante nel banner ${section.id}.`);
        }
      }
    }
  }

  if (!Array.isArray(localeContent.footer.groups) || localeContent.footer.groups.length !== 4) {
    throw new Error(`Il footer ${locale} deve contenere i quattro gruppi informativi originali.`);
  }
}

if (!Array.isArray(products.items) || !products.source?.capturedAt) {
  throw new Error("Il catalogo deve contenere items e metadati dello snapshot sorgente.");
}

const productIds = new Set();
for (const product of products.items) {
  if (productIds.has(product.id)) throw new Error(`Prodotto duplicato: ${product.id}.`);
  productIds.add(product.id);

  for (const field of ["artist", "title", "format", "label", "image"]) {
    if (!product[field]) throw new Error(`Campo ${field} mancante nel prodotto ${product.id}.`);
  }
  for (const locale of content.supportedLocales) {
    if (!product.href?.[locale]) {
      throw new Error(`URL ${locale} mancante nel prodotto ${product.id}.`);
    }
  }
}

for (const id of referencedProductIds) {
  if (!productIds.has(id)) throw new Error(`Prodotto referenziato ma non definito: ${id}.`);
}

for (const hook of ["data-main-root", "data-footer-root", "data-product-modal"]) {
  if (!html.includes(hook)) throw new Error(`Hook HTML mancante: ${hook}.`);
}
if (css.includes(".hero__art") || css.includes(".hero__number")) {
  throw new Error("Il CSS contiene selettori legacy dell'hero precedente.");
}

const modules = [
  "assets/js/app.js",
  "assets/js/catalog.js",
  "assets/js/content.js",
  "assets/js/i18n.js",
  "assets/js/navigation.js",
  "assets/js/product-modal.js",
  "assets/js/search.js",
  "assets/js/slider.js",
  "assets/js/utils.js",
];

for (const relativePath of modules) {
  const result = spawnSync(process.execPath, ["--check", path.join(projectRoot, relativePath)], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || `Sintassi non valida: ${relativePath}`);
  }
}

const versionedSources = await Promise.all([
  Promise.resolve(html),
  readText("assets/js/app.js"),
  readText("assets/js/catalog.js"),
  readText("assets/js/content.js"),
  readText("assets/js/navigation.js"),
  readText("assets/js/product-modal.js"),
]);
const releaseTokens = new Set(
  versionedSources.flatMap((source) => [...source.matchAll(/\?v=(\d{8}-\d+)/g)].map((match) => match[1])),
);
if (releaseTokens.size !== 1) {
  throw new Error(`Versionamento cache incoerente: ${[...releaseTokens].join(", ")}.`);
}
const appSource = versionedSources[1];
for (const endpoint of ["content.json", "products.json", "navigation.json"]) {
  if (!appSource.includes(`${endpoint}?v=`)) {
    throw new Error(`L'endpoint ${endpoint} non contiene un identificatore di release.`);
  }
}

console.log(
  `Validazione completata: ${productIds.size} prodotti reali, ${content.supportedLocales.length} lingue, ${navigation.menu.length} categorie.`,
);
