/* Panel privado de Angie's Secret: lee /api/panel con la clave (guardada solo en este navegador) y /api/estado. */
(() => {
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const NOMBRES = { google: "Google", instagram: "Instagram", facebook: "Facebook", whatsapp: "WhatsApp", directo: "Directo o enlace guardado", interno: "Desde otra página del sitio", otro: "Otros sitios", movil: "Celular", pc: "Computador" };
  try { $("#clave").value = localStorage.getItem("angie-panel-clave") || ""; } catch (e) {}
  const tarjeta = (n, t) => `<div class="tarjeta"><b>${esc(n)}</b><span>${esc(t)}</span></div>`;
  function tabla(titulo, pares, nombres = {}) {
    const lista = Array.isArray(pares) ? pares : Object.entries(pares || {}).sort((a, b) => b[1] - a[1]);
    const max = Math.max(1, ...lista.map(x => x[1]));
    return `<div class="tabla"><h3>${esc(titulo)}</h3>${lista.length ? `<table>${lista.map(([k, v]) => `<tr><td>${esc(nombres[k] || k)}<span class="barra" style="width:${Math.round((v / max) * 100)}%"></span></td><td>${esc(v)}</td></tr>`).join("")}</table>` : `<p class="letra-chica">Sin datos todavía.</p>`}</div>`;
  }
  async function cargar() {
    const clave = $("#clave").value.trim();
    const r = await fetch(`/api/panel?dias=${$("#dias").value}&amb=${$("#amb").value}`, { headers: { "x-clave": clave }, cache: "no-store" });
    const d = await r.json().catch(() => ({ error: "No se pudo leer la respuesta." }));
    if (!r.ok) { $("#resultado").innerHTML = `<p class="mensaje-panel">${esc(d.error || "Error")}</p>`; return; }
    try { localStorage.setItem("angie-panel-clave", clave); } catch (e) {}
    const t = d.total;
    $("#resultado").innerHTML = `
      <div class="tarjetas">
        ${tarjeta(t.visitas, "visitas")}${tarjeta(t.visitantes, "personas distintas")}${tarjeta(t.visitantes_nuevos, "visitantes nuevos")}
        ${tarjeta(t.pedidos_enviados, "pedidos enviados a WhatsApp")}${tarjeta(t.conversion_pct + "%", "de las visitas envía pedido")}
        ${tarjeta(t.registros.ok, "registros nuevos")}${tarjeta(t.regalos_enviados, "regalos armados")}${tarjeta(t.ayudante.abiertos, "conversaciones con el ayudante")}
      </div>
      <h2>Camino de compra</h2>
      <div class="tablas">${tabla("De la visita al pedido", [["Visitas", t.embudo.visitas], ["Vieron un producto", t.embudo.vieron_un_producto], ["Agregaron al pedido", t.embudo.agregaron_al_pedido], ["Enviaron el pedido", t.embudo.enviaron_pedido]])}
      ${tabla("Pedidos", [["Con envío", t.pedidos.con_envio], ["Para regalo", t.pedidos.con_regalo], ["Pidiendo descuento", t.pedidos.con_descuento], ["Unidades pedidas", t.pedidos.unidades], ["Recuperados", t.pedidos.recuperados]])}</div>
      <h2>Quiénes y desde dónde</h2>
      <div class="tablas">${tabla("De dónde llegan", t.fuentes, NOMBRES)}${tabla("Equipo", t.dispositivos, NOMBRES)}${tabla("Hora de la visita", Object.entries(t.horas || {}).sort(), {})}${tabla("Visitas de personas registradas", [["Registradas", t.visitas_de_registradas], ["Sin registro", Math.max(0, t.visitas - t.visitas_de_registradas)]])}</div>
      <h2>Productos y búsquedas</h2>
      <div class="tablas">${tabla("Más vistos", t.productos_mas_vistos)}${tabla("Más agregados al pedido (unidades)", t.productos_mas_agregados)}${tabla("Lo que más buscan", t.busquedas)}${tabla(`Buscan y no encuentran${t.busquedas_sin_resultado_unicas ? ` (+${t.busquedas_sin_resultado_unicas} búsquedas únicas)` : ""}`, t.busquedas_sin_resultado)}</div>
      <h2>Ayuda y problemas</h2>
      <div class="tablas">${tabla("Temas del ayudante", t.ayudante.temas)}${tabla("Derivadas a una persona o acción", t.ayudante.derivaciones, { wsp_tienda: "WhatsApp de la tienda", wsp_coordinacion: "WhatsApp de consultas", llamar: "Llamada", copiar: "Copiar pedido" })}${tabla("Preguntas frecuentes abiertas", t.preguntas_frecuentes)}${tabla("Botones de WhatsApp tocados", t.clics_whatsapp)}${tabla("Errores de la página", t.errores_de_la_pagina)}${tabla("Otros", [["Guía de tallas enviada", t.guia_tallas], ["Consultas por mayor", t.consultas_por_mayor], ["Textos con forma de código (bloqueados)", t.textos_con_codigo]])}</div>
      <h2>Por día</h2>
      <div class="tablas">${tabla("Visitas por día", d.por_dia.map(x => [x.fecha, x.visitas]))}${tabla("Pedidos por día", d.por_dia.map(x => [x.fecha, x.pedidos]))}</div>`;
  }
  async function seguridad() {
    try {
      const d = await (await fetch("/api/estado", { cache: "no-store" })).json();
      const c = d.cabeceras || {}, h = d.hoy || {};
      const ok = v => v ? '<span class="alerta-ok">bien</span>' : '<span class="alerta-mal">revisar</span>';
      $("#seguridad").innerHTML = `<div class="tablas"><div class="tabla"><h3>Protecciones (versión ${esc(d.version || "?")})</h3><table>
        <tr><td>Solo se ejecuta código propio (CSP)</td><td>${ok(c.csp)}</td></tr><tr><td>Avisa intentos bloqueados</td><td>${ok(c.csp_avisa)}</td></tr>
        <tr><td>No se puede meter la página en otra</td><td>${ok(c.anti_marcos)}</td></tr><tr><td>Sin scripts de otros sitios</td><td>${ok(c.scripts_externos === 0)}</td></tr></table></div>
        ${tabla("Hoy", [["Robots buscando puntos débiles", h.sondeos_de_robots], ["Intentos bloqueados por el navegador", h.avisos_csp], ["Textos con forma de código", h.textos_con_codigo], ["Alertas enviadas por correo", h.alertas_enviadas]])}</div>
        <p class="letra-chica">Revisado: ${esc(d.revisado || "")}. Registros del día: ${esc(h.registros_del_dia || "")}.</p>`;
    } catch (e) { $("#seguridad").innerHTML = '<p class="mensaje-panel">No se pudo leer el estado de seguridad.</p>'; }
  }
  $("#form-panel").addEventListener("submit", e => { e.preventDefault(); cargar(); });
  if ($("#clave").value) cargar();
  seguridad();
})();
