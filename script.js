/* =========================================================
   EL PUNTO DEL MADURO — POS
   script.js (con carga directa de ventas)
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
  const STORAGE_KEY = "elPuntoDelMaduro_state_v1";

  /* ---------------------------------------------------------
     ESTADO
  --------------------------------------------------------- */
  let state = {
    currentTable: 1,
    currentCategory: "Maduros",
    tables: {},
    sentPedidos: {},
    orderMode: null,
    domicilioOrder: [],
    domicilioInfo: null,
  };

  for (let i = 1; i <= TABLE_COUNT; i++) {
    state.tables[i] = [];
    state.sentPedidos[i] = [];
  }
  state.sentPedidos.domicilio = [];
  state.sentPedidos.paraLlevar = [];

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
      if (!parsed || !parsed.tables) return;

      for (let i = 1; i <= TABLE_COUNT; i++) {
        state.tables[i] = Array.isArray(parsed.tables[i]) ? parsed.tables[i] : [];
        state.sentPedidos[i] = Array.isArray(parsed.sentPedidos && parsed.sentPedidos[i])
          ? parsed.sentPedidos[i]
          : [];
      }
      state.sentPedidos.domicilio = Array.isArray(parsed.sentPedidos && parsed.sentPedidos.domicilio)
        ? parsed.sentPedidos.domicilio
        : [];
      state.sentPedidos.paraLlevar = Array.isArray(parsed.sentPedidos && parsed.sentPedidos.paraLlevar)
        ? parsed.sentPedidos.paraLlevar
        : [];
      state.currentTable = parsed.currentTable && parsed.tables[parsed.currentTable] !== undefined
        ? parsed.currentTable
        : 1;
      state.currentCategory = CATEGORIES.includes(parsed.currentCategory)
        ? parsed.currentCategory
        : "Maduros";
      state.orderMode = parsed.orderMode === "mesa" || parsed.orderMode === "domicilio" || parsed.orderMode === "paraLlevar"
        ? parsed.orderMode
        : null;
      state.domicilioOrder = Array.isArray(parsed.domicilioOrder) ? parsed.domicilioOrder : [];
      state.domicilioInfo = parsed.domicilioInfo || null;
    } catch (e) {
      console.error("No se pudo cargar el estado", e);
    }
  }

  /* ---------------------------------------------------------
     HELPERS
  --------------------------------------------------------- */
  function formatCOP(n) {
    return "$" + Math.round(n).toLocaleString("es-CO");
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
    if (state.orderMode === "domicilio" || state.orderMode === "paraLlevar") {
      return state.domicilioOrder;
    } else {
      return state.tables[state.currentTable];
    }
  }

  function orderTotal(order) {
    let total = order.reduce((sum, it) => sum + it.price * it.qty, 0);
    if (state.orderMode === "domicilio" && state.domicilioInfo && state.domicilioInfo.direccion !== "Para llevar") {
      total += PRECIO_DOMICILIO;
    }
    const categoriasConRecargo = ["Maduros", "Tostones", "Bowls"];
    order.forEach((it) => {
      const productoOriginal = PRODUCTS.find(p => p.id === it.productId);
      if (productoOriginal && categoriasConRecargo.includes(productoOriginal.cat)) {
        total += (RECARGO_EMPACAR * it.qty);
      }
    });
    return total;
  }

  function orderItemCount(order) {
    return order.reduce((sum, it) => sum + it.qty, 0);
  }

  function mesaKeyCurrent() {
    if (state.orderMode === "domicilio") return "domicilio";
    if (state.orderMode === "paraLlevar") return "paraLlevar";
    return state.currentTable;
  }

  function sentTotal(key) {
    return (state.sentPedidos[key] || []).reduce((sum, p) => sum + p.total, 0);
  }

  function sentCount(key) {
    return (state.sentPedidos[key] || []).length;
  }

  function currentOwed() {
    return sentTotal(mesaKeyCurrent()) + orderTotal(currentOrder());
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
     FUNCIONES DE RENDER (resumidas para no alargar)
  --------------------------------------------------------- */
  function renderTables() {
    el.tablesBar.innerHTML = "";
    let mesasOcupadas = 0;
    for (let i = 1; i <= TABLE_COUNT; i++) {
      const owed = sentTotal(i) + orderTotal(state.tables[i]);
      if (owed > 0 || state.tables[i].length > 0) mesasOcupadas++;
    }
    for (let i = 1; i <= TABLE_COUNT; i++) {
      const owed = sentTotal(i) + orderTotal(state.tables[i]);
      const estaOcupada = owed > 0 || state.tables[i].length > 0;
      const btn = document.createElement("button");
      const isActive = (state.orderMode === "mesa" && state.currentTable === i);
      btn.className = "table-btn" + (isActive ? " active" : "") + (estaOcupada ? " has-order" : "");
      btn.innerHTML = `<span>Mesa ${i}</span><span class="table-sub">${estaOcupada ? formatCOP(owed) : (mesasOcupadas >= TABLE_COUNT ? "🚫 Ocupada" : "Libre")}</span>`;
      btn.addEventListener("click", () => selectTable(i));
      el.tablesBar.appendChild(btn);
    }
    // Domicilios y para llevar (simplificado)
    const btnParaLlevar = document.createElement("button");
    btnParaLlevar.className = "table-btn";
    btnParaLlevar.style.border = "2px dashed var(--green)";
    btnParaLlevar.innerHTML = `<span>📦 Para llevar</span><span class="table-sub">${mesasOcupadas >= TABLE_COUNT ? "🚫 Sin mesas" : "Nuevo"}</span>`;
    btnParaLlevar.addEventListener("click", iniciarPedidoParaLlevar);
    el.tablesBar.appendChild(btnParaLlevar);
  }

  function selectTable(tableNum) {
    if (state.orderMode === "domicilio" || state.orderMode === "paraLlevar") {
      if (state.domicilioOrder.length > 0 || sentTotal("domicilio") > 0 || sentTotal("paraLlevar") > 0) {
        if (!confirm("¿Cambiar a mesa y perder el pedido actual?")) return;
      }
      state.domicilioOrder = [];
      state.sentPedidos.domicilio = [];
      state.sentPedidos.paraLlevar = [];
      state.domicilioInfo = null;
    }
    state.orderMode = "mesa";
    state.currentTable = tableNum;
    saveState();
    renderTables();
    renderCategories();
    renderProducts();
    renderOrder();
    showToast("Mesa " + tableNum + " seleccionada");
  }

  function iniciarPedidoParaLlevar() {
    if (state.domicilioOrder.length > 0 || sentTotal("domicilio") > 0 || sentTotal("paraLlevar") > 0) {
      if (!confirm("¿Cerrar el pedido actual y empezar uno nuevo para llevar?")) return;
    }
    state.orderMode = "paraLlevar";
    state.domicilioInfo = { nombre: "Cliente", direccion: "Para llevar", telefono: "", observaciones: "" };
    state.domicilioOrder = [];
    state.sentPedidos.paraLlevar = [];
    saveState();
    renderTables();
    renderCategories();
    renderProducts();
    renderOrder();
    showToast("📦 Pedido para llevar creado");
    closeModal(el.screenSelectTable);
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
    const order = currentOrder();
    if (state.orderMode === "domicilio" && state.domicilioInfo && state.domicilioInfo.direccion !== "Para llevar") {
      el.orderTableTitle.innerHTML = "🛵 " + escapeHtml(state.domicilioInfo.nombre) + '<span class="order-client-sub">' + escapeHtml(state.domicilioInfo.direccion) + "</span>";
    } else if (state.orderMode === "paraLlevar" && state.domicilioInfo) {
      el.orderTableTitle.innerHTML = "📦 " + escapeHtml(state.domicilioInfo.nombre || "Para llevar") + '<span class="order-client-sub">Para llevar</span>';
    } else {
      el.orderTableTitle.textContent = "Mesa " + state.currentTable;
    }
    const count = orderItemCount(order);
    el.orderCount.textContent = count === 1 ? "1 producto" : count + " productos";
    const key = mesaKeyCurrent();
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
    const key = mesaKeyCurrent();
    const tableNum = state.currentTable;
    const wasDomicilio = state.orderMode === "domicilio";
    const wasParaLlevar = state.orderMode === "paraLlevar";
    const order = currentOrder();
    const metodo = selectedPayMethod;

    if (!window.PedidosCocina) {
      showToast("Firebase no está configurado. Revisa firebase.js");
      return;
    }

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
          tipoPedido: wasParaLlevar ? "paraLlevar" : (wasDomicilio ? "domicilio" : "mesa"),
          mesa: (wasDomicilio || wasParaLlevar) ? null : tableNum,
          nombreCliente: (wasDomicilio || wasParaLlevar) ? state.domicilioInfo.nombre : null,
          direccion: (wasDomicilio || wasParaLlevar) ? state.domicilioInfo.direccion : null,
          telefono: (wasDomicilio || wasParaLlevar) ? state.domicilioInfo.telefono : null,
          productos: productos,
          observaciones: (wasDomicilio || wasParaLlevar) ? (state.domicilioInfo.observaciones || "") : "",
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
      state.sentPedidos[key] = [];
      clearCurrentOrder();
      if (wasDomicilio || wasParaLlevar) {
        state.domicilioInfo = null;
        state.orderMode = null;
      }
      saveState();
      closeModal(el.modalPayment);
      renderTables();
      renderProducts();
      renderOrder();
      let mensaje = "Pago registrado (" + metodo + ") · ";
      if (wasParaLlevar) mensaje += "Pedido para llevar entregado";
      else if (wasDomicilio) mensaje += "Domicilio entregado";
      else mensaje += "Mesa " + tableNum + " liberada";
      showToast(mensaje);
      if (wasDomicilio || wasParaLlevar) openOrderTypeScreen();
      // Forzar recarga de ventas después de cobrar
      setTimeout(() => cargarVentasDirectas(), 500);
    } catch (err) {
      console.error("❌ Error al registrar el pago:", err);
      showToast("No se pudo registrar el pago. Revisa la consola (F12) para más detalles.");
    } finally {
      el.btnConfirmPay.disabled = false;
    }
  }

  function clearCurrentOrder() {
    if (state.orderMode === "domicilio" || state.orderMode === "paraLlevar") {
      state.domicilioOrder = [];
    } else {
      state.tables[state.currentTable] = [];
    }
  }

  /* ---------------------------------------------------------
     ENVIAR A COCINA
  --------------------------------------------------------- */
  function sendToKitchen() {
    if (!state.orderMode) { showToast("Selecciona el tipo de pedido primero"); openOrderTypeScreen(); return; }
    const order = currentOrder();
    if (order.length === 0) { showToast("Agrega productos antes de enviar a cocina"); return; }
    if (!window.PedidosCocina || typeof window.PedidosCocina.enviarPedido !== "function") {
      showToast("Firebase no está configurado. Revisa firebase.js");
      return;
    }
    const productos = order.map((it) => ({
      nombre: it.name,
      cantidad: it.qty,
      precio: it.price,
      excepciones: it.exceptions || [],
    }));
    const pedido = {
      tipoPedido: state.orderMode === "paraLlevar" ? "paraLlevar" : state.orderMode,
      mesa: (state.orderMode === "mesa") ? state.currentTable : null,
      nombreCliente: (state.orderMode === "domicilio" || state.orderMode === "paraLlevar") ? state.domicilioInfo.nombre : null,
      direccion: (state.orderMode === "domicilio" || state.orderMode === "paraLlevar") ? state.domicilioInfo.direccion : null,
      telefono: (state.orderMode === "domicilio" || state.orderMode === "paraLlevar") ? state.domicilioInfo.telefono : null,
      productos: productos,
      observaciones: (state.orderMode === "domicilio" || state.orderMode === "paraLlevar") ? (state.domicilioInfo.observaciones || "") : "",
      total: orderTotal(order),
      estado: "pendiente",
    };
    el.btnKitchen.disabled = true;
    const key = mesaKeyCurrent();
    window.PedidosCocina.enviarPedido(pedido)
      .then((ref) => {
        state.sentPedidos[key] = state.sentPedidos[key] || [];
        state.sentPedidos[key].push({ id: ref.id, total: pedido.total });
        clearCurrentOrder();
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
  let ventasDaysCollapsed = false;

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
      // Ordenar por fecha de pago (más reciente primero)
      ventas.sort((a, b) => {
        const ta = a.horaPago && typeof a.horaPago.toMillis === "function" ? a.horaPago.toMillis() : 0;
        const tb = b.horaPago && typeof b.horaPago.toMillis === "function" ? b.horaPago.toMillis() : 0;
        return tb - ta;
      });
      console.log("📊 Ventas cargadas directamente:", ventas.length);
      renderVentas(ventas);
      // También actualizar el panel de días
      renderVentasDaysPanel(ventas);
      return ventas;
    } catch (error) {
      console.error("❌ Error cargando ventas:", error);
      el.ventasList.innerHTML = `<div class="ventas-empty">⚠ Error al cargar ventas: ${error.message}</div>`;
      return [];
    }
  }

  function renderVentas(ventas) {
    const filtradas = ventas.slice(0, 50); // mostrar las últimas 50
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
    // Panel de días simplificado (solo muestra el día de hoy y el total)
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
    // Mostrar resumen del mes actual
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
     TIPO DE PEDIDO
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
    const isFirstBoot = !state.orderMode;
    el.screenOrderType.classList.toggle("no-close", isFirstBoot);
    openModal(el.screenOrderType);
  }

  function pickMesa(tableNum) {
    state.orderMode = "mesa";
    state.currentTable = tableNum;
    saveState();
    closeModal(el.screenSelectTable);
    closeModal(el.screenOrderType);
    renderTables();
    renderCategories();
    renderProducts();
    renderOrder();
  }

  function pickDomicilio() {
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
    state.orderMode = "domicilio";
    state.domicilioInfo = { nombre, direccion, telefono, observaciones: el.domObservaciones.value.trim() };
    if (!Array.isArray(state.domicilioOrder)) state.domicilioOrder = [];
    state.sentPedidos.domicilio = [];
    saveState();
    closeModal(el.modalDomicilio);
    renderTables();
    renderCategories();
    renderProducts();
    renderOrder();
    showToast("Pedido a domicilio para " + nombre);
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

  /* ---------------------------------------------------------
     UTIL
  --------------------------------------------------------- */
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------------------------------------------------
     EVENTOS GLOBALES
  --------------------------------------------------------- */
  el.btnCharge.addEventListener("click", openPaymentModal);
  el.btnNewOrder.addEventListener("click", function() {
    if (!state.orderMode) { openOrderTypeScreen(); return; }
    if (state.orderMode === "domicilio" || state.orderMode === "paraLlevar") {
      if (state.domicilioOrder.length > 0 || sentTotal("domicilio") > 0 || sentTotal("paraLlevar") > 0) {
        if (confirm("¿Cerrar el pedido actual y empezar uno nuevo?")) {
          state.domicilioOrder = [];
          state.sentPedidos.domicilio = [];
          state.sentPedidos.paraLlevar = [];
          state.domicilioInfo = null;
          state.orderMode = null;
          saveState();
          renderTables();
          renderProducts();
          renderOrder();
          openOrderTypeScreen();
        }
      } else { openOrderTypeScreen(); }
      return;
    }
    let mesasDisponibles = 0;
    for (let i = 1; i <= TABLE_COUNT; i++) {
      const owed = sentTotal(i) + orderTotal(state.tables[i]);
      if (owed === 0 && state.tables[i].length === 0) mesasDisponibles++;
    }
    if (mesasDisponibles === 0) {
      if (confirm("⚠️ Todas las mesas están ocupadas. ¿Quieres crear un pedido para llevar?")) {
        iniciarPedidoParaLlevar();
      }
      return;
    }
    if (state.tables[state.currentTable].length > 0 || sentTotal(state.currentTable) > 0) {
      if (!confirm("¿Reiniciar el pedido de la mesa " + state.currentTable + "?")) return;
    }
    clearCurrentOrder();
    state.sentPedidos[state.currentTable] = [];
    saveState();
    renderTables();
    renderProducts();
    renderOrder();
    showToast("Mesa " + state.currentTable + " reiniciada");
  });

  el.btnSaveExceptions.addEventListener("click", saveExceptions);
  el.btnConfirmPay.addEventListener("click", confirmPayment);
  el.btnKitchen.addEventListener("click", sendToKitchen);
  el.btnOrderType.addEventListener("click", openOrderTypeScreen);
  el.btnPickMesa.addEventListener("click", () => {
    closeModal(el.screenOrderType);
    openModal(el.screenSelectTable);
  });
  el.btnPickDomicilio.addEventListener("click", pickDomicilio);
  el.btnSaveDomicilio.addEventListener("click", saveDomicilio);
  el.btnEntregados.addEventListener("click", () => {
    // Al abrir entregados, cargarlos (usando el listener o directamente)
    if (window.PedidosCocina && typeof window.PedidosCocina.escucharEntregados === 'function') {
      // Usar listener
    } else {
      // Fallback: cargar entregados con getDocs
    }
    openModal(el.screenEntregados);
  });

  // Botón de ventas: AL ABRIR, CARGA DIRECTA
  el.btnVentas.addEventListener("click", async () => {
    // Limpiar la pantalla antes de abrir
// ✅ Ahora (corregido):
let ventasSelection = { type: "day", key: dayKeyOf(new Date()) };
    // Cargar datos directamente
    const ventas = await cargarVentasDirectas();
    renderVentasDaysPanel(ventas);
    openModal(el.screenVentas);
  });

  // Botón de recarga manual dentro de la pantalla de ventas
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

    // Iniciar listeners solo si Firebase está disponible (pero ya no dependemos de ellos para ventas)
    let intentos = 0;
    const maxIntentos = 20;
    function iniciarListeners() {
      if (window.PedidosCocina && typeof window.PedidosCocina.escucharVentasHoy === 'function') {
        console.log("✅ Firebase listo, iniciando listeners (opcionales)");
        // Escuchar entregados (solo para historial)
        if (window.PedidosCocina && typeof window.PedidosCocina.escucharEntregados === 'function') {
          window.PedidosCocina.escucharEntregados((pedidos) => {
            // Renderizar entregados en su pantalla
            renderEntregados(pedidos);
          }, (err) => console.error("Error entregados:", err));
        }
        if (!state.orderMode || (state.orderMode === "domicilio" && !state.domicilioInfo)) {
          state.orderMode = null;
          openOrderTypeScreen();
        }
      } else {
        intentos++;
        if (intentos < maxIntentos) {
          console.log(`⏳ Esperando Firebase... (intento ${intentos})`);
          setTimeout(iniciarListeners, 500);
        } else {
          console.error("❌ Firebase no disponible.");
          showToast("Error: Firebase no cargó. Recarga.");
        }
      }
    }
    iniciarListeners();

    // Cargar ventas al iniciar (para que el panel de días tenga datos)
    setTimeout(() => {
      if (window.firebaseApp) {
        cargarVentasDirectas();
      }
    }, 1000);
  }

  // Renderizar entregados (simplificado)
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
