import { fetchJson } from "./utils.js?v=20260908-1";
import { resolveLocale } from "./i18n.js?v=20260908-1";

export { fetchJson, resolveLocale };

export function getValue(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

export function translate(dictionary, path, replacements = {}) {
  const value = getValue(dictionary, path);
  if (typeof value !== "string") return path;

  return Object.entries(replacements).reduce(
    (label, [key, replacement]) => label.replaceAll(`{${key}}`, String(replacement)),
    value,
  );
}

export function element(tagName, options = {}, children = []) {
  const node = document.createElement(tagName);
  const { className, text, attributes = {}, dataset = {} } = options;

  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  for (const [name, value] of Object.entries(attributes)) {
    if (value !== undefined && value !== null) node.setAttribute(name, String(value));
  }
  for (const [name, value] of Object.entries(dataset)) {
    if (value !== undefined && value !== null) node.dataset[name] = String(value);
  }
  node.append(...children.filter(Boolean));
  return node;
}

const ICON_PATHS = {
  home: "M3 10.8 12 3l9 7.8v9.7a.5.5 0 0 1-.5.5h-5.7v-6.2H9.2V21H3.5a.5.5 0 0 1-.5-.5z",
  catalog: "M4 4.5h6.7A3.3 3.3 0 0 1 14 7.8V21H7.3A3.3 3.3 0 0 1 4 17.7zm16 0h-2.7A3.3 3.3 0 0 0 14 7.8V21h2.7a3.3 3.3 0 0 0 3.3-3.3z",
  cart: "M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H6M10 20h.01M18 20h.01",
  orders: "M6 3h12v18H6zM9 8h6M9 12h6M9 16h4",
  shipments: "M3 6h11v11H3zm11 4h4l3 3v4h-7zM7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4m10 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  documents: "M6 3h8l4 4v14H6zM14 3v5h4M9 13h6M9 17h6",
  profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m-7 9a7 7 0 0 1 14 0",
  carriers: "M4 4h12v13H4zm12 5h3l2 4v4h-5M8 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4m9 4a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "m6 6 12 12M18 6 6 18",
  arrow: "m9 18 6-6-6-6",
  external: "M14 4h6v6M20 4l-9 9M18 13v7H4V6h7",
  alert: "M12 4 2.8 20h18.4zM12 9v5M12 17h.01",
  check: "m5 12 4 4L19 6",
  search: "m20 20-4.8-4.8M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4",
  download: "M12 3v12m-5-5 5 5 5-5M5 20h14",
};

export function icon(name, className = "") {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  if (className) svg.setAttribute("class", className);

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", ICON_PATHS[name] ?? ICON_PATHS.documents);
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "1.8");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  svg.append(path);
  return svg;
}

export function formatMoney(value, locale = "it") {
  return new Intl.NumberFormat(locale === "it" ? "it-IT" : "en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

export function formatDate(value, locale = "it") {
  return new Intl.DateTimeFormat(locale === "it" ? "it-IT" : "en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00Z`));
}

export function setLocalizedQuery(link, { locale, mode, view, client } = {}) {
  const url = new URL(link.getAttribute("href") || window.location.pathname, window.location.href);
  if (locale) url.searchParams.set("lang", locale);
  if (mode) url.searchParams.set("mode", mode);
  if (view) url.searchParams.set("view", view);
  if (client) url.searchParams.set("client", client);
  link.href = `${url.pathname.split("/").at(-1) || "./"}${url.search}`;
}

export function showStatus(root, message, type = "info") {
  if (!root) return;
  root.textContent = message;
  root.dataset.type = type;
  root.hidden = false;
  root.focus({ preventScroll: true });
}
