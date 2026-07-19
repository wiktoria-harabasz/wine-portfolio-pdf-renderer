const fs = require('fs')
const { renderTable } = require('./src/templates/producer')
const client = require('./src/sanity-client')
const { PRODUCER_QUERY } = require('./src/queries')
const puppeteer = require('puppeteer')
const path = require('path')

async function generate(producerId) {
  const producer = await client.fetch(PRODUCER_QUERY, { id: producerId })

  if (!producer) {
    console.error('No producer found for that ID')
    return
  }

  const tableHtml = renderTable(producer.wines)
  const template = fs.readFileSync('./src/producer-template.html', 'utf-8')
  const output = template
    .replace('<!-- PRODUCER_NAME -->', producer.producerName )
    .replace('<!-- PRODUCER_COUNTRY -->', producer.country || '')
    .replace('<!-- PRODUCER_REGION -->', producer.region?.name || '')
    .replace('<!-- PRODUCER_SUBREGION -->', producer.subregion?.map(s => s.name).join(', ') || '')
    .replace('<!-- PRODUCER_MAP -->', producer.mapImageUrl || '')
    .replace('<!-- PRODUCER_INFO -->', producer.producerInfo || '')
    .replace('<!-- WINE_TABLE -->', tableHtml)

  fs.writeFileSync('./src/preview.html', output)
  console.log('Generated src/preview.html for', producer.producerName)

   // --- PDF export ---
   if (!fs.existsSync('output')) fs.mkdirSync('output')
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  const htmlPath = path.resolve(__dirname, 'src/preview.html')
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' })

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