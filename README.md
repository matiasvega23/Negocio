# Angie's Secret · sitio web

Catálogo de Angie's Secret, tienda de lencería y ropa en Domingo Santa María 3831, Renca, con pedidos por WhatsApp.

Sitio publicado: https://angiessecret.netlify.app

## Cómo se publica

Cada cambio que se sube a la rama `main` de este repositorio se publica solo en Netlify, en uno o dos minutos. No hay que arrastrar zips.

Cada publicación gasta 15 de los 300 créditos mensuales del plan gratis de Netlify. Por eso se publica por lotes: **máximo 2 veces al mes** (primera semana y mitad de mes), salvo correcciones urgentes. Antes de publicar, el lote se revisa con la vista previa, que no gasta créditos.

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
| `netlify.toml` | Le dice a Netlify que publique la carpeta `sitio` |

## Reglas de la marca

- Nunca juntar lencería o ropa interior con niños en un mismo texto, imagen o filtro.
- Solo fotos propias del local o de los productos; sin logos ni personajes de otras marcas.
- Nada que recuerde a Victoria's Secret.

## Historial de versiones

Cada versión es un cambio con su nombre en el historial ("Versión 2", "Versión 3", "Versión 4", "Versión 4.1", "Versión 4.2"), así que se puede volver atrás si algo falla. En Netlify, la pestaña Deploys también permite volver a una publicación anterior con un clic.
