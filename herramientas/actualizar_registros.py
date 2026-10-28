"""Agrega al Excel los registros nuevos del 10% de bienvenida de Angie's Secret.

Uso: python3 actualizar_registros.py "Registros 10% bienvenida - Angie's Secret.xlsx" registros.json

registros.json es una lista de registros leídos del formulario "registro" de Netlify:
[{"id": "...", "fecha": "AAAA-MM-DD", "nombre": "...", "apellido": "...",
  "telefono": "+569...", "correo": "...", "acepta_promociones": true}]

- No toca las columnas amarillas (las completa la tienda).
- No duplica: usa el "ID del registro" para saber qué ya está.
- Si un teléfono ya estaba registrado, lo anota en Notas (el 10% vale una sola vez por número).
"""
import json
import sys
from datetime import date
from openpyxl import load_workbook
from openpyxl.styles import Font, PatternFill

xlsx, origen = sys.argv[1], sys.argv[2]
registros = json.load(open(origen, encoding="utf-8"))

wb = load_workbook(xlsx)
ws = wb["Registros"]
AMARILLO = PatternFill("solid", fgColor="FFF2CC")

ids, telefonos, ultima = set(), set(), 1
for r in range(2, ws.max_row + 1):
    if ws.cell(row=r, column=2).value or ws.cell(row=r, column=12).value:
        ultima = r
        if ws.cell(row=r, column=12).value:
            ids.add(str(ws.cell(row=r, column=12).value))
        if ws.cell(row=r, column=4).value:
            telefonos.add(str(ws.cell(row=r, column=4).value))

nuevos, repetidos = 0, 0
for reg in sorted(registros, key=lambda x: (x.get("fecha") or "", x.get("id") or "")):
    if str(reg["id"]) in ids:
        continue
    ultima += 1
    r = ultima
    a, m, d = (int(x) for x in reg["fecha"][:10].split("-"))
    ws.cell(row=r, column=1, value=date(a, m, d)).number_format = "DD-MM-YYYY"
    ws.cell(row=r, column=2, value=(reg.get("nombre") or "").strip())
    ws.cell(row=r, column=3, value=(reg.get("apellido") or "").strip())
    ws.cell(row=r, column=4, value=(reg.get("telefono") or "").strip())
    ws.cell(row=r, column=5, value=(reg.get("correo") or "").strip() or None)
    ws.cell(row=r, column=6, value="Sí" if reg.get("acepta_promociones") else "No")
    g = ws.cell(row=r, column=7, value=f'=IF(A{r}="","",EDATE(A{r},1))')
    g.number_format = "DD-MM-YYYY"
    ws.cell(row=r, column=9).number_format = "DD-MM-YYYY"
    ws.cell(row=r, column=10).number_format = "$#,##0;-$#,##0;-"
    for c in range(8, 12):
        ws.cell(row=r, column=c).fill = AMARILLO
    for c in range(1, 12):
        ws.cell(row=r, column=c).font = Font(name="Arial")
    ws.cell(row=r, column=12, value=str(reg["id"])).font = Font(name="Arial", color="808080", size=8)
    tel = (reg.get("telefono") or "").strip()
    if tel in telefonos:
        ws.cell(row=r, column=11, value="Teléfono ya registrado antes: el 10% vale una sola vez por número.")
        repetidos += 1
    telefonos.add(tel)
    ids.add(str(reg["id"]))
    nuevos += 1

wb.calculation.fullCalcOnLoad = True
wb.save(xlsx)
print(json.dumps({"nuevos": nuevos, "telefonos_repetidos": repetidos, "total": len(ids)}, ensure_ascii=False))
