import { loadCatalog } from "./catalog.js";
import { initNavigationDrawer, loadNavigation } from "./navigation.js";
import { initProductModal } from "./product-modal.js";
import { initSearch } from "./search.js";

async function bootstrap() {
  const panel = document.querySelector("[data-mobile-panel]");
  const drawerOverlay = document.querySelector("[data-drawer-overlay]");
  const openButtons = document.querySelectorAll("[data-menu-open], [data-search-open]");
  const closeButton = document.querySelector("[data-menu-close]");
  const mobileSearch = document.querySelector("[data-mobile-search]");
  const modal = document.querySelector("[data-product-modal]");
  const template = document.querySelector("#product-card-template");

  initSearch();
  initNavigationDrawer({ panel, overlay: drawerOverlay, openButtons, closeButton, searchForm: mobileSearch });
  initProductModal(modal);

  // Navigazione e catalogo sono indipendenti: un errore non blocca il resto della pagina.
  await Promise.allSettled([
    loadNavigation({
      endpoint: "./data/navigation.json",
      desktopRoot: document.querySelector("[data-desktop-menu]"),
      mobileRoot: document.querySelector("[data-mobile-menu]"),
      status: document.querySelector("[data-navigation-status]"),
    }),
    loadCatalog({ endpoint: "./data/products.json", template }),
  ]);
}

bootstrap();
