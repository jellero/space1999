import { trapFocus } from "./utils.js?v=20260827-5";

const TRANSITION_DURATION = 180;
const INERT_TARGETS = [".site-header", "main", ".site-footer", ".mobile-panel"];

export function initProductModal(modal) {
  const image = modal.querySelector("[data-product-modal-image]");
  const artist = modal.querySelector("[data-product-modal-artist]");
  const title = modal.querySelector("[data-product-modal-title]");
  const meta = modal.querySelector("[data-product-modal-meta]");
  const details = modal.querySelector("[data-product-modal-link]");
  const closeButton = modal.querySelector('.product-modal__close');
  let trigger = null;
  let closeTimer = null;

  function setBackgroundInert(inert) {
    for (const selector of INERT_TARGETS) {
      document.querySelector(selector)?.toggleAttribute("inert", inert);
    }
  }

  function open(card, source) {
    window.clearTimeout(closeTimer);
    trigger = source;

    const cover = card.querySelector(".cover").cloneNode(true);
    cover.setAttribute("aria-hidden", "true");

    image.replaceChildren(cover);
    artist.textContent = card.dataset.productArtist;
    title.textContent = card.dataset.productTitle;
    meta.textContent = card.dataset.productMeta;
    details.href = card.dataset.productHref;

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("is-scroll-locked");
    setBackgroundInert(true);

    window.requestAnimationFrame(() => {
      modal.classList.add("is-open");
      closeButton.focus();
    });
  }

  function close() {
    if (!modal.classList.contains("is-open")) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("is-scroll-locked");
    setBackgroundInert(false);
    trigger?.focus();
    trigger = null;

    closeTimer = window.setTimeout(() => {
      if (!modal.classList.contains("is-open")) modal.hidden = true;
    }, TRANSITION_DURATION);
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-product-link]");
    if (!link) return;

    // I click modificati mantengono il comportamento nativo del browser.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const card = link.closest("[data-product-card]");
    if (!card) return;

    event.preventDefault();
    open(card, link);
  });

  modal.querySelectorAll("[data-product-modal-close]").forEach((button) => {
    button.addEventListener("click", close);
  });

  modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
    if (modal.classList.contains("is-open")) trapFocus(event, modal);
  });

  return { close };
}
