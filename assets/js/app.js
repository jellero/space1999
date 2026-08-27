import { loadPageContent } from "./content.js?v=20260827-5";
import { initNavigationDrawer, loadNavigation } from "./navigation.js?v=20260827-5";
import { initProductModal } from "./product-modal.js?v=20260827-5";
import { initSearch } from "./search.js?v=20260827-5";
import { initSliders } from "./slider.js?v=20260827-5";

function showContentError(error) {
  const isEnglish = document.documentElement.lang === "en";
  const message = isEnglish
    ? "Content is temporarily unavailable. Please try again later."
    : "I contenuti non sono temporaneamente disponibili. Riprova più tardi.";

  document.querySelector("[data-main-root]")?.setAttribute("aria-busy", "false");
  document.querySelector("[data-footer-root]")?.setAttribute("aria-busy", "false");
  document.querySelectorAll("[data-page-status], [data-footer-status]").forEach((status) => {
    status.textContent = message;
  });

  // In produzione sostituire con il sistema di observability adottato dal progetto.
  console.error("Impossibile inizializzare i contenuti della pagina.", error);
}

async function bootstrap() {
  const panel = document.querySelector("[data-mobile-panel]");
  const drawerOverlay = document.querySelector("[data-drawer-overlay]");
  const openButtons = document.querySelectorAll("[data-menu-open], [data-search-open]");
  const closeButton = document.querySelector("[data-menu-close]");
  const mobileSearch = document.querySelector("[data-mobile-search]");

  initNavigationDrawer({ panel, overlay: drawerOverlay, openButtons, closeButton, searchForm: mobileSearch });
  initProductModal(document.querySelector("[data-product-modal]"));

  // Contenuti e navigazione sono indipendenti: un errore non blocca l'altro ramo.
  const [contentResult] = await Promise.all([
    loadPageContent({
      contentEndpoint: "./data/content.json?v=20260827-5",
      productsEndpoint: "./data/products.json?v=20260827-5",
      mainRoot: document.querySelector("[data-main-root]"),
      footerRoot: document.querySelector("[data-footer-root]"),
    }).catch((error) => {
      showContentError(error);
      return null;
    }),
    loadNavigation({
      endpoint: "./data/navigation.json?v=20260827-5",
      desktopRoot: document.querySelector("[data-desktop-menu]"),
      mobileRoot: document.querySelector("[data-mobile-menu]"),
      status: document.querySelector("[data-navigation-status]"),
    }).catch((error) => {
      console.error("Impossibile inizializzare la navigazione.", error);
      return null;
    }),
  ]);

  // L'URL di ricerca avanzata viene localizzato durante il caricamento contenuti.
  initSearch();

  if (contentResult) {
    initSliders();
    document.documentElement.dataset.contentSource = contentResult.source.mode;
  }
}

bootstrap();
