"""Prepara fotos de prendas para el catálogo de la página (sitio/img).

Deja cada foto en 720 x 900 (proporción 4:5, la de las tarjetas del catálogo), en formato WebP liviano:
  - quita líneas oscuras finas en los bordes (restos de capturas de pantalla);
  - quita márgenes vacíos para que la prenda se vea más grande;
  - completa el espacio que falta con el color del fondo de la misma foto (no se corta nada: el nombre,
    el código y las tallas escritos en la foto se ven completos).

Uso:
    python3 herramientas/preparar_fotos.py <carpeta con fotos> <carpeta de salida> [prefijo]

Cada archivo de salida se llama <prefijo><nombre original sin extensión>.webp (prefijo por defecto: "c-").
Antes de subirlas, revisa a mano cada foto:
  - que no muestre precios (se publican solo por WhatsApp) ni datos de otra tienda;
  - que no tenga modelos de bancos de imágenes ni fotos de otras marcas;
  - regla de la marca: nada de ropa interior de niñas o niños.
Para tapar un precio o recortar una parte, edita la foto antes (o usa tapar/recortar en procesar()).

Después, en sitio/js/datos.js, agrega el producto con fotos: ["c-nombre"] y modelo: true (así la ficha
muestra la foto completa y el ayudante con IA lo conoce solo por su nombre, sin gastar de más).
"""
import os, statistics, sys
from PIL import Image, ImageOps, ImageDraw, ImageChops

ANCHO, ALTO = 720, 900


def _mediana(vals):
    return tuple(int(statistics.median(v[i] for v in vals)) for i in range(3))


def color_borde(im):
    w, h = im.size; px = im.load(); vals = []
    for x in range(0, w, 4):
        for y in (1, 3, h - 2, h - 4): vals.append(px[x, y])
    for y in range(0, h, 4):
        for x in (1, 3, w - 2, w - 4): vals.append(px[x, y])
    return _mediana(vals)


def color_cerca(im, caja):
    x0, y0, x1, y1 = caja; w, h = im.size; px = im.load(); vals = []
    for x in range(max(0, x0 - 6), min(w, x1 + 6), 3):
        for y in (max(0, y0 - 5), min(h - 1, y1 + 4)): vals.append(px[x, y])
    for y in range(max(0, y0 - 6), min(h, y1 + 6), 3):
        for x in (max(0, x0 - 5), min(w - 1, x1 + 4)): vals.append(px[x, y])
    return _mediana(vals)


def sin_lineas(im):
    g = im.convert("L"); w, h = g.size; px = g.load()
    def fila(y): return sum(px[x, y] for x in range(0, w, 4)) / len(range(0, w, 4))
    def col(x): return sum(px[x, y] for y in range(0, h, 4)) / len(range(0, h, 4))
    def cortar(medias):
        oscuras = [i for i, v in enumerate(medias) if v < 90]
        if not oscuras: return 0
        k = max(oscuras) + 1
        return k + 2 if k < len(medias) and max(medias[k:k + 15]) > 170 else 0
    a = cortar([fila(y) for y in range(min(40, h))]); b = cortar([fila(h - 1 - y) for y in range(min(40, h))])
    i = cortar([col(x) for x in range(min(40, w))]); d = cortar([col(w - 1 - x) for x in range(min(40, w))])
    return im.crop((i, a, w - d, h - b)) if (a or b or i or d) else im


def sin_margenes(im, fondo):
    dif = ImageChops.difference(im, Image.new("RGB", im.size, fondo)).convert("L").point(lambda v: 255 if v > 28 else 0)
    caja = dif.getbbox()
    if not caja: return im
    x0, y0, x1, y1 = caja; w, h = im.size
    aire = int(0.035 * max(x1 - x0, y1 - y0))
    caja = (max(0, x0 - aire), max(0, y0 - aire), min(w, x1 + aire), min(h, y1 + aire))
    if (caja[2] - caja[0]) * (caja[3] - caja[1]) > 0.88 * w * h: return im
    return im.crop(caja)


def procesar(origen, destino, tapar=(), recortar=None):
    """tapar: rectángulos (x0, y0, x1, y1) que se cubren con el color de alrededor; recortar: (x0, y0, x1, y1)."""
    im = ImageOps.exif_transpose(Image.open(origen)).convert("RGB")
    for caja in tapar:
        ImageDraw.Draw(im).rectangle(caja, fill=color_cerca(im, caja))
    if recortar: im = im.crop(recortar)
    im = sin_lineas(im)
    fondo = color_borde(im)
    im = sin_margenes(im, fondo)
    im.thumbnail((ANCHO, ALTO), Image.LANCZOS)
    lienzo = Image.new("RGB", (ANCHO, ALTO), fondo)
    lienzo.paste(im, ((ANCHO - im.size[0]) // 2, (ALTO - im.size[1]) // 2))
    lienzo.save(destino, "WEBP", quality=78, method=6)
    return os.path.getsize(destino)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__); sys.exit(1)
    entrada, salida = sys.argv[1], sys.argv[2]
    prefijo = sys.argv[3] if len(sys.argv) > 3 else "c-"
    os.makedirs(salida, exist_ok=True)
    total = n = 0
    for nombre in sorted(os.listdir(entrada)):
        if not nombre.lower().endswith((".jpg", ".jpeg", ".png", ".webp")): continue
        base = os.path.splitext(nombre)[0].lower().replace(" ", "-")
        total += procesar(os.path.join(entrada, nombre), os.path.join(salida, f"{prefijo}{base}.webp")); n += 1
    print(f"{n} fotos listas en {salida} ({round(total / 1024)} KB en total)")
