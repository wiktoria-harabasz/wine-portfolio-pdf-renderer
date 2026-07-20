// src/templates/producer.js
const fs = require('fs')

const ALL_COLUMNS = [
    { key: 'wineType', label: '' },
    { key: 'vintage', label: 'Vint.' },
    { key: 'wineName', label: 'Name' },
    { key: 'grapeVariety', label: 'Grape Variety' },
    { key: 'classification', label: 'Classification' },
    { key: 'dosage', label: 'Dosage' },
    { key: 'sugar', label: 'Sugar' },
    { key: 'degorgement', label: 'Degorgement' },
    { key: 'base', label: 'Base' },
    { key: 'isSansSulfite', label: '' }, // boolean, show "sans sulfite" if true
    { key: 'isAllocationOnly', label: '' }, // boolean, show "Allocation Only!" if true
    { key: 'bottleSize', label: '' }, // Magnum or 0.375L
    { key: 'price', label: 'Price' },
    
]

function hasValue(val) {
    if (val == undefined || val == null || val == '') return false
    if (Array.isArray(val) && val.length == 0) return false
    if (typeof val == 'boolean') return val == true
    return true
}

const COLUMN_VALUE_GETTERS = {
    bottleSize: (wine) => wine.isSmallBottle || wine.isMagnumBottle,
  }

  function getVisibleColumns(wines) {
    return ALL_COLUMNS.filter(col => {
      const getValue = COLUMN_VALUE_GETTERS[col.key] || (wine => wine[col.key])
      return wines.some(wine => hasValue(getValue(wine)))
    })
  }

const WINE_TYPE_ICONS = {
    white: 'assets/icons/white.svg',
    macerated: 'assets/icons/macerated.svg',
    rose: 'assets/icons/rose.svg',
    red: 'assets/icons/red.svg',

}

function renderWineTypeCell(wine) {
    const iconPath = WINE_TYPE_ICONS[wine.wineType]
    const colorIcon = iconPath
    ? `<img src="${iconPath}" alt="${wine.wineType}" class="w-3 h-3" />`
    : ''

    const sparklingIcon = wine.isSparkling
    ? '<img src="assets/icons/sparkling.svg" alt="sparkling" class="w-3" />'
    : ''

    const fortifiedMark = wine.isFortified
    ? '<span class="text-[10px] leading-none font-bold">%</span>'
    : ''

    return `<div class="flex items-center gap-1">${colorIcon}${sparklingIcon}${fortifiedMark}</div>`
}



function renderCell(wine, key) {
    const soldOut = wine.isSoldOut
    const strikeClass = soldOut ? `line-through opacity-50` : ''

    if (key === 'wineType') {
        
            return renderWineTypeCell(wine)
    }

    if (key === 'grapeVariety') {
        const value = Array.isArray(wine.grapeVariety)
        ? wine.grapeVariety.map(g => g.name).join ('<br>')
        : wine.grapeVariety
        return `<span class="${strikeClass}">${value ?? ''}</span>`
    }

    if (key === 'isSansSulfite') {
        return wine.isSansSulfite 
        ? `<span class="${strikeClass} whitespace-nowrap">Sans Sulfite</span>`
        : ''
    }

    if (key === 'isAllocationOnly') {
        return wine.isAllocationOnly 
        ? `<span class="${strikeClass} whitespace-nowrap">Allocation only!</span>`
        : ''
    }

    if (key === 'bottleSize') {
       if (wine.isMagnumBottle) return '1.5L'
        if (wine.isSmallBottle) return '1/2'
        return ''
    }

    if (key === 'wineName') {
        let statusHtml = ''
        if (soldOut) {
            statusHtml = `<span class="text-red-600 font-bold ml-2">SOLD OUT!</span>`
        } else if (wine.isNew) {
            statusHtml = `<div class="text-green-600 text-xs font-bold">New!</div>`
        } else if (wine.isBackInStock) {
            statusHtml = `<div class="text-green-600 text-xs font-bold">Back in Stock!</div>`
        }
    
        const subNameHtml = wine.wineSubName
            ? `<div class="text-xs text-muted ${strikeClass}">${wine.wineSubName}</div>`
            : ''
    
        return `<span class="font-bold ${strikeClass}">${wine.wineName}</span>${statusHtml}${subNameHtml}`
    }

    if (key === 'price') {
        return `<span class="font-bold ${strikeClass}">${wine.price} PLN</span>`
    }

      return `<span class="${strikeClass}">${wine[key] ?? ''}</span>`
}


function renderTable (wines) {
    const columns = getVisibleColumns(wines)

    const headerHtml = columns
    .map(col => `<th class="text-left font-semibold px-2 py-1 border-r border-off-black bg-red-500 last:border-r-0">${col.label}</th>`)
    .join('')

    const rowsHtml = wines 
    .map(wine => {
        const cellsHtml = columns
        .map(col => `<td class="px-2 py-1 align-top border-r border-off-black bg-yellow-500 last:border-r-0">${renderCell(wine, col.key)}</td>`)
        .join('')
    return `<tr class="bg-green-500 border-t border-solid border-off-black">${cellsHtml}</tr>`

    })
    .join('')

    return `
    <table class="w-full border-collapse font-body text-sm">
      <thead>
        <tr class="text-muted uppercase text-xs">${headerHtml}</tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `

}

function renderProducerPage(producer) {
    const tableHtml = renderTable(producer.wines)
    const template = fs.readFileSync('./src/producer-template.html', 'utf-8')
    return template
      .replace('<!-- PRODUCER_NAME -->', producer.producerName)
      .replace('<!-- PRODUCER_SLUG -->', producer.slug || producer._id)
      .replace('<!-- PRODUCER_COUNTRY -->', producer.country || '')
      .replace('<!-- PRODUCER_REGION -->', producer.region?.name || '')
      .replace('<!-- PRODUCER_SUBREGION -->', producer.subregion?.map(s => s.name).join(', ') || '')
      .replace('<!-- PRODUCER_MAP -->', producer.mapImageUrl || '')
      .replace('<!-- PRODUCER_INFO -->', producer.producerInfo || '')
      .replace('<!-- WINE_TABLE -->', tableHtml)
      .replace('<!-- PRODUCER_PAGE_NUMBER -->', producer.pageNumber)
        .replace('<!-- PRODUCER_TOTAL_PAGES -->', producer.totalPages)
  }

module.exports = { renderTable, renderProducerPage }