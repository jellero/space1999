import {
  element,
  fetchJson,
  formatDate,
  formatMoney,
  getValue,
  icon,
  resolveLocale,
  setLocalizedQuery,
  showStatus,
  translate,
} from "./b2b-utils.js?v=20260908-1";
import { trapFocus } from "./utils.js?v=20260908-1";

const CONTENT_ENDPOINT = "./data/b2b.json?v=20260908-1";
const DEMO_ENDPOINT = "./data/b2b-demo.json?v=20260908-1";

// Non costruire mai il percorso del JSON direttamente da un parametro URL.
// In produzione l'associazione cliente/configurazione deve arrivare dalla sessione autenticata.
const CLIENT_CONFIGS = Object.freeze({
  "demo-distributor": "./data/clients/demo-distributor.json?v=20260908-1",
});

const app = {
  locale: "it",
  dictionary: null,
  config: null,
  data: null,
  view: "dashboard",
  dialog: null,
  lastFocused: null,
};

function currentClientId() {
  const requested = new URLSearchParams(window.location.search).get("client");
  return Object.hasOwn(CLIENT_CONFIGS, requested) ? requested : "demo-distributor";
}

function currentView(config) {
  const requested = new URLSearchParams(window.location.search).get("view") ?? "dashboard";
  const enabled = config.navigation.some((item) => item.id === requested && item.href === undefined);
  return enabled ? requested : "dashboard";
}

function createViewLink(view, text, className = "") {
  const link = element("a", { className, text, attributes: { href: "./account.html" } });
  setLocalizedQuery(link, { locale: app.locale, client: app.config.clientId, view });
  return link;
}

function renderLanguageSwitch(root) {
  root.replaceChildren();
  root.append(element("span", { className: "visually-hidden", text: app.dictionary.common.language }));
  for (const language of ["it", "en"]) {
    const link = element("a", {
      className: language === app.locale ? "is-active" : "",
      text: language.toUpperCase(),
      attributes: { href: "./account.html", lang: language, "aria-current": language === app.locale ? "page" : null },
    });
    setLocalizedQuery(link, { locale: language, client: app.config.clientId, view: app.view });
    root.append(link);
  }
}

function renderShell() {
  const { account, common } = app.dictionary;
  document.querySelector("[data-workspace-title]").textContent = account.workspace;
  document.querySelector("[data-demo-banner]").textContent = account.demoBanner;
  renderLanguageSwitch(document.querySelector("[data-language-switch]"));

  const context = document.querySelector("[data-account-context]");
  context.replaceChildren(
    element("span", { className: "account-context__label", text: account.signedInAs }),
    element("strong", { text: app.data.customer.displayName }),
    element("span", { text: `${app.config.priceList} · ${app.config.currency}` }),
  );

  const initials = app.data.customer.contactName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  document.querySelector("[data-avatar]").textContent = initials;
  const profileLink = document.querySelector("[data-profile-link]");
  setLocalizedQuery(profileLink, { locale: app.locale, client: app.config.clientId, view: "profile" });

  const navigation = document.querySelector("[data-account-navigation]");
  navigation.replaceChildren();
  for (const item of app.config.navigation) {
    if (app.config.features[item.id] === false) continue;
    const isActive = item.id === app.view;
    const link = element("a", {
      className: isActive ? "is-active" : "",
      attributes: {
        href: item.href ?? "./account.html",
        "aria-current": isActive ? "page" : null,
      },
    }, [
      icon(item.icon, "account-navigation__icon"),
      element("span", { text: getValue(account, item.labelKey) }),
    ]);
    if (!item.href) setLocalizedQuery(link, { locale: app.locale, client: app.config.clientId, view: item.id });
    if (item.badgeSource === "cart") {
      const quantity = app.data.cart.items.reduce((sum, product) => sum + product.quantity, 0);
      link.append(element("span", { className: "account-navigation__badge", text: quantity }));
    }
    navigation.append(link);
  }

  const footer = document.querySelector("[data-sidebar-footer]");
  const back = element("a", { attributes: { href: "./index.html" } }, [icon("arrow"), element("span", { text: common.backToShop })]);
  const logout = element("a", { attributes: { href: "./access.html" } }, [icon("external"), element("span", { text: account.logout })]);
  setLocalizedQuery(logout, { locale: app.locale, mode: "login" });
  footer.replaceChildren(back, logout);
}

function initSidebar() {
  const sidebar = document.querySelector("[data-account-sidebar]");
  const overlay = document.querySelector("[data-account-overlay]");
  const openButton = document.querySelector("[data-sidebar-open]");
  const closeButton = document.querySelector("[data-sidebar-close]");

  openButton.replaceChildren(icon("menu"));
  closeButton.replaceChildren(icon("close"));

  const close = () => {
    document.documentElement.classList.remove("is-account-menu-open");
    overlay.hidden = true;
    openButton.setAttribute("aria-expanded", "false");
    sidebar.setAttribute("aria-hidden", "true");
  };
  const open = () => {
    document.documentElement.classList.add("is-account-menu-open");
    overlay.hidden = false;
    openButton.setAttribute("aria-expanded", "true");
    sidebar.setAttribute("aria-hidden", "false");
    closeButton.focus();
  };

  openButton.addEventListener("click", open);
  closeButton.addEventListener("click", close);
  overlay.addEventListener("click", close);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.documentElement.classList.contains("is-account-menu-open")) close();
  });
}

function pageHeader(title, description, actions = []) {
  return element("header", { className: "account-page-header" }, [
    element("div", {}, [element("p", { className: "b2b-eyebrow", text: app.dictionary.account.workspace }), element("h1", { text: title }), element("p", { text: description })]),
    actions.length ? element("div", { className: "account-page-header__actions" }, actions) : null,
  ]);
}

function button(label, { variant = "secondary", iconName, type = "button", onClick, disabled = false } = {}) {
  const control = element("button", {
    className: `b2b-button b2b-button--${variant}`,
    text: label,
    attributes: { type, disabled: disabled ? "" : null },
  });
  if (iconName) control.prepend(icon(iconName));
  if (onClick) control.addEventListener("click", onClick);
  return control;
}

function statusPill(status) {
  return element("span", {
    className: `status-pill status-pill--${status}`,
    text: getValue(app.dictionary.account.statuses, status) ?? status,
  });
}

function callout(title, text, variant = "info") {
  return element("aside", { className: `b2b-callout b2b-callout--${variant}` }, [
    icon(variant === "success" ? "check" : "alert"),
    element("div", {}, [element("strong", { text: title }), element("p", { text })]),
  ]);
}

function table(headers, rows, className = "") {
  const head = element("thead", {}, [element("tr", {}, headers.map((header) => element("th", { text: header, attributes: { scope: "col" } })))]);
  const body = element("tbody");
  rows.forEach((cells) => {
    const row = element("tr");
    cells.forEach((content, index) => {
      const cell = element("td", { attributes: { "data-label": headers[index] } });
      cell.append(content instanceof Node ? content : document.createTextNode(String(content)));
      row.append(cell);
    });
    body.append(row);
  });
  return element("div", { className: `responsive-table ${className}`.trim() }, [element("table", {}, [head, body])]);
}

function sectionHeader(title, action) {
  return element("div", { className: "section-heading" }, [element("h2", { text: title }), action]);
}

function renderDashboard() {
  const copy = app.dictionary.account.dashboard;
  const orders = app.data.orders;
  const cartUnits = app.data.cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const reserved = orders.reduce((sum, order) => sum + order.reservedUnits, 0);
  const ready = orders.reduce((sum, order) => sum + order.shippableUnits, 0);
  const openInvoices = app.data.invoices.filter((invoice) => invoice.status !== "paid").length;
  const firstName = app.data.customer.contactName.split(" ")[0];

  const root = document.createDocumentFragment();
  root.append(pageHeader(translate(app.dictionary, "account.dashboard.title", { name: firstName }), copy.description));
  root.append(callout(copy.availabilityTitle, copy.availabilityText));

  const metrics = [
    [copy.metrics.cart, cartUnits, "cart", "cart"],
    [copy.metrics.reserved, reserved, "orders", "orders"],
    [copy.metrics.ready, ready, "shipments", "orders"],
    [copy.metrics.openInvoices, openInvoices, "documents", "documents"],
  ];
  const metricGrid = element("section", { className: "metric-grid", attributes: { "aria-label": copy.metrics.cart } });
  metrics.forEach(([label, value, iconName, view]) => {
    const card = createViewLink(view, "", "metric-card");
    card.append(element("span", { className: "metric-card__icon" }, [icon(iconName)]), element("strong", { text: value }), element("span", { text: label }), icon("arrow", "metric-card__arrow"));
    metricGrid.append(card);
  });
  root.append(metricGrid);

  const actions = [
    [copy.actionCart, "cart", "urgent"],
    [copy.actionShipment, "orders", "ready"],
    [copy.actionInvoice, "documents", "overdue"],
  ];
  const actionList = element("div", { className: "action-list" });
  actions.forEach(([label, view, variant]) => {
    const link = createViewLink(view, "", `action-item action-item--${variant}`);
    link.append(element("span", { className: "action-item__mark" }), element("span", { text: label }), icon("arrow"));
    actionList.append(link);
  });

  const orderRows = orders.slice(0, 3).map((order) => [
    element("strong", { text: order.id }),
    formatDate(order.createdAt, app.locale),
    `${order.lineCount}`,
    formatMoney(order.total, app.locale),
    statusPill(order.status),
  ]);
  const orderHeaders = [app.dictionary.account.orders.order, app.dictionary.account.orders.date, app.dictionary.account.orders.lines, app.dictionary.account.orders.amount, app.dictionary.account.orders.status];
  const columns = element("div", { className: "dashboard-columns" }, [
    element("section", { className: "content-card" }, [sectionHeader(copy.nextActions), actionList]),
    element("section", { className: "content-card" }, [
      sectionHeader(copy.recentOrders, createViewLink("orders", copy.viewAll, "text-link")),
      table(orderHeaders, orderRows, "responsive-table--compact"),
    ]),
  ]);
  root.append(columns);
  return root;
}

function renderCart() {
  const copy = app.dictionary.account.cart;
  const root = document.createDocumentFragment();
  root.append(pageHeader(copy.title, copy.description));
  root.append(callout(copy.notReservedTitle, copy.notReservedText, "warning"));

  const card = element("section", { className: "content-card cart-card" });
  const list = element("div", { className: "cart-list" });
  const summaryValue = element("strong");

  const updateTotals = () => {
    const subtotal = app.data.cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    summaryValue.textContent = formatMoney(subtotal, app.locale);
    renderShell();
  };

  app.data.cart.items.forEach((item) => {
    const quantity = element("input", {
      attributes: { type: "number", min: "1", max: "999", value: item.quantity, "aria-label": copy.quantity },
    });
    const lineTotal = element("strong", { text: formatMoney(item.unitPrice * item.quantity, app.locale) });
    quantity.addEventListener("change", () => {
      item.quantity = Math.max(1, Number.parseInt(quantity.value, 10) || 1);
      quantity.value = item.quantity;
      lineTotal.textContent = formatMoney(item.unitPrice * item.quantity, app.locale);
      updateTotals();
    });

    const availability = item.availability === "limited"
      ? translate(app.dictionary, "account.cart.limited", { available: item.availableQuantity, requested: item.quantity })
      : copy.available;
    const product = element("article", { className: "cart-item" }, [
      element("img", { attributes: { src: item.image, alt: "", width: "88", height: "88", loading: "lazy" } }),
      element("div", { className: "cart-item__product" }, [element("strong", { text: item.artist }), element("span", { text: item.title }), element("small", { text: `${item.format} · ${item.ean}` })]),
      element("div", { className: "cart-item__quantity" }, [element("span", { text: copy.quantity }), quantity]),
      element("div", { className: `cart-item__availability cart-item__availability--${item.availability}` }, [element("span", { text: copy.availability }), element("strong", { text: availability })]),
      element("div", { className: "cart-item__price" }, [element("span", { text: copy.unitPrice }), element("strong", { text: formatMoney(item.unitPrice, app.locale) })]),
      element("div", { className: "cart-item__total" }, [element("span", { text: copy.total }), lineTotal]),
      button(app.dictionary.common.remove, { variant: "text", onClick: () => product.remove() }),
    ]);
    list.append(product);
  });

  const checkPanel = element("div", { className: "availability-result", attributes: { tabindex: "-1" } });
  const checkButton = button(copy.check, { variant: "primary", iconName: "check", onClick: () => renderAvailabilityResult(checkPanel) });
  const summary = element("footer", { className: "cart-summary" }, [
    element("div", {}, [element("span", { text: copy.subtotal }), summaryValue]),
    checkButton,
  ]);
  updateTotals();
  card.append(list, summary, checkPanel);
  root.append(card);
  return root;
}

function renderAvailabilityResult(root) {
  const copy = app.dictionary.account.cart;
  const limitedItems = app.data.cart.items.filter((item) => item.quantity > item.availableQuantity);
  const list = element("div", { className: "availability-lines" });
  limitedItems.forEach((item) => {
    list.append(element("div", { className: "availability-line" }, [
      element("div", {}, [element("strong", { text: `${item.artist} — ${item.title}` }), element("span", { text: item.ean })]),
      element("span", { text: `${copy.requested}: ${item.quantity}` }),
      element("span", { text: `${copy.confirmed}: ${item.availableQuantity}` }),
    ]));
  });

  const accept = element("input", { attributes: { type: "checkbox", id: "accept-availability" } });
  const createOrder = button(copy.createOrder, { variant: "primary", disabled: limitedItems.length > 0 });
  accept.addEventListener("change", () => { createOrder.disabled = !accept.checked; });
  createOrder.addEventListener("click", () => {
    app.data.cart.items.forEach((item) => { item.quantity = Math.min(item.quantity, item.availableQuantity); });
    showStatus(root.querySelector("[data-cart-status]"), copy.orderCreated, "success");
    createOrder.disabled = true;
  });

  root.replaceChildren(...[
    element("h2", { text: copy.checkTitle }),
    element("p", { text: limitedItems.length ? copy.checkText : copy.available }),
    list,
    limitedItems.length ? element("label", { className: "availability-accept", attributes: { for: "accept-availability" } }, [accept, element("span", { text: copy.acceptAlternative })]) : null,
    createOrder,
    element("p", { className: "form-status", attributes: { role: "status", tabindex: "-1", "data-cart-status": "" } }),
  ].filter(Boolean));
  root.classList.add("is-visible");
  root.focus();
}

function renderOrders() {
  const copy = app.dictionary.account.orders;
  const root = document.createDocumentFragment();
  root.append(pageHeader(copy.title, copy.description));

  const search = element("input", { attributes: { type: "search", placeholder: copy.search, "aria-label": copy.search } });
  const filter = element("select", { attributes: { "aria-label": copy.filterStatus } });
  filter.append(element("option", { text: copy.allStatuses, attributes: { value: "" } }));
  ["reserved", "partiallyReady", "processing", "completed"].forEach((status) => filter.append(element("option", { text: getValue(app.dictionary.account.statuses, status), attributes: { value: status } })));
  const filters = element("div", { className: "list-filters" }, [element("label", { className: "search-control" }, [icon("search"), search]), filter]);

  const rowsRoot = element("div");
  const renderRows = () => {
    const query = search.value.trim().toLowerCase();
    const rows = app.data.orders
      .filter((order) => (!query || order.id.toLowerCase().includes(query)) && (!filter.value || order.status === filter.value))
      .map((order) => {
        let shipmentAction;
        if (order.shipmentStatus === "notRequested" && order.shippableUnits > 0) {
          shipmentAction = button(copy.requestShipment, { variant: "small", onClick: () => openShipmentDialog(order) });
        } else {
          shipmentAction = statusPill(order.shipmentStatus);
        }
        return [element("strong", { text: order.id }), formatDate(order.createdAt, app.locale), order.lineCount, order.reservedUnits, formatMoney(order.total, app.locale), statusPill(order.status), shipmentAction];
      });
    rowsRoot.replaceChildren(table([copy.order, copy.date, copy.lines, copy.units, copy.amount, copy.status, copy.shipment], rows));
  };
  search.addEventListener("input", renderRows);
  filter.addEventListener("change", renderRows);
  renderRows();
  root.append(element("section", { className: "content-card" }, [filters, rowsRoot]));
  return root;
}

function openShipmentDialog(order) {
  const copy = app.dictionary.account.orders;
  const address = app.data.addresses.find((item) => item.isDefault) ?? app.data.addresses[0];
  const carrier = app.data.carriers.find((item) => item.isDefault) ?? app.data.carriers[0];
  const status = element("p", { className: "form-status", attributes: { role: "status", tabindex: "-1" } });
  const confirm = button(copy.confirmShipment, { variant: "primary", iconName: "shipments" });
  confirm.addEventListener("click", () => {
    showStatus(status, copy.confirmedMessage, "success");
    confirm.disabled = true;
  });
  openDialog(element("div", {}, [
    element("p", { className: "b2b-eyebrow", text: app.dictionary.account.shipments.title }),
    element("h2", { text: copy.requestTitle, attributes: { id: "b2b-dialog-title" } }),
    element("p", { className: "dialog-description", text: copy.requestText }),
    element("dl", { className: "confirmation-list" }, [
      element("div", {}, [element("dt", { text: copy.referenceOrder }), element("dd", { text: order.id })]),
      element("div", {}, [element("dt", { text: app.dictionary.account.orders.units }), element("dd", { text: order.shippableUnits })]),
      element("div", {}, [element("dt", { text: copy.address }), element("dd", { text: `${address.street}, ${address.city}` })]),
      element("div", {}, [element("dt", { text: copy.carrier }), element("dd", { text: carrier.name })]),
    ]),
    element("div", { className: "dialog-actions" }, [button(app.dictionary.common.cancel, { variant: "secondary", onClick: closeDialog }), confirm]),
    status,
  ]));
}

function renderShipments() {
  const copy = app.dictionary.account.shipments;
  const rows = app.data.shipments.map((shipment) => [
    element("strong", { text: shipment.id }), shipment.orderId, formatDate(shipment.requestedAt, app.locale), shipment.carrier, shipment.units, statusPill(shipment.status),
    element("button", { className: "text-link", text: copy.track, attributes: { type: "button" } }),
  ]);
  return element("div", {}, [pageHeader(copy.title, copy.description), element("section", { className: "content-card" }, [table([copy.shipment, copy.order, copy.requestDate, copy.carrier, copy.units, copy.status, copy.tracking], rows)])]);
}

function renderDocuments() {
  const copy = app.dictionary.account.documents;
  const openAmount = app.data.invoices.filter((invoice) => invoice.status !== "paid").reduce((sum, invoice) => sum + invoice.amount, 0);
  const overdueAmount = app.data.invoices.filter((invoice) => invoice.status === "overdue").reduce((sum, invoice) => sum + invoice.amount, 0);
  const summary = element("section", { className: "financial-summary", attributes: { "aria-label": copy.accountBalance } });
  [[copy.openAmount, openAmount], [copy.overdueAmount, overdueAmount], [copy.availableCredit, app.data.customer.availableCredit]].forEach(([label, value], index) => {
    summary.append(element("div", { className: index === 1 ? "is-alert" : "" }, [element("span", { text: label }), element("strong", { text: formatMoney(value, app.locale) })]));
  });

  const invoiceRows = app.data.invoices.map((invoice) => [
    element("strong", { text: invoice.id }), formatDate(invoice.date, app.locale), invoice.orderId, formatMoney(invoice.amount, app.locale), statusPill(invoice.status),
    button(app.dictionary.common.download, { variant: "small", iconName: "download", onClick: (event) => showInlineMessage(event.currentTarget, copy.demoDownload) }),
  ]);
  const paymentRows = app.data.payments.map((payment) => [element("strong", { text: payment.id }), formatDate(payment.date, app.locale), payment.reference, formatMoney(payment.amount, app.locale), statusPill(payment.status)]);

  return element("div", {}, [
    pageHeader(copy.title, copy.description), summary,
    element("section", { className: "content-card document-section" }, [sectionHeader(copy.invoices), table([copy.document, copy.date, copy.reference, copy.amount, copy.status, copy.actions], invoiceRows)]),
    element("section", { className: "content-card document-section" }, [sectionHeader(copy.payments), table([copy.document, copy.date, copy.reference, copy.amount, copy.status], paymentRows)]),
  ]);
}

function showInlineMessage(control, message) {
  const current = control.closest("section")?.querySelector(".inline-status") ?? element("p", { className: "inline-status", attributes: { role: "status" } });
  current.textContent = message;
  if (!current.isConnected) control.closest("section")?.append(current);
}

function profileField(label, value, { editable = false, type = "text" } = {}) {
  const input = element("input", { attributes: { type, value, readonly: editable ? null : "" } });
  return element("label", { className: "profile-field" }, [
    element("span", { text: label }), input,
    element("small", { text: editable ? app.dictionary.account.profile.editable : app.dictionary.account.profile.readOnly }),
  ]);
}

function renderProfile() {
  const copy = app.dictionary.account.profile;
  const saveStatus = element("p", { className: "form-status", attributes: { role: "status", tabindex: "-1" } });
  const save = button(app.dictionary.common.save, { variant: "primary", onClick: () => showStatus(saveStatus, copy.saved, "success") });
  const form = element("form", { className: "profile-layout" });
  form.addEventListener("submit", (event) => event.preventDefault());
  form.append(
    element("section", { className: "content-card profile-section" }, [sectionHeader(copy.personal), element("div", { className: "profile-grid" }, [profileField(copy.name, app.data.customer.contactName, { editable: true }), profileField(copy.email, app.data.customer.email, { editable: true, type: "email" })])]),
    element("section", { className: "content-card profile-section" }, [sectionHeader(copy.company), element("div", { className: "profile-grid" }, [profileField(copy.companyName, app.data.customer.companyName), profileField(copy.vatNumber, app.data.customer.vatNumber), profileField(copy.customerCode, app.data.customer.customerCode)])]),
    element("section", { className: "content-card profile-section" }, [sectionHeader(copy.contacts), element("div", { className: "profile-grid" }, [profileField(copy.phone, app.data.customer.phone, { editable: true })])]),
    element("div", { className: "profile-actions" }, [save, saveStatus]),
  );

  const addresses = element("section", { className: "content-card profile-section" }, [sectionHeader(copy.addresses, button(copy.addAddress, { variant: "secondary", onClick: (event) => showInlineMessage(event.currentTarget, app.dictionary.common.demoAction) }))]);
  const grid = element("div", { className: "address-grid" });
  app.data.addresses.forEach((address) => grid.append(element("article", { className: "address-card" }, [
    element("div", {}, [element("strong", { text: address.label }), address.isDefault ? element("span", { className: "status-pill status-pill--active", text: app.dictionary.common.default }) : null]),
    element("p", { text: address.recipient }), element("p", { text: address.street }), element("p", { text: `${address.postalCode} ${address.city}, ${address.country}` }),
    button(app.dictionary.common.edit, { variant: "text", onClick: (event) => showInlineMessage(event.currentTarget, app.dictionary.common.demoAction) }),
  ])));
  addresses.append(grid);

  return element("div", {}, [pageHeader(copy.title, copy.description), form, addresses]);
}

function renderCarriers() {
  const copy = app.dictionary.account.carriers;
  const add = button(copy.addCarrier, { variant: "primary", onClick: (event) => showInlineMessage(event.currentTarget, copy.demoMessage) });
  const grid = element("div", { className: "carrier-grid" });
  app.data.carriers.forEach((carrier) => {
    grid.append(element("article", { className: "content-card carrier-card" }, [
      element("div", { className: "carrier-card__head" }, [element("span", { className: "carrier-card__icon" }, [icon("carriers")]), element("div", {}, [element("h2", { text: carrier.name }), carrier.isDefault ? element("span", { className: "status-pill status-pill--active", text: app.dictionary.common.default }) : null])]),
      element("dl", {}, [
        element("div", {}, [element("dt", { text: copy.accountCode }), element("dd", { text: carrier.accountCode })]),
        element("div", {}, [element("dt", { text: copy.service }), element("dd", { text: carrier.service })]),
        element("div", {}, [element("dt", { text: copy.contact }), element("dd", { text: carrier.contact })]),
      ]),
      element("div", { className: "carrier-card__actions" }, [button(app.dictionary.common.edit, { variant: "text", onClick: (event) => showInlineMessage(event.currentTarget, copy.demoMessage) }), button(app.dictionary.common.remove, { variant: "text", onClick: (event) => showInlineMessage(event.currentTarget, copy.demoMessage) })]),
    ]));
  });
  return element("div", {}, [pageHeader(copy.title, copy.description, [add]), grid]);
}

function renderView() {
  const root = document.querySelector("[data-account-main]");
  const renderers = {
    dashboard: renderDashboard,
    cart: renderCart,
    orders: renderOrders,
    shipments: renderShipments,
    documents: renderDocuments,
    profile: renderProfile,
    carriers: renderCarriers,
  };
  root.replaceChildren((renderers[app.view] ?? renderDashboard)());
  root.setAttribute("aria-busy", "false");
}

function openDialog(content) {
  const dialog = app.dialog;
  app.lastFocused = document.activeElement;
  document.querySelector("[data-dialog-content]").replaceChildren(content);
  dialog.hidden = false;
  dialog.setAttribute("aria-hidden", "false");
  document.documentElement.classList.add("is-dialog-open");
  dialog.querySelector("button, [href], input, select")?.focus();
}

function closeDialog() {
  app.dialog.hidden = true;
  app.dialog.setAttribute("aria-hidden", "true");
  document.documentElement.classList.remove("is-dialog-open");
  app.lastFocused?.focus();
}

function initDialog() {
  app.dialog = document.querySelector("[data-b2b-dialog]");
  app.dialog.querySelectorAll("[data-dialog-close]").forEach((control) => {
    if (control.classList.contains("b2b-dialog__close")) control.replaceChildren(icon("close"));
    control.addEventListener("click", closeDialog);
  });
  window.addEventListener("keydown", (event) => {
    if (app.dialog.hidden) return;
    if (event.key === "Escape") closeDialog();
    else trapFocus(event, app.dialog);
  });
}

async function bootstrap() {
  const clientId = currentClientId();
  const [content, config, demoData] = await Promise.all([
    fetchJson(CONTENT_ENDPOINT),
    fetchJson(CLIENT_CONFIGS[clientId]),
    fetchJson(DEMO_ENDPOINT),
  ]);
  app.locale = resolveLocale({ supportedLocales: content.supportedLocales, defaultLocale: content.defaultLocale });
  app.dictionary = content.locales[app.locale];
  app.config = config;
  app.data = structuredClone(demoData);
  app.view = currentView(config);

  document.documentElement.lang = app.locale;
  document.title = app.dictionary.meta.accountTitle;
  document.querySelector("[data-page-description]")?.setAttribute("content", app.dictionary.meta.description);
  renderShell();
  initSidebar();
  initDialog();
  renderView();
}

bootstrap().catch((error) => {
  const root = document.querySelector("[data-account-main]");
  root.replaceChildren(element("p", { className: "form-status", text: "Impossibile caricare l’area cliente." }));
  root.setAttribute("aria-busy", "false");
  console.error("Impossibile inizializzare l’area B2B.", error);
});
