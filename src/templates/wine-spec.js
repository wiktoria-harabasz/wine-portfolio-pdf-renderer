const fs = require('fs')
const { renderWineTypeCell } = require('./producer')

function renderWineSpecPage(wine) {
  const template = fs.readFileSync('./src/wine-spec-template.html', 'utf-8')
  const typeIconHtml = renderWineTypeCell(wine)

  return template
    .replace('<!-- WINE_SLUG -->', wine.slug || wine._id)
    .replace('<!-- WINE_TYPE_ICON -->', typeIconHtml)
    .replace('<!-- WINE_NAME -->', wine.wineName)
    .replace('<!-- WINE_SUBNAME -->', wine.wineSubName ? `<div class="text-h3 text-muted">${wine.wineSubName}</div>` : '')
    .replace('<!-- VINTAGE -->', wine.vintage || '')
    .replace('<!-- PRODUCER_NAME -->', wine.producerName || '')
    .replace('<!-- COUNTRY -->', wine.country || '')
    .replace('<!-- REGION -->', wine.region || '')
    .replace('<!-- SUBREGION -->', Array.isArray(wine.subregion) ? wine.subregion.join(', ') : '')
    .replace('<!-- GRAPE_VARIETY -->', Array.isArray(wine.grapeVariety) ? wine.grapeVariety.map(g => g.name).join(', ') : '')
    .replace('<!-- BOTTLE_IMAGE -->', wine.bottleImageUrl || '')
    .replace('<!-- VINTAGE_REPORT -->', wine.vintageReport || '')
    .replace('<!-- TERROIR -->', wine.terroir || '')
    .replace('<!-- WINEMAKING -->', wine.winemaking || '')
    .replace('<!-- TASTING_NOTES -->', wine.tastingNotes || '')
    .replace('<!-- WINE_PAGE_NUMBER -->', wine.pageNumber)
    .replace('<!-- WINE_TOTAL_PAGES -->', wine.totalPages)
}

module.exports = { renderWineSpecPage }