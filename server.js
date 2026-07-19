const express = require('express')
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer')
const cors = require('cors')
const { renderTable } = require('./src/templates/producer')
const client = require('./src/sanity-client')
const { PRODUCER_QUERY } = require('./src/queries')

const app = express()
app.use(cors())

app.get('/export/:producerId', async (req, res) => {
  try {
    const producer = await client.fetch(PRODUCER_QUERY, { id: req.params.producerId })
    if (!producer) return res.status(404).send('Producer not found')

    const tableHtml = renderTable(producer.wines)
    const template = fs.readFileSync('./src/producer-template.html', 'utf-8')
    const output = template
      .replace('<!-- PRODUCER_NAME -->', producer.producerName)
      .replace('<!-- PRODUCER_COUNTRY -->', producer.country || '')
      .replace('<!-- PRODUCER_REGION -->', producer.region?.name || '')
      .replace('<!-- PRODUCER_SUBREGION -->', producer.subregion?.map(s => s.name).join(', ') || '')
      .replace('<!-- PRODUCER_MAP -->', producer.mapImageUrl || '')
      .replace('<!-- PRODUCER_INFO -->', producer.producerInfo || '')
      .replace('<!-- WINE_TABLE -->', tableHtml)

    const tempHtmlPath = path.resolve(__dirname, 'src/_export-temp.html')
    fs.writeFileSync(tempHtmlPath, output)

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] }) // --no-sandbox needed on most hosting providers
    const page = await browser.newPage()
    await page.goto(`file://${tempHtmlPath}`, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
    })
    await browser.close()

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${producer.producerName.replace(/\s+/g, '-')}.pdf"`,
    })
    res.send(pdfBuffer)
  } catch (err) {
    console.error(err)
    res.status(500).send('Export failed')
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Export server running on port ${PORT}`))