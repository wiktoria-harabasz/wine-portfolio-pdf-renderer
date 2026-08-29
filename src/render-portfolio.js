const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const { renderProducerPage } = require('./templates/producer')
const { renderIndexPages, countIndexPages } = require('./templates/index')
const client = require('./sanity-client')
const { PRODUCER_QUERY, ALL_PRODUCERS_QUERY } = require('./queries')
const { renderTermsPage } = require('./templates/terms')

async function buildPortfolioHtml(priceType) {
    const producers = await client.fetch(ALL_PRODUCERS_QUERY)
  
    const producersWithVisibleWines = []
    for (const p of producers) {
      const full = await client.fetch(PRODUCER_QUERY, { id: p._id })
      const visibleWines = full.wines.filter(w =>
        priceType === 'horeca' ? !w.hideFromHoreca : !w.hideFromPrivate
      )
      producersWithVisibleWines.push({ ...full, slug: p.slug, wines: visibleWines })
    }
  
    producersWithVisibleWines.forEach((p, i) => { p.producerNumber = i + 1 })
  
    const numberOfIndexPages = countIndexPages(producersWithVisibleWines)
  
    producersWithVisibleWines.forEach((p, i) => { p.pageNumber = numberOfIndexPages + 1 + i })
    const totalPages = numberOfIndexPages + producersWithVisibleWines.length + 1
  
    let allPagesHtml = renderIndexPages(producersWithVisibleWines)
  
    for (const p of producersWithVisibleWines) {
      const pageHtml = renderProducerPage({ ...p, totalPages }, priceType)
      allPagesHtml += pageHtml
    }

    allPagesHtml += renderTermsPage(totalPages, totalPages)
  
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