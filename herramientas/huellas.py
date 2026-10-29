"""Huellas de los archivos del sitio, para compararlas con las que entrega /api/estado del sitio publicado.

Uso: python3 herramientas/huellas.py sitio
Imprime un JSON {"index.html": "16 caracteres", ...}. En los .html se ignoran el contenido de las etiquetas
<form ...> y el destino de los href, porque Netlify los reescribe al publicar (igual que netlify/functions/estado.mjs).
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ARCHIVOS = ["index.html", "js/app.js", "js/datos.js", "js/efectos.js", "css/estilos.css", "privacidad.html", "terminos.html", "panel.html"]
raiz = Path(sys.argv[1] if len(sys.argv) > 1 else "sitio")


def normalizar(t):
    t = re.sub(r"<form\b[^>]*>", "<form>", t, flags=re.I)
    return re.sub(r"""\shref=("[^"]*"|'[^']*')""", " href", t, flags=re.I)


salida = {}
for a in ARCHIVOS:
    p = raiz / a
    if not p.exists():
        salida[a] = "no existe"
        continue
    t = p.read_text(encoding="utf-8")
    if a.endswith(".html"):
        t = normalizar(t)
    salida[a] = hashlib.sha256(t.encode("utf-8")).hexdigest()[:16]
print(json.dumps(salida, ensure_ascii=False))
