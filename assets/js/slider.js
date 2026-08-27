const MIN_AUTOPLAY_DELAY = 3000;

function formatStatus(template, current, total) {
  return template.replace("{current}", String(current)).replace("{total}", String(total));
}

/**
 * Inizializza un singolo slider senza dipendenze esterne. L'autoplay viene
 * sospeso quando l'utente interagisce e disattivato se preferisce meno movimento.
 */
function initSlider(root) {
  const slides = [...root.querySelectorAll("[data-slider-slide]")];
  const previous = root.querySelector("[data-slider-previous]");
  const next = root.querySelector("[data-slider-next]");
  const status = root.querySelector("[data-slider-status]");
  const statusTemplate = root.dataset.statusTemplate;
  const requestedDelay = Number.parseInt(root.dataset.autoplayMs, 10);
  const autoplayDelay = Number.isFinite(requestedDelay)
    ? Math.max(requestedDelay, MIN_AUTOPLAY_DELAY)
    : 5000;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeIndex = 0;
  let timer = null;
  let pointerInside = false;
  let focusInside = false;

  if (slides.length < 2) {
    previous.hidden = true;
    next.hidden = true;
  }

  function render(index, { announce = false } = {}) {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.toggleAttribute("inert", !isActive);
      slide.querySelector("a")?.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    status.textContent = announce
      ? formatStatus(statusTemplate, activeIndex + 1, slides.length)
      : "";
  }

  function stopAutoplay() {
    window.clearInterval(timer);
    timer = null;
  }

  function startAutoplay() {
    stopAutoplay();
    if (reducedMotion.matches || slides.length < 2 || pointerInside || focusInside || document.hidden) return;
    timer = window.setInterval(() => render(activeIndex + 1), autoplayDelay);
  }

  function move(step) {
    render(activeIndex + step, { announce: true });
    startAutoplay();
  }

  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  root.addEventListener("mouseenter", () => {
    pointerInside = true;
    stopAutoplay();
  });
  root.addEventListener("mouseleave", () => {
    pointerInside = false;
    startAutoplay();
  });
  root.addEventListener("focusin", () => {
    focusInside = true;
    stopAutoplay();
  });
  root.addEventListener("focusout", (event) => {
    if (!root.contains(event.relatedTarget)) {
      focusInside = false;
      startAutoplay();
    }
  });
  root.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
    if (event.key === "Home") {
      event.preventDefault();
      render(0, { announce: true });
    }
    if (event.key === "End") {
      event.preventDefault();
      render(slides.length - 1, { announce: true });
    }
  });
  reducedMotion.addEventListener("change", startAutoplay);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAutoplay();
    else startAutoplay();
  });

  render(0);
  startAutoplay();
}

/** Inizializza tutti gli slider creati dal renderer delle sezioni JSON. */
export function initSliders() {
  document.querySelectorAll("[data-slider]").forEach(initSlider);
}
