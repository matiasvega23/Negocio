// Estado público de la página, para la vigilancia diaria.
// Entrega huellas (resúmenes SHA-256) de los archivos publicados para compararlas con las del repositorio de GitHub:
// si alguien cambiara la página sin pasar por el repositorio, las huellas no coincidirían.
// También entrega contadores de seguridad del día. No contiene datos personales ni cifras de ventas.
import { getStore } from "@netlify/blobs";
import { ambiente, ahoraChile, json, contar } from "../lib/comun.mjs";

const ARCHIVOS = ["index.html", "js/app.js", "js/datos.js", "js/efectos.js", "css/estilos.css", "privacidad.html", "terminos.html", "panel.html"];

// Netlify reescribe al publicar las etiquetas <form> (formularios) y los enlaces a páginas .html (direcciones "bonitas").
// Por eso, en los .html la huella se calcula sin el contenido de <form ...> ni el destino de href. El resto
// (textos, scripts, estilos) debe ser idéntico. herramientas/huellas.py calcula lo mismo desde el repositorio.
const normalizar = t => t.replace(/<form\b[^>]*>/gi, "<form>").replace(/\shref=("[^"]*"|'[^']*')/gi, " href");
async function huella(texto) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("").slice(0, 16);
}

export default async (req) => {
  const amb = ambiente(req);
  const store = getStore("vigia");
  const cache = await store.get(`estado-cache/${amb}`, { type: "json" });
  if (cache && Date.now() - cache.t < 10 * 60e3) return json(cache.datos, 200, { "Access-Control-Allow-Origin": "*" });

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
  const datos = {
    ok: true, ambiente: amb, revisado: `${fecha} ${hora}`, version, archivos, cabeceras,
    hoy: { sondeos_de_robots: sondeos, avisos_csp: csp, textos_con_codigo: inyeccion, alertas_enviadas: alertas, registros_del_dia: altas >= 40 ? "alto" : "normal" }
  };
  await store.setJSON(`estado-cache/${amb}`, { t: Date.now(), datos });
  return json(datos, 200, { "Access-Control-Allow-Origin": "*" });
};

export const config = { path: "/api/estado" };
