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
  getDoc,
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

// Asignación global para compatibilidad
window.firebaseApp = app;
window.db = db;

const PEDIDOS_COL = "pedidosCocina";
const PEDIDOS_ACTIVOS_COL = "pedidosActivos"; // Nueva colección para carritos
const pedidosRef = collection(db, PEDIDOS_COL);
const activosRef = collection(db, PEDIDOS_ACTIVOS_COL);

/* ---------------------------------------------------------
   FUNCIONES PARA CARRITOS (sincronización en tiempo real)
--------------------------------------------------------- */
export async function guardarCarrito(key, order, orderInfo) {
  // key: "mesa_1", "domicilio_1", "llevar_1"
  const docRef = doc(db, PEDIDOS_ACTIVOS_COL, key);
  await setDoc(docRef, {
    key: key,
    order: order || [],
    orderInfo: orderInfo || {},
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export function escucharCarrito(callback, onError) {
  return onSnapshot(
    collection(db, PEDIDOS_ACTIVOS_COL),
    (snapshot) => {
      const carritos = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        carritos[data.key] = {
          order: data.order || [],
          orderInfo: data.orderInfo || {},
        };
      });
      callback(carritos);
    },
    (err) => {
      console.error("Error escuchando carritos:", err);
      if (typeof onError === "function") onError(err);
    }
  );
}

export async function eliminarCarrito(key) {
  await deleteDoc(doc(db, PEDIDOS_ACTIVOS_COL, key));
}

/* ---------------------------------------------------------
   ENVIAR PEDIDO A COCINA (desde carrito)
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
   ESCUCHAR EN TIEMPO REAL (cocina)
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
      snap.forEach((d) => {
        const data = d.data();
        // Si tiene pagos individuales, desglosar
        if (data.pagos && data.pagos.length > 0) {
          data.pagos.forEach((pago) => {
            ventas.push({
              id: d.id + "_" + pago.metodo + "_" + pago.monto,
              ...data,
              metodoPago: pago.metodo,
              total: pago.monto,
              horaPago: pago.horaPago || data.horaPago,
            });
          });
        } else {
          ventas.push({ id: d.id, ...data });
        }
      });
      // Ordenar por hora de pago
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
   REGISTRAR PAGO PARCIAL
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
   COBRAR (batch para múltiples IDs)
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
  registrarPagoParcial,
  guardarCarrito,
  escucharCarrito,
  eliminarCarrito,
};
