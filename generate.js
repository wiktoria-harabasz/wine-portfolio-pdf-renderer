const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const { renderProducerPage } = require('./src/templates/producer')
const client = require('./src/sanity-client')
const { PRODUCER_QUERY } = require('./src/queries')

async function generate(producerId) {
  const producer = await client.fetch(PRODUCER_QUERY, { id: producerId })

  if (!producer) {
    console.error('No producer found for that ID')
    return
  }

  const pageHtml = renderProducerPage(producer)
  const shell = fs.readFileSync('./src/portfolio-shell.html', 'utf-8')
  const output = shell.replace('{{CONTENT}}', pageHtml)

  fs.writeFileSync('./src/preview.html', output)
  console.log('Generated src/preview.html for', producer.producerName)

  // --- PDF export ---
  if (!fs.existsSync('output')) fs.mkdirSync('output')

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const htmlPath = path.resolve(__dirname, 'src/preview.html')
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' })
  await page.emulateMediaType('print')

  const pdfPath = `output/${producer.producerName.replace(/\s+/g, '-')}.pdf`
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
  })

  await browser.close()
  console.log('PDF exported to', pdfPath)
}

generate('2335b2fa-554d-4497-b253-1dec7d033c9f')
// generate('52b54374-90ad-4548-9741-490abba77cc7')
