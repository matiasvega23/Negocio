// Estado público de la página, para la vigilancia diaria.
// Entrega huellas (resúmenes SHA-256) de los archivos publicados para compararlas con las del repositorio de GitHub:
// si alguien cambiara la página sin pasar por el repositorio, las huellas no coincidirían.
// También entrega contadores de seguridad del día. No contiene datos personales ni cifras de ventas.
import { getStore } from "@netlify/blobs";
import { ambiente, ahoraChile, json, contar, periodoCobro } from "../lib/comun.mjs";

const ARCHIVOS = ["index.html", "js/app.js", "js/datos.js", "js/efectos.js", "js/ayudante.js", "js/medicion.js", "js/panel.js", "css/estilos.css", "privacidad.html", "terminos.html", "panel.html"];

// Netlify reescribe al publicar las etiquetas <form> (formularios) y los enlaces que terminan en .html. Por eso las
// páginas enlazan sin ".html" (/privacidad, /terminos) y la huella de los .html se calcula sin el contenido de <form ...>.
// Todo lo demás (textos, enlaces, scripts, estilos) debe ser idéntico. herramientas/huellas.py calcula lo mismo.
const normalizar = t => t.replace(/<form\b[^>]*>/gi, "<form>");
async function huella(texto) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

export default async (req, context) => {
  const amb = ambiente(req);
  const store = getStore("vigia");
  // Se guarda 10 minutos para que nadie pueda gastar créditos llamándola muchas veces; cada publicación nueva la renueva.
  const publicacion = (context && context.deploy && context.deploy.id) || "x";
  const cache = await store.get(`estado-cache/${amb}`, { type: "json" });
  if (cache && cache.publicacion === publicacion && Date.now() - cache.t < 10 * 60e3) return json(cache.datos, 200, { "Access-Control-Allow-Origin": "*" });

  const origen = new URL(req.url).origin;
  const { fecha, hora } = ahoraChile();
  const archivos = {}, cabeceras = {};
  let version = null;
  for (const a of ARCHIVOS) {
    try {
      const r = await fetch(`${origen}/${a}`, { headers: { "Cache-Control": "no-cache" } });
      if (!r.ok) { archivos[a] = `error ${r.status}`; continue; }
      const t = await r.text();
      archivos[a] = await huella(a.endsWith(".html") ? normalizar(t) : t);
      if (a === "index.html") {
        const m = t.match(/versión ([\d.]+)/i); version = m ? m[1] : null;
        const csp = r.headers.get("content-security-policy") || "";
        cabeceras.csp = csp.includes("script-src 'self'");
        cabeceras.csp_avisa = csp.includes("report-uri");
        cabeceras.anti_marcos = (r.headers.get("x-frame-options") || "").toUpperCase() === "DENY";
        cabeceras.nosniff = (r.headers.get("x-content-type-options") || "") === "nosniff";
        cabeceras.scripts_externos = [...t.matchAll(/<script[^>]+src="(https?:)?\/\//gi)].length;
      }
    } catch (e) { archivos[a] = "error"; }
  }
  const bienvenida = getStore("bienvenida");
  const [sondeos, csp, inyeccion, alertas, altas] = await Promise.all([
    contar(store, `sondeo/${amb}/${fecha}/`), contar(store, `csp/${amb}/${fecha}/`),
    contar(store, `inyeccion/${amb}/${fecha}/`), contar(store, `alertas/${amb}/${fecha}/`),
    contar(bienvenida, `altas/${amb}/${fecha}/`)
  ]);
  // Gasto del ayudante con IA (créditos estimados de Netlify en el período de cobro que va del 26 al 25).
  const ia = getStore("ia"), per = periodoCobro(fecha);
  const [iaMes, iaDia] = await Promise.all([ia.get(`periodo/${per}`, { type: "json" }), ia.get(`dia/${fecha}`, { type: "json" })]);
  const topeMes = Number(process.env.IA_TOPE_CREDITOS_MES || 20);
  const datos = {
    ok: true, ambiente: amb, revisado: `${fecha} ${hora}`, publicacion, version, archivos, cabeceras,
    ia: { activa: (process.env.IA_AYUDANTE || "").toLowerCase() !== "no", periodo_desde: `${per}-26`, creditos_periodo: iaMes ? Math.round(iaMes.creditos * 100) / 100 : 0, tope_periodo: topeMes, mensajes_periodo: iaMes ? iaMes.mensajes : 0, respuestas_filtradas: iaMes ? iaMes.filtradas || 0 : 0, errores_hoy: iaDia ? iaDia.errores || 0 : 0, respuestas_guardadas_hoy: iaDia ? iaDia.memoria || 0 : 0, limite_por_persona_dia: Number(process.env.IA_TOPE_MENSAJES_VISITANTE || 5) },
    hoy: { sondeos_de_robots: sondeos, avisos_csp: csp, textos_con_codigo: inyeccion, alertas_enviadas: alertas, registros_del_dia: altas >= 40 ? "alto" : "normal" }
  };
  await store.setJSON(`estado-cache/${amb}`, { t: Date.now(), publicacion, datos });
  return json(datos, 200, { "Access-Control-Allow-Origin": "*" });
};

export const config = { path: "/api/estado" };
