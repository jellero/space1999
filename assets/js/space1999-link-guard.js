function isBlockedTarget(value) {
  if (!value) return false;
  try {
    const hostname = new URL(String(value), window.location.href).hostname.toLowerCase();
    return hostname === "space1999.com" || hostname.endsWith(".space1999.com");
  } catch {
    return false;
  }
}

function sanitize(root = document) {
  root.querySelectorAll?.("a[href]").forEach((link) => {
    if (!isBlockedTarget(link.getAttribute("href"))) return;
    link.removeAttribute("href");
    link.removeAttribute("target");
    link.removeAttribute("rel");
  });

  root.querySelectorAll?.("form[action]").forEach((form) => {
    if (isBlockedTarget(form.getAttribute("action"))) form.removeAttribute("action");
  });

  root.querySelectorAll?.("[data-url]").forEach((control) => {
    if (isBlockedTarget(control.getAttribute("data-url"))) control.removeAttribute("data-url");
  });
}

sanitize(document);

new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "attributes") {
      sanitize(mutation.target.parentElement ?? document);
      continue;
    }
    mutation.addedNodes.forEach((node) => {
      if (node instanceof Element) sanitize(node);
    });
  }
}).observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["href", "action", "data-url"],
});
