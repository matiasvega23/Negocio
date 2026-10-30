# Angie's Secret · sitio web

Catálogo de Angie's Secret, tienda de lencería y ropa en Domingo Santa María 3831, Renca, con pedidos por WhatsApp.

Sitio publicado: https://angiessecret.netlify.app

## Cómo se publica

Hay dos ramas, y cada una tiene su propia dirección:

| Rama | Dirección | Para qué | Créditos de Netlify |
|---|---|---|---|
| `prueba` | https://prueba--angiessecret.netlify.app | Revisar el lote antes de publicarlo, en el celular o el computador | 0 |
| `main` | https://angiessecret.netlify.app | El sitio que ven las clientas | 15 por publicación |

Cada lote sigue estos pasos:

1. Los cambios del lote se suben a `prueba`. Se pueden hacer todos los ajustes que hagan falta: no gastan créditos.
2. La dueña y quien coordina revisan la dirección de prueba (textos, fotos, pedido por WhatsApp, regla de marca).
3. Con el visto bueno, `prueba` se pasa a `main` una sola vez y el sitio real se actualiza en uno o dos minutos.

El plan gratis de Netlify da 300 créditos por período, del día 26 de un mes al 25 del siguiente. Por eso se publica por lotes: **máximo 2 veces al mes** (primera semana y mitad de mes), salvo correcciones urgentes.

La dirección de prueba es pública pero no se difunde. Le indica a Google que la página oficial es la del sitio real.

## Estructura

| Ruta | Qué es |
|---|---|
| `sitio/index.html` | Estructura de la página |
| `sitio/css/estilos.css` | Diseño |
| `sitio/js/datos.js` | **Lo que más se edita:** productos, feriados, fechas comerciales del aviso, ideas de regalo y tabla de tallas |
| `sitio/js/app.js` | Funcionamiento: catálogo, buscador, fichas, pedido, regalo, guía de tallas, preguntas frecuentes, aviso y decoración |
| `sitio/js/ayudante.js` | Ayudante virtual: responde con las preguntas frecuentes y el catálogo; si no entiende, pregunta a la IA (`/api/ayudante`); deriva a una persona (+56 9 4937 6311) |
| `sitio/js/medicion.js` | Medición anónima de uso (sin datos personales; se puede apagar desde el aviso de privacidad) |
| `sitio/terminos.html` | Términos y condiciones (compras, envíos, envoltorio, garantía, retracto, ventas por mayor, uso del sitio) |
| `sitio/panel.html`, `sitio/js/panel.js` | Panel privado de la familia: cómo se usa la página y estado de seguridad (pide clave) |
| `sitio/formularios.html` | Formularios internos "alerta" y "resumen" para que Netlify envíe avisos por correo (no se muestra) |
| `netlify/functions/` | Funciones del servidor: código de bienvenida, medición, panel, vigía de seguridad, estado y resumen semanal |
| `netlify/lib/` | Código compartido por las funciones |
| `package.json` | Le dice a Netlify que instale la librería de Netlify Blobs (donde se guardan códigos y eventos anónimos) |
| `herramientas/actualizar_resenas.py` | Agrega las reseñas de Google al Excel de reseñas de la tienda (no se publica) |
| `sitio/js/efectos.js` | Brillos al mover el mouse y al tocar |
| `sitio/img/`, `sitio/fichas/` | Fotos de productos, del local y afiches |
| `sitio/_headers` | Cabeceras de seguridad |
| `sitio/404.html` | Página de error |
| `sitio/privacidad.html` | Aviso de privacidad (versión 4: código, medición anónima, seguridad y ayudante con IA) y bases del descuento de bienvenida (10% o 15%) |
| `sitio/registro-listo.html` | Confirmación del registro cuando el navegador no usa JavaScript |
| `herramientas/actualizar_registros.py` | Pasa los registros nuevos del formulario al Excel de la tienda (no se publica) |
| `netlify.toml` | Le dice a Netlify que publique la carpeta `sitio` |

## Registro con descuento de bienvenida

- El formulario `registro` del sitio guarda cada registro en Netlify (Forms). No pide RUT ni datos de pago.
- Los registros se pasan al Excel `Registros 10% bienvenida - Angie's Secret.xlsx`, en la carpeta de la tienda del computador familiar, con `herramientas/actualizar_registros.py`. El programa no duplica filas (usa el ID del registro), no toca las columnas amarillas que completa la tienda y marca en Notas si un teléfono se repite.
- El Excel tiene datos personales: nunca se sube a este repositorio, que es público.
- Bases (versión 2): 10% si las prendas suman desde $15.000 y 15% desde $50.000, sin contar el envío; vale 1 mes desde el registro; registro hasta el 31 de enero de 2027; una vez por persona y número.
- Desde la versión 4.5 cada registro recibe un **código de bienvenida** (AS-XXXX-XXXX) que da `/api/bienvenida`. Va en el formulario (campo `codigo`), queda en el Excel (columna M) y aparece en el mensaje de WhatsApp del pedido. El pedido pide el descuento **si y solo si** en ese navegador hay un registro con código válido y sin usar; el servidor guarda solo el código, la fecha y si se usó (sin nombre ni teléfono).

## Medición, panel y seguridad (versión 4.5)

- **Medición anónima** (`/api/evento`): visitas, de dónde llegan, celular o computador, productos vistos y agregados, búsquedas (solo palabras, sin números ni correos), pedidos enviados, temas del ayudante, preguntas frecuentes abiertas y errores de la página. Cada navegador es un número al azar. Respeta Global Privacy Control y "Do Not Track", y se puede apagar en el aviso de privacidad. Se guarda en Netlify Blobs: los eventos de cada día se resumen y se borran; los resúmenes duran 24 meses.
- **Panel privado** (`/panel.html`): pide la clave guardada en Netlify como variable de entorno `CLAVE_PANEL` (Project configuration > Environment variables). La clave la crea la familia y no está en el repositorio.
- **Vigía de seguridad** (`/api/vigia`): recibe los avisos del navegador cuando la política de seguridad bloquea código (CSP con `report-uri`) y cuenta los intentos de robots en direcciones como `/wp-login.php` o `/.env`. Si pasa algo grave, envía el formulario `alerta`, que Netlify reenvía por correo.
- **Estado** (`/api/estado`, público y sin datos personales): huellas SHA-256 de los archivos publicados, cabeceras de seguridad y contadores del día. La tarea programada "Vigilancia diaria" compara esas huellas con el repositorio y avisa si no coinciden.
- **Resumen semanal** (`resumen-semanal`, lunes 7:50 en Chile): envía por correo el resumen de uso de la semana con el formulario `resumen` y borra lo que ya cumplió su plazo. Netlify solo ejecuta funciones programadas en el sitio publicado.
- Costo: las funciones gastan créditos de cómputo (10 por GB-hora) y de solicitudes (2 por cada 10.000). Con el tráfico de la tienda es muy poco, pero conviene mirarlo en Usage.

## Ayudante con inteligencia artificial (versión 4.6)

- El ayudante responde primero con reglas (gratis, en el navegador). Si no entiende la pregunta, o si la persona sigue conversando con la IA, llama a `netlify/functions/ayudante-ia.mjs` (`/api/ayudante`), que usa **Claude Haiku 5.5** con lo que dice `sitio/js/datos.js` (catálogo, preguntas frecuentes, horario, envoltorio, descuento) y reglas estrictas: solo temas de la tienda, sin precios ni stock inventados, sin datos personales, regla de la marca, siempre un siguiente paso.
- **Quién paga:** por defecto, el AI Gateway de Netlify, en créditos del plan (180 créditos por dólar; Haiku 5.5 cuesta USD 0,10 por millón de tokens de entrada y 0,50 de salida). Si se crea `ANTHROPIC_API_KEY` en Netlify > Environment variables, usa esa clave propia de Anthropic y su saldo.
- **Ahorro (versión gratis, decidido el 29 de octubre):** instrucciones compactas, sin pensamiento extendido, respuestas repetidas desde la memoria (3 días) y las reglas responden con `PRODUCTOS_TIENDA` sin gastar.
- **Topes:** `IA_TOPE_CREDITOS_MES` (20 por defecto, período del 26 al 25), `IA_TOPE_CREDITOS_DIA` (3), `IA_TOPE_MENSAJES_VISITANTE` (5 respuestas por persona al día, avisado al empezar; en la penúltima y la última deriva al +56 9 4937 6311), 8 preguntas por minuto por dirección, 300 caracteres por pregunta, 6 mensajes de historial, 1.500 tokens por respuesta (incluido lo que la IA piensa antes de responder). `IA_AYUDANTE=no` la apaga. Al llegar al tope se pausa sola, avisa por correo y el ayudante sigue con reglas.
- **Filtros de salida:** montos en pesos que no sean los tramos del descuento, enlaces, correos o teléfonos ajenos, y niños junto con lencería: se reemplazan por una respuesta segura.
- `/api/estado` muestra los créditos usados por la IA en el período (`ia`), y la vigilancia diaria avisa si se acerca al tope.

## Reglas de la marca

- Nunca juntar lencería o ropa interior con niños en un mismo texto, imagen o filtro.
- Solo fotos propias del local o de los productos; sin logos ni personajes de otras marcas.
- Nada que recuerde a Victoria's Secret.

## Historial de versiones

Cada versión es un cambio con su nombre en el historial ("Versión 2" a "Versión 4.5"), así que se puede volver atrás si algo falla. En Netlify, la pestaña Deploys también permite volver a una publicación anterior con un clic, sin gastar créditos.
