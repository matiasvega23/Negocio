// Código del descuento de bienvenida.
// Al registrarse, la página pide aquí un código (AS-XXXX-XXXX) que viaja con el registro al formulario de Netlify
// y queda en el Excel. Al hacer el pedido, la página verifica el código: así el mensaje de WhatsApp pide el
// descuento si y solo si la persona se registró. Aquí se guarda solo el código, la fecha y si ya se usó:
// ningún nombre, teléfono ni correo.
import { getStore } from "@netlify/blobs";
import { ambiente, ahoraChile, unMesDespues, json, leerJson, alertar, contar } from "../lib/comun.mjs";

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O, 0, I ni 1 para que no se confundan
const ULTIMO_REGISTRO = "2027-01-31";                 // bases: registro hasta el 31 de enero de 2027
const FORMATO = /^AS-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/;

function nuevoCodigo() {
  const b = crypto.getRandomValues(new Uint8Array(8));
  const s = [...b].map(x => ALFABETO[x % 32]).join("");
  return `AS-${s.slice(0, 4)}-${s.slice(4)}`;
}

function estadoDe(reg, hoy) {
  if (!reg) return { existe: false, vigente: false };
  const vence = unMesDespues(reg.fecha);
  const vencido = hoy > vence;
  return { existe: true, fecha: reg.fecha, vence, usado: reg.usado || null, vigente: !reg.usado && !vencido };
}

export default async (req) => {
  const amb = ambiente(req);
  const store = getStore({ name: "bienvenida", consistency: "strong" });
  const vigia = getStore("vigia");
  const { fecha: hoy, hh } = ahoraChile();
  const url = new URL(req.url);

  if (req.method === "GET") {
    const c = (url.searchParams.get("c") || "").toUpperCase();
    if (!FORMATO.test(c)) return json({ existe: false, vigente: false });
    const reg = await store.get(`c/${amb}/${c}`, { type: "json" });
    return json(estadoDe(reg, hoy));
  }
  if (req.method !== "POST") return json({ error: "método no permitido" }, 405);

  let datos;
  try { datos = await leerJson(req, 2000); } catch (e) { return json({ error: "datos inválidos" }, 400); }
  const accion = datos.accion;

  if (accion === "nuevo") {
    if (hoy > ULTIMO_REGISTRO) return json({ error: "La promoción terminó el 31 de enero de 2027." }, 410);
    let codigo, intentos = 0;
    do { codigo = nuevoCodigo(); intentos++; } while (intentos < 5 && await store.get(`c/${amb}/${codigo}`));
    await store.setJSON(`c/${amb}/${codigo}`, { fecha: hoy, usado: null });
    await store.setJSON(`altas/${amb}/${hoy}/${hh}-${codigo}`, { h: hh });
    // Muchos registros en un día no es normal para la tienda: puede ser un robot intentando abusar del descuento.
    const delDia = await contar(store, `altas/${amb}/${hoy}/`);
    if (delDia === 40 || delDia === 150) await alertar(vigia, req, "registros_masivos", `Se crearon ${delDia} códigos de bienvenida hoy (${amb}). Revisa en Netlify > Forms si son registros reales o un robot.`);
    return json({ codigo, fecha: hoy, vence: unMesDespues(hoy) });
  }

  const c = String(datos.codigo || "").toUpperCase();
  if (!FORMATO.test(c)) return json({ existe: false, vigente: false }, 400);
  const clave = `c/${amb}/${c}`;
  const reg = await store.get(clave, { type: "json" });
  if (!reg) return json({ existe: false, vigente: false }, 404);

  if (accion === "usar") {
    // Se marca al enviar el primer pedido que pide el descuento.
    if (!reg.usado) { reg.usado = hoy; reg.usadoT = Date.now(); await store.setJSON(clave, reg); }
    return json(estadoDe(reg, hoy));
  }
  if (accion === "liberar") {
    // Si la persona no alcanzó a enviar el pedido y lo recupera dentro de 24 horas, el descuento vuelve.
    if (reg.usado && reg.usadoT && Date.now() - reg.usadoT < 864e5) { reg.usado = null; delete reg.usadoT; await store.setJSON(clave, reg); }
    return json(estadoDe(reg, hoy));
  }
  return json({ error: "acción desconocida" }, 400);
};

export const config = { path: "/api/bienvenida" };
