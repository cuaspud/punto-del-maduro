/* =========================================================
   EL PUNTO DEL MADURO — POS
   script.js
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
    { id: "ob6", cat: "Otras Bebidas", name: "Café Negro", price: 3000 },
    { id: "ob14", cat: "Otras Bebidas", name: "Café con Leche", price: 4000 },
  ];

  const TABLE_COUNT = 5;
  const STORAGE_KEY = "elPuntoDelMaduro_state_v1";

  /* ---------------------------------------------------------
     ESTADO
  --------------------------------------------------------- */
  let state = {
    currentTable: 1,
    currentCategory: "Maduros",
    tables: {}, // { 1: [ {productId, name, price, qty, exceptions:[]} ] } — carrito SIN enviar aún
    // NUEVO: pedidos ya enviados a cocina pero AÚN NO cobrados, por mesa (o "domicilio").
    // { 1: [ {id, total} ], domicilio: [ {id, total} ] }
    // Esto es lo que permite que la cuenta de una mesa NO se pierda
    // al enviar a cocina: se sigue sumando hasta que se dé "Cobrar".
    sentPedidos: {},
    orderMode: null, // "mesa" | "domicilio" — tipo del pedido actual
    domicilioOrder: [], // items del pedido cuando orderMode === "domicilio"
    domicilioInfo: null, // { nombre, direccion, telefono, observaciones }
  };

  for (let i = 1; i <= TABLE_COUNT; i++) {
    state.tables[i] = [];
    state.sentPedidos[i] = [];
  }
  state.sentPedidos.domicilio = [];

  let excEditingItemId = null; // referencia al item que se está editando en el modal
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
      state.currentTable = parsed.currentTable && parsed.tables[parsed.currentTable] !== undefined
        ? parsed.currentTable
        : 1;
      state.currentCategory = CATEGORIES.includes(parsed.currentCategory)
        ? parsed.currentCategory
        : "Maduros";

      state.orderMode = parsed.orderMode === "mesa" || parsed.orderMode === "domicilio"
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

  function uid() {
    return "it_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
  }

  function currentOrder() {
    return state.orderMode === "domicilio" ? state.domicilioOrder : state.tables[state.currentTable];
  }

  function orderTotal(order) {
    return order.reduce((sum, it) => sum + it.price * it.qty, 0);
  }

  function orderItemCount(order) {
    return order.reduce((sum, it) => sum + it.qty, 0);
  }

  /* ---------------------------------------------------------
     NUEVO: LO QUE SE DEBE COBRAR
     Una mesa/domicilio puede tener pedidos ya enviados a
     cocina (sentPedidos) más productos que aún no se han
     enviado (el carrito). Lo que se cobra es la suma de
     ambos, y NO se pierde hasta que el mesero da "Cobrar".
  --------------------------------------------------------- */
  function mesaKeyCurrent() {
    return state.orderMode === "domicilio" ? "domicilio" : state.currentTable;
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

    // NUEVO: tipo de pedido (mesa / domicilio)
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

    // NUEVO: ventas del día
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

    // NUEVO: panel plegable de días/meses
    ventasDaysPanel: document.getElementById("ventasDaysPanel"),
    ventasDaysList: document.getElementById("ventasDaysList"),
    btnToggleVentasDays: document.getElementById("btnToggleVentasDays"),

    // NUEVO: historial completo de pedidos entregados
    btnEntregados: document.getElementById("btnEntregados"),
    screenEntregados: document.getElementById("screenEntregados"),
    entregadosList: document.getElementById("entregadosList"),
    entregadosCount: document.getElementById("entregadosCount"),
  };

  /* ---------------------------------------------------------
     RENDER: MESAS
  --------------------------------------------------------- */
  function renderTables() {
    el.tablesBar.style.display = state.orderMode === "domicilio" ? "none" : "";
    el.tablesBar.innerHTML = "";
    for (let i = 1; i <= TABLE_COUNT; i++) {
      const owed = sentTotal(i) + orderTotal(state.tables[i]);
      const btn = document.createElement("button");
      btn.className = "table-btn" + (i === state.currentTable ? " active" : "") +
        (owed > 0 ? " has-order" : "");
      btn.innerHTML =
        `<span>Mesa ${i}</span>` +
        `<span class="table-sub">${owed > 0 ? formatCOP(owed) : "Libre"}</span>`;
      btn.addEventListener("click", () => selectTable(i));
      el.tablesBar.appendChild(btn);
    }
  }

  function selectTable(tableNum) {
    state.currentTable = tableNum;
    saveState();
    renderTables();
    renderProducts();
    renderOrder();
  }

  /* ---------------------------------------------------------
     NUEVO: TIPO DE PEDIDO (Mesa / Domicilio)
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
    state.domicilioInfo = {
      nombre,
      direccion,
      telefono,
      observaciones: el.domObservaciones.value.trim(),
    };
    if (!Array.isArray(state.domicilioOrder)) state.domicilioOrder = [];

    saveState();
    closeModal(el.modalDomicilio);
    renderTables();
    renderCategories();
    renderProducts();
    renderOrder();
    showToast("Pedido a domicilio para " + nombre);
  }

  /* ---------------------------------------------------------
     RENDER: CATEGORÍAS
  --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     RENDER: PRODUCTOS
  --------------------------------------------------------- */
  function renderProducts() {
    el.productsGrid.innerHTML = "";
    const order = currentOrder();

    PRODUCTS.filter((p) => p.cat === state.currentCategory).forEach((p) => {
      const orderItem = order.find((it) => it.productId === p.id && (!it.exceptions || it.exceptions.length === 0));
      const totalQtyOfProduct = order
        .filter((it) => it.productId === p.id)
        .reduce((s, it) => s + it.qty, 0);

      const card = document.createElement("button");
      card.className = "product-card" + (totalQtyOfProduct > 0 ? " in-order" : "");
      card.innerHTML =
        `<div class="p-name">${escapeHtml(p.name)}</div>` +
        `<div class="p-bottom">` +
        `<span class="p-price">${formatCOP(p.price)}</span>` +
        `<span class="p-qty-badge">${totalQtyOfProduct > 0 ? totalQtyOfProduct : ""}</span>` +
        `</div>`;
      card.addEventListener("click", () => addProductToOrder(p));
      el.productsGrid.appendChild(card);
    });
  }

  function addProductToOrder(product) {
    const order = currentOrder();
    // Se agrupa por producto SIN excepciones. Si ya existe una línea limpia, se incrementa.
    let item = order.find((it) => it.productId === product.id && (!it.exceptions || it.exceptions.length === 0));
    if (item) {
      item.qty += 1;
    } else {
      order.push({
        id: uid(),
        productId: product.id,
        name: product.name,
        price: product.price,
        qty: 1,
        exceptions: [],
      });
    }
    saveState();
    renderTables();
    renderProducts();
    renderOrder();
  }

  /* ---------------------------------------------------------
     RENDER: PEDIDO
  --------------------------------------------------------- */
  function renderOrder() {
    const order = currentOrder();

    if (state.orderMode === "domicilio" && state.domicilioInfo) {
      el.orderTableTitle.innerHTML =
        "🛵 " + escapeHtml(state.domicilioInfo.nombre) +
        '<span class="order-client-sub">' + escapeHtml(state.domicilioInfo.direccion) + "</span>";
    } else {
      el.orderTableTitle.textContent = "Mesa " + state.currentTable;
    }

    const count = orderItemCount(order);
    el.orderCount.textContent = count === 1 ? "1 producto" : count + " productos";

    // NUEVO: aviso de lo que ya se envió a cocina y sigue pendiente de cobro
    const key = mesaKeyCurrent();
    const enviado = sentTotal(key);
    const nEnviados = sentCount(key);
    if (enviado > 0) {
      el.orderSentBanner.textContent =
        `🔥 Ya en cocina: ${formatCOP(enviado)} (${nEnviados === 1 ? "1 pedido" : nEnviados + " pedidos"})`;
      el.orderSentBanner.classList.add("show");
    } else {
      el.orderSentBanner.classList.remove("show");
    }

    // limpiar lista manteniendo el nodo "vacío"
    Array.from(el.orderList.children).forEach((child) => {
      if (child.id !== "orderEmpty") child.remove();
    });

    if (order.length === 0) {
      el.orderEmpty.style.display = "flex";
    } else {
      el.orderEmpty.style.display = "none";
      order.forEach((item) => {
        el.orderList.appendChild(buildOrderItemNode(item));
      });
    }

    // El total a cobrar incluye lo ya enviado a cocina + lo que
    // todavía está en el carrito sin enviar.
    const owed = currentOwed();
    el.orderTotal.textContent = formatCOP(owed);
    el.btnCharge.disabled = owed <= 0;
  }

  function buildOrderItemNode(item) {
    const subtotal = item.price * item.qty;

    const wrap = document.createElement("div");
    wrap.className = "order-item";

    const excHtml = (item.exceptions && item.exceptions.length > 0)
      ? `<ul class="order-item-exceptions">${item.exceptions.map((e) => `<li>${escapeHtml(e)}</li>`).join("")}</ul>`
      : "";

    wrap.innerHTML =
      `<div class="order-item-top">
         <div class="order-item-name"><span class="qty-x">x${item.qty}</span> ${escapeHtml(item.name)}</div>
         <div class="order-item-subtotal">${formatCOP(subtotal)}</div>
       </div>
       ${excHtml}
       <div class="order-item-controls">
         <div class="qty-control">
           <button class="qty-btn" data-action="dec">−</button>
           <span class="qty-value">${item.qty}</span>
           <button class="qty-btn" data-action="inc">+</button>
         </div>
         <button class="btn-edit-note" data-action="note" title="Excepciones">✎</button>
         <button class="btn-remove-item" data-action="remove" title="Eliminar">🗑</button>
       </div>`;

    wrap.querySelector('[data-action="inc"]').addEventListener("click", (e) => {
      e.stopPropagation();
      changeQty(item.id, 1);
    });
    wrap.querySelector('[data-action="dec"]').addEventListener("click", (e) => {
      e.stopPropagation();
      changeQty(item.id, -1);
    });
    wrap.querySelector('[data-action="remove"]').addEventListener("click", (e) => {
      e.stopPropagation();
      removeItem(item.id);
    });
    wrap.querySelector('[data-action="note"]').addEventListener("click", (e) => {
      e.stopPropagation();
      openExceptionsModal(item.id);
    });

    // Tocar el item (fuera de los controles) también abre excepciones
    wrap.addEventListener("click", () => openExceptionsModal(item.id));

    return wrap;
  }

  function changeQty(itemId, delta) {
    const order = currentOrder();
    const item = order.find((it) => it.id === itemId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      removeItem(itemId);
      return;
    }
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
     MODAL: EXCEPCIONES
  --------------------------------------------------------- */
  function openExceptionsModal(itemId) {
    const order = currentOrder();
    const item = order.find((it) => it.id === itemId);
    if (!item) return;

    excEditingItemId = itemId;
    el.excModalTitle.textContent = item.name;

    const checkboxes = el.excOptions.querySelectorAll('input[type="checkbox"]');
    let freeNote = "";

    const fixedOptions = ["Sin queso", "Sin maicitos", "Sin bocadillo", "Empacar"];
    checkboxes.forEach((cb) => {
      cb.checked = item.exceptions.includes(cb.value);
    });

    // cualquier excepción que no esté en las fijas se considera nota libre
    const extra = item.exceptions.filter((e) => !fixedOptions.includes(e));
    freeNote = extra.join(", ");
    el.excNote.value = freeNote;

    openModal(el.modalExceptions);
  }

  function saveExceptions() {
    if (!excEditingItemId) return;
    const order = currentOrder();
    const item = order.find((it) => it.id === excEditingItemId);
    if (!item) return;

    const checkboxes = el.excOptions.querySelectorAll('input[type="checkbox"]');
    const chosen = [];
    checkboxes.forEach((cb) => {
      if (cb.checked) chosen.push(cb.value);
    });

    const note = el.excNote.value.trim();
    if (note) chosen.push(note);

    item.exceptions = chosen;

    saveState();
    closeModal(el.modalExceptions);
    renderProducts();
    renderOrder();
    showToast("Excepciones guardadas");
  }

  /* ---------------------------------------------------------
     MODAL: COBRAR
  --------------------------------------------------------- */
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
     NUEVO: COBRAR
     1) Si quedaron productos en el carrito sin enviar a
        cocina (ej. una bebida rápida), se registran igual
        como una venta entregada.
     2) Se marcan como pagados TODOS los pedidos que ya se
        habían enviado a cocina para esta mesa/domicilio.
     Nada se borra: todo queda en Firestore para el reporte
     de "Ventas del día" y para el total de ENTREGADOS en
     cocina.
  --------------------------------------------------------- */
  async function confirmPayment() {
    if (!selectedPayMethod) return;
    const key = mesaKeyCurrent();
    const tableNum = state.currentTable;
    const wasDomicilio = state.orderMode === "domicilio";
    const order = currentOrder();
    const metodo = selectedPayMethod;

    if (!window.PedidosCocina) {
      showToast("Firebase no está configurado. Revisa firebase.js");
      return;
    }

    el.btnConfirmPay.disabled = true;

    try {
      // 1) Productos sueltos que no se enviaron a cocina
      if (order.length > 0) {
        const productos = order.map((it) => ({
          nombre: it.name,
          cantidad: it.qty,
          precio: it.price,
          excepciones: it.exceptions || [],
        }));
        const pedidoExtra = {
          tipoPedido: state.orderMode,
          mesa: wasDomicilio ? null : tableNum,
          nombreCliente: wasDomicilio ? state.domicilioInfo.nombre : null,
          direccion: wasDomicilio ? state.domicilioInfo.direccion : null,
          telefono: wasDomicilio ? state.domicilioInfo.telefono : null,
          productos: productos,
          observaciones: wasDomicilio ? (state.domicilioInfo.observaciones || "") : "",
          total: orderTotal(order),
          estado: "entregado",
        };
          // Enviamos el pedido extra y obtenemos su referencia
   const ref = await window.PedidosCocina.enviarPedido(pedidoExtra);
   // ¡CORRECCIÓN! Marcamos este pedido como pagado INMEDIATAMENTE al crearlo
   await window.PedidosCocina.cobrarPedidos([ref.id], metodo);
        state.sentPedidos[key] = state.sentPedidos[key] || [];
        state.sentPedidos[key].push({ id: ref.id, total: pedidoExtra.total });
      }

      // 2) Marcar como pagados todos los pedidos de esta cuenta
      const idsPorCobrar = (state.sentPedidos[key] || []).map((p) => p.id);
      if (idsPorCobrar.length > 0) {
        await window.PedidosCocina.cobrarPedidos(idsPorCobrar, metodo);
      }

      state.sentPedidos[key] = [];
      clearCurrentOrder();
      if (wasDomicilio) {
        state.domicilioInfo = null;
        state.orderMode = null;
      }
      saveState();

      closeModal(el.modalPayment);
      renderTables();
      renderProducts();
      renderOrder();
      showToast(
        wasDomicilio
          ? "Pago registrado (" + metodo + ") · Domicilio entregado"
          : "Pago registrado (" + metodo + ") · Mesa " + tableNum + " liberada"
      );
      if (wasDomicilio) openOrderTypeScreen();
    } catch (err) {
      console.error("Error al registrar el pago", err);
      showToast("No se pudo registrar el pago. Revisa tu conexión e intenta de nuevo.");
    } finally {
      el.btnConfirmPay.disabled = false;
    }
  }

  /* ---------------------------------------------------------
     NUEVO: ENVIAR A COCINA (Firebase)
  --------------------------------------------------------- */
  function sendToKitchen() {
    if (!state.orderMode) {
      showToast("Selecciona el tipo de pedido primero");
      openOrderTypeScreen();
      return;
    }

    const order = currentOrder();
    if (order.length === 0) {
      showToast("Agrega productos antes de enviar a cocina");
      return;
    }

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
      tipoPedido: state.orderMode,
      mesa: state.orderMode === "mesa" ? state.currentTable : null,
      nombreCliente: state.orderMode === "domicilio" ? state.domicilioInfo.nombre : null,
      direccion: state.orderMode === "domicilio" ? state.domicilioInfo.direccion : null,
      telefono: state.orderMode === "domicilio" ? state.domicilioInfo.telefono : null,
      productos: productos,
      observaciones: state.orderMode === "domicilio" ? (state.domicilioInfo.observaciones || "") : "",
      total: orderTotal(order),
      estado: "pendiente",
    };

    el.btnKitchen.disabled = true;
    const key = mesaKeyCurrent();

    window.PedidosCocina.enviarPedido(pedido)
      .then((ref) => {
        // NUEVO: el pedido NO se pierde ni se borra de la cuenta.
        // Se guarda su id/total para poder cobrarlo después, y solo
        // se vacía el carrito (para poder seguir agregando o cobrar).
        state.sentPedidos[key] = state.sentPedidos[key] || [];
        state.sentPedidos[key].push({ id: ref.id, total: pedido.total });

        clearCurrentOrder();
        saveState();
        renderTables();
        renderProducts();
        renderOrder();
        showToast("Pedido enviado a cocina 🚀 · Ya está en la cuenta para cobrar");
      })
      .catch((err) => {
        console.error("Error al enviar pedido a cocina", err);
        showToast("No se pudo enviar el pedido. Revisa tu conexión.");
      })
      .finally(() => {
        el.btnKitchen.disabled = false;
      });
  }

  /* ---------------------------------------------------------
     NUEVO: VENTAS DEL DÍA (+ selector de días/meses)
     Lee en tiempo real TODOS los pedidos ya cobrados
     (pagado == true) y permite ver el total de hoy, de un día
     anterior específico, o de un mes completo, usando el panel
     plegable de la izquierda.
  --------------------------------------------------------- */
  const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const DIAS_SEMANA = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

  function pad2(n) { return String(n).padStart(2, "0"); }

  function fechaDeHora(hora) {
    if (!hora || typeof hora.toDate !== "function") return new Date();
    return hora.toDate();
  }

  function dayKeyOf(date) {
    return date.getFullYear() + "-" + pad2(date.getMonth() + 1) + "-" + pad2(date.getDate());
  }

  function monthKeyOf(date) {
    return date.getFullYear() + "-" + pad2(date.getMonth() + 1);
  }

  function esHoy(hora) {
    if (!hora || typeof hora.toDate !== "function") return true;
    return dayKeyOf(hora.toDate()) === dayKeyOf(new Date());
  }

  function horaTexto(hora) {
    if (!hora || typeof hora.toDate !== "function") return "--:--";
    return hora.toDate().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  }

  // Selección activa del panel: { type: "day", key: "YYYY-MM-DD" } o { type: "month", key: "YYYY-MM" }
  let ventasSelection = { type: "day", key: dayKeyOf(new Date()) };
  let ventasDaysCollapsed = false;

  // NUEVO: guarda la última lista completa (sin filtrar por día) que
  // llegó de Firestore, para poder recalcular cualquier corte
  // (hoy, un día anterior o un mes) sin volver a consultar Firestore.
  let lastVentasRaw = [];

  function renderVentasDaysPanel() {
    // Junta todos los días con ventas + el día de hoy (aunque esté en $0)
    const dayMap = new Map(); // dayKey -> { date, total, count }
    const hoyKey = dayKeyOf(new Date());
    dayMap.set(hoyKey, { date: new Date(), total: 0, count: 0 });

    lastVentasRaw.forEach((v) => {
      const d = fechaDeHora(v.horaPago);
      const key = dayKeyOf(d);
      if (!dayMap.has(key)) dayMap.set(key, { date: d, total: 0, count: 0 });
      const entry = dayMap.get(key);
      entry.total += v.total || 0;
      entry.count += 1;
    });

    // Agrupa por mes y ordena de más reciente a más antiguo
    const porMes = new Map(); // monthKey -> { label, days: [...] }
    Array.from(dayMap.values())
      .sort((a, b) => b.date - a.date)
      .forEach((entry) => {
        const mKey = monthKeyOf(entry.date);
        if (!porMes.has(mKey)) {
          porMes.set(mKey, {
            label: MESES[entry.date.getMonth()] + " " + entry.date.getFullYear(),
            days: [],
            total: 0,
          });
        }
        const grupo = porMes.get(mKey);
        grupo.days.push(entry);
        grupo.total += entry.total;
      });

    el.ventasDaysList.innerHTML = "";
    Array.from(porMes.entries()).forEach(([mKey, grupo]) => {
      const monthLabel = document.createElement("div");
      monthLabel.className = "ventas-month-label";
      monthLabel.textContent = grupo.label;
      el.ventasDaysList.appendChild(monthLabel);

      const monthBtn = document.createElement("button");
      monthBtn.className = "ventas-month-btn" +
        (ventasSelection.type === "month" && ventasSelection.key === mKey ? " active" : "");
      monthBtn.innerHTML = `<span>Todo el mes</span><span>${formatCOP(grupo.total)}</span>`;
      monthBtn.addEventListener("click", () => {
        ventasSelection = { type: "month", key: mKey };
        renderVentasDaysPanel();
        renderVentas(lastVentasRaw);
      });
      el.ventasDaysList.appendChild(monthBtn);

      grupo.days.forEach((entry) => {
        const key = dayKeyOf(entry.date);
        const btn = document.createElement("button");
        btn.className = "ventas-day-btn" +
          (ventasSelection.type === "day" && ventasSelection.key === key ? " active" : "");
        const etiqueta = key === hoyKey ? "Hoy" : DIAS_SEMANA[entry.date.getDay()] + " " + pad2(entry.date.getDate());
        btn.innerHTML = `<span>${etiqueta}</span><span class="venta-day-sub">${formatCOP(entry.total)}</span>`;
        btn.addEventListener("click", () => {
          ventasSelection = { type: "day", key };
          renderVentasDaysPanel();
          renderVentas(lastVentasRaw);
        });
        el.ventasDaysList.appendChild(btn);
      });
    });
  }

  function renderVentas(ventas) {
    let filtradas;
    let tituloTexto;
    let totalLabelTexto;

    if (ventasSelection.type === "month") {
      filtradas = ventas.filter((v) => monthKeyOf(fechaDeHora(v.horaPago)) === ventasSelection.key);
      const [y, m] = ventasSelection.key.split("-");
      tituloTexto = "📊 Ventas de " + MESES[parseInt(m, 10) - 1] + " " + y;
      totalLabelTexto = "Total vendido en el mes";
    } else {
      filtradas = ventas.filter((v) => dayKeyOf(fechaDeHora(v.horaPago)) === ventasSelection.key);
      const esHoySeleccionado = ventasSelection.key === dayKeyOf(new Date());
      const [y, m, d] = ventasSelection.key.split("-");
      tituloTexto = esHoySeleccionado ? "📊 Ventas de hoy" : "📊 Ventas del " + d + "/" + m + "/" + y;
      totalLabelTexto = esHoySeleccionado ? "Total vendido hoy" : "Total vendido ese día";
    }

    if (el.ventasScreenTitle) el.ventasScreenTitle.textContent = tituloTexto;
    if (el.ventasTotalLabel) el.ventasTotalLabel.textContent = totalLabelTexto;

    el.ventasList.innerHTML = "";
    if (filtradas.length === 0) {
      const empty = document.createElement("div");
      empty.className = "ventas-empty";
      empty.id = "ventasEmpty";
      empty.textContent = "No hay ventas registradas en esta fecha";
      el.ventasList.appendChild(empty);
    } else {
      filtradas.forEach((v) => {
        const esDom = v.tipoPedido === "domicilio";
        const titulo = esDom ? ("🛵 " + escapeHtml(v.nombreCliente || "Domicilio")) : ("🍽️ Mesa " + escapeHtml(v.mesa));
        const item = document.createElement("div");
        item.className = "venta-item";
        item.innerHTML =
          `<div>
             <div class="venta-title">${titulo}</div>
             <div class="venta-sub">${horaTexto(v.horaPago)} · ${escapeHtml(v.metodoPago || "")}</div>
           </div>
           <div class="venta-total">${formatCOP(v.total)}</div>`;
        el.ventasList.appendChild(item);
      });
    }

    const totalFiltrado = filtradas.reduce((sum, v) => sum + (v.total || 0), 0);
    el.ventasTotalHoy.textContent = formatCOP(totalFiltrado);
    el.ventasCountHoy.textContent = filtradas.length === 1 ? "1 venta" : filtradas.length + " ventas";

    // Total separado por método de pago. "FIOS" agrupa también las
    // ventas antiguas guardadas como "Transferencia" (mismo método,
    // solo cambió el nombre).
    const sumaPorMetodo = (...metodos) =>
      filtradas.filter((v) => metodos.includes(v.metodoPago)).reduce((sum, v) => sum + (v.total || 0), 0);
    if (el.ventasEfectivo) el.ventasEfectivo.textContent = formatCOP(sumaPorMetodo("Efectivo"));
    if (el.ventasNequi) el.ventasNequi.textContent = formatCOP(sumaPorMetodo("Nequi"));
    if (el.ventasTransferencia) el.ventasTransferencia.textContent = formatCOP(sumaPorMetodo("FIOS", "Transferencia"));
  }

  function initVentasListener() {
    if (!window.PedidosCocina || typeof window.PedidosCocina.escucharVentasHoy !== "function") return;
    window.PedidosCocina.escucharVentasHoy((ventas) => {
      lastVentasRaw = ventas;
      renderVentasDaysPanel();
      renderVentas(ventas);
    }, (err) => {
      console.error("Error escuchando ventas:", err);
      if (err && err.code === "failed-precondition") {
        el.ventasList.innerHTML =
          '<div class="ventas-empty">⚠ Falta crear un índice en Firestore.<br>Abre la consola del navegador (F12 → Console),<br>busca el mensaje en rojo y toca el link que trae.</div>';
      }
    });

    // NUEVO: revisa cada minuto si ya cambió el día (medianoche) y
    // vuelve a construir el panel/lista, aunque no haya llegado
    // ninguna venta nueva. Así "Ventas de hoy" siempre arranca en
    // $0 al empezar un día nuevo, sin depender de que alguien cobre.
    setInterval(() => {
      renderVentasDaysPanel();
      renderVentas(lastVentasRaw);
    }, 60000);

    if (el.btnToggleVentasDays) {
      el.btnToggleVentasDays.addEventListener("click", () => {
        ventasDaysCollapsed = !ventasDaysCollapsed;
        el.ventasDaysPanel.classList.toggle("collapsed", ventasDaysCollapsed);
      });
    }
  }

  /* ---------------------------------------------------------
     NUEVO: HISTORIAL COMPLETO DE PEDIDOS ENTREGADOS
     A diferencia de "Ventas del día", esto NO filtra por fecha:
     muestra todos los pedidos con estado "entregado" que existen
     en Firestore, del más reciente al más antiguo.
  --------------------------------------------------------- */
  function renderEntregados(pedidos) {
    const ordenados = pedidos.slice().reverse();

    el.entregadosList.innerHTML = "";
    if (ordenados.length === 0) {
      const empty = document.createElement("div");
      empty.className = "ventas-empty";
      empty.textContent = "Aún no hay pedidos entregados";
      el.entregadosList.appendChild(empty);
    } else {
      ordenados.forEach((p) => {
        const esDom = p.tipoPedido === "domicilio";
        const titulo = esDom
          ? "🛵 " + escapeHtml(p.nombreCliente || "Domicilio")
          : "🍽️ Mesa " + escapeHtml(p.mesa);
        const fecha = p.hora && typeof p.hora.toDate === "function"
          ? p.hora.toDate().toLocaleString("es-CO", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
          : "";
        const pagoTexto = p.pagado ? " · " + escapeHtml(p.metodoPago || "Pagado") : " · Sin cobrar";

        const item = document.createElement("div");
        item.className = "venta-item";
        item.innerHTML =
          `<div>
             <div class="venta-title">${titulo}</div>
             <div class="venta-sub">${fecha}${pagoTexto}</div>
           </div>
           <div class="venta-total">${formatCOP(p.total)}</div>`;
        el.entregadosList.appendChild(item);
      });
    }

    el.entregadosCount.textContent = ordenados.length === 1 ? "1 pedido" : ordenados.length + " pedidos";
  }

  function initEntregadosListener() {
    if (!window.PedidosCocina || typeof window.PedidosCocina.escucharEntregados !== "function") return;
    window.PedidosCocina.escucharEntregados(renderEntregados, (err) => {
      console.error("Error escuchando entregados:", err);
      if (err && err.code === "failed-precondition") {
        el.entregadosList.innerHTML =
          '<div class="ventas-empty">⚠ Falta crear un índice en Firestore.<br>Abre la consola del navegador (F12 → Console),<br>busca el mensaje en rojo y toca el link que trae.</div>';
      }
    });
  }

  /* ---------------------------------------------------------
     MODALES: apertura / cierre genérico
  --------------------------------------------------------- */
  function openModal(modalEl) {
    modalEl.classList.add("open");
  }

  function closeModal(modalEl) {
    modalEl.classList.remove("open");
  }

  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", () => {
      closeModal(document.getElementById(btn.getAttribute("data-close")));
    });
  });

  [el.modalExceptions, el.modalPayment, el.modalDomicilio].forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  /* ---------------------------------------------------------
     NUEVO PEDIDO
  --------------------------------------------------------- */
  function newOrder() {
    const order = currentOrder();
    if (order.length === 0) {
      showToast(state.orderMode === "domicilio" ? "El pedido ya está vacío" : "La mesa " + state.currentTable + " ya está vacía");
      return;
    }
    clearCurrentOrder();
    saveState();
    renderTables();
    renderProducts();
    renderOrder();
    showToast(state.orderMode === "domicilio" ? "Pedido a domicilio reiniciado" : "Pedido de la mesa " + state.currentTable + " reiniciado");
  }

  function clearCurrentOrder() {
    if (state.orderMode === "domicilio") {
      state.domicilioOrder = [];
    } else {
      state.tables[state.currentTable] = [];
    }
  }

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
  el.btnNewOrder.addEventListener("click", newOrder);
  el.btnSaveExceptions.addEventListener("click", saveExceptions);
  el.btnConfirmPay.addEventListener("click", confirmPayment);

  // NUEVO: tipo de pedido
  el.btnKitchen.addEventListener("click", sendToKitchen);
  el.btnOrderType.addEventListener("click", openOrderTypeScreen);
  el.btnPickMesa.addEventListener("click", () => {
    closeModal(el.screenOrderType);
    openModal(el.screenSelectTable);
  });
  el.btnPickDomicilio.addEventListener("click", pickDomicilio);
  el.btnSaveDomicilio.addEventListener("click", saveDomicilio);
  el.btnVentas.addEventListener("click", () => {
    // Cada vez que se abre la pantalla, vuelve a mostrar "Hoy" por defecto
    ventasSelection = { type: "day", key: dayKeyOf(new Date()) };
    renderVentasDaysPanel();
    renderVentas(lastVentasRaw);
    openModal(el.screenVentas);
  });
  el.btnEntregados.addEventListener("click", () => openModal(el.screenEntregados));

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
    initVentasListener();
    initEntregadosListener();

    // Antes de comenzar un pedido, se debe elegir el tipo (Mesa / Domicilio)
    if (!state.orderMode || (state.orderMode === "domicilio" && !state.domicilioInfo)) {
      state.orderMode = null;
      openOrderTypeScreen();
    }
  }

  init();
})();
