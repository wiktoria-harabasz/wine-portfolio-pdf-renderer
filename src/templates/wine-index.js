const UNITS_PER_INDEX_PAGE = 38 // tune after a visual test — same scale as before, but now measured in weighted units, not raw rows
const WRAP_THRESHOLD = 34 // characters — tune based on your actual column width/font size

function estimateRowWeight(wine) {
  const text = `${wine.wineName}${wine.vintage ? ' ' + wine.vintage : ''}`
  return text.length > WRAP_THRESHOLD ? 2 : 1
}

function chunkWinesIntoPages(wines, unitsPerPage = UNITS_PER_INDEX_PAGE) {
  const pages = []
  let currentPage = []
  let currentUnits = 0

  wines.forEach(w => {
    const weight = estimateRowWeight(w)
    if (currentUnits + weight > unitsPerPage && currentPage.length > 0) {
      pages.push(currentPage)
      currentPage = []
      currentUnits = 0
    }
    currentPage.push(w)
    currentUnits += weight
  })

  if (currentPage.length) pages.push(currentPage)
  return pages
}

// Builds display rows for ONE page at a time — tracking resets per page,
// so the first row of every page always shows full Country/Region/Producer context
function buildRowsForPage(wines) {
  const rows = []
  let lastCountry = null
  let lastRegion = null
  let lastProducer = null

  wines.forEach(w => {
    const country = w.country
    const region = w.region || 'Other'
    const producer = w.producerName
    const isNewCountry = country !== lastCountry
    const isNewRegion = isNewCountry || region !== lastRegion
    const isNewProducer = isNewRegion || producer !== lastProducer

    rows.push({
      country: isNewCountry ? country : '',
      region: isNewRegion ? region : '',
      producer: isNewProducer ? producer : '',
      wine: w,
    })

    lastCountry = country
    lastRegion = region
    lastProducer = producer
  })

  return rows
}


function renderWineIndexPages(wines) {
  const pageChunks = chunkWinesIntoPages(wines)

  // Record which index page each wine ended up on, keyed by wine _id
  const wineToIndexPage = {}
  pageChunks.forEach((chunkWines, i) => {
    chunkWines.forEach(w => { wineToIndexPage[w._id] = i + 1 })
  })

  const html = pageChunks.map((chunkWines, i) => {
    const pageRows = buildRowsForPage(chunkWines)
    return `
      <div class="page bg-champagne p-8 font-body" id="index-page-${i + 1}">
        ${i === 0 ? '<h1 class="font-semibold text-h1 mb-8">Wine Database</h1>' : ''}
        <div class="index-grid-wines">
          ${renderIndexHeader()}
          ${pageRows.map(renderIndexRow).join('')}
        </div>
      </div>
    `
  }).join('')

  return { html, wineToIndexPage }
}

function renderIndexRow(row) {
  const w = row.wine
  return `
    <a href="#wine-${w.slug}" class="index-row">
      <div class="index-cell-country text-sm font-semibold ">${row.country}</div>
      <div class="index-cell-region text-sm font-semibold">${row.region}</div>
      <div class="index-cell-producer text-sm font-semibold">${row.producer}</div>
      <div class="flex flex-row justify-between items-start px-2">
        <div class="flex flex-row gap-2 items-start mr-8">
          <div class="producer-inner-number font-semibold">(${String(row.wine.wineNumber).padStart(2, '0')})</div>
          <div class="font-semibold text-sm text-off-black ">${w.wineName}${w.vintage ? ' ' + w.vintage : ''}</div>
        </div>
        <div class="index-page-number text-muted text-sm">${String(w.pageNumber).padStart(2, '0')}</div>
      </div>
    </a>
  `
}

function renderIndexHeader() {
  return `
    <div class="index-header-row">
      <span>Country</span>
      <span>Region</span>
      <span>Producer</span>
      <span>Wine</span>
    </div>
  `
}


function countIndexPages(wines, unitsPerPage = UNITS_PER_INDEX_PAGE) {
  return chunkWinesIntoPages(wines, unitsPerPage).length
}

module.exports = { renderWineIndexPages, countIndexPages }