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
const pedidosRef = collection(db, PEDIDOS_COL);

/* ---------------------------------------------------------
   ENVIAR PEDIDO
--------------------------------------------------------- */
export async function enviarPedido(pedido) {
  return addDoc(pedidosRef, {
    ...pedido,
    pagado: false,
    hora: serverTimestamp(),
  });
}

/* ---------------------------------------------------------
   ESCUCHAR EN TIEMPO REAL
--------------------------------------------------------- */
export function escucharPendientes(callback, onError) {
  const q = query(pedidosRef, where("estado", "==", "pendiente"), orderBy("hora", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      const pedidos = [];
      snap.forEach((d) => pedidos.push({ id: d.id, ...d.data() }));
      callback(pedidos);
    },
    (err) => {
      console.error("Error escuchando pendientes:", err);
      if (typeof onError === "function") onError(err);
    }
  );
}

export function escucharListos(callback, onError) {
  const q = query(pedidosRef, where("estado", "==", "listo"), orderBy("hora", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      const pedidos = [];
      snap.forEach((d) => pedidos.push({ id: d.id, ...d.data() }));
      callback(pedidos);
    },
    (err) => {
      console.error("Error escuchando listos:", err);
      if (typeof onError === "function") onError(err);
    }
  );
}

export function escucharEntregados(callback, onError) {
  const q = query(pedidosRef, where("estado", "==", "entregado"), orderBy("hora", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      const pedidos = [];
      snap.forEach((d) => pedidos.push({ id: d.id, ...d.data() }));
      callback(pedidos);
    },
    (err) => {
      console.error("Error escuchando entregados:", err);
      if (typeof onError === "function") onError(err);
    }
  );
}

export function escucharVentasHoy(callback, onError) {
  const q = query(pedidosRef, where("pagado", "==", true));
  return onSnapshot(
    q,
    (snap) => {
      const ventas = [];
      snap.forEach((d) => ventas.push({ id: d.id, ...d.data() }));
      ventas.sort((a, b) => {
        const ta = a.horaPago && typeof a.horaPago.toMillis === "function" ? a.horaPago.toMillis() : 0;
        const tb = b.horaPago && typeof b.horaPago.toMillis === "function" ? b.horaPago.toMillis() : 0;
        return tb - ta;
      });
      callback(ventas);
    },
    (err) => {
      console.error("Error escuchando ventas:", err);
      if (typeof onError === "function") onError(err);
    }
  );
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
   COBRAR (utiliza merge para tolerancia a fallos)
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
          estado: "entregado",
          horaPago: serverTimestamp(),
        },
        { merge: true }
      );
    }
  });
  return batch.commit();
}

export function escucharListosParaMesero(callback, onError) {
  const q = query(pedidosRef, where("estado", "==", "listo"));
  return onSnapshot(
    q,
    (snap) => {
      const pedidos = [];
      snap.forEach((d) => pedidos.push({ id: d.id, ...d.data() }));
      callback(pedidos);
    },
    (err) => {
      console.error("Error escuchando listos para mesero:", err);
      if (typeof onError === "function") onError(err);
    }
  );
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
};
