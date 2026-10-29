// Medición anónima de cómo se usa la página (sin nombres, teléfonos, correos ni dirección IP).
// La página envía de a grupos lo que pasa: visitas, productos vistos, búsquedas, pedidos, preguntas al ayudante.
// Cada visitante es solo un número al azar guardado en su navegador; si pide no ser medido, no se envía nada.
import { getStore } from "@netlify/blobs";
import { ambiente, ahoraChile, azar, json, leerJson, limpiarTexto, idValido, alertar, contar } from "../lib/comun.mjs";

const HEX = /^[a-f0-9]{8,32}$/;
const FUENTES = new Set(["google", "instagram", "facebook", "whatsapp", "directo", "interno", "otro"]);
const PAGINAS = new Set(["inicio", "privacidad", "terminos", "otra"]);
const LUGARES = new Set(["cabecera", "portada", "ficha", "pedido", "regalo", "encargo", "visita", "aviso", "ayudante", "tallas", "mayor", "vacio", "sugerencia", "faq"]);
const CANALES = new Set(["wsp_tienda", "wsp_coordinacion", "llamar", "copiar", "correo"]);
const ent = (x, min, max) => Number.isFinite(+x) ? Math.max(min, Math.min(max, Math.round(+x))) : min;
const corto = s => limpiarTexto(s, 24).replace(/ /g, "_");

// Deja pasar solo lo que esperamos de cada evento. Todo lo demás se descarta.
function validar(x) {
  if (!x || typeof x !== "object") return null;
  const e = String(x.e || "");
  switch (e) {
    case "vista": return { e, pag: PAGINAS.has(x.pag) ? x.pag : "otra" };
    case "producto": return idValido(x.id) ? { e, id: x.id } : null;
    case "agregar": return idValido(x.id) ? { e, id: x.id, n: ent(x.n, 1, 20) } : null;
    case "pedido_abrir": case "pedido_recuperar": case "ayudante_abrir": case "mayor": case "tallas":
      return { e };
    case "pedido_enviar":
      return { e, prendas: ent(x.prendas, 1, 60), unidades: ent(x.unidades, 1, 1200), envio: !!x.envio, regalo: !!x.regalo, descuento: !!x.descuento };
    case "buscar": {
      const q = limpiarTexto(x.q, 40);
      return q.length >= 2 ? { e, q, res: ent(x.res, 0, 100), lugar: ["portada", "catalogo", "ayudante"].includes(x.lugar) ? x.lugar : "catalogo" } : null;
    }
    case "regalo_enviar": return { e, n: ent(x.n, 0, 60) };
    case "registro": return { e, ok: !!x.ok };
    case "ayudante_tema": return { e, tema: corto(x.tema) || "otro" };
    case "ayudante_derivar": return CANALES.has(x.canal) ? { e, canal: x.canal, tema: corto(x.tema) || "otro" } : null;
    case "faq": return idValido(x.id) ? { e, id: x.id } : null;
    case "wsp": return { e, lugar: LUGARES.has(x.lugar) ? x.lugar : "otro" };
    case "error_js": return { e, m: limpiarTexto(x.m, 60) || "error" };
    case "inyeccion": return { e, campo: corto(x.campo) || "otro" };
    default: return null;
  }
}

export default async (req) => {
  if (req.method !== "POST") return json({ error: "método no permitido" }, 405);
  let d;
  try { d = await leerJson(req, 16000); } catch (e) { return json({ ok: false }, 400); }
  if (!d || !HEX.test(d.v || "") || !HEX.test(d.s || "") || !Array.isArray(d.ev)) return json({ ok: false }, 400);
  const eventos = d.ev.slice(0, 40).map(validar).filter(Boolean);
  if (!eventos.length) return json({ ok: true, guardados: 0 });
  const amb = ambiente(req);
  const { fecha, hora } = ahoraChile();
  const lote = {
    v: d.v.slice(0, 16), s: d.s.slice(0, 16), nv: !!d.nv, r: !!d.r,
    d: d.d === "movil" ? "movil" : "pc",
    o: FUENTES.has(d.o) ? d.o : "otro",
    h: hora.slice(0, 2), ev: eventos
  };
  const store = getStore("eventos");
  await store.setJSON(`e/${amb}/${fecha}/${hora.replace(/:/g, "")}-${azar(4)}`, lote);

  // Textos que parecen intentos de ataque (código o comandos en el buscador o en el ayudante).
  if (eventos.some(x => x.e === "inyeccion")) {
    const vigia = getStore("vigia");
    await vigia.setJSON(`inyeccion/${amb}/${fecha}/${Date.now()}-${azar(3)}`, { campo: eventos.find(x => x.e === "inyeccion").campo });
    const n = await contar(vigia, `inyeccion/${amb}/${fecha}/`);
    if (n === 5 || n === 50) await alertar(vigia, req, "intentos_de_codigo", `Hoy se escribieron ${n} textos con forma de código o comando en el buscador o el ayudante (${amb}). La página los bloquea; revisa si se repite.`);
  }
  return json({ ok: true, guardados: eventos.length });
};

export const config = { path: "/api/evento" };
