/* =========================================================
   EL PUNTO DEL MADURO — POS
   firebase.js
   Conexión con Firebase Firestore (tiempo real).

   ⚠️ IMPORTANTE:
   Reemplaza los valores de "firebaseConfig" por los de TU
   proyecto en https://console.firebase.google.com
   (Configuración del proyecto → Tus apps → SDK de Firebase).

   Este archivo es el ÚNICO lugar del proyecto que conoce
   Firebase. index.html/script.js y cocina.html solo usan
   las funciones que este módulo expone, nunca importan
   Firebase directamente en script.js.
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
   CONFIGURACIÓN — reemplaza con tus credenciales reales
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

const PEDIDOS_COL = "pedidosCocina";
const pedidosRef = collection(db, PEDIDOS_COL);

/* ---------------------------------------------------------
   ENVIAR PEDIDO (pantalla mesero → cocina)
   pedido: { tipoPedido, mesa, nombreCliente, direccion,
             telefono, productos, observaciones, total, estado }
   La marca de tiempo "hora" se agrega aquí con el reloj
   del servidor para que sea confiable entre dispositivos.

   "pagado" arranca en false: el pedido NO se borra ni se
   pierde en ningún momento, solo cambia de estado
   (pendiente → listo → entregado) y luego se marca como
   pagado cuando el mesero cobra la mesa/domicilio.
--------------------------------------------------------- */
export async function enviarPedido(pedido) {
  return addDoc(pedidosRef, {
    ...pedido,
    pagado: false,
    hora: serverTimestamp(),
  });
}

/* ---------------------------------------------------------
   ESCUCHAR EN TIEMPO REAL (pantalla cocina)
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

/* ---------------------------------------------------------
   NUEVO: ENTREGADOS
   Pedidos que la cocina ya entregó. NO se borran — quedan
   aquí como el registro de lo que se ha vendido, hasta que
   se cierre el día. Usa el mismo índice compuesto
   (estado + hora) que pendientes/listos.
--------------------------------------------------------- */
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

/* ---------------------------------------------------------
   NUEVO: VENTAS (pantalla mesero)
   Todos los pedidos ya cobrados (pagado == true), sin
   importar su estado de cocina. El ordenamiento por fecha se
   hace en el cliente (no con orderBy) para no depender de que
   exista un índice compuesto en Firestore: así las ventas se
   reflejan de inmediato apenas se cobra, sin configuración
   adicional en la consola de Firebase.
--------------------------------------------------------- */
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
   ACCIONES DE COCINA
--------------------------------------------------------- */
export function marcarPreparado(id) {
  return updateDoc(doc(db, PEDIDOS_COL, id), { estado: "listo" });
}

export function marcarEntregado(id) {
  return updateDoc(doc(db, PEDIDOS_COL, id), { estado: "entregado" });
}

export function eliminarPedido(id) {
  return deleteDoc(doc(db, PEDIDOS_COL, id));
}

/* ---------------------------------------------------------
   NUEVO: COBRAR (pantalla mesero)
   Marca en un solo lote todos los pedidos de una mesa o
   domicilio como pagados. No los borra: quedan disponibles
   para "Ventas del día" y para el total de ENTREGADOS en
   cocina. También se fuerza estado: "entregado" al cobrar,
   para que el pedido aparezca de inmediato en ENTREGADOS
   (tanto en cocina como en el historial del mesero) sin
   depender de que alguien lo haya marcado manualmente antes.
--------------------------------------------------------- */
export async function cobrarPedidos(ids, metodoPago) {
  if (!ids || ids.length === 0) return;
  const batch = writeBatch(db);
  ids.forEach((id) => {
    batch.update(doc(db, PEDIDOS_COL, id), {
      pagado: true,
      metodoPago,
      estado: "entregado",
      horaPago: serverTimestamp(),
    });
  });
  return batch.commit();
}
/* ---------------------------------------------------------
   NUEVO: EL MESERO ESCUCHA LOS PEDIDOS QUE YA ESTÁN LISTOS
   (Para que sepa que ya puede cobrar)
--------------------------------------------------------- */
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
   PUENTE PARA script.js (que NO es un módulo)
   script.js solo llama a window.PedidosCocina.enviarPedido(...),
   sin importar ni conocer Firebase.
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
