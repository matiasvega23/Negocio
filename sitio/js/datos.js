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
  "Lila floreado": "#c9b2e6", "Azul bordado": "#2f4fb0", "Rosado floreado": "#f0b3c8", "Verde floreado": "#b9dccb",
  "Azul, gris y burdeo": "linear-gradient(180deg,#1f2a4d 0 34%,#a3a5ab 34% 66%,#7a1f33 66%)",
  "Negro, gris y grafito": "linear-gradient(180deg,#1d1d1f 0 34%,#a3a5ab 34% 66%,#45474d 66%)",
  "Negro con rojo": "linear-gradient(180deg,#1d1d1f 0 38%,#c8202f 38% 62%,#1d1d1f 62%)",
  "Negro con azul": "linear-gradient(180deg,#1d1d1f 0 38%,#2f5fd0 38% 62%,#1d1d1f 62%)"
};

const CATEGORIAS = [
  ["interior", "Lencería y ropa interior"],
  ["tops", "Poleras, blusas y vestidos"],
  ["abrigo", "Chalecos, sweaters y polerones"],
  ["pantalones", "Pantalones, calzas y pantys"],
  ["pijamas", "Pijamas"],
  ["accesorios", "Calcetas, gorros y accesorios"],
  ["ninos", "Niños"]
];

const SXXL = ["S", "M", "L", "XL", "XXL"];
// t = temporada: "verano", "invierno" o "todo" (todo el año). precio: dejar null para "consultar".
const PRODUCTOS = [
  // Lencería y ropa interior
  { id: "sostenes-con-barba", n: "Sostenes con barba", para: ["mujer"], cat: "interior", t: "todo", d: "Más firmeza y sujeción. Lisos, con encaje y en varios colores.", tallas: SXXL, col: ["Blanco", "Piel", "Negro", "Rojo", "Azul marino"], fotos: ["w-sosten-barba"], afiches: ["7f1feaf6"], k: "brasier sujetador" },
  { id: "sostenes-sin-barba", n: "Sostenes sin barba", para: ["mujer"], cat: "interior", t: "todo", d: "Livianos y cómodos para todo el día, con soporte suave.", tallas: SXXL, col: ["Piel", "Rosado", "Blanco", "Negro"], fotos: ["w-sosten-sin-barba"], afiches: ["f808306d"], k: "brasier sujetador" },
  { id: "calzones-algodon", n: "Calzones de algodón", para: ["mujer"], cat: "interior", t: "todo", d: "Algodón fresco y suave, con buena cobertura. Colores básicos y pasteles.", tallas: SXXL, col: ["Negro", "Blanco", "Piel", "Lila", "Celeste", "Verde agua"], fotos: ["w-calzon-algodon"], afiches: ["c4c82808"], k: "bombacha señora" },
  { id: "calzones-sin-costura", n: "Calzones sin costura", para: ["mujer"], cat: "interior", t: "todo", d: "No se marcan bajo la ropa. Tiro normal y tiro alto.", col: ["Negro", "Gris claro", "Damasco", "Lila", "Azul", "Burdeo", "Naranja", "Celeste", "Rosado", "Blanco", "Rojo", "Verde", "Piel"], fotos: ["w-calzon-sin-costura"], afiches: ["c88cdff8"], k: "tiro alto" },
  { id: "fajas", n: "Fajas modeladoras", para: ["mujer"], cat: "interior", t: "todo", d: "Cinturillas, shorts y bodies reductores para usar bajo la ropa.", tallas: SXXL, col: ["Negro", "Piel"], fotos: ["w-fajas"], afiches: ["d10d526d"], k: "faja reductora cinturilla body" },
  { id: "calzones-relleno", n: "Calzones y shorts con relleno", para: ["mujer"], cat: "interior", t: "todo", d: "Realzan la silueta de forma discreta bajo pantalones y vestidos.", col: ["Negro", "Blanco", "Piel", "Morado"], fotos: ["w-calzon-relleno"], k: "levanta cola gluteos" },
  { id: "conjuntos-lenceria", n: "Conjuntos de lencería", para: ["mujer"], cat: "interior", t: "todo", d: "Sostén y calzón a juego, con detalles de encaje. Pregunta por más colores.", col: ["Rojo"], fotos: ["w-conjunto"], k: "encaje regalo" },
  { id: "slip-boxer-hombre", n: "Slip y bóxer para hombre", para: ["hombre"], cat: "interior", t: "todo", d: "Slip, bóxer clásico y bóxer largo, lisos y estampados. 95% algodón y 5% lycra.", tallas: SXXL, col: ["Negro", "Blanco", "Gris", "Azul", "Celeste", "Naranja", "Verde"], fotos: ["m-ropa-interior"], afiches: ["40b9f8ba"], k: "calzoncillo boxer slip milano" },
  { id: "calzoncillos-largos", n: "Calzoncillos largos de polar", para: ["hombre"], cat: "interior", t: "invierno", d: "Primera capa térmica para los días más fríos.", tallas: SXXL, col: ["Gris claro", "Gris oscuro"], fotos: ["m-calzoncillo-largo"], afiches: ["cd40895a"], k: "termico primera capa" },
  { id: "conjunto-termico", n: "Conjunto térmico de polar", para: ["hombre"], cat: "interior", t: "invierno", d: "Polera y calzoncillo largo de polar, juntos o por separado.", tallas: SXXL, col: ["Azul marino", "Gris"], fotos: ["m-polera-polar"], afiches: ["740f1965"], k: "termico primera capa polera" },

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

  // Calcetas, gorros y accesorios
  { id: "calcetas", n: "Calcetas para toda la familia", para: ["mujer", "hombre"], cat: "accesorios", t: "todo", d: "Deportivas, de vestir, casuales, tobilleras y térmicas.", tallas: ["35 a 38", "39 a 42", "43 a 46"], tallasTexto: "Del 35 al 46", col: ["Negro", "Azul marino", "Gris", "Blanco", "Gris jaspe", "Azul"], fotos: ["u-calcetas"], afiches: ["c19fb92a"], k: "calcetines medias" },
  { id: "calcetas-chiporro", n: "Calcetas de chiporro antideslizantes", para: ["hombre"], cat: "accesorios", t: "invierno", d: "Interior de chiporro y puntos antideslizantes para andar en casa.", tallas: ["Única (39 a 46)"], col: ["Azul marino", "Verde", "Gris oscuro"], fotos: ["m-calcetas-chiporro"], afiches: ["548851a5"], k: "calcetines polar" },
  { id: "calcetas-diabeticos", n: "Calcetas para diabéticos", para: ["hombre"], cat: "accesorios", t: "todo", d: "Con cobre y bambú, y un puño que no aprieta. Pensadas para pies delicados.", tallas: ["Única"], col: ["Negro", "Azul marino", "Café"], fotos: ["m-calcetas-diabetes"], afiches: ["d2c3cf1e"], k: "calcetines diabetes" },
  { id: "gorros-lana", n: "Gorros de lana", para: ["hombre"], cat: "accesorios", t: "invierno", d: "Tejido grueso con interior térmico.", tallas: ["Única"], col: ["Negro", "Gris", "Azul marino", "Negro con rojo", "Negro con azul"], fotos: ["m-gorros"], afiches: ["f471e6ba"], k: "beanie" },
  { id: "bufanda", n: "Bufanda tejida", para: ["hombre"], cat: "accesorios", t: "invierno", d: "Tejido suave que no pica, con diseño de rombos.", tallas: ["Única"], col: ["Gris", "Azul"], fotos: ["m-bufanda"], afiches: ["e39f9571"], k: "regalo" },
  { id: "banano", n: "Banano", para: ["mujer", "hombre"], cat: "accesorios", t: "todo", d: "Impermeable, con varios bolsillos y correa ajustable de 60 a 110 cm. Mide 32 × 14 × 8 cm.", tallas: ["Única"], col: ["Negro", "Azul marino", "Gris", "Verde petróleo"], fotos: ["u-banano"], afiches: ["73365d57"], k: "canguro riñonera bolso" },

  // Niños
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
    { n: "Calcetas de algodón", k: "calceta calcetin" },
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
    { n: "Calcetas de chiporro", k: "calceta chiporro" },
    { n: "Chalecas con chiporro para hombre y mujer", k: "chaleca chaleco chiporro" },
    { n: "Polerones de corderito, peludos por dentro y por fuera", k: "poleron corderito peludo" }
  ] },
  { grupo: "Lana y lanilla", items: [
    { n: "Gorros de lana", k: "gorro" },
    { n: "Guantes de lana", k: "guante" },
    { n: "Bufandas de lana", k: "bufanda" },
    { n: "Chalecas y chombas de lana para hombre y mujer", k: "chaleca chomba chaleco sweater sueter" },
    { n: "Pantalones de lanilla para mujer", k: "pantalon lanilla" }
  ] },
  { grupo: "Calcetas", items: [
    { n: "Calcetas de cobre y bambú", k: "calceta cobre bambu" },
    { n: "Calcetas para diabéticos", k: "calceta diabetico diabetes" },
    { n: "Calcetas deportivas", k: "calceta deportiva" }
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
    { n: "Pantuflas de mujer y de hombre", k: "pantufla pantuflas chalas zapatillas casa" }
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
