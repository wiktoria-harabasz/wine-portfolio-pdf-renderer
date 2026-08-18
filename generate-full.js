const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const { renderProducerPage } = require('./src/templates/producer')
const { renderIndexPage } = require('./src/templates/index')
const client = require('./src/sanity-client')
const { PRODUCER_QUERY, ALL_PRODUCERS_QUERY } = require('./src/queries')

async function generateFullPortfolio(priceType) {
    const producers = await client.fetch(ALL_PRODUCERS_QUERY)
    const producersWithPageNumbers = producers.map((p, i) => ({ ...p, pageNumber: i + 2, producerNumber: i + 1 }))
    const totalPages = producers.length + 1
  
    let allPagesHtml = renderIndexPage(producersWithPageNumbers, totalPages)
  
    for (const p of producersWithPageNumbers) {
      const full = await client.fetch(PRODUCER_QUERY, { id: p._id })
      const pageHtml = renderProducerPage({ ...full, slug: p.slug, pageNumber: p.pageNumber, totalPages, producerNumber: p.producerNumber }, priceType)
      allPagesHtml += pageHtml
    }
  
    const shell = fs.readFileSync('./src/portfolio-shell.html', 'utf-8')
    const finalHtml = shell.replace('{{CONTENT}}', allPagesHtml)
  
    const outputHtmlPath = `./src/full-portfolio-${priceType}.html`
    fs.writeFileSync(`./src/full-portfolio-${priceType}.html`, finalHtml)
    console.log(`Built ${outputHtmlPath} with ${producers.length} producers`)
  
    if (!fs.existsSync('output')) fs.mkdirSync('output')
  
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(`file://${path.resolve(__dirname, outputHtmlPath)}`, { waitUntil: 'networkidle0' })
    await page.emulateMediaType('print')
  
    await page.pdf({
      path: `output/full-portfolio-${priceType}.pdf`,
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
    console.log(`PDF exported to output/full-portfolio-${priceType}.pdf`)
  }
  
  async function generateBoth() {
    await generateFullPortfolio('b2c')
    await generateFullPortfolio('horeca')
  }

  
  
  generateBoth()