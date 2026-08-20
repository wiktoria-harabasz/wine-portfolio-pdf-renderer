const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const { renderWineSpecPage } = require('./templates/wine-spec')
const { renderWineIndexPage } = require('./templates/wine-index')
const client = require('./sanity-client')
const { ALL_WINES_QUERY, WINE_SPEC_QUERY } = require('./queries')

async function buildWineDatabaseHtml() {
  const wines = await client.fetch(ALL_WINES_QUERY)
  const winesWithPageNumbers = wines.map((w, i) => ({ ...w, pageNumber: i + 2 }))
  const totalPages = wines.length + 1

  let allPagesHtml = renderWineIndexPage(winesWithPageNumbers)

  for (const w of winesWithPageNumbers) {
    const full = await client.fetch(WINE_SPEC_QUERY, { id: w._id })
    const pageHtml = renderWineSpecPage({ ...full, slug: w.slug, pageNumber: w.pageNumber, totalPages })
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

module.exports = { buildWineDatabaseHtml, renderWineDatabasePdf }