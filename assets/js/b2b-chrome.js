import { createElement, fetchJson } from "./utils.js?v=20260908-2";
import { applyTranslations, resolveLocale } from "./i18n.js?v=20260908-2";
import { initNavigationDrawer, loadNavigation } from "./navigation.js?v=20260908-1";
import { initSearch } from "./search.js?v=20260908-1";

const CONTENT_ENDPOINT = "./data/content.json?v=20260908-1";
const NAVIGATION_ENDPOINT = "./data/navigation.json?v=20260908-1";

function currentPageUrl(locale) {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", locale);
  return `${url.pathname.split("/").at(-1) || "./"}${url.search}`;
}

function renderHeader(root) {
  root.innerHTML = `
    <header class="site-header">
      <div class="container header-top">
        <a class="brand" href="./index.html" aria-label="Space1999 home">
          <img
            src="https://space1999.com/bundles/mercuriospace/shop/images/03_Marchio_Space.jpg"
            alt="Space1999"
            width="150"
            height="90"
          >
        </a>

        <p class="claim" data-i18n="header.claim">International distributor of media products</p>

        <div class="header-tools">
          <span class="shipping">
            <strong>INFO</strong> <span data-i18n="header.shipping">Spedizioni</span>
          </span>

          <nav class="language" aria-label="Lingua" data-i18n-aria-label="header.languageLabel">
            <a href="#" lang="it" data-language="it">IT</a>
            <span aria-hidden="true">|</span>
            <a href="#" lang="en" data-language="en">EN</a>
          </nav>

          <form class="login" aria-label="Accesso clienti" data-i18n-aria-label="header.loginLabel" data-b2b-chrome-login-form>
            <input type="email" autocomplete="email" placeholder="e-Mail" aria-label="e-Mail">
            <input type="password" autocomplete="current-password" placeholder="Password" aria-label="Password">
            <div>
              <button type="submit" data-i18n="header.login">Log in</button>
              <button type="button" data-b2b-chrome-request-link data-i18n="header.register">Richiedi accesso</button>
            </div>
          </form>
        </div>

        <div class="mobile-actions">
          <button
            class="icon-button"
            type="button"
            data-search-open
            aria-label="Apri ricerca"
            data-i18n-aria-label="header.openSearch"
            aria-controls="mobile-navigation"
            aria-expanded="false"
          >
            <svg class="search-icon" aria-hidden="true" viewBox="0 0 24 24">
              <circle cx="10" cy="10" r="6.5"></circle>
              <path d="m15 15 6 6"></path>
            </svg>
          </button>
          <button
            class="icon-button"
            type="button"
            data-menu-open
            aria-label="Apri menu"
            data-i18n-aria-label="header.openMenu"
            aria-controls="mobile-navigation"
            aria-expanded="false"
          >
            <span class="burger" aria-hidden="true"></span>
          </button>
        </div>
      </div>

      <div class="nav-shell">
        <nav class="container" aria-label="Menu principale" data-i18n-aria-label="header.mainMenuLabel">
          <ul class="desktop-menu" data-desktop-menu aria-busy="true"></ul>
        </nav>
      </div>

      <form
        class="container search"
        role="search"
        method="get"
        data-search-form
      >
        <div class="search-field">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <circle cx="10" cy="10" r="6.5"></circle>
            <path d="m15 15 6 6"></path>
          </svg>
          <input
            type="search"
            name="s"
            autocomplete="off"
            placeholder="cerca per testo o barcode"
            data-i18n-placeholder="header.searchPlaceholder"
            aria-label="Cerca per testo o barcode"
            data-i18n-aria-label="header.searchLabel"
          >
        </div>

        <div class="search-actions">
          <label>
            <input type="checkbox" name="onlystock">
            <span data-i18n="header.stockOnly">Solo disponibili</span>
          </label>
          <button type="submit" data-i18n="header.search">Cerca</button>
          <button type="button" data-advanced-search data-i18n="header.advancedSearch">
            Ricerca avanzata
          </button>
        </div>
      </form>
    </header>

    <button
      class="drawer-overlay"
      type="button"
      data-drawer-overlay
      aria-label="Chiudi menu"
      data-i18n-aria-label="header.closeMenu"
    ></button>

    <aside
      class="mobile-panel"
      id="mobile-navigation"
      data-mobile-panel
      aria-hidden="true"
      aria-label="Navigazione mobile"
      data-i18n-aria-label="header.mobileNavigationLabel"
    >
      <div class="mobile-panel__head">
        <strong data-i18n="header.menu">Menu</strong>
        <button type="button" data-menu-close aria-label="Chiudi menu" data-i18n-aria-label="header.closeMenu">×</button>
      </div>

      <form
        class="mobile-search"
        role="search"
        method="get"
        data-mobile-search
        data-search-form
      >
        <input
          type="search"
          name="s"
          autocomplete="off"
          placeholder="Cerca"
          data-i18n-placeholder="header.search"
          aria-label="Cerca"
          data-i18n-aria-label="header.searchLabel"
        >
        <button type="submit" aria-label="Avvia ricerca" data-i18n-aria-label="header.startSearch">
          <svg class="mobile-search__icon" aria-hidden="true" viewBox="0 0 24 24">
            <circle cx="10" cy="10" r="6.5"></circle>
            <path d="m15 15 6 6"></path>
          </svg>
        </button>
      </form>

      <div class="mobile-language">
        <span class="mobile-language__label">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8.5"></circle>
            <path d="M3.8 12h16.4M12 3.5c2.3 2.4 3.5 5.2 3.5 8.5S14.3 18.1 12 20.5M12 3.5C9.7 5.9 8.5 8.7 8.5 12s1.2 6.1 3.5 8.5"></path>
          </svg>
          <span data-i18n="header.languageLabel">Lingua</span>
        </span>
        <nav class="mobile-language__switch" aria-label="Lingua" data-i18n-aria-label="header.languageLabel">
          <a href="#" lang="it" data-language="it">IT</a>
          <a href="#" lang="en" data-language="en">EN</a>
        </nav>
      </div>

      <nav aria-label="Menu principale mobile" data-i18n-aria-label="header.mobileMenuLabel">
        <ul class="mobile-menu" data-mobile-menu aria-busy="true"></ul>
      </nav>

      <div class="mobile-account-entry">
        <a href="./access.html?mode=login" data-b2b-chrome-login-link data-i18n="header.login">Log in</a>
        <a href="./access.html?mode=request" data-b2b-chrome-request-link data-i18n="header.register">Richiedi accesso</a>
      </div>

      <p class="navigation-status" data-navigation-status role="status" hidden></p>
    </aside>
  `;
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
  const form = createElement("form");
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

function configureChromeLocale(locale, localeContent) {
  applyTranslations(localeContent.ui);

  document.querySelectorAll("[data-language]").forEach((link) => {
    const language = link.dataset.language;
    const isActive = language === locale;
    link.href = currentPageUrl(language);
    link.classList.toggle("active", isActive);
    if (isActive) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  const accessUrl = (mode) => `./access.html?lang=${locale}&mode=${mode}`;
  document.querySelector("[data-b2b-chrome-login-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    window.location.assign(accessUrl("login"));
  });
  document.querySelectorAll("[data-b2b-chrome-login-link]").forEach((link) => {
    link.href = accessUrl("login");
  });
  document.querySelectorAll("[data-b2b-chrome-request-link]").forEach((control) => {
    if (control instanceof HTMLAnchorElement) control.href = accessUrl("request");
    else control.addEventListener("click", () => window.location.assign(accessUrl("request")));
  });
}

async function bootstrap() {
  const headerRoot = document.querySelector("[data-site-header-root]");
  const footerRoot = document.querySelector("[data-site-footer-root]");
  if (!headerRoot || !footerRoot) return;

  renderHeader(headerRoot);

  const content = await fetchJson(CONTENT_ENDPOINT);
  const locale = resolveLocale({
    supportedLocales: content.supportedLocales,
    defaultLocale: content.defaultLocale,
  });
  const localeContent = content.locales[locale] ?? content.locales[content.defaultLocale];

  configureChromeLocale(locale, localeContent);
  renderFooter(footerRoot, localeContent.footer);

  const panel = document.querySelector("[data-mobile-panel]");
  const overlay = document.querySelector("[data-drawer-overlay]");
  const openButtons = document.querySelectorAll("[data-menu-open], [data-search-open]");
  const closeButton = document.querySelector("[data-menu-close]");
  const mobileSearch = document.querySelector("[data-mobile-search]");

  initNavigationDrawer({ panel, overlay, openButtons, closeButton, searchForm: mobileSearch });
  initSearch();

  await loadNavigation({
    endpoint: NAVIGATION_ENDPOINT,
    desktopRoot: document.querySelector("[data-desktop-menu]"),
    mobileRoot: document.querySelector("[data-mobile-menu]"),
    status: document.querySelector("[data-navigation-status]"),
  });
}

bootstrap().catch((error) => {
  const footerRoot = document.querySelector("[data-site-footer-root]");
  footerRoot?.setAttribute("aria-busy", "false");
  console.error("Impossibile inizializzare header/footer condivisi.", error);
});
