/* Angie's Secret: ayudante virtual.
   Primero responde con reglas y textos preparados por la tienda (las preguntas frecuentes de js/datos.js y el
   catálogo): es instantáneo y gratis. Si no entiende la pregunta, o si la persona ya está conversando con la IA,
   le pregunta a la inteligencia artificial del servidor (/api/ayudante, Claude Haiku), que tiene reglas estrictas:
   no inventa precios ni stock y nunca entrega datos personales. Si la IA no está disponible (tope de gasto, error,
   sin conexión), vuelve a las reglas: nunca deja a nadie sin respuesta. No se guarda lo que se escribe.
   Si no puede resolver algo, deriva a una persona por WhatsApp o llamada.
   Usa funciones de js/app.js (buscarInteligente, abrirProducto, abrirPedido, wspUrl, wspConsultas, medir, etc.). */
(() => {
  const panel = $("#ayudante"), mensajes = $("#ayudante-mensajes"), form = $("#ayudante-form"), entrada = $("#ayudante-texto"), boton = $("#ayudante-boton");
  if (!panel) return;
  const TEL = "+" + TIENDA.whatsappConsultas;
  let iniciado = false, ultimoTema = "inicio", esperandoProducto = false;
  // Conversación con la IA: solo en memoria (se pierde al recargar la página) y solo los últimos 6 mensajes.
  let modoIA = false, avisoIAMostrado = false;
  const charla = [];
  // Límite de respuestas con IA por persona y por día (el servidor manda el valor real y lo hace cumplir).
  let limiteIA = 5;
  const leerCupo = () => { try { const c = JSON.parse(localStorage.getItem("angie-ia") || "null"); return c && c.fecha === ahora().fecha ? c : null; } catch (e) { return null; } };
  const guardarCupo = (quedan, limite) => { try { localStorage.setItem("angie-ia", JSON.stringify({ fecha: ahora().fecha, quedan, limite })); } catch (e) {} };
  const iaAgotada = () => { const c = leerCupo(); return !!c && c.quedan <= 0; };

  /* ---------- Palabras que reconoce ---------- */
  const TEMAS = [
    ["disponibilidad", "tienen tienes tiene hay disponible disponibles stock quedan queda agotado agotada venden vende busco buscando necesito existe consigo"],
    ["unidades", "unidades cantidad cantidades maximo veinte"],
    ["mayor", "mayor mayorista mayoreo revender reventa negocio empresa cotizacion cotizar"],
    ["materiales", "material materiales tela telas genero tejido"],
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
  const PRIORIDAD = ["seguridad", "humano", "datos", "descuento", "pedido", "pagina", "cambios", "regalo", "envio", "pago", "horario", "mayor", "materiales", "disponibilidad", "precio", "tallas", "unidades"];
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
    materiales(texto) {
      // "¿De qué material son las calzas?": las prendas de la tienda que coinciden. Si no nombra prenda: la lista completa.
      const its = enTienda(texto || "").slice(0, 8);
      if (its.length && its.length < 12) { decir(`<p>En la tienda tenemos ${esc(listaTienda(its))}.</p><p>Las tallas, los colores y el precio te los confirmamos por WhatsApp.</p>`, [{ t: "Preguntar por WhatsApp", href: wspUrl(`Hola Angie's Secret 👋 Quería consultar por: ${texto}`), externo: true, wsp: true, canal: "wsp_tienda" }, { t: "Ver todos los materiales", a: "faq:materiales" }, ...masAyuda]); return; }
      decir(respuesta("materiales"), masAyuda);
    },
    tallas() { decir(respuesta("mi-talla"), [{ t: "Abrir la guía de tallas", a: "tallas" }, { t: "Talla de sostén", a: "faq:talla-sosten" }, { t: "¿Tienen tallas grandes?", a: "faq:tallas-grandes" }, ...masAyuda]); },
    cambios(texto) {
      if (/talla|chic|grande|qued[aoe]|color|gusto|apret|suelt|ancho|angost/.test(norm(texto || ""))) { decir(respuesta("cambios") + respuesta("retracto"), [{ t: "Consultar un cambio", href: wspUrl("Hola Angie's Secret 👋 Quiero consultar por un cambio de talla o color de una prenda que compré: "), externo: true, wsp: true, canal: "wsp_tienda" }, ...masAyuda]); return; }
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
    const tienda = enTienda(texto).slice(0, 6);
    // Si el catálogo solo coincidió por una palabra suelta (color, material) y la tienda tiene la prenda, se muestra la tienda.
    if (tienda.length && (!r.lista.length || !(r.prenda || r.publico))) {
      decir(`<p>«${esc(texto)}» todavía no está en el catálogo de la página, pero <strong>en la tienda sí tenemos ${esc(listaTienda(tienda))}</strong>.</p><p>Te confirmamos tallas, colores y precio por WhatsApp.</p>`, [
        { t: "Preguntar si hay", href: wspUrl(`Hola Angie's Secret 👋 ¿Tienen disponible: ${texto}?`), externo: true, wsp: true, canal: "wsp_tienda" }, ...masAyuda]);
      return;
    }
    if (!r.lista.length) {
      decir(`<p>No veo «${esc(texto)}» en el catálogo de la página, pero en la tienda hay mucho más y, si no lo tenemos, lo traemos a pedido.</p>`, [
        { t: "Pedir que lo busquen", href: wspUrl(`Hola Angie's Secret 👋 Estoy buscando: ${texto}`), externo: true, wsp: true, canal: "wsp_tienda" }, ...masAyuda]);
      return;
    }
    const entendido = r.entendido.length ? ` <span class="letra-chica">(entendí: ${esc(r.entendido.join(", "))})</span>` : "";
    const lista = r.lista.slice(0, 4).map(p => `<li><button type="button" data-ay="abrir:${p.id}"><img src="${foto(p.fotos[0])}" alt="" width="44" height="55" loading="lazy"><span>${esc(p.n)}<small>${esc(textoTallas(p))}</small></span></button></li>`).join("");
    const tambien = tienda.length && tienda.length <= 4 ? `<p>En la tienda también hay ${esc(listaTienda(tienda))}.</p>` : "";
    decir(`<p>Esto encontré en el catálogo${entendido}:</p><ul class="ayudante-productos">${lista}</ul>${tambien}<p>El catálogo no muestra el stock en tiempo real: la disponibilidad de tallas y colores te la confirmamos por WhatsApp.</p>`, [
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
    // Si la IA no está disponible, se responde con las reglas: el tema detectado, las prendas nombradas o el menú.
    const conReglas = () => principal ? tema(principal, t) : r.lista.length && (r.prenda || r.publico) ? mostrarProductos(t) : noEntendido();
    // Si ya está conversando con la IA, sigue con ella (entiende el contexto), salvo temas que las reglas resuelven mejor.
    if (modoIA && !esperandoProducto && !["humano", "datos", "seguridad", "descuento"].includes(principal)) { preguntarIA(t, conReglas); return; }
    // Una pregunta larga, escrita como conversación y sin nombrar una prenda concreta ("algo para mi mamá, le gusta
    // dormir cómoda"), la responde mejor la IA, salvo temas en que las respuestas oficiales son mejores.
    const conversacional = (palabras.length >= 6 && !r.prenda) || palabras.length >= 9 || (principal === "regalo" && palabras.length >= 5);
    if (conversacional && !esperandoProducto && (!principal || ["regalo", "disponibilidad", "precio", "tallas", "unidades", "mayor", "envio", "horario", "pago"].includes(principal))) { preguntarIA(t, conReglas); return; }
    // Solo se muestran prendas si se nombró una prenda o para quién es (no por coincidencias de palabras sueltas),
    // o si coincide con algo que hay en la tienda (PRODUCTOS_TIENDA): así responden las reglas, sin gastar en IA.
    const hayEnTienda = enTienda(t).length > 0;
    const nombraPrenda = ((r.lista.length > 0 && (r.prenda || !!r.publico)) || hayEnTienda) && !conversacional;
    // "¿Cómo sé mi talla de sostén?": es una pregunta de tallas, no de stock.
    if (principal === "tallas" && !temas.some(x => x.id === "disponibilidad")) {
      // "fajas talla XL" busca la prenda; "¿cómo sé mi talla?" abre la guía.
      if (r.prenda && r.lista.length && !/\b(como|cual|que|medir|medirme|saber)\b/.test(norm(t))) { medir("ayudante_tema", { tema: "producto" }); mostrarProductos(t); return; }
      if (r.entendido.some(e => /sosten/.test(norm(e)))) { medir("ayudante_tema", { tema: "faq_talla-sosten" }); decir(respuesta("talla-sosten"), [{ t: "Abrir la guía de tallas", a: "tallas" }, ...masAyuda]); return; }
      tema("tallas"); return;
    }
    // ¿Pregunta por un producto? ("¿tienen fajas talla XL?", "pijama polar", "¿venden zapatos?")
    const preguntaProducto = !principal || ["disponibilidad", "precio", "unidades"].includes(principal);
    if (esperandoProducto || (preguntaProducto && (nombraPrenda || (principal === "disponibilidad" && palabras.length && !conversacional)))) {
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
    if (((r.lista.length && (r.prenda || r.publico)) || hayEnTienda) && !conversacional) { mostrarProductos(t); return; }
    // Las reglas no entendieron: le pregunta a la IA (si no está disponible, vuelve a las reglas).
    preguntarIA(t);
  }

  /* ---------- Inteligencia artificial ---------- */
  function noEntendido(rapido) {
    medir("ayudante_tema", { tema: "no_entendido" });
    decir(rapido
      ? "<p>Recibí muchas preguntas seguidas. Espera un minuto y vuelve a escribir, o elige una opción:</p>"
      : "<p>No estoy seguro de haber entendido. Puedo ayudarte con temas de Angie's Secret: productos, tallas, envíos, pedidos, regalos, cambios y la página. Elige una opción o habla con una persona:</p>", [...MENU.slice(0, 6), ...pasarAPersona("una consulta")]);
  }
  const parrafos = t => String(t).split(/\n{2,}/).map(p => `<p>${esc(p.trim()).replace(/\n/g, "<br>")}</p>`).join("");
  function botonesIA(acciones, pregunta) {
    const b = [];
    for (const a of acciones || []) {
      const [tipo, ...resto] = a.split(":"), valor = resto.join(":");
      if (tipo === "persona") b.push(...pasarAPersona("una consulta del ayudante", `Hola 👋 Vengo del ayudante de la página de Angie's Secret. Mi consulta es: ${pregunta}`));
      else if (tipo === "tienda") b.push({ t: "Escribir a la tienda", href: wspUrl(`Hola Angie's Secret 👋 Vengo de la página. Quería consultar: ${pregunta}`), externo: true, wsp: true, canal: "wsp_tienda" });
      else if (tipo === "tallas") b.push({ t: "Guía de tallas", a: "tallas" });
      else if (tipo === "registro") b.push({ t: "Registrarme", a: "ir:#registro" });
      else if (tipo === "regalo") b.push({ t: "Arma tu regalo", a: "ir:#regalo" });
      else if (tipo === "pedido") b.push({ t: "Ver mi pedido", a: "pedido" });
      else if (tipo === "producto") { const p = PRODUCTOS.find(x => x.id === valor); if (p) b.push({ t: `Ver ${p.n}`, a: `abrir:${p.id}` }); }
      else if (tipo === "catalogo" && valor) b.push({ t: `Ver «${valor}» en el catálogo`, a: `catalogo:${valor}` });
      else if (tipo === "faq") { const q = faq(valor); if (q) b.push({ t: q.p, a: `faq:${q.id}` }); }
    }
    b.push({ t: "Otra pregunta", a: "menu" });
    if (!(acciones || []).includes("persona")) b.push({ t: "Hablar con una persona", a: "tema:humano" });
    return b;
  }
  function visitante() { try { return localStorage.getItem("angie-v") || ""; } catch (e) { return ""; } }
  function avisoAgotado() {
    medir("ayudante_tema", { tema: "ia_agotada" });
    decir(`<p>Ya usaste las respuestas con inteligencia artificial de hoy. Para seguir conversando, escríbenos por WhatsApp o llámanos al <strong>${esc(TIENDA.telefonoConsultas)}</strong> y te ayudamos con gusto.</p><p class="letra-chica">Los botones del ayudante y las preguntas frecuentes no tienen límite.</p>`, [...pasarAPersona("una consulta del ayudante"), { t: "Ver opciones", a: "menu" }]);
  }
  async function preguntarIA(texto, siFalla) {
    // Si ya usó sus respuestas con IA de hoy: responden las reglas o se pasa a una persona, sin gastar.
    if (iaAgotada()) { modoIA = false; if (siFalla) siFalla(); else avisoAgotado(); return; }
    charla.push({ r: "u", t: texto });
    while (charla.length > 6) charla.shift();
    const escribiendo = document.createElement("div");
    escribiendo.className = "ayudante-msg bot escribiendo";
    escribiendo.innerHTML = '<span class="oculto">Escribiendo</span><span aria-hidden="true">●</span><span aria-hidden="true">●</span><span aria-hidden="true">●</span>';
    mensajes.appendChild(escribiendo); mensajes.scrollTop = mensajes.scrollHeight;
    entrada.disabled = true;
    let d = null;
    try {
      const control = new AbortController();
      const reloj = setTimeout(() => control.abort(), 18000);
      const r = await fetch("/api/ayudante", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mensajes: charla, v: visitante() }), signal: control.signal });
      clearTimeout(reloj);
      d = r.ok ? await r.json() : r.status === 429 ? { ia: false, motivo: "rapido" } : null;
    } catch (e) { d = null; }
    escribiendo.remove();
    entrada.disabled = false; entrada.focus();
    if (d && d.ia && d.respuesta) {
      charla.push({ r: "a", t: d.respuesta });
      modoIA = true; ultimoTema = "ia_" + (d.tema || "otro");
      medir("ayudante_tema", { tema: "ia_" + (d.tema || "otro") });
      if (typeof d.limite === "number") limiteIA = d.limite;
      const quedan = typeof d.quedan === "number" ? d.quedan : null;
      if (quedan !== null) guardarCupo(quedan, limiteIA);
      let acciones = d.acciones || [], aviso;
      if (quedan === 0) {
        aviso = `<p class="nota-ia aviso-limite"><strong>Esta fue mi última respuesta con inteligencia artificial de hoy.</strong> Para seguir, conversa directamente con nosotros por WhatsApp o llamada al ${esc(TIENDA.telefonoConsultas)}.</p>`;
        acciones = ["persona", ...acciones.filter(a => a !== "persona")];
        modoIA = false;
      } else if (quedan === 1) {
        aviso = `<p class="nota-ia aviso-limite">Me queda <strong>1 respuesta</strong> con inteligencia artificial para ti hoy. Si tu consulta sigue, mejor conversa directamente con nosotros:</p>`;
        acciones = ["persona", ...acciones.filter(a => a !== "persona")];
      } else {
        const resto = quedan !== null ? ` Te quedan ${quedan} respuestas con IA hoy.` : "";
        aviso = avisoIAMostrado ? `<p class="nota-ia">Respuesta con IA.${resto}</p>`
          : `<p class="nota-ia">Respuesta automática con inteligencia artificial: puede equivocarse. Precios, stock y pedidos te los confirma la tienda por WhatsApp.${resto}</p>`;
      }
      avisoIAMostrado = true;
      decir(parrafos(d.respuesta) + aviso, botonesIA(acciones, texto));
      return;
    }
    // Sin IA (límite, tope de gasto, error o sin conexión): responden las reglas o una persona, nunca el silencio.
    charla.pop(); modoIA = false;
    if (d && d.motivo) medir("ayudante_tema", { tema: "ia_no_" + d.motivo });
    if (d && d.motivo === "limite_visitante") { guardarCupo(0, limiteIA); if (siFalla) siFalla(); else avisoAgotado(); return; }
    if (siFalla && !(d && d.motivo === "rapido")) siFalla(); else noEntendido(d && d.motivo === "rapido");
  }

  /* ---------- Abrir, cerrar y botones ---------- */
  function abrir() {
    panel.hidden = false; boton.setAttribute("aria-expanded", "true"); document.body.classList.add("ayudante-abierto");
    if (!iniciado) {
      iniciado = true;
      const cupo = leerCupo();
      const limite = cupo && cupo.limite ? cupo.limite : limiteIA;
      const nota = iaAgotada()
        ? `Hoy ya usaste tus respuestas con inteligencia artificial: puedes usar los botones, que no tienen límite, o conversar con nosotros.`
        : `Soy automático y para las preguntas escritas uso inteligencia artificial, con un límite de <strong>${limite} respuestas al día</strong> por persona (los botones no tienen límite). Si necesitas más, te paso con una persona.`;
      decir(`<p>Hola 👋 Soy el ayudante de Angie's Secret. Te ayudo con productos, materiales, tallas, envíos, tu pedido o la página. Escríbeme como quieras o elige una opción.</p><p class="letra-chica">${nota}</p>`, MENU);
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
    if (accion === "menu" || accion === "tema" || accion === "sub") modoIA = false;
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
