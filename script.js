/* =========================================================
   EL PUNTO DEL MADURO — POS
   script.js (muestra pedidos para llevar aunque estén vacíos)
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
  const STORAGE_KEY = "elPuntoDelMaduro_state_v2";

  /* ---------------------------------------------------------
     ESTADO LOCAL
  --------------------------------------------------------- */
  let state = {
    currentKey: "mesa_1",
    currentCategory: "Maduros",
    orders: {},
    sentPedidos: {},
    orderInfo: {},
    takeoutCounter: 0,
    deliveryCounter: 0
  };

  for (let i = 1; i <= TABLE_COUNT; i++) {
    const key = `mesa_${i}`;
    state.orders[key] = [];
    state.sentPedidos[key] = [];
  }
  state.sentPedidos.domicilio = [];
  state.sentPedidos.paraLlevar = [];

  let excEditingItemId = null;
  let carritoUnsubscribe = null;
  let pedidosUnsubscribe = null;

  let lastPendientes = [];
  let lastListos = [];
  let lastEntregados = [];

  /* ---------------------------------------------------------
     PERSISTENCIA
  --------------------------------------------------------- */
  function saveState() {
    try {
      // Guardamos todas las claves dinámicas que existen en orderInfo (incluso vacías)
      const dynamicKeys = Object.keys(state.orderInfo).filter(k => k.startsWith("llevar_") || k.startsWith("domicilio_"));
      const dynamicOrderInfo = {};
      dynamicKeys.forEach(k => {
        if (state.orderInfo[k]) {
          dynamicOrderInfo[k] = state.orderInfo[k];
        }
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentKey: state.currentKey,
        currentCategory: state.currentCategory,
        orderInfo: state.orderInfo,
        takeoutCounter: state.takeoutCounter,
        deliveryCounter: state.deliveryCounter,
        dynamicKeys: dynamicKeys,
        dynamicOrderInfo: dynamicOrderInfo
      }));
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
      if (CATEGORIES.includes(parsed.currentCategory)) {
        state.currentCategory = parsed.currentCategory;
      }
      state.currentKey = parsed.currentKey || "mesa_1";
      state.orderInfo = parsed.orderInfo || {};
      state.takeoutCounter = parsed.takeoutCounter || 0;
      state.deliveryCounter = parsed.deliveryCounter || 0;

      // Restaurar claves dinámicas
      const dynamicKeys = parsed.dynamicKeys || [];
      dynamicKeys.forEach(k => {
        if (state.orderInfo[k]) {
          if (!state.orders[k]) state.orders[k] = [];
          if (!state.sentPedidos[k]) state.sentPedidos[k] = [];
        }
      });
      console.log("✅ Claves dinámicas recuperadas:", dynamicKeys);
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
    inputMontoPago: document.getElementById("inputMontoPago"),
    selectMetodoPago: document.getElementById("selectMetodoPago"),
    pagosRegistrados: document.getElementById("pagosRegistrados"),
    btnAgregarPago: document.getElementById("btnAgregarPago"),
    btnFinalizarPago: document.getElementById("btnFinalizarPago"),
    payPendiente: document.getElementById("payPendiente"),
    orderFooter: document.getElementById("orderFooter"),
  };

  /* ---------------------------------------------------------
     SINCRONIZACIÓN DEL CARRITO (Firestore)
  --------------------------------------------------------- */
  function suscribirCarrito(key) {
    if (carritoUnsubscribe) {
      carritoUnsubscribe();
      carritoUnsubscribe = null;
    }
    if (!window.PedidosCocina || typeof window.PedidosCocina.escucharCarrito !== "function") {
      console.warn("⏳ Firebase no listo para escuchar carrito, reintentando en 1s...");
      setTimeout(() => suscribirCarrito(key), 1000);
      return;
    }
    console.log(`🔔 Suscribiendo a carrito: ${key}`);
    carritoUnsubscribe = window.PedidosCocina.escucharCarrito(key, (items) => {
      console.log(`📥 Carrito RECIBIDO para ${key}:`, JSON.stringify(items));
      const currentItems = state.orders[key] || [];
      if (JSON.stringify(currentItems) !== JSON.stringify(items)) {
        state.orders[key] = items || [];
        renderOrder();
        renderProducts();
        renderTables();
      }
    }, (err) => {
      console.error("Error escuchando carrito:", err);
      setTimeout(() => suscribirCarrito(key), 5000);
    });
  }

  async function guardarCarritoRemoto(key, items) {
    if (!window.PedidosCocina || typeof window.PedidosCocina.guardarCarrito !== "function") {
      console.warn("⏳ Firebase no listo para guardar carrito, reintentando...");
      setTimeout(() => guardarCarritoRemoto(key, items), 1000);
      return;
    }
    try {
      await window.PedidosCocina.guardarCarrito(key, items);
      console.log(`✅ Carrito GUARDADO para ${key}`);
    } catch (e) {
      console.error("❌ Error guardando carrito:", e);
      setTimeout(() => guardarCarritoRemoto(key, items), 3000);
    }
  }

  async function eliminarCarritoRemoto(key) {
    if (!window.PedidosCocina || typeof window.PedidosCocina.eliminarCarrito !== "function") return;
    try {
      await window.PedidosCocina.eliminarCarrito(key);
      console.log(`🗑️ Carrito eliminado: ${key}`);
    } catch (e) {
      console.error("Error eliminando carrito:", e);
    }
  }

  /* ---------------------------------------------------------
     SINCRONIZACIÓN DE PEDIDOS EN COCINA
  --------------------------------------------------------- */
  function reconstruirSentPedidos() {
    const activos = [...lastPendientes, ...lastListos];
    const keys = Object.keys(state.sentPedidos);
    keys.forEach(k => { state.sentPedidos[k] = []; });

    activos.forEach(p => {
      if (p.pagado === true) return;
      let key = null;
      if (p.clave) key = p.clave;
      else if (p.tipoPedido === 'mesa' && p.mesa) key = `mesa_${p.mesa}`;
      else if (p.tipoPedido === 'domicilio' && p.nombreCliente) {
        const possibleKeys = Object.keys(state.orderInfo).filter(k => k.startsWith('domicilio_') && state.orderInfo[k].nombre === p.nombreCliente);
        key = possibleKeys.length > 0 ? possibleKeys[0] : 'domicilio';
      } else if (p.tipoPedido === 'paraLlevar' && p.nombreCliente) {
        const possibleKeys = Object.keys(state.orderInfo).filter(k => k.startsWith('llevar_') && state.orderInfo[k].nombre === p.nombreCliente);
        key = possibleKeys.length > 0 ? possibleKeys[0] : 'paraLlevar';
      }
      if (key && state.sentPedidos[key]) {
        state.sentPedidos[key].push({
          id: p.id,
          total: p.total,
          productos: p.productos,
          estado: p.estado || 'pendiente',
          hora: p.hora,
          pagado: p.pagado || false
        });
      }
    });

    keys.forEach(k => {
      state.sentPedidos[k].sort((a, b) => {
        const ta = a.hora && a.hora.toMillis ? a.hora.toMillis() : 0;
        const tb = b.hora && b.hora.toMillis ? b.hora.toMillis() : 0;
        return ta - tb;
      });
    });
    renderOrder();
    renderTables();
  }

  function suscribirPedidos() {
    if (pedidosUnsubscribe) {
      pedidosUnsubscribe();
      pedidosUnsubscribe = null;
    }
    if (!window.PedidosCocina || typeof window.PedidosCocina.escucharPendientes !== "function") {
      console.warn("⏳ Firebase no listo para escuchar pedidos, reintentando...");
      setTimeout(suscribirPedidos, 1000);
      return;
    }

    const pendientesUnsub = window.PedidosCocina.escucharPendientes((pedidos) => {
      lastPendientes = pedidos;
      reconstruirSentPedidos();
    }, (err) => console.error("Error pendientes:", err));

    const listosUnsub = window.PedidosCocina.escucharListos((pedidos) => {
      lastListos = pedidos;
      reconstruirSentPedidos();
    }, (err) => console.error("Error listos:", err));

    const entregadosUnsub = window.PedidosCocina.escucharEntregados((pedidos) => {
      lastEntregados = pedidos;
      renderEntregados(pedidos);
    }, (err) => console.error("Error entregados:", err));

    pedidosUnsubscribe = () => {
      pendientesUnsub();
      listosUnsub();
      entregadosUnsub();
    };
  }

  /* ---------------------------------------------------------
     RENDER DE MESAS Y PESTAÑAS DINÁMICAS
  --------------------------------------------------------- */
  function renderTables() {
    el.tablesBar.innerHTML = "";
    console.log("🔄 Renderizando mesas. Claves actuales:", Object.keys(state.orders));

    // Mesas fijas
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

    // 🔥 PEDIDOS "PARA LLEVAR" - mostrar TODOS los que existen en orderInfo
    const llevarKeys = Object.keys(state.orderInfo).filter(k => k.startsWith("llevar_"));
    console.log("📦 Claves para llevar (orderInfo):", llevarKeys);
    llevarKeys.forEach((key) => {
      // Si la clave no existe en state.orders, la creamos (por si acaso)
      if (!state.orders[key]) state.orders[key] = [];
      if (!state.sentPedidos[key]) state.sentPedidos[key] = [];

      const owed = sentTotal(key) + orderTotal(state.orders[key]);
      const info = state.orderInfo[key] || {};
      const label = info.nombre || ("LLEVAR " + key.replace("llevar_", ""));
      const btn = document.createElement("button");
      const isActive = state.currentKey === key;
      btn.className = "table-btn" + (isActive ? " active" : "") + " has-order";
      btn.style.borderColor = "var(--green)";
      btn.innerHTML = `<span>📦 ${escapeHtml(label)}</span><span class="table-sub">${formatCOP(owed)}</span>`;
      btn.addEventListener("click", () => switchOrder(key));
      el.tablesBar.appendChild(btn);
    });

    const btnNuevoLlevar = document.createElement("button");
    btnNuevoLlevar.className = "table-btn";
    btnNuevoLlevar.style.border = "2px dashed var(--green)";
    btnNuevoLlevar.innerHTML = `<span>➕ Llevar</span><span class="table-sub">Nuevo</span>`;
    btnNuevoLlevar.addEventListener("click", crearPedidoParaLlevar);
    el.tablesBar.appendChild(btnNuevoLlevar);

    // 🔥 PEDIDOS "DOMICILIO"
    const domicilioKeys = Object.keys(state.orderInfo).filter(k => k.startsWith("domicilio_"));
    console.log("🛵 Claves domicilio (orderInfo):", domicilioKeys);
    domicilioKeys.forEach((key) => {
      if (!state.orders[key]) state.orders[key] = [];
      if (!state.sentPedidos[key]) state.sentPedidos[key] = [];

      const owed = sentTotal(key) + orderTotal(state.orders[key]);
      const info = state.orderInfo[key] || {};
      const label = info.nombre ? info.nombre : ("DOM " + key.replace("domicilio_", ""));
      const btn = document.createElement("button");
      const isActive = state.currentKey === key;
      btn.className = "table-btn" + (isActive ? " active" : "") + " has-order";
      btn.style.borderColor = "var(--yellow)";
      btn.innerHTML = `<span>🛵 ${escapeHtml(label)}</span><span class="table-sub">${formatCOP(owed)}</span>`;
      btn.addEventListener("click", () => switchOrder(key));
      el.tablesBar.appendChild(btn);
    });

    const btnNuevoDom = document.createElement("button");
    btnNuevoDom.className = "table-btn";
    btnNuevoDom.style.border = "2px dashed var(--yellow)";
    btnNuevoDom.innerHTML = `<span>➕ Domicilio</span><span class="table-sub">Nuevo</span>`;
    btnNuevoDom.addEventListener("click", abrirModalNuevoDomicilio);
    el.tablesBar.appendChild(btnNuevoDom);
  }

  function switchOrder(key) {
    if (carritoUnsubscribe) {
      carritoUnsubscribe();
      carritoUnsubscribe = null;
    }
    state.currentKey = key;
    saveState();
    suscribirCarrito(key);
    renderTables();
    renderCategories();
    renderProducts();
    renderOrder();
  }

  /* ---------------------------------------------------------
     CREAR PEDIDOS DINÁMICOS
  --------------------------------------------------------- */
  function crearPedidoParaLlevar() {
    state.takeoutCounter++;
    const key = `llevar_${state.takeoutCounter}`;
    // Asegurar que existan las estructuras
    state.orders[key] = [];
    state.sentPedidos[key] = [];
    state.orderInfo[key] = { nombre: `LLEVAR ${state.takeoutCounter}`, direccion: "Para llevar", telefono: "", observaciones: "" };
    console.log("✅ Creado pedido para llevar:", key, state.orderInfo[key]);
    closeModal(el.screenOrderType);
    closeModal(el.screenSelectTable);
    guardarCarritoRemoto(key, []);
    saveState();
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
    guardarCarritoRemoto(key, []);
    saveState();
    switchOrder(key);
    showToast(`🛵 Creado: Domicilio ${state.deliveryCounter} (${nombre})`);
  }

  /* ---------------------------------------------------------
     ELIMINAR PEDIDO COMPLETO (para claves dinámicas)
  --------------------------------------------------------- */
  async function eliminarPedidoCompleto(key) {
    if (!confirm(`¿Seguro que deseas eliminar el pedido "${state.orderInfo[key]?.nombre || key}"? Se borrará de la cocina y del carrito.`)) return;

    const sentList = state.sentPedidos[key] || [];
    if (sentList.length > 0 && window.PedidosCocina && typeof window.PedidosCocina.eliminarPedido === "function") {
      for (const sp of sentList) {
        if (sp.id) {
          try {
            await window.PedidosCocina.eliminarPedido(sp.id);
          } catch (e) {
            console.error("Error eliminando pedido de Firebase:", e);
          }
        }
      }
    }

    await eliminarCarritoRemoto(key);

    delete state.orders[key];
    delete state.sentPedidos[key];
    delete state.orderInfo[key];

    state.currentKey = "mesa_1";
    saveState();

    if (carritoUnsubscribe) {
      carritoUnsubscribe();
      carritoUnsubscribe = null;
    }
    suscribirCarrito("mesa_1");

    renderTables();
    renderCategories();
    renderProducts();
    renderOrder();
    showToast(`🗑️ Pedido eliminado`);
  }

  /* ---------------------------------------------------------
     RENDER CATEGORÍAS Y PRODUCTOS
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

  /* ---------------------------------------------------------
     ACCIONES DEL CARRITO
  --------------------------------------------------------- */
  async function addProductToOrder(product) {
    const order = currentOrder();
    let item = order.find((it) => it.productId === product.id && (!it.exceptions || it.exceptions.length === 0));
    if (item) {
      item.qty += 1;
    } else {
      order.push({ id: uid(), productId: product.id, name: product.name, price: product.price, qty: 1, exceptions: [] });
    }
    await guardarCarritoRemoto(state.currentKey, order);
    renderTables();
    renderProducts();
    renderOrder();
  }

  async function changeQty(itemId, delta) {
    const order = currentOrder();
    const item = order.find((it) => it.id === itemId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      removeItem(itemId);
      return;
    }
    await guardarCarritoRemoto(state.currentKey, order);
    renderTables();
    renderProducts();
    renderOrder();
  }

  async function removeItem(itemId) {
    const order = currentOrder();
    const idx = order.findIndex((it) => it.id === itemId);
    if (idx === -1) return;
    order.splice(idx, 1);
    await guardarCarritoRemoto(state.currentKey, order);
    renderTables();
    renderProducts();
    renderOrder();
  }

  /* ---------------------------------------------------------
     RENDER: PEDIDO (con botón eliminar)
  --------------------------------------------------------- */
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
    el.orderCount.textContent = count === 1 ? "1 producto nuevo" : count + " productos nuevos";

    const sentList = state.sentPedidos[key] || [];
    if (sentList.length > 0) {
      el.orderSentBanner.innerHTML = "";
      el.orderSentBanner.classList.add("show");
      const bannerTitle = document.createElement("div");
      bannerTitle.style.fontWeight = "800";
      bannerTitle.style.marginBottom = "6px";
      bannerTitle.textContent = `🔥 Ya en cocina (${formatCOP(sentTotal(key))}):`;
      el.orderSentBanner.appendChild(bannerTitle);
      sentList.forEach((sp, idx) => {
        const itemRow = document.createElement("div");
        itemRow.style.display = "flex";
        itemRow.style.alignItems = "center";
        itemRow.style.justifyContent = "space-between";
        itemRow.style.gap = "6px";
        itemRow.style.marginTop = "6px";
        itemRow.style.padding = "6px 8px";
        itemRow.style.background = "#ffffff";
        itemRow.style.borderRadius = "8px";
        itemRow.style.fontSize = "12px";
        const estadoTexto = sp.estado === 'pendiente' ? '⏳' : sp.estado === 'listo' ? '✅' : '📦';
        itemRow.innerHTML = `
          <div style="flex:1; color: var(--black); font-weight:700;">
            ${estadoTexto} Pedido #${idx + 1}: ${formatCOP(sp.total)}
          </div>
          ${sp.estado === 'pendiente' ? `<button class="btn-edit-sent" style="background:#FFF3DB; color:var(--orange-deep); border:none; padding:4px 8px; border-radius:6px; font-weight:700; cursor:pointer;" title="Devolver para editar">✏️ Editar</button>` : ''}
          <button class="btn-delete-sent" style="background:#FCE9E6; color:var(--red); border:none; padding:4px 8px; border-radius:6px; font-weight:700; cursor:pointer;" title="Borrar de la cocina">🗑️ Borrar</button>
        `;
        const editBtn = itemRow.querySelector(".btn-edit-sent");
        if (editBtn) editBtn.addEventListener("click", () => editarPedidoEnviado(key, idx));
        itemRow.querySelector(".btn-delete-sent").addEventListener("click", () => borrarPedidoEnviado(key, idx));
        el.orderSentBanner.appendChild(itemRow);
      });
    } else {
      el.orderSentBanner.classList.remove("show");
      el.orderSentBanner.innerHTML = "";
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

    // Botón eliminar para pedidos dinámicos
    const isDynamic = key.startsWith("llevar_") || key.startsWith("domicilio_");
    let btnEliminar = document.getElementById("btnEliminarPedido");
    if (!btnEliminar) {
      btnEliminar = document.createElement("button");
      btnEliminar.id = "btnEliminarPedido";
      btnEliminar.style.cssText = "width:100%; padding:14px; border-radius:18px; background:#E64A3B; color:white; font-weight:800; font-size:16px; margin-top:8px; border:none; cursor:pointer;";
      el.orderFooter.appendChild(btnEliminar);
    }
    if (isDynamic) {
      btnEliminar.style.display = "block";
      btnEliminar.textContent = "🗑️ Eliminar pedido";
      btnEliminar.onclick = () => eliminarPedidoCompleto(key);
    } else {
      btnEliminar.style.display = "none";
    }
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

  async function saveExceptions() {
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
    await guardarCarritoRemoto(state.currentKey, order);
    closeModal(el.modalExceptions);
    renderProducts();
    renderOrder();
    showToast("Excepciones guardadas");
  }

  /* ---------------------------------------------------------
     MODAL DE PAGO DIVIDIDO
  --------------------------------------------------------- */
  let pagoKey = null;
  let pagoTotal = 0;
  let pagoPendiente = 0;
  let pedidoIdParaPago = null;

  function openPaymentModal() {
    const owed = currentOwed();
    if (owed <= 0) return;
    pagoKey = state.currentKey;
    pagoTotal = owed;
    pagoPendiente = owed;
    const sentList = state.sentPedidos[pagoKey] || [];
    pedidoIdParaPago = sentList.length > 0 ? sentList[0].id : null;
    if (!pedidoIdParaPago) {
      showToast("Primero envía el pedido a cocina");
      return;
    }
    document.getElementById("pagosRegistrados").innerHTML = "";
    el.inputMontoPago.value = pagoPendiente;
    el.selectMetodoPago.value = "Efectivo";
    el.btnFinalizarPago.disabled = true;
    document.getElementById("payTotal").textContent = formatCOP(pagoTotal);
    actualizarPendiente(pagoPendiente);
    openModal(el.modalPayment);
  }

  function actualizarPendiente(pendiente) {
    el.payPendiente.textContent = formatCOP(pendiente);
    el.btnFinalizarPago.disabled = pendiente > 0;
  }

  async function agregarPagoParcial() {
    const monto = parseFloat(el.inputMontoPago.value);
    const metodo = el.selectMetodoPago.value;
    if (!monto || monto <= 0) {
      showToast("Ingresa un monto válido");
      return;
    }
    if (monto > pagoPendiente) {
      showToast("El monto no puede superar el pendiente");
      return;
    }
    if (!pedidoIdParaPago) {
      showToast("No hay pedido en cocina para pagar");
      return;
    }
    try {
      const result = await window.PedidosCocina.registrarPagoParcial(pedidoIdParaPago, metodo, monto);
      const container = document.getElementById("pagosRegistrados");
      const row = document.createElement("div");
      row.style.cssText = "display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #eee; font-size:14px;";
      row.innerHTML = `<span>${metodo}</span><span>${formatCOP(monto)}</span>`;
      container.appendChild(row);
      pagoPendiente -= monto;
      actualizarPendiente(pagoPendiente);
      if (pagoPendiente <= 0) {
        showToast("✅ Pedido pagado completamente");
        el.btnFinalizarPago.disabled = false;
      } else {
        showToast(`💰 Pago registrado. Pendiente: ${formatCOP(pagoPendiente)}`);
        el.inputMontoPago.value = pagoPendiente;
      }
    } catch (err) {
      console.error("Error al registrar pago:", err);
      showToast("Error al registrar pago. Revisa consola.");
    }
  }

  async function finalizarPago() {
    try {
      await eliminarCarritoRemoto(pagoKey);
      state.orders[pagoKey] = [];
      state.sentPedidos[pagoKey] = [];
      if (pagoKey.startsWith("domicilio_") || pagoKey.startsWith("llevar_")) {
        delete state.orders[pagoKey];
        delete state.sentPedidos[pagoKey];
        delete state.orderInfo[pagoKey];
        state.currentKey = "mesa_1";
      } else {
        state.currentKey = pagoKey;
        state.orders[pagoKey] = [];
        state.sentPedidos[pagoKey] = [];
      }
      saveState();
      if (carritoUnsubscribe) {
        carritoUnsubscribe();
        carritoUnsubscribe = null;
      }
      suscribirCarrito(state.currentKey);
      closeModal(el.modalPayment);
      renderTables();
      renderProducts();
      renderOrder();
      showToast("✅ Pago completado");
      setTimeout(cargarVentasDirectas, 500);
    } catch (err) {
      console.error("Error al finalizar pago:", err);
      showToast("Error al finalizar pago");
    }
  }

  /* ---------------------------------------------------------
     ENVIAR A COCINA
  --------------------------------------------------------- */
  async function sendToKitchen() {
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
      excepciones: it.excepciones || [],
    }));
    const pedido = {
      tipoPedido: isTakeout ? "paraLlevar" : (isDelivery ? "domicilio" : "mesa"),
      mesa: isMesa ? parseInt(key.replace("mesa_", "")) : null,
      nombreCliente: (isDelivery || isTakeout) ? (info.nombre || "Cliente") : null,
      direccion: (isDelivery || isTakeout) ? (info.direccion || "") : null,
      telefono: (isDelivery || isTakeout) ? (info.telefono || "") : null,
      productos: productos,
      observaciones: (isDelivery || isTakeout) ? (info.observaciones || "") : "",
      total: orderTotal(order),
      estado: "pendiente",
      clave: key,
    };
    el.btnKitchen.disabled = true;
    try {
      const ref = await window.PedidosCocina.enviarPedido(pedido);
      if (!state.sentPedidos[key]) state.sentPedidos[key] = [];
      state.sentPedidos[key].push({ id: ref.id, total: pedido.total, productos: productos, estado: "pendiente" });
      state.orders[key] = [];
      await eliminarCarritoRemoto(key);
      saveState();
      renderTables();
      renderProducts();
      renderOrder();
      showToast("Pedido enviado a cocina 🚀");
    } catch (err) {
      console.error(err);
      showToast("No se pudo enviar el pedido.");
    } finally {
      el.btnKitchen.disabled = false;
    }
  }

  /* ---------------------------------------------------------
     FUNCIONES DE EDICIÓN Y BORRADO DE PEDIDOS EN COCINA
  --------------------------------------------------------- */
  async function editarPedidoEnviado(key, index) {
    const sp = (state.sentPedidos[key] || [])[index];
    if (!sp) return;
    if (sp.id && window.PedidosCocina && typeof window.PedidosCocina.eliminarPedido === "function") {
      try {
        await window.PedidosCocina.eliminarPedido(sp.id);
      } catch (e) {
        console.error("Error al borrar de Firebase:", e);
      }
    }
    if (sp.productos && Array.isArray(sp.productos)) {
      sp.productos.forEach((p) => {
        const prodOrig = PRODUCTS.find((prod) => prod.name === p.nombre);
        state.orders[key].push({
          id: uid(),
          productId: prodOrig ? prodOrig.id : "custom",
          name: p.nombre,
          price: p.precio,
          qty: p.cantidad,
          exceptions: p.excepciones || [],
        });
      });
      await guardarCarritoRemoto(key, state.orders[key]);
    }
    state.sentPedidos[key].splice(index, 1);
    saveState();
    renderTables();
    renderProducts();
    renderOrder();
    showToast("Pedido devuelto a la mesa. Puedes modificarlo.");
  }

  async function borrarPedidoEnviado(key, index) {
    if (!confirm("¿Seguro que deseas borrar este pedido de la cocina?")) return;
    const sp = (state.sentPedidos[key] || [])[index];
    if (!sp) return;
    if (sp.id && window.PedidosCocina && typeof window.PedidosCocina.eliminarPedido === "function") {
      try {
        await window.PedidosCocina.eliminarPedido(sp.id);
      } catch (e) {
        console.error("Error al borrar de Firebase:", e);
      }
    }
    state.sentPedidos[key].splice(index, 1);
    saveState();
    renderTables();
    renderProducts();
    renderOrder();
    showToast("Pedido eliminado de la cocina");
  }

  /* ---------------------------------------------------------
     VENTAS — CARGA DIRECTA Y RENDER
  --------------------------------------------------------- */
  let ventasSelection = { type: "day", key: getTodayKey() };
  let lastVentasRaw = [];

  function getTodayKey() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function fechaDeHora(hora) {
    if (!hora || typeof hora.toDate !== "function") return new Date();
    return hora.toDate();
  }

  function dayKeyOf(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }

  function monthKeyOf(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");
  }

  function horaTexto(hora) {
    if (!hora || typeof hora.toDate !== "function") return "--:--";
    return hora.toDate().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
  }

  function formatDateKey(key) {
    const parts = key.split("-");
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    return `${parseInt(parts[2])} de ${meses[parseInt(parts[1]) - 1]} de ${parts[0]}`;
  }

  async function cargarVentasDirectas() {
    try {
      if (!window.firebaseApp) return [];
      const { getFirestore, collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js");
      const db = getFirestore(window.firebaseApp);
      const querySnapshot = await getDocs(collection(db, "pedidosCocina"));
      const ventas = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.pagado === true || (data.pagos && data.pagos.length > 0)) {
          if (data.pagos && data.pagos.length > 0) {
            data.pagos.forEach(pago => {
              ventas.push({
                id: doc.id + "_" + pago.metodo + "_" + pago.monto,
                ...data,
                metodoPago: pago.metodo,
                total: pago.monto,
                horaPago: pago.horaPago || data.horaPago
              });
            });
          } else {
            ventas.push({ id: doc.id, ...data });
          }
        }
      });
      ventas.sort((a, b) => {
        const ta = a.horaPago && typeof a.horaPago.toMillis === "function" ? a.horaPago.toMillis() : 0;
        const tb = b.horaPago && typeof b.horaPago.toMillis === "function" ? b.horaPago.toMillis() : 0;
        return tb - ta;
      });
      lastVentasRaw = ventas;
      renderVentas(ventas);
      renderVentasDaysPanel(ventas);
      return ventas;
    } catch (error) {
      console.error("❌ Error cargando ventas:", error);
      if (el.ventasList) {
        el.ventasList.innerHTML = `<div class="ventas-empty">⚠ Error al cargar ventas</div>`;
      }
      return [];
    }
  }

  function renderVentas(ventas) {
    let filtradas = [];
    if (ventasSelection.type === "day") {
      filtradas = ventas.filter(v => {
        const fecha = v.horaPago ? fechaDeHora(v.horaPago) : (v.hora ? fechaDeHora(v.hora) : new Date());
        return dayKeyOf(fecha) === ventasSelection.key;
      });
    } else {
      filtradas = ventas.filter(v => {
        const fecha = v.horaPago ? fechaDeHora(v.horaPago) : (v.hora ? fechaDeHora(v.hora) : new Date());
        return monthKeyOf(fecha) === ventasSelection.key;
      });
    }
    filtradas.sort((a, b) => {
      const ta = a.horaPago && typeof a.horaPago.toMillis === "function" ? a.horaPago.toMillis() : 0;
      const tb = b.horaPago && typeof b.horaPago.toMillis === "function" ? b.horaPago.toMillis() : 0;
      return tb - ta;
    });
    const hoyKey = getTodayKey();
    let titulo = "📊 Ventas";
    if (ventasSelection.type === "day") {
      if (ventasSelection.key === hoyKey) titulo = "📊 Ventas de hoy";
      else titulo = `📊 Ventas del ${formatDateKey(ventasSelection.key)}`;
    } else {
      const [y, m] = ventasSelection.key.split("-");
      const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
      titulo = `📊 Ventas de ${meses[parseInt(m) - 1]} ${y}`;
    }
    if (el.ventasScreenTitle) el.ventasScreenTitle.textContent = titulo;
    if (el.ventasTotalLabel) el.ventasTotalLabel.textContent = "Total ventas";

    el.ventasList.innerHTML = "";
    if (filtradas.length === 0) {
      const empty = document.createElement("div");
      empty.className = "ventas-empty";
      empty.textContent = "No hay ventas en esta fecha";
      el.ventasList.appendChild(empty);
    } else {
      filtradas.forEach((v) => {
        const esDom = v.tipoPedido === "domicilio";
        const esParaLlevar = v.tipoPedido === "paraLlevar";
        let tituloItem = "";
        if (esParaLlevar) tituloItem = "📦 " + escapeHtml(v.nombreCliente || "Para llevar");
        else if (esDom) tituloItem = "🛵 " + escapeHtml(v.nombreCliente || "Domicilio");
        else tituloItem = "🍽️ Mesa " + escapeHtml(v.mesa);
        const item = document.createElement("div");
        item.className = "venta-item";
        const fecha = v.horaPago ? horaTexto(v.horaPago) : (v.hora ? horaTexto(v.hora) : "");
        item.innerHTML = `<div><div class="venta-title">${tituloItem}</div><div class="venta-sub">${fecha} · ${escapeHtml(v.metodoPago || "Sin método")}</div></div><div class="venta-total">${formatCOP(v.total)}</div>`;
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
    const hoyKey = getTodayKey();
    el.ventasDaysList.innerHTML = "";

    const hoyVentas = ventas.filter(v => {
      const fecha = v.horaPago ? fechaDeHora(v.horaPago) : (v.hora ? fechaDeHora(v.hora) : new Date());
      return dayKeyOf(fecha) === hoyKey;
    });
    const totalHoy = hoyVentas.reduce((s, v) => s + (v.total || 0), 0);
    const btnHoy = document.createElement("button");
    btnHoy.className = "ventas-day-btn" + (ventasSelection.type === "day" && ventasSelection.key === hoyKey ? " active" : "");
    btnHoy.innerHTML = `<span>Hoy</span><span class="venta-day-sub">${formatCOP(totalHoy)}</span>`;
    btnHoy.addEventListener("click", () => {
      ventasSelection = { type: "day", key: hoyKey };
      renderVentasDaysPanel(ventas);
      renderVentas(ventas);
    });
    el.ventasDaysList.appendChild(btnHoy);

    const daysMap = new Map();
    ventas.forEach(v => {
      const fecha = v.horaPago ? fechaDeHora(v.horaPago) : (v.hora ? fechaDeHora(v.hora) : new Date());
      const key = dayKeyOf(fecha);
      if (!daysMap.has(key)) daysMap.set(key, { total: 0, count: 0 });
      const entry = daysMap.get(key);
      entry.total += v.total || 0;
      entry.count += 1;
    });
    const sortedDays = Array.from(daysMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));
    let count = 0;
    for (const [key, data] of sortedDays) {
      if (key === hoyKey) continue;
      if (count > 9) break;
      const btn = document.createElement("button");
      btn.className = "ventas-day-btn" + (ventasSelection.type === "day" && ventasSelection.key === key ? " active" : "");
      const label = formatDateKey(key);
      btn.innerHTML = `<span>${label}</span><span class="venta-day-sub">${formatCOP(data.total)}</span>`;
      btn.addEventListener("click", () => {
        ventasSelection = { type: "day", key: key };
        renderVentasDaysPanel(ventas);
        renderVentas(ventas);
      });
      el.ventasDaysList.appendChild(btn);
      count++;
    }

    const mesKey = hoyKey.slice(0, 7);
    const mesVentas = ventas.filter(v => {
      const fecha = v.horaPago ? fechaDeHora(v.horaPago) : (v.hora ? fechaDeHora(v.hora) : new Date());
      return monthKeyOf(fecha) === mesKey;
    });
    const totalMes = mesVentas.reduce((s, v) => s + (v.total || 0), 0);
    const monthLabel = document.createElement("div");
    monthLabel.className = "ventas-month-label";
    monthLabel.textContent = "Este mes";
    el.ventasDaysList.appendChild(monthLabel);
    const monthBtn = document.createElement("button");
    monthBtn.className = "ventas-month-btn" + (ventasSelection.type === "month" && ventasSelection.key === mesKey ? " active" : "");
    monthBtn.innerHTML = `<span>Total</span><span>${formatCOP(totalMes)}</span>`;
    monthBtn.addEventListener("click", () => {
      ventasSelection = { type: "month", key: mesKey };
      renderVentasDaysPanel(ventas);
      renderVentas(ventas);
    });
    el.ventasDaysList.appendChild(monthBtn);
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
     SELECTOR DE MESA
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
     ENTREGADOS (historial)
  --------------------------------------------------------- */
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

  /* ---------------------------------------------------------
     EVENTOS GLOBALES
  --------------------------------------------------------- */
  el.btnCharge.addEventListener("click", openPaymentModal);
  el.btnNewOrder.addEventListener("click", openOrderTypeScreen);
  el.btnSaveExceptions.addEventListener("click", saveExceptions);
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
    ventasSelection = { type: "day", key: getTodayKey() };
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

  el.btnAgregarPago.addEventListener("click", agregarPagoParcial);
  el.btnFinalizarPago.addEventListener("click", finalizarPago);
  el.inputMontoPago.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      el.btnAgregarPago.click();
    }
  });

  /* ---------------------------------------------------------
     INIT
  --------------------------------------------------------- */
  function init() {
    loadState();
    for (let i = 1; i <= TABLE_COUNT; i++) {
      const key = `mesa_${i}`;
      if (!state.orders[key]) state.orders[key] = [];
      if (!state.sentPedidos[key]) state.sentPedidos[key] = [];
    }
    state.sentPedidos.domicilio = [];
    state.sentPedidos.paraLlevar = [];

    // Asegurar que las claves dinámicas existan en state.orders
    const dynamicKeys = Object.keys(state.orderInfo).filter(k => k.startsWith("llevar_") || k.startsWith("domicilio_"));
    dynamicKeys.forEach(k => {
      if (!state.orders[k]) state.orders[k] = [];
      if (!state.sentPedidos[k]) state.sentPedidos[k] = [];
    });

    renderTables();
    renderCategories();
    renderProducts();
    renderOrder();
    renderSelectTableGrid();

    suscribirCarrito(state.currentKey);

    let intentos = 0;
    const maxIntentos = 20;
    function iniciarListeners() {
      if (window.PedidosCocina && typeof window.PedidosCocina.escucharPendientes === 'function') {
        console.log("✅ Firebase listo, iniciando listeners de pedidos");
        suscribirPedidos();

        if (typeof window.PedidosCocina.escucharEntregados === 'function') {
          window.PedidosCocina.escucharEntregados((pedidos) => {
            renderEntregados(pedidos);
          }, (err) => console.error("Error entregados:", err));
        }

        if (typeof window.PedidosCocina.escucharVentasHoy === 'function') {
          window.PedidosCocina.escucharVentasHoy((ventas) => {
            lastVentasRaw = ventas;
            renderVentas(ventas);
            renderVentasDaysPanel(ventas);
          }, (err) => console.error("Error ventas:", err));
        }
      } else {
        intentos++;
        if (intentos < maxIntentos) {
          console.log(`⏳ Esperando Firebase... (${intentos})`);
          setTimeout(iniciarListeners, 500);
        } else {
          console.error("❌ Firebase no disponible después de varios intentos");
          showToast("Error: Firebase no cargó. Recarga la página.");
        }
      }
    }
    iniciarListeners();

    setTimeout(() => {
      if (window.firebaseApp) {
        cargarVentasDirectas();
      }
    }, 1500);

    if (!state.currentKey || !state.orders[state.currentKey]) {
      state.currentKey = "mesa_1";
      openOrderTypeScreen();
    }
  }

  init();
})();
