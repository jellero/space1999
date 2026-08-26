import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(projectRoot, "data", "menu.json");
const outputPath = path.join(projectRoot, "data", "navigation.json");

const source = JSON.parse(await readFile(sourcePath, "utf8"));

if (!Array.isArray(source.menu)) {
  throw new TypeError("data/menu.json non contiene un array menu valido.");
}

// Il browser riceve soltanto i campi necessari alla navigazione. Le evidenze di
// governance restano nel file sorgente e non aumentano il peso della pagina.
const menu = source.menu.map((item) => ({
  label: item.label,
  href: item.href,
  sections: (item.sections ?? []).map((section) => ({
    label: section.label,
    href: section.href,
    items: (section.items ?? []).map(({ label, href }) => ({ label, href })),
  })),
}));

await writeFile(outputPath, `${JSON.stringify({ version: 1, menu }, null, 2)}\n`);

console.log(`Creato ${path.relative(projectRoot, outputPath)} con ${menu.length} voci principali.`);
