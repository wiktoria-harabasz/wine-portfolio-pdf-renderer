const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const { renderWineSpecPage, getImageAsDataUri } = require('./templates/wine-spec')
const { renderWineIndexPages, countIndexPages } = require('./templates/wine-index')
const client = require('./sanity-client')
const { ALL_WINES_QUERY, WINE_SPEC_QUERY } = require('./queries')





async function buildWineDatabaseHtml() {
  const wines = await client.fetch(ALL_WINES_QUERY)

  wines.forEach((w, i) => { w.wineNumber = i + 1 })
const numberOfIndexPages = countIndexPages(wines)
wines.forEach((w, i) => { w.pageNumber = numberOfIndexPages + 1 + i })
const totalPages = numberOfIndexPages + wines.length

const fullWines = await Promise.all(
  wines.map(w => client.fetch(WINE_SPEC_QUERY, { id: w._id }))
)

const bottleImageDataUris = await Promise.all(
  fullWines.map(full => getImageAsDataUri(full.bottleImageUrl))
)

const { html: indexHtml, wineToIndexPage } = renderWineIndexPages(wines)

let allPagesHtml = indexHtml

for (let i = 0; i < fullWines.length; i++) {
  const full = fullWines[i]
  const w = wines[i]
  const pageHtml = await renderWineSpecPage({
    ...full,
    slug: w.slug,
    pageNumber: w.pageNumber,
    totalPages,
    wineNumber: w.wineNumber,
    bottleImageDataUri: bottleImageDataUris[i],
    backToIndexAnchor: `index-page-${wineToIndexPage[w._id]}`,
  })
  allPagesHtml += pageHtml
}

  const shell = fs.readFileSync(path.join(__dirname, 'portfolio-shell.html'), 'utf-8')
  return shell.replace('{{CONTENT}}', allPagesHtml)
}

async function renderWineDatabasePdf() {
  const html = await buildWineDatabaseHtml()
  const tempPath = path.join(__dirname, '_temp-winedb.html')
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

module.exports = { buildWineDatabaseHtml, renderWineDatabasePdf }