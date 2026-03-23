import xlrd
import json
import os

EXCEL = r"C:\Users\user\Downloads\lista-precios-09-12-2025.xls"
OUT = r"C:\Users\user\Documents\tecnovate\tecnovate\tecnovate\atacado-productos.json"

print(f"Abriendo: {EXCEL}")
wb = xlrd.open_workbook(EXCEL)
ws = wb.sheet_by_index(0)

print(f"Filas: {ws.nrows} | Columnas: {ws.ncols}")
encabezados = [ws.cell_value(0, c) for c in range(ws.ncols)]
print(f"Encabezados: {encabezados}")

productos = []
for row_idx in range(1, ws.nrows):
    codigo = ws.cell_value(row_idx, 0)
    nombre = ws.cell_value(row_idx, 1)
    if not codigo or not nombre:
        continue
    productos.append({
        "code": str(int(codigo)) if isinstance(codigo, float) else str(codigo).strip(),
        "name": str(nombre).strip(),
        "price_usd": 0,
        "image": "",
        "categoria": "geral"
    })

print(f"\nTotal productos: {len(productos)}")
print("Primeros 3:")
for p in productos[:3]:
    print(f"  {p['code']} | {p['name']}")

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(productos, f, ensure_ascii=False, indent=2)
print(f"\nGuardado en: {OUT}")