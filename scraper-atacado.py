import requests
import json
import time
import os
from bs4 import BeautifulSoup

# Cookies de tu sesión - necesitamos obtenerlas
# En Chrome: F12 → Application → Cookies → atacadoconnect.com
# Copiá el valor de las cookies cf_clearance y cualquier cookie de sesión
COOKIES = {
    # Pegá tus cookies aquí, ejemplo:
    # 'cf_clearance': 'xxxxxx',
    # 'session': 'xxxxxx',
}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36',
    'Accept-Language': 'es-US,es;q=0.9',
    'Referer': 'https://atacadoconnect.com/',
}

INPUT = r"C:\Users\user\Documents\tecnovate\tecnovate\tecnovate\atacado-productos.json"
OUTPUT = r"C:\Users\user\Documents\tecnovate\tecnovate\tecnovate\atacado-completo.json"
CHECKPOINT = r"C:\Users\user\Documents\tecnovate\tecnovate\tecnovate\checkpoint.json"

def buscar_producto(codigo):
    # Buscar por código en el buscador
    url = f"https://atacadoconnect.com/lista-productos?busca={codigo}"
    try:
        r = requests.get(url, headers=HEADERS, cookies=COOKIES, timeout=15)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # Buscar link del producto
        links = soup.select('a[href*="/produto/"]')
        prod_url = None
        for link in links:
            href = link.get('href', '')
            if str(codigo) in href:
                prod_url = href if href.startswith('http') else f"https://atacadoconnect.com{href}"
                break
        
        if not prod_url and links:
            href = links[0].get('href', '')
            prod_url = href if href.startswith('http') else f"https://atacadoconnect.com{href}"
        
        return prod_url
    except:
        return None

def extraer_producto(url):
    try:
        r = requests.get(url, headers=HEADERS, cookies=COOKIES, timeout=15)
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # Precio - buscar en múltiples formatos
        price = 0
        price_selectors = [
            '[class*="preco"] [class*="valor"]',
            '[class*="price"]', 
            '[class*="preco"]',
            '[class*="valor"]',
        ]
        for sel in price_selectors:
            el = soup.select_one(sel)
            if el:
                txt = el.get_text().strip()
                # Buscar USD o U$
                import re
                m = re.search(r'U\$\s*([\d.,]+)', txt)
                if m:
                    price = float(m.group(1).replace('.','').replace(',','.'))
                    break
                m = re.search(r'([\d]+[.,][\d]{2})', txt)
                if m and not price:
                    price = float(m.group(1).replace(',','.'))
        
        # Imágenes
        images = []
        img_selectors = ['[class*="galeria"] img', '[class*="swiper"] img', '[class*="produto"] img', 'img[src*="produto"]', 'img[src*="product"]']
        for sel in img_selectors:
            imgs = soup.select(sel)
            for img in imgs:
                src = img.get('src') or img.get('data-src') or img.get('data-lazy') or ''
                if src and 'atacado' in src and src not in images and not src.endswith('.svg'):
                    images.append(src)
            if images:
                break
        
        # Descripción
        desc = ''
        desc_el = soup.select_one('[class*="descricao"], [class*="description"], [class*="detalhe"]')
        if desc_el:
            desc = desc_el.get_text().strip()[:500]
        
        return { 'price_usd': price, 'images': images[:8], 'description': desc, 'url': url }
    except Exception as e:
        return { 'price_usd': 0, 'images': [], 'description': '', 'url': url }

# Cargar productos
with open(INPUT, 'r', encoding='utf-8') as f:
    productos = json.load(f)

# Cargar checkpoint si existe
done = {}
if os.path.exists(CHECKPOINT):
    with open(CHECKPOINT, 'r', encoding='utf-8') as f:
        done = json.load(f)
    print(f"Retomando desde checkpoint: {len(done)} productos ya procesados")

total = len(productos)
resultados = list(done.values())

for i, prod in enumerate(productos):
    codigo = prod['code']
    if codigo in done:
        continue
    
    print(f"[{i+1}/{total}] {codigo} | {prod['name'][:50]}...")
    
    # Buscar URL del producto
    url = buscar_producto(codigo)
    if url:
        data = extraer_producto(url)
        prod.update(data)
        print(f"  ✓ USD ${data['price_usd']} | {len(data['images'])} imgs")
    else:
        print(f"  ✗ No encontrado")
    
    done[codigo] = prod
    resultados.append(prod)
    
    # Guardar checkpoint cada 50 productos
    if i % 50 == 0:
        with open(CHECKPOINT, 'w', encoding='utf-8') as f:
            json.dump(done, f, ensure_ascii=False)
        with open(OUTPUT, 'w', encoding='utf-8') as f:
            json.dump(list(done.values()), f, ensure_ascii=False, indent=2)
        print(f"  💾 Checkpoint guardado ({len(done)} procesados)")
    
    time.sleep(0.8)  # Respetar el servidor

# Guardar final
with open(OUTPUT, 'w', encoding='utf-8') as f:
    json.dump(list(done.values()), f, ensure_ascii=False, indent=2)

print(f"\n✅ COMPLETADO: {len(done)} productos procesados")
print(f"Guardado en: {OUTPUT}")