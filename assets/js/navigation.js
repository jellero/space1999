import { createElement, fetchJson, trapFocus } from "./utils.js?v=20260827-7";

function createLink({ label, href }, className) {
  return createElement("a", {
    className,
    text: label,
    attributes: { href },
  });
}

function createDesktopItem(item) {
  const listItem = createElement("li");
  const panel = createElement("div", { className: "mega-menu" });
  const grid = createElement("div", { className: "mega-grid" });

  listItem.append(createLink(item));

  for (const group of item.sections ?? []) {
    const section = createElement("section", { className: "mega-section" });
    const title = createElement("h2");
    const childList = createElement("ul");

    title.append(createLink(group));

    for (const child of group.items ?? []) {
      const childItem = createElement("li");
      childItem.append(createLink(child));
      childList.append(childItem);
    }

    section.append(title, childList);
    grid.append(section);
  }

  panel.append(grid);
  listItem.append(panel);
  return listItem;
}

function createMobileItem(item) {
  const listItem = createElement("li");
  const details = createElement("details");
  const summary = createElement("summary", { text: item.label });
  const groupList = createElement("ul");

  for (const group of item.sections ?? []) {
    const groupItem = createElement("li");
    const childList = createElement("ul");

    groupItem.append(createLink(group));

    for (const child of group.items ?? []) {
      const childItem = createElement("li");
      childItem.append(createLink(child));
      childList.append(childItem);
    }

    if (childList.childElementCount > 0) groupItem.append(childList);
    groupList.append(groupItem);
  }

  details.append(summary, groupList);
  listItem.append(details);
  return listItem;
}

export async function loadNavigation({ endpoint, desktopRoot, mobileRoot, status }) {
  try {
    const data = await fetchJson(endpoint);

    if (!Array.isArray(data.menu)) {
      throw new TypeError("Il payload di navigazione non contiene un array menu valido.");
    }

    const desktopFragment = document.createDocumentFragment();
    const mobileFragment = document.createDocumentFragment();

    for (const item of data.menu) {
      desktopFragment.append(createDesktopItem(item));
      mobileFragment.append(createMobileItem(item));
    }

    desktopRoot.replaceChildren(desktopFragment);
    mobileRoot.replaceChildren(mobileFragment);
    desktopRoot.setAttribute("aria-busy", "false");
    mobileRoot.setAttribute("aria-busy", "false");
  } catch (error) {
    desktopRoot.setAttribute("aria-busy", "false");
    mobileRoot.setAttribute("aria-busy", "false");
    status.hidden = false;
    const requestedLocale = new URLSearchParams(window.location.search).get("lang");
    const isEnglish = requestedLocale === "en" || (!requestedLocale && document.documentElement.lang === "en");
    status.textContent = isEnglish
      ? "Navigation is temporarily unavailable."
      : "Navigazione temporaneamente non disponibile.";
    throw error;
  }
}

export function initNavigationDrawer({ panel, overlay, openButtons, closeButton, searchForm }) {
  let trigger = null;

  function setOpen(open, source) {
    trigger = open ? source : trigger;
    panel.classList.toggle("is-open", open);
    overlay.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", String(!open));
    document.documentElement.classList.toggle("is-scroll-locked", open);

    for (const button of openButtons) {
      button.setAttribute("aria-expanded", String(open));
    }

    if (open) {
      closeButton.focus();
    } else {
      trigger?.focus();
      trigger = null;
    }
  }

  for (const button of openButtons) {
    button.addEventListener("click", () => setOpen(true, button));
  }

  closeButton.addEventListener("click", () => setOpen(false));
  overlay.addEventListener("click", () => setOpen(false));

  document.querySelector("[data-search-open]")?.addEventListener("click", () => {
    window.requestAnimationFrame(() => searchForm.elements.s?.focus());
  });

  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
    if (panel.classList.contains("is-open")) trapFocus(event, panel);
  });

  return { close: () => setOpen(false) };
}
