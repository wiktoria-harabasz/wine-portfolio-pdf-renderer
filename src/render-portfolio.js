const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const { renderProducerPage } = require('./templates/producer')
const { renderIndexPage } = require('./templates/index')
const client = require('./sanity-client')
const { PRODUCER_QUERY, ALL_PRODUCERS_QUERY } = require('./queries')

async function buildPortfolioHtml(priceType) {
  const producers = await client.fetch(ALL_PRODUCERS_QUERY)

  // Pass 1: fetch full data + filter wines per portfolio, drop empty producers entirely
  const producersWithVisibleWines = []
  for (const p of producers) {
    const full = await client.fetch(PRODUCER_QUERY, { id: p._id })
    const visibleWines = full.wines.filter(w =>
      priceType === 'horeca' ? !w.hideFromHoreca : !w.hideFromPrivate
    )
    producersWithVisibleWines.push({ ...full, slug: p.slug, wines: visibleWines })
  }

   // Pass 2: NOW compute page/producer numbers, based on the already-filtered list
   const numberedProducers = producersWithVisibleWines.map((p, i) => ({
    ...p,
    pageNumber: i + 2,
    producerNumber: i + 1,
  }))
  const totalPages = numberedProducers.length + 1

  // Pass 3: build index and pages from the SAME numbered, filtered list
  let allPagesHtml = renderIndexPage(numberedProducers)


  for (const p of numberedProducers) {
    const pageHtml = renderProducerPage(
      { ...p, totalPages },
      priceType
    )
    allPagesHtml += pageHtml
  }

  const shell = fs.readFileSync(path.join(__dirname, 'portfolio-shell.html'), 'utf-8')
  return shell.replace('{{CONTENT}}', allPagesHtml)
}

async function renderPortfolioPdf(priceType) {
  const html = await buildPortfolioHtml(priceType)
  const tempPath = path.join(__dirname, `_temp-${priceType}.html`)
  fs.writeFileSync(tempPath, html)

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] })
  const page = await browser.newPage()
  await page.goto(`file://${tempPath}`, { waitUntil: 'networkidle0' })
  await page.emulateMediaType('print')

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: `
      <div style="font-size:9px; width:100%; text-align:right; padding-right:20mm;">
        <span class="pageNumber"></span> / <span class="totalPages"></span>
      </div>
    `,
    margin: { top: '0mm', bottom: '15mm', left: '0mm', right: '0mm' },
  })

  await browser.close()
  fs.unlinkSync(tempPath)
  return pdfBuffer
}

module.exports = { buildPortfolioHtml, renderPortfolioPdf }