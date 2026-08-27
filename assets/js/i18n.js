const STORAGE_KEY = "space1999.locale";

function getPathValue(source, path) {
  return path.split(".").reduce((value, key) => value?.[key], source);
}

/**
 * La query string è condivisibile e ha la precedenza. In assenza di `lang`,
 * si usa la preferenza salvata e infine la lingua del browser.
 */
export function resolveLocale({ supportedLocales, defaultLocale }) {
  const requested = new URLSearchParams(window.location.search).get("lang")?.toLowerCase();
  let stored;
  try {
    stored = window.localStorage.getItem(STORAGE_KEY)?.toLowerCase();
  } catch {
    // Alcuni browser bloccano lo storage in modalità privata: la lingua resta operativa via URL.
  }
  const browserLocale = window.navigator.language?.slice(0, 2).toLowerCase();
  const candidates = [requested, stored, browserLocale, defaultLocale];
  const locale = candidates.find((candidate) => supportedLocales.includes(candidate)) ?? defaultLocale;

  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // La persistenza è un miglioramento, non un requisito per il rendering.
  }
  return locale;
}

/** Applica le stringhe dell'interfaccia agli hook dichiarativi presenti nel DOM. */
export function applyTranslations(dictionary) {
  for (const element of document.querySelectorAll("[data-i18n]")) {
    const value = getPathValue(dictionary, element.dataset.i18n);
    if (typeof value === "string") element.textContent = value;
  }

  for (const element of document.querySelectorAll("[data-i18n-placeholder]")) {
    const value = getPathValue(dictionary, element.dataset.i18nPlaceholder);
    if (typeof value === "string") element.setAttribute("placeholder", value);
  }

  for (const element of document.querySelectorAll("[data-i18n-aria-label]")) {
    const value = getPathValue(dictionary, element.dataset.i18nAriaLabel);
    if (typeof value === "string") element.setAttribute("aria-label", value);
  }
}

/** Sincronizza lingua attiva, metadati e route esterne di header e ricerca. */
export function configureLocale({ locale, localeContent }) {
  document.documentElement.lang = locale;
  document.title = localeContent.meta.title;
  document.querySelector("[data-page-description]")?.setAttribute("content", localeContent.meta.description);
  applyTranslations(localeContent.ui);

  document.querySelectorAll("[data-language]").forEach((link) => {
    const isActive = link.dataset.language === locale;
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  const shopBase = `https://space1999.com/${locale}/shop`;
  document.querySelectorAll("[data-search-form]").forEach((form) => {
    form.action = `${shopBase}/search`;
  });
  document.querySelectorAll("[data-advanced-search]").forEach((button) => {
    button.dataset.url = `${shopBase}/searchadv`;
  });
  document.querySelectorAll("[data-localized-route]").forEach((link) => {
    link.href = `https://space1999.com/${locale}${link.dataset.localizedRoute}`;
  });
}
