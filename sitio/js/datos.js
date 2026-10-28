/* Angie's Secret: DATOS DEL SITIO.
   Este es el único archivo que hay que tocar para cambiar productos, horario,
   feriados o la temporada. El resto del sitio lee estos datos. */

/* =========================================================================
   DATOS DE LA TIENDA: esta es la parte que se edita para actualizar la web.
   ========================================================================= */
const TIENDA = {
  whatsapp: "56995709114",          // sin + ni espacios
  abre: "11:00", cierra: "20:00",   // lunes a sábado
  cierraFeriado: "14:00",
  temporadaForzada: null            // null = automática según el mes. O escribir "verano" / "invierno".
};

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
  { nombre: "Navidad", fecha: "2026-12-25", desde: 60, texto: "Pide desde la página y te envolvemos hasta 3 prendas sin costo.", boton: "Arma tu regalo", enlace: "#regalo" },
  { nombre: "el Día de los Enamorados", fecha: "2027-02-14", desde: 25, texto: "Conjuntos de lencería y hasta 3 prendas envueltas sin costo pidiendo desde la página.", boton: "Arma tu regalo", enlace: "#regalo" },
  { nombre: "Vuelta a clases", inicio: "2027-02-15", fin: "2027-03-15", texto: "Vuelta a clases: pantys escolares y calcetas para el colegio.", boton: "Consultar por WhatsApp", enlace: "wsp:Hola Angie's Secret 👋 Busco pantys escolares. ¿Qué colores y tallas tienen?" },
  { nombre: "el Día de la Madre", fecha: "2027-05-09", desde: 30, texto: "Pijamas, lencería y hasta 3 prendas envueltas sin costo pidiendo desde la página.", boton: "Arma tu regalo", enlace: "#regalo" },
  { nombre: "el Día del Padre", fecha: "2027-06-20", desde: 30, texto: "Pijamas, polares y hasta 3 prendas envueltas sin costo pidiendo desde la página.", boton: "Arma tu regalo", enlace: "#regalo" },
  { nombre: "Navidad", fecha: "2027-12-25", desde: 60, texto: "Pide desde la página y te envolvemos hasta 3 prendas sin costo.", boton: "Arma tu regalo", enlace: "#regalo" }
];

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
