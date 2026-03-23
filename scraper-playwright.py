import json, os, re, unicodedata, time
from curl_cffi import requests
from bs4 import BeautifulSoup

INPUT    = r"C:\Users\user\Documents\tecnovate\tecnovate\tecnovate\atacado-productos.json"
OUTPUT   = r"C:\Users\user\Documents\tecnovate\tecnovate\tecnovate\atacado-completo.json"
CHECKPOINT = r"C:\Users\user\Documents\tecnovate\tecnovate\tecnovate\ckpt.json"

session = requests.Session(impersonate="chrome120")

def slug(nombre):
    nfkd = unicodedata.normalize('NFKD', nombre)
    s = ''.join(c for c in nfkd if not unicodedata.combining(c))
    s = s.upper()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'\s+', '-', s.strip())
    s = re.sub(r'-+', '-', s)
    return s[:80]

def get_page(url):
    try:
        r = session.get(url, timeout=20, headers={
            'Accept-Language': 'es-PY,es;q=0.9',
            'Referer': 'https://atacadoconnect.com/',
        })
        if r.status_code == 200:
            return r.text
    except Exception as e:
        print(f"    Error get: {e}")
    return None

def extraer_datos(html, codigo):
    price_usd = 0
    price_gs  = 0
    images    = []
    desc      = ''
    prod_url  = ''

    if not html:
        return price_usd, price_gs, images, desc, prod_url

    # Precio USD — "U$ 135,00"
    for pat in [r'U\$\s*([\d\.]+,[\d]{2})', r'U\$\s*([\d]+,[\d]{2})']:
        m = re.findall(pat, html)
        if m:
            try:
                price_usd = float(m[0].replace('.','').replace(',','.'))
                break
            except:
                pass

    # Precio GS — "G$ 918.000,00"
    for pat in [r'G\$\s*([\d\.]+,[\d]{2})', r'G\$\s*([\d]+\.[\d]+,[\d]{2})']:
        m = re.findall(pat, html)
        if m:
            try:
                price_gs = float(m[0].replace('.','').replace(',','.'))
                break
            except:
                pass

    # Buscar URL del producto
    soup = BeautifulSoup(html, 'html.parser')
    for a in soup.find_all('a', href=True):
        href = a['href']
        if '/produto/' in href and str(codigo) in href:
            prod_url = href if href.startswith('http') else 'https://atacadoconnect.com' + href
            break
    if not prod_url:
        for a in soup.find_all('a', href=True):
            if '/produto/' in a['href']:
                href = a['href']
                prod_url = href if href.startswith('http') else 'https://atacadoconnect.com' + href
                break

    # Imágenes
    skip = ['logo','icon','banner','placeholder','breve','svg','whatsapp','loading']
    for img in soup.find_all('img'):
        src = img.get('src') or img.get('data-src') or img.get('data-lazy') or ''
        if not src or not src.startswith('http'):
            continue
        if any(x in src.lower() for x in skip):
            continue
        if src not in images:
            images.append(src)

    # Descripción
    for cls in ['descricao','description','detalhe','especificac']:
        el = soup.find(class_=re.compile(cls, re.I))
        if el:
            txt = el.get_text(strip=True)
            if len(txt) > 20:
                desc = txt[:500]
                break

    return price_usd, price_gs, images[:8], desc, prod_url

def main():
    with open(INPUT, encoding='utf-8') as f:
        productos = json.load(f)

    done = {}
    if os.path.exists(CHECKPOINT):
        with open(CHECKPOINT, encoding='utf-8') as f:
            done = json.load(f)
        print(f"Retomando: {len(done)} ya procesados")

    total = len(productos)

    for i, prod in enumerate(productos):
        codigo = prod['code']
        if codigo in done:
            continue

        nombre = prod['name']
        print(f"[{i+1}/{total}] {codigo} | {nombre[:45]}...")

        # Buscar por slug del nombre
        url = f"https://atacadoconnect.com/lista-productos/termo/{slug(nombre)}/1"
        html = get_page(url)
        price_usd, price_gs, images, desc, prod_url = extraer_datos(html, codigo)

        # Si encontró URL del producto, entrar para más imágenes
        if prod_url and len(images) < 2:
            html2 = get_page(prod_url)
            if html2:
                _, _, images2, desc2, _ = extraer_datos(html2, codigo)
                if len(images2) > len(images):
                    images = images2
                if not desc and desc2:
                    desc = desc2

        # Si no encontró precio, buscar por código
        if price_usd == 0:
            url2 = f"https://atacadoconnect.com/lista-productos?busca={codigo}"
            html2 = get_page(url2)
            if html2:
                price_usd2, price_gs2, images2, _, prod_url2 = extraer_datos(html2, codigo)
                if price_usd2 > 0:
                    price_usd = price_usd2
                    price_gs  = price_gs2
                if not prod_url and prod_url2:
                    prod_url = prod_url2
                if not images and images2:
                    images = images2

        prod['price_usd']   = price_usd
        prod['price_gs']    = price_gs
        prod['images']      = images
        prod['description'] = desc
        prod['url']         = prod_url

        icon = '✓' if price_usd > 0 else '~'
        print(f"  {icon} U${price_usd:.2f} | G${int(price_gs):,} | {len(images)} imgs")

        done[codigo] = prod

        if len(done) % 25 == 0:
            with open(CHECKPOINT, 'w', encoding='utf-8') as f:
                json.dump(done, f, ensure_ascii=False)
            with open(OUTPUT, 'w', encoding='utf-8') as f:
                json.dump(list(done.values()), f, ensure_ascii=False, indent=2)
            print(f"  💾 Checkpoint: {len(done)}")

        time.sleep(0.8)

    with open(OUTPUT, 'w', encoding='utf-8') as f:
        json.dump(list(done.values()), f, ensure_ascii=False, indent=2)
    print(f"\n✅ {len(done)} productos → {OUTPUT}")

main()