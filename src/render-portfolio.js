const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const { renderProducerPage } = require('./templates/producer')
const { renderIndexPages, countIndexPages } = require('./templates/index')
const { renderCoverPage } = require('./templates/cover')
const { renderTermsPage } = require('./templates/terms')
const client = require('./sanity-client')
const { PRODUCER_QUERY, ALL_PRODUCERS_QUERY, PORTFOLIO_SETTINGS_QUERY } = require('./queries')

async function buildPortfolioHtml(priceType) {
  const settings = await client.fetch(PORTFOLIO_SETTINGS_QUERY)
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

  // Cover is page 1, index pages follow, producers start after those
  producersWithVisibleWines.forEach((p, i) => { p.pageNumber = 1 + numberOfIndexPages + 1 + i })
  const totalPages = 1 + numberOfIndexPages + producersWithVisibleWines.length + 1 // cover + index + producers + terms

  let allPagesHtml = renderCoverPage(settings?.coverLabel)
  allPagesHtml += renderIndexPages(producersWithVisibleWines, totalPages)

  for (const p of producersWithVisibleWines) {
    const pageHtml = renderProducerPage({ ...p, totalPages }, priceType)
    allPagesHtml += pageHtml
  }

  allPagesHtml += renderTermsPage(totalPages, totalPages, priceType)

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
    margin: { top: '0mm', bottom: '15mm', left: '0mm', right: '0mm' },
  })

  await browser.close()
  fs.unlinkSync(tempPath)
  return pdfBuffer
}

module.exports = { buildPortfolioHtml, renderPortfolioPdf }