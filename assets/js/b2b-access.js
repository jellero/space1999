import {
  element,
  fetchJson,
  icon,
  resolveLocale,
  setLocalizedQuery,
  showStatus,
} from "./b2b-utils.js?v=20260908-1";

const CONTENT_ENDPOINT = "./data/b2b.json?v=20260908-1";
const MODES = new Set(["login", "request", "reset"]);

const FORM_FIELDS = {
  login: [
    { id: "email", type: "email", autocomplete: "email" },
    { id: "password", type: "password", autocomplete: "current-password" },
  ],
  request: [
    { id: "firstName", type: "text", autocomplete: "given-name" },
    { id: "lastName", type: "text", autocomplete: "family-name" },
    { id: "email", type: "email", autocomplete: "email", wide: true },
    { id: "phone", type: "tel", autocomplete: "tel" },
    { id: "vatNumber", type: "text", autocomplete: "off" },
    { id: "companyName", type: "text", autocomplete: "organization", wide: true },
  ],
  reset: [{ id: "email", type: "email", autocomplete: "email" }],
};

function currentMode() {
  const requested = new URLSearchParams(window.location.search).get("mode");
  return MODES.has(requested) ? requested : "login";
}

function renderLanguageSwitch(root, locale, mode, label) {
  const languageLabel = element("span", { className: "visually-hidden", text: label });
  root.append(languageLabel);

  for (const language of ["it", "en"]) {
    const link = element("a", {
      className: language === locale ? "is-active" : "",
      text: language.toUpperCase(),
      attributes: {
        href: "./access.html",
        lang: language,
        "aria-current": language === locale ? "page" : null,
      },
    });
    setLocalizedQuery(link, { locale: language, mode });
    root.append(link);
  }
}

function renderTabs(root, dictionary, locale, activeMode) {
  for (const mode of ["login", "request"]) {
    const link = element("a", {
      className: mode === activeMode ? "is-active" : "",
      text: dictionary.access.modes[mode].nav,
      attributes: {
        href: "./access.html",
        "aria-current": mode === activeMode ? "page" : null,
      },
    });
    setLocalizedQuery(link, { locale, mode });
    root.append(link);
  }
}

function createField(field, dictionary) {
  const inputId = `access-${field.id}`;
  const hint = dictionary.access.fieldHints[field.id];
  const wrapper = element("div", { className: `form-field${field.wide ? " form-field--wide" : ""}` });
  const label = element("label", {
    text: dictionary.access.fields[field.id],
    attributes: { for: inputId },
  });
  const input = element("input", {
    attributes: {
      id: inputId,
      name: field.id,
      type: field.type,
      autocomplete: field.autocomplete,
      required: "",
      "aria-describedby": hint ? `${inputId}-hint` : null,
    },
  });
  wrapper.append(label, input);

  if (hint) {
    wrapper.append(element("small", { text: hint, attributes: { id: `${inputId}-hint` } }));
  }
  return wrapper;
}

function renderAntiBot(dictionary) {
  const input = element("input", {
    attributes: { id: "anti-bot-demo", name: "antiBot", type: "checkbox", required: "" },
  });
  const checkLabel = element("label", { className: "anti-bot__check", attributes: { for: "anti-bot-demo" } }, [
    input,
    element("span", { text: dictionary.access.antiBot.demoLabel }),
  ]);

  return element("fieldset", { className: "anti-bot" }, [
    element("legend", { text: dictionary.access.antiBot.title }),
    element("p", { text: dictionary.access.antiBot.description }),
    checkLabel,
  ]);
}

function renderForm(root, dictionary, locale, mode) {
  const copy = dictionary.access.modes[mode];
  const form = element("form", { className: "access-form", attributes: { novalidate: "" } });
  form.append(
    element("h2", { text: copy.title }),
    element("p", { className: "access-form__description", text: copy.description }),
  );

  const fields = element("div", { className: "form-grid" });
  FORM_FIELDS[mode].forEach((field) => fields.append(createField(field, dictionary)));
  form.append(fields, renderAntiBot(dictionary));

  if (mode === "request") {
    form.append(element("p", { className: "form-privacy", text: dictionary.access.privacy }));
  }

  const submit = element("button", { className: "b2b-button b2b-button--primary", text: copy.submit, attributes: { type: "submit" } });
  submit.prepend(icon("arrow"));
  form.append(submit);

  const secondaryMode = mode === "request" ? "login" : "request";
  const secondary = element("p", { className: "access-form__secondary" }, [
    document.createTextNode(`${copy.secondaryPrefix} `),
    element("a", { text: copy.secondaryLabel, attributes: { href: "./access.html" } }),
  ]);
  setLocalizedQuery(secondary.querySelector("a"), { locale, mode: mode === "reset" ? "login" : secondaryMode });
  form.append(secondary);

  if (mode === "login") {
    const reset = element("a", {
      className: "access-form__reset",
      text: dictionary.access.modes.reset.nav,
      attributes: { href: "./access.html" },
    });
    setLocalizedQuery(reset, { locale, mode: "reset" });
    secondary.after(reset);
  }

  form.addEventListener("submit", (event) => handleSubmit(event, dictionary, locale, mode));
  root.replaceChildren(form);
}

function handleSubmit(event, dictionary, locale, mode) {
  event.preventDefault();
  const form = event.currentTarget;
  const status = document.querySelector("[data-access-status]");

  if (!form.checkValidity()) {
    form.reportValidity();
    const antiBot = form.elements.antiBot;
    if (!antiBot.checked) showStatus(status, dictionary.access.antiBot.required, "error");
    return;
  }

  const submit = form.querySelector('[type="submit"]');
  submit.disabled = true;
  showStatus(status, dictionary.access.success[mode], "success");

  // Il prototipo non invia credenziali o dati personali. Il redirect simula
  // esclusivamente l'esito positivo che in produzione arriverà dal backend.
  if (mode === "login") {
    window.setTimeout(() => {
      window.location.assign(`./account.html?lang=${locale}&client=demo-distributor&view=dashboard`);
    }, 700);
  } else {
    window.setTimeout(() => {
      submit.disabled = false;
      form.reset();
    }, 900);
  }
}

async function bootstrap() {
  const content = await fetchJson(CONTENT_ENDPOINT);
  const locale = resolveLocale({
    supportedLocales: content.supportedLocales,
    defaultLocale: content.defaultLocale,
  });
  const dictionary = content.locales[locale];
  const mode = currentMode();

  document.documentElement.lang = locale;
  document.title = dictionary.meta.accessTitle;
  document.querySelector("[data-page-description]")?.setAttribute("content", dictionary.meta.description);
  document.querySelector("[data-security-note]").textContent = dictionary.access.securityNote;

  renderLanguageSwitch(document.querySelector("[data-language-switch]"), locale, mode, dictionary.common.language);
  renderTabs(document.querySelector("[data-access-tabs]"), dictionary, locale, mode);
  renderForm(document.querySelector("[data-access-form-root]"), dictionary, locale, mode);
}

bootstrap().catch((error) => {
  const root = document.querySelector("[data-access-form-root]");
  root.replaceChildren(element("p", { className: "form-status", text: "Impossibile caricare la pagina di accesso." }));
  console.error("Impossibile inizializzare l’accesso B2B.", error);
});
