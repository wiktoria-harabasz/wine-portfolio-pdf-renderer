// src/templates/wine-index.js

function groupByCountryRegionProducer(wines) {
    const grouped = {}
    wines.forEach(w => {
      const country = w.country
      const region = w.region || 'Other'
      const producer = w.producerName
      if (!grouped[country]) grouped[country] = {}
      if (!grouped[country][region]) grouped[country][region] = {}
      if (!grouped[country][region][producer]) grouped[country][region][producer] = []
      grouped[country][region][producer].push(w)
    })
    return grouped
  }
  
  function buildIndexRows(grouped) {
    const rows = []
    Object.entries(grouped).forEach(([country, regions]) => {
      let isFirstInCountry = true
      Object.entries(regions).forEach(([region, producers]) => {
        let isFirstInRegion = true
        Object.entries(producers).forEach(([producer, wines]) => {
          let isFirstInProducer = true
          wines.forEach(w => {
            rows.push({
              country: isFirstInCountry ? country : '',
              region: isFirstInRegion ? region : '',
              producer: isFirstInProducer ? producer : '',
              wineName: w.wineName,
              vintage: w.vintage,
              slug: w.slug,
              pageNumber: w.pageNumber,
            })
            isFirstInCountry = false
            isFirstInRegion = false
            isFirstInProducer = false
          })
        })
      })
    })
    return rows
  }
  
  function renderWineIndexRow(row) {
    return `
      <a href="#wine-${row.slug}" class="index-row">
        <span class="index-cell-country capitalize">${row.country}</span>
        <span class="index-cell-region capitalize">${row.region ? '// ' + row.region : ''}</span>
        <span class="index-cell-producer uppercase font-semibold">${row.producer}</span>
        <span class="index-cell-wine">${row.wineName}${row.vintage ? ' ' + row.vintage : ''}</span>
        <span class="index-cell-page text-muted text-sm">${row.pageNumber}</span>
      </a>
    `
  }
  
  function renderWineIndexPage(wines) {
    const grouped = groupByCountryRegionProducer(wines)
    const rows = buildIndexRows(grouped)
    const rowsHtml = rows.map(renderWineIndexRow).join('')
  
    return `
      <div class="page bg-champagne px-16 py-12 font-body" id="index">
        <h1 class="font-semibold uppercase text-h1 mb-8">Wine Database</h1>
        <div class="index-grid-wines">
          ${rowsHtml}
        </div>
      </div>
    `
  }
  
  module.exports = { renderWineIndexPage }