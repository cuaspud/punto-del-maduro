/* =========================================================
   EL PUNTO DEL MADURO — POS
   firebase.js
   Conexión con Firebase Firestore (tiempo real).
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
  getDoc, // <--- necesario para pagos parciales
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

/* ---------------------------------------------------------
   CONFIGURACIÓN — credenciales
--------------------------------------------------------- */
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

// Asignación global para compatibilidad con script.js
window.firebaseApp = app;
window.db = db;

const PEDIDOS_COL = "pedidosCocina";
const CARRITOS_COL = "carritos"; // <--- NUEVA COLECCIÓN PARA SINCRONIZACIÓN
const pedidosRef = collection(db, PEDIDOS_COL);
const carritosRef = collection(db, CARRITOS_COL);

/* ---------------------------------------------------------
   ENVIAR PEDIDO A COCINA
--------------------------------------------------------- */
export async function enviarPedido(pedido) {
  return addDoc(pedidosRef, {
    ...pedido,
    pagado: false,
    pagos: [],
    hora: serverTimestamp(),
  });
}

/* ---------------------------------------------------------
   CARRITOS (SINCRONIZACIÓN EN TIEMPO REAL)
--------------------------------------------------------- */

// Guardar carrito (items) de una mesa/domicilio
export async function guardarCarrito(key, items) {
  const ref = doc(db, CARRITOS_COL, key);
  await setDoc(ref, {
    key,
    items,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

// Obtener carrito actual (para sincronización inicial)
export async function obtenerCarrito(key) {
  const ref = doc(db, CARRITOS_COL, key);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data().items || [];
  }
  return [];
}

// Escuchar cambios en un carrito específico
export function escucharCarrito(key, callback, onError) {
  const ref = doc(db, CARRITOS_COL, key);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      callback(data.items || []);
    } else {
      callback([]);
    }
  }, onError);
}

// Eliminar carrito (cuando se cobra o se reinicia)
export async function eliminarCarrito(key) {
  const ref = doc(db, CARRITOS_COL, key);
  await deleteDoc(ref);
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
      // Si tiene pagos, desglosamos
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
        // Caso antiguo (un solo pago)
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
   ACCIONES DE COCINA Y EDICIÓN
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
   PAGOS PARCIALES
--------------------------------------------------------- */
export async function registrarPagoParcial(id, metodo, monto) {
  if (!id || !metodo || monto <= 0) return;

  const docRef = doc(db, PEDIDOS_COL, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) throw new Error("Pedido no encontrado");

  const data = docSnap.data();
  const total = data.total || 0;
  const pagos = data.pagos || [];

  const nuevoPago = {
    metodo,
    monto,
    horaPago: serverTimestamp()
  };
  pagos.push(nuevoPago);

  const totalPagado = pagos.reduce((sum, p) => sum + p.monto, 0);
  const pagado = totalPagado >= total;

  await updateDoc(docRef, {
    pagos: pagos,
    pagado: pagado,
    horaPago: serverTimestamp()
  });

  return { pagos, pagado, totalPagado };
}

/* ---------------------------------------------------------
   COBRAR (para compatibilidad con pagos únicos)
--------------------------------------------------------- */
export async function cobrarPedidos(ids, metodoPago) {
  if (!ids || ids.length === 0) return;
  const batch = writeBatch(db);
  ids.forEach((id) => {
    if (id) {
      batch.set(
        doc(db, PEDIDOS_COL, id),
        {
          pagado: true,
          metodoPago,
          pagos: [{ metodo: metodoPago, monto: 0, horaPago: serverTimestamp() }],
          estado: "entregado",
          horaPago: serverTimestamp(),
        },
        { merge: true }
      );
    }
  });
  return batch.commit();
}

/* ---------------------------------------------------------
   ESCUCHAR LISTOS PARA MESERO
--------------------------------------------------------- */
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
  cobrarPedidos,
  registrarPagoParcial,
  guardarCarrito,
  obtenerCarrito,
  escucharCarrito,
  eliminarCarrito,
};
