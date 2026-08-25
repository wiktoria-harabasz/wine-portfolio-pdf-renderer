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
    price: (wine) => wine.pricePrivate || wine.priceHoreca,
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
    ? `<img src="${iconPath}" alt="${wine.wineType}" class="w-[11px] h-[11px]" />`
    : ''

    const sparklingIcon = wine.isSparkling
    ? '<img src="assets/icons/sparkling.svg" alt="sparkling" class="w-[10px] h-[10px]" />'
    : ''

    const fortifiedMark = wine.isFortified
    ? '<span class="text-[10px] leading-none font-bold">%</span>'
    : ''

    let bottleSizeIcon = ''
    if (wine.isMagnumBottle) {
        bottleSizeIcon = '<span class="text-[10px] font-semibold">1.5L</span>'
    } else if (wine.isSmallBottle) {
        bottleSizeIcon = '<span class="text-[10px] font-semibold">1/2</span>'
    }

    return `<div class="flex items-center gap-2">${colorIcon}${sparklingIcon}${fortifiedMark}</div>`
}



function renderCell(wine, key, priceType) {
    const portfolioSoldOut = priceType === 'horeca' ? wine.isSoldOutHoreca : wine.isSoldOutPrivate
    const soldOut = wine.isSoldOut || portfolioSoldOut
    const strikeClass = soldOut ? `line-through text-muted` : ''

    if (key === 'price') {
        const value = priceType === 'horeca' ? wine.priceHoreca : wine.pricePrivate
        if (!value) return ''
        return `<span class="font-semibold ${strikeClass}">${value} PLN</span>`
    }

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



    if (key === 'wineName') {
        let statusHtml = ''
        if (soldOut) {
            statusHtml = `<span class="inline-flex text-status-soldout text-[10px] font-semibold">SOLD OUT!</span>`
        } else if (wine.isNew) {
            statusHtml = `<div class="inline-flex text-status-new text-[10px] font-semibold">NEW!</div>`
        } else if (wine.isBackInStock) {
            statusHtml = `<div class="inline-flex text-status-backinstock text-[10px] font-semibold">BACK IN STOCK!</div>`
        }
    
        const subNameHtml = wine.wineSubName
            ? `<div class="text-xs flex text-off-black ${strikeClass}">${wine.wineSubName}</div>`
            : ''
    
        return `<span class="font-semibold mr-1 ${strikeClass}">${wine.wineName}</span>${statusHtml}${subNameHtml}`
    }

    if (key === 'price') {
        const value = priceType === 'horeca' ? wine.priceHoreca : wine.pricePrivate
        if (!value) return ''
        return `<span class="font-semibold text-nowrap ${strikeClass}">${value} PLN</span>`
    }

    if (key === 'sugar') {
        return wine.sugar
            ? `<span class=" ${strikeClass}">${wine.sugar} g/l</span>`
            : ''
    }

      return `<span class="${strikeClass}">${wine[key] ?? ''}</span>`
}


function renderTable (wines, priceType) {
    const columns = getVisibleColumns(wines)

    const headerHtml = columns
    .map(col => `<th class="text-left font-semibold text-nowrap text-off-black">${
      col.label ? `<span class="flex rounded-sm bg-off-black text-champagne px-2 py-0.5">${col.label}</span>` : ''
    }</th>`)
    .join('')

  const rowsHtml = wines
    .map(wine => {
      const cellsHtml = columns
        .map(col => `<td class="px-2 py-2 align-top border-off-black first:pl-0">${renderCell(wine, col.key, priceType)}</td>`)
        .join('')
      return `<tr class="border-t border-ink/10">${cellsHtml}</tr>`
    })
    .join('')


    return `
    <table class="w-full border-collapse font-body text-xs">
      <thead>
        <tr class="text-muted uppercase text-xs">${headerHtml}</tr>
      </thead>
      <tbody>${rowsHtml}</tbody>
    </table>
  `

}

function renderProducerPage(producer, priceType) {
    const tableHtml = renderTable(producer.wines, priceType)
    const template = fs.readFileSync('./src/producer-template.html', 'utf-8')
    const subregionHtml = producer.subregion?.length
    ? producer.subregion.map(s => `<div class="flex items-center text-h3 flex-row gap-2"><img src="/img/star_icon.svg" class="w-4 h-4" />${s.name}</div>`).join('')
    : ''
    return template
      .replace('<!-- PRODUCER_NAME -->', producer.producerName)
      .replace('<!-- PRODUCER_SLUG -->', producer.slug || producer._id)
      .replace('<!-- PRODUCER_COUNTRY -->', producer.country || '')
      .replace('<!-- PRODUCER_REGION -->', producer.region?.name || '')
      .replace('<!-- PRODUCER_SUBREGION -->', subregionHtml)
      .replace('<!-- PRODUCER_MAP -->', producer.mapImageUrl || '')
      .replace('<!-- PRODUCER_INFO -->', producer.producerInfo || '')
      .replace('<!-- WINE_TABLE -->', tableHtml)
      .replace('<!-- PRODUCER_PAGE_NUMBER -->', producer.pageNumber)
    .replace('<!-- PRODUCER_TOTAL_PAGES -->', producer.totalPages)
    .replace('<!-- PRODUCER_NUMBER -->', String(producer.producerNumber).padStart(2, '0'))
  }

module.exports = { renderTable, renderProducerPage, renderWineTypeCell }