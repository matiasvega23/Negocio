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
  if (f === "cerrado" || dow === 0) return null;
  if (f === "medio") return [aMin(TIENDA.abre), aMin(TIENDA.cierraFeriado), true];
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
      <div class="galeria-marco"><div class="galeria-principal" id="principal"><img id="img-principal" src="${imagenes[0].src}" alt="${esc(p.n)}"></div><button type="button" class="boton boton-borde boton-chico ampliar" id="ampliar" hidden>Ampliar</button></div>
      ${imagenes.length > 1 ? `<div class="miniaturas" role="group" aria-label="Fotos">${imagenes.map((im, i) => `<button type="button" data-i="${i}" aria-current="${i === 0}" aria-label="${im.tipo === "afiche" ? "Afiche con detalles" : "Foto " + (i + 1)}"><img src="${im.src}" alt="" loading="lazy">${im.tipo === "afiche" ? "<small>Afiche</small>" : ""}</button>`).join("")}</div>` : ""}
    </div>
    <div class="ficha-info">
      <h2 id="ficha-nombre">${esc(p.n)}</h2>
      <p>${esc(p.d)}</p>
      <p class="letra-chica">${esc(textoTallas(p))}${p.precio ? `. Precio: $${p.precio.toLocaleString("es-CL")}` : ""}</p>
      <form id="form-producto">
        ${tallas ? `<fieldset><legend>Talla</legend><div class="opciones">${[...tallas, "No sé mi talla"].map((t, i) => `<label class="opcion"><input type="radio" name="talla" value="${esc(t)}" ${tallas.length === 1 && i === 0 ? "checked" : ""}><span>${esc(t)}</span></label>`).join("")}</div></fieldset>`
                 : `<div class="campo"><label for="talla-libre">Talla (opcional)</label><input id="talla-libre" name="tallaLibre" placeholder="Ej: M, XL, 46"></div>`}
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
    agregar({ id: p.id, n: p.n, foto: p.fotos[0], talla: el.talla, color: el.color, cantidad: actual.cantidad });
    $("#ventana-producto").close();
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
  const principal = $("#principal");
  $("#ampliar").addEventListener("click", ev => { const a = principal.classList.toggle("ampliado"); ev.currentTarget.textContent = a ? "Ver completo" : "Ampliar"; });
  document.querySelectorAll("#ficha .miniaturas button").forEach(b => b.addEventListener("click", () => {
    const im = imagenes[+b.dataset.i];
    $("#img-principal").src = im.src;
    principal.classList.toggle("es-afiche", im.tipo === "afiche");
    principal.classList.remove("ampliado");
    principal.scrollTop = 0; principal.scrollLeft = 0;
    $("#ampliar").hidden = im.tipo !== "afiche";
    $("#ampliar").textContent = "Ampliar";
    document.querySelectorAll("#ficha .miniaturas button").forEach(x => x.setAttribute("aria-current", x === b));
  }));
  $("#ventana-producto").showModal();
  $("#ventana-producto").scrollTop = 0;
}

/* ---------- Pedido ---------- */
let pedido = [];
try { pedido = JSON.parse(localStorage.getItem("angie-pedido") || "[]"); } catch (e) { pedido = []; }
const guardar = () => { try { localStorage.setItem("angie-pedido", JSON.stringify(pedido)); } catch (e) {} };
const datosCliente = { nombre: "", entrega: "retiro", comuna: "", nota: "" };

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
  if (datosCliente.nombre) extra.push(`Nombre: ${datosCliente.nombre}`);
  if (datosCliente.nota) extra.push(`Comentario: ${datosCliente.nota}`);
  return ["Hola Angie's Secret 👋 Quiero hacer este pedido:", "", ...lineas, "", ...extra, "", "¿Me confirman disponibilidad y precio? Gracias."].join("\n");
}
function pintarPedido() {
  const n = pedido.reduce((s, x) => s + x.cantidad, 0);
  if (!n) {
    $("#pedido").innerHTML = `<h2 id="pedido-titulo">Tu pedido</h2><p class="intro" style="margin-top:12px">Tu pedido está vacío. Agrega productos desde el catálogo.</p><button type="button" class="boton boton-principal" data-ir-catalogo>Ver el catálogo</button>`;
    return;
  }
  $("#pedido").innerHTML = `
    <h2 id="pedido-titulo">Tu pedido</h2>
    <p class="letra-chica" style="margin-top:0">${n} ${n === 1 ? "producto" : "productos"}. Revisa y envíalo por WhatsApp.</p>
    <ul class="lista-pedido">${pedido.map((x, i) => `<li><img src="${foto(x.foto)}" alt=""><div><strong>${esc(x.n)}</strong><span>${esc(detalleItem(x))}</span></div><button type="button" class="boton-texto" data-quitar="${i}" aria-label="Quitar ${esc(x.n)}">Quitar</button></li>`).join("")}</ul>
    <fieldset><legend>¿Cómo lo recibes?</legend>
      <div class="entrega">
        <label class="opcion"><input type="radio" name="entrega" value="retiro" ${datosCliente.entrega === "retiro" ? "checked" : ""}><span>Retiro en la tienda, Renca</span></label>
        <label class="opcion"><input type="radio" name="entrega" value="envio" ${datosCliente.entrega === "envio" ? "checked" : ""}><span>Envío a domicilio (todo Chile)</span></label>
      </div>
    </fieldset>
    <div class="campo" id="campo-comuna" ${datosCliente.entrega === "envio" ? "" : "hidden"}><label for="comuna">Comuna y ciudad</label><input id="comuna" value="${esc(datosCliente.comuna)}" placeholder="Ej: Maipú, Santiago" autocomplete="address-level2"></div>
    <div class="campo"><label for="nombre">Tu nombre (opcional)</label><input id="nombre" value="${esc(datosCliente.nombre)}" autocomplete="given-name"></div>
    <div class="campo"><label for="nota">Comentario (opcional)</label><textarea id="nota" placeholder="Ej: es para regalo">${esc(datosCliente.nota)}</textarea></div>
    <div class="ficha-acciones">
      <a class="boton boton-wsp" id="enviar-pedido" href="${wspUrl(mensajePedido())}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-wsp"/></svg>Enviar pedido por WhatsApp</a>
      <button type="button" class="boton-texto" id="vaciar">Vaciar pedido</button>
    </div>
    <p class="letra-chica">Se abrirá WhatsApp con tu pedido ya escrito. Solo tienes que tocar enviar.</p>`;
}
function abrirPedido() { pintarPedido(); $("#ventana-pedido").showModal(); }
$("#abrir-pedido").addEventListener("click", abrirPedido);
$("#pedido").addEventListener("click", e => {
  const q = e.target.closest("[data-quitar]");
  if (q) { pedido.splice(+q.dataset.quitar, 1); guardar(); pintarBarra(); pintarPedido(); return; }
  if (e.target.closest("#vaciar")) { pedido = []; guardar(); pintarBarra(); pintarPedido(); return; }
  if (e.target.closest("[data-ir-catalogo]")) { $("#ventana-pedido").close(); location.hash = "catalogo"; }
});
$("#pedido").addEventListener("input", e => {
  const t = e.target;
  if (t.name === "entrega") { datosCliente.entrega = t.value; $("#campo-comuna").hidden = t.value !== "envio"; }
  if (t.id === "comuna") datosCliente.comuna = t.value;
  if (t.id === "nombre") datosCliente.nombre = t.value;
  if (t.id === "nota") datosCliente.nota = t.value;
  const a = $("#enviar-pedido"); if (a) a.href = wspUrl(mensajePedido());
});

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
pintar();
pintarBarra();
if (params.get("producto")) abrirProducto(params.get("producto"));
