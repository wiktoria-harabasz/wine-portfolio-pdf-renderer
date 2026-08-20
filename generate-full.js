const fs = require('fs')
const { renderPortfolioPdf } = require('./src/render-portfolio')

async function generateBoth() {
  for (const priceType of ['private', 'horeca']) {
    const pdfBuffer = await renderPortfolioPdf(priceType)
    if (!fs.existsSync('output')) fs.mkdirSync('output')
    fs.writeFileSync(`output/full-portfolio-${priceType}.pdf`, pdfBuffer)
    console.log(`PDF exported to output/full-portfolio-${priceType}.pdf`)
  }
}

generateBoth()