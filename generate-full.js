const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const { renderProducerPage } = require('./src/templates/producer')
const { renderIndexPage } = require('./src/templates/index')
const client = require('./src/sanity-client')
const { PRODUCER_QUERY, ALL_PRODUCERS_QUERY } = require('./src/queries')

async function generateFullPortfolio() {
    const producers = await client.fetch(ALL_PRODUCERS_QUERY)
  
    // Page 1 = index. Each producer gets the next page number, in order.
    const producersWithPageNumbers = producers.map((p, i) => ({ ...p, pageNumber: i + 2 }))
    const totalPages = producers.length + 1
  
    let allPagesHtml = renderIndexPage(producersWithPageNumbers, totalPages)
  
    for (const p of producersWithPageNumbers) {
      const full = await client.fetch(PRODUCER_QUERY, { id: p._id })
      const pageHtml = renderProducerPage({ ...full, slug: p.slug, pageNumber: p.pageNumber, totalPages })
      allPagesHtml += pageHtml
    }
  
    const shell = fs.readFileSync('./src/portfolio-shell.html', 'utf-8')
    const finalHtml = shell.replace('{{CONTENT}}', allPagesHtml)
  
    fs.writeFileSync('./src/full-portfolio.html', finalHtml)
    console.log(`Built full-portfolio.html with ${producers.length} producers`)
  
    if (!fs.existsSync('output')) fs.mkdirSync('output')
  
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(`file://${path.resolve(__dirname, 'src/full-portfolio.html')}`, { waitUntil: 'networkidle0' })
    await page.emulateMediaType('print')
  
    await page.pdf({
      path: 'output/full-portfolio.pdf',
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
    console.log('PDF exported to output/full-portfolio.pdf')
  }
  


generateFullPortfolio()