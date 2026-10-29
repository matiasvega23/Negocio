/* Angie's Secret: medición anónima de cómo se usa la página.
   - Cada navegador recibe un número al azar (no es tu nombre, teléfono ni correo).
   - Se cuentan visitas, de dónde llegan (Google, Instagram…), productos vistos, búsquedas, pedidos enviados,
     preguntas al ayudante y errores de la página. Nunca se envía lo que escribes en el pedido ni en el registro.
   - Si el navegador pide no ser rastreado (Global Privacy Control o "Do Not Track"), o la persona lo desactiva en
     el aviso de privacidad, no se mide nada. */
(() => {
  const CLAVE_NO = "angie-no-medir";
  const leer = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const noRastrear = navigator.globalPrivacyControl === true || navigator.doNotTrack === "1" || window.doNotTrack === "1";
  const desactivada = () => leer(CLAVE_NO) === "1";

  // Interruptor en el aviso de privacidad (si existe en la página).
  const caja = document.getElementById("medicion-estado");
  if (caja) {
    const pintar = () => {
      const off = desactivada() || noRastrear;
      caja.innerHTML = noRastrear
        ? "<p><strong>En este navegador la medición está apagada</strong> porque tu navegador pide no ser rastreado.</p>"
        : `<p><strong>En este navegador la medición está ${off ? "apagada" : "encendida"}.</strong></p><button type="button" class="boton boton-borde boton-chico" id="medicion-cambiar">${off ? "Volver a permitir la medición" : "No medir mis visitas en este navegador"}</button>`;
      const b = document.getElementById("medicion-cambiar");
      if (b) b.addEventListener("click", () => {
        try { desactivada() ? localStorage.removeItem(CLAVE_NO) : (localStorage.setItem(CLAVE_NO, "1"), localStorage.removeItem("angie-v")); } catch (e) {}
        pintar();
      });
    };
    pintar();
  }
  if (noRastrear || desactivada()) return;

  const azar = n => [...crypto.getRandomValues(new Uint8Array(n))].map(x => x.toString(16).padStart(2, "0")).join("");
  let v = leer("angie-v"), nv = false;
  if (!v) { v = azar(8); nv = true; try { localStorage.setItem("angie-v", v); } catch (e) {} }
  let s = null;
  try { s = sessionStorage.getItem("angie-s"); if (!s) { s = azar(8); sessionStorage.setItem("angie-s", s); } } catch (e) { s = azar(8); }
  const d = window.matchMedia("(pointer: coarse)").matches || /Mobi|Android|iPhone/i.test(navigator.userAgent) ? "movil" : "pc";
  const fuente = (() => {
    let h = "";
    try { h = document.referrer ? new URL(document.referrer).hostname : ""; } catch (e) {}
    const utm = new URLSearchParams(location.search).get("utm_source") || "";
    if (h === location.hostname) return "interno";
    const x = (utm || h).toLowerCase();
    if (!x) return "directo";
    if (x.includes("google")) return "google";
    if (x.includes("instagram")) return "instagram";
    if (x.includes("facebook") || x === "fb" || x.startsWith("l.facebook") || x.startsWith("m.facebook")) return "facebook";
    if (x.includes("whatsapp") || x.includes("wa.me")) return "whatsapp";
    return "otro";
  })();
  const registrada = () => { try { const r = JSON.parse(leer("angie-registro") || "null"); return !!(r && r.codigo); } catch (e) { return false; } };
  const cola = [];
  function enviar() {
    if (!cola.length || desactivada()) { cola.length = 0; return; }
    const cuerpo = JSON.stringify({ v, s, nv, r: registrada(), d, o: fuente, ev: cola.splice(0, 40) });
    nv = false;
    let ok = false;
    try { ok = navigator.sendBeacon && navigator.sendBeacon("/api/evento", new Blob([cuerpo], { type: "application/json" })); } catch (e) {}
    if (!ok) { try { fetch("/api/evento", { method: "POST", body: cuerpo, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {}); } catch (e) {} }
  }
  window.__medir = (e, datos) => { cola.push({ e, ...(datos || {}) }); if (cola.length >= 20) enviar(); };
  (window.__colaMedir || []).splice(0).forEach(([e, datos]) => window.__medir(e, datos));
  setInterval(enviar, 15000);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") enviar(); });
  window.addEventListener("pagehide", enviar);
  // Errores de la página: ayudan a encontrar problemas de la interfaz antes de que las clientas los reclamen.
  let errores = 0;
  window.addEventListener("error", ev => { if (ev.message && errores++ < 5) window.__medir("error_js", { m: ev.message }); });
  window.addEventListener("unhandledrejection", ev => { if (errores++ < 5) window.__medir("error_js", { m: String((ev.reason && ev.reason.message) || ev.reason || "promesa") }); });
  const p = location.pathname;
  window.__medir("vista", { pag: p.includes("privacidad") ? "privacidad" : p.includes("terminos") ? "terminos" : p === "/" || p.endsWith("index.html") ? "inicio" : "otra" });
})();
