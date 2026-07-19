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
    .replace('<!-- PRODUCER_NAME -->', producer.producerName )
    .replace('<!-- PRODUCER_COUNTRY -->', producer.country || '')
    .replace('<!-- PRODUCER_REGION -->', producer.region?.name || '')
    .replace('<!-- PRODUCER_SUBREGION -->', producer.subregion?.name || '')
    .replace('<!-- PRODUCER_MAP -->', producer.mapImageUrl || '')
    .replace('<!-- PRODUCER_INFO -->', producer.producerInfo || '')
    .replace('<!-- WINE_TABLE -->', tableHtml)

  fs.writeFileSync('./src/preview.html', output)
  console.log('Generated src/preview.html for', producer.producerName)
}

generate('2335b2fa-554d-4497-b253-1dec7d033c9f')