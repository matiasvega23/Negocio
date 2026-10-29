// Funciones compartidas por las funciones del servidor de Angie's Secret.
// Nada de esto guarda datos personales: solo códigos, contadores y eventos anónimos.

// Ambiente según la dirección: el sitio real, la rama de prueba, una vista previa o el computador.
export function ambiente(req) {
  const h = new URL(req.url).hostname;
  if (h.startsWith("prueba--")) return "prueba";
  if (h.startsWith("deploy-preview-")) return "preview";
  if (h === "localhost" || h === "127.0.0.1") return "local";
  return "prod";
}

// Fecha y hora de Santiago de Chile.
export function ahoraChile(fecha = new Date()) {
  const p = {};
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" })
    .formatToParts(fecha).forEach(x => { p[x.type] = x.value; });
  return { fecha: `${p.year}-${p.month}-${p.day}`, hora: `${p.hour}:${p.minute}:${p.second}`, hh: p.hour };
}

export function sumarDias(fecha, n) {
  const d = new Date(fecha + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// 1 mes desde el registro, igual que en la página (si el día no existe, el último del mes).
export function unMesDespues(fecha) {
  const [a, m, d] = fecha.split("-").map(Number);
  const a2 = m === 12 ? a + 1 : a, m2 = m === 12 ? 1 : m + 1;
  const ultimo = new Date(Date.UTC(a2, m2, 0)).getUTCDate();
  return `${a2}-${String(m2).padStart(2, "0")}-${String(Math.min(d, ultimo)).padStart(2, "0")}`;
}

export function azar(n = 6) {
  const b = crypto.getRandomValues(new Uint8Array(n));
  return [...b].map(x => x.toString(16).padStart(2, "0")).join("");
}

export function json(datos, estado = 200, extra = {}) {
  return new Response(JSON.stringify(datos), {
    status: estado,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex", ...extra }
  });
}

// Lee el cuerpo como JSON sin pasar de un tamaño máximo (evita que llenen el servidor).
export async function leerJson(req, maximo = 16000) {
  const texto = await req.text();
  if (texto.length > maximo) throw new Error("muy grande");
  return texto ? JSON.parse(texto) : {};
}

// Solo letras y espacios, en minúscula, sin tildes: así una búsqueda nunca guarda números, correos ni teléfonos.
export function limpiarTexto(s, max = 40) {
  // Primero se descarta entera cualquier palabra con números, @, puntos o barras (teléfonos, correos, RUT, enlaces).
  const palabras = String(s || "").split(/\s+/).filter(w => w && !/[\d@./\\:]/.test(w));
  return palabras.join(" ").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zñ ]+/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

export const idValido = s => typeof s === "string" && /^[a-z0-9-]{1,48}$/.test(s);

// Avisa por correo: envía un formulario "alerta" al propio sitio y Netlify lo reenvía al correo configurado.
// Para no llenar la bandeja, cada tipo de alerta se avisa como máximo una vez cada 6 horas.
export async function alertar(store, req, tipo, detalle) {
  const amb = ambiente(req);
  const clave = `ultima-alerta/${amb}/${tipo}`;
  try {
    const ultima = await store.get(clave, { type: "json", consistency: "strong" });
    if (ultima && Date.now() - ultima.t < 6 * 3600e3) return false;
    await store.setJSON(clave, { t: Date.now() });
    const { fecha, hora } = ahoraChile();
    const origen = new URL(req.url).origin;
    await fetch(origen + "/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ "form-name": "alerta", subject: `ALERTA de seguridad en la página - Angie's Secret (${tipo}${amb === "prod" ? "" : ", " + amb})`, tipo, detalle: String(detalle).slice(0, 900), ambiente: amb, cuando: `${fecha} ${hora} (hora de Chile)`, sitio: origen }).toString()
    });
    await store.setJSON(`alertas/${amb}/${fecha}/${Date.now()}-${azar(3)}`, { tipo, detalle: String(detalle).slice(0, 300), hora });
    return true;
  } catch (e) {
    return false;
  }
}

// Cuenta cuántas claves hay bajo un prefijo (para contadores del día).
export async function contar(store, prefijo) {
  let n = 0;
  for await (const pagina of store.list({ prefix: prefijo, paginate: true })) n += pagina.blobs.length;
  return n;
}
