// Test before sending to Pupeeter
const fs = require('fs')
const { buildPortfolioHtml } = require('./src/render-portfolio')

async function debug() {
  const priceType = process.argv[2] || 'private' // pass 'horeca' as an argument to test that version
  const html = await buildPortfolioHtml(priceType)
  fs.writeFileSync('./src/debug-preview.html', html)
  console.log(`Wrote src/debug-preview.html for priceType=${priceType}`)
}

debug()