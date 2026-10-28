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
| `sitio/js/app.js` | Funcionamiento: catálogo, fichas, pedido, regalo, guía de tallas, aviso y decoración |
| `sitio/js/efectos.js` | Brillos al mover el mouse y al tocar |
| `sitio/img/`, `sitio/fichas/` | Fotos de productos, del local y afiches |
| `sitio/_headers` | Cabeceras de seguridad |
| `sitio/404.html` | Página de error |
| `sitio/privacidad.html` | Aviso de privacidad y bases del 10% de bienvenida |
| `sitio/registro-listo.html` | Confirmación del registro cuando el navegador no usa JavaScript |
| `herramientas/actualizar_registros.py` | Pasa los registros nuevos del formulario al Excel de la tienda (no se publica) |
| `netlify.toml` | Le dice a Netlify que publique la carpeta `sitio` |

## Registro con 10% de bienvenida

- El formulario `registro` del sitio guarda cada registro en Netlify (Forms). No pide RUT ni datos de pago.
- Los registros se pasan al Excel `Registros 10% bienvenida - Angie's Secret.xlsx`, en la carpeta de la tienda del computador familiar, con `herramientas/actualizar_registros.py`. El programa no duplica filas (usa el ID del registro), no toca las columnas amarillas que completa la tienda y marca en Notas si un teléfono se repite.
- El Excel tiene datos personales: nunca se sube a este repositorio, que es público.
- Bases: registro hasta el 31 de enero de 2027; el 10% vale 1 mes desde el registro; compra mínima de $15.000 en prendas, sin envío; una vez por persona y número.

## Reglas de la marca

- Nunca juntar lencería o ropa interior con niños en un mismo texto, imagen o filtro.
- Solo fotos propias del local o de los productos; sin logos ni personajes de otras marcas.
- Nada que recuerde a Victoria's Secret.

## Historial de versiones

Cada versión es un cambio con su nombre en el historial ("Versión 2" a "Versión 4.4"), así que se puede volver atrás si algo falla. En Netlify, la pestaña Deploys también permite volver a una publicación anterior con un clic, sin gastar créditos.
