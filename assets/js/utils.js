/**
 * Converte una risposta HTTP in JSON applicando timeout e controllo dello stato.
 * Il timeout evita che l'interfaccia rimanga indefinitamente in stato di caricamento.
 */
export async function fetchJson(url, { timeout = 8000 } = {}) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} durante il caricamento di ${url}`);
    }

    return await response.json();
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function createElement(tagName, { className, text, attributes = {} } = {}) {
  const element = document.createElement(tagName);

  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;

  for (const [name, value] of Object.entries(attributes)) {
    if (value !== undefined && value !== null) {
      element.setAttribute(name, String(value));
    }
  }

  return element;
}

export function getFocusableElements(container) {
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

  return [...container.querySelectorAll(selector)].filter((element) => {
    return (
      !element.hidden &&
      element.getAttribute("aria-hidden") !== "true" &&
      element.getClientRects().length > 0
    );
  });
}

/** Mantiene il focus all'interno di un pannello modale o di un drawer aperto. */
export function trapFocus(event, container) {
  if (event.key !== "Tab") return;

  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable.at(-1);

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
