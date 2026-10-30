/* Angie's Secret: funcionamiento del sitio (catálogo, fichas, pedido y letrero).
   Usa los datos de js/datos.js, que se carga antes que este archivo. */

/* =========================================================================
   FUNCIONAMIENTO (no es necesario tocar lo que sigue)
   ========================================================================= */
const IMGS = window.__IMGS__ || {};
const foto = k => IMGS[k] || `img/${k}.webp`;
// Secciones de ropa interior: llevan el aviso del derecho a retracto por higiene.
const CATS_INTERIOR = new Set(["sostenes", "calzones", "fajas", "interior-hombre"]);
// Prendas cuya descripción viene del fabricante y podría leerse como de salud (diabéticos, circulación, cobre, fajas).
const DESCRIPCION_FABRICANTE = /diabet|circulacion|cobre|faja|modelador/;
const afiche = id => IMGS["a:" + id] || `fichas/${id}.webp`;
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = s => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const wspUrl = texto => `https://wa.me/${TIENDA.whatsapp}?text=${encodeURIComponent(texto)}`;
// WhatsApp de consultas: problemas con la página o un pedido, datos personales y lo que el ayudante no resuelve.
const wspConsultas = texto => `https://wa.me/${TIENDA.whatsappConsultas}?text=${encodeURIComponent(texto)}`;
// Medición anónima de uso (js/medicion.js). Si la persona pidió no ser medida, no hace nada.
function medir(e, d) { try { if (window.__medir) window.__medir(e, d || {}); else (window.__colaMedir = window.__colaMedir || []).push([e, d || {}]); } catch (x) {} }
// Textos con forma de código o comandos (intentos de ataque): se avisan al vigía y nunca se ejecutan.
const PARECE_CODIGO = /<\s*\/?\s*(script|img|iframe|svg)|javascript:|\bon\w+\s*=|union\s+select|drop\s+table|\.\.\/|\$\{|\{\{|<\?php/i;
function revisarTexto(texto, campo) { if (PARECE_CODIGO.test(String(texto))) { medir("inyeccion", { campo }); return true; } return false; }
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

/* ---------- Buscador inteligente ----------
   Entiende palabras mal escritas, sinónimos y para quién es la prenda, y siempre busca
   dentro del catálogo. Si no encuentra nada, se ofrece pedirlo por WhatsApp. */
const PARADAS = new Set("de del la el los las lo un una unos unas y o e a al con sin para por en que quiero queria busco buscando necesito tienen tiene tendran hay venden vende algo alguna alguno algun me mi mis tu su porfa favor hola buenas buenos dias tardes tipo como muy mas talla tallas color colores ropa prenda prendas unidad unidades no si se me te le les nos es son esta estan este esto esa ese eso hace hacen puedo puede pueden podria quisiera gustaria saber cual cuales cuanto cuanta cuantos donde cuando sobre solo tambien ya aqui ahi ver tengo tenga".split(" "));
const PUBLICO = {
  mujer: "mujer mujeres dama damas senora senoras femenino femenina ella",
  hombre: "hombre hombres varon varones caballero caballeros masculino masculina",
  ninos: "nino nina ninos ninas infantil infantiles guagua guaguas bebe bebes hijo hija hijos hijas kids"
};
// Grupos de palabras que significan lo mismo. La primera parte es cómo se lo explicamos a la persona.
const GRUPOS = [
  ["sostenes", "sosten sostenes brasier brasieres bracier brassier bra bras sujetador sujetadores corpino corpinos peto petos"],
  ["calzones", "calzon calzones bombacha bombachas tanga tangas colales colaless cachetero cacheteros bikini pantaleta pantaletas culotte culottes sacapierna"],
  ["bóxer y slip", "boxer boxers slip slips calzoncillo calzoncillos"],
  ["fajas", "faja fajas reductor reductora modelador modeladora cinturilla cinturillas body bodys"],
  ["pijamas", "pijama pijamas piyama piyamas pyjama camison camisones bata batas babydoll dormir"],
  ["calzas", "calza calzas leggins leggings licra lycra"],
  ["pantalones y buzos", "pantalon pantalones buzo buzos jogger joggers jeans cargo palazzo"],
  ["poleras", "polera poleras remera remeras camiseta camisetas playera playeras beatle"],
  ["blusas", "blusa blusas"],
  ["vestidos", "vestido vestidos solera soleras tunica tunicas enterito enteritos jumpsuit kimono"],
  ["chalecos, sweaters y polerones", "chaleco chalecos sweater sweaters sueter sueters cardigan poleron polerones hoodie chaqueta"],
  ["polar y térmico", "polar polares chiporro termico termica termicos termicas abrigado abrigada"],
  ["calcetas", "calceta calcetas calcetin calcetines soquete soquetes tobillera tobilleras talonera taloneras bucanera bucaneras"],
  ["pantys", "panty pantys medias ballerina ballerinas"],
  ["gorros", "gorro gorros beanie"],
  ["bufandas", "bufanda bufandas"],
  ["banano", "banano bananos canguro rinonera koala"],
  ["pañuelos", "panuelo panuelos"],
  ["pecheras", "pechera pecheras delantal delantales"],
  // "Lencería" abarca sostenes, calzones, fajas y conjuntos (las palabras exactas se resuelven antes en su propio grupo).
  ["lencería", "lenceria encaje sexy sosten sostenes calzon calzones faja fajas"],
  ["ropa interior", "interior"]
];
function fon(palabra) {
  let s = norm(palabra).replace(/[^a-z]/g, "");
  s = s.replace(/ch/g, "1").replace(/h/g, "").replace(/ll/g, "y").replace(/v/g, "b").replace(/w/g, "u").replace(/z/g, "s")
    .replace(/c([ei])/g, "s$1").replace(/qu/g, "k").replace(/c/g, "k").replace(/1/g, "ch").replace(/g([ei])/g, "j$1")
    .replace(/x/g, "ks").replace(/(.)\1+/g, "$1");
  if (s.length > 3 && s.endsWith("s")) s = s.slice(0, -1);
  if (s.length > 3 && /[^aeiou]e$/.test(s)) s = s.slice(0, -1);
  return s.replace(/y$/, "i");
}
function distancia(a, b) {
  if (Math.abs(a.length - b.length) > 3) return 9;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    const c = a[i - 1] === b[j - 1] ? 0 : 1;
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[a.length][b.length];
}
// Cuántas letras puede tener mal una palabra según su largo (las cortas deben venir bien escritas).
const tolerancia = n => n <= 4 ? 0 : n <= 6 ? 1 : n <= 9 ? 2 : 3;
let indice = null;
function crearIndice() {
  const palabras = texto => norm(texto).split(/[^a-z]+/).filter(w => w.length > 1 && !PARADAS.has(w));
  const vocab = new Map();
  const conjunto = texto => { const s = new Set(); palabras(texto).forEach(w => { const f = fon(w); if (f.length < 2) return; s.add(f); if (!vocab.has(f)) vocab.set(f, w); }); return s; };
  const nombreCat = Object.fromEntries(CATEGORIAS);
  // "Ropa interior" abarca las secciones de ropa interior y la ropa interior de niños (marcada interior: true).
  const productos = PRODUCTOS.map(p => ({ p, campos: [[conjunto(p.n), 3], [conjunto(`${p.k || ""}${CATS_INTERIOR.has(p.cat) || p.interior ? " interior" : ""}`), 2.5], [conjunto(nombreCat[p.cat] || ""), 2], [conjunto(p.d), 1], [conjunto((p.col || []).join(" ")), 1]] }));
  const grupos = GRUPOS.map(([etiqueta, ws]) => ({ etiqueta, f: new Set(ws.split(" ").map(fon)) }));
  const publico = Object.entries(PUBLICO).map(([clave, ws]) => ({ clave, f: new Set(ws.split(" ").map(fon)) }));
  indice = { productos, grupos, publico, vocab };
}
// Busca a qué se refiere una palabra: grupo de sinónimos, palabra del catálogo, corrección o comienzo de palabra.
function entenderPalabra(w) {
  const f = fon(w);
  const g = indice.grupos.find(x => x.f.has(f));
  if (g) return { terminos: g.f, etiqueta: g.etiqueta, tipo: norm(w) === norm(g.etiqueta) ? "igual" : "sinonimo", prenda: true };
  if (indice.vocab.has(f)) return { terminos: new Set([f]), etiqueta: indice.vocab.get(f), tipo: "igual" };
  const tol = tolerancia(f.length);
  if (tol) {
    let mejor = null, dMin = tol + 1;
    for (const x of indice.grupos) for (const t of x.f) { const d = distancia(f, t); if (d < dMin) { dMin = d; mejor = { terminos: x.f, etiqueta: x.etiqueta, tipo: "corregida", prenda: true }; } }
    for (const [t, original] of indice.vocab) { const d = distancia(f, t); if (d < dMin) { dMin = d; mejor = { terminos: new Set([t]), etiqueta: original, tipo: "corregida" }; } }
    if (mejor) return mejor;
  }
  if (f.length >= 3) {
    const empiezan = new Set(), etiquetas = [];
    let prenda = false;
    for (const x of indice.grupos) if ([...x.f].some(t => t.startsWith(f))) { x.f.forEach(t => empiezan.add(t)); etiquetas.push(x.etiqueta); prenda = true; }
    for (const [t, original] of indice.vocab) if (t.startsWith(f)) { empiezan.add(t); if (etiquetas.length < 3 && !etiquetas.includes(original)) etiquetas.push(original); }
    if (empiezan.size) return { terminos: empiezan, etiqueta: etiquetas.slice(0, 3).join(" o "), tipo: "comienzo", prenda };
  }
  return null;
}
// Tallas que pide la persona ("talla 46", "xl", "3xl", "40c") y si cada prenda la tiene según su ficha.
// Las letras se igualan (XXL = 2XL). Si la ficha no dice tallas, o usa otro sistema (letras y la persona pidió un número),
// no se sabe: la prenda se muestra igual, después de las que sí la tienen.
const ORDEN_LETRAS = ["xs", "s", "m", "l", "xl", "2xl", "3xl", "4xl", "5xl"];
const LETRA = "x{0,4}l|[2-5] ?xl|xs|s|m";
function normTalla(t) {
  t = norm(t).replace(/\s+/g, "");
  const x = t.match(/^(x+)l$/);
  return x && x[1].length >= 2 ? x[1].length + "xl" : t;
}
function tallaPedida(texto) {
  const n = norm(texto);
  const m = n.match(new RegExp(`\\btallas?\\s*(?:n(?:ro|umero)?\\.?\\s*)?(\\d{1,2}\\s?[a-f]{0,2}|${LETRA}|unica|especial)\\b`)) || n.match(/\b(x{1,4}l|[2-5] ?xl)\b/);
  return m ? { texto: m[0], talla: normTalla(m[1]) } : null;
}
function tallasFicha(p) {
  const t = norm([...(p.tallas || []), p.tallasTexto || ""].join(", ")).replace(/\(/g, " ").replace(/\)/g, " ");
  const r = { nums: [], letras: new Set(), copas: new Set(), especial: /unica|especial/.test(t) };
  for (const m of t.matchAll(/(\d{1,2})\s*(?:a|-|hasta(?: talla)?)\s*(\d{1,2})\b/g)) r.nums.push([+m[1], +m[2]]);
  for (const m of t.matchAll(/(?:^|[^\da-z])(\d{1,2})([a-f]{0,2})(?![\da-z])/g)) { r.nums.push([+m[1], +m[1]]); if (m[2]) r.copas.add(m[2]); }
  for (const m of t.matchAll(new RegExp(`(?:^|[^\\da-z])(${LETRA})(?![\\da-z])`, "g"))) r.letras.add(normTalla(m[1]));
  for (const m of t.matchAll(new RegExp(`\\b(${LETRA}) (?:a|hasta) (?:talla )?(${LETRA})\\b`, "g"))) {
    const a = ORDEN_LETRAS.indexOf(normTalla(m[1])), b = ORDEN_LETRAS.indexOf(normTalla(m[2]));
    if (a >= 0 && b >= a) ORDEN_LETRAS.slice(a, b + 1).forEach(x => r.letras.add(x));
  }
  if (/desde m\b/.test(t)) ORDEN_LETRAS.slice(2).forEach(x => r.letras.add(x));
  for (const m of t.matchAll(/copas? ([a-f ,y]+)/g)) m[1].split(/[ ,]+|\by\b/).filter(c => /^[a-f]{1,2}$/.test(c)).forEach(c => r.copas.add(c));
  return r;
}
// true: la ficha dice que tiene esa talla; false: dice tallas y esa no está; null: no se sabe.
function tieneTalla(p, talla) {
  const d = tallasFicha(p);
  if (/^\d/.test(talla)) {
    const num = parseInt(talla, 10), copa = talla.replace(/^\d+/, "");
    if (!d.nums.length) return null;
    if (!d.nums.some(([a, b]) => num >= a && num <= b)) return false;
    return copa && d.copas.size ? d.copas.has(copa) : true;
  }
  if (talla === "unica" || talla === "especial") return d.especial || null;
  return d.letras.size ? d.letras.has(talla) : null;
}
// Palabras de lencería: con ellas la búsqueda muestra solo prendas de adultos ("peto" sí incluye los de niña).
const LENCERIA = /\b(sosten\w*|bra|bras|brasier\w*|bracier\w*|brassier\w*|sujetador\w*|corpin\w*|colal\w*|tangas?|hilos?|cachetero\w*|bikinis?|pantaletas?|encaje\w*|sexy|lenceria|babydoll|camison\w*|portaligas|transparen\w*|fajas?|reductor\w*|modelador\w*|cinturillas?|body|bodys|conjuntos?|push|copas?|maternal\w*)\b/;
const esLenceria = (texto, usadas) => LENCERIA.test(texto) || usadas.some(u => ["lencería", "fajas"].includes(u.etiqueta) || (u.etiqueta === "sostenes" && u.f !== fon("peto")));
const esDeNinos = p => p.para.includes("ninos");
const cacheBusqueda = new Map();
function buscarInteligente(consulta) {
  const q = String(consulta || "").trim();
  if (cacheBusqueda.has(q)) return cacheBusqueda.get(q);
  if (!indice) crearIndice();
  const pedida = tallaPedida(q);
  const texto = norm(q).replace(pedida ? pedida.texto : /$^/, " ").replace(/ropa interior/g, "interior").replace(/baby ?doll/g, "babydoll").replace(/cuello (alto|tortuga)/g, "beatle");
  const palabras = texto.split(/[^a-z]+/).filter(w => w.length > 1 && !PARADAS.has(w));
  let publico = null;
  const contenido = [];
  for (const w of palabras) {
    const f = fon(w), aud = indice.publico.find(x => x.f.has(f));
    if (aud) publico = aud.clave; else contenido.push(w);
  }
  const entendido = [], desconocidas = [], usadas = [];
  for (const w of contenido) {
    const r = entenderPalabra(w);
    if (!r) { desconocidas.push(w); continue; }
    usadas.push({ ...r, f: fon(w) });
    entendido.push(r.tipo === "igual" ? r.etiqueta : `«${w}» = ${r.etiqueta}`);
  }
  let lista;
  // Regla de la marca: la ropa para niños se muestra siempre aparte, nunca junto a lencería ni ropa de adultos.
  const deNinos = PRODUCTOS.filter(p => p.para.includes("ninos"));
  if (publico === "ninos" && !usadas.length) {
    lista = deNinos;
  } else if (!usadas.length) {
    lista = publico && !desconocidas.length ? PRODUCTOS.filter(p => p.para.includes(publico)) : [];
  } else if (desconocidas.length && usadas.every(u => u.tipo === "corregida" || u.tipo === "comienzo")) {
    // Hay palabras que no conocemos y el resto son solo parecidos: mejor ofrecer pedirlo que mostrar algo que no es.
    lista = publico === "ninos" ? deNinos : [];
  } else {
    // Para niños se busca solo entre la ropa de niños ("calzones para niña" muestra los calzones de niña).
    const base = publico === "ninos" ? indice.productos.filter(({ p }) => p.para.includes("ninos")) : indice.productos;
    const pesos = base.map(({ p, campos }) => ({ p, w: usadas.map(u => {
      let mejor = 0;
      for (const [set, peso] of campos) if (peso > mejor && [...u.terminos].some(t => set.has(t))) mejor = peso;
      // La palabra tal como se escribió ("colaless", "ballerina") pesa un poco más que sus sinónimos.
      if (mejor && (campos[0][0].has(u.f) || campos[1][0].has(u.f))) mejor += 0.5;
      return mejor;
    }) }));
    // Si la persona nombró un tipo de prenda, solo cuentan las prendas de ese tipo (por nombre o palabra clave;
    // si ninguna lo tiene así, por la categoría). Las demás palabras (color, tela, largo) solo ordenan.
    const minimo = usadas.map((u, i) => !u.prenda ? 0 : pesos.some(x => x.w[i] >= 2.5) ? 2.5 : 2);
    const puntajes = pesos.filter(x => x.w.every((w, i) => w >= minimo[i]))
      .map(x => ({ p: x.p, total: x.w.reduce((a, b) => a + b, 0) }))
      .filter(x => x.total && (!publico || x.p.para.includes(publico)));
    // Se muestran las prendas que más coinciden y las que tienen al menos la mitad de ese puntaje, de mayor a menor.
    const tope = Math.max(0, ...puntajes.map(x => x.total));
    lista = puntajes.filter(x => x.total >= tope * 0.5).sort((a, b) => b.total - a.total).map(x => x.p);
    if (publico === "ninos" && !lista.length) lista = deNinos;
  }
  // Regla de venta: la búsqueda muestra todo lo que coincide, de adultos y de niños ("bóxer" muestra los de hombre y los
  // de niño; "calzones", los de dama y los de niña). Las de niños van en su propia sección del catálogo y nunca se intercalan:
  // primero el grupo de la prenda que más coincide. Regla de la marca: con palabras de lencería (sostén, colaless, encaje,
  // fajas...) nunca aparecen prendas de niños, y los textos que escribe la tienda (ayudante, mensajes) siguen separados.
  if (publico !== "ninos" && lista.length && esLenceria(texto, usadas)) lista = lista.filter(p => !p.para.includes("ninos"));
  if (publico !== "ninos" && lista.length) {
    const ninosPrimero = lista[0].para.includes("ninos");
    lista = [...lista.filter(p => p.para.includes("ninos") === ninosPrimero), ...lista.filter(p => p.para.includes("ninos") !== ninosPrimero)];
  }
  // Si pidió una talla: primero las prendas que la tienen según su ficha, después las que no dicen; las que no la tienen, no.
  let talla = null;
  if (pedida && (usadas.length || publico)) {
    const si = lista.filter(p => tieneTalla(p, pedida.talla) === true), nose = lista.filter(p => tieneTalla(p, pedida.talla) === null);
    lista = [...si, ...nose];
    talla = { pedida: pedida.talla.toUpperCase(), confirmadas: si.length, sinDato: nose.length };
    entendido.push(`talla ${talla.pedida}`);
  }
  if (publico) entendido.push(publico === "ninos" ? "ropa para niños" : `para ${publico}`);
  // Regla de la marca: si la búsqueda es para niños, no se repite ninguna otra palabra (por ejemplo, de ropa interior).
  if (publico === "ninos") entendido.splice(0, entendido.length, "ropa para niños");
  const r = { q, lista, ids: new Set(lista.map(p => p.id)), entendido, desconocidas, publico, talla, prenda: usadas.some(u => u.prenda), regalo: /\bregalo/.test(texto),
    // El primer grupo (adultos o niños, el que más coincide) y el otro, para mostrarlos por separado.
    principal: lista.filter(p => esDeNinos(p) === (lista.length ? esDeNinos(lista[0]) : false)), otro: lista.filter(p => esDeNinos(p) !== (lista.length ? esDeNinos(lista[0]) : false)) };
  cacheBusqueda.set(q, r);
  return r;
}

// Prendas que hay en la tienda (PRODUCTOS_TIENDA de js/datos.js) según lo que escribe la persona, aunque no estén
// en el catálogo de la página. Regla de la marca: si busca para niñas o niños, solo prendas de niños; si no, nunca.
const AUDIENCIA = new Set(["hombre", "hombres", "mujer", "mujeres", "senora", "senoras", "dama", "damas", "varon", "caballero", "nino", "nina", "ninos", "ninas", "hijo", "hija", "guagua"]);
function enTienda(texto) {
  if (typeof PRODUCTOS_TIENDA === "undefined") return [];
  const n = norm(texto);
  const palabras = [...new Set(n.split(/[^a-z]+/).filter(w => w.length > 2 && !PARADAS.has(w) && !AUDIENCIA.has(w)).map(fon))];
  if (!palabras.length) return [];
  const paraNinos = /\b(nin[oa]s?|hij[oa]s?|colegio|escolar|infantil|guaguas?)\b/.test(n);
  const pideBoxer = /\b(boxer|calzoncillos?)\b/.test(n);
  const res = [];
  for (const g of PRODUCTOS_TIENDA) for (const i of g.items) {
    if (!!i.ninos !== paraNinos || (i.soloSiPiden && !pideBoxer)) continue;
    const ws = new Set(norm(`${i.n} ${i.k || ""}`).split(/[^a-z]+/).filter(w => w.length > 2).map(fon));
    const coincide = palabras.filter(w => ws.has(w)).length;
    if (coincide) res.push({ n: i.n, grupo: g.grupo, coincide, completo: coincide === palabras.length });
  }
  const max = Math.max(0, ...res.map(x => x.coincide));
  return res.filter(x => x.coincide === max);
}
// Lo que hay en la tienda y coincide con todo lo que se escribió (para nombrarlo junto a los resultados del catálogo).
const tiendaExacta = q => { const t = enTienda(q).filter(x => x.completo); return t.length && t.length <= 4 ? t : []; };
// Regla de venta: si lo tenemos, se muestra; si no, que nos escriba y lo buscamos con los proveedores para conseguírselo.
const PROMESA_CONSEGUIR = "si no lo tenemos, lo buscamos con nuestros proveedores para conseguírtelo";
function pedirPorWhatsApp(q) { return wspUrl(`Hola Angie's Secret 👋 Estoy buscando: ${q}. ¿Lo tienen o me lo pueden conseguir? Talla y color: `); }
const iconoWsp = '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-wsp"/></svg>';
function bloqueConseguir(q, titulo) {
  const t = tiendaExacta(q);
  return `<div class="conseguir">${t.length ? `<p><strong>En la tienda también hay</strong> ${esc(listaTienda(t))}.</p>` : ""}
    <p>${titulo || "¿No ves exactamente lo que buscas?"} Escríbenos: te mostramos lo que hay en la tienda y, ${PROMESA_CONSEGUIR}.</p>
    <a class="boton boton-wsp" href="${pedirPorWhatsApp(q)}" target="_blank" rel="noopener">${iconoWsp}Pedir «${esc(q)}» por WhatsApp</a></div>`;
}
const listaTienda = its => its.map(x => x.n.charAt(0).toLowerCase() + x.n.slice(1)).join(", ").replace(/, ([^,]*)$/, " y $1");

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
  if (estado.q && !buscarInteligente(estado.q).ids.has(p.id)) return false;
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
// Prendas de niños que también se muestran en una sección de adultos (después de las de adultos y con su subtítulo):
// los bóxer y calzoncillos de niño en "Ropa interior de hombre" y las camisetas de niños en "Camisetas y primeras capas".
// Solo con "Todos" en "¿Para quién?". Regla de la marca: nunca en secciones de lencería (sostenes, calzones, fajas).
const TAMBIEN_EN = {
  "interior-hombre": p => esDeNinos(p) && /\b(boxer|calzoncillo|slip)/.test(norm(p.n)),
  "camisetas": p => esDeNinos(p) && /^camiseta/.test(norm(p.n))
};
function pintar() {
  document.querySelectorAll("[data-temporada]").forEach(b => b.setAttribute("aria-pressed", b.dataset.temporada === estado.temporada));
  document.querySelectorAll("[data-para]").forEach(b => b.setAttribute("aria-pressed", b.dataset.para === estado.para));
  const lista = PRODUCTOS.filter(visible);
  const r = estado.q ? buscarInteligente(estado.q) : null;
  let html = "";
  const secciones = [], yaMostradas = new Set();
  const orden = (a, b) => (a.t === "todo") - (b.t === "todo");
  for (const [cat, nombre] of CATEGORIAS) {
    // Al buscar, cada prenda sale una sola vez (en la primera sección donde aparece).
    const items = lista.filter(p => p.cat === cat && !(r && yaMostradas.has(p.id))).sort(orden);
    const extra = estado.para === "todos" && TAMBIEN_EN[cat] ? lista.filter(p => TAMBIEN_EN[cat](p) && !(r && yaMostradas.has(p.id))).sort(orden) : [];
    if (!items.length && !extra.length) continue;
    [...items, ...extra].forEach(p => yaMostradas.add(p.id));
    // Sin cantidades: el cliente ve opciones, no cuántas prendas hay.
    secciones.push(`<a class="chip" href="#g-${cat}">${esc(nombre)}</a>`);
    html += `<section class="grupo" aria-labelledby="g-${cat}"><h3 id="g-${cat}">${nombre}</h3>${items.length ? `<ul class="productos">${items.map(tarjeta).join("")}</ul>` : ""}${extra.length ? `<h4 class="sub-ninos">Para niños</h4><ul class="productos">${extra.map(tarjeta).join("")}</ul>` : ""}</section>`;
  }
  if (!lista.length) {
    // ¿Hay resultados con otros filtros? Se ofrece verlos antes que nada.
    const enOtros = r && r.lista.length && (estado.temporada !== "todo" || estado.para !== "todos");
    html = `<div class="vacio">${enOtros ? `<p>Con estos filtros no aparece «${esc(estado.q)}», pero sí lo tenemos en otras temporadas o para otro público.</p><p><button type="button" class="boton boton-principal" data-ver-todo>Ver todas las opciones</button></p>` : ""}
      ${estado.q ? bloqueConseguir(estado.q, enOtros ? "" : `No vemos «${esc(estado.q)}» en el catálogo de la página.`) : `<p>No hay prendas con estos filtros. Prueba con “Todo” en temporada o escríbenos por WhatsApp: te mostramos lo que hay en la tienda.</p><a class="boton boton-wsp" href="${wspUrl("Hola Angie's Secret 👋 Estoy buscando: ")}" target="_blank" rel="noopener">${iconoWsp}Preguntar por WhatsApp</a>`}</div>`;
  } else if (estado.q) {
    // Regla de venta: además de lo que hay, siempre la opción de pedirlo y que se lo consigamos.
    html += bloqueConseguir(estado.q);
  }
  // Con varias secciones, un índice para saltar a la que interesa (el catálogo es largo).
  if (secciones.length > 2) html = `<nav class="saltos" aria-label="Secciones del catálogo">${secciones.join("")}</nav>` + html;
  $("#listado").innerHTML = html;
  const t = estado.temporada === "todo" ? "de todas las temporadas" : `${NOMBRE_T[estado.temporada]} y para todo el año`;
  const entendido = r ? r.entendido : [];
  const notaTalla = r && r.talla ? ` Primero las que tienen talla ${r.talla.pedida} según su ficha; en las demás te confirmamos la talla por WhatsApp.` : "";
  $("#resumen").textContent = lista.length ? `${r ? `Buscaste «${estado.q}»${entendido.length ? ` (entendimos: ${entendido.join(", ")})` : ""}. Estas son las opciones${NOMBRE_P[estado.para]} ${t}.${notaTalla}` : `Prendas${NOMBRE_P[estado.para]} ${t}.`}` : "";
  $("#avanzar-catalogo").textContent = lista.length ? (r ? "Avanzar: ver las opciones" : "Avanzar: ver las prendas") : "Avanzar";
  const u = new URL(location.href);
  u.searchParams.set("temporada", estado.temporada);
  estado.para === "todos" ? u.searchParams.delete("para") : u.searchParams.set("para", estado.para);
  try { history.replaceState(null, "", u); } catch (e) {}
  pintarRegalo();
}
document.querySelectorAll("[data-temporada]").forEach(b => b.addEventListener("click", () => { estado.temporada = b.dataset.temporada; pintar(); }));
document.querySelectorAll("[data-para]").forEach(b => b.addEventListener("click", () => { estado.para = b.dataset.para; pintar(); }));
let espera;
let esperaMedir;
$("#buscar").addEventListener("input", e => {
  clearTimeout(espera); espera = setTimeout(() => { estado.q = e.target.value.trim(); pintar(); }, 180);
  clearTimeout(esperaMedir); esperaMedir = setTimeout(() => {
    const q = e.target.value.trim(); if (q.length < 2) return;
    revisarTexto(q, "catalogo"); medir("buscar", { q, res: buscarInteligente(q).lista.length, lugar: "catalogo" });
  }, 1500);
});
$("#listado").addEventListener("click", e => {
  const b = e.target.closest("[data-abrir]"); if (b) abrirProducto(b.dataset.abrir);
  if (e.target.closest("[data-ver-todo]")) { estado.temporada = "todo"; estado.para = "todos"; pintar(); $("#resumen").scrollIntoView({ block: "start" }); }
});
$("#avanzar-catalogo").addEventListener("click", () => { const r = $("#resumen"); r.scrollIntoView({ block: "start" }); r.focus({ preventScroll: true }); });

/* ---------- Buscador de la portada ---------- */
const formPortada = $("#buscador-portada"), panelPortada = $("#sugerencias-portada");
function irAlCatalogo(r) {
  estado.temporada = "todo";
  estado.para = r.publico || "todos";
  estado.q = r.q;
  $("#buscar").value = r.q;
  pintar();
  const res = $("#resumen"); res.scrollIntoView({ block: "start" }); res.focus({ preventScroll: true });
}
function pintarSugerencias(q) {
  if (q.length < 2) { panelPortada.hidden = true; panelPortada.innerHTML = ""; return; }
  const r = buscarInteligente(q);
  const encargo = $("#encargo-wsp"); if (encargo) encargo.href = pedirPorWhatsApp(q);
  const entendimos = r.entendido.length ? `<p class="entendimos">Entendimos: <strong>${r.entendido.map(esc).join(" · ")}</strong></p>` : "";
  const regalo = r.regalo ? `<p class="letra-chica">¿Es para regalo? <a href="#regalo">Arma tu regalo</a>. ${esc(textoEnvoltorio("dato"))}</p>` : "";
  if (!r.lista.length) {
    const tienda = enTienda(q).slice(0, 6);
    panelPortada.innerHTML = `${entendimos}<p class="sin-resultado">${tienda.length ? `«${esc(q)}» todavía no tiene foto en la página, pero <strong>en la tienda sí tenemos ${esc(listaTienda(tienda))}</strong>. Pídelo por WhatsApp y te confirmamos tallas, colores y precio.` : `No vemos «${esc(q)}» en el catálogo de la página. Escríbenos: te mostramos lo que hay en la tienda y, ${PROMESA_CONSEGUIR}.`}</p>
      <div class="acciones-sugerencia conseguir-portada"><a class="boton boton-wsp" href="${pedirPorWhatsApp(q)}" target="_blank" rel="noopener">${iconoWsp}Pedir «${esc(q)}» por WhatsApp</a><a class="boton-texto" href="#encargo">Ver pedidos especiales</a></div>`;
  } else {
    // Los resultados se muestran como opciones, sin decir cuántos hay. Las de niños, en su propia fila.
    const fila = ps => `<ul class="sugerencias-lista">${ps.map(p => `<li><button type="button" data-abrir-sugerencia="${p.id}"><img src="${foto(p.fotos[0])}" alt="" width="44" height="55" loading="lazy" decoding="async"><span>${esc(p.n)}</span></button></li>`).join("")}</ul>`;
    const otro = r.otro.length ? `<p class="sugerencias-otro">${esDeNinos(r.otro[0]) ? "Para niñas y niños" : "Para adultos"}</p>${fila(r.otro.slice(0, 2))}` : "";
    panelPortada.innerHTML = `${entendimos}${fila(r.principal.slice(0, r.otro.length ? 3 : 4))}${otro}
      ${regalo}<button type="submit" class="boton boton-principal">${r.lista.length === 1 ? "Verlo en el catálogo" : "Ver todas las opciones en el catálogo"}</button>
      <p class="letra-chica conseguir-portada">${r.desconocidas.length ? `No reconocimos «${esc(r.desconocidas.join(" "))}». ` : "¿No es exactamente lo que buscas? "}<a href="${pedirPorWhatsApp(q)}" target="_blank" rel="noopener">Escríbenos</a> y, ${PROMESA_CONSEGUIR}.</p>`;
  }
  panelPortada.hidden = false;
}
let esperaPortada;
$("#buscar-portada").addEventListener("input", e => { clearTimeout(esperaPortada); esperaPortada = setTimeout(() => pintarSugerencias(e.target.value.trim()), 150); });
formPortada.addEventListener("submit", e => {
  e.preventDefault();
  const q = $("#buscar-portada").value.trim(); if (!q) return;
  const r = buscarInteligente(q);
  revisarTexto(q, "portada"); medir("buscar", { q, res: r.lista.length, lugar: "portada" });
  if (r.lista.length) irAlCatalogo(r); else pintarSugerencias(q);
});
panelPortada.addEventListener("click", e => { const b = e.target.closest("[data-abrir-sugerencia]"); if (b) abrirProducto(b.dataset.abrirSugerencia); });

/* ---------- Ficha del producto ---------- */
let actual = null;
function abrirProducto(id) {
  const p = PRODUCTOS.find(x => x.id === id); if (!p) return;
  actual = { p, cantidad: 1 };
  medir("producto", { id: p.id });
  const imagenes = [...p.fotos.map(k => ({ src: foto(k), tipo: "foto" })), ...(p.afiches || []).map(a => ({ src: afiche(a), tipo: "afiche" }))];
  const tallas = p.tallas || null;
  $("#ficha").innerHTML = `
    <div class="galeria">
      <div class="galeria-marco"><div class="galeria-principal${p.modelo ? " entera" : ""}" id="principal"><img id="img-principal" src="${imagenes[0].src}" alt="${esc(p.n)}" draggable="false"></div>${imagenes.length > 1 ? `<button type="button" class="galeria-flecha anterior" data-paso="-1" aria-label="Foto anterior"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-izq"/></svg></button><button type="button" class="galeria-flecha siguiente" data-paso="1" aria-label="Foto siguiente"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-der"/></svg></button><span class="galeria-contador" id="galeria-contador" aria-hidden="true">1 / ${imagenes.length}</span>` : ""}<button type="button" class="boton boton-borde boton-chico ampliar" id="ampliar" hidden>Ampliar</button></div>
      ${imagenes.length > 1 ? `<div class="miniaturas" role="group" aria-label="Fotos">${imagenes.map((im, i) => `<button type="button" data-i="${i}" aria-current="${i === 0}" aria-label="${im.tipo === "afiche" ? "Afiche con detalles" : "Foto " + (i + 1)}"><img src="${im.src}" alt="" loading="lazy">${im.tipo === "afiche" ? "<small>Afiche</small>" : ""}</button>`).join("")}</div>` : ""}
    </div>
    <div class="ficha-info">
      <h2 id="ficha-nombre">${esc(p.n)}</h2>
      <p>${esc(p.d)}</p>
      <p class="letra-chica">${esc(textoTallas(p))}${p.precio ? `. Precio: $${p.precio.toLocaleString("es-CL")}` : ""}</p>
      ${p.modelo ? `<p class="letra-chica nota-ficha">Foto referencial del proveedor: el color, el estampado o el envase pueden variar. Te confirmamos el modelo por WhatsApp antes de comprar.</p>` : ""}
      ${DESCRIPCION_FABRICANTE.test(norm(p.n + " " + p.d)) ? `<p class="letra-chica nota-ficha">Descripción según su fabricante. No es un producto médico ni reemplaza la indicación de un profesional de la salud.</p>` : ""}
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
        ${CATS_INTERIOR.has(p.cat) || p.interior ? `<p class="aviso-legal"><strong>Derecho a retracto:</strong> por higiene, la ropa interior no tiene derecho a retracto si se abrió o retiró su sello o envase de seguridad después de la entrega. <a href="terminos.html#cambios">Más información</a></p>` : ""}
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
    const antes = actual.cantidad;
    actual.cantidad = Math.max(1, Math.min(MAX_CANT, actual.cantidad + +b.dataset.cant));
    $("#cant").textContent = actual.cantidad;
    if (antes === MAX_CANT && +b.dataset.cant > 0) avisar("Para más de 20 unidades, consulta por venta por mayor");
  });
  f.addEventListener("submit", e => {
    e.preventDefault();
    const el = eleccion();
    const desde = $("#img-principal").getBoundingClientRect();
    agregar({ id: p.id, n: p.n, foto: p.fotos[0], talla: el.talla, color: el.color, cantidad: actual.cantidad });
    medir("agregar", { id: p.id, n: actual.cantidad });
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
// Desde la versión 4.5 cada registro tiene un código (AS-XXXX-XXXX) que da el servidor y que también queda en el Excel.
// El pedido pide el descuento si y solo si en este navegador hay un registro con código válido y sin usar.
let registro = null;
try { registro = JSON.parse(localStorage.getItem("angie-registro") || "null"); } catch (e) { registro = null; }
// Los registros de prueba de versiones anteriores (sin código) ya no cuentan.
if (registro && !registro.codigo && !registro.sinCodigo) { registro = null; try { localStorage.removeItem("angie-registro"); } catch (e) {} }
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
function avisarServidor(accion) {
  if (!registro || !registro.codigo) return;
  try { fetch("/api/bienvenida", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion, codigo: registro.codigo }), keepalive: true }).catch(() => {}); } catch (e) {}
}
function marcarBienvenidaUsada() { if (registro && !registro.usado) { registro.usado = ahora().fecha; guardarRegistro(); avisarServidor("usar"); } datosCliente.bienvenida = false; }
const lineaBienvenida = () => `Me registré en la página${registro && registro.fecha ? ` el ${fechaCorta(registro.fecha)}` : ""}${registro && registro.codigo ? ` (código ${registro.codigo})` : ""}, así que quiero usar mi descuento de bienvenida en esta primera compra (10% desde $15.000 o 15% desde $50.000) 😊`;
// Confirma con el servidor que el código existe. Si no existe (código inventado o borrado), se quita de este navegador.
async function verificarRegistro() {
  if (!registro || !registro.codigo) return;
  try {
    const r = await fetch(`/api/bienvenida?c=${encodeURIComponent(registro.codigo)}`, { cache: "no-store" });
    if (!r.ok || !(r.headers.get("content-type") || "").includes("json")) return; // sin conexión con el servidor: se confía en el registro local
    const d = await r.json();
    if (!d.existe) { olvidarRegistro(); return; }
    if (d.usado && !registro.usado) { registro.usado = d.usado; guardarRegistro(); datosCliente.bienvenida = false; }
    registro.verificado = true; guardarRegistro();
  } catch (e) {}
}
function olvidarRegistro() {
  registro = null; datosCliente.bienvenida = false;
  try { localStorage.removeItem("angie-registro"); } catch (e) {}
  if (typeof pintarCuentaRegalo === "function") pintarCuentaRegalo();
  const f = $("#form-registro"); if (f) { f.hidden = false; $("#registro-listo").hidden = true; }
}
// Envoltorio de regalo sin costo: hasta ENVOLTORIO.prendasGratis prendas y hasta ENVOLTORIO.gratisHasta (js/datos.js).
const ORDINAL = { 2: "segunda", 3: "tercera", 4: "cuarta", 5: "quinta", 6: "sexta" };
const envoltorioGratis = () => fechaHoy() <= ENVOLTORIO.gratisHasta;
const diaMes = f => { const [, m, d] = f.split("-").map(Number); return `${d} de ${MESES[m - 1]}`; };
function textoEnvoltorio(tipo) {
  const g = envoltorioGratis(), n = ENVOLTORIO.prendasGratis, hasta = diaMes(ENVOLTORIO.gratisHasta), sig = ORDINAL[n + 1] || "siguiente";
  if (!g) return tipo === "casilla" ? "Envolver para regalo (te cotizamos el envoltorio)" : "Te lo envolvemos para regalo. El costo del envoltorio te lo cotizamos por WhatsApp.";
  if (tipo === "casilla") return `Envolver para regalo (sin costo hasta ${n} prendas, pidiendo desde esta página y hasta el ${hasta})`;
  if (tipo === "regalo") return `Hasta el ${hasta}, el envoltorio es sin costo hasta ${n} prendas por pedido, solo si haces el pedido desde esta página; desde la ${sig} prenda, te lo cotizamos.`;
  if (tipo === "faq") return `Hasta el ${hasta} envolvemos sin costo hasta ${n} prendas por pedido, solo si haces el pedido desde esta página. Desde la ${sig} prenda, el envoltorio se cotiza.`;
  return `Sin costo hasta ${n} prendas por pedido, solo si pides desde esta página y hasta el ${hasta}.`;
}
function lineaEnvoltorio(unidades) {
  const n = ENVOLTORIO.prendasGratis;
  if (!envoltorioGratis()) return "Envolver para regalo: sí (¿me indican el costo del envoltorio?)";
  return `Envolver para regalo: sí (pedido desde la página; envoltorio sin costo hasta ${n} prendas${unidades > n ? `. Son ${unidades} prendas: ¿me cotizan el envoltorio de las demás?` : ""})`;
}
const datosCliente = { nombre: registro ? `${registro.nombre} ${registro.apellido}` : "", entrega: "retiro", comuna: "", nota: "", regalo: false, bienvenida: registroVigente() };

function agregar(item) {
  const igual = pedido.find(x => x.id === item.id && x.talla === item.talla && x.color === item.color);
  if (igual) igual.cantidad = Math.min(MAX_CANT, igual.cantidad + item.cantidad); else pedido.push(item);
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
  const entrega = datosCliente.entrega === "envio" ? `Envío a ${datosCliente.comuna || "(comuna y ciudad)"} (¿me indican el costo del envío?)` : "Retiro en la tienda";
  const extra = [`Entrega: ${entrega}`];
  if (datosCliente.regalo) extra.push(lineaEnvoltorio(pedido.reduce((s, x) => s + x.cantidad, 0)));
  if (datosCliente.nombre) extra.push(`Nombre: ${datosCliente.nombre}`);
  if (datosCliente.nota) extra.push(`Comentario: ${datosCliente.nota}`);
  const cierre = datosCliente.bienvenida && registroVigente()
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
    <p class="letra-chica hint-mayor" id="hint-mayor" ${pedido.some(x => x.cantidad >= MAX_CANT) ? "" : "hidden"}>¿Necesitas más de ${MAX_CANT} unidades de una prenda? <a href="${wspUrl("Hola Angie's Secret 👋 Quiero consultar por venta por mayor. Prendas, tallas y cantidades: ")}" target="_blank" rel="noopener" data-mayor>Consulta precio por mayor</a>.</p>
    <fieldset><legend>¿Cómo lo recibes?</legend>
      <div class="entrega">
        <label class="opcion"><input type="radio" name="entrega" value="retiro" ${datosCliente.entrega === "retiro" ? "checked" : ""}><span>Retiro en la tienda, Renca</span></label>
        <label class="opcion"><input type="radio" name="entrega" value="envio" ${datosCliente.entrega === "envio" ? "checked" : ""}><span>Envío a domicilio (todo Chile)</span></label>
      </div>
    </fieldset>
    <div class="campo" id="campo-comuna" ${datosCliente.entrega === "envio" ? "" : "hidden"}><label for="comuna">Comuna y ciudad</label><input id="comuna" value="${esc(datosCliente.comuna)}" placeholder="Ej: Maipú, Santiago" autocomplete="address-level2"><p class="nota-envio">El envío tiene un costo adicional según la comuna o región. Te lo confirmamos por WhatsApp antes de pagar.</p></div>
    <div class="envolver"><label class="opcion"><input type="checkbox" id="envolver" ${datosCliente.regalo ? "checked" : ""}><span><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-regalo"/></svg>${esc(textoEnvoltorio("casilla"))}</span></label></div>
    ${registroVigente() ? `<div class="envolver"><label class="opcion"><input type="checkbox" id="bienvenida" ${datosCliente.bienvenida ? "checked" : ""}><span>Me registré: quiero usar mi descuento de bienvenida en esta primera compra (10% desde $15.000 o 15% desde $50.000)</span></label></div>` : ""}
    ${registro ? `<p class="letra-chica registro-quien">Registro de bienvenida en este equipo: <strong>${esc(registro.nombre)} ${esc((registro.apellido || "").charAt(0))}.</strong>${registro.codigo ? `, código ${esc(registro.codigo)}` : ""}${registro.usado ? " (ya lo pediste)" : ""}. <button type="button" class="boton-texto en-linea" data-olvidar-registro>¿No eres tú? Quitar de este equipo</button></p>` : `<p class="letra-chica">¿Primera compra? <a href="#registro" data-ir-registro>Regístrate</a> y recibe hasta un 15% de descuento.</p>`}
    <div class="campo"><label for="nombre">Tu nombre</label><input id="nombre" value="${esc(datosCliente.nombre)}" autocomplete="name" required aria-describedby="error-nombre"><p class="registro-error" id="error-nombre" role="alert" hidden>Escribe tu nombre para que sepamos quién hace el pedido.</p></div>
    <div class="campo"><label for="nota">Comentario (opcional)</label><textarea id="nota" placeholder="Ej: es para regalo">${esc(datosCliente.nota)}</textarea></div>
    <p class="aviso-legal"><strong>Derecho a retracto:</strong> si compras a distancia, tienes 10 días desde que recibes tu pedido para arrepentirte. Por higiene, no aplica a ropa interior ni a otros productos de uso personal o higiene si se abrió o retiró su sello o envase de seguridad después de la entrega. La garantía legal por fallas es de 6 meses. <a href="terminos.html#cambios">Ver términos</a></p>
    <div class="ficha-acciones">
      <a class="boton boton-wsp" id="enviar-pedido" href="${wspUrl(mensajePedido())}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-wsp"/></svg>Enviar pedido por WhatsApp</a>
      <button type="button" class="boton-texto" id="copiar-pedido">Copiar mi pedido</button>
      <button type="button" class="boton-texto" id="vaciar">Vaciar pedido</button>
    </div>
    <p class="letra-chica">Se abrirá WhatsApp con tu pedido ya escrito. Solo tienes que tocar enviar. Después tu pedido se vacía en esta página. Al enviarlo aceptas los <a href="terminos.html">términos y condiciones</a>.</p>`;
}
function abrirPedido() { pintarPedido(); $("#ventana-pedido").showModal(); medir("pedido_abrir"); }
async function copiarTexto(texto) {
  try { await navigator.clipboard.writeText(texto); avisar("Pedido copiado. Pégalo en un chat con el +56 9 9570 9114"); return true; }
  catch (e) { avisar("No se pudo copiar. Escríbenos por WhatsApp al +56 9 9570 9114"); return false; }
}
$("#abrir-pedido").addEventListener("click", abrirPedido);
$("#pedido").addEventListener("click", e => {
  const q = e.target.closest("[data-quitar]");
  if (q) { pedido.splice(+q.dataset.quitar, 1); guardar(); pintarBarra(); pintarPedido(); return; }
  if (e.target.closest("#vaciar")) { pedido = []; guardar(); pintarBarra(); pintarPedido(); return; }
  if (e.target.closest("#copiar-pedido")) { copiarTexto(mensajePedido()); medir("ayudante_derivar", { canal: "copiar", tema: "pedido" }); return; }
  if (e.target.closest("[data-copiar-ultimo]") && ultimoPedido && ultimoPedido.mensaje) { copiarTexto(ultimoPedido.mensaje); return; }
  if (e.target.closest("[data-olvidar-registro]")) { olvidarRegistro(); pintarPedido(); avisar("Listo: quitamos el registro de este equipo. Tu código sigue sirviendo si lo escribes en tu pedido."); return; }
  const m = e.target.closest("[data-mover]");
  if (m) {
    const x = pedido[+m.dataset.mover]; if (!x) return;
    x.cantidad = Math.max(1, Math.min(MAX_CANT, x.cantidad + +m.dataset.paso));
    guardar(); pintarBarra();
    const li = m.closest("li");
    li.querySelector("output").textContent = x.cantidad;
    li.querySelector('[data-paso="-1"]').disabled = x.cantidad <= 1;
    li.querySelector('[data-paso="1"]').disabled = x.cantidad >= MAX_CANT;
    $("#hint-mayor").hidden = !pedido.some(y => y.cantidad >= MAX_CANT);
    $("#pedido-cuenta").textContent = textoCuenta(pedido.reduce((s, y) => s + y.cantidad, 0));
    $("#enviar-pedido").href = wspUrl(mensajePedido());
    return;
  }
  if (e.target.closest("#enviar-pedido")) {
    if (!datosCliente.nombre.trim()) {
      e.preventDefault();
      $("#error-nombre").hidden = false;
      const campo = $("#nombre"); campo.setAttribute("aria-invalid", "true"); campo.focus();
      return;
    }
    const vigente = registroVigente();
    // El enlace abre WhatsApp con el mensaje ya armado; después se vacía el pedido en esta página.
    const unidades = pedido.reduce((s, x) => s + x.cantidad, 0);
    medir("pedido_enviar", { prendas: pedido.length, unidades, envio: datosCliente.entrega === "envio", regalo: datosCliente.regalo, descuento: !!(datosCliente.bienvenida && vigente) });
    ultimoPedido = { hora: Date.now(), items: pedido.map(x => ({ ...x })), bienvenida: datosCliente.bienvenida && vigente, vigente, mensaje: mensajePedido() };
    try { localStorage.setItem("angie-ultimo-pedido", JSON.stringify(ultimoPedido)); } catch (e2) {}
    // Es la primera compra desde el registro: el descuento ya no vuelve a aparecer en este navegador.
    if (vigente) marcarBienvenidaUsada();
    setTimeout(() => {
      pedido = []; guardar(); pintarBarra();
      $("#pedido").innerHTML = `<h2 id="pedido-titulo">¡Tu pedido se abrió en WhatsApp!</h2><p class="intro" style="margin-top:12px">Solo falta que toques enviar en WhatsApp. Vaciamos tu pedido en esta página para que la próxima vez empieces de cero.</p><button type="button" class="boton boton-principal" data-ir-catalogo>Seguir viendo el catálogo</button><button type="button" class="boton-texto" data-recuperar>¿No alcanzaste a enviarlo? Recuperar mi pedido</button><button type="button" class="boton-texto" data-copiar-ultimo>¿No se abrió WhatsApp? Copiar el mensaje</button>`;
    }, 400);
    return;
  }
  if (e.target.closest("[data-recuperar]") && ultimoPedido) {
    pedido = ultimoPedido.items.map(x => ({ ...x }));
    if ((ultimoPedido.vigente ?? ultimoPedido.bienvenida) && registro) { delete registro.usado; guardarRegistro(); avisarServidor("liberar"); datosCliente.bienvenida = !!ultimoPedido.bienvenida; }
    medir("pedido_recuperar");
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
  if (t.id === "nombre") { datosCliente.nombre = t.value; if (t.value.trim()) { $("#error-nombre").hidden = true; t.removeAttribute("aria-invalid"); } }
  if (t.id === "nota") datosCliente.nota = t.value;
  if (t.id === "envolver") datosCliente.regalo = t.checked;
  if (t.id === "bienvenida") datosCliente.bienvenida = t.checked;
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
  const n = nombres.length, gratis = envoltorioGratis(), max = ENVOLTORIO.prendasGratis;
  const notaEnvoltorio = !gratis ? " El envoltorio te lo cotizamos por WhatsApp." : n > max ? ` El envoltorio es sin costo para ${max} prendas; el de las demás te lo cotizamos.` : "";
  $("#regalo-cuenta").textContent = n ? `Elegiste ${n} ${n === 1 ? "prenda" : "prendas"}: ${nombres.join(", ")}.${notaEnvoltorio}` : "Todavía no eliges prendas. Puedes elegir las que quieras.";
  const detalle = $("#regalo-detalle").value.trim();
  const condicion = !gratis ? "¿Me indican el costo del envoltorio?" : n > max ? `Entiendo que el envoltorio es sin costo hasta ${max} prendas: ¿me cotizan el de las demás?` : "";
  const texto = n
    ? ["Hola Angie's Secret 👋 Quiero armar un regalo envuelto (pedido desde la página):", "", ...nombres.map((x, i) => `${i + 1}. ${x}`), "", ...(detalle ? [`Es para: ${detalle}`, ""] : []), ...(condicion ? [condicion, ""] : []), ...(registroVigente() ? [lineaBienvenida(), ""] : []), "¿Me ayudan con tallas, colores y precio? Gracias."].join("\n")
    : `Hola Angie's Secret 👋 Quiero armar un regalo envuelto desde la página${detalle ? ` (${detalle})` : ""}. ¿Me ayudan a elegir?${registroVigente() ? `\n\n${lineaBienvenida()}` : ""}`;
  $("#regalo-enviar").href = wspUrl(texto);
}
document.querySelectorAll("[data-regalo-para]").forEach(b => b.addEventListener("click", () => { regalo.para = b.dataset.regaloPara; pintarRegalo(); }));
$("#regalo-opciones").addEventListener("click", e => {
  const b = e.target.closest("[data-regalo]"); if (!b) return;
  const id = b.dataset.regalo, i = regalo.elegidos.indexOf(id);
  if (i >= 0) regalo.elegidos.splice(i, 1);
  else regalo.elegidos.push(id);
  b.setAttribute("aria-pressed", regalo.elegidos.includes(id));
  pintarCuentaRegalo();
});
$("#regalo-detalle").addEventListener("input", pintarCuentaRegalo);
$("#regalo-enviar").addEventListener("click", () => {
  medir("regalo_enviar", { n: regalo.elegidos.length });
  if (registroVigente()) { marcarBienvenidaUsada(); setTimeout(pintarCuentaRegalo, 400); }
});

/* ---------- Guía de tallas ---------- */
let tallasDe = null;
function usaGuiaTallas(p) {
  return !["accesorios", "calcetas"].includes(p.cat) && p.id !== "pantys" && !(p.tallas && p.tallas.length === 1) && !p.para.every(x => x === "ninos");
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
$("#tallas-enviar").addEventListener("click", () => medir("tallas"));
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
  const cod = $("#registro-codigo");
  cod.hidden = !(registro && registro.codigo);
  if (registro && registro.codigo) cod.innerHTML = `Tu código de bienvenida: <strong>${esc(registro.codigo)}</strong>. Guárdalo: si nos escribes desde otro equipo, anótalo en tu mensaje.`;
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
      // 1) El servidor da un código único. Si no responde, el registro igual se guarda (sin código).
      let codigo = "";
      try {
        const rc = await fetch("/api/bienvenida", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accion: "nuevo" }) });
        if (rc.ok && (rc.headers.get("content-type") || "").includes("json")) codigo = (await rc.json()).codigo || "";
      } catch (e4) {}
      formRegistro.elements.codigo.value = codigo;
      // 2) El registro va al formulario de Netlify, con el código.
      const r = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(new FormData(formRegistro)).toString() });
      if (!r.ok) throw new Error(String(r.status));
      const f = formRegistro.elements;
      registro = { nombre: f.nombre.value.trim(), apellido: f.apellido.value.trim(), fecha: ahora().fecha, codigo: codigo || null, sinCodigo: !codigo };
      medir("registro", { ok: true });
      try { localStorage.setItem("angie-registro", JSON.stringify(registro)); } catch (e2) {}
      datosCliente.bienvenida = true;
      if (!datosCliente.nombre) datosCliente.nombre = `${registro.nombre} ${registro.apellido}`;
      pintarCuentaRegalo();
      mostrarRegistroListo(registro.nombre);
    } catch (e3) {
      err.textContent = "No pudimos guardar tu registro. Revisa tu conexión e inténtalo de nuevo, o escríbenos por WhatsApp.";
      err.hidden = false;
      medir("registro", { ok: false });
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
document.querySelectorAll("[data-wspc]").forEach(a => { a.href = wspConsultas(a.dataset.wspc); });
document.querySelectorAll("[data-envoltorio]").forEach(s => { s.textContent = textoEnvoltorio(s.dataset.envoltorio); });
// Qué botones de WhatsApp se usan más (sin el contenido del mensaje).
const LUGAR_WSP = [[".conseguir, .conseguir-portada", "conseguir"], ["#ventana-pedido", "pedido"], ["#ventana-producto", "ficha"], ["#ventana-tallas", "tallas"], [".cabecera", "cabecera"], [".portada", "portada"], ["#regalo", "regalo"], ["#encargo", "encargo"], ["#visitanos", "visita"], ["#aviso-temporada", "aviso"], ["#ayudante", "ayudante"], ["#preguntas", "faq"], ["#sugerencias-portada", "sugerencia"], ["#listado", "vacio"]];
document.addEventListener("click", e => {
  const a = e.target.closest('a[href*="wa.me/"]'); if (!a) return;
  if (a.matches("[data-mayor]")) medir("mayor");
  const l = LUGAR_WSP.find(([s]) => a.closest(s));
  medir("wsp", { lugar: a.matches("[data-mayor]") ? "mayor" : l ? l[1] : "otro" });
}, true);

/* ---------- Preguntas frecuentes ----------
   Las preguntas están en js/datos.js (PREGUNTAS_FRECUENTES). El ayudante usa las mismas respuestas. */
function destinoEnlace(dest, texto) {
  const t = esc(texto);
  if (dest.startsWith("wsp:")) return `<a href="${esc(wspUrl(dest.slice(4)))}" target="_blank" rel="noopener">${t}</a>`;
  if (dest.startsWith("wspc:")) return `<a href="${esc(wspConsultas(dest.slice(5)))}" target="_blank" rel="noopener">${t}</a>`;
  if (dest === "accion:tallas") return `<button type="button" class="boton-texto en-linea" data-guia-tallas>${t}</button>`;
  if (dest === "accion:ayudante") return `<button type="button" class="boton-texto en-linea" data-abrir-ayudante>${t}</button>`;
  if (/^(https?:|tel:|mailto:|#|[a-z0-9-]+\.html)/i.test(dest)) return `<a href="${esc(dest)}"${/^https?:/i.test(dest) ? ' target="_blank" rel="noopener"' : ""}>${t}</a>`;
  return t;
}
// Convierte el formato simple de las respuestas (párrafos, viñetas, **negrita** y [enlaces](destino)) en HTML seguro.
function formatearRespuesta(texto) {
  const linea = s => s.split(/(\[[^\]]+\]\([^)]+\))/g).map(parte => {
    const m = parte.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    return m ? destinoEnlace(m[2], m[1]) : esc(parte).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  }).join("");
  const t = String(texto).replace("{envoltorio}", textoEnvoltorio("faq"))
    .replace("{materiales}", typeof textoMateriales === "function" ? textoMateriales() : "")
    .replace("{ninos}", typeof textoNinos === "function" ? textoNinos() : "");
  return t.split(/\n\n+/).map(bloque => {
    const filas = bloque.split("\n");
    if (filas.every(f => f.startsWith("- "))) return `<ul>${filas.map(f => `<li>${linea(f.slice(2))}</li>`).join("")}</ul>`;
    return `<p>${filas.map(linea).join("<br>")}</p>`;
  }).join("");
}
let temaPreguntas = "todas";
function pintarPreguntas() {
  const filtros = $("#preguntas-filtros"), lista = $("#preguntas-lista");
  if (!filtros || typeof PREGUNTAS_FRECUENTES === "undefined") return;
  filtros.innerHTML = [["todas", "Todas"], ...CATEGORIAS_PREGUNTAS].map(([k, n]) => `<button type="button" data-tema-preguntas="${k}" aria-pressed="${k === temaPreguntas}">${esc(n)}</button>`).join("");
  lista.innerHTML = CATEGORIAS_PREGUNTAS.filter(([k]) => temaPreguntas === "todas" || k === temaPreguntas).map(([k, n]) => {
    const ps = PREGUNTAS_FRECUENTES.filter(q => q.cat === k);
    if (!ps.length) return "";
    return `<section class="preguntas-grupo" aria-labelledby="preguntas-${k}"><h3 id="preguntas-${k}">${esc(n)}</h3>${ps.map(q => `<details id="pregunta-${q.id}" data-pregunta="${q.id}"><summary>${esc(q.p)}</summary><div class="respuesta">${formatearRespuesta(q.r)}</div></details>`).join("")}</section>`;
  }).join("");
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-tema-preguntas]");
  if (b) { temaPreguntas = b.dataset.temaPreguntas; pintarPreguntas(); }
});
document.addEventListener("toggle", e => {
  const d = e.target;
  if (d.matches && d.matches("details[data-pregunta]") && d.open) medir("faq", { id: d.dataset.pregunta });
}, true);
function abrirPreguntaDelEnlace() {
  const m = location.hash.match(/^#pregunta-([a-z0-9-]+)$/);
  if (!m) return;
  temaPreguntas = "todas"; pintarPreguntas();
  const d = document.getElementById(`pregunta-${m[1]}`);
  if (d) { d.open = true; d.scrollIntoView({ block: "start" }); }
}
window.addEventListener("hashchange", abrirPreguntaDelEnlace);
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
pintarPreguntas();
abrirPreguntaDelEnlace();
verificarRegistro();
if (params.get("producto")) abrirProducto(params.get("producto"));
