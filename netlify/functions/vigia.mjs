// Vigía de seguridad de la página.
// 1) Recibe los avisos del navegador cuando la política de seguridad (CSP) bloquea algo: si alguien intenta
//    meter código de otro sitio en la página, el navegador lo bloquea y lo informa aquí.
// 2) Responde a las direcciones que usan los robots para buscar puntos débiles (por ejemplo /wp-login.php o /.env):
//    la página no tiene nada de eso, así que solo se cuenta el intento y se responde "no existe".
// No guarda direcciones IP ni datos personales: solo el tipo de intento y la hora.
import { getStore } from "@netlify/blobs";
import { ambiente, ahoraChile, azar, json, alertar, contar } from "../lib/comun.mjs";

const RUIDO = /^(chrome|moz|safari|ms-browser|webkit-masked)-extension|^about|^data|^blob/i;

let enMinuto = 0, minuto = 0, sondeosInstancia = 0;
function permitirEscritura() {
  const m = Math.floor(Date.now() / 60000);
  if (m !== minuto) { minuto = m; enMinuto = 0; }
  return ++enMinuto <= 30; // si llegan cientos por minuto, se cuentan sin guardar cada uno
}
const dominio = u => { try { return new URL(u).hostname; } catch (e) { return String(u || "").slice(0, 40); } };

async function informeCsp(req, store) {
  const amb = ambiente(req);
  let cuerpo;
  try { const t = await req.text(); if (t.length > 20000) return; cuerpo = JSON.parse(t); } catch (e) { return; }
  const lista = Array.isArray(cuerpo) ? cuerpo.filter(r => r && r.type === "csp-violation").map(r => r.body || {}) : [cuerpo["csp-report"] || {}];
  const propio = new URL(req.url).hostname;
  for (const r of lista.slice(0, 10)) {
    const bloq = r["blocked-uri"] || r.blockedURL || "";
    const dir = String(r["effective-directive"] || r.effectiveDirective || r["violated-directive"] || "").split(" ")[0];
    const fuente = r["source-file"] || r.sourceFile || "";
    if (RUIDO.test(bloq) || RUIDO.test(fuente)) continue; // extensiones del navegador de la persona, no es la página
    const externo = /^https?:/i.test(bloq) && dominio(bloq) !== propio;
    const alta = dir.startsWith("script") && (externo || bloq === "inline" || bloq === "eval");
    const { fecha, hora } = ahoraChile();
    if (permitirEscritura()) await store.setJSON(`csp/${amb}/${fecha}/${hora.replace(/:/g, "")}-${azar(3)}`, { dir, bloq: externo ? dominio(bloq) : String(bloq).slice(0, 20), alta });
    if (alta && externo) {
      await alertar(store, req, "codigo_externo_bloqueado", `El navegador de una visita bloqueó un intento de cargar código desde ${dominio(bloq)} en la página (${amb}). Si se repite, puede ser una extensión maliciosa en el equipo de una clienta o un intento de inyectar código: revisa que el sitio publicado sea igual al del repositorio.`);
    }
  }
}

async function sondeo(req, store) {
  const amb = ambiente(req);
  const ruta = new URL(req.url).pathname.slice(0, 60);
  const { fecha, hora } = ahoraChile();
  if (permitirEscritura()) await store.setJSON(`sondeo/${amb}/${fecha}/${hora.replace(/:/g, "")}-${azar(3)}`, { ruta });
  sondeosInstancia++;
  if (sondeosInstancia % 50 === 0) {
    const n = await contar(store, `sondeo/${amb}/${fecha}/`);
    if (n >= 300) await alertar(store, req, "muchos_sondeos", `Hoy hubo más de ${n} intentos de robots buscando puntos débiles (${amb}). La página no tiene esas puertas, pero un volumen así gasta créditos de Netlify: revisa Usage y, si sigue, conviene bloquear al robot.`);
  }
}

export default async (req) => {
  const store = getStore("vigia");
  const ruta = new URL(req.url).pathname;
  if (ruta === "/api/vigia") {
    if (req.method === "POST") await informeCsp(req, store);
    return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
  }
  await sondeo(req, store);
  return new Response("No existe.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
};

// Netlify lee esta lista tal cual (debe estar escrita aquí, sin variables): /api/vigia y las direcciones que prueban los robots.
export const config = {
  path: [
    "/api/vigia",
    "/wp-login.php", "/wp-admin", "/wp-admin/*", "/wp-content/*", "/wp-includes/*", "/wp-config.php", "/xmlrpc.php",
    "/.env", "/.env.*", "/.git/*", "/.aws/*", "/.DS_Store", "/phpmyadmin", "/phpmyadmin/*", "/admin", "/admin/*",
    "/administrator/*", "/config.php", "/server-status", "/cgi-bin/*", "/vendor/*", "/backup.zip", "/shell.php"
  ]
};
