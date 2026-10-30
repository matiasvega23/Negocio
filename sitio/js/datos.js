/* Angie's Secret: DATOS DEL SITIO.
   Este es el único archivo que hay que tocar para cambiar productos, horario,
   feriados o la temporada. El resto del sitio lee estos datos. */

/* =========================================================================
   DATOS DE LA TIENDA: esta es la parte que se edita para actualizar la web.
   ========================================================================= */
const TIENDA = {
  whatsapp: "56995709114",          // pedidos y ventas (sin + ni espacios)
  whatsappConsultas: "56949376311", // consultas, problemas con la página o un pedido, datos personales y el ayudante
  telefonoConsultas: "+56 9 4937 6311",
  facebookNombre: "Angie's Secret", // nombre de la página de Facebook
  abre: "11:00", cierra: "20:00",   // lunes a sábado
  cierraFeriado: "14:00",
  temporadaForzada: null            // null = automática según el mes. O escribir "verano" / "invierno".
};

// Envoltorio de regalo sin costo: hasta cuántas prendas por pedido y hasta qué día (incluido).
// Solo para pedidos hechos desde la página. Después de "gratisHasta", el sitio ofrece el envoltorio "a consultar".
const ENVOLTORIO = { prendasGratis: 3, gratisHasta: "2026-12-24" };

// Feriados de Chile. "medio" = abre de 11:00 a 14:00. "cerrado" = feriado irrenunciable del comercio.
const FERIADOS = {
  "2026-10-31": "medio", "2026-11-01": "medio", "2026-12-08": "medio", "2026-12-25": "cerrado",
  "2027-01-01": "cerrado", "2027-03-26": "medio", "2027-03-27": "medio", "2027-05-01": "cerrado",
  "2027-05-21": "medio", "2027-06-21": "medio", "2027-06-28": "medio", "2027-07-16": "medio",
  "2027-08-15": "medio", "2027-09-18": "cerrado", "2027-09-19": "cerrado", "2027-10-11": "medio",
  "2027-10-31": "medio", "2027-11-01": "medio", "2027-12-08": "medio", "2027-12-25": "cerrado"
};

// Regla de la marca: nunca juntar lencería o ropa interior con niños en un mismo texto, imagen o filtro.
// Aviso con cuenta regresiva (barra de arriba). Se muestra la fecha activa más cercana.
// "fecha" = el día; "desde" = cuántos días antes empieza a aparecer.
// "enlace" puede ser una sección (#regalo), un producto (?producto=ID) o "wsp:" + mensaje para abrir WhatsApp.
// Para un período sin día fijo, usar "inicio" y "fin" en vez de "fecha" y "desde" (no muestra cuenta regresiva).
const FECHAS_COMERCIALES = [
  { nombre: "Navidad", fecha: "2026-12-25", desde: 60, texto: "Envolvemos gratis hasta 3 prendas por pedido, solo si pides desde esta página y hasta el 24 de diciembre.", boton: "Arma tu regalo", enlace: "#regalo" },
  { nombre: "el Día de los Enamorados", fecha: "2027-02-14", desde: 25, texto: "Conjuntos de lencería para regalar. Arma tu regalo desde la página y te ayudamos a elegir.", boton: "Arma tu regalo", enlace: "#regalo" },
  { nombre: "Vuelta a clases", inicio: "2027-02-15", fin: "2027-03-15", texto: "Vuelta a clases: pantys escolares y calcetas para el colegio.", boton: "Consultar por WhatsApp", enlace: "wsp:Hola Angie's Secret 👋 Busco pantys escolares. ¿Qué colores y tallas tienen?" },
  { nombre: "el Día de la Madre", fecha: "2027-05-09", desde: 30, texto: "Pijamas y lencería para regalar. Arma tu regalo desde la página y te ayudamos a elegir.", boton: "Arma tu regalo", enlace: "#regalo" },
  { nombre: "el Día del Padre", fecha: "2027-06-20", desde: 30, texto: "Pijamas y polares para regalar. Arma tu regalo desde la página y te ayudamos a elegir.", boton: "Arma tu regalo", enlace: "#regalo" },
  { nombre: "Navidad", fecha: "2027-12-25", desde: 60, texto: "Arma tu regalo desde la página y te ayudamos a elegir.", boton: "Arma tu regalo", enlace: "#regalo" }
];
// Si se decide volver a envolver gratis en otra fecha: cambiar ENVOLTORIO.gratisHasta y el texto de esa fecha.

// Productos que aparecen en "Arma tu regalo" (se filtran por temporada y por para quién es).
const REGALOS = [
  "conjuntos-lenceria", "pijamas-verano", "pijamas-afraneladas", "vestidos-largos", "vestidos-sueltos",
  "vestido-cardigan", "blusas-verano", "sweater-afranelado", "chaleco-botones", "pijamas-hombre",
  "poleron-polar", "poleron-lana", "camisa-polar", "sweater-hombre", "bufanda", "gorros-lana",
  "calcetas-chiporro", "slip-boxer-hombre", "calcetas", "banano", "ropa-ninos"
];

// Tabla de tallas para la guía "¿Cuál es mi talla?".
// Mientras sea null, la guía solo envía las medidas por WhatsApp y la tienda responde la talla.
// Cuando la tienda tenga su tabla real (en centímetros), se llena así y el sitio sugiere la talla:
// const TABLAS_TALLAS = {
//   mujer:  [ { talla: "S", busto: [DESDE, HASTA], cintura: [DESDE, HASTA], cadera: [DESDE, HASTA] }, ... ],
//   hombre: [ { talla: "S", busto: [DESDE, HASTA], cintura: [DESDE, HASTA] }, ... ]
// };
const TABLAS_TALLAS = null;

const COLORES = {
  "Negro": "#1d1d1f", "Blanco": "#ffffff", "Azul marino": "#1f2a4d", "Gris": "#8a8d93", "Gris jaspeado": "#a3a5ab",
  "Gris claro": "#c9cbcf", "Gris oscuro": "#4a4d55", "Gris melange": "#9c9ea4", "Gris jaspe": "#8f9196", "Burdeo": "#7a1f33",
  "Bordó": "#7a1f33", "Beige": "#dcc6a6", "Camel": "#b5874f", "Verde": "#3f6b4a", "Verde militar": "#5b6b3f",
  "Azul": "#2f5fa7", "Azul jaspe": "#6f86a8", "Rosado": "#e47aa0", "Rosa": "#f2a7bf", "Rosa viejo": "#c98f97",
  "Lila": "#b9a2d6", "Mora": "#4b2a6b", "Celeste": "#93c6e8", "Rojo": "#c8202f", "Marrón": "#6b4a33", "Café": "#7a5235",
  "Verde petróleo": "#1f5f66", "Beige taupe": "#b39b8c", "Piel": "#e2b99c", "Damasco": "#eab08e", "Naranja": "#ee6a3c",
  "Morado": "#6b2fa0", "Verde agua": "#8fd3c3", "Turquesa": "#2bb0b4", "Fucsia": "#d63a8f",
  "Azul rey": "#2747b8", "Arena": "#d8c3a0", "Verde olivo": "#6b7040", "Plomo": "#6e7176",
  "Lila floreado": "#c9b2e6", "Azul bordado": "#2f4fb0", "Rosado floreado": "#f0b3c8", "Verde floreado": "#b9dccb",
  "Azul, gris y burdeo": "linear-gradient(180deg,#1f2a4d 0 34%,#a3a5ab 34% 66%,#7a1f33 66%)",
  "Negro, gris y grafito": "linear-gradient(180deg,#1d1d1f 0 34%,#a3a5ab 34% 66%,#45474d 66%)",
  "Negro con rojo": "linear-gradient(180deg,#1d1d1f 0 38%,#c8202f 38% 62%,#1d1d1f 62%)",
  "Negro con azul": "linear-gradient(180deg,#1d1d1f 0 38%,#2f5fd0 38% 62%,#1d1d1f 62%)"
};

const CATEGORIAS = [
  ["sostenes", "Sostenes, petos y conjuntos"],
  ["calzones", "Calzones, colaless y pantaletas"],
  ["fajas", "Fajas y modeladores"],
  ["interior-hombre", "Ropa interior de hombre"],
  ["camisetas", "Camisetas y primeras capas"],
  ["tops", "Poleras, blusas y vestidos"],
  ["abrigo", "Chalecos, sweaters y polerones"],
  ["pantalones", "Pantalones, calzas y pantys"],
  ["pijamas", "Pijamas"],
  ["calcetas", "Calcetas y calcetines"],
  ["accesorios", "Gorros, bufandas y accesorios"],
  ["ninos", "Niños"]
];

const SXXL = ["S", "M", "L", "XL", "XXL"];
// t = temporada: "verano", "invierno" o "todo" (todo el año). precio: dejar null para "consultar".
const PRODUCTOS = [
  // Sostenes, petos y conjuntos
  { id: "sosten-maternal-8025", n: "Sostén maternal 8025", para: ["mujer"], cat: "sostenes", t: "todo", d: "Para la maternidad. En negro, piel, blanco y rosado.", tallas: ["L/XL", "2XL/3XL"], fotos: ["c-sosten-maternal-8025"], k: "maternidad lactancia embarazo amamantar", modelo: true },
  { id: "sosten-maternal-6563", n: "Sostén maternal 6563 C", para: ["mujer"], cat: "sostenes", t: "todo", d: "Para la maternidad, copa C y tallas grandes.", tallas: ["42", "44", "46", "48", "50", "52"], fotos: ["c-sosten-maternal-6563"], k: "maternidad lactancia embarazo amamantar", modelo: true },
  { id: "sosten-barba-999", n: "Sostén con barba 999", para: ["mujer"], cat: "sostenes", t: "todo", d: "Con barba y sin relleno, copa C. Marca MBB.", tallas: ["36C", "38C", "40C", "42C", "44C", "46C"], fotos: ["c-sosten-barba-999"], k: "aro firme", modelo: true },
  { id: "sosten-7506c", n: "Sostén 7506 C", para: ["mujer"], cat: "sostenes", t: "todo", d: "Copa C. En blanco, piel y negro.", tallas: ["34", "36", "38", "40", "42", "44"], fotos: ["c-sosten-7506c"], modelo: true },
  { id: "sosten-7507c", n: "Sostén 7507 C", para: ["mujer"], cat: "sostenes", t: "todo", d: "Copa C. En blanco, piel y negro.", tallas: ["34", "36", "38", "40", "42", "44"], fotos: ["c-sosten-7507c"], modelo: true },
  { id: "sosten-7206", n: "Sostén 7206", para: ["mujer"], cat: "sostenes", t: "todo", d: "Clásico, en negro, piel y blanco.", tallas: ["34", "36", "38", "40", "42", "44"], fotos: ["c-sosten-7206"], modelo: true },
  { id: "sosten-7015c", n: "Sostén 7015 C con broche adelante", para: ["mujer"], cat: "sostenes", t: "todo", d: "Broche adelante, fácil de poner. Copa C.", tallas: ["40", "42", "44", "46"], fotos: ["c-sosten-7015c"], k: "broche delantero", modelo: true },
  { id: "sosten-3114c", n: "Sostén 3114 C con broche adelante", para: ["mujer"], cat: "sostenes", t: "todo", d: "Broche adelante, fácil de poner. Copa C.", tallas: ["40", "42", "44", "46", "48", "50"], fotos: ["c-sosten-3114c"], k: "broche delantero", modelo: true },
  { id: "sosten-xf231a", n: "Sostén invisible XF-231 A", para: ["mujer"], cat: "sostenes", t: "todo", d: "No se marca bajo la ropa. Copa A.", tallas: ["32", "34", "36", "38"], fotos: ["c-sosten-xf231a"], k: "invisible liso", modelo: true },
  { id: "sosten-8735b", n: "Sostén sin barba 8735 B", para: ["mujer"], cat: "sostenes", t: "todo", d: "Sin barba y de colores. Copa B.", tallas: ["36", "38", "40", "42"], fotos: ["c-sosten-8735b"], k: "sin aro", modelo: true },
  { id: "sosten-xf247a", n: "Sostén XF-247 A", para: ["mujer"], cat: "sostenes", t: "todo", d: "Copa A, en varios colores.", tallas: ["32", "34", "36", "38"], fotos: ["c-sosten-xf247a"], modelo: true },
  { id: "sosten-xf256c", n: "Sostén XF-256 C", para: ["mujer"], cat: "sostenes", t: "todo", d: "Copa C, con encaje.", tallas: ["40", "42", "44", "46"], fotos: ["c-sosten-xf256c"], k: "encaje", modelo: true },
  { id: "sosten-8233d", n: "Sostén 8233 D", para: ["mujer"], cat: "sostenes", t: "todo", d: "Copa D, en tallas 36 a 46.", tallas: ["36", "38", "40", "42", "44", "46"], fotos: ["c-sosten-8233d"], modelo: true },
  { id: "sosten-yp3400", n: "Sostén YP-3400 copa B", para: ["mujer"], cat: "sostenes", t: "todo", d: "Copa B, en varios colores.", tallas: ["34", "36", "38", "40"], fotos: ["c-sosten-yp3400"], modelo: true },
  { id: "sosten-yp6461", n: "Sostén YP6461 copa B", para: ["mujer"], cat: "sostenes", t: "todo", d: "Copa B, en azul, azul marino, negro y blanco.", tallas: ["34", "36", "38", "40"], fotos: ["c-sosten-yp6461"], modelo: true },
  { id: "sosten-8204", n: "Sostén de encaje 8204", para: ["mujer"], cat: "sostenes", t: "todo", d: "Con encaje, copa B.", tallas: ["34B", "36B", "38B", "40B", "42B"], fotos: ["c-sosten-8204"], k: "encaje", modelo: true },
  { id: "sosten-p6097", n: "Sostén P6097 copa B", para: ["mujer"], cat: "sostenes", t: "todo", d: "Copa B, con detalle de encaje.", fotos: ["c-sosten-p6097"], k: "encaje", modelo: true },
  { id: "sosten-82248", n: "Sostén 82248", para: ["mujer"], cat: "sostenes", t: "todo", d: "Con detalle de encaje, en varios colores.", tallas: ["34", "36", "38", "40", "42", "44"], fotos: ["c-sosten-82248"], k: "encaje", modelo: true },
  { id: "sosten-82250", n: "Sostén 82250 copa B", para: ["mujer"], cat: "sostenes", t: "todo", d: "Copa B, con encaje en los costados.", tallas: ["34", "36", "38", "40", "42", "44"], fotos: ["c-sosten-82250"], k: "encaje", modelo: true },
  { id: "sosten-8630", n: "Sostén de encaje 8630", para: ["mujer"], cat: "sostenes", t: "todo", d: "Con encaje, copa B.", tallas: ["36B", "38B", "40B", "42B"], fotos: ["c-sosten-8630"], k: "encaje", modelo: true },
  { id: "sosten-8701", n: "Sostén 8701", para: ["mujer"], cat: "sostenes", t: "todo", d: "Copa B.", tallas: ["34B", "36B", "38B", "40B"], fotos: ["c-sosten-8701"], modelo: true },
  { id: "sosten-8703", n: "Sostén 8703", para: ["mujer"], cat: "sostenes", t: "todo", d: "Copa B, con encaje.", tallas: ["34B", "36B", "38B", "40B", "42B"], fotos: ["c-sosten-8703"], k: "encaje", modelo: true },
  { id: "sosten-8704", n: "Sostén 8704", para: ["mujer"], cat: "sostenes", t: "todo", d: "Copa C, con encaje.", tallas: ["36C", "38C", "40C", "42C", "44C"], fotos: ["c-sosten-8704"], k: "encaje", modelo: true },
  { id: "sosten-8705", n: "Sostén 8705", para: ["mujer"], cat: "sostenes", t: "todo", d: "Copa C, con encaje.", tallas: ["36C", "38C", "40C", "42C", "44C"], fotos: ["c-sosten-8705"], k: "encaje", modelo: true },
  { id: "sosten-8706", n: "Sostén 8706", para: ["mujer"], cat: "sostenes", t: "todo", d: "Copa C.", tallas: ["38C", "40C", "42C", "44C"], fotos: ["c-sosten-8706"], modelo: true },
  { id: "sosten-8707", n: "Sostén 8707", para: ["mujer"], cat: "sostenes", t: "todo", d: "Copa C, con encaje.", tallas: ["36C", "38C", "40C", "42C", "44C"], fotos: ["c-sosten-8707"], k: "encaje", modelo: true },
  { id: "sosten-8124", n: "Sostén de encaje 8124", para: ["mujer"], cat: "sostenes", t: "todo", d: "Con encaje, en varios colores.", tallasTexto: "Copas C, DD, E y F", fotos: ["c-sosten-8124"], k: "encaje copa grande", modelo: true },
  { id: "sosten-liso-colores", n: "Sostén liso de colores", para: ["mujer"], cat: "sostenes", t: "todo", d: "Liso, en varios colores.", fotos: ["c-sosten-liso-colores"], modelo: true },
  { id: "peto-886a", n: "Peto 886 A", para: ["mujer"], cat: "sostenes", t: "todo", d: "Peto de colores, talla L/XL.", tallas: ["L/XL"], fotos: ["c-peto-886a"], k: "top", modelo: true },
  { id: "peto-886", n: "Peto 886", para: ["mujer"], cat: "sostenes", t: "todo", d: "Peto en negro, celeste y piel.", tallas: ["L/XL"], fotos: ["c-peto-886"], k: "top", modelo: true },
  { id: "peto-887", n: "Peto 887", para: ["mujer"], cat: "sostenes", t: "todo", d: "Peto de colores, talla XL-2XL.", tallas: ["XL-2XL"], fotos: ["c-peto-887"], k: "top", modelo: true },
  { id: "peto-relleno-grande", n: "Peto con relleno tallas grandes", para: ["mujer"], cat: "sostenes", t: "todo", d: "Con relleno, de la XL a la 4XL.", tallas: ["XL", "2XL", "3XL", "4XL"], fotos: ["c-peto-relleno-grande"], k: "top relleno", modelo: true },
  { id: "sostenes-con-barba", n: "Sostenes con barba", para: ["mujer"], cat: "sostenes", t: "todo", d: "Más firmeza y sujeción. Lisos, con encaje y en varios colores.", tallas: SXXL, col: ["Blanco", "Piel", "Negro", "Rojo", "Azul marino"], fotos: ["w-sosten-barba"], afiches: ["7f1feaf6"], k: "brasier sujetador" },
  { id: "sostenes-sin-barba", n: "Sostenes sin barba", para: ["mujer"], cat: "sostenes", t: "todo", d: "Livianos y cómodos para todo el día, con soporte suave.", tallas: SXXL, col: ["Piel", "Rosado", "Blanco", "Negro"], fotos: ["w-sosten-sin-barba"], afiches: ["f808306d"], k: "brasier sujetador" },
  { id: "conjuntos-lenceria", n: "Conjuntos de lencería", para: ["mujer"], cat: "sostenes", t: "todo", d: "Sostén y calzón a juego, con detalles de encaje. Pregunta por más colores.", col: ["Rojo"], fotos: ["w-conjunto"], k: "encaje regalo" },

  // Calzones, colaless y pantaletas
  { id: "calzon-21972", n: "Calzón de algodón 21972", para: ["mujer"], cat: "calzones", t: "todo", d: "Algodón, con encaje en la cintura. Marca Andressa.", fotos: ["c-calzon-21972"], modelo: true },
  { id: "calzon-306", n: "Calzón de algodón 306", para: ["mujer"], cat: "calzones", t: "todo", d: "Algodón, en varios colores. Marca Andressa.", fotos: ["c-calzon-306"], modelo: true },
  { id: "calzon-21572", n: "Calzón de algodón 21572", para: ["mujer"], cat: "calzones", t: "todo", d: "Algodón con encaje. Marca Andressa.", fotos: ["c-calzon-21572"], k: "encaje", modelo: true },
  { id: "calzon-senora", n: "Calzón de señora, algodón peruano", para: ["mujer"], cat: "calzones", t: "todo", d: "Algodón peruano, de buena cobertura.", fotos: ["c-calzon-senora"], k: "senora alto", modelo: true },
  { id: "calzon-senora-xxxl", n: "Calzón de señora talla XXXL", para: ["mujer"], cat: "calzones", t: "todo", d: "Algodón peruano, en talla XXXL.", tallas: ["XXXL"], fotos: ["c-calzon-senora-xxxl"], k: "senora alto talla grande", modelo: true },
  { id: "calzon-midoly", n: "Calzón Midoly talla S", para: ["mujer"], cat: "calzones", t: "todo", d: "Algodón peruano, en talla S.", tallas: ["S"], fotos: ["c-calzon-midoly"], modelo: true },
  { id: "boxer-femenino", n: "Bóxer femenino de algodón peruano", para: ["mujer"], cat: "calzones", t: "todo", d: "Algodón peruano, cómodo y de colores.", fotos: ["c-boxer-femenino"], k: "boxer mujer culotte", modelo: true },
  { id: "pantaleta-triunf", n: "Pantaleta lisa Triunf", para: ["mujer"], cat: "calzones", t: "todo", d: "Algodón peruano, lisa y de colores.", fotos: ["c-pantaleta-triunf"], k: "culotte", modelo: true },
  { id: "pantaleta-short", n: "Pantaleta short de algodón", para: ["mujer"], cat: "calzones", t: "todo", d: "Algodón peruano, tipo short.", fotos: ["c-pantaleta-short"], k: "culotte", modelo: true },
  { id: "pantaleta-a9640", n: "Pantaleta A9640", para: ["mujer"], cat: "calzones", t: "todo", d: "Acanalada, en varios colores.", tallas: ["L", "XL", "XXL"], fotos: ["c-pantaleta-a9640"], k: "culotte", modelo: true },
  { id: "pantaleta-encaje-21575", n: "Pantaleta de encaje 21575", para: ["mujer"], cat: "calzones", t: "todo", d: "Con encaje, en varios colores.", tallas: ["M", "L", "XL", "XXL"], fotos: ["c-pantaleta-encaje-21575"], k: "culotte encaje", modelo: true },
  { id: "bikini-triunf", n: "Bikini liso Triunf", para: ["mujer"], cat: "calzones", t: "todo", d: "Algodón peruano, liso y de colores.", fotos: ["c-bikini-triunf"], modelo: true },
  { id: "bikini-5098", n: "Bikini 5098", para: ["mujer"], cat: "calzones", t: "todo", d: "Con borde de encaje, en varios colores.", tallas: ["L", "XL", "2XL"], fotos: ["c-bikini-5098"], modelo: true },
  { id: "calzon-sacapierna", n: "Calzón sacapierna", para: ["mujer"], cat: "calzones", t: "todo", d: "Algodón peruano, corte alto en la pierna.", fotos: ["c-calzon-sacapierna"], k: "sacapierna", modelo: true },
  { id: "calzon-encaje-204", n: "Calzón de encaje 204", para: ["mujer"], cat: "calzones", t: "todo", d: "Con cintura de encaje.", tallas: ["M", "L", "XL", "XXL"], fotos: ["c-calzon-encaje-204"], k: "encaje", modelo: true },
  { id: "calzon-invisible-007", n: "Calzón invisible 007", para: ["mujer"], cat: "calzones", t: "todo", d: "No se marca bajo la ropa. Marca Body Key.", tallas: ["XL", "2XL", "3XL"], fotos: ["c-calzon-invisible-007"], k: "invisible sin costura", modelo: true },
  { id: "calzon-sin-costura-hjc2890", n: "Calzón sin costura HJC-2890", para: ["mujer"], cat: "calzones", t: "todo", d: "Sin costuras, en muchos colores.", tallas: ["L/XL", "XXL/XXXL"], fotos: ["c-calzon-sin-costura-hjc2890"], k: "invisible", modelo: true },
  { id: "calzon-sin-costura-p730006", n: "Calzón sin costura P730006", para: ["mujer"], cat: "calzones", t: "todo", d: "Sin costuras, en muchos colores.", tallas: ["L/XL", "XXL/XXXL"], fotos: ["c-calzon-sin-costura-p730006"], k: "invisible", modelo: true },
  { id: "colaless-3525", n: "Colaless 3525", para: ["mujer"], cat: "calzones", t: "todo", d: "Con encaje, en tallas grandes.", tallas: ["XL", "XXL", "XXXL"], fotos: ["c-colaless-3525"], k: "colales tanga", modelo: true },
  { id: "colaless-3428", n: "Colaless 3428", para: ["mujer"], cat: "calzones", t: "todo", d: "Con encaje, en tallas grandes.", tallas: ["XL", "2XL", "3XL"], fotos: ["c-colaless-3428"], k: "colales tanga", modelo: true },
  { id: "colaless-3732", n: "Colaless 3732", para: ["mujer"], cat: "calzones", t: "todo", d: "Con encaje, de la 2XL a la 4XL.", tallas: ["2XL", "3XL", "4XL"], fotos: ["c-colaless-3732"], k: "colales tanga", modelo: true },
  { id: "colaless-2262", n: "Colaless 2262", para: ["mujer"], cat: "calzones", t: "todo", d: "Estampados y lisos. Marca Andressa.", tallas: ["M", "L", "XL", "XXL"], fotos: ["c-colaless-2262"], k: "colales tanga", modelo: true },
  { id: "colaless-hilo-8614t", n: "Colaless de hilo 8614T", para: ["mujer"], cat: "calzones", t: "todo", d: "De hilo, lisos y estampados.", fotos: ["c-colaless-hilo-8614t"], k: "colales tanga hilo", modelo: true },
  { id: "calzones-algodon", n: "Calzones de algodón", para: ["mujer"], cat: "calzones", t: "todo", d: "Algodón fresco y suave, con buena cobertura. Colores básicos y pasteles.", tallas: SXXL, col: ["Negro", "Blanco", "Piel", "Lila", "Celeste", "Verde agua"], fotos: ["w-calzon-algodon"], afiches: ["c4c82808"], k: "bombacha señora" },
  { id: "calzones-sin-costura", n: "Calzones sin costura", para: ["mujer"], cat: "calzones", t: "todo", d: "No se marcan bajo la ropa. Tiro normal y tiro alto.", col: ["Negro", "Gris claro", "Damasco", "Lila", "Azul", "Burdeo", "Naranja", "Celeste", "Rosado", "Blanco", "Rojo", "Verde", "Piel"], fotos: ["w-calzon-sin-costura"], afiches: ["c88cdff8"], k: "tiro alto" },
  { id: "calzones-relleno", n: "Calzones y shorts con relleno", para: ["mujer"], cat: "calzones", t: "todo", d: "Realzan la silueta de forma discreta bajo pantalones y vestidos.", col: ["Negro", "Blanco", "Piel", "Morado"], fotos: ["w-calzon-relleno"], k: "levanta cola gluteos" },

  // Fajas y modeladores
  { id: "calzon-faja-k028", n: "Calzón faja panal K028", para: ["mujer"], cat: "fajas", t: "todo", d: "Tejido panal que moldea. Marca MBB.", fotos: ["c-calzon-faja-k028"], k: "faja reductor", modelo: true },
  { id: "calzon-faja-k038", n: "Calzón faja panal largo K038", para: ["mujer"], cat: "fajas", t: "todo", d: "Tejido panal, modelo largo. Marca MBB.", fotos: ["c-calzon-faja-k038"], k: "faja reductor", modelo: true },
  { id: "calzon-faja-3363", n: "Calzón faja 3363", para: ["mujer"], cat: "fajas", t: "todo", d: "En negro, blanco, piel y morado.", fotos: ["c-calzon-faja-3363"], k: "faja reductor", modelo: true },
  { id: "calzon-faja-3368", n: "Calzón faja 3368", para: ["mujer"], cat: "fajas", t: "todo", d: "Tiro alto, talla única.", tallas: ["Única"], fotos: ["c-calzon-faja-3368"], k: "faja reductor tiro alto", modelo: true },
  { id: "calzon-faja-tiro-alto", n: "Calzón faja de tiro alto", para: ["mujer"], cat: "fajas", t: "todo", d: "Tiro alto, en negro, piel y blanco.", fotos: ["c-calzon-faja-tiro-alto", "c-calzon-faja-tiro-alto-2", "c-calzon-faja-tiro-alto-3"], k: "faja reductor tiro alto", modelo: true },
  { id: "modelador-8021", n: "Modelador 8021", para: ["mujer"], cat: "fajas", t: "todo", d: "Modelador en varios colores. Marca Body Key.", fotos: ["c-modelador-8021"], k: "faja reductor body", modelo: true },
  { id: "fajas", n: "Fajas modeladoras", para: ["mujer"], cat: "fajas", t: "todo", d: "Cinturillas, shorts y bodies reductores para usar bajo la ropa.", tallas: SXXL, col: ["Negro", "Piel"], fotos: ["w-fajas"], afiches: ["d10d526d"], k: "faja reductora cinturilla body" },

  // Ropa interior de hombre
  { id: "boxer-adulto-jack", n: "Bóxer de adulto Jack", para: ["hombre"], cat: "interior-hombre", t: "todo", d: "Bóxer de colores, surtido de tallas.", fotos: ["c-boxer-adulto-jack"], k: "calzoncillo", modelo: true },
  { id: "boxer-liso-milano", n: "Bóxer liso Milano", para: ["hombre"], cat: "interior-hombre", t: "todo", d: "Liso, en varios colores.", fotos: ["c-boxer-liso-milano"], k: "calzoncillo", modelo: true },
  { id: "boxer-milano", n: "Bóxer Milano", para: ["hombre"], cat: "interior-hombre", t: "todo", d: "Pretina de color, en varios colores.", fotos: ["c-boxer-milano"], k: "calzoncillo", modelo: true },
  { id: "boxer-maxi", n: "Bóxer maxi pierna larga", para: ["hombre"], cat: "interior-hombre", t: "todo", d: "Pierna larga, en varios colores. Marca Milano.", fotos: ["c-boxer-maxi", "c-boxer-maxi-2"], k: "calzoncillo largo", modelo: true },
  { id: "slip-milano", n: "Slip Milano", para: ["hombre"], cat: "interior-hombre", t: "todo", d: "Slip en varios colores.", fotos: ["c-slip-milano"], k: "calzoncillo", modelo: true },
  { id: "boxer-tela-leo", n: "Bóxer de tela LEO, pack de 2", para: ["hombre"], cat: "interior-hombre", t: "todo", d: "Bóxer de tela suelto, a cuadros. Vienen 2 por pack.", fotos: ["c-boxer-tela-leo"], k: "calzoncillo suelto cuadros pack", modelo: true },
  { id: "slip-boxer-hombre", n: "Slip y bóxer para hombre", para: ["hombre"], cat: "interior-hombre", t: "todo", d: "Slip, bóxer clásico y bóxer largo, lisos y estampados. 95% algodón y 5% lycra.", tallas: SXXL, col: ["Negro", "Blanco", "Gris", "Azul", "Celeste", "Naranja", "Verde"], fotos: ["m-ropa-interior"], afiches: ["40b9f8ba"], k: "calzoncillo boxer slip milano" },
  { id: "calzoncillos-largos", n: "Calzoncillos largos de polar", para: ["hombre"], cat: "interior-hombre", t: "invierno", d: "Primera capa térmica para los días más fríos.", tallas: SXXL, col: ["Gris claro", "Gris oscuro"], fotos: ["m-calzoncillo-largo"], afiches: ["cd40895a"], k: "termico primera capa" },
  { id: "conjunto-termico", n: "Conjunto térmico de polar", para: ["hombre"], cat: "interior-hombre", t: "invierno", d: "Polera y calzoncillo largo de polar, juntos o por separado.", tallas: SXXL, col: ["Azul marino", "Gris"], fotos: ["m-polera-polar"], afiches: ["740f1965"], k: "termico primera capa polera" },

  // Camisetas y primeras capas
  { id: "camiseta-adulto-azul", n: "Camiseta de adulto azul marino", para: ["mujer", "hombre"], cat: "camisetas", t: "todo", d: "Algodón nacional, manga larga.", tallas: ["S", "M", "L", "XL"], fotos: ["c-camiseta-adulto-azul"], k: "interior", modelo: true },
  { id: "camiseta-adulto-negra", n: "Camiseta de adulto negra", para: ["mujer", "hombre"], cat: "camisetas", t: "todo", d: "Algodón nacional, manga larga.", fotos: ["c-camiseta-adulto-negra"], k: "interior", modelo: true },
  { id: "camiseta-adulto-gris", n: "Camiseta de adulto gris", para: ["mujer", "hombre"], cat: "camisetas", t: "todo", d: "Algodón nacional, manga larga.", tallas: ["S", "M", "L", "XL"], fotos: ["c-camiseta-adulto-gris"], k: "interior", modelo: true },
  { id: "camiseta-bambu-ssf2377", n: "Camiseta de bambú SSF2377", para: ["mujer"], cat: "camisetas", t: "invierno", d: "Cuello redondo, manga larga.", fotos: ["c-camiseta-bambu-ssf2377"], k: "bamboo termica", modelo: true },
  { id: "camiseta-bambu-ssf2308", n: "Camiseta de bambú cuello V SSF2308", para: ["mujer"], cat: "camisetas", t: "invierno", d: "Cuello en V, manga larga. Marca Burson.", fotos: ["c-camiseta-bambu-ssf2308"], k: "bamboo termica", modelo: true },
  { id: "camiseta-bambu-cc", n: "Camiseta de bambú C&C", para: ["mujer"], cat: "camisetas", t: "invierno", d: "Cuello redondo, en blanco y negro.", fotos: ["c-camiseta-bambu-cc"], k: "bamboo termica", modelo: true },
  { id: "camiseta-bambu-ml-cc", n: "Camiseta de bambú manga larga C&C", para: ["mujer"], cat: "camisetas", t: "invierno", d: "Cuello redondo, en muchos colores.", fotos: ["c-camiseta-bambu-ml-cc"], k: "bamboo termica", modelo: true },
  { id: "camiseta-panty-mujer", n: "Camiseta panty de mujer", para: ["mujer"], cat: "camisetas", t: "invierno", d: "Color piel y otros colores. Marca Stavias.", fotos: ["c-camiseta-panty-mujer"], k: "termica", modelo: true },
  { id: "camiseta-pabilo", n: "Camiseta de pabilo", para: ["mujer"], cat: "camisetas", t: "todo", d: "De tiritas, en muchos colores.", fotos: ["c-camiseta-pabilo"], k: "musculosa tirantes", modelo: true },
  { id: "camiseta-polar-807", n: "Camiseta polar 807", para: ["hombre"], cat: "camisetas", t: "invierno", d: "Polar, cuello redondo. Marca Coyote.", fotos: ["c-camiseta-polar-807"], k: "termica", modelo: true },
  { id: "camiseta-bambu-ssf1330", n: "Camiseta de bambú SSF1330", para: ["hombre"], cat: "camisetas", t: "invierno", d: "Cuello redondo, manga larga. Marca Burson.", fotos: ["c-camiseta-bambu-ssf1330"], k: "bamboo termica", modelo: true },
  { id: "camiseta-termica-ca911", n: "Camiseta térmica CA911", para: ["hombre"], cat: "camisetas", t: "invierno", d: "Manga larga, en plomo o gris.", col: ["Plomo", "Gris"], fotos: ["c-camiseta-termica-ca911"], k: "termica", modelo: true },
  { id: "camiseta-termica-ca907", n: "Camiseta térmica CA907", para: ["hombre"], cat: "camisetas", t: "invierno", d: "Manga larga, en plomo o gris. Marca Coyote.", col: ["Plomo", "Gris"], fotos: ["c-camiseta-termica-ca907"], k: "termica", modelo: true },

  // Poleras, blusas y vestidos
  { id: "poleras-bambu", n: "Poleras de bambú cuello alto", para: ["mujer"], cat: "tops", t: "invierno", d: "Tela de bambú suave y abrigadora, que no aprieta.", tallas: SXXL, col: ["Negro", "Bordó", "Azul marino", "Gris", "Beige", "Blanco", "Verde militar", "Rosado", "Mora"], fotos: ["w-polera-bambu"], afiches: ["230b70a2"], k: "beatle cuello tortuga" },
  { id: "poleras-cuello-redondo", n: "Poleras térmicas cuello redondo", para: ["mujer"], cat: "tops", t: "invierno", d: "Tela térmica suave. Un básico para combinar con todo.", tallas: SXXL, col: ["Negro", "Bordó", "Azul marino", "Gris", "Beige", "Blanco", "Verde militar", "Rosado", "Mora"], fotos: ["w-polera-redondo"], afiches: ["374a8e3f"], k: "polera termica" },
  { id: "blusas-verano", n: "Blusas de verano", para: ["mujer"], cat: "tops", t: "verano", d: "Telas livianas con lunares, estampados y detalles con brillo.", fotos: ["s-blusa-lunares", "s-polera-strass", "s-blusa-verde"], k: "blusa polera señora" },
  { id: "poleras-estampadas", n: "Poleras estampadas", para: ["mujer"], cat: "tops", t: "verano", d: "Algodón fresco con estampados alegres.", fotos: ["s-polera-corazones"], k: "polera juvenil" },
  { id: "vestidos-largos", n: "Vestidos largos y enteritos", para: ["mujer"], cat: "tops", t: "verano", d: "Estampados florales y telas frescas para el calor.", fotos: ["s-vestidos-largos", "s-vestido-floreado"], k: "vestido enterito jumpsuit" },
  { id: "vestidos-sueltos", n: "Vestidos sueltos y túnicas", para: ["mujer"], cat: "tops", t: "verano", d: "Cortes holgados, bordados y estampados, algunos con cinturón.", fotos: ["s-vestido-rosado", "s-vestidos-senora", "s-vestido-tiedye"], k: "vestido tunica" },
  { id: "vestido-cardigan", n: "Vestido con cárdigan", para: ["mujer"], cat: "tops", t: "verano", d: "Vestido estampado con cárdigan liviano para las tardes.", fotos: ["s-vestido-cardigan"], k: "vestido kimono" },
  { id: "camiseta-cuello-alto", n: "Camiseta térmica cuello alto", para: ["hombre"], cat: "tops", t: "invierno", d: "Tela térmica elástica para usar sola o bajo el chaleco.", tallas: SXXL, col: ["Negro", "Blanco", "Azul marino", "Gris jaspeado", "Burdeo"], fotos: ["m-camiseta-cuello"], afiches: ["5694a0de"], k: "beatle polera" },
  { id: "camisa-polar", n: "Camisa de polar cuadrillé", para: ["hombre"], cat: "tops", t: "invierno", d: "Abrigada y suave, con bolsillos en el pecho.", tallas: ["S", "M", "L", "XL", "XXL", "XXXL"], col: ["Rojo", "Azul", "Gris"], fotos: ["m-camisa-polar"], afiches: ["d6254b76"], k: "leñadora franela" },

  // Chalecos, sweaters y polerones
  { id: "sweater-afranelado", n: "Sweater afranelado", para: ["mujer"], cat: "abrigo", t: "invierno", d: "Abrigado y liviano, de tejido suave.", col: ["Beige", "Camel", "Gris", "Verde", "Azul", "Bordó", "Negro", "Lila", "Rosa"], fotos: ["w-sweater"], afiches: ["5b682d5e"], k: "chaleco" },
  { id: "chaleco-lanilla", n: "Chaleco de lanilla sin mangas", para: ["mujer"], cat: "abrigo", t: "invierno", d: "Tejido trenzado con botones y bolsillos. Para media estación e invierno.", col: ["Beige", "Camel", "Gris", "Verde", "Azul", "Burdeo", "Negro"], fotos: ["w-chaleco-lanilla"], afiches: ["d462ff94"], k: "chaleco" },
  { id: "chaleco-botones", n: "Chaleco con botones y mangas", para: ["mujer"], cat: "abrigo", t: "invierno", d: "Tela suave, fácil de combinar con poleras y blusas.", tallas: SXXL, col: ["Azul", "Beige", "Lila", "Verde", "Rosa", "Celeste", "Burdeo", "Gris", "Negro"], fotos: ["w-chaleco-botones"], afiches: ["156a6af8", "0339b8f1"], k: "chaleco cardigan" },
  { id: "poleron-lana", n: "Polerón de lana con cierre", para: ["hombre"], cat: "abrigo", t: "invierno", d: "Lana gruesa, cuello alto y bolsillos.", tallas: SXXL, col: ["Azul, gris y burdeo", "Negro, gris y grafito"], fotos: ["m-poleron-lana"], afiches: ["b1931f7c"], k: "chaleco" },
  { id: "poleron-polar", n: "Polerón polar con cierre", para: ["hombre"], cat: "abrigo", t: "invierno", d: "Polar grueso, liviano y abrigador, con bolsillo en el pecho.", tallas: SXXL, col: ["Negro", "Gris oscuro", "Azul marino"], fotos: ["m-poleron-polar"], afiches: ["5ff5a263"], k: "chaqueta polar" },
  { id: "chaleco-forrado-hombre", n: "Chaleco forrado con cierre", para: ["hombre"], cat: "abrigo", t: "invierno", d: "Tejido por fuera y forro suave por dentro.", tallas: ["M", "L", "XL", "XXL"], col: ["Azul marino", "Gris jaspeado"], fotos: ["m-chaleco-forrado"], afiches: ["10d0b345"], k: "chaleco" },
  { id: "sweater-hombre", n: "Sweater cuello redondo", para: ["hombre"], cat: "abrigo", t: "invierno", d: "Tejido abrigador de corte clásico, en dos modelos.", tallas: SXXL, col: ["Azul marino", "Gris oscuro", "Negro"], fotos: ["m-sweater"], afiches: ["95c583ab", "84245d5b"], k: "chaleco" },

  // Pantalones, calzas y pantys
  { id: "panty-milano-antilope", n: "Panty elasticada Milano Antílope", para: ["mujer"], cat: "pantalones", t: "todo", d: "Panty elasticada, talla única.", tallas: ["Única"], fotos: ["c-panty-milano-antilope"], k: "medias", modelo: true },
  { id: "panty-milano-especial", n: "Panty elasticada Milano talla especial", para: ["mujer"], cat: "pantalones", t: "todo", d: "Panty elasticada, talla especial.", tallas: ["Especial"], fotos: ["c-panty-milano-especial"], k: "medias talla grande", modelo: true },
  { id: "panty-milano-negra", n: "Panty elasticada Milano negra", para: ["mujer"], cat: "pantalones", t: "todo", d: "Panty elasticada negra, talla única.", tallas: ["Única"], fotos: ["c-panty-milano-negra"], k: "medias", modelo: true },
  { id: "calzas-colores", n: "Calzas lisas de colores", para: ["mujer"], cat: "pantalones", t: "todo", d: "Lisas, en ocho colores.", col: ["Negro", "Verde petróleo", "Gris oscuro", "Gris claro", "Burdeo", "Azul marino", "Azul rey", "Café"], fotos: ["c-calzas-colores"], k: "leggins", modelo: true },
  { id: "calzas-y-shorts", n: "Calzas y shorts lisos", para: ["mujer"], cat: "pantalones", t: "todo", d: "Calzas de pierna recta y acampanada, y shorts.", fotos: ["c-calzas-y-shorts"], k: "leggins short", modelo: true },
  { id: "short-calza", n: "Short tipo calza", para: ["mujer"], cat: "pantalones", t: "verano", d: "Short elástico de tiro alto.", col: ["Negro", "Arena", "Verde olivo", "Verde petróleo", "Café", "Burdeo", "Azul marino"], fotos: ["c-short-calza"], k: "calza corta", modelo: true },
  { id: "pantalon-pata-recta", n: "Pantalón pata recta", para: ["mujer"], cat: "pantalones", t: "todo", d: "Pata recta estándar, en varios colores.", fotos: ["c-pantalon-pata-recta"], modelo: true },
  { id: "pantalon-acampanado", n: "Pantalón acampanado", para: ["mujer"], cat: "pantalones", t: "todo", d: "Tiro alto y pierna acampanada.", col: ["Negro", "Café"], fotos: ["c-pantalon-acampanado", "c-pantalon-acampanado-2"], k: "oxford flare", modelo: true },
  { id: "pantalon-prelavado", n: "Pantalón prelavado", para: ["mujer"], cat: "pantalones", t: "todo", d: "Pierna ancha y cintura con cordón.", fotos: ["c-pantalon-prelavado"], k: "jeans ancho", modelo: true },
  { id: "calzas-tiro-alto", n: "Calzas tiro alto", para: ["mujer"], cat: "pantalones", t: "todo", d: "Elásticas y cómodas, con pretina alta que estiliza.", tallas: SXXL, col: ["Azul jaspe", "Azul marino", "Gris jaspe", "Negro"], fotos: ["w-calza-tiro-alto"], afiches: ["487a2e06"], k: "leggins" },
  { id: "calzas-forradas", n: "Calzas forradas", para: ["mujer"], cat: "pantalones", t: "invierno", d: "Interior de lanilla, abrigadas y sin transparencias.", col: ["Azul marino", "Negro", "Bordó", "Gris oscuro", "Gris melange", "Verde militar", "Beige taupe", "Rosa viejo"], fotos: ["w-calza-forrada"], afiches: ["12c43e7c", "0b9a064a"], k: "leggins termicas" },
  { id: "calzas-pata-recta", n: "Calzas pata recta", para: ["mujer"], cat: "pantalones", t: "invierno", d: "Abrigadoras y versátiles, para el día a día.", tallas: SXXL, col: ["Azul marino", "Burdeo", "Gris", "Negro"], fotos: ["w-calza-recta"], afiches: ["3b8ba519"], k: "leggins" },
  { id: "calza-efecto-piel", n: "Calza efecto piel", para: ["mujer"], cat: "pantalones", t: "invierno", d: "Por fuera parece panty y por dentro es afelpada.", col: ["Negro", "Gris claro", "Marrón", "Gris oscuro"], fotos: ["w-calza-piel"], afiches: ["0c081564"], k: "panty termica polar" },
  { id: "pantalones-forrados", n: "Pantalones y buzos forrados", para: ["mujer"], cat: "pantalones", t: "invierno", d: "Estilo jeans, cargo y buzo, con interior térmico.", col: ["Burdeo", "Café", "Negro", "Gris oscuro"], fotos: ["w-pantalon-forrado"], afiches: ["6e288af9", "eb0bcc63"], k: "buzo jeans cargo" },
  { id: "pantys", n: "Pantys de moda y escolares", para: ["mujer"], cat: "pantalones", t: "todo", d: "Con puntos, malla, lisas elasticadas y de bambú. También pantys escolares: pregunta por colores.", tallas: ["Única", "Especial"], tallasTexto: "Talla única y talla especial", col: ["Negro", "Piel"], fotos: ["w-pantys"], afiches: ["180e3858"], k: "medias colegio escolar" },
  { id: "calzas-deportivas", n: "Calzas deportivas", para: ["mujer"], cat: "pantalones", t: "verano", d: "Textura panal y estampados de colores.", col: ["Turquesa", "Fucsia"], fotos: ["s-calzas-deportivas"], k: "leggins deporte" },
  { id: "pantalones-verano", n: "Pantalones frescos", para: ["mujer"], cat: "pantalones", t: "verano", d: "Floreados, cuadrillé y cargo, en telas livianas.", fotos: ["s-pantalones"], k: "palazzo" },
  { id: "pantalon-chiporro", n: "Pantalón con chiporro", para: ["hombre"], cat: "pantalones", t: "invierno", d: "Forro de chiporro, cintura con cordón y bolsillos con cierre.", tallas: SXXL, col: ["Negro", "Azul marino"], fotos: ["m-pantalon-chiporro"], afiches: ["43aced90"], k: "buzo" },
  { id: "pantalones-polar-hombre", n: "Pantalones de polar y buzo", para: ["hombre"], cat: "pantalones", t: "invierno", d: "Modelo clásico y deportivo, con cintura elástica.", tallas: SXXL, col: ["Negro", "Azul marino", "Gris jaspeado", "Gris claro"], fotos: ["m-pantalon-polar"], k: "buzo" },

  // Pijamas
  { id: "pijamas-afraneladas", n: "Pijamas y camisones afranelados", para: ["mujer"], cat: "pijamas", t: "invierno", d: "Suaves y abrigados, desde la talla M hasta la 60.", tallasTexto: "Desde M hasta talla 60", col: ["Lila floreado", "Azul bordado", "Rosado floreado", "Verde floreado"], fotos: ["w-pijama-afranelada"], afiches: ["6c4a82c1"], k: "camison bata" },
  { id: "pijamas-hombre", n: "Pijamas para hombre", para: ["hombre"], cat: "pijamas", t: "invierno", d: "Algodón suave con botones al cuello.", tallas: SXXL, col: ["Azul", "Gris", "Azul marino"], fotos: ["m-pijama"], afiches: ["ecb0201a"], k: "pijama" },
  { id: "pijamas-verano", n: "Pijamas y camisones de verano", para: ["mujer"], cat: "pijamas", t: "verano", d: "Telas frescas, con short o en camisón.", col: ["Lila", "Rosado", "Celeste"], fotos: ["s-pijama-verano"], k: "baby doll camison" },

  // Calcetas y calcetines
  { id: "tobillera-bambu-sc2190", n: "Tobillera de bambú SC2190", para: ["mujer"], cat: "calcetas", t: "todo", d: "Tobillera de bambú de mujer.", fotos: ["c-tobillera-bambu-sc2190"], k: "soquete", modelo: true },
  { id: "tobillera-cobre-sc2191", n: "Tobillera de cobre y bambú SC2191", para: ["mujer"], cat: "calcetas", t: "todo", d: "Cobre y bambú. Marca Za-Za.", fotos: ["c-tobillera-cobre-sc2191"], k: "soquete", modelo: true },
  { id: "talonera-cobre-sc2116", n: "Talonera de cobre SC2116", para: ["mujer"], cat: "calcetas", t: "todo", d: "Talonera de cobre y algodón.", fotos: ["c-talonera-cobre-sc2116"], k: "soquete invisible", modelo: true },
  { id: "talonera-q8", n: "Talonera Q8", para: ["mujer"], cat: "calcetas", t: "todo", d: "Talonera en rosado, beige, blanco y negro.", fotos: ["c-talonera-q8"], k: "soquete invisible", modelo: true },
  { id: "calceta-bambu-sc2140", n: "Calceta de bambú SC2140", para: ["mujer"], cat: "calcetas", t: "todo", d: "Bambú, apta para diabéticos.", fotos: ["c-calceta-bambu-sc2140"], k: "diabetico diabetes", modelo: true },
  { id: "calceta-circulacion", n: "Calceta de circulación", para: ["mujer"], cat: "calcetas", t: "todo", d: "Algodón, de mujer.", fotos: ["c-calceta-circulacion"], k: "diabetico", modelo: true },
  { id: "calceta-juvenil", n: "Calceta juvenil", para: ["mujer"], cat: "calcetas", t: "todo", d: "Con diseños de colores.", fotos: ["c-calceta-juvenil"], modelo: true },
  { id: "calceta-toalla-w16208", n: "Calceta de algodón toalla W16208", para: ["mujer"], cat: "calcetas", t: "invierno", d: "Interior de toalla, con vuelta. Marca Pesail.", fotos: ["c-calceta-toalla-w16208"], modelo: true },
  { id: "calceta-larga-hd16305", n: "Calceta larga de algodón toalla HD-16305", para: ["mujer"], cat: "calcetas", t: "invierno", d: "Larga, con interior de toalla. Marca Pesail.", fotos: ["c-calceta-larga-hd16305"], modelo: true },
  { id: "calceta-lana-toalla-8231", n: "Calceta de lana toalla 8231", para: ["mujer"], cat: "calcetas", t: "invierno", d: "Lana con interior de toalla.", fotos: ["c-calceta-lana-toalla-8231"], k: "termica", modelo: true },
  { id: "calceta-lana-disenos", n: "Calceta de lana con diseños", para: ["mujer"], cat: "calcetas", t: "invierno", d: "Lana, con diseños.", fotos: ["c-calceta-lana-disenos"], k: "termica", modelo: true },
  { id: "calcetin-termico-s02", n: "Calcetín térmico S02", para: ["mujer"], cat: "calcetas", t: "invierno", d: "Térmico, de mujer.", fotos: ["c-calcetin-termico-s02"], k: "termica", modelo: true },
  { id: "calceta-thermo-8505", n: "Calceta thermo 8505", para: ["mujer"], cat: "calcetas", t: "invierno", d: "Térmica, con diseños.", fotos: ["c-calceta-thermo-8505"], k: "termica", modelo: true },
  { id: "calcetin-ultra-termico-sa2328", n: "Calcetín ultra térmico SA2328", para: ["mujer"], cat: "calcetas", t: "invierno", d: "Ultra térmico, de mujer. Marca Za-Za.", fotos: ["c-calcetin-ultra-termico-sa2328"], k: "termica", modelo: true },
  { id: "calceta-cachemira-sc2330", n: "Calceta de cachemira SC2330", para: ["mujer"], cat: "calcetas", t: "invierno", d: "Cachemira, de mujer. Marca Za-Za.", fotos: ["c-calceta-cachemira-sc2330"], k: "termica", modelo: true },
  { id: "calcetin-diabetico-sk520", n: "Calcetín diabético grueso SK520", para: ["mujer"], cat: "calcetas", t: "invierno", d: "Grueso, apto para diabéticos. Marca Pesail.", fotos: ["c-calcetin-diabetico-sk520"], k: "diabetes", modelo: true },
  { id: "tobillera-bambu-sc3119", n: "Tobillera de bambú juvenil SC3119", para: ["mujer", "hombre"], cat: "calcetas", t: "todo", d: "Bambú, tallas 36 a 39. Marca Za-Za.", tallasTexto: "Tallas 36 a 39", fotos: ["c-tobillera-bambu-sc3119"], k: "soquete", modelo: true },
  { id: "media-cana-q44p", n: "Media caña juvenil Q44-P", para: ["mujer", "hombre"], cat: "calcetas", t: "todo", d: "Media caña, talla 38 a 40.", tallasTexto: "Talla 38 a 40", fotos: ["c-media-cana-q44p"], modelo: true },
  { id: "calceta-tenis-color", n: "Calceta tenis de color", para: ["mujer", "hombre"], cat: "calcetas", t: "todo", d: "Calceta deportiva en azul marino, gris y negro.", fotos: ["c-calceta-tenis-color"], k: "deportiva", modelo: true },
  { id: "tobillera-hombre-408c", n: "Tobillera de hombre negra 408C", para: ["hombre"], cat: "calcetas", t: "todo", d: "Tobillera negra.", fotos: ["c-tobillera-hombre-408c"], k: "soquete", modelo: true },
  { id: "tobillera-lisa-cach", n: "Tobillera lisa de hombre Ca&Ch", para: ["hombre"], cat: "calcetas", t: "todo", d: "Lisa, en azul marino, blanco y gris.", fotos: ["c-tobillera-lisa-cach"], k: "soquete", modelo: true },
  { id: "tobillera-cobre-sa1109", n: "Tobillera de cobre y bambú SA1109", para: ["hombre"], cat: "calcetas", t: "todo", d: "Cobre y bambú, con toalla. Marca Za-Za.", fotos: ["c-tobillera-cobre-sa1109"], k: "soquete", modelo: true },
  { id: "calcetin-vestir-ry-q715b", n: "Calcetín de vestir RY-Q715B", para: ["hombre"], cat: "calcetas", t: "todo", d: "De vestir, con rombos. Marca Pesail.", fotos: ["c-calcetin-vestir-ry-q715b"], k: "formal", modelo: true },
  { id: "calcetin-diabetico-sk420", n: "Calcetín diabético grueso SK420", para: ["hombre"], cat: "calcetas", t: "invierno", d: "Grueso, apto para diabéticos.", fotos: ["c-calcetin-diabetico-sk420"], k: "diabetes", modelo: true },
  { id: "calcetin-diabetico-sa1177", n: "Calcetín diabético de cobre y bambú SA1177", para: ["hombre"], cat: "calcetas", t: "todo", d: "Cobre y bambú, con toalla. Marca Za-Za.", fotos: ["c-calcetin-diabetico-sa1177"], k: "diabetes", modelo: true },
  { id: "calceta-cachemira-sc1339", n: "Calceta de cachemira para diabéticos SC1339", para: ["hombre"], cat: "calcetas", t: "invierno", d: "Cachemira con interior de toalla.", fotos: ["c-calceta-cachemira-sc1339"], k: "diabetes termica", modelo: true },
  { id: "calcetin-grueso-sa1107", n: "Calcetín grueso de cobre y bambú SA1107", para: ["hombre"], cat: "calcetas", t: "invierno", d: "Grueso, de cobre y bambú.", fotos: ["c-calcetin-grueso-sa1107", "c-calcetin-grueso-sa1107-2"], k: "termica", modelo: true },
  { id: "calcetin-grueso-hd320", n: "Calcetín grueso HD-320", para: ["hombre"], cat: "calcetas", t: "invierno", d: "Grueso, con diseño de colores. Marca Pesail.", fotos: ["c-calcetin-grueso-hd320"], k: "termica", modelo: true },
  { id: "calcetin-grueso-hd322", n: "Calcetín grueso HD-322", para: ["hombre"], cat: "calcetas", t: "invierno", d: "Grueso, con rayas. Marca Pesail.", fotos: ["c-calcetin-grueso-hd322"], k: "termica", modelo: true },
  { id: "calcetin-ultra-termico-sa1332", n: "Calcetín ultra térmico SA1332", para: ["hombre"], cat: "calcetas", t: "invierno", d: "Ultra térmico, de hombre. Marca Za-Za.", fotos: ["c-calcetin-ultra-termico-sa1332"], k: "termica", modelo: true },
  { id: "calceta-lana-81", n: "Calceta de lana 81", para: ["hombre"], cat: "calcetas", t: "invierno", d: "Lana, de hombre. Marca Figure.", fotos: ["c-calceta-lana-81"], k: "termica", modelo: true },
  { id: "calceta-alpaca-s08", n: "Calceta de alpaca antideslizante S08", para: ["hombre"], cat: "calcetas", t: "invierno", d: "Alpaca, con antideslizante. Marca Pesail.", fotos: ["c-calceta-alpaca-s08"], k: "termica chiporro", modelo: true },
  { id: "calcetas", n: "Calcetas para toda la familia", para: ["mujer", "hombre"], cat: "calcetas", t: "todo", d: "Deportivas, de vestir, casuales, tobilleras y térmicas.", tallas: ["35 a 38", "39 a 42", "43 a 46"], tallasTexto: "Del 35 al 46", col: ["Negro", "Azul marino", "Gris", "Blanco", "Gris jaspe", "Azul"], fotos: ["u-calcetas"], afiches: ["c19fb92a"], k: "calcetines medias" },
  { id: "calcetas-chiporro", n: "Calcetas de chiporro antideslizantes", para: ["hombre"], cat: "calcetas", t: "invierno", d: "Interior de chiporro y puntos antideslizantes para andar en casa.", tallas: ["Única (39 a 46)"], col: ["Azul marino", "Verde", "Gris oscuro"], fotos: ["m-calcetas-chiporro"], afiches: ["548851a5"], k: "calcetines polar" },
  { id: "calcetas-diabeticos", n: "Calcetas para diabéticos", para: ["hombre"], cat: "calcetas", t: "todo", d: "Con cobre y bambú, y un puño que no aprieta. Pensadas para pies delicados.", tallas: ["Única"], col: ["Negro", "Azul marino", "Café"], fotos: ["m-calcetas-diabetes"], afiches: ["d2c3cf1e"], k: "calcetines diabetes" },

  // Gorros, bufandas y accesorios
  { id: "panuelos-color", n: "Pañuelos de color Pilathus", para: ["mujer", "hombre"], cat: "accesorios", t: "todo", d: "Pañuelos de género con borde de color.", fotos: ["c-panuelos-color"], modelo: true },
  { id: "panuelos-blancos", n: "Pañuelos blancos Pilathus", para: ["mujer", "hombre"], cat: "accesorios", t: "todo", d: "Pañuelos de género blancos.", fotos: ["c-panuelos-blancos"], modelo: true },
  { id: "pechera", n: "Pechera", para: ["mujer"], cat: "accesorios", t: "todo", d: "Con bolsillos y amarras a los lados.", fotos: ["c-pechera"], k: "delantal cocina", modelo: true },
  { id: "gorros-lana", n: "Gorros de lana", para: ["hombre"], cat: "accesorios", t: "invierno", d: "Tejido grueso con interior térmico.", tallas: ["Única"], col: ["Negro", "Gris", "Azul marino", "Negro con rojo", "Negro con azul"], fotos: ["m-gorros"], afiches: ["f471e6ba"], k: "beanie" },
  { id: "bufanda", n: "Bufanda tejida", para: ["hombre"], cat: "accesorios", t: "invierno", d: "Tejido suave que no pica, con diseño de rombos.", tallas: ["Única"], col: ["Gris", "Azul"], fotos: ["m-bufanda"], afiches: ["e39f9571"], k: "regalo" },
  { id: "banano", n: "Banano", para: ["mujer", "hombre"], cat: "accesorios", t: "todo", d: "Impermeable, con varios bolsillos y correa ajustable de 60 a 110 cm. Mide 32 × 14 × 8 cm.", tallas: ["Única"], col: ["Negro", "Azul marino", "Gris", "Verde petróleo"], fotos: ["u-banano"], afiches: ["73365d57"], k: "canguro riñonera bolso" },

  // Niños
  { id: "ballerina-nina-piel", n: "Ballerina de niña color piel", para: ["ninos"], cat: "ninos", t: "todo", d: "Surtido de tallas 6 a 12.", tallas: ["6", "8", "10", "12"], fotos: ["c-ballerina-nina-piel"], k: "panty medias", modelo: true },
  { id: "ballerina-nina-negra", n: "Ballerina de niña negra", para: ["ninos"], cat: "ninos", t: "todo", d: "Surtido de tallas 6 a 12.", tallas: ["6", "8", "10", "12"], fotos: ["c-ballerina-nina-negra"], k: "panty medias", modelo: true },
  { id: "ballerina-nina-blanca", n: "Ballerina de niña blanca", para: ["ninos"], cat: "ninos", t: "todo", d: "Surtido de tallas 6 a 12.", tallas: ["6", "8", "10", "12"], fotos: ["c-ballerina-nina-blanca"], k: "panty medias", modelo: true },
  { id: "panty-escolar-azul", n: "Panty escolar azul de algodón", para: ["ninos"], cat: "ninos", t: "todo", d: "Algodón, para el colegio.", fotos: ["c-panty-escolar-azul"], k: "colegio medias", modelo: true },
  { id: "bucanera-escolar", n: "Bucanera escolar", para: ["ninos"], cat: "ninos", t: "todo", d: "Para el colegio, en gris.", fotos: ["c-bucanera-escolar"], k: "colegio calceta larga", modelo: true },
  { id: "bucanera-colegial-omas", n: "Bucanera colegial O'Mas", para: ["ninos"], cat: "ninos", t: "todo", d: "Para el colegio, en azul marino, blanco, gris y negro.", fotos: ["c-bucanera-colegial-omas"], k: "colegio calceta larga", modelo: true },
  { id: "calceta-escolar", n: "Calceta escolar", para: ["ninos"], cat: "ninos", t: "todo", d: "Para el colegio, en azul marino y gris.", fotos: ["c-calceta-escolar", "c-calceta-escolar-2"], k: "colegio", modelo: true },
  { id: "calceta-bambu-sc2139", n: "Calceta de bambú SC2139", para: ["ninos"], cat: "ninos", t: "todo", d: "Bambú, tallas 31 a 35.", tallasTexto: "Tallas 31 a 35", fotos: ["c-calceta-bambu-sc2139"], modelo: true },
  { id: "medias-nina-disenos", n: "Medias de niña con diseños", para: ["ninos"], cat: "ninos", t: "todo", d: "Con diseños, talla 4-6. Marca Pesail.", tallasTexto: "Talla 4-6", fotos: ["c-medias-nina-disenos"], modelo: true },
  { id: "medias-nino-disenos", n: "Medias de niño con diseños", para: ["ninos"], cat: "ninos", t: "todo", d: "Con rayas y colores, talla 4-6. Marca Pesail.", tallasTexto: "Talla 4-6", fotos: ["c-medias-nino-disenos"], modelo: true },
  { id: "calceta-nino", n: "Calceta de niño", para: ["ninos"], cat: "ninos", t: "todo", d: "Con diseños de colores.", fotos: ["c-calceta-nino"], modelo: true },
  { id: "calceta-bebe-nina", n: "Calceta de bebé niña antideslizante", para: ["ninos"], cat: "ninos", t: "todo", d: "Antideslizante, con diseños.", fotos: ["c-calceta-bebe-nina"], k: "guagua", modelo: true },
  { id: "calceta-bebe-p61g", n: "Calceta de bebé niña P-61G", para: ["ninos"], cat: "ninos", t: "todo", d: "Con diseños.", fotos: ["c-calceta-bebe-p61g"], k: "guagua", modelo: true },
  { id: "calceta-bebe-nino", n: "Calceta de bebé niño antideslizante", para: ["ninos"], cat: "ninos", t: "todo", d: "Antideslizante, con diseños.", fotos: ["c-calceta-bebe-nino"], k: "guagua", modelo: true },
  { id: "calceta-bebe-p61b2", n: "Calceta de bebé niño P-61B2", para: ["ninos"], cat: "ninos", t: "todo", d: "Con diseños.", fotos: ["c-calceta-bebe-p61b2"], k: "guagua", modelo: true },
  { id: "camiseta-nino-azul", n: "Camiseta de niño azul marino", para: ["ninos"], cat: "ninos", t: "todo", d: "Algodón nacional, manga larga. Surtido de tallas.", fotos: ["c-camiseta-nino-azul"], k: "interior colegio", modelo: true },
  { id: "camiseta-nino-blanca", n: "Camiseta de niño blanca", para: ["ninos"], cat: "ninos", t: "todo", d: "Algodón nacional, manga larga.", fotos: ["c-camiseta-nino-blanca"], k: "interior colegio", modelo: true },
  { id: "camiseta-nino-manga-corta", n: "Camiseta de niño manga corta", para: ["ninos"], cat: "ninos", t: "todo", d: "Algodón nacional, tallas 4 a 12.", tallas: ["4", "6", "8", "10", "12"], fotos: ["c-camiseta-nino-manga-corta"], k: "interior colegio", modelo: true },
  { id: "camiseta-juvenil-nina-3564", n: "Camiseta juvenil de niña 3564", para: ["ninos"], cat: "ninos", t: "invierno", d: "Bambú polar, cuello redondo, con puntitos de colores.", fotos: ["c-camiseta-juvenil-nina-3564"], k: "termica", modelo: true },
  { id: "camiseta-panty-nina-piel", n: "Camiseta panty de niña color piel", para: ["ninos"], cat: "ninos", t: "invierno", d: "Camiseta panty color piel.", fotos: ["c-camiseta-panty-nina-piel"], k: "termica", modelo: true },
  { id: "camiseta-panty-nina-blanca", n: "Camiseta panty de niña blanca", para: ["ninos"], cat: "ninos", t: "invierno", d: "Camiseta panty blanca. Marca Stavias.", fotos: ["c-camiseta-panty-nina-blanca"], k: "termica", modelo: true },
  { id: "camiseta-panty-nina-negra", n: "Camiseta panty de niña negra", para: ["ninos"], cat: "ninos", t: "invierno", d: "Camiseta panty negra. Marca Stavias.", fotos: ["c-camiseta-panty-nina-negra"], k: "termica", modelo: true },
  { id: "peto-nina-8997", n: "Peto de niña 8997", para: ["ninos"], cat: "ninos", t: "todo", d: "Peto de colores, talla única.", tallas: ["Única"], fotos: ["c-peto-nina-8997"], k: "top", modelo: true },
  { id: "peto-nina-6238", n: "Peto de niña 6238", para: ["ninos"], cat: "ninos", t: "todo", d: "Peto de colores, talla única.", tallas: ["Única"], fotos: ["c-peto-nina-6238"], k: "top", modelo: true },
  { id: "calzon-nina", n: "Calzón de niña, algodón peruano", para: ["ninos"], cat: "ninos", t: "todo", d: "Algodón peruano, con flores de colores.", fotos: ["c-calzon-nina"], modelo: true },
  { id: "calzon-nina-talla-surtida", n: "Calzón de niña talla surtida", para: ["ninos"], cat: "ninos", t: "todo", d: "Algodón peruano, con puntos de colores.", tallas: ["4", "6", "8", "10"], fotos: ["c-calzon-nina-talla-surtida"], modelo: true },
  { id: "boxer-bebe-jack", n: "Bóxer de bebé Jack", para: ["ninos"], cat: "ninos", t: "todo", d: "Con animalitos estampados.", fotos: ["c-boxer-bebe-jack"], k: "calzoncillo guagua", modelo: true },
  { id: "boxer-nino-jack", n: "Bóxer de niño Jack", para: ["ninos"], cat: "ninos", t: "todo", d: "Bóxer de colores.", fotos: ["c-boxer-nino-jack"], k: "calzoncillo", modelo: true },
  { id: "boxer-juvenil-jack", n: "Bóxer juvenil Jack", para: ["ninos"], cat: "ninos", t: "todo", d: "Bóxer de colores, tallas juveniles.", fotos: ["c-boxer-juvenil-jack"], k: "calzoncillo", modelo: true },
  { id: "ropa-ninos", n: "Ropa para niños", para: ["ninos"], cat: "ninos", t: "verano", d: "Poleras, shorts y conjuntos. Pregunta por las tallas disponibles.", fotos: ["k-ninos"], k: "niño niña infantil" }
];

/* =========================================================================
   PRODUCTOS DE LA TIENDA POR MATERIAL (lista entregada por la familia el 29 de octubre de 2026)
   Incluye prendas que aún no están en el catálogo de la página (no tienen foto). No lleva precios, tallas,
   colores ni stock: eso se confirma por WhatsApp. Para agregar o quitar algo, se edita esta lista.
   - "k": otras palabras con que la gente lo busca.
   - "ninos: true": prenda para niñas o niños. Regla de la marca: va siempre aparte de la lencería y la
     ropa interior de adultos (en textos, filtros y respuestas).
   - "soloSiPiden: true": el ayudante solo la menciona si la persona la pide directamente.
   ========================================================================= */
const PRODUCTOS_TIENDA = [
  { grupo: "Polar", items: [
    { n: "Pantalones de polar", k: "pantalon buzo" },
    { n: "Polerones de polar", k: "poleron" },
    { n: "Pijamas de polar", k: "pijama piyama" },
    { n: "Poleras de polar para hombre", k: "polera termica" },
    { n: "Calzoncillos largos de polar", k: "calzoncillo largo termico primera capa" },
    { n: "Cuellos de polar", k: "cuello bufanda" },
    { n: "Camisas afraneladas de polar para hombre y para mujer", k: "camisa afranelada cuadrille leñadora" },
    { n: "Camisas afraneladas de polar para niña", k: "camisa afranelada niña", ninos: true }
  ] },
  { grupo: "Algodón", items: [
    { n: "Pijamas de algodón", k: "pijama piyama" },
    { n: "Poleras de algodón", k: "polera" },
    { n: "Calzas de algodón", k: "calza leggins" },
    { n: "Calzoncillos largos de algodón", k: "calzoncillo largo" },
    { n: "Calcetas de algodón", k: "calceta calcetin pies" },
    { n: "Sostenes de algodón", k: "sosten brasier" },
    { n: "Sostén maternal de algodón", k: "sosten maternal maternidad lactancia embarazada amamantar" },
    { n: "Pantalones de buzo de algodón para señora y para hombre", k: "buzo pantalon jogger" },
    { n: "Pantalones de buzo de colegio para niño y niña", k: "buzo colegio escolar uniforme deportivo", ninos: true },
    { n: "Polerones de algodón", k: "poleron" },
    { n: "Poleras de piqué de algodón", k: "polera pique" },
    { n: "Poleras polo de algodón", k: "polera polo" }
  ] },
  { grupo: "Lycra", items: [
    { n: "Calzones de lycra", k: "calzon laicra licra" },
    { n: "Calzas de lycra", k: "calza leggins laicra licra deportiva" },
    { n: "Sostén deportivo de lycra", k: "sosten deportivo top laicra licra" }
  ] },
  { grupo: "Nylon", items: [
    { n: "Poleras de nylon", k: "polera nilon nailon" },
    { n: "Pantalones de nylon para mujer", k: "pantalon nilon nailon" },
    { n: "Calzones y colaless de nylon", k: "calzon colaless colales tanga nilon nailon" },
    { n: "Vestidos de nylon", k: "vestido nilon nailon" }
  ] },
  { grupo: "Chiporro y corderito", items: [
    { n: "Calcetas de chiporro", k: "calceta chiporro pies" },
    { n: "Chalecas con chiporro para hombre y mujer", k: "chaleca chaleco chiporro" },
    { n: "Polerones de corderito, peludos por dentro y por fuera", k: "poleron corderito peludo" }
  ] },
  { grupo: "Lana y lanilla", items: [
    { n: "Gorros de lana", k: "gorro cabeza orejas" },
    { n: "Guantes de lana", k: "guante manos" },
    { n: "Bufandas de lana", k: "bufanda cuello" },
    { n: "Chalecas y chombas de lana para hombre y mujer", k: "chaleca chomba chaleco sweater sueter" },
    { n: "Pantalones de lanilla para mujer", k: "pantalon lanilla" }
  ] },
  { grupo: "Calcetas", items: [
    { n: "Calcetas de cobre y bambú", k: "calceta cobre bambu pies" },
    { n: "Calcetas para diabéticos", k: "calceta diabetico diabetes pies" },
    { n: "Calcetas deportivas", k: "calceta deportiva pies" }
  ] },
  { grupo: "Pantys y medias", items: [
    { n: "Pantys transparentes", k: "panty pantis medias transparente" },
    { n: "Medias pantalón", k: "media pantalon panty" },
    { n: "Pantys de bambú", k: "panty pantis bambu" },
    { n: "Pantys de malla", k: "panty pantis malla rejilla" },
    { n: "Pantys con diseños", k: "panty pantis diseño diseños" },
    { n: "Pantys de pie", k: "panty pantis pie" },
    { n: "Pantys de niña y de niño", k: "panty pantis niña niño", ninos: true },
    { n: "Pantys de colegio", k: "panty pantis colegio escolar", ninos: true }
  ] },
  { grupo: "Pantuflas", items: [
    { n: "Pantuflas de mujer y de hombre", k: "pantufla pantuflas chalas zapatillas casa pies" }
  ] },
  { grupo: "Ropa interior de hombre", items: [
    { n: "Bóxer largo y corto para hombre", k: "boxer" },
    { n: "Calzoncillos de hombre", k: "calzoncillo slip" }
  ] },
  { grupo: "Para niño", items: [
    { n: "Bóxer de niño", k: "boxer niño", ninos: true, soloSiPiden: true }
  ] }
];
// Lista de lo que hay por material, sin las prendas de niños (se usa en la pregunta frecuente de materiales).
function textoMateriales() {
  return PRODUCTOS_TIENDA.map(g => {
    const its = g.items.filter(i => !i.ninos).map(i => i.n.charAt(0).toLowerCase() + i.n.slice(1));
    return its.length ? `- **${g.grupo}:** ${its.join(", ")}.` : "";
  }).filter(Boolean).join("\n");
}
// Lo que hay para niñas y niños (sin lo marcado "soloSiPiden").
function textoNinos() {
  const its = PRODUCTOS_TIENDA.flatMap(g => g.items).filter(i => i.ninos && !i.soloSiPiden).map(i => i.n.charAt(0).toLowerCase() + i.n.slice(1));
  return its.join(", ").replace(/, ([^,]*)$/, " y $1");
}

// Preguntas frecuentes: se muestran en la sección "Preguntas frecuentes" y el ayudante virtual las usa para responder.
// Formato de las respuestas: párrafos separados por una línea en blanco; líneas que empiezan con "- " son viñetas;
// enlaces como [texto](destino). Destinos: #seccion, pagina.html#parte, https://..., tel:+569...,
// wsp:mensaje (WhatsApp de la tienda), wspc:mensaje (WhatsApp de consultas) y accion:tallas (abre la guía de tallas).
// {envoltorio} se reemplaza solo por las condiciones vigentes del envoltorio de regalo.
// "claves" son palabras extra con las que el ayudante reconoce la pregunta.
const CATEGORIAS_PREGUNTAS = [
  ["pedidos", "Pedidos y compras"], ["productos", "Productos y materiales"], ["envios", "Envíos y retiro"], ["tallas", "Tallas y cuidado"],
  ["cambios", "Cambios, devoluciones y garantía"], ["descuento", "Descuento de bienvenida"], ["regalos", "Regalos"],
  ["mayor", "Ventas por mayor"], ["pagina", "La tienda, la página y tus datos"]
];
const PREGUNTAS_FRECUENTES = [
  { id: "como-pedir", cat: "pedidos", p: "¿Cómo hago un pedido?", claves: "comprar pedir encargar hacer pedido como compro",
    r: "Elige una prenda en el [catálogo](#catalogo), escoge talla, color y cantidad, y toca \"Agregar a mi pedido\". Cuando termines, abre \"Ver mi pedido\", escribe tu nombre y toca \"Enviar pedido por WhatsApp\": el mensaje se escribe solo.\n\nTe respondemos con la disponibilidad y el precio, y coordinamos el pago y la entrega. No necesitas crear una cuenta." },
  { id: "pagar", cat: "pedidos", p: "¿Puedo pagar en la página?", claves: "pago pagar tarjeta transferencia debito credito efectivo medios de pago",
    r: "No. La página no cobra ni pide datos de tarjetas. El pago se coordina por WhatsApp cuando te confirmamos la disponibilidad y el precio, y ahí te indicamos los medios de pago. Si compras en la tienda, pagas allá." },
  { id: "disponibilidad", cat: "pedidos", p: "¿Cómo sé si una prenda está disponible?", claves: "stock disponible hay quedan agotado unidades existencias tienen",
    r: "El catálogo muestra lo que vendemos, pero no las unidades en tiempo real, porque la tienda también vende en persona. Al enviar tu pedido te confirmamos por WhatsApp qué tallas y colores hay. Si algo no está, te ofrecemos otra opción o lo traemos a pedido." },
  { id: "precios", cat: "pedidos", p: "¿Por qué no aparecen los precios?", claves: "precio precios valor cuanto cuesta cuanto vale",
    r: "Por ahora confirmamos los precios por WhatsApp, junto con la disponibilidad de tu talla y color. Siempre sabrás el precio total, con el envío si corresponde, antes de pagar." },
  { id: "cantidad", cat: "pedidos", p: "¿Cuántas unidades puedo pedir?", claves: "cantidad unidades cuantas maximo mas de veinte cambiar cantidad aumentar disminuir",
    r: "En la página puedes pedir hasta 20 unidades de cada prenda y cambiar la cantidad con los botones − y + en \"Tu pedido\". Si necesitas más, revisa las [ventas por mayor](#pregunta-por-mayor)." },
  { id: "cambiar-pedido", cat: "pedidos", p: "Me equivoqué en mi pedido, ¿puedo cambiarlo o cancelarlo?", claves: "equivoque cambiar cancelar anular corregir error pedido modificar",
    r: "Sí, antes de pagar. Si todavía no lo envías, cámbialo en \"Tu pedido\". Si ya lo enviaste, escríbenos en la misma conversación de WhatsApp qué quieres cambiar o si lo cancelas.\n\nSi no alcanzaste a enviarlo, en \"Ver mi pedido\" aparece \"Recuperar mi pedido\" durante un día." },
  { id: "no-esta", cat: "pedidos", p: "Busco algo que no está en la página", claves: "no encuentro no esta buscar encargo traer pedido especial",
    r: "En la tienda hay mucho más de lo que cabe en el catálogo y, si no lo tenemos, lo buscamos para ti. [Cuéntanos qué buscas](wsp:Hola Angie's Secret 👋 Estoy buscando: ) con la talla y el color." },
  { id: "whatsapp-no-abre", cat: "pedidos", p: "Toqué \"Enviar pedido\" y no se abrió WhatsApp", claves: "whatsapp no abre no se abre no funciona enviar no puedo enviar",
    r: "- Revisa que tengas WhatsApp instalado. En computador se abre WhatsApp Web.\n- Si el navegador bloqueó la ventana, permítela e inténtalo de nuevo.\n- En \"Ver mi pedido\" puedes tocar \"Copiar mi pedido\" y pegarlo en un chat con el +56 9 9570 9114.\n\nSi sigue sin funcionar, [escríbenos](wspc:Hola 👋 Tengo un problema para enviar mi pedido desde la página.) o [llámanos](tel:+56949376311)." },

  { id: "materiales", cat: "productos", p: "¿Qué productos tienen y de qué materiales?", claves: "material materiales tela telas genero algodon polar lycra licra laicra nylon nailon nilon lana lanilla chiporro corderito bambu cobre",
    r: "Esto es lo que hay en la tienda, por material (no todo está todavía en el catálogo de la página):\n\n{materiales}\n\nLas tallas, los colores y el precio de cada prenda te los confirmamos por [WhatsApp](wsp:Hola Angie's Secret 👋 Quería consultar por: )." },
  { id: "ninos", cat: "productos", p: "¿Qué tienen para niñas y niños?", claves: "niños niñas niño niña infantil hijo hija colegio escolar",
    r: "Además de la ropa para niños del catálogo (poleras, shorts y conjuntos), en la tienda tenemos {ninos}. Pregúntanos por tallas y colores por [WhatsApp](wsp:Hola Angie's Secret 👋 Busco para mi hijo o hija: )." },

  { id: "envios", cat: "envios", p: "¿Hacen envíos? ¿Cuánto cuestan?", claves: "envio envios despacho despachan regiones domicilio costo envio delivery",
    r: "Sí, enviamos a todo Chile. El envío tiene un costo adicional que depende de la comuna o región de destino: te lo informamos por WhatsApp, junto con el total, antes de que pagues. Si retiras en la tienda, no pagas envío." },
  { id: "plazos", cat: "envios", p: "¿Cuánto se demora en llegar?", claves: "demora plazo cuando llega dias tarda",
    r: "Depende del destino y de la empresa de envío. Al confirmar tu pedido por WhatsApp te informamos el plazo estimado para tu comuna." },
  { id: "retiro", cat: "envios", p: "¿Puedo retirar en la tienda?", claves: "retirar retiro buscar tienda local pasar",
    r: "Sí, sin costo, en Domingo Santa María 3831, Renca, de lunes a sábado de 11:00 a 20:00 (feriados de 11:00 a 14:00). Coordina el día por WhatsApp." },
  { id: "regalo-a-otra-persona", cat: "envios", p: "¿Pueden enviar un regalo a otra persona?", claves: "enviar regalo otra persona otra direccion sorpresa",
    r: "Sí. Al confirmar el pedido por WhatsApp, indícanos la comuna de destino y para quién es." },

  { id: "mi-talla", cat: "tallas", p: "¿Cómo sé cuál es mi talla?", claves: "talla tallas medida medidas medirme que talla soy",
    r: "Usa la [guía de tallas](accion:tallas): explica cómo medirte (busto, cintura y cadera) y envías tus medidas por WhatsApp. Te recomendamos la talla según la prenda, porque cada marca y modelo calza distinto." },
  { id: "tallas-grandes", cat: "tallas", p: "¿Tienen tallas grandes?", claves: "tallas grandes xl xxl xxxl talla grande gordita plus",
    r: "Sí. La mayoría de las prendas van de la S a la XXL, la camisa de polar para hombre llega a XXXL y los pijamas afranelados de mujer, hasta la talla 60. Pregúntanos por la prenda que te interesa." },
  { id: "talla-sosten", cat: "tallas", p: "¿Cómo elijo la talla de mi sostén?", claves: "sosten brasier copa contorno talla sosten bajo busto",
    r: "Mide tu busto en la parte más prominente y también justo debajo del busto, sin apretar la huincha, y envíanos las dos medidas por WhatsApp. Te decimos qué talla y modelo te queda mejor. En la tienda también te asesoramos, con discreción." },
  { id: "cuidado", cat: "tallas", p: "¿Cómo cuido mi lencería?", claves: "lavar lavado cuidar cuidado secar",
    r: "Recomendación general: lava a mano, o en lavadora dentro de una bolsa de malla, con agua fría y jabón suave. Abrocha los sostenes antes de lavarlos y sécalos a la sombra, sin secadora. Revisa siempre la etiqueta de cada prenda." },

  { id: "cambios", cat: "cambios", p: "¿Puedo cambiar una prenda?", claves: "cambio cambiar devolver devolucion no me quedo talla equivocada",
    r: "Si la prenda viene con una falla, tienes la garantía legal de 6 meses: cambio, reparación o devolución del dinero. Para cambios por talla o color, pregúntanos antes de comprar y te contamos las condiciones de esa prenda. Guarda tu boleta y la prenda con sus etiquetas." },
  { id: "garantia", cat: "cambios", p: "¿Qué pasa si una prenda viene con falla?", claves: "falla fallada defecto rota descosida garantia mala calidad",
    r: "Tienes garantía legal de 6 meses desde que la recibes: puedes elegir entre el cambio, la reparación o la devolución del dinero (Ley 19.496 sobre Protección de los Derechos de los Consumidores). Escríbenos con una foto de la falla y tu boleta, y lo resolvemos." },
  { id: "retracto", cat: "cambios", p: "¿Qué es el derecho a retracto?", claves: "retracto arrepentirme arrepentimiento devolver diez dias",
    r: "Si compras a distancia (por ejemplo, por WhatsApp o desde esta página), tienes 10 días desde que recibes el producto para arrepentirte y devolverlo en buen estado, con sus etiquetas y envases originales.\n\n**Importante:** por higiene, no hay derecho a retracto en ropa interior ni trajes de baño si se abrió o retiró su sello o envase de seguridad.\n\nEn las compras hechas en la tienda no corre el retracto, pero sí la garantía legal. [Ver los términos y condiciones](terminos.html#cambios)." },

  { id: "descuento", cat: "descuento", p: "¿Cómo funciona el descuento de bienvenida?", claves: "descuento bienvenida registro registrarme promocion porcentaje",
    r: "[Regístrate](#registro) con tu nombre, apellido y teléfono. En tu primera compra por WhatsApp tienes 10% si las prendas suman desde $15.000, o 15% si suman $50.000 o más, sin contar el envío. Vale 1 mes desde que te registras y una vez por persona. [Ver las bases](privacidad.html#bases)." },
  { id: "codigo", cat: "descuento", p: "¿Qué es mi código de bienvenida?", claves: "codigo clave numero registro as",
    r: "Al registrarte te damos un código, por ejemplo AS-7K3P-Q9XM. Si haces tu pedido desde la página en el mismo celular o computador, el mensaje lo incluye solo. Si nos escribes directo o desde otro equipo, anótalo en tu mensaje y lo verificamos." },
  { id: "no-aparece-descuento", cat: "descuento", p: "No me aparece la casilla del descuento", claves: "no aparece descuento casilla no sale descuento",
    r: "La casilla solo aparece si te registraste en ese mismo celular o computador y es tu primera compra. Si te registraste en otro equipo, o se borraron los datos del navegador, escribe tu código en el comentario del pedido o recuérdanoslo por WhatsApp." },

  { id: "envoltorio", cat: "regalos", p: "¿Envuelven para regalo?", claves: "envolver envoltorio envuelto papel regalo",
    r: "Sí. {envoltorio}\n\nArma tu regalo en [Arma tu regalo](#regalo) o marca \"Envolver para regalo\" en tu pedido." },
  { id: "que-regalar", cat: "regalos", p: "No sé qué regalar, ¿me ayudan?", claves: "que regalar idea ideas regalo cumpleanos navidad",
    r: "En [Arma tu regalo](#regalo) hay ideas para ella, para él y para niños según la temporada. Cuéntanos para quién es y te ayudamos a elegir." },

  { id: "por-mayor", cat: "mayor", p: "¿Venden por mayor?", claves: "mayor mayorista al por mayor cantidad empresa negocio revender grupo evento uniforme",
    r: "Sí. Si compras para tu negocio, un evento, un grupo o en cantidad, [escríbenos por WhatsApp](wsp:Hola Angie's Secret 👋 Quiero consultar por venta por mayor. Prendas, tallas y cantidades: ) con las prendas, tallas y cantidades, y te enviamos una cotización." },

  { id: "horario", cat: "pagina", p: "¿Dónde están y cuál es el horario?", claves: "horario direccion donde ubicacion abren cierran abierto hora",
    r: "Domingo Santa María 3831, Renca. Lunes a sábado de 11:00 a 20:00 y feriados de 11:00 a 14:00. Domingos y feriados irrenunciables, cerrado. [Cómo llegar](https://www.google.com/maps/search/?api=1&query=Domingo+Santa+Mar%C3%ADa+3831%2C+Renca%2C+Chile)" },
  { id: "seguridad", cat: "pagina", p: "¿Es seguro usar esta página?", claves: "seguro estafa fraude falso clave codigo sospechoso hackeo",
    r: "Sí. La página no cobra, no pide claves ni datos de tarjetas, y el ayudante no guarda lo que escribes.\n\nAngie's Secret nunca te pedirá por mensaje claves, códigos de verificación de WhatsApp ni datos de tarjetas. Si alguien lo hace en nuestro nombre, no respondas y [avísanos](wspc:Hola 👋 Quiero avisar de un mensaje sospechoso que usa el nombre de Angie's Secret.)." },
  { id: "datos", cat: "pagina", p: "¿Qué hacen con mis datos?", claves: "datos personales privacidad borrar mis datos informacion",
    r: "Solo pedimos datos si te registras para el descuento: los usamos para aplicarlo y, si lo aceptas, para enviarte promociones. No los vendemos ni los compartimos. La página además mide de forma anónima cómo se usa (sin tu nombre ni tu teléfono), y puedes desactivarlo. [Aviso de privacidad](privacidad.html)." },
  { id: "ayudante", cat: "pagina", p: "¿Quién responde el ayudante?", claves: "ayudante robot bot persona humano quien responde",
    r: "Es un ayudante automático. Primero usa las respuestas preparadas por la tienda y, si no entiende tu pregunta, una inteligencia artificial (Claude, de Anthropic) que solo conoce lo que la tienda publica en esta página. No es una persona y puede equivocarse: los precios, el stock y tu pedido te los confirma la tienda por WhatsApp. Las respuestas con inteligencia artificial tienen un límite diario por persona; los botones y estas preguntas frecuentes no tienen límite. Si no resuelve tu duda, te deriva por [WhatsApp al +56 9 4937 6311](wspc:Hola 👋 Vengo del ayudante de la página y necesito ayuda.) o a una [llamada](tel:+56949376311)." },
  { id: "pagina-falla", cat: "pagina", p: "La página no funciona bien, ¿qué hago?", claves: "pagina falla lenta no carga error boton fotos no se ven pantalla",
    r: "- Recarga la página.\n- Revisa tu conexión a internet.\n- Actualiza tu navegador o prueba con otro (Chrome, Safari o Firefox).\n\nSi sigue fallando, [cuéntanos qué pasó](wspc:Hola 👋 La página de Angie's Secret me falla: ) y lo revisamos." }
];
