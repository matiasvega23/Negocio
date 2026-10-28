/* Angie's Secret: funcionamiento del sitio (catálogo, fichas, pedido y letrero).
   Usa los datos de js/datos.js, que se carga antes que este archivo. */

/* =========================================================================
   FUNCIONAMIENTO (no es necesario tocar lo que sigue)
   ========================================================================= */
const IMGS = window.__IMGS__ || {};
const foto = k => IMGS[k] || `img/${k}.webp`;
const afiche = id => IMGS["a:" + id] || `fichas/${id}.webp`;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const wspUrl = texto => `https://wa.me/${TIENDA.whatsapp}?text=${encodeURIComponent(texto)}`;
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const aMin = h => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };

function ahora() {
  const p = {};
  new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short" })
    .formatToParts(new Date()).forEach(x => { p[x.type] = x.value; });
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday);
  return { fecha: `${p.year}-${p.month}-${p.day}`, mes: +p.month, dow, min: (+p.hour % 24) * 60 + +p.minute };
}
function sumarDias(fecha, n) { const d = new Date(fecha + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function horarioDe(fecha, dow) {
  const f = FERIADOS[fecha];
  if (f === "cerrado") return null;
  // Los feriados se abren de 11:00 a 14:00 aunque caigan domingo (confirmado por la dueña, oct 2026).
  if (f === "medio") return [aMin(TIENDA.abre), aMin(TIENDA.cierraFeriado), true];
  if (dow === 0) return null;
  return [aMin(TIENDA.abre), aMin(TIENDA.cierra), false];
}
const hora = m => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

function actualizarLetrero() {
  const t = ahora(), h = horarioDe(t.fecha, t.dow);
  let abierto = false, detalle;
  if (h && t.min >= h[0] && t.min < h[1]) {
    abierto = true;
    detalle = `${h[2] ? "Hoy es feriado. " : ""}Hoy hasta las ${hora(h[1])}`;
  } else if (h && t.min < h[0]) {
    detalle = `Abrimos hoy a las ${hora(h[0])}`;
  } else {
    for (let i = 1; i < 10; i++) {
      const f = sumarDias(t.fecha, i), dow = (t.dow + i) % 7, hh = horarioDe(f, dow);
      if (hh) { detalle = `Abrimos ${i === 1 ? "mañana" : "el " + DIAS[dow]} a las ${hora(hh[0])}`; break; }
    }
    if (FERIADOS[t.fecha] === "cerrado") detalle = "Feriado. " + detalle;
  }
  $("#letrero").dataset.abierto = abierto ? "si" : "no";
  $("#letrero-estado").textContent = abierto ? "Abierto" : "Cerrado";
  $("#letrero-detalle").textContent = detalle;
  document.querySelectorAll(".horario tr").forEach(tr => tr.classList.remove("hoy"));
  const fila = FERIADOS[t.fecha] ? "feriado" : t.dow === 0 ? "domingo" : "semana";
  const tr = document.querySelector(`.horario tr[data-dia="${fila}"]`); if (tr) tr.classList.add("hoy");
}

/* ---------- Catálogo ---------- */
const params = new URLSearchParams(location.search);
const temporadaAuto = m => (m >= 4 && m <= 8) ? "invierno" : (m >= 10 || m <= 2) ? "verano" : "todo";
const estado = {
  temporada: ["verano", "invierno", "todo"].includes(params.get("temporada")) ? params.get("temporada") : (TIENDA.temporadaForzada || temporadaAuto(ahora().mes)),
  para: ["mujer", "hombre", "ninos"].includes(params.get("para")) ? params.get("para") : "todos",
  q: ""
};
const NOMBRE_T = { verano: "de verano", invierno: "de invierno" };
const NOMBRE_P = { mujer: " para mujer", hombre: " para hombre", ninos: " para niños", todos: "" };

function visible(p) {
  if (estado.temporada !== "todo" && p.t !== "todo" && p.t !== estado.temporada) return false;
  if (estado.para !== "todos" && !p.para.includes(estado.para)) return false;
  if (estado.q) {
    const texto = norm([p.n, p.d, p.k || "", (p.col || []).join(" ")].join(" "));
    if (!norm(estado.q).split(/\s+/).filter(Boolean).every(w => texto.includes(w))) return false;
  }
  return true;
}
function textoTallas(p) {
  if (p.tallasTexto) return p.tallasTexto;
  if (!p.tallas) return "Pregunta por tu talla";
  if (p.tallas.join() === SXXL.join()) return "Tallas S a XXL";
  if (p.tallas.length === 1) return "Talla " + p.tallas[0].toLowerCase();
  return "Tallas " + p.tallas.join(", ");
}
function muestras(cols, max) {
  if (!cols || !cols.length) return "";
  const vis = cols.slice(0, max);
  return `<div class="muestras" aria-label="Colores: ${esc(cols.join(", "))}">${vis.map(c => `<span class="muestra" title="${esc(c)}" style="background:${COLORES[c] || "#ccc"}"></span>`).join("")}${cols.length > max ? `<span class="mas">y ${cols.length - max} más</span>` : ""}</div>`;
}
function tarjeta(p) {
  const n = (p.fotos.length + (p.afiches || []).length);
  return `<li class="producto">
    <button type="button" class="producto-foto" data-abrir="${p.id}" aria-label="Ver ${esc(p.n)}">
      <img src="${foto(p.fotos[0])}" alt="" width="640" height="800" loading="lazy" decoding="async">
      ${n > 1 ? `<span class="cuantas">${n} fotos</span>` : ""}
    </button>
    <div>
      <h4>${esc(p.n)}</h4>
      <p>${esc(p.d)}</p>
      <p class="tallas">${esc(textoTallas(p))}</p>
      ${p.precio ? `<p class="precio">$${p.precio.toLocaleString("es-CL")}</p>` : ""}
      ${muestras(p.col, 7)}
      <button type="button" class="boton boton-borde boton-chico" data-abrir="${p.id}">Elegir talla y color</button>
    </div>
  </li>`;
}
function pintar() {
  document.querySelectorAll("[data-temporada]").forEach(b => b.setAttribute("aria-pressed", b.dataset.temporada === estado.temporada));
  document.querySelectorAll("[data-para]").forEach(b => b.setAttribute("aria-pressed", b.dataset.para === estado.para));
  const lista = PRODUCTOS.filter(visible);
  let html = "";
  for (const [cat, nombre] of CATEGORIAS) {
    const items = lista.filter(p => p.cat === cat)
      .sort((a, b) => (a.t === "todo") - (b.t === "todo"));
    if (!items.length) continue;
    html += `<section class="grupo" aria-labelledby="g-${cat}"><h3 id="g-${cat}">${nombre}<small>${items.length} ${items.length === 1 ? "producto" : "productos"}</small></h3><ul class="productos">${items.map(tarjeta).join("")}</ul></section>`;
  }
  if (!lista.length) {
    const busca = estado.q ? `“${esc(estado.q)}”` : "eso";
    html = `<div class="vacio"><p>No encontramos ${busca} con estos filtros. Prueba con “Todo” en temporada, o escríbenos y lo buscamos para ti.</p>
      <a class="boton boton-wsp" href="${wspUrl(`Hola Angie's Secret 👋 Estoy buscando: ${estado.q}`)}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-wsp"/></svg>Preguntar por WhatsApp</a></div>`;
  }
  $("#listado").innerHTML = html;
  const t = estado.temporada === "todo" ? "de todas las temporadas" : `${NOMBRE_T[estado.temporada]} y para todo el año`;
  $("#resumen").textContent = lista.length ? `Mostrando ${lista.length} ${lista.length === 1 ? "producto" : "productos"}${NOMBRE_P[estado.para]} ${t}.` : "";
  const u = new URL(location.href);
  u.searchParams.set("temporada", estado.temporada);
  estado.para === "todos" ? u.searchParams.delete("para") : u.searchParams.set("para", estado.para);
  try { history.replaceState(null, "", u); } catch (e) {}
  pintarRegalo();
}
document.querySelectorAll("[data-temporada]").forEach(b => b.addEventListener("click", () => { estado.temporada = b.dataset.temporada; pintar(); }));
document.querySelectorAll("[data-para]").forEach(b => b.addEventListener("click", () => { estado.para = b.dataset.para; pintar(); }));
let espera;
$("#buscar").addEventListener("input", e => { clearTimeout(espera); espera = setTimeout(() => { estado.q = e.target.value.trim(); pintar(); }, 180); });
$("#listado").addEventListener("click", e => { const b = e.target.closest("[data-abrir]"); if (b) abrirProducto(b.dataset.abrir); });

/* ---------- Ficha del producto ---------- */
let actual = null;
function abrirProducto(id) {
  const p = PRODUCTOS.find(x => x.id === id); if (!p) return;
  actual = { p, cantidad: 1 };
  const imagenes = [...p.fotos.map(k => ({ src: foto(k), tipo: "foto" })), ...(p.afiches || []).map(a => ({ src: afiche(a), tipo: "afiche" }))];
  const tallas = p.tallas || null;
  $("#ficha").innerHTML = `
    <div class="galeria">
      <div class="galeria-marco"><div class="galeria-principal" id="principal"><img id="img-principal" src="${imagenes[0].src}" alt="${esc(p.n)}" draggable="false"></div>${imagenes.length > 1 ? `<button type="button" class="galeria-flecha anterior" data-paso="-1" aria-label="Foto anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-izq"/></svg></button><button type="button" class="galeria-flecha siguiente" data-paso="1" aria-label="Foto siguiente"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-der"/></svg></button><span class="galeria-contador" id="galeria-contador" aria-hidden="true">1 / ${imagenes.length}</span>` : ""}<button type="button" class="boton boton-borde boton-chico ampliar" id="ampliar" hidden>Ampliar</button></div>
      ${imagenes.length > 1 ? `<div class="miniaturas" role="group" aria-label="Fotos">${imagenes.map((im, i) => `<button type="button" data-i="${i}" aria-current="${i === 0}" aria-label="${im.tipo === "afiche" ? "Afiche con detalles" : "Foto " + (i + 1)}"><img src="${im.src}" alt="" loading="lazy">${im.tipo === "afiche" ? "<small>Afiche</small>" : ""}</button>`).join("")}</div>` : ""}
    </div>
    <div class="ficha-info">
      <h2 id="ficha-nombre">${esc(p.n)}</h2>
      <p>${esc(p.d)}</p>
      <p class="letra-chica">${esc(textoTallas(p))}${p.precio ? `. Precio: $${p.precio.toLocaleString("es-CL")}` : ""}</p>
      <form id="form-producto">
        ${tallas ? `<fieldset><legend>Talla</legend><div class="opciones">${[...tallas, "No sé mi talla"].map((t, i) => `<label class="opcion"><input type="radio" name="talla" value="${esc(t)}" ${tallas.length === 1 && i === 0 ? "checked" : ""}><span>${esc(t)}</span></label>`).join("")}</div></fieldset>`
                 : `<div class="campo"><label for="talla-libre">Talla (opcional)</label><input id="talla-libre" name="tallaLibre" placeholder="Ej: M, XL, 46"></div>`}
        ${usaGuiaTallas(p) ? `<button type="button" class="boton-texto guia-tallas" data-guia-tallas="${p.id}"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-regla"/></svg>¿Cuál es mi talla?</button>` : ""}
        ${p.col && p.col.length ? `<fieldset><legend>Color</legend><div class="opciones">${p.col.map(c => `<label class="opcion"><input type="radio" name="color" value="${esc(c)}" ${p.col.length === 1 ? "checked" : ""}><span><i class="muestra" style="background:${COLORES[c] || "#ccc"}"></i>${esc(c)}</span></label>`).join("")}</div></fieldset>`
                 : `<div class="campo"><label for="color-libre">Color o modelo (opcional)</label><input id="color-libre" name="colorLibre" placeholder="Ej: el floreado azul"></div>`}
        <fieldset><legend>Cantidad</legend>
          <div class="cantidad"><button type="button" data-cant="-1" aria-label="Una menos"><svg viewBox="0 0 24 24"><use href="#i-menos"/></svg></button><output id="cant" aria-live="polite">1</output><button type="button" data-cant="1" aria-label="Una más"><svg viewBox="0 0 24 24"><use href="#i-mas"/></svg></button></div>
        </fieldset>
        <div class="ficha-acciones">
          <button type="submit" class="boton boton-principal">Agregar a mi pedido</button>
          <a class="boton boton-wsp" id="preguntar" href="#" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-wsp"/></svg>Preguntar solo por este</a>
          <button type="button" class="boton-texto compartir" id="compartir"><svg viewBox="0 0 24 24" aria-hidden="true" style="width:1.1em;height:1.1em;vertical-align:-3px"><use href="#i-compartir"/></svg> Compartir este producto</button>
        </div>
        <p class="letra-chica">Te confirmamos disponibilidad y precio por WhatsApp.</p>
      </form>
    </div>`;
  const f = $("#form-producto");
  const eleccion = () => {
    const d = new FormData(f);
    return { talla: d.get("talla") || d.get("tallaLibre") || "", color: d.get("color") || d.get("colorLibre") || "" };
  };
  const refrescarPregunta = () => {
    const e = eleccion(), extra = [e.talla && `talla ${e.talla}`, e.color && `color ${e.color}`].filter(Boolean).join(", ");
    $("#preguntar").href = wspUrl(`Hola Angie's Secret 👋 Quería consultar por: ${p.n}${extra ? ` (${extra})` : ""}. ¿Está disponible y qué precio tiene?`);
  };
  refrescarPregunta();
  f.addEventListener("change", refrescarPregunta);
  f.addEventListener("input", refrescarPregunta);
  f.addEventListener("click", e => {
    const b = e.target.closest("[data-cant]"); if (!b) return;
    actual.cantidad = Math.max(1, Math.min(20, actual.cantidad + +b.dataset.cant));
    $("#cant").textContent = actual.cantidad;
  });
  f.addEventListener("submit", e => {
    e.preventDefault();
    const el = eleccion();
    const desde = $("#img-principal").getBoundingClientRect();
    agregar({ id: p.id, n: p.n, foto: p.fotos[0], talla: el.talla, color: el.color, cantidad: actual.cantidad });
    $("#ventana-producto").close();
    volarAlPedido(foto(p.fotos[0]), desde);
    avisar(`Agregado a tu pedido: ${p.n}`);
  });
  $("#compartir").addEventListener("click", async () => {
    const u = new URL(location.href); u.searchParams.set("producto", p.id);
    const datos = { title: `${p.n} | Angie's Secret`, text: `Mira esto en Angie's Secret: ${p.n}`, url: u.toString() };
    try {
      if (navigator.share) await navigator.share(datos);
      else { await navigator.clipboard.writeText(datos.url); avisar("Enlace copiado"); }
    } catch (err) {}
  });
  const principal = $("#principal"), imgP = $("#img-principal");
  let vista = 0;
  const mostrar = i => {
    vista = (i + imagenes.length) % imagenes.length;
    const im = imagenes[vista];
    imgP.src = im.src;
    imgP.classList.remove("zoom");
    principal.classList.toggle("es-afiche", im.tipo === "afiche");
    principal.classList.remove("ampliado");
    principal.scrollTop = 0; principal.scrollLeft = 0;
    $("#ampliar").hidden = im.tipo !== "afiche";
    $("#ampliar").textContent = "Ampliar";
    const c = $("#galeria-contador"); if (c) c.textContent = `${vista + 1} / ${imagenes.length}`;
    document.querySelectorAll("#ficha .miniaturas button").forEach(x => x.setAttribute("aria-current", +x.dataset.i === vista));
  };
  $("#ampliar").addEventListener("click", ev => { const a = principal.classList.toggle("ampliado"); ev.currentTarget.textContent = a ? "Ver completo" : "Ampliar"; });
  document.querySelectorAll("#ficha .miniaturas button").forEach(b => b.addEventListener("click", () => mostrar(+b.dataset.i)));
  document.querySelectorAll("#ficha .galeria-flecha").forEach(b => b.addEventListener("click", () => mostrar(vista + +b.dataset.paso)));
  // Deslizar con el dedo para cambiar de foto
  let toque = null;
  principal.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse" && imagenes.length > 1 && !principal.classList.contains("ampliado")) toque = { x: e.clientX, y: e.clientY }; });
  principal.addEventListener("pointerup", e => {
    if (!toque) return;
    const dx = e.clientX - toque.x, dy = e.clientY - toque.y; toque = null;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) mostrar(vista + (dx < 0 ? 1 : -1));
  });
  principal.addEventListener("pointercancel", () => { toque = null; });
  // Zoom al pasar el mouse sobre una foto (solo computador)
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    principal.addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse" || imagenes[vista].tipo !== "foto") return;
      const r = principal.getBoundingClientRect();
      imgP.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
      imgP.classList.add("zoom");
    });
    principal.addEventListener("pointerleave", () => imgP.classList.remove("zoom"));
  }
  $("#ventana-producto").showModal();
  $("#ventana-producto").scrollTop = 0;
}

/* ---------- Pedido ---------- */
let pedido = [];
try { pedido = JSON.parse(localStorage.getItem("angie-pedido") || "[]"); } catch (e) { pedido = []; }
const guardar = () => { try { localStorage.setItem("angie-pedido", JSON.stringify(pedido)); } catch (e) {} };
// Registro del descuento de bienvenida (10% o 15%): se recuerda en este navegador para que el pedido lo pida solo.
let registro = null;
try { registro = JSON.parse(localStorage.getItem("angie-registro") || "null"); } catch (e) { registro = null; }
// El descuento se puede usar durante 1 mes desde el registro (bases de la promoción).
function unMesDespues(fecha) {
  const [a, m, d] = fecha.split("-").map(Number);
  const a2 = m === 12 ? a + 1 : a, m2 = m === 12 ? 1 : m + 1;
  const ultimo = new Date(Date.UTC(a2, m2, 0)).getUTCDate();
  return `${a2}-${String(m2).padStart(2, "0")}-${String(Math.min(d, ultimo)).padStart(2, "0")}`;
}
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const fechaLarga = f => { const [a, m, d] = f.split("-").map(Number); return `${d} de ${MESES[m - 1]} de ${a}`; };
const fechaCorta = f => f.split("-").reverse().join("/");
const registroVigente = () => !!(registro && registro.fecha && !registro.usado && ahora().fecha <= unMesDespues(registro.fecha));
function guardarRegistro() { try { localStorage.setItem("angie-registro", JSON.stringify(registro)); } catch (e) {} }
// Al enviar un pedido que pide el descuento, se anota en este navegador para no volver a pedirlo solo.
function marcarBienvenidaUsada() { if (registro && !registro.usado) { registro.usado = ahora().fecha; guardarRegistro(); } datosCliente.bienvenida = false; }
const lineaBienvenida = () => `Me registré en la página${registro && registro.fecha ? ` el ${fechaCorta(registro.fecha)}` : ""}, así que quiero usar mi descuento de bienvenida en esta primera compra (10% desde $15.000 o 15% desde $50.000) 😊`;
const datosCliente = { nombre: registro ? `${registro.nombre} ${registro.apellido}` : "", entrega: "retiro", comuna: "", nota: "", regalo: false, bienvenida: registroVigente() };

function agregar(item) {
  const igual = pedido.find(x => x.id === item.id && x.talla === item.talla && x.color === item.color);
  if (igual) igual.cantidad += item.cantidad; else pedido.push(item);
  guardar(); pintarBarra();
}
function pintarBarra() {
  const n = pedido.reduce((s, x) => s + x.cantidad, 0);
  $("#barra-pedido").hidden = n === 0;
  $("#barra-cuenta").textContent = `Tu pedido: ${n} ${n === 1 ? "producto" : "productos"}`;
}
function detalleItem(x) {
  return [x.talla && `talla ${x.talla}`, x.color && `color ${x.color.toLowerCase()}`, `${x.cantidad} ${x.cantidad === 1 ? "unidad" : "unidades"}`].filter(Boolean).join(", ");
}
function mensajePedido() {
  const lineas = pedido.map((x, i) => `${i + 1}. ${x.n}: ${detalleItem(x)}`);
  const entrega = datosCliente.entrega === "envio" ? `Envío a ${datosCliente.comuna || "(comuna y ciudad)"}` : "Retiro en la tienda";
  const extra = [`Entrega: ${entrega}`];
  if (datosCliente.regalo) extra.push("Envolver para regalo: sí (pedido desde la página; envoltorio sin costo hasta 3 prendas)");
  if (datosCliente.nombre) extra.push(`Nombre: ${datosCliente.nombre}`);
  if (datosCliente.nota) extra.push(`Comentario: ${datosCliente.nota}`);
  const cierre = datosCliente.bienvenida
    ? [lineaBienvenida(), "", "¿Me confirman disponibilidad y el precio con el descuento? ¡Muchas gracias!"]
    : ["¿Me confirman disponibilidad y precio? Gracias."];
  return ["Hola Angie's Secret 👋 Quiero hacer este pedido:", "", ...lineas, "", ...extra, "", ...cierre].join("\n");
}
const MAX_CANT = 20;
const textoCuenta = n => `${n} ${n === 1 ? "producto" : "productos"}. Revisa y envíalo por WhatsApp.`;
const detalleSinCantidad = x => [x.talla && `Talla ${x.talla}`, x.color && `color ${x.color.toLowerCase()}`].filter(Boolean).join(", ");
// Último pedido enviado a WhatsApp: se guarda un día por si la persona no alcanzó a enviarlo y quiere recuperarlo.
let ultimoPedido = null;
try { ultimoPedido = JSON.parse(localStorage.getItem("angie-ultimo-pedido") || "null"); } catch (e) { ultimoPedido = null; }
if (ultimoPedido && Date.now() - ultimoPedido.hora > 864e5) ultimoPedido = null;
function pintarPedido() {
  const n = pedido.reduce((s, x) => s + x.cantidad, 0);
  if (!n) {
    $("#pedido").innerHTML = `<h2 id="pedido-titulo">Tu pedido</h2><p class="intro" style="margin-top:12px">Tu pedido está vacío. Agrega productos desde el catálogo.</p><button type="button" class="boton boton-principal" data-ir-catalogo>Ver el catálogo</button>${ultimoPedido ? `<button type="button" class="boton-texto" data-recuperar>Recuperar el último pedido que enviaste</button>` : ""}`;
    return;
  }
  $("#pedido").innerHTML = `
    <h2 id="pedido-titulo">Tu pedido</h2>
    <p class="letra-chica" style="margin-top:0" id="pedido-cuenta">${textoCuenta(n)}</p>
    <ul class="lista-pedido">${pedido.map((x, i) => `<li><img src="${foto(x.foto)}" alt=""><div><strong>${esc(x.n)}</strong>${detalleSinCantidad(x) ? `<span>${esc(detalleSinCantidad(x))}</span>` : ""}<div class="cantidad cantidad-chica" role="group" aria-label="Cantidad de ${esc(x.n)}"><button type="button" data-mover="${i}" data-paso="-1" aria-label="Una menos" ${x.cantidad <= 1 ? "disabled" : ""}><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-menos"/></svg></button><output aria-live="polite">${x.cantidad}</output><button type="button" data-mover="${i}" data-paso="1" aria-label="Una más" ${x.cantidad >= MAX_CANT ? "disabled" : ""}><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-mas"/></svg></button></div></div><button type="button" class="boton-texto" data-quitar="${i}" aria-label="Quitar ${esc(x.n)}">Quitar</button></li>`).join("")}</ul>
    <fieldset><legend>¿Cómo lo recibes?</legend>
      <div class="entrega">
        <label class="opcion"><input type="radio" name="entrega" value="retiro" ${datosCliente.entrega === "retiro" ? "checked" : ""}><span>Retiro en la tienda, Renca</span></label>
        <label class="opcion"><input type="radio" name="entrega" value="envio" ${datosCliente.entrega === "envio" ? "checked" : ""}><span>Envío a domicilio (todo Chile)</span></label>
      </div>
    </fieldset>
    <div class="envolver"><label class="opcion"><input type="checkbox" id="envolver" ${datosCliente.regalo ? "checked" : ""}><span><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-regalo"/></svg>Envolver para regalo (sin costo hasta 3 prendas, pidiendo desde esta página)</span></label></div>
    <div class="envolver"><label class="opcion"><input type="checkbox" id="bienvenida" ${datosCliente.bienvenida ? "checked" : ""}><span>Me registré: quiero usar mi descuento de bienvenida en esta primera compra (10% desde $15.000 o 15% desde $50.000)</span></label></div>
    <p class="letra-chica" id="aviso-registro" ${datosCliente.bienvenida ? "hidden" : ""}>¿Primera compra? <a href="#registro" data-ir-registro>Regístrate</a> y recibe hasta un 15% de descuento.</p>
    <div class="campo" id="campo-comuna" ${datosCliente.entrega === "envio" ? "" : "hidden"}><label for="comuna">Comuna y ciudad</label><input id="comuna" value="${esc(datosCliente.comuna)}" placeholder="Ej: Maipú, Santiago" autocomplete="address-level2"></div>
    <div class="campo"><label for="nombre">Tu nombre (opcional)</label><input id="nombre" value="${esc(datosCliente.nombre)}" autocomplete="given-name"></div>
    <div class="campo"><label for="nota">Comentario (opcional)</label><textarea id="nota" placeholder="Ej: es para regalo">${esc(datosCliente.nota)}</textarea></div>
    <div class="ficha-acciones">
      <a class="boton boton-wsp" id="enviar-pedido" href="${wspUrl(mensajePedido())}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-wsp"/></svg>Enviar pedido por WhatsApp</a>
      <button type="button" class="boton-texto" id="vaciar">Vaciar pedido</button>
    </div>
    <p class="letra-chica">Se abrirá WhatsApp con tu pedido ya escrito. Solo tienes que tocar enviar. Después tu pedido se vacía en esta página.</p>`;
}
function abrirPedido() { pintarPedido(); $("#ventana-pedido").showModal(); }
$("#abrir-pedido").addEventListener("click", abrirPedido);
$("#pedido").addEventListener("click", e => {
  const q = e.target.closest("[data-quitar]");
  if (q) { pedido.splice(+q.dataset.quitar, 1); guardar(); pintarBarra(); pintarPedido(); return; }
  if (e.target.closest("#vaciar")) { pedido = []; guardar(); pintarBarra(); pintarPedido(); return; }
  const m = e.target.closest("[data-mover]");
  if (m) {
    const x = pedido[+m.dataset.mover]; if (!x) return;
    x.cantidad = Math.max(1, Math.min(MAX_CANT, x.cantidad + +m.dataset.paso));
    guardar(); pintarBarra();
    const li = m.closest("li");
    li.querySelector("output").textContent = x.cantidad;
    li.querySelector('[data-paso="-1"]').disabled = x.cantidad <= 1;
    li.querySelector('[data-paso="1"]').disabled = x.cantidad >= MAX_CANT;
    $("#pedido-cuenta").textContent = textoCuenta(pedido.reduce((s, y) => s + y.cantidad, 0));
    $("#enviar-pedido").href = wspUrl(mensajePedido());
    return;
  }
  if (e.target.closest("#enviar-pedido")) {
    // El enlace abre WhatsApp con el mensaje ya armado; después se vacía el pedido en esta página.
    ultimoPedido = { hora: Date.now(), items: pedido.map(x => ({ ...x })), bienvenida: datosCliente.bienvenida };
    try { localStorage.setItem("angie-ultimo-pedido", JSON.stringify(ultimoPedido)); } catch (e2) {}
    if (datosCliente.bienvenida) marcarBienvenidaUsada();
    setTimeout(() => {
      pedido = []; guardar(); pintarBarra();
      $("#pedido").innerHTML = `<h2 id="pedido-titulo">¡Tu pedido se abrió en WhatsApp!</h2><p class="intro" style="margin-top:12px">Solo falta que toques enviar en WhatsApp. Vaciamos tu pedido en esta página para que la próxima vez empieces de cero.</p><button type="button" class="boton boton-principal" data-ir-catalogo>Seguir viendo el catálogo</button><button type="button" class="boton-texto" data-recuperar>¿No alcanzaste a enviarlo? Recuperar mi pedido</button>`;
    }, 400);
    return;
  }
  if (e.target.closest("[data-recuperar]") && ultimoPedido) {
    pedido = ultimoPedido.items.map(x => ({ ...x }));
    if (ultimoPedido.bienvenida && registro) { delete registro.usado; guardarRegistro(); datosCliente.bienvenida = true; }
    ultimoPedido = null; try { localStorage.removeItem("angie-ultimo-pedido"); } catch (e2) {}
    guardar(); pintarBarra(); pintarPedido(); return;
  }
  if (e.target.closest("[data-ir-catalogo]")) { $("#ventana-pedido").close(); location.hash = "catalogo"; }
  if (e.target.closest("[data-ir-registro]")) { $("#ventana-pedido").close(); }
});
$("#pedido").addEventListener("input", e => {
  const t = e.target;
  if (t.name === "entrega") { datosCliente.entrega = t.value; $("#campo-comuna").hidden = t.value !== "envio"; }
  if (t.id === "comuna") datosCliente.comuna = t.value;
  if (t.id === "nombre") datosCliente.nombre = t.value;
  if (t.id === "nota") datosCliente.nota = t.value;
  if (t.id === "envolver") datosCliente.regalo = t.checked;
  if (t.id === "bienvenida") { datosCliente.bienvenida = t.checked; $("#aviso-registro").hidden = t.checked; }
  const a = $("#enviar-pedido"); if (a) a.href = wspUrl(mensajePedido());
});

/* ---------- Animación: la foto vuela a la barra del pedido ---------- */
function volarAlPedido(src, desde) {
  const barra = $("#barra-pedido");
  if (barra.hidden) return;
  const pulso = () => { barra.classList.remove("pulso"); void barra.offsetWidth; barra.classList.add("pulso"); };
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !desde || !desde.width || !barra.animate) { pulso(); return; }
  const hasta = barra.getBoundingClientRect();
  const lado = Math.min(desde.width, desde.height, 220);
  const x0 = desde.left + desde.width / 2 - lado / 2, y0 = desde.top + desde.height / 2 - lado / 2;
  const x1 = hasta.left + 36 - lado / 2, y1 = hasta.top + hasta.height / 2 - lado / 2;
  const v = document.createElement("img");
  v.src = src; v.alt = ""; v.className = "vuela";
  Object.assign(v.style, { left: `${x0}px`, top: `${y0}px`, width: `${lado}px`, height: `${lado}px` });
  document.body.appendChild(v);
  const vuelo = v.animate([
    { transform: "translate(0, 0) scale(1)", opacity: 1 },
    { transform: `translate(${(x1 - x0) * 0.5}px, ${(y1 - y0) * 0.5 - 90}px) scale(0.55)`, opacity: 0.95, offset: 0.55 },
    { transform: `translate(${x1 - x0}px, ${y1 - y0}px) scale(0.12)`, opacity: 0.35 }
  ], { duration: 750, easing: "cubic-bezier(.5, 0, .3, 1)" });
  vuelo.onfinish = vuelo.oncancel = () => { v.remove(); pulso(); };
}

/* ---------- Fecha de referencia (para revisar otra fecha: ?fecha=2026-12-10) ---------- */
const fechaHoy = () => /^\d{4}-\d{2}-\d{2}$/.test(params.get("fecha") || "") ? params.get("fecha") : ahora().fecha;
const diasEntre = (a, b) => Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 86400000);

/* ---------- Aviso de temporada con cuenta regresiva ---------- */
function pintarAvisoTemporada() {
  const hoy = fechaHoy();
  const activas = FECHAS_COMERCIALES.map(f => {
    if (f.fecha) { const d = diasEntre(hoy, f.fecha); return d >= 0 && d <= f.desde ? { ...f, dias: d, termina: f.fecha } : null; }
    return hoy >= f.inicio && hoy <= f.fin ? { ...f, dias: null, termina: f.fin } : null;
  }).filter(Boolean).sort((a, b) => a.termina.localeCompare(b.termina));
  const caja = $("#aviso-temporada");
  if (!activas.length) { caja.hidden = true; return; }
  const f = activas[0];
  let titulo = "";
  if (f.dias === 0) titulo = f.nombre === "Navidad" ? "¡Feliz Navidad!" : `¡Hoy es ${f.nombre}!`;
  else if (f.dias) titulo = `${f.dias === 1 ? "Falta 1 día" : `Faltan ${f.dias} días`} para ${f.nombre}.`;
  const cerradoHoy = f.dias === 0 && FERIADOS[hoy] === "cerrado";
  $("#aviso-temporada-texto").innerHTML = `${titulo ? `<strong>${esc(titulo)}</strong> ` : ""}${esc(cerradoHoy ? "Hoy la tienda está cerrada. Gracias por preferirnos." : f.texto)}`;
  const b = $("#aviso-temporada-boton");
  const aWsp = f.enlace.startsWith("wsp:");
  b.textContent = f.boton; b.href = aWsp ? wspUrl(f.enlace.slice(4)) : f.enlace; b.hidden = cerradoHoy;
  if (aWsp) { b.target = "_blank"; b.rel = "noopener"; } else { b.removeAttribute("target"); b.removeAttribute("rel"); }
  caja.hidden = false;
}

/* ---------- Decoración según la fecha ---------- */
function temaDelDia(fecha) {
  const md = fecha.slice(5);
  if (md >= "12-01" && md <= "12-26") return "navidad";
  if (md >= "09-10" && md <= "09-20") return "patrias";
  const madre = FECHAS_COMERCIALES.find(f => f.fecha && f.nombre.includes("Madre") && f.fecha.slice(0, 4) === fecha.slice(0, 4));
  const antesMadre = madre ? diasEntre(fecha, madre.fecha) : -1;
  if ((md >= "02-07" && md <= "02-14") || (antesMadre >= 0 && antesMadre <= 7)) return "corazones";
  if (md >= "06-01" && md <= "08-31") return "invierno";
  return "";
}
function decorar() {
  const tema = temaDelDia(fechaHoy());
  document.documentElement.dataset.tema = tema;
  document.querySelectorAll(".decoracion").forEach(d => d.remove());
  if (!tema) return;
  const d = document.createElement("div");
  d.setAttribute("aria-hidden", "true");
  if (tema === "navidad" || tema === "patrias") {
    d.className = `decoracion ${tema === "navidad" ? "guirnalda" : "banderines"}`;
    d.innerHTML = "<i></i>".repeat(80);
    $(".cabecera").appendChild(d);
  } else {
    d.className = `decoracion caen ${tema}`;
    const icono = tema === "invierno" ? "#i-copo" : "#i-corazon";
    let html = "";
    for (let i = 0; i < 14; i++) {
      const izq = (i * 37 + 11) % 100, tam = 12 + ((i * 7) % 14), dur = 9 + ((i * 5) % 8), retraso = (i * 1.7) % dur;
      html += `<svg viewBox="0 0 24 24" style="left:${izq}%;width:${tam}px;height:${tam}px;animation-duration:${dur}s;animation-delay:-${retraso.toFixed(1)}s"><use href="${icono}"/></svg>`;
    }
    d.innerHTML = html;
    $(".portada").prepend(d);
  }
}

/* ---------- Arma tu regalo ---------- */
const regalo = { para: "mujer", elegidos: [] };
const MAX_REGALO = 3;
function opcionesRegalo() {
  return REGALOS.map(id => PRODUCTOS.find(p => p.id === id)).filter(Boolean)
    .filter(p => p.para.includes(regalo.para))
    .filter(p => estado.temporada === "todo" || p.t === "todo" || p.t === estado.temporada);
}
function pintarRegalo() {
  document.querySelectorAll("[data-regalo-para]").forEach(b => b.setAttribute("aria-pressed", b.dataset.regaloPara === regalo.para));
  const t = estado.temporada === "todo" ? "de todas las temporadas" : `${NOMBRE_T[estado.temporada]} y para todo el año`;
  $("#regalo-temporada").textContent = `Ideas ${t}. Para ver otra temporada, cámbiala en el catálogo.`;
  const ops = opcionesRegalo();
  $("#regalo-opciones").innerHTML = ops.length ? ops.map(p => `<li><button type="button" class="regalo-opcion" data-regalo="${p.id}" aria-pressed="${regalo.elegidos.includes(p.id)}"><img src="${foto(p.fotos[0])}" alt="" width="320" height="400" loading="lazy" decoding="async"><span>${esc(p.n)}</span><i class="regalo-check" aria-hidden="true"></i></button></li>`).join("")
    : `<li class="regalo-vacio">Para esta temporada no tenemos ideas cargadas aquí. Escríbenos y te ayudamos a elegir.</li>`;
  pintarCuentaRegalo();
}
function pintarCuentaRegalo() {
  const nombres = regalo.elegidos.map(id => PRODUCTOS.find(p => p.id === id)).filter(Boolean).map(p => p.n);
  $("#regalo-cuenta").textContent = nombres.length ? `Elegiste ${nombres.length} de ${MAX_REGALO}: ${nombres.join(", ")}.` : `Todavía no eliges prendas. Puedes elegir hasta ${MAX_REGALO}.`;
  const detalle = $("#regalo-detalle").value.trim();
  const texto = nombres.length
    ? ["Hola Angie's Secret 👋 Quiero armar un regalo envuelto (pedido desde la página):", "", ...nombres.map((n, i) => `${i + 1}. ${n}`), "", ...(detalle ? [`Es para: ${detalle}`, ""] : []), ...(registroVigente() ? [lineaBienvenida(), ""] : []), "¿Me ayudan con tallas, colores y precio? Gracias."].join("\n")
    : `Hola Angie's Secret 👋 Quiero armar un regalo envuelto desde la página${detalle ? ` (${detalle})` : ""}. ¿Me ayudan a elegir?${registroVigente() ? `\n\n${lineaBienvenida()}` : ""}`;
  $("#regalo-enviar").href = wspUrl(texto);
}
document.querySelectorAll("[data-regalo-para]").forEach(b => b.addEventListener("click", () => { regalo.para = b.dataset.regaloPara; pintarRegalo(); }));
$("#regalo-opciones").addEventListener("click", e => {
  const b = e.target.closest("[data-regalo]"); if (!b) return;
  const id = b.dataset.regalo, i = regalo.elegidos.indexOf(id);
  if (i >= 0) regalo.elegidos.splice(i, 1);
  else if (regalo.elegidos.length >= MAX_REGALO) { avisar(`Puedes elegir hasta ${MAX_REGALO} prendas`); return; }
  else regalo.elegidos.push(id);
  b.setAttribute("aria-pressed", regalo.elegidos.includes(id));
  pintarCuentaRegalo();
});
$("#regalo-detalle").addEventListener("input", pintarCuentaRegalo);
$("#regalo-enviar").addEventListener("click", () => { if (registroVigente()) { marcarBienvenidaUsada(); setTimeout(pintarCuentaRegalo, 400); } });

/* ---------- Guía de tallas ---------- */
let tallasDe = null;
function usaGuiaTallas(p) {
  return p.cat !== "accesorios" && p.id !== "pantys" && !(p.tallas && p.tallas.length === 1) && !p.para.every(x => x === "ninos");
}
function abrirGuiaTallas(id) {
  tallasDe = PRODUCTOS.find(x => x.id === id) || null;
  $("#tallas-producto").textContent = tallasDe ? `Para: ${tallasDe.n}` : "";
  refrescarTallas();
  $("#ventana-tallas").showModal();
}
function medidas() {
  const d = new FormData($("#form-tallas")), m = {};
  for (const k of ["busto", "cintura", "cadera"]) {
    const v = parseFloat(String(d.get(k) || "").replace(",", "."));
    if (v >= 40 && v <= 220) m[k] = Math.round(v);
  }
  return m;
}
function sugerirTalla(m) {
  if (!TABLAS_TALLAS || !Object.keys(m).length) return null;
  const grupo = tallasDe && tallasDe.para.includes("hombre") && !tallasDe.para.includes("mujer") ? "hombre" : "mujer";
  const filas = TABLAS_TALLAS[grupo] || [];
  let mejor = null, puntos = 0;
  filas.forEach(f => {
    let ok = 0;
    for (const k in m) if (f[k] && m[k] >= f[k][0] && m[k] <= f[k][1]) ok++;
    if (ok && ok >= puntos) { mejor = f.talla; puntos = ok; }   // en empate gana la talla más grande
  });
  return mejor;
}
function refrescarTallas() {
  const m = medidas();
  const partes = [m.busto && `busto o pecho ${m.busto} cm`, m.cintura && `cintura ${m.cintura} cm`, m.cadera && `cadera ${m.cadera} cm`].filter(Boolean);
  const sug = sugerirTalla(m);
  const s = $("#tallas-sugerencia");
  s.hidden = !sug;
  if (sug) s.textContent = `Talla sugerida: ${sug}. Es referencial: confírmala por WhatsApp.`;
  $("#tallas-enviar").href = wspUrl(`Hola Angie's Secret 👋 Quiero saber mi talla.${partes.length ? ` Mis medidas: ${partes.join(", ")}.` : ""}${tallasDe ? ` Estoy viendo: ${tallasDe.n}.` : ""}${sug ? ` La guía me sugiere talla ${sug}.` : ""} ¿Qué talla me recomiendan?`);
}
$("#form-tallas").addEventListener("input", refrescarTallas);
$("#form-tallas").addEventListener("submit", e => e.preventDefault());
document.addEventListener("click", e => { const b = e.target.closest("[data-guia-tallas]"); if (b) abrirGuiaTallas(b.dataset.guiaTallas || ""); });

/* ---------- Registro y descuento de bienvenida (10% o 15%) ----------
   El formulario lo guarda Netlify (Forms). Además se recuerda en este navegador
   para que el mensaje de WhatsApp pida el descuento solo. */
const formRegistro = $("#form-registro");
function telefonoChileno(valor) {
  const d = String(valor).replace(/\D/g, "");
  if (d.length === 9 && d.startsWith("9")) return "+56" + d;
  if (d.length === 11 && d.startsWith("569")) return "+" + d;
  return null;
}
function mostrarRegistroListo(nombre) {
  formRegistro.hidden = true;
  $("#registro-listo").hidden = false;
  const vence = registro && registro.fecha ? unMesDespues(registro.fecha) : null;
  if (registro && registro.usado) {
    $("#registro-listo-titulo").textContent = `${nombre ? nombre + ", ya" : "Ya"} pediste tu descuento de bienvenida.`;
    $("#registro-listo-detalle").textContent = `Lo pediste en tu pedido por WhatsApp del ${fechaCorta(registro.usado)}. Te confirmamos el precio final por WhatsApp. Si no alcanzaste a enviar ese pedido, escríbenos y recuérdanos que te registraste.`;
    return;
  }
  if (vence && !registroVigente()) {
    $("#registro-listo-titulo").textContent = `${nombre ? nombre + ", tu" : "Tu"} descuento de bienvenida venció el ${fechaLarga(vence)}.`;
    $("#registro-listo-detalle").textContent = "Igual te esperamos en la tienda y por WhatsApp. Si te registraste para recibir promociones, te avisaremos de las próximas.";
    return;
  }
  $("#registro-listo-titulo").textContent = `¡Listo${nombre ? ", " + nombre : ""}! Tu descuento de bienvenida quedó registrado.`;
  if (vence) $("#registro-listo-detalle").textContent = `Tienes hasta el ${fechaLarga(vence)} para usarlo: 10% en compras desde $15.000 y 15% desde $50.000, en prendas. Cuando hagas tu primer pedido por WhatsApp desde el número que registraste, el mensaje que se arma en esta página pedirá tu descuento. Si nos escribes directo, solo recuérdanos que te registraste.`;
}
if (formRegistro) {
  if (registro) mostrarRegistroListo(registro.nombre);
  formRegistro.addEventListener("submit", async e => {
    e.preventDefault();
    const err = $("#registro-error"); err.hidden = true;
    const tel = formRegistro.elements.telefono, tNorm = telefonoChileno(tel.value);
    if (!tNorm) {
      err.textContent = "Revisa tu teléfono: debe ser un celular de Chile, por ejemplo +56 9 1234 5678.";
      err.hidden = false; tel.focus(); return;
    }
    tel.value = tNorm;
    if (!formRegistro.checkValidity()) { formRegistro.reportValidity(); return; }
    const boton = $("#registro-enviar"); boton.disabled = true; boton.textContent = "Enviando…";
    try {
      const r = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(new FormData(formRegistro)).toString() });
      if (!r.ok) throw new Error(String(r.status));
      const f = formRegistro.elements;
      registro = { nombre: f.nombre.value.trim(), apellido: f.apellido.value.trim(), telefono: tNorm, fecha: ahora().fecha };
      try { localStorage.setItem("angie-registro", JSON.stringify(registro)); } catch (e2) {}
      datosCliente.bienvenida = true;
      if (!datosCliente.nombre) datosCliente.nombre = `${registro.nombre} ${registro.apellido}`;
      pintarCuentaRegalo();
      mostrarRegistroListo(registro.nombre);
    } catch (e3) {
      err.textContent = "No pudimos guardar tu registro. Revisa tu conexión e inténtalo de nuevo, o escríbenos por WhatsApp.";
      err.hidden = false;
    } finally {
      boton.disabled = false; boton.textContent = "Registrarme y obtener mi descuento";
    }
  });
}

/* ---------- Comunes ---------- */
document.querySelectorAll("dialog").forEach(d => {
  d.addEventListener("click", e => { if (e.target === d || e.target.closest("[data-cerrar]")) d.close(); });
});
document.querySelectorAll("[data-wsp]").forEach(a => { a.href = wspUrl(a.dataset.wsp); });
let tAviso;
function avisar(texto) {
  const a = $("#aviso"); a.textContent = texto; a.classList.add("ver");
  clearTimeout(tAviso); tAviso = setTimeout(() => a.classList.remove("ver"), 2600);
}
$("#anio").textContent = new Date().getFullYear();

actualizarLetrero();
setInterval(actualizarLetrero, 60000);
pintarAvisoTemporada();
decorar();
pintar();
pintarBarra();
if (params.get("producto")) abrirProducto(params.get("producto"));
