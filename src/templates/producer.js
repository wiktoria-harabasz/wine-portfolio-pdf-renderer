// src/templates/producer.js

const ALL_COLUMNS = [
    { key: 'wineType', label: '' },
    { key: 'vintage', label: 'Vint.' },
    { key: 'name', label: 'Name' },
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
    if (val == undefined || val == null || value == '') return false
    if (Array.isArray(val) && val.length == 0) return false
    if (typeof val == 'boolean') return val == true
    return true
}

function getVisibleColumns(wines) {
    return ALL_COLUMNS.filter(col =>
        wines.some(wine => hasValue(wine[col.key]))
    )
}

const WINE_TYPE_ICONS = [
    white: `<span class="inline-block w-3 h-3 rounded-full bg-wine-white"></span>`,
    macerated: `<span class="inline-block w-3 h-3 rounded-full bg-wine-macerated"></span>`,
    rose: `<span class="inline-block w-3 h-3 rounded-full bg-wine-rose"></span>`,
    red: `<span class="inline-block w-3 h-3 rounded-full bg-wine-red"></span>`,

]

function renderCell(wine, key) {
    const soldOut = wine.isSoldOut
    const strikeClass = soldOut ? `line-through opacity-50` : ''

    if (key === 'wineType') {
        return WINE_TYPE_ICONS[wine.wineType] || ''
    }

    if (key === 'grapeVariety') {
        const value = Array.isArray(wine.grapeVariety)
        ? wine.grapeVariety.join ('<br>')
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
        if (wine.bottleSize === 'magnum') return '1.5L'
        if (wine.bottleSize === 'half') return '1/2 0.375L'
    }

    if (key === 'name') {
        let statusHtml = ''
        if (soldOut) {
            statusHtml = `<span class="text-red-600 font-bold ml-2">SOLD OUT!</span>`
        } else if (wine.isNew) {
            statusHtml = `<div class="text-green-600 text-xs font-bold">New!</div>`
        } else if (wine.isBackInStock) {
            statusHtml = `<div class="text-green-600 text-xs font-bold">Back in Stock!</div>`
        }
        return `<span class="font-bold ${strikeClass}">${wine.name}</span>${statusHtml}`
        
    }

    if (key === 'price') {
        return `<span class="font-bold ${strikeClass}">${wine.price} PLN</span>`
    }

      return `<span class="${strikeClass}">${wine[key] ?? ''}</span>`
}

function renderTables (wines) {
    const columns = getVisibleColumns(wines)

    const headerHtml = columns
    .map(col => `<th class="text-left font-semibold px-3 py-2 border-ink/10 last:border-r-0">${col.label}</th>`)
    .join('')

    const rowsHtml = wines 
    .map(wine => {
        const cellsHtml = columns
        .map(col => `<td class="px-3 py-2 align-top border-r border-ink/10 last:border-r-0">${renderCell(wine, col.key)}</td>`)
        .join('')
    return `<tr class="border-t border-ink/10">${cellsHtml}</tr>`

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

module.exports = { renderTable }