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
    .replace('<!-- PRODUCER_TITLE -->', producer.producerName )

  fs.writeFileSync('./src/preview.html', output)
  console.log('Generated src/preview.html for', producer.producerName)
}

generate('52b54374-90ad-4548-9741-490abba77cc7')