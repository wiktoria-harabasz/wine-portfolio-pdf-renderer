const fs = require('fs')
const { renderWineDatabasePdf } = require('./src/render-winedb')

async function generate() {
  const pdfBuffer = await renderWineDatabasePdf()
  if (!fs.existsSync('output')) fs.mkdirSync('output')
  fs.writeFileSync('output/wine-database.pdf', pdfBuffer)
  console.log('PDF exported to output/wine-database.pdf')
}

generate()