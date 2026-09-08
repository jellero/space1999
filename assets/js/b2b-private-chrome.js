const params = new URLSearchParams(window.location.search);
const locale = params.get("lang") === "en" ? "en" : "it";
const client = params.get("client") || "demo-distributor";

const labels = locale === "en"
  ? { cart: "Cart", reserved: "Reserved area" }
  : { cart: "Carrello", reserved: "Area riservata" };

function accountUrl(view) {
  const url = new URL("./account.html", window.location.href);
  url.searchParams.set("lang", locale);
  url.searchParams.set("client", client);
  url.searchParams.set("view", view);
  return `${url.pathname.split("/").at(-1)}${url.search}`;
}

function privateLinks(className = "") {
  const nav = document.createElement("nav");
  nav.className = className;
  nav.setAttribute("aria-label", labels.reserved);
  nav.innerHTML = `
    <a href="${accountUrl("cart")}" data-private-cart-link>
      <span>${labels.cart}</span>
      <span class="private-cart-count" data-private-cart-count aria-label="0">0</span>
    </a>
    <a href="${accountUrl("dashboard")}" data-private-area-link>${labels.reserved}</a>
  `;
  return nav;
}

function syncCartCount() {
  const sidebarBadge = document.querySelector("[data-account-navigation] .account-navigation__badge");
  const quantity = sidebarBadge?.textContent?.trim() || "0";
  document.querySelectorAll("[data-private-cart-count]").forEach((badge) => {
    badge.textContent = quantity;
    badge.setAttribute("aria-label", quantity);
  });
}

function prunePrivateCatalogLinks() {
  document
    .querySelectorAll('[data-account-navigation] a[href="./index.html"], [data-sidebar-footer] a[href="./index.html"]')
    .forEach((link) => link.remove());
}

function observePrivateSidebar() {
  const sidebar = document.querySelector("[data-account-sidebar]");
  if (!sidebar) return;

  prunePrivateCatalogLinks();
  new MutationObserver(() => {
    prunePrivateCatalogLinks();
    syncCartCount();
  }).observe(sidebar, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

function mountPrivateHeader() {
  const login = document.querySelector(".site-header .login");
  const mobileEntry = document.querySelector(".mobile-account-entry");
  if (!login || !mobileEntry) return false;

  login.replaceWith(privateLinks("private-account-tools"));

  const mobileLinks = privateLinks("mobile-account-entry mobile-account-entry--private");
  mobileEntry.replaceWith(mobileLinks);

  syncCartCount();
  return true;
}

observePrivateSidebar();

if (!mountPrivateHeader()) {
  const headerRoot = document.querySelector("[data-site-header-root]");
  if (headerRoot) {
    const observer = new MutationObserver(() => {
      if (mountPrivateHeader()) observer.disconnect();
    });
    observer.observe(headerRoot, { childList: true, subtree: true });
  }
}
