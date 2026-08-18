const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const { renderWineSpecPage } = require('./src/templates/wine-spec')
const { renderWineIndexPage } = require('./src/templates/wine-index')
const client = require('./src/sanity-client')
const { ALL_WINES_QUERY, WINE_SPEC_QUERY } = require('./src/queries')

async function generateWineDatabase() {
  const wines = await client.fetch(ALL_WINES_QUERY)

  const winesWithPageNumbers = wines.map((w, i) => ({ ...w, pageNumber: i + 2 }))
  const totalPages = wines.length + 1

  let allPagesHtml = renderWineIndexPage(winesWithPageNumbers)

  for (const w of winesWithPageNumbers) {
    const full = await client.fetch(WINE_SPEC_QUERY, { id: w._id })
    const pageHtml = renderWineSpecPage({ ...full, slug: w.slug, pageNumber: w.pageNumber, totalPages })
    allPagesHtml += pageHtml
  }

  const shell = fs.readFileSync('./src/portfolio-shell.html', 'utf-8')
  const finalHtml = shell.replace('{{CONTENT}}', allPagesHtml)

  fs.writeFileSync('./src/wine-database.html', finalHtml)
  console.log(`Built wine-database.html with ${wines.length} wines`)

  if (!fs.existsSync('output')) fs.mkdirSync('output')

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(`file://${path.resolve(__dirname, 'src/wine-database.html')}`, { waitUntil: 'networkidle0' })
  await page.emulateMediaType('print')

  await page.pdf({
    path: 'output/wine-database.pdf',
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
  console.log('PDF exported to output/wine-database.pdf')
}

generateWineDatabase()