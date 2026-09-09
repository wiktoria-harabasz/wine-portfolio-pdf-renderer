const fs = require('fs')
const { buildWineDatabaseHtml } = require('./src/render-winedb')

async function debug() {
  const html = await buildWineDatabaseHtml()
  fs.writeFileSync('./src/debug-winedb-preview.html', html)
  console.log('Wrote src/debug-winedb-preview.html')
}

debug()