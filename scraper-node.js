const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const fs = require('fs')
puppeteer.use(StealthPlugin())

const OUTPUT     = './atacado-completo.json'
const CHECKPOINT = './ckpt-cats.json'
const MARKUP     = 1.15

const CATEGORIAS = [
  // Consoles
  { url: 'https://atacadoconnect.com/categoria/playstation',     cat: 'Gaming' },
  { url: 'https://atacadoconnect.com/categoria/nintendo',        cat: 'Gaming' },
  { url: 'https://atacadoconnect.com/categoria/xbox',            cat: 'Gaming' },
  { url: 'https://atacadoconnect.com/categoria/controles',       cat: 'Gaming' },
  // Smartphones
  { url: 'https://atacadoconnect.com/categoria/smartphones',     cat: 'Celulares' },
  { url: 'https://atacadoconnect.com/categoria/celulares',       cat: 'Celulares' },
  { url: 'https://atacadoconnect.com/categoria/smartwatch',      cat: 'Smartwatches' },
  { url: 'https://atacadoconnect.com/categoria/fones-de-ouvido', cat: 'Audio' },
  { url: 'https://atacadoconnect.com/categoria/carregadores',    cat: 'Accesorios' },
  // Informatica
  { url: 'https://atacadoconnect.com/categoria/notebooks',       cat: 'Notebooks' },
  { url: 'https://atacadoconnect.com/categoria/processadores',   cat: 'Componentes' },
  { url: 'https://atacadoconnect.com/categoria/placas-mae',      cat: 'Componentes' },
  { url: 'https://atacadoconnect.com/categoria/placas-de-video', cat: 'Componentes' },
  { url: 'https://atacadoconnect.com/categoria/memoria-ram',     cat: 'Componentes' },
  { url: 'https://atacadoconnect.com/categoria/ssd',             cat: 'Componentes' },
  { url: 'https://atacadoconnect.com/categoria/hd',              cat: 'Componentes' },
  { url: 'https://atacadoconnect.com/categoria/fontes',          cat: 'Componentes' },
  { url: 'https://atacadoconnect.com/categoria/gabinetes',       cat: 'Componentes' },
  { url: 'https://atacadoconnect.com/categoria/coolers-e-fans',  cat: 'Componentes' },
  { url: 'https://atacadoconnect.com/categoria/monitores',       cat: 'Monitores' },
  { url: 'https://atacadoconnect.com/categoria/mouses',          cat: 'Accesorios' },
  { url: 'https://atacadoconnect.com/categoria/teclados',        cat: 'Accesorios' },
  { url: 'https://atacadoconnect.com/categoria/headsets',        cat: 'Audio' },
  { url: 'https://atacadoconnect.com/categoria/desktop',         cat: 'Notebooks' },
  { url: 'https://atacadoconnect.com/categoria/tablets-e-readers', cat: 'Tablets' },
  { url: 'https://atacadoconnect.com/categoria/pendrives',       cat: 'Accesorios' },
  { url: 'https://atacadoconnect.com/categoria/modems-roteadores-e-access-point', cat: 'Networking' },
  { url: 'https://atacadoconnect.com/categoria/impressoras-e-multifuncionais', cat: 'Impresoras' },
  { url: 'https://atacadoconnect.com/categoria/impressoras-3d',  cat: 'Impresoras' },
  // Electronicos
  { url: 'https://atacadoconnect.com/categoria/smart-tv',        cat: 'Televisores' },
  { url: 'https://atacadoconnect.com/categoria/cameras-de-acao', cat: 'Camaras' },
  { url: 'https://atacadoconnect.com/categoria/projetores',      cat: 'Electronica' },
  // Casa inteligente
  { url: 'https://atacadoconnect.com/categoria/aspiradores',     cat: 'Casa Inteligente' },
  { url: 'https://atacadoconnect.com/categoria/iluminacao',      cat: 'Casa Inteligente' },
]

function parsePrice(html) {
  const text = (html || '').replace(/&nbsp;/g, ' ').replace(/&#160;/g, ' ')
  for (const re of [/U\$\s*([\d.]+,\d{2})/, /U\$\s*([\d]+,\d{2})/]) {
    const m = text.match(re)
    if (m) {
      const v = parseFloat(m[1].replace(/\./g,'').replace(',','.'))
      if (v > 0 && v < 99999) return v
    }
  }
  return 0
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  let done = {}
  if (fs.existsSync(CHECKPOINT)) {
    done = JSON.parse(fs.readFileSync(CHECKPOINT, 'utf-8'))
    console.log(`Retomando: ${Object.keys(done).length} productos ya scraped`)
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
  const page = await browser.newPage()
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'es-PY,es;q=0.9' })
  await page.setViewport({ width: 1280, height: 800 })

  // Tipo de cambio
  let exchangeRate = 6800
  try {
    await page.goto('https://atacadoconnect.com', { waitUntil: 'networkidle2', timeout: 30000 })
    await sleep(2000)
    const html = await page.content()
    const m = html.replace(/&nbsp;/g,' ').match(/G\$\s*([\d.]+)/)
    if (m) {
      const v = parseFloat(m[1].replace(/\./g,''))
      if (v > 5000 && v < 20000) { exchangeRate = v }
    }
    console.log(`Tipo de cambio: G$ ${exchangeRate.toLocaleString()}`)
  } catch(e) { console.log(`Tipo de cambio por defecto: G$ ${exchangeRate}`) }

  for (const { url, cat } of CATEGORIAS) {
    console.log(`\n📦 Categoría: ${cat} → ${url}`)
    let page_num = 1

    while (true) {
      const pageUrl = `${url}/${page_num}`
      try {
        await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 30000 })
        await sleep(2000)

        // Extraer productos de la página de categoría
        const items = await page.evaluate(() => {
          const results = []
          // Selectores para cards de producto
          const cards = document.querySelectorAll(
            '[class*="product-card"], [class*="produto"], [class*="card-produto"], ' +
            '[class*="item-produto"], .col-produto, [class*="ProductCard"]'
          )
          cards.forEach(card => {
            const nameEl = card.querySelector('h2, h3, h4, [class*="name"], [class*="nome"], [class*="titulo"]')
            const name = nameEl?.innerText?.trim()
            const link = card.querySelector('a')?.href || ''
            const priceEl = card.querySelector('[class*="price"], [class*="preco"], [class*="valor"]')
            const priceText = (priceEl?.innerText || '').replace(/&nbsp;/g,' ')
            const priceMatch = priceText.match(/U\$\s*([\d.]+,\d{2})/)
            const price = priceMatch ? parseFloat(priceMatch[1].replace(/\./g,'').replace(',','.')) : 0
            const img = card.querySelector('img')?.src || card.querySelector('img')?.dataset?.src || ''
            const codeMatch = link.match(/\/(\d{5,7})(?:\/|$)/)
            const code = codeMatch ? codeMatch[1] : ''
            if (name && link) results.push({ name, code, price, img, link })
          })
          return results
        })

        if (items.length === 0) {
          console.log(`  Pág ${page_num}: sin productos — fin de categoría`)
          break
        }

        let nuevos = 0
        for (const item of items) {
          const code = item.code || item.link.split('/').filter(Boolean).pop()
          if (done[code]) continue

          // Entrar al producto para precio exacto e imágenes completas
          let priceUSD = item.price
          let images = item.img ? [item.img] : []
          let desc = ''

          if (item.link && (priceUSD === 0 || images.length < 2)) {
            try {
              await page.goto(item.link, { waitUntil: 'networkidle2', timeout: 25000 })
              await sleep(1500)
              try {
                await page.waitForFunction(() => document.body.innerHTML.includes('U$'), { timeout: 6000 })
              } catch(_) {}

              const prodHtml = await page.content()
              if (priceUSD === 0) priceUSD = parsePrice(prodHtml)

              const prodData = await page.evaluate(() => {
                const skip = ['logo','icon','banner','placeholder','breve','svg','whatsapp','loading']
                const imgs = [...new Set(
                  Array.from(document.querySelectorAll('img'))
                    .map(img => img.src || img.dataset?.src || '')
                    .filter(s => s && s.startsWith('http') && !skip.some(x => s.toLowerCase().includes(x)))
                )].slice(0, 8)
                let desc = ''
                for (const cls of ['descricao','description','detalhe','especificac']) {
                  const el = document.querySelector(`[class*="${cls}"]`)
                  if (el?.innerText?.trim().length > 20) { desc = el.innerText.trim().substring(0,500); break }
                }
                return { imgs, desc }
              })

              images = prodData.imgs.length > 0 ? prodData.imgs : images
              desc = prodData.desc

              // Volver a la página de categoría
              await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 25000 })
              await sleep(1000)
            } catch(e) {}
          }

          const priceUSDFinal = parseFloat((priceUSD * MARKUP).toFixed(2))
          const priceGsFinal  = Math.round(priceUSD * exchangeRate * MARKUP)

          done[code] = {
            code, name: item.name, cat,
            price_usd: priceUSDFinal,
            price_usd_base: priceUSD,
            price_gs: priceGsFinal,
            exchange_rate: exchangeRate,
            images, description: desc,
            url: item.link,
          }
          nuevos++
          console.log(`  ${priceUSD>0?'✓':'~'} [${code}] ${item.name.substring(0,35)} | $${priceUSDFinal} | ${images.length} imgs`)
        }

        console.log(`  Pág ${page_num}: ${items.length} items | ${nuevos} nuevos | Total: ${Object.keys(done).length}`)

        // Checkpoint
        fs.writeFileSync(CHECKPOINT, JSON.stringify(done, null, 2))
        fs.writeFileSync(OUTPUT, JSON.stringify(Object.values(done), null, 2))

        if (items.length < 10) break // Última página
        page_num++
        await sleep(800)

      } catch(e) {
        console.log(`  Error pág ${page_num}: ${e.message.substring(0,60)}`)
        break
      }
    }
  }

  fs.writeFileSync(OUTPUT, JSON.stringify(Object.values(done), null, 2))
  const withPrice = Object.values(done).filter(p => p.price_usd_base > 0).length
  console.log(`\n✅ COMPLETADO`)
  console.log(`   Total productos: ${Object.keys(done).length}`)
  console.log(`   Con precio: ${withPrice} (${Math.round(withPrice/Object.keys(done).length*100)}%)`)
  console.log(`   Archivo: ${OUTPUT}`)
  await browser.close()
}

main().catch(console.error)