/* Angie's Secret: ayudante virtual.
   Responde con reglas y textos preparados por la tienda (las preguntas frecuentes de js/datos.js y el catálogo).
   No es una inteligencia artificial conectada a internet: no inventa precios ni stock, no guarda lo que se escribe
   y nunca entrega datos personales de nadie. Si no puede resolver algo, deriva a una persona por WhatsApp o llamada.
   Usa funciones de js/app.js (buscarInteligente, abrirProducto, abrirPedido, wspUrl, wspConsultas, medir, etc.). */
(() => {
  const panel = $("#ayudante"), mensajes = $("#ayudante-mensajes"), form = $("#ayudante-form"), entrada = $("#ayudante-texto"), boton = $("#ayudante-boton");
  if (!panel) return;
  const TEL = "+" + TIENDA.whatsappConsultas;
  let iniciado = false, ultimoTema = "inicio", esperandoProducto = false;

  /* ---------- Palabras que reconoce ---------- */
  const TEMAS = [
    ["disponibilidad", "tienen tienes tiene hay disponible disponibles stock quedan queda agotado agotada venden vende busco buscando necesito existe consigo"],
    ["unidades", "unidades cantidad cantidades maximo veinte"],
    ["mayor", "mayor mayorista mayoreo revender reventa negocio empresa cotizacion cotizar"],
    ["precio", "precio precios cuesta cuestan valor valen vale caro barato"],
    ["envio", "envio envios envian despacho despachan regiones region domicilio delivery llega llegan demora tarda courier"],
    ["pago", "pago pagar pagos tarjeta transferencia debito credito efectivo cuotas"],
    ["tallas", "talla tallas medida medidas medirme copa calce"],
    ["cambios", "cambio cambios cambiar devolver devolucion garantia falla fallada defecto defectuosa retracto arrepenti arrepentirme rota"],
    ["horario", "horario horarios abren abierto abierta cierran cerrado direccion ubicacion llegar local"],
    ["descuento", "descuento bienvenida registro registrarme registre registrada codigo promocion oferta"],
    ["regalo", "regalo regalos regalar envolver envoltorio envuelto"],
    ["pedido", "pedido pedidos envie mande enviado equivoque cancelar anular responden contestan respuesta modificar whatsapp wsp wasap guasap"],
    ["pagina", "pagina web sitio carga cargando lento lenta error falla boton botones fotos imagen imagenes pantalla pegada"],
    ["humano", "persona humano alguien hablar llamar llamada telefono atender reclamo queja reclamar ejecutivo"],
    ["datos", "datos privacidad borrar informacion personal personales"],
    ["seguridad", "estafa fraude sospechoso hackeo hackear robo clave claves verificacion seguro segura confiable"]
  ].map(([id, ws]) => ({ id, f: new Set(ws.split(" ").map(fon)) }));
  // Si una frase toca varios temas, gana el de más arriba en esta lista (ej.: "¿cuánto cuesta el envío?" es envío, no precio).
  const PRIORIDAD = ["seguridad", "humano", "datos", "descuento", "pedido", "pagina", "cambios", "regalo", "envio", "pago", "horario", "mayor", "disponibilidad", "precio", "tallas", "unidades"];
  const WSP_NO_ABRE = /(whats?app|wsp|wasap|guasap)/i, NO_FUNCIONA = /no\s+(se\s+)?(me\s+)?(abre|abri|funciona|carga|sale|deja|puedo)/i;
  const SALUDO = /^(hola+|buenas?|buenos dias|buenas tardes|buenas noches|alo|hey|holi)[\s!.,]*$/i;
  const GRACIAS = /^(muchas )?gracias|^ok(ey)?[\s!.]*$|^listo[\s!.]*$|^perfecto/i;
  // Datos personales: se avisa y no se repiten en pantalla.
  const DATOS_PERSONALES = [/\b\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]\b/, /[\w.+-]+@[\w-]+\.[\w.]+/, /(\+?56)?\s?9[\s-]?\d{4}[\s-]?\d{4}\b/, /\b\d{8,}\b/, /\b(?:\d[ -]?){13,19}\b/];
  // Preguntas por datos de otras personas: nunca se responden.
  const PIDE_DATOS_AJENOS = /(datos|telefonos?|numeros?|correos?|direccion(es)?|rut|nombres?|lista)\s+de\s+(las?\s+|los?\s+)?(client|registrad|persona|usuari|compradores|duena|dueno|familia|vecin)|quien(es)?\s+(se\s+)?(registr|compr)|donde\s+vive|rut\s+de\s+la/i;

  /* ---------- Pintar mensajes ---------- */
  function decir(html, opciones = []) {
    const d = document.createElement("div");
    d.className = "ayudante-msg bot";
    d.innerHTML = html + (opciones.length ? `<div class="ayudante-opciones">${opciones.map(o => o.href
      ? `<a class="chip${o.wsp ? " chip-wsp" : ""}" href="${esc(o.href)}" ${o.externo ? 'target="_blank" rel="noopener"' : ""} data-derivar="${esc(o.canal || "")}">${esc(o.t)}</a>`
      : `<button type="button" class="chip" data-ay="${esc(o.a)}">${esc(o.t)}</button>`).join("")}</div>` : "");
    mensajes.appendChild(d);
    mensajes.scrollTop = mensajes.scrollHeight;
  }
  function yo(texto) {
    const d = document.createElement("div");
    d.className = "ayudante-msg yo";
    d.textContent = texto;
    mensajes.appendChild(d);
    mensajes.scrollTop = mensajes.scrollHeight;
  }
  const faq = id => PREGUNTAS_FRECUENTES.find(q => q.id === id);
  const respuesta = id => { const q = faq(id); return q ? formatearRespuesta(q.r) : ""; };
  const pasarAPersona = (tema, texto) => [
    { t: "WhatsApp con una persona", href: wspConsultas(texto || `Hola 👋 Vengo del ayudante de la página de Angie's Secret. Mi consulta es sobre ${tema}: `), externo: true, wsp: true, canal: "wsp_coordinacion" },
    { t: `Llamar al ${TIENDA.telefonoConsultas}`, href: `tel:${TEL}`, canal: "llamar" }
  ];
  const MENU = [
    { t: "¿Tienen lo que busco?", a: "tema:disponibilidad" }, { t: "Tallas", a: "tema:tallas" }, { t: "Envíos y costos", a: "tema:envio" },
    { t: "Problema con mi pedido", a: "tema:pedido" }, { t: "La página no funciona", a: "tema:pagina" }, { t: "Cambios y garantía", a: "tema:cambios" },
    { t: "Descuento de bienvenida", a: "tema:descuento" }, { t: "Hablar con una persona", a: "tema:humano" }
  ];
  const masAyuda = [{ t: "Otra pregunta", a: "menu" }, { t: "Hablar con una persona", a: "tema:humano" }];
  function navegador() {
    const ua = navigator.userAgent;
    const n = /Edg\//.test(ua) ? "Edge" : /SamsungBrowser/.test(ua) ? "Samsung Internet" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "otro navegador";
    const s = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iPhone" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "Mac" : "otro equipo";
    return `${n} en ${s}`;
  }

  /* ---------- Respuestas por tema ---------- */
  const RESPONDER = {
    menu() { decir("¿En qué más te ayudo?", MENU); },
    disponibilidad() {
      esperandoProducto = true;
      decir("¿Qué prenda buscas? Escríbela con tus palabras, por ejemplo: <em>pijama polar talla L</em> o <em>calzones de algodón</em>.");
    },
    unidades() { decir(respuesta("cantidad"), [{ t: "Consultar por mayor", href: wspUrl("Hola Angie's Secret 👋 Quiero consultar por venta por mayor. Prendas, tallas y cantidades: "), externo: true, wsp: true, canal: "wsp_tienda" }, { t: "Ver mi pedido", a: "pedido" }, ...masAyuda]); },
    mayor() { decir(respuesta("por-mayor"), [{ t: "Consultar por mayor", href: wspUrl("Hola Angie's Secret 👋 Quiero consultar por venta por mayor. Prendas, tallas y cantidades: "), externo: true, wsp: true, canal: "wsp_tienda" }, ...masAyuda]); },
    precio() { decir(respuesta("precios"), [{ t: "Consultar un precio", href: wspUrl("Hola Angie's Secret 👋 Quería consultar el precio de: "), externo: true, wsp: true, canal: "wsp_tienda" }, ...masAyuda]); },
    envio() { decir(respuesta("envios") + respuesta("plazos"), [{ t: "Consultar costo de envío", href: wspUrl("Hola Angie's Secret 👋 ¿Cuánto cuesta el envío a la comuna de "), externo: true, wsp: true, canal: "wsp_tienda" }, { t: "Retiro en tienda", a: "faq:retiro" }, ...masAyuda]); },
    pago() { decir(respuesta("pagar"), masAyuda); },
    tallas() { decir(respuesta("mi-talla"), [{ t: "Abrir la guía de tallas", a: "tallas" }, { t: "Talla de sostén", a: "faq:talla-sosten" }, { t: "¿Tienen tallas grandes?", a: "faq:tallas-grandes" }, ...masAyuda]); },
    cambios(texto) {
      if (/talla|chic|grande|quedo|color|gusto/.test(norm(texto || ""))) { decir(respuesta("cambios") + respuesta("retracto"), [{ t: "Consultar un cambio", href: wspUrl("Hola Angie's Secret 👋 Quiero consultar por un cambio de talla o color de una prenda que compré: "), externo: true, wsp: true, canal: "wsp_tienda" }, ...masAyuda]); return; }
      decir(respuesta("garantia") + respuesta("retracto"), [{ t: "Cambio por talla o color", a: "faq:cambios" },
        { t: "Tengo una prenda con falla", href: wspConsultas("Hola 👋 Compré en Angie's Secret una prenda con falla y quiero usar la garantía. Les envío una foto y mi boleta."), externo: true, wsp: true, canal: "wsp_coordinacion" }, ...masAyuda]);
    },
    horario() {
      const estadoAhora = `${$("#letrero-estado").textContent}: ${$("#letrero-detalle").textContent}.`;
      decir(`<p><strong>${esc(estadoAhora)}</strong></p>${respuesta("horario")}`, masAyuda);
    },
    descuento() {
      if (registro && registroVigente()) {
        decir(`<p>En este equipo estás registrada o registrado como <strong>${esc(registro.nombre)}</strong>${registro.codigo ? `, con el código <strong>${esc(registro.codigo)}</strong>` : ""}. Tu descuento vence el ${esc(fechaLarga(unMesDespues(registro.fecha)))}.</p><p>Cuando envíes tu primer pedido desde esta página, el mensaje lo pedirá solo.</p>`, [{ t: "Ver mi pedido", a: "pedido" }, { t: "Ver las bases", href: "privacidad.html#bases" }, ...masAyuda]);
      } else if (registro && registro.usado) {
        decir(`<p>En este equipo, el descuento de bienvenida ya se pidió en el pedido del ${esc(fechaCorta(registro.usado))}. Es una vez por persona.</p><p>Si no alcanzaste a enviar ese pedido, escríbenos y lo revisamos.</p>`, pasarAPersona("mi descuento de bienvenida"));
      } else {
        decir(respuesta("descuento") + respuesta("no-aparece-descuento"), [{ t: "Registrarme", a: "ir:#registro" }, ...masAyuda]);
      }
    },
    regalo() { decir(respuesta("envoltorio") + respuesta("que-regalar"), [{ t: "Arma tu regalo", a: "ir:#regalo" }, ...masAyuda]); },
    pedido() {
      decir("¿Qué pasó con tu pedido?", [{ t: "WhatsApp no se abre", a: "sub:wsp" }, { t: "Me equivoqué en el pedido", a: "sub:equivoque" }, { t: "Lo envié y no me responden", a: "sub:respuesta" }, { t: "Mi envío no llega", a: "sub:llegada" }, { t: "Quiero cancelarlo", a: "sub:cancelar" }, { t: "Cuántas unidades puedo pedir", a: "tema:unidades" }, { t: "Hablar con una persona", a: "tema:humano" }]);
    },
    pagina() {
      decir(respuesta("pagina-falla"), [{ t: "Reportar el problema", href: wspConsultas(`Hola 👋 La página de Angie's Secret me falla (uso ${navegador()}). Lo que pasa es: `), externo: true, wsp: true, canal: "wsp_coordinacion" }, { t: "Llamar", href: `tel:${TEL}`, canal: "llamar" }, { t: "Otra pregunta", a: "menu" }]);
    },
    humano(tema) {
      decir(`<p>Te paso con una persona del equipo de Angie's Secret: escribe por WhatsApp o llama al <strong>${esc(TIENDA.telefonoConsultas)}</strong>, de lunes a sábado de 11:00 a 20:00.</p><p class="letra-chica">Para hacer un pedido o consultar stock, el WhatsApp de la tienda es el +56 9 9570 9114.</p>`, pasarAPersona(tema || "una consulta"));
    },
    datos() { decir(respuesta("datos") + `<p>Para ver, corregir o borrar tus datos, escríbenos.</p>`, [{ t: "Aviso de privacidad", href: "privacidad.html" }, ...pasarAPersona("mis datos personales")]); },
    seguridad() { decir(respuesta("seguridad"), [{ t: "Avisar de algo sospechoso", href: wspConsultas("Hola 👋 Quiero avisar de algo sospechoso que usa el nombre de Angie's Secret: "), externo: true, wsp: true, canal: "wsp_coordinacion" }, { t: "Otra pregunta", a: "menu" }]); }
  };
  const SUB = {
    wsp() {
      const hay = pedido.length || (ultimoPedido && ultimoPedido.mensaje);
      decir(respuesta("whatsapp-no-abre"), [...(hay ? [{ t: "Copiar mi pedido", a: "copiar" }] : []), { t: "Llamar", href: `tel:${TEL}`, canal: "llamar" }, ...masAyuda]);
    },
    equivoque() { decir(respuesta("cambiar-pedido"), [{ t: "Ver mi pedido", a: "pedido" }, ...(ultimoPedido ? [{ t: "Recuperar mi pedido", a: "recuperar" }] : []), ...masAyuda]); },
    respuesta() {
      decir(`<p>Respondemos en el horario de la tienda: lunes a sábado de 11:00 a 20:00 (feriados hasta las 14:00). Ahora: <strong>${esc($("#letrero-estado").textContent.toLowerCase())}</strong>, ${esc($("#letrero-detalle").textContent.toLowerCase())}.</p><p>Si ya pasó más de un día o es urgente, habla con una persona:</p>`, pasarAPersona("un pedido que envié", "Hola 👋 Envié un pedido por WhatsApp a Angie's Secret y aún no me responden. Lo envié el día: "));
    },
    llegada() {
      decir(`<p>El plazo depende de la empresa de envío y del destino. Escríbenos con tu nombre y la comuna de destino, y revisamos dónde va tu pedido.</p>`, [
        { t: "Preguntar por mi envío", href: wspUrl("Hola Angie's Secret 👋 Quiero saber dónde va mi envío. Mi nombre es "), externo: true, wsp: true, canal: "wsp_tienda" }, ...pasarAPersona("un envío que no llega")]);
    },
    cancelar() { decir("<p>Escríbenos en la misma conversación de WhatsApp donde enviaste el pedido y lo cancelamos. Como el pago se coordina después, si todavía no pagaste no hay ningún cobro.</p>", masAyuda); }
  };

  /* ---------- Entender lo que escribe la persona ---------- */
  function puntajeTemas(palabras) {
    const fs = palabras.map(fon);
    return TEMAS.map(t => ({ id: t.id, n: fs.filter(f => t.f.has(f) || (f.length >= 7 && [...t.f].some(x => Math.abs(x.length - f.length) <= 1 && distancia(f, x) <= 1))).length }))
      .filter(x => x.n).sort((a, b) => b.n - a.n || PRIORIDAD.indexOf(a.id) - PRIORIDAD.indexOf(b.id));
  }
  function mejorPregunta(palabras) {
    const fs = new Set(palabras.map(fon));
    let mejor = null, max = 0;
    for (const q of PREGUNTAS_FRECUENTES) {
      const ws = new Set(norm(q.p + " " + (q.claves || "")).split(/[^a-z]+/).filter(w => w.length > 2 && !PARADAS.has(w)).map(fon));
      const n = [...fs].filter(f => ws.has(f)).length;
      if (n > max) { max = n; mejor = q; }
    }
    return max >= 2 ? mejor : null;
  }
  function mostrarProductos(original) {
    // Lo que se busca, sin el "¿tienen…?" del comienzo.
    const ws = original.replace(/[¿?¡!]/g, " ").trim().split(/\s+/);
    while (ws.length > 1 && PARADAS.has(norm(ws[0]))) ws.shift();
    const texto = ws.join(" ");
    const r = buscarInteligente(texto);
    const clave = norm(texto).split(/[^a-z]+/).filter(w => w.length > 1 && !PARADAS.has(w)).join(" ");
    if (clave) medir("buscar", { q: clave, res: r.lista.length, lugar: "ayudante" });
    if (!r.lista.length) {
      decir(`<p>No veo «${esc(texto)}» en el catálogo de la página, pero en la tienda hay mucho más y, si no lo tenemos, lo traemos a pedido.</p>`, [
        { t: "Pedir que lo busquen", href: wspUrl(`Hola Angie's Secret 👋 Estoy buscando: ${texto}`), externo: true, wsp: true, canal: "wsp_tienda" }, ...masAyuda]);
      return;
    }
    const entendido = r.entendido.length ? ` <span class="letra-chica">(entendí: ${esc(r.entendido.join(", "))})</span>` : "";
    const lista = r.lista.slice(0, 4).map(p => `<li><button type="button" data-ay="abrir:${p.id}"><img src="${foto(p.fotos[0])}" alt="" width="44" height="55" loading="lazy"><span>${esc(p.n)}<small>${esc(textoTallas(p))}</small></span></button></li>`).join("");
    decir(`<p>Esto encontré en el catálogo${entendido}:</p><ul class="ayudante-productos">${lista}</ul><p>El catálogo no muestra el stock en tiempo real: la disponibilidad de tallas y colores te la confirmamos por WhatsApp.</p>`, [
      { t: "Preguntar si hay", href: wspUrl(`Hola Angie's Secret 👋 ¿Tienen disponible: ${texto}?`), externo: true, wsp: true, canal: "wsp_tienda" },
      ...(r.lista.length > 4 ? [{ t: `Ver los ${r.lista.length} en el catálogo`, a: "catalogo:" + texto }] : []), { t: "Otra pregunta", a: "menu" }]);
  }
  function tema(id, texto) {
    ultimoTema = id; esperandoProducto = false;
    medir("ayudante_tema", { tema: id });
    (RESPONDER[id] || RESPONDER.menu)(texto);
  }
  function responder(texto) {
    const t = texto.trim();
    if (!t) return;
    if (revisarTexto(t, "ayudante")) { yo("[mensaje bloqueado]"); decir("No puedo procesar ese texto. Si necesitas ayuda, elige una opción:", MENU); return; }
    if (DATOS_PERSONALES.some(r => r.test(t))) {
      yo("[mensaje oculto: tenía datos personales]");
      medir("ayudante_tema", { tema: "datos_personales" });
      decir("<p>Por tu seguridad, no escribas aquí teléfonos, correos, RUT ni números de tarjeta: el ayudante no los necesita y no los guarda. Si quieres que te contactemos, escríbenos directo por WhatsApp.</p>", pasarAPersona("una consulta"));
      return;
    }
    yo(t);
    if (PIDE_DATOS_AJENOS.test(norm(t))) {
      medir("ayudante_tema", { tema: "datos_ajenos" });
      decir("<p>No entregamos información personal de nadie: ni de clientas o clientes, ni de quienes se registran, ni de las personas de la tienda.</p>", masAyuda);
      return;
    }
    if (SALUDO.test(norm(t))) { decir("¡Hola! 👋 ¿En qué te ayudo?", MENU); return; }
    if (GRACIAS.test(norm(t))) { decir("¡De nada! Aquí estoy si necesitas algo más. 😊", [{ t: "Otra pregunta", a: "menu" }]); return; }
    const todas = norm(t).split(/[^a-z]+/).filter(w => w.length > 1);
    const palabras = todas.filter(w => !PARADAS.has(w));
    const temas = puntajeTemas(todas);
    // Para elegir el tema, gana el de más palabras; en empate, el de mayor prioridad.
    temas.sort((a, b) => b.n - a.n || PRIORIDAD.indexOf(a.id) - PRIORIDAD.indexOf(b.id));
    const principal = temas[0] ? temas[0].id : null;
    if (WSP_NO_ABRE.test(norm(t)) && NO_FUNCIONA.test(norm(t))) { ultimoTema = "pedido"; medir("ayudante_tema", { tema: "pedido_wsp" }); SUB.wsp(); return; }
    const r = buscarInteligente(t);
    const nombraPrenda = r.entendido.length > 0 && r.lista.length > 0;
    // "¿Cómo sé mi talla de sostén?": es una pregunta de tallas, no de stock.
    if (principal === "tallas" && !temas.some(x => x.id === "disponibilidad")) {
      if (r.entendido.some(e => /sosten/.test(norm(e)))) { medir("ayudante_tema", { tema: "faq_talla-sosten" }); decir(respuesta("talla-sosten"), [{ t: "Abrir la guía de tallas", a: "tallas" }, ...masAyuda]); return; }
      tema("tallas"); return;
    }
    // ¿Pregunta por un producto? ("¿tienen fajas talla XL?", "pijama polar", "¿venden zapatos?")
    const preguntaProducto = !principal || ["disponibilidad", "precio", "unidades"].includes(principal);
    if (esperandoProducto || (preguntaProducto && (nombraPrenda || (principal === "disponibilidad" && palabras.length)))) {
      esperandoProducto = false;
      medir("ayudante_tema", { tema: "producto" });
      mostrarProductos(t);
      if (principal === "precio") decir(respuesta("precios"));
      // Más de 20 unidades de algo: se ofrece la venta por mayor.
      const cantidad = Math.max(0, ...(t.match(/\b\d{2,4}\b/g) || []).map(Number));
      if (cantidad > MAX_CANT) decir(respuesta("por-mayor"), [{ t: "Consultar por mayor", href: wspUrl(`Hola Angie's Secret 👋 Quiero consultar por venta por mayor: ${t}`), externo: true, wsp: true, canal: "wsp_tienda" }]);
      return;
    }
    if (principal) { tema(principal, t); return; }
    const q = mejorPregunta(palabras);
    if (q) { medir("ayudante_tema", { tema: "faq_" + q.id }); decir(`<p><strong>${esc(q.p)}</strong></p>${formatearRespuesta(q.r)}`, masAyuda); return; }
    if (r.lista.length) { mostrarProductos(t); return; }
    medir("ayudante_tema", { tema: "no_entendido" });
    decir("<p>No estoy seguro de haber entendido. Puedo ayudarte con temas de Angie's Secret: productos, tallas, envíos, pedidos, regalos, cambios y la página. Elige una opción o habla con una persona:</p>", [...MENU.slice(0, 6), ...pasarAPersona("una consulta")]);
  }

  /* ---------- Abrir, cerrar y botones ---------- */
  function abrir() {
    panel.hidden = false; boton.setAttribute("aria-expanded", "true"); document.body.classList.add("ayudante-abierto");
    if (!iniciado) {
      iniciado = true;
      decir("<p>Hola 👋 Soy el ayudante de Angie's Secret. Te ayudo con productos, tallas, envíos, tu pedido o la página.</p><p class=\"letra-chica\">Soy automático: si no puedo resolverlo, te paso con una persona.</p>", MENU);
      medir("ayudante_abrir");
    }
    setTimeout(() => entrada.focus(), 50);
  }
  function cerrar() { panel.hidden = true; boton.setAttribute("aria-expanded", "false"); document.body.classList.remove("ayudante-abierto"); boton.focus(); }
  document.addEventListener("click", e => { if (e.target.closest("[data-abrir-ayudante]")) { e.preventDefault(); panel.hidden ? abrir() : cerrar(); } });
  $("#ayudante-cerrar").addEventListener("click", cerrar);
  panel.addEventListener("keydown", e => { if (e.key === "Escape") cerrar(); });
  form.addEventListener("submit", e => { e.preventDefault(); const t = entrada.value; entrada.value = ""; responder(t.slice(0, 200)); });
  mensajes.addEventListener("click", e => {
    const d = e.target.closest("[data-derivar]");
    if (d && d.dataset.derivar) medir("ayudante_derivar", { canal: d.dataset.derivar, tema: ultimoTema });
    const b = e.target.closest("[data-ay]"); if (!b) return;
    const [accion, ...resto] = b.dataset.ay.split(":"), valor = resto.join(":");
    if (accion !== "abrir" && accion !== "catalogo") yo(b.textContent);
    if (accion === "menu") RESPONDER.menu();
    else if (accion === "tema") tema(valor);
    else if (accion === "sub") { medir("ayudante_tema", { tema: "pedido_" + valor }); SUB[valor](); }
    else if (accion === "faq") { const q = faq(valor); if (q) { medir("ayudante_tema", { tema: "faq_" + q.id }); decir(formatearRespuesta(q.r), masAyuda); } }
    else if (accion === "abrir") abrirProducto(valor);
    else if (accion === "catalogo") { cerrar(); irAlCatalogo(buscarInteligente(valor)); }
    else if (accion === "ir") { cerrar(); location.hash = valor.slice(1); }
    else if (accion === "tallas") abrirGuiaTallas("");
    else if (accion === "pedido") { cerrar(); abrirPedido(); }
    else if (accion === "recuperar") { cerrar(); abrirPedido(); const r = $("#pedido [data-recuperar]"); if (r) r.click(); }
    else if (accion === "copiar") { copiarTexto(pedido.length ? mensajePedido() : ultimoPedido.mensaje); medir("ayudante_derivar", { canal: "copiar", tema: ultimoTema }); }
  });
})();
