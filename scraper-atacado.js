// ═══════════════════════════════════════════════════════════════════
// SCRAPER ATACADO CONNECT - Pegar en la consola del navegador
// Requisitos: estar logueado en atacadoconnect.com
// Pegar primero: allow pasting  (en Chrome)
// ═══════════════════════════════════════════════════════════════════

(async () => {

// ── Categorías de Atacado ─────────────────────────────────────────
const CATEGORIAS = [
  // Ajustar estas URLs según las categorías reales de atacadoconnect.com
  // Navegá a cada categoría y copiá la URL aquí
  { url: window.location.href, cat: 'geral' }, // página actual
];

// Si estás en la página principal, intentar obtener todas las categorías
const catLinks = document.querySelectorAll('a[href*="categoria"], a[href*="category"], nav a, .menu a');
catLinks.forEach(link => {
  const href = link.href;
  if (href && href.includes(window.location.hostname) && !CATEGORIAS.find(c => c.url === href)) {
    const cat = href.split('/').pop() || 'geral';
    CATEGORIAS.push({ url: href, cat });
  }
});

console.log(`📦 Categorías encontradas: ${CATEGORIAS.length}`);
CATEGORIAS.forEach(c => console.log(' -', c.url));

const todos = [];
const vistos = new Set();

// ── Función para extraer productos de una página ─────────────────
function extraerProductos(doc, catName) {
  const prods = [];

  // Intentar múltiples estrategias de extracción
  
  // Estrategia 1: JSON-LD estructurado
  doc.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
    try {
      const data = JSON.parse(s.textContent);
      const items = data['@graph'] || (Array.isArray(data) ? data : [data]);
      items.forEach(item => {
        if (item['@type'] === 'Product' || item.name) {
          const price = parseFloat(String(item.offers?.price || item.price || '0').replace(/[^\d.]/g, ''));
          if (item.name && price > 0) {
            prods.push({
              name: item.name,
              code: item.sku || item.mpn || item.gtin || '',
              price_usd: price,
              image: Array.isArray(item.image) ? item.image[0] : (item.image || ''),
              url: item.offers?.url || item.url || '',
              categoria: catName,
            });
          }
        }
      });
    } catch(e) {}
  });

  // Estrategia 2: Selectores CSS comunes
  const selectors = [
    '.product-item', '.produto-item', '.produto', '.product',
    '[class*="ProductCard"]', '[class*="product-card"]', '[class*="ProductItem"]',
    '.card-produto', '.item-produto', '[data-product]',
    'li[class*="product"]', 'div[class*="product-list"] > div',
    '.products-grid .item', '.catalog-product-item',
  ];

  for (const sel of selectors) {
    const items = doc.querySelectorAll(sel);
    if (items.length > 0) {
      items.forEach(item => {
        // Nombre
        const nameEl = item.querySelector(
          'h1, h2, h3, h4, .product-name, .produto-name, [class*="title"], [class*="name"], [class*="titulo"]'
        );
        const name = nameEl?.textContent?.trim();
        if (!name || name.length < 3) return;

        // Precio
        const priceEls = item.querySelectorAll(
          '.price, .preco, .valor, [class*="price"], [class*="preco"], [class*="valor"], [class*="Price"]'
        );
        let price = 0;
        priceEls.forEach(el => {
          const txt = el.textContent?.replace(/[^\d.,]/g, '').replace(',', '.') || '0';
          const p = parseFloat(txt);
          if (p > 0 && p < 99999) price = p;
        });
        if (price <= 0) return;

        // URL
        const link = item.querySelector('a')?.href || '';
        if (vistos.has(link || name)) return;
        vistos.add(link || name);

        // Imagen
        const imgEl = item.querySelector('img');
        const img = imgEl?.src || imgEl?.getAttribute('data-src') || imgEl?.getAttribute('data-lazy') || imgEl?.getAttribute('data-original') || '';

        // Código
        const codeEl = item.querySelector('[class*="sku"], [class*="code"], [class*="codigo"], [class*="ref"], [data-sku]');
        const code = codeEl?.textContent?.replace(/[^a-zA-Z0-9-]/g, '') || item.getAttribute('data-product-id') || '';

        prods.push({ name, code, price_usd: price, image: img, url: link, categoria: catName });
      });
      if (prods.length > 0) break;
    }
  }

  // Estrategia 3: Buscar en window.__NEXT_DATA__ o window.__INITIAL_STATE__ (Next.js/Nuxt)
  if (prods.length === 0) {
    try {
      const nextData = JSON.parse(doc.getElementById('__NEXT_DATA__')?.textContent || '{}');
      const pageProps = nextData?.props?.pageProps;
      const products = pageProps?.products || pageProps?.items || pageProps?.data?.products || [];
      products.forEach((p) => {
        const price = parseFloat(String(p.price || p.preco || p.valor || '0').replace(/[^\d.]/g, ''));
        if (p.name || p.nome) {
          prods.push({
            name: p.name || p.nome || p.title || p.titulo,
            code: p.sku || p.code || p.codigo || p.id || '',
            price_usd: price,
            image: p.image || p.imagem || p.foto || p.thumbnail || p.images?.[0] || '',
            url: p.url || p.slug || '',
            categoria: catName,
          });
        }
      });
    } catch(e) {}
  }

  return prods;
}

// ── Scrapear cada categoría ───────────────────────────────────────
for (const { url, cat } of CATEGORIAS) {
  console.log(`\n🔍 Scraping: ${cat} (${url})`);

  for (let p = 1; p <= 15; p++) {
    try {
      const pageUrl = url.includes('?') ? `${url}&page=${p}` : `${url}?page=${p}`;
      const finalUrl = p === 1 ? url : pageUrl;
      
      const res = await fetch(finalUrl, { credentials: 'include' });
      if (!res.ok) { console.log(`  ✗ Error HTTP ${res.status}`); break; }
      
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      
      const prods = extraerProductos(doc, cat);
      
      // También intentar con ?p= y &p=
      let altProds = [];
      if (p > 1 && prods.length === 0) {
        const altUrl = url + (url.includes('?') ? `&p=${p}` : `/page/${p}`);
        const altRes = await fetch(altUrl, { credentials: 'include' });
        if (altRes.ok) {
          const altDoc = new DOMParser().parseFromString(await altRes.text(), 'text/html');
          altProds = extraerProductos(altDoc, cat);
        }
      }

      const nuevos = [...prods, ...altProds].filter(pr => !vistos.has(pr.url || pr.name));
      nuevos.forEach(pr => { vistos.add(pr.url || pr.name); todos.push(pr); });
      
      console.log(`  Pág ${p}: ${nuevos.length} nuevos | Total acumulado: ${todos.length}`);
      if (nuevos.length === 0) break;
      
      await new Promise(r => setTimeout(r, 500));
    } catch(e) {
      console.log(`  Error: ${e.message}`);
      break;
    }
  }
}

// ── Resultado ─────────────────────────────────────────────────────
console.log(`\n✅ TOTAL: ${todos.length} productos`);

if (todos.length === 0) {
  console.warn('⚠ No se encontraron productos. Probá estas alternativas:');
  console.warn('1. Asegurate de estar logueado en atacadoconnect.com');
  console.warn('2. Navegá a una página de categoría específica y corré el script desde ahí');
  console.warn('3. Revisá en DevTools → Network → XHR si hay requests a /api/products o similar');
} else {
  // Descargar JSON
  const blob = new Blob([JSON.stringify(todos, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'atacado-productos.json';
  a.click();

  // Descargar YAML
  let yaml = 'products:\n';
  todos.forEach(p => {
    yaml += `  - name: "${(p.name || '').replace(/"/g, "'")}"\n`;
    yaml += `    code: "${p.code || ''}"\n`;
    yaml += `    price_usd: ${p.price_usd || 0}\n`;
    yaml += `    image: "${p.image || ''}"\n`;
    yaml += `    categoria: "${p.categoria || 'geral'}"\n`;
  });
  const blob2 = new Blob([yaml], { type: 'text/yaml' });
  const a2 = document.createElement('a');
  a2.href = URL.createObjectURL(blob2);
  a2.download = 'products.yml';
  a2.click();

  console.log('✅ Archivos descargados: atacado-productos.json y products.yml');
}

})();
