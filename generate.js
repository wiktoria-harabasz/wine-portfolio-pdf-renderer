const fs = require('fs')
const { renderTable } = require('./src/templates/producer')
const client = require('./src/sanity-client')
const { PRODUCER_QUERY } = require('./src/queries')

async function generate(producerId) {
  const producer = await client.fetch(PRODUCER_QUERY, { id: producerId })

  if (!producer) {
    console.error('No producer found for that ID')
    return
  }

  const tableHtml = renderTable(producer.wines)
  const template = fs.readFileSync('./src/producer-template.html', 'utf-8')
  const output = template
    .replace('<!-- WINE_TABLE -->', tableHtml)
    .replace('<!-- PRODUCER_TITLE -->', producer.title)

  fs.writeFileSync('./src/preview.html', output)
  console.log('Generated src/preview.html for', producer.title)
}

generate('YOUR_PRODUCER_DOCUMENT_ID')