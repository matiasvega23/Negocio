// Datos del panel privado de la familia (/panel.html): cómo se usa la página, sin datos personales.
// Pide una clave que se guarda en Netlify (Project configuration > Environment variables > CLAVE_PANEL).
// La clave la elige la familia; no está en el código ni en el repositorio.
import { getStore } from "@netlify/blobs";
import { ambiente, json, contar, ahoraChile } from "../lib/comun.mjs";
import { resumenPeriodo, combinar, presentar } from "../lib/resumen.mjs";

let fallidos = 0, ventana = 0;
function igual(a, b) {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  let d = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) d |= (x[i] || 0) ^ (y[i] || 0);
  return d === 0;
}

export default async (req) => {
  const clave = (globalThis.Netlify && Netlify.env.get("CLAVE_PANEL")) || process.env.CLAVE_PANEL || "";
  if (clave.length < 10) return json({ error: "El panel todavía no tiene clave. Créala en Netlify: Project configuration > Environment variables > CLAVE_PANEL (mínimo 10 caracteres)." }, 503);
  const h = Math.floor(Date.now() / 3600e3);
  if (h !== ventana) { ventana = h; fallidos = 0; }
  if (fallidos > 20) return json({ error: "Demasiados intentos. Prueba en una hora." }, 429);
  if (!igual(req.headers.get("x-clave") || "", clave)) { fallidos++; return json({ error: "Clave incorrecta." }, 401); }

  const url = new URL(req.url);
  const dias = Math.max(1, Math.min(60, parseInt(url.searchParams.get("dias") || "7", 10) || 7));
  const pedido = url.searchParams.get("amb");
  const amb = ["prod", "prueba"].includes(pedido) ? pedido : ambiente(req);
  const store = getStore("eventos");
  const porDia = await resumenPeriodo(store, amb, dias);
  const vigia = getStore("vigia");
  const { fecha } = ahoraChile();
  const seguridad = {
    sondeos_hoy: await contar(vigia, `sondeo/${amb}/${fecha}/`),
    avisos_csp_hoy: await contar(vigia, `csp/${amb}/${fecha}/`),
    alertas_hoy: await contar(vigia, `alertas/${amb}/${fecha}/`)
  };
  return json({
    ambiente: amb, dias, total: presentar(combinar(porDia)),
    por_dia: porDia.map(d => ({ fecha: d.fecha, visitas: d.sesiones, visitantes: d.visitantes, pedidos: d.pedidos.enviados, registros: d.registros.ok })),
    seguridad
  });
};

export const config = { path: "/api/panel" };
