
const fs = require('fs')
const path = require('path')
const { renderWineTypeCell } = require('./producer')

const CACHE_PATH = path.join(__dirname, '../_bottle-image-cache.json')

function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'))
  } catch {
    return {}
  }
}

function saveCache(cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache))
}

async function getImageAsDataUri(url) {
  if (!url) return ''
  const cache = loadCache()
  if (cache[url]) return cache[url] // skip the network entirely if we've already fetched this exact URL

  try {
    const res = await fetch(url)
    const buffer = Buffer.from(await res.arrayBuffer())
    const contentType = res.headers.get('content-type') || 'image/png'
    const dataUri = `data:${contentType};base64,${buffer.toString('base64')}`

    cache[url] = dataUri
    saveCache(cache)

    return dataUri
  } catch (err) {
    console.error('Failed to fetch bottle image for data URI:', err)
    return url
  }
}

const WINE_DETAIL_FIELDS = [
  { key: 'classification', label: 'Classification' },
  { key: 'dosage', label: 'Dosage' },
  { key: 'sugar', label: 'Sugar', suffix: ' g/l' },
  { key: 'degorgement', label: 'Degorgement' },
  { key: 'base', label: 'Base' },
  { key: 'bottled', label: 'Bottled' },
]

function hasValue(val) {
  if (val === undefined || val === null || val === '') return false
  if (Array.isArray(val) && val.length === 0) return false
  return true
}

function renderWineDetails(wine) {
  return WINE_DETAIL_FIELDS
    .filter(field => hasValue(wine[field.key]))
    .map(field => `
      <div class="flex flex-col gap-1">
        <div class="text-off-black text-sm font-semibold">${field.label}</div>
        <div class="text-off-black text-sm capitalize">${wine[field.key]}${field.suffix || ''}</div>
      </div>
    `)
    .join('')
}

function renderBooleanLabels(wine) {
  const labels = []
  if (wine.isSparkling) labels.push('Sparkling')
  if (wine.isFortified) labels.push('Fortified')
  if (wine.isSansSulfite) labels.push('Sans Sulfite')
  if (wine.isMagnumBottle) labels.push('Magnum')
  if (wine.isSmallBottle) labels.push('0.375L')
  return labels.join(' · ')
}

async function renderWineSpecPage(wine) {
  const template = fs.readFileSync('./src/wine-spec-template.html', 'utf-8')
  const typeIconHtml = renderWineTypeCell(wine)
  const subregionHtml = wine.subregion?.length
    ? wine.subregion.map(s => `<div class="text-sm font-semibold">${s}</div>`).join('')
    : ''

  return template
    .replace('<!-- WINE_SLUG -->', wine.slug || wine._id)
    .replace('<!-- WINE_DETAILS -->', renderWineDetails(wine))
    .replace('<!-- BACK_TO_INDEX_ANCHOR -->', wine.backToIndexAnchor || 'index-page-1')
    .replace('<!-- WINE_NUMBER -->', String(wine.wineNumber).padStart(2, '0'))
    .replace('<!-- WINE_TYPE_ICON -->', typeIconHtml)
    .replace('<!-- WINE_TYPE -->', wine.wineType || '')
    .replace('<!-- WINE_ATTRIBUTES -->', renderBooleanLabels(wine))
    .replace('<!-- WINE_NAME -->', wine.wineName)
    .replace('<!-- WINE_SUBNAME -->', wine.wineSubName ? `${wine.wineSubName}` : '')
    .replace('<!-- VINTAGE -->', wine.vintage || '')
    .replace('<!-- PRODUCER_NAME -->', wine.producerName || '')
    .replace('<!-- COUNTRY -->', wine.country || '')
    .replace('<!-- REGION -->', wine.region || '')
    .replace('<!-- SUBREGION -->', subregionHtml)
    .replace('<!-- GRAPE_VARIETY -->', Array.isArray(wine.grapeVariety)
      ? wine.grapeVariety.map(g => `<span class="grape-variety-item">${g.name}</span>`).join('')
      : '')
    .replace(/<!-- BOTTLE_IMAGE -->/g, wine.bottleImageDataUri || '')
    .replace('<!-- VINTAGE_REPORT -->', wine.vintageReport || '')
    .replace('<!-- TERROIR -->', wine.terroir || '')
    .replace('<!-- WINEMAKING -->', wine.wineMaking || '')
    .replace('<!-- TASTING_NOTES -->', wine.tastingNotes || '')
    .replace('<!-- WINE_PAGE_NUMBER -->', wine.pageNumber)
    .replace('<!-- WINE_TOTAL_PAGES -->', wine.totalPages)
}

module.exports = { renderWineSpecPage, getImageAsDataUri }