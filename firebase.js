/* =========================================================
   EL PUNTO DEL MADURO — POS
   firebase.js (con pagos sin serverTimestamp en arrays)
   ========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCqDEkTFudWGaMu1yjHkvutsHCtrPzyIek",
  authDomain: "punto-del-maduro.firebaseapp.com",
  projectId: "punto-del-maduro",
  storageBucket: "punto-del-maduro.firebasestorage.app",
  messagingSenderId: "158929781827",
  appId: "1:158929781827:web:569c3d1329de6973bb80f6",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.firebaseApp = app;
window.db = db;

const PEDIDOS_COL = "pedidosCocina";
const CARRITOS_COL = "carritos";
const pedidosRef = collection(db, PEDIDOS_COL);
const carritosRef = collection(db, CARRITOS_COL);

/* ---------------------------------------------------------
   CARRITOS (SINCRONIZACIÓN EN TIEMPO REAL)
--------------------------------------------------------- */
export async function guardarCarrito(key, items) {
  console.log(`💾 Guardando carrito para ${key}:`, items);
  const ref = doc(db, CARRITOS_COL, key);
  await setDoc(ref, {
    key,
    items: items || [],
    updatedAt: serverTimestamp(),
  }, { merge: true });
  console.log(`✅ Carrito guardado para ${key}`);
}

export async function obtenerCarrito(key) {
  const ref = doc(db, CARRITOS_COL, key);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data().items || [];
  }
  return [];
}

export function escucharCarrito(key, callback, onError) {
  console.log(`🔔 Suscribiendo a carrito: ${key}`);
  const ref = doc(db, CARRITOS_COL, key);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      console.log(`📥 Datos recibidos para ${key}:`, data.items);
      callback(data.items || []);
    } else {
      console.log(`📭 Carrito vacío para ${key}`);
      callback([]);
    }
  }, (err) => {
    console.error(`❌ Error en listener de carrito ${key}:`, err);
    if (onError) onError(err);
  });
}

export async function eliminarCarrito(key) {
  console.log(`🗑️ Eliminando carrito: ${key}`);
  const ref = doc(db, CARRITOS_COL, key);
  await deleteDoc(ref);
}

/* ---------------------------------------------------------
   ENVIAR PEDIDO A COCINA
--------------------------------------------------------- */
export async function enviarPedido(pedido) {
  console.log("📦 Enviando pedido a cocina:", pedido);
  return addDoc(pedidosRef, {
    ...pedido,
    pagado: false,
    pagos: [],
    hora: serverTimestamp(),
  });
}

/* ---------------------------------------------------------
   ESCUCHAR EN TIEMPO REAL (pedidos de cocina)
--------------------------------------------------------- */
export function escucharPendientes(callback, onError) {
  const q = query(pedidosRef, where("estado", "==", "pendiente"), orderBy("hora", "asc"));
  return onSnapshot(q, (snap) => {
    const pedidos = [];
    snap.forEach((d) => pedidos.push({ id: d.id, ...d.data() }));
    callback(pedidos);
  }, onError);
}

export function escucharListos(callback, onError) {
  const q = query(pedidosRef, where("estado", "==", "listo"), orderBy("hora", "asc"));
  return onSnapshot(q, (snap) => {
    const pedidos = [];
    snap.forEach((d) => pedidos.push({ id: d.id, ...d.data() }));
    callback(pedidos);
  }, onError);
}

export function escucharEntregados(callback, onError) {
  const q = query(pedidosRef, where("estado", "==", "entregado"), orderBy("hora", "asc"));
  return onSnapshot(q, (snap) => {
    const pedidos = [];
    snap.forEach((d) => pedidos.push({ id: d.id, ...d.data() }));
    callback(pedidos);
  }, onError);
}

export function escucharVentasHoy(callback, onError) {
  const q = query(pedidosRef, where("pagado", "==", true));
  return onSnapshot(q, (snap) => {
    const ventas = [];
    snap.forEach((d) => {
      const data = d.data();
      if (data.pagos && data.pagos.length > 0) {
        data.pagos.forEach(pago => {
          ventas.push({
            id: d.id + "_" + pago.metodo + "_" + pago.monto,
            ...data,
            metodoPago: pago.metodo,
            total: pago.monto,
            horaPago: pago.horaPago || data.horaPago
          });
        });
      } else {
        ventas.push({ id: d.id, ...data });
      }
    });
    ventas.sort((a, b) => {
      const ta = a.horaPago && typeof a.horaPago.toMillis === "function" ? a.horaPago.toMillis() : 0;
      const tb = b.horaPago && typeof b.horaPago.toMillis === "function" ? b.horaPago.toMillis() : 0;
      return tb - ta;
    });
    callback(ventas);
  }, onError);
}

/* ---------------------------------------------------------
   ACCIONES DE COCINA
--------------------------------------------------------- */
export function marcarPreparado(id) {
  return updateDoc(doc(db, PEDIDOS_COL, id), { estado: "listo" });
}

export function marcarEntregado(id) {
  return updateDoc(doc(db, PEDIDOS_COL, id), { estado: "entregado" });
}

export function eliminarPedido(id) {
  if (!id) return Promise.resolve();
  return deleteDoc(doc(db, PEDIDOS_COL, id));
}

/* ---------------------------------------------------------
   PAGOS PARCIALES (CORREGIDO: SIN serverTimestamp EN ARRAYS)
--------------------------------------------------------- */
export async function registrarPagoParcial(id, metodo, monto) {
  if (!id || !metodo || monto <= 0) return;
  const docRef = doc(db, PEDIDOS_COL, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error("Pedido no encontrado");

  const data = docSnap.data();
  const total = data.total || 0;
  const pagos = data.pagos || [];

  // Crear nuevo pago con timestamp numérico (NO usar serverTimestamp dentro del array)
  const nuevoPago = {
    metodo,
    monto,
    horaPago: new Date().toISOString(), // timestamp como string ISO (o puedes usar Date.now())
  };
  pagos.push(nuevoPago);

  const totalPagado = pagos.reduce((sum, p) => sum + p.monto, 0);
  const pagado = totalPagado >= total;

  // Actualizar documento: pagos array, pagado, y horaPago del documento con serverTimestamp
  await updateDoc(docRef, {
    pagos: pagos,
    pagado: pagado,
    horaPago: serverTimestamp(), // solo aquí usamos serverTimestamp
  });

  return { pagos, pagado, totalPagado };
}

export function escucharListosParaMesero(callback, onError) {
  const q = query(pedidosRef, where("estado", "==", "listo"));
  return onSnapshot(q, (snap) => {
    const pedidos = [];
    snap.forEach((d) => pedidos.push({ id: d.id, ...d.data() }));
    callback(pedidos);
  }, onError);
}

/* ---------------------------------------------------------
   PUENTE PARA script.js
--------------------------------------------------------- */
window.PedidosCocina = {
  enviarPedido,
  escucharListosParaMesero,
  escucharPendientes,
  escucharListos,
  escucharEntregados,
  escucharVentasHoy,
  marcarPreparado,
  marcarEntregado,
  eliminarPedido,
  registrarPagoParcial,
  guardarCarrito,
  obtenerCarrito,
  escucharCarrito,
  eliminarCarrito,
};
