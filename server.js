const express = require('express')
const cors = require('cors')
const { renderPortfolioPdf } = require('./src/render-portfolio')

const app = express()
app.use(cors())

app.get('/export/full/:priceType', async (req, res) => {
  const { priceType } = req.params
  if (!['private', 'horeca'].includes(priceType)) {
    return res.status(400).send('Invalid price type')
  }
  try {
    const pdfBuffer = await renderPortfolioPdf(priceType)
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="wine-portfolio-${priceType}.pdf"`,
    })
    res.send(pdfBuffer)
  } catch (err) {
    console.error(err)
    res.status(500).send('Export failed')
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Export server running on port ${PORT}`))