/* =========================================================
   EL PUNTO DEL MADURO — POS
   script.js (con pestañas dinámicas para Llevar y Domicilio)
   ========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     DATOS DEL MENÚ
  --------------------------------------------------------- */
  const CATEGORIES = ["Maduros", "Tostones", "Bowls", "Sodas Italianas", "Jugos Naturales", "Otras Bebidas"];

  const PRODUCTS = [
    { id: "m1", cat: "Maduros", name: "Maduro con Queso Campesino", price: 5000 },
    { id: "m2", cat: "Maduros", name: "Maduro con Queso Doble Crema", price: 6000 },
    { id: "m3", cat: "Maduros", name: "Maduro con Queso Costeño", price: 6000 },
    { id: "m4", cat: "Maduros", name: "Maduro con Costilla (queso doble crema, costilla en cuadritos y maicitos)", price: 12000 },
    { id: "m5", cat: "Maduros", name: "Maduro con Chorizo Premium (queso doble crema, chorizo premium y maicitos)", price: 12000 },
    { id: "m6", cat: "Maduros", name: "Maduro con Carne (queso doble crema, carne desmechada y maicitos)", price: 13000 },
    { id: "m7", cat: "Maduros", name: "Maduro Especial (queso doble crema, campesino, costeño, costilla, chorizo premium y maicitos)", price: 20000 },
    { id: "m8", cat: "Maduros", name: "Maduro con Bocadillo (queso campesino y bocadillo)", price: 5500 },
    { id: "m9", cat: "Maduros", name: "Maduro de Miel (miel, queso campesino o doble crema y crema de leche)", price: 6000 },
    { id: "t1", cat: "Tostones", name: "Tostón Ranchero (pollo en salsa de la casa, queso doble crema y salchicha ranchera)", price: 18000 },
    { id: "t2", cat: "Tostones", name: "Tostón de Carne (carne desmechada, queso doble crema, maicitos y guacamole)", price: 18000 },
    { id: "b1", cat: "Bowls", name: "Bowl de Costilla (maduro, queso doble crema, queso costeño, costilla, pico de gallo, guacamole y maicitos)", price: 18000 },
    { id: "b2", cat: "Bowls", name: "Bowl de Carne (maduro, queso doble crema, queso costeño, carne desmechada, pico de gallo, guacamole y maicitos)", price: 18000 },
    { id: "si1", cat: "Sodas Italianas", name: "Soda Italiana Frutos Rojos", price: 12000 },
    { id: "si2", cat: "Sodas Italianas", name: "Soda Italiana Frutos Amarillos", price: 12000 },
    { id: "si3", cat: "Sodas Italianas", name: "Soda Italiana Lulo", price: 12000 },
    { id: "jn1", cat: "Jugos Naturales", name: "Jugo Natural de Mango en Agua", price: 6000 },
    { id: "jn1l", cat: "Jugos Naturales", name: "Jugo Natural de Mango en Leche", price: 7500 },
    { id: "jn2", cat: "Jugos Naturales", name: "Jugo Natural de Mora en Agua", price: 6000 },
    { id: "jn2l", cat: "Jugos Naturales", name: "Jugo Natural de Mora en Leche", price: 7500 },
    { id: "jn3", cat: "Jugos Naturales", name: "Jugo Natural de Maracuyá en Agua", price: 6000 },
    { id: "jn3l", cat: "Jugos Naturales", name: "Jugo Natural de Maracuyá en Leche", price: 7500 },
    { id: "ob1", cat: "Otras Bebidas", name: "Jugo HIT 1 Litro", price: 6000 },
    { id: "ob2", cat: "Otras Bebidas", name: "Jugo HIT Personal", price: 4000 },
    { id: "ob15", cat: "Otras Bebidas", name: "Jugo HIT Mini", price: 2500 },
    { id: "ob3", cat: "Otras Bebidas", name: "Soda Bretaña", price: 4000 },
    { id: "ob9", cat: "Otras Bebidas", name: "Coca-Cola", price: 4000 },
    { id: "ob16", cat: "Otras Bebidas", name: "Coca-Cola Mini", price: 2500 },
    { id: "ob4", cat: "Otras Bebidas", name: "Agua", price: 2000 },
    { id: "ob10", cat: "Otras Bebidas", name: "Agua H2O Mini", price: 2000 },
    { id: "ob11", cat: "Otras Bebidas", name: "Pony Malta Mini", price: 2500 },
    { id: "ob12", cat: "Otras Bebidas", name: "Postobón Mini", price: 2000 },
    { id: "ob13", cat: "Otras Bebidas", name: "Postobón 1.5 L", price: 6500 },
    { id: "ob5", cat: "Otras Bebidas", name: "Limonada Natural", price: 6000 },
    { id: "ob6", cat: "Otras Bebidas", name: "Café Negro", price: 2500 },
    { id: "ob14", cat: "Otras Bebidas", name: "Café con Leche", price: 3500 },
  ];

  const TABLE_COUNT = 5;
  const PRECIO_DOMICILIO = 2000;
  const RECARGO_EMPACAR = 1000;
  const STORAGE_KEY = "elPuntoDelMaduro_state_v2";

  /* ---------------------------------------------------------
     ESTADO
  --------------------------------------------------------- */
  let state = {
    currentKey: "mesa_1",
    currentCategory: "Maduros",
    orders: {
      mesa_1: [], mesa_2: [], mesa_3: [], mesa_4: [], mesa_5: []
    },
    sentPedidos: {
      mesa_1: [], mesa_2: [], mesa_3: [], mesa_4: [], mesa_5: []
    },
    orderInfo: {},
    takeoutCounter: 0,
    deliveryCounter: 0
  };

  let excEditingItemId = null;
  let selectedPayMethod = null;

  /* ---------------------------------------------------------
     PERSISTENCIA
  --------------------------------------------------------- */
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("No se pudo guardar el estado", e);
    }
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed) return;

      if (parsed.orders) {
        state.orders = parsed.orders;
        state.sentPedidos = parsed.sentPedidos || {};
        state.orderInfo = parsed.orderInfo || {};
        state.currentKey = parsed.currentKey || "mesa_1";
        state.takeoutCounter = parsed.takeoutCounter || 0;
        state.deliveryCounter = parsed.deliveryCounter || 0;
      }
      if (CATEGORIES.includes(parsed.currentCategory)) {
        state.currentCategory = parsed.currentCategory;
      }
    } catch (e) {
      console.error("No se pudo cargar el estado", e);
    }
  }

  /* ---------------------------------------------------------
     HELPERS
  --------------------------------------------------------- */
  function formatCOP(n) {
    return "$" + Math.round(n || 0).toLocaleString("es-CO");
  }

  const CATEGORIAS_SOLO_TITULO = ["Maduros", "Tostones", "Bowls"];

  function nombreVitrina(p) {
    if (!CATEGORIAS_SOLO_TITULO.includes(p.cat)) return p.name;
    const idx = p.name.indexOf("(");
    return idx > -1 ? p.name.slice(0, idx).trim() : p.name;
  }

  function uid() {
    return "it_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }

  function currentOrder() {
    if (!state.orders[state.currentKey]) {
      state.orders[state.currentKey] = [];
    }
    return state.orders[state.currentKey];
  }

  function orderTotal(order) {
    if (!order) return 0;
    let total = order.reduce((sum, it) => sum + it.price * it.qty, 0);
    
    if (state.currentKey.startsWith("domicilio_")) {
      const info = state.orderInfo[state.currentKey];
      if (info && info.direccion !== "Para llevar") {
        total += PRECIO_DOMICILIO;
      }
    }

    if (state.currentKey.startsWith("llevar_") || state.currentKey.startsWith("domicilio_")) {
      const categoriasConRecargo = ["Maduros", "Tostones", "Bowls"];
      order.forEach((it) => {
        const productoOriginal = PRODUCTS.find(p => p.id === it.productId);
        if (productoOriginal && categoriasConRecargo.includes(productoOriginal.cat)) {
          total += (RECARGO_EMPACAR * it.qty);
        }
      });
    }

    return total;
  }

  function orderItemCount(order) {
    if (!order) return 0;
    return order.reduce((sum, it) => sum + it.qty, 0);
  }

  function sentTotal(key) {
    return (state.sentPedidos[key] || []).reduce((sum, p) => sum + p.total, 0);
  }

  function sentCount(key) {
    return (state.sentPedidos[key] || []).length;
  }

  function currentOwed() {
    return sentTotal(state.currentKey) + orderTotal(currentOrder());
  }

  /* ---------------------------------------------------------
     REFERENCIAS DOM
  --------------------------------------------------------- */
  const el = {
    tablesBar: document.getElementById("tablesBar"),
    categories: document.getElementById("categories"),
    productsGrid: document.getElementById("productsGrid"),
    orderTableTitle: document.getElementById("orderTableTitle"),
    orderCount: document.getElementById("orderCount"),
    orderList: document.getElementById("orderList"),
    orderEmpty: document.getElementById("orderEmpty"),
    orderSentBanner: document.getElementById("orderSentBanner"),
    orderTotal: document.getElementById("orderTotal"),
    btnCharge: document.getElementById("btnCharge"),
    btnNewOrder: document.getElementById("btnNewOrder"),
    modalExceptions: document.getElementById("modalExceptions"),
    excModalTitle: document.getElementById("excModalTitle"),
    excOptions: document.getElementById("excOptions"),
    excNote: document.getElementById("excNote"),
    btnSaveExceptions: document.getElementById("btnSaveExceptions"),
    modalPayment: document.getElementById("modalPayment"),
    payTotal: document.getElementById("payTotal"),
    payMethods: document.getElementById("payMethods"),
    btnConfirmPay: document.getElementById("btnConfirmPay"),
    toast: document.getElementById("toast"),
    btnOrderType: document.getElementById("btnOrderType"),
    btnKitchen: document.getElementById("btnKitchen"),
    screenOrderType: document.getElementById("screenOrderType"),
    btnPickMesa: document.getElementById("btnPickMesa"),
    btnPickDomicilio: document.getElementById("btnPickDomicilio"),
    screenSelectTable: document.getElementById("screenSelectTable"),
    selectTableGrid: document.getElementById("selectTableGrid"),
    modalDomicilio: document.getElementById("modalDomicilio"),
    domNombre: document.getElementById("domNombre"),
    domDireccion: document.getElementById("domDireccion"),
    domTelefono: document.getElementById("domTelefono"),
    domObservaciones: document.getElementById("domObservaciones"),
    btnSaveDomicilio: document.getElementById("btnSaveDomicilio"),
    btnVentas: document.getElementById("btnVentas"),
    screenVentas: document.getElementById("screenVentas"),
    ventasScreenTitle: document.getElementById("ventasScreenTitle"),
    ventasTotalLabel: document.getElementById("ventasTotalLabel"),
    ventasList: document.getElementById("ventasList"),
    ventasEmpty: document.getElementById("ventasEmpty"),
    ventasTotalHoy: document.getElementById("ventasTotalHoy"),
    ventasCountHoy: document.getElementById("ventasCountHoy"),
    ventasEfectivo: document.getElementById("ventasEfectivo"),
    ventasNequi: document.getElementById("ventasNequi"),
    ventasTransferencia: document.getElementById("ventasTransferencia"),
    ventasDaysPanel: document.getElementById("ventasDaysPanel"),
    ventasDaysList: document.getElementById("ventasDaysList"),
    btnToggleVentasDays: document.getElementById("btnToggleVentasDays"),
    btnEntregados: document.getElementById("btnEntregados"),
    screenEntregados: document.getElementById("screenEntregados"),
    entregadosList: document.getElementById("entregadosList"),
    entregadosCount: document.getElementById("entregadosCount"),
    btnRecargarVentas: document.getElementById("btnRecargarVentas"),
  };

  /* ---------------------------------------------------------
     RENDER DE MESAS Y PESTAÑAS DINÁMICAS
  --------------------------------------------------------- */
  function renderTables() {
    el.tablesBar.innerHTML = "";

    // 1. Mesas fijas (1 a 5)
    for (let i = 1; i <= TABLE_COUNT; i++) {
      const key = `mesa_${i}`;
      if (!state.orders[key]) state.orders[key] = [];
      if (!state.sentPedidos[key]) state.sentPedidos[key] = [];

      const owed = sentTotal(key) + orderTotal(state.orders[key]);
      const estaOcupada = owed > 0 || state.orders[key].length > 0;
      const btn = document.createElement("button");
      const isActive = state.currentKey === key;

      btn.className = "table-btn" + (isActive ? " active" : "") + (estaOcupada ? " has-order" : "");
      btn.innerHTML = `<span>Mesa ${i}</span><span class="table-sub">${estaOcupada ? formatCOP(owed) : "Libre"}</span>`;
      btn.addEventListener("click", () => switchOrder(key));
      el.tablesBar.appendChild(btn);
    }

    // 2. Pedidos "Para Llevar" activos
    Object.keys(state.orders).filter(k => k.startsWith("llevar_")).forEach((key) => {
      const info = state.orderInfo[key] || {};
      const label = info.nombre || ("LLEVAR " + key.replace("llevar_", ""));
      const owed = sentTotal(key) + orderTotal(state.orders[key]);
      const btn = document.createElement("button");
      const isActive = state.currentKey === key;

      btn.className = "table-btn" + (isActive ? " active" : "") + " has-order";
      btn.style.borderColor = "var(--green)";
      btn.innerHTML = `<span>📦 ${escapeHtml(label)}</span><span class="table-sub">${formatCOP(owed)}</span>`;
      btn.addEventListener("click", () => switchOrder(key));
      el.tablesBar.appendChild(btn);
    });

    // Botón ➕ Llevar
    const btnNuevoLlevar = document.createElement("button");
    btnNuevoLlevar.className = "table-btn";
    btnNuevoLlevar.style.border = "2px dashed var(--green)";
    btnNuevoLlevar.innerHTML = `<span>➕ Llevar</span><span class="table-sub">Nuevo</span>`;
    btnNuevoLlevar.addEventListener("click", crearPedidoParaLlevar);
    el.tablesBar.appendChild(btnNuevoLlevar);

    // 3. Pedidos "Domicilio" activos
    Object.keys(state.orders).filter(k => k.startsWith("domicilio_")).forEach((key) => {
      const info = state.orderInfo[key] || {};
      const label = info.nombre ? info.nombre : ("DOM " + key.replace("domicilio_", ""));
      const owed = sentTotal(key) + orderTotal(state.orders[key]);
      const btn = document.createElement("button");
      const isActive = state.currentKey === key;

      btn.className = "table-btn" + (isActive ? " active" : "") + " has-order";
      btn.style.borderColor = "var(--yellow)";
      btn.innerHTML = `<span>🛵 ${escapeHtml(label)}</span><span class="table-sub">${formatCOP(owed)}</span>`;
      btn.addEventListener("click", () => switchOrder(key));
      el.tablesBar.appendChild(btn);
    });

    // Botón ➕ Domicilio
    const btnNuevoDom = document.createElement("button");
    btnNuevoDom.className = "table-btn";
    btnNuevoDom.style.border = "2px dashed var(--yellow)";
    btnNuevoDom.innerHTML = `<span>➕ Domicilio</span><span class="table-sub">Nuevo</span>`;
    btnNuevoDom.addEventListener("click", abrirModalNuevoDomicilio);
    el.tablesBar.appendChild(btnNuevoDom);
  }

  function switchOrder(key) {
    state.currentKey = key;
    saveState();
    renderTables();
    renderCategories();
    renderProducts();
    renderOrder();
  }

  function crearPedidoParaLlevar() {
    state.takeoutCounter++;
    const key = `llevar_${state.takeoutCounter}`;
    state.orders[key] = [];
    state.sentPedidos[key] = [];
    state.orderInfo[key] = { nombre: `LLEVAR ${state.takeoutCounter}`, direccion: "Para llevar" };
    closeModal(el.screenOrderType);
    closeModal(el.screenSelectTable);
    switchOrder(key);
    showToast(`📦 Creado: LLEVAR ${state.takeoutCounter}`);
  }

  function abrirModalNuevoDomicilio() {
    closeModal(el.screenOrderType);
    el.domNombre.value = "";
    el.domDireccion.value = "";
    el.domTelefono.value = "";
    el.domObservaciones.value = "";
    openModal(el.modalDomicilio);
  }

  function saveDomicilio() {
    const nombre = el.domNombre.value.trim();
    const direccion = el.domDireccion.value.trim();
    const telefono = el.domTelefono.value.trim();
    if (!nombre || !direccion || !telefono) {
      showToast("Completa nombre, dirección y teléfono");
      return;
    }
    state.deliveryCounter++;
    const key = `domicilio_${state.deliveryCounter}`;
    state.orders[key] = [];
    state.sentPedidos[key] = [];
    state.orderInfo[key] = { nombre, direccion, telefono, observaciones: el.domObservaciones.value.trim() };
    closeModal(el.modalDomicilio);
    switchOrder(key);
    showToast(`🛵 Creado: Domicilio ${state.deliveryCounter} (${nombre})`);
  }

  function renderCategories() {
    el.categories.innerHTML = "";
    CATEGORIES.forEach((cat) => {
      const btn = document.createElement("button");
      btn.className = "category-btn" + (cat === state.currentCategory ? " active" : "");
      btn.textContent = cat;
      btn.addEventListener("click", () => {
        state.currentCategory = cat;
        saveState();
        renderCategories();
        renderProducts();
      });
      el.categories.appendChild(btn);
    });
  }

  function renderProducts() {
    el.productsGrid.innerHTML = "";
    const order = currentOrder();
    PRODUCTS.filter((p) => p.cat === state.currentCategory).forEach((p) => {
      const totalQtyOfProduct = order.filter((it) => it.productId === p.id).reduce((s, it) => s + it.qty, 0);
      const card = document.createElement("button");
      card.className = "product-card" + (totalQtyOfProduct > 0 ? " in-order" : "");
      card.title = p.name;
      card.innerHTML = `<div class="p-name">${escapeHtml(nombreVitrina(p))}</div><div class="p-bottom"><span class="p-price">${formatCOP(p.price)}</span><span class="p-qty-badge">${totalQtyOfProduct > 0 ? totalQtyOfProduct : ""}</span></div>`;
      card.addEventListener("click", () => addProductToOrder(p));
      el.productsGrid.appendChild(card);
    });
  }

  function addProductToOrder(product) {
    const order = currentOrder();
    let item = order.find((it) => it.productId === product.id && (!it.exceptions || it.exceptions.length === 0));
    if (item) {
      item.qty += 1;
    } else {
      order.push({ id: uid(), productId: product.id, name: product.name, price: product.price, qty: 1, exceptions: [] });
    }
    saveState();
    renderTables();
    renderProducts();
    renderOrder();
  }

  function renderOrder() {
    const key = state.currentKey;
    const order = currentOrder();

    if (key.startsWith("domicilio_")) {
      const info = state.orderInfo[key] || {};
      el.orderTableTitle.innerHTML = "🛵 " + escapeHtml(info.nombre || "Domicilio") + '<span class="order-client-sub">' + escapeHtml(info.direccion || "") + "</span>";
    } else if (key.startsWith("llevar_")) {
      const info = state.orderInfo[key] || {};
      el.orderTableTitle.innerHTML = "📦 " + escapeHtml(info.nombre || "Para llevar") + '<span class="order-client-sub">Para llevar</span>';
    } else {
      const num = key.replace("mesa_", "");
      el.orderTableTitle.textContent = "Mesa " + num;
    }

    const count = orderItemCount(order);
    el.orderCount.textContent = count === 1 ? "1 producto" : count + " productos";

    const enviado = sentTotal(key);
    const nEnviados = sentCount(key);
    if (enviado > 0) {
      el.orderSentBanner.textContent = `🔥 Ya en cocina: ${formatCOP(enviado)} (${nEnviados === 1 ? "1 pedido" : nEnviados + " pedidos"})`;
      el.orderSentBanner.classList.add("show");
    } else {
      el.orderSentBanner.classList.remove("show");
    }

    Array.from(el.orderList.children).forEach((child) => { if (child.id !== "orderEmpty") child.remove(); });
    if (order.length === 0) {
      el.orderEmpty.style.display = "flex";
    } else {
      el.orderEmpty.style.display = "none";
      order.forEach((item) => { el.orderList.appendChild(buildOrderItemNode(item)); });
    }
    const owed = currentOwed();
    el.orderTotal.textContent = formatCOP(owed);
    el.btnCharge.disabled = owed <= 0;
  }

  function buildOrderItemNode(item) {
    const subtotal = item.price * item.qty;
    const wrap = document.createElement("div");
    wrap.className = "order-item";
    const excHtml = (item.exceptions && item.exceptions.length > 0) ? `<ul class="order-item-exceptions">${item.exceptions.map((e) => `<li>${escapeHtml(e)}</li>`).join("")}</ul>` : "";
    wrap.innerHTML = `<div class="order-item-top"><div class="order-item-name"><span class="qty-x">x${item.qty}</span> ${escapeHtml(item.name)}</div><div class="order-item-subtotal">${formatCOP(subtotal)}</div></div>${excHtml}<div class="order-item-controls"><div class="qty-control"><button class="qty-btn" data-action="dec">−</button><span class="qty-value">${item.qty}</span><button class="qty-btn" data-action="inc">+</button></div><button class="btn-edit-note" data-action="note" title="Excepciones">✎</button><button class="btn-remove-item" data-action="remove" title="Eliminar">🗑</button></div>`;
    wrap.querySelector('[data-action="inc"]').addEventListener("click", (e) => { e.stopPropagation(); changeQty(item.id, 1); });
    wrap.querySelector('[data-action="dec"]').addEventListener("click", (e) => { e.stopPropagation(); changeQty(item.id, -1); });
    wrap.querySelector('[data-action="remove"]').addEventListener("click", (e) => { e.stopPropagation(); removeItem(item.id); });
    wrap.querySelector('[data-action="note"]').addEventListener("click", (e) => { e.stopPropagation(); openExceptionsModal(item.id); });
    wrap.addEventListener("click", () => openExceptionsModal(item.id));
    return wrap;
  }

  function changeQty(itemId, delta) {
    const order = currentOrder();
    const item = order.find((it) => it.id === itemId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) { removeItem(itemId); return; }
    saveState();
    renderTables();
    renderProducts();
    renderOrder();
  }

  function removeItem(itemId) {
    const order = currentOrder();
    const idx = order.findIndex((it) => it.id === itemId);
    if (idx === -1) return;
    order.splice(idx, 1);
    saveState();
    renderTables();
    renderProducts();
    renderOrder();
  }

  /* ---------------------------------------------------------
     MODALES
  --------------------------------------------------------- */
  function openExceptionsModal(itemId) {
    const order = currentOrder();
    const item = order.find((it) => it.id === itemId);
    if (!item) return;
    excEditingItemId = itemId;
    el.excModalTitle.textContent = item.name;
    const checkboxes = el.excOptions.querySelectorAll('input[type="checkbox"]');
    const fixedOptions = ["Sin queso", "Sin maicitos", "Sin bocadillo", "Empacar"];
    checkboxes.forEach((cb) => { cb.checked = item.exceptions.includes(cb.value); });
    const extra = item.exceptions.filter((e) => !fixedOptions.includes(e));
    el.excNote.value = extra.join(", ");
    openModal(el.modalExceptions);
  }

  function saveExceptions() {
    if (!excEditingItemId) return;
    const order = currentOrder();
    const item = order.find((it) => it.id === excEditingItemId);
    if (!item) return;
    const checkboxes = el.excOptions.querySelectorAll('input[type="checkbox"]');
    const chosen = [];
    checkboxes.forEach((cb) => { if (cb.checked) chosen.push(cb.value); });
    const note = el.excNote.value.trim();
    if (note) chosen.push(note);
    item.exceptions = chosen;
    saveState();
    closeModal(el.modalExceptions);
    renderProducts();
    renderOrder();
    showToast("Excepciones guardadas");
  }

  function openPaymentModal() {
    const owed = currentOwed();
    if (owed <= 0) return;
    selectedPayMethod = null;
    el.btnConfirmPay.disabled = true;
    el.payMethods.querySelectorAll(".pay-method").forEach((b) => b.classList.remove("selected"));
    el.payTotal.textContent = formatCOP(owed);
    openModal(el.modalPayment);
  }

  /* ---------------------------------------------------------
     COBRAR
  --------------------------------------------------------- */
  async function confirmPayment() {
    if (!selectedPayMethod) return;
    const key = state.currentKey;
    const order = currentOrder();
    const metodo = selectedPayMethod;

    if (!window.PedidosCocina) {
      showToast("Firebase no está configurado. Revisa firebase.js");
      return;
    }

    const isTakeout = key.startsWith("llevar_");
    const isDelivery = key.startsWith("domicilio_");
    const isMesa = key.startsWith("mesa_");
    const info = state.orderInfo[key] || {};

    el.btnConfirmPay.disabled = true;
    try {
      if (order.length > 0) {
        const productos = order.map((it) => ({
          nombre: it.name,
          cantidad: it.qty,
          precio: it.price,
          excepciones: it.exceptions || [],
        }));
        const pedidoExtra = {
          tipoPedido: isTakeout ? "paraLlevar" : (isDelivery ? "domicilio" : "mesa"),
          mesa: isMesa ? parseInt(key.replace("mesa_", "")) : null,
          nombreCliente: (isDelivery || isTakeout) ? info.nombre : null,
          direccion: (isDelivery || isTakeout) ? info.direccion : null,
          telefono: (isDelivery || isTakeout) ? info.telefono : null,
          productos: productos,
          observaciones: (isDelivery || isTakeout) ? (info.observaciones || "") : "",
          total: orderTotal(order),
          estado: "entregado",
        };
        const ref = await window.PedidosCocina.enviarPedido(pedidoExtra);
        state.sentPedidos[key] = state.sentPedidos[key] || [];
        state.sentPedidos[key].push({ id: ref.id, total: pedidoExtra.total });
        await window.PedidosCocina.cobrarPedidos([ref.id], metodo);
      }
      const idsPorCobrar = (state.sentPedidos[key] || []).map((p) => p.id);
      if (idsPorCobrar.length > 0) {
        await window.PedidosCocina.cobrarPedidos(idsPorCobrar, metodo);
      }

      // Eliminar pestaña dinámica al cobrar
      if (isTakeout || isDelivery) {
        delete state.orders[key];
        delete state.sentPedidos[key];
        delete state.orderInfo[key];
        state.currentKey = "mesa_1";
      } else {
        state.orders[key] = [];
        state.sentPedidos[key] = [];
      }

      saveState();
      closeModal(el.modalPayment);
      renderTables();
      renderProducts();
      renderOrder();

      let mensaje = "Pago registrado (" + metodo + ") · ";
      if (isTakeout) mensaje += "Pedido para llevar entregado";
      else if (isDelivery) mensaje += "Domicilio entregado";
      else mensaje += "Mesa " + key.replace("mesa_", "") + " liberada";
      showToast(mensaje);

      setTimeout(() => cargarVentasDirectas(), 500);
    } catch (err) {
      console.error("❌ Error al registrar el pago:", err);
      showToast("No se pudo registrar el pago. Revisa la consola (F12) para más detalles.");
    } finally {
      el.btnConfirmPay.disabled = false;
    }
  }

  /* ---------------------------------------------------------
     ENVIAR A COCINA
  --------------------------------------------------------- */
  function sendToKitchen() {
    const key = state.currentKey;
    const order = currentOrder();
    if (order.length === 0) { showToast("Agrega productos antes de enviar a cocina"); return; }
    if (!window.PedidosCocina || typeof window.PedidosCocina.enviarPedido !== "function") {
      showToast("Firebase no está configurado. Revisa firebase.js");
      return;
    }

    const isTakeout = key.startsWith("llevar_");
    const isDelivery = key.startsWith("domicilio_");
    const isMesa = key.startsWith("mesa_");
    const info = state.orderInfo[key] || {};

    const productos = order.map((it) => ({
      nombre: it.name,
      cantidad: it.qty,
      precio: it.price,
      excepciones: it.exceptions || [],
    }));

    const pedido = {
      tipoPedido: isTakeout ? "paraLlevar" : (isDelivery ? "domicilio" : "mesa"),
      mesa: isMesa ? parseInt(key.replace("mesa_", "")) : null,
      nombreCliente: (isDelivery || isTakeout) ? info.nombre : null,
      direccion: (isDelivery || isTakeout) ? info.direccion : null,
      telefono: (isDelivery || isTakeout) ? info.telefono : null,
      productos: productos,
      observaciones: (isDelivery || isTakeout) ? (info.observaciones || "") : "",
      total: orderTotal(order),
      estado: "pendiente",
    };

    el.btnKitchen.disabled = true;
    window.PedidosCocina.enviarPedido(pedido)
      .then((ref) => {
        state.sentPedidos[key] = state.sentPedidos[key] || [];
        state.sentPedidos[key].push({ id: ref.id, total: pedido.total });
        state.orders[key] = [];
        saveState();
        renderTables();
        renderProducts();
        renderOrder();
        showToast("Pedido enviado a cocina 🚀 · Ya está en la cuenta para cobrar");
      })
      .catch((err) => { console.error(err); showToast("No se pudo enviar el pedido."); })
      .finally(() => { el.btnKitchen.disabled = false; });
  }

  /* ---------------------------------------------------------
     VENTAS — CARGA DIRECTA DESDE FIRESTORE
  --------------------------------------------------------- */
  function fechaDeHora(hora) {
    if (!hora || typeof hora.toDate !== "function") return new Date();
    return hora.toDate();
  }

  function dayKeyOf(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }

  function horaTexto(hora) {
    if (!hora || typeof hora.toDate !== "function") return "--:--";
    return hora.toDate().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  }

  async function cargarVentasDirectas() {
    try {
      const { getFirestore, collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js");
      const db = getFirestore(window.firebaseApp);
      const querySnapshot = await getDocs(collection(db, "pedidosCocina"));
      const ventas = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.pagado === true && data.estado === "entregado") {
          ventas.push({ id: doc.id, ...data });
        }
      });
      ventas.sort((a, b) => {
        const ta = a.horaPago && typeof a.horaPago.toMillis === "function" ? a.horaPago.toMillis() : 0;
        const tb = b.horaPago && typeof b.horaPago.toMillis === "function" ? b.horaPago.toMillis() : 0;
        return tb - ta;
      });
      renderVentas(ventas);
      renderVentasDaysPanel(ventas);
      return ventas;
    } catch (error) {
      console.error("❌ Error cargando ventas:", error);
      el.ventasList.innerHTML = `<div class="ventas-empty">⚠ Error al cargar ventas: ${error.message}</div>`;
      return [];
    }
  }

  function renderVentas(ventas) {
    const filtradas = ventas.slice(0, 50);
    el.ventasList.innerHTML = "";
    if (filtradas.length === 0) {
      const empty = document.createElement("div");
      empty.className = "ventas-empty";
      empty.textContent = "Aún no hay ventas registradas";
      el.ventasList.appendChild(empty);
    } else {
      filtradas.forEach((v) => {
        const esDom = v.tipoPedido === "domicilio";
        const esParaLlevar = v.tipoPedido === "paraLlevar";
        let titulo = "";
        if (esParaLlevar) titulo = "📦 " + escapeHtml(v.nombreCliente || "Para llevar");
        else if (esDom) titulo = "🛵 " + escapeHtml(v.nombreCliente || "Domicilio");
        else titulo = "🍽️ Mesa " + escapeHtml(v.mesa);
        const item = document.createElement("div");
        item.className = "venta-item";
        const fecha = v.horaPago ? horaTexto(v.horaPago) : (v.hora ? horaTexto(v.hora) : "");
        item.innerHTML = `<div><div class="venta-title">${titulo}</div><div class="venta-sub">${fecha} · ${escapeHtml(v.metodoPago || "Sin método")}</div></div><div class="venta-total">${formatCOP(v.total)}</div>`;
        el.ventasList.appendChild(item);
      });
    }
    const total = filtradas.reduce((sum, v) => sum + (v.total || 0), 0);
    el.ventasTotalHoy.textContent = formatCOP(total);
    el.ventasCountHoy.textContent = filtradas.length === 1 ? "1 venta" : filtradas.length + " ventas";
    const sumaPorMetodo = (...metodos) => filtradas.filter((v) => metodos.includes(v.metodoPago)).reduce((sum, v) => sum + (v.total || 0), 0);
    el.ventasEfectivo.textContent = formatCOP(sumaPorMetodo("Efectivo"));
    el.ventasNequi.textContent = formatCOP(sumaPorMetodo("Nequi"));
    el.ventasTransferencia.textContent = formatCOP(sumaPorMetodo("FIOS", "Transferencia"));
  }

  function renderVentasDaysPanel(ventas) {
    el.ventasDaysList.innerHTML = "";
    const hoyKey = dayKeyOf(new Date());
    const hoyVentas = ventas.filter((v) => {
      const fecha = v.horaPago ? fechaDeHora(v.horaPago) : (v.hora ? fechaDeHora(v.hora) : new Date());
      return dayKeyOf(fecha) === hoyKey;
    });
    const totalHoy = hoyVentas.reduce((s, v) => s + (v.total || 0), 0);
    const btn = document.createElement("button");
    btn.className = "ventas-day-btn active";
    btn.innerHTML = `<span>Hoy</span><span class="venta-day-sub">${formatCOP(totalHoy)}</span>`;
    el.ventasDaysList.appendChild(btn);

    const mesKey = hoyKey.slice(0, 7);
    const mesVentas = ventas.filter((v) => {
      const fecha = v.horaPago ? fechaDeHora(v.horaPago) : (v.hora ? fechaDeHora(v.hora) : new Date());
      return dayKeyOf(fecha).startsWith(mesKey);
    });
    const totalMes = mesVentas.reduce((s, v) => s + (v.total || 0), 0);
    const monthLabel = document.createElement("div");
    monthLabel.className = "ventas-month-label";
    monthLabel.textContent = "Este mes";
    el.ventasDaysList.appendChild(monthLabel);
    const monthBtn = document.createElement("button");
    monthBtn.className = "ventas-month-btn";
    monthBtn.innerHTML = `<span>Total</span><span>${formatCOP(totalMes)}</span>`;
    el.ventasDaysList.appendChild(monthBtn);
  }

  /* ---------------------------------------------------------
     TIPO DE PEDIDO Y SELECCIÓN DE MESA
  --------------------------------------------------------- */
  function renderSelectTableGrid() {
    el.selectTableGrid.innerHTML = "";
    for (let i = 1; i <= TABLE_COUNT; i++) {
      const btn = document.createElement("button");
      btn.className = "select-table-btn";
      btn.textContent = "Mesa " + i;
      btn.addEventListener("click", () => pickMesa(i));
      el.selectTableGrid.appendChild(btn);
    }
  }

  function openOrderTypeScreen() {
    openModal(el.screenOrderType);
  }

  function pickMesa(tableNum) {
    switchOrder(`mesa_${tableNum}`);
    closeModal(el.screenSelectTable);
    closeModal(el.screenOrderType);
  }

  /* ---------------------------------------------------------
     MODALES GENERALES
  --------------------------------------------------------- */
  function openModal(modalEl) { modalEl.classList.add("open"); }
  function closeModal(modalEl) { modalEl.classList.remove("open"); }

  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeModal(document.getElementById(btn.getAttribute("data-close")));
    });
  });

  [el.modalExceptions, el.modalPayment, el.modalDomicilio].forEach((overlay) => {
    overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(overlay); });
  });

  /* ---------------------------------------------------------
     TOAST
  --------------------------------------------------------- */
  let toastTimer = null;
  function showToast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove("show"), 2200);
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------------------------------------------------
     EVENTOS GLOBALES
  --------------------------------------------------------- */
  el.btnCharge.addEventListener("click", openPaymentModal);
  el.btnNewOrder.addEventListener("click", openOrderTypeScreen);
  el.btnSaveExceptions.addEventListener("click", saveExceptions);
  el.btnConfirmPay.addEventListener("click", confirmPayment);
  el.btnKitchen.addEventListener("click", sendToKitchen);
  el.btnOrderType.addEventListener("click", openOrderTypeScreen);
  
  el.btnPickMesa.addEventListener("click", () => {
    closeModal(el.screenOrderType);
    openModal(el.screenSelectTable);
  });
  
  el.btnPickDomicilio.addEventListener("click", abrirModalNuevoDomicilio);
  el.btnSaveDomicilio.addEventListener("click", saveDomicilio);

  el.btnEntregados.addEventListener("click", () => {
    openModal(el.screenEntregados);
  });

  el.btnVentas.addEventListener("click", async () => {
    let ventasSelection = { type: "day", key: dayKeyOf(new Date()) };
    const ventas = await cargarVentasDirectas();
    renderVentasDaysPanel(ventas);
    openModal(el.screenVentas);
  });

  if (el.btnRecargarVentas) {
    el.btnRecargarVentas.addEventListener("click", async () => {
      showToast("🔄 Actualizando ventas...");
      const ventas = await cargarVentasDirectas();
      renderVentasDaysPanel(ventas);
      showToast("✅ Ventas actualizadas");
    });
  }

  el.payMethods.querySelectorAll(".pay-method").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedPayMethod = btn.getAttribute("data-method");
      el.payMethods.querySelectorAll(".pay-method").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      el.btnConfirmPay.disabled = false;
    });
  });

  /* ---------------------------------------------------------
     INIT
  --------------------------------------------------------- */
  function init() {
    loadState();
    renderTables();
    renderCategories();
    renderProducts();
    renderOrder();
    renderSelectTableGrid();

    let intentos = 0;
    const maxIntentos = 20;
    function iniciarListeners() {
      if (window.PedidosCocina && typeof window.PedidosCocina.escucharVentasHoy === 'function') {
        if (window.PedidosCocina && typeof window.PedidosCocina.escucharEntregados === 'function') {
          window.PedidosCocina.escucharEntregados((pedidos) => {
            renderEntregados(pedidos);
          }, (err) => console.error("Error entregados:", err));
        }
      } else {
        intentos++;
        if (intentos < maxIntentos) {
          setTimeout(iniciarListeners, 500);
        }
      }
    }
    iniciarListeners();

    setTimeout(() => {
      if (window.firebaseApp) {
        cargarVentasDirectas();
      }
    }, 1000);
  }

  function renderEntregados(pedidos) {
    const ordenados = pedidos.slice().reverse();
    el.entregadosList.innerHTML = "";
    if (ordenados.length === 0) {
      el.entregadosList.innerHTML = '<div class="ventas-empty">Aún no hay pedidos entregados</div>';
    } else {
      ordenados.forEach((p) => {
        const esDom = p.tipoPedido === "domicilio";
        const esParaLlevar = p.tipoPedido === "paraLlevar";
        let titulo = "";
        if (esParaLlevar) titulo = "📦 " + escapeHtml(p.nombreCliente || "Para llevar");
        else if (esDom) titulo = "🛵 " + escapeHtml(p.nombreCliente || "Domicilio");
        else titulo = "🍽️ Mesa " + escapeHtml(p.mesa);
        const fecha = p.hora && typeof p.hora.toDate === "function"
          ? p.hora.toDate().toLocaleString("es-CO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
          : "";
        const pagoTexto = p.pagado ? " · " + escapeHtml(p.metodoPago || "Pagado") : " · Sin cobrar";
        const item = document.createElement("div");
        item.className = "venta-item";
        item.innerHTML = `<div><div class="venta-title">${titulo}</div><div class="venta-sub">${fecha}${pagoTexto}</div></div><div class="venta-total">${formatCOP(p.total)}</div>`;
        el.entregadosList.appendChild(item);
      });
    }
    el.entregadosCount.textContent = ordenados.length === 1 ? "1 pedido" : ordenados.length + " pedidos";
  }

  init();
})();
