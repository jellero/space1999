import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readText = (relativePath) => readFile(path.join(projectRoot, relativePath), "utf8");
const readJson = async (relativePath) => JSON.parse(await readText(relativePath));

const [navigation, content, products, html, css, b2b, b2bDemo, clientConfig, accessHtml, accountHtml, b2bCss] = await Promise.all([
  readJson("data/navigation.json"),
  readJson("data/content.json"),
  readJson("data/products.json"),
  readText("index.html"),
  readText("assets/styles.css"),
  readJson("data/b2b.json"),
  readJson("data/b2b-demo.json"),
  readJson("data/clients/demo-distributor.json"),
  readText("access.html"),
  readText("account.html"),
  readText("assets/b2b.css"),
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

if (b2b.defaultLocale !== content.defaultLocale || b2b.supportedLocales.join("|") !== content.supportedLocales.join("|")) {
  throw new Error("Il B2B deve usare le stesse lingue e la stessa lingua predefinita del sito pubblico.");
}

const requiredB2bViews = new Set(["dashboard", "catalog", "cart", "orders", "shipments", "documents", "profile", "carriers"]);
const configuredViews = new Set(clientConfig.navigation.map((item) => item.id));
if (configuredViews.size !== clientConfig.navigation.length) {
  throw new Error("La configurazione cliente contiene voci di navigazione duplicate.");
}
for (const view of requiredB2bViews) {
  if (!configuredViews.has(view)) throw new Error(`Vista B2B mancante nella configurazione demo: ${view}.`);
}
if (clientConfig.features.returns !== false) {
  throw new Error("I resi devono rimanere disabilitati finché il processo non è definito.");
}

for (const locale of b2b.supportedLocales) {
  const localeContent = b2b.locales?.[locale];
  for (const section of ["meta", "common", "access", "account"]) {
    if (!localeContent?.[section]) throw new Error(`Sezione B2B ${section} mancante per ${locale}.`);
  }
  for (const mode of ["login", "request", "reset"]) {
    if (!localeContent.access.modes?.[mode]?.title || !localeContent.access.success?.[mode]) {
      throw new Error(`Flusso di accesso B2B ${mode} incompleto per ${locale}.`);
    }
  }
  for (const view of ["dashboard", "cart", "orders", "shipments", "documents", "profile", "carriers"]) {
    if (!localeContent.account?.[view]?.title && view !== "dashboard") {
      throw new Error(`Copy della vista B2B ${view} mancante per ${locale}.`);
    }
  }
}

const demoCollections = ["addresses", "carriers", "orders", "shipments", "invoices", "payments"];
for (const collection of demoCollections) {
  if (!Array.isArray(b2bDemo[collection])) throw new Error(`Collezione demo B2B mancante: ${collection}.`);
}
if (!Array.isArray(b2bDemo.cart?.items) || b2bDemo.cart.items.length === 0) {
  throw new Error("Il carrello B2B demo deve contenere almeno un prodotto.");
}

const demoEmails = [
  b2bDemo.customer.email,
  ...b2bDemo.carriers.map((carrier) => carrier.contact),
].filter(Boolean);
if (demoEmails.some((email) => !email.endsWith(".test"))) {
  throw new Error("Gli indirizzi e-mail B2B dimostrativi devono usare il dominio riservato .test.");
}

const addressIds = new Set(b2bDemo.addresses.map((address) => address.id));
for (const shipment of b2bDemo.shipments) {
  if (!addressIds.has(shipment.addressId)) {
    throw new Error(`La spedizione ${shipment.id} referenzia un indirizzo inesistente.`);
  }
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
for (const hook of ["data-access-form-root", "data-access-tabs", "data-language-switch"]) {
  if (!accessHtml.includes(hook)) throw new Error(`Hook accesso B2B mancante: ${hook}.`);
}
for (const hook of ["data-account-main", "data-account-navigation", "data-b2b-dialog"]) {
  if (!accountHtml.includes(hook)) throw new Error(`Hook area privata B2B mancante: ${hook}.`);
}
if (css.includes(".hero__art") || css.includes(".hero__number")) {
  throw new Error("Il CSS contiene selettori legacy dell'hero precedente.");
}
if (!b2bCss.includes("@media (max-width: 800px)") || !b2bCss.includes(".responsive-table td::before")) {
  throw new Error("La trasformazione responsive delle tabelle B2B non è presente.");
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
  "assets/js/b2b-utils.js",
  "assets/js/b2b-access.js",
  "assets/js/b2b-account.js",
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
  Promise.resolve(accessHtml),
  Promise.resolve(accountHtml),
  readText("assets/js/b2b-utils.js"),
  readText("assets/js/b2b-access.js"),
  readText("assets/js/b2b-account.js"),
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
  `Validazione completata: ${productIds.size} prodotti reali, ${content.supportedLocales.length} lingue, ${navigation.menu.length} categorie e ${configuredViews.size} viste B2B.`,
);
