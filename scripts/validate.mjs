import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = async (relativePath) => {
  return JSON.parse(await readFile(path.join(projectRoot, relativePath), "utf8"));
};

const navigation = await readJson("data/navigation.json");
const products = await readJson("data/products.json");
const html = await readFile(path.join(projectRoot, "index.html"), "utf8");

if (!Array.isArray(navigation.menu) || navigation.menu.length !== 7) {
  throw new Error("La navigazione runtime deve contenere le 7 categorie principali.");
}

const sectionIds = new Set();
const productIds = new Set();

for (const section of products.sections ?? []) {
  if (sectionIds.has(section.id)) throw new Error(`Sezione duplicata: ${section.id}`);
  sectionIds.add(section.id);

  if (!html.includes(`data-catalog-grid="${section.id}"`)) {
    throw new Error(`Manca il contenitore HTML per la sezione ${section.id}.`);
  }

  for (const product of section.products ?? []) {
    if (productIds.has(product.id)) throw new Error(`Prodotto duplicato: ${product.id}`);
    productIds.add(product.id);

    for (const field of ["artist", "title", "format", "coverLabel", "coverVariant", "href"]) {
      if (!product[field]) throw new Error(`Campo ${field} mancante nel prodotto ${product.id}.`);
    }
  }
}

const modules = [
  "assets/js/app.js",
  "assets/js/catalog.js",
  "assets/js/navigation.js",
  "assets/js/product-modal.js",
  "assets/js/search.js",
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

console.log(`Validazione completata: ${productIds.size} prodotti, ${navigation.menu.length} categorie.`);
