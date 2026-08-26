export function initSearch() {
  document.querySelectorAll("[data-search-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      const input = form.elements.s;

      if (!input?.value.trim()) {
        event.preventDefault();
        input?.focus();
      }
    });
  });

  document.querySelector("[data-advanced-search]")?.addEventListener("click", (event) => {
    const targetUrl = event.currentTarget.dataset.url;
    if (targetUrl) window.location.assign(targetUrl);
  });
}
