
// function renderProducerRow(p) {
//   const newBadge = p.isNewInPortfolio
//     ? `<span class="text-[10px] font-bold text-green-600 uppercase ml-1">New</span>`
//     : ''
//   return `
//     <li>
//       <a href="#producer-${p.slug}" class="flex items-center justify-between gap-2 text-off-black no-underline">
//         <div class="flex flex-row items-start gap-2">
//           <span class="font-semibold text-off-black text-[10px]">(${String(p.producerNumber).padStart(2, '0')})</span>
//           <span class="uppercase font-semibold">${p.producerName}</span>
//           ${newBadge}
//         </div>
//         <span class="text-muted text-sm">${p.pageNumber}</span>
//       </a>
//     </li>
//   `
//     return `
//       <li>
//         <a href="#producer-${p.slug}" class="flex items-center justify-between gap-2 text-off-black no-underline">
//         <div class="flex flex-row items-start gap-2">
//           <span class="font-semibold text-off-black text-[10px]">(${String(p.producerNumber).padStart(2, '0')})</span>

//           <span class="uppercase font-semibold">${p.producerName}</span>
//           </div>
//           <span class="text-muted text-sm">${p.pageNumber}</span>
//         </a>
//       </li>
//     `
//   }

  
//   function renderRegionSection(region, producers) {
//     return `
//       <div class="index-region flex flex-col gap-4">
//         <h4 class="index-region-title capitalize ml-4 text-off-black">//<span class="ml-1">${region}</span></h4>
//         <ul class="index-producers flex flex-col gap-4 ml-4 text-off-black">
//           ${producers.map(renderProducerRow).join('')}
//         </ul>
//       </div>
//     `
//   }
  
//   function renderCountrySection(country, regions) {
//     return `
//       <div class="index-country flex flex-col gap-4">
//         <h3 class="index-country-title capitalize font-semibold text-off-black">${country}</h3>
//         <div class="index-regions flex flex-col gap-4 text-off-black">
//           ${Object.entries(regions).map(([region, producers]) => renderRegionSection(region, producers)).join('')}
//         </div>
//       </div>
//     `
//   }

//   function groupByCountryAndRegion(producers) {
//     const grouped = {}
//     producers.forEach(p => {
//       const country = p.country
//       const region = p.region?.name || 'Other'
//       if (!grouped[country]) grouped[country] = {}
//       if (!grouped[country][region]) grouped[country][region] = []
//       grouped[country][region].push(p)
//     })
//     return grouped
//   }
  
//   function renderIndexPage(producers) {
//     const grouped = groupByCountryAndRegion(producers)
//     const countriesHtml = Object.entries(grouped)
//       .map(([country, regions]) => renderCountrySection(country, regions))
//       .join('')
  
//     return `
//       <div class="page bg-champagne px-16 py-12 font-body" id="index">
//         <h1 class="font-semibold uppercase text-h1 mb-8">spis treści</h1>


//         <div class="">
//           ${countriesHtml}
//         </div>
//       </div>
//     `
//   }
  
//   module.exports = { renderIndexPage }


const ROWS_PER_INDEX_PAGE = 30

function buildIndexRows(producers) {
  const rows = []
  let lastCountry = null
  let lastRegion = null

  producers.forEach(p => {
    const country = p.country
    const region = p.region?.name || 'Other'
    const isNewCountry = country !== lastCountry
    const isNewRegion = isNewCountry || region !== lastRegion

    rows.push({
      country: isNewCountry ? country : '',
      region: isNewRegion ? region : '',
      producer: p,
    })

    lastCountry = country
    lastRegion = region
  })

  return rows
}

function chunkRowsIntoPages(rows, rowsPerPage = ROWS_PER_INDEX_PAGE) {
  const pages = []
  for (let i = 0; i < rows.length; i += rowsPerPage) {
    pages.push(rows.slice(i, i + rowsPerPage))
  }
  return pages
}

// <svg class="badge-icon" width="auto" height="auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  // <path d="M11.4271 12.2481C11.3668 11.0491 11.2462 10.1395 11.0653 9.51938C10.9045 8.89922 10.4925 7.93798 9.82915 6.63566C9.18593 5.33333 8.86432 4.32041 8.86432 3.5969C8.86432 2.64599 9.18593 1.80879 9.82915 1.08527C10.4925 0.361757 11.2161 0 12 0C12.8643 0 13.608 0.341085 14.2312 1.02326C14.8744 1.68475 15.196 2.55297 15.196 3.62791C15.196 4.47545 14.8844 5.49871 14.2613 6.69767C13.6382 7.89664 13.2362 8.81654 13.0553 9.45736C12.8945 10.0775 12.7638 11.0078 12.6633 12.2481C13.7889 11.7726 14.593 11.3592 15.0754 11.0078C15.5578 10.6563 16.2714 9.96382 17.2161 8.93023C18.4824 7.54522 19.6985 6.85271 20.8643 6.85271C21.7487 6.85271 22.4925 7.15245 23.0955 7.75194C23.6985 8.35142 24 9.0646 24 9.89147C24 10.7804 23.6281 11.5659 22.8844 12.2481C22.1407 12.9302 21.1759 13.2713 19.9899 13.2713C19.5879 13.2713 18.8744 13.2403 17.8492 13.1783C17.3668 13.1576 16.8442 13.1473 16.2814 13.1473C15.5377 13.1473 14.4121 13.1886 12.9045 13.2713C13.7688 14.2842 14.4422 14.9871 14.9246 15.3798C15.407 15.7519 16.2412 16.2481 17.4271 16.8682C18.6131 17.4884 19.4673 18.1499 19.9899 18.8527C20.3719 19.3695 20.5628 20.031 20.5628 20.8372C20.5628 21.7261 20.2714 22.4806 19.6884 23.1008C19.1055 23.7003 18.402 24 17.5779 24C16.7136 24 15.9296 23.6382 15.2261 22.9147C14.5427 22.1705 14.0704 20.8579 13.809 18.9767C13.6482 17.7571 13.4673 16.8682 13.2663 16.3101C13.0854 15.7519 12.6834 14.9354 12.0603 13.8605C11.397 14.9561 10.9548 15.8036 10.7337 16.4031C10.5126 17.0026 10.3216 17.8605 10.1608 18.9767C9.8995 20.8579 9.43719 22.1499 8.77387 22.8527C8.11055 23.5556 7.33668 23.907 6.45226 23.907C5.62814 23.907 4.91457 23.6176 4.31156 23.0388C3.72864 22.4599 3.43719 21.7674 3.43719 20.9612C3.43719 20.1344 3.65829 19.4005 4.1005 18.7597C4.56281 18.0982 5.39698 17.4264 6.60302 16.7442C7.82915 16.0413 8.67337 15.5142 9.13568 15.1628C9.59799 14.8114 10.2714 14.1809 11.1558 13.2713L7.92965 13.1473C7.36683 13.1473 6.83417 13.1576 6.33166 13.1783C5.14573 13.261 4.33166 13.3023 3.88945 13.3023C2.74372 13.3023 1.80905 12.9716 1.08543 12.3101C0.361809 11.6486 0 10.863 0 9.95349C0 9.10594 0.291457 8.38243 0.874372 7.78295C1.47739 7.16279 2.23116 6.85271 3.13568 6.85271C4.40201 6.85271 5.61809 7.47287 6.78392 8.71318C7.94975 9.95349 8.70352 10.708 9.04523 10.9767C9.52764 11.3282 10.3216 11.7519 11.4271 12.2481Z" fill="currentColor"/>
  // </svg>

function renderIndexRow(row) {
  const p = row.producer
  const newBadge = p.isNewInPortfolio
    ? `<span class="status-badge-index ml-2">
        <div class="flex flex-row gap-[2px]">
          <div class="badge-dot"></div>
          <div class="badge-dot"></div>
        </div>
        New in portfolio
        <div class="flex flex-row gap-[2px]">
          <div class="badge-dot"></div>
          <div class="badge-dot"></div>
        </div>
     
    </span>`
    : ''
  return `
    <a href="#producer-${p.slug}" class="index-row-link">
      <span class="index-cell-country font-semibold">${row.country}</span>
      <span class="index-cell-region font-semibold">${row.region}</span>
      <span class="index-cell-producer font-semibold">
        <div class="flex flex-row justify-between items-start">
          <div class="flex flex-row gap-2 items-start mr-8">
            <div class="producer-inner-number">(${String(p.producerNumber).padStart(2, '0')})</div>
            <div class="flex flex-row items-center" mt-[2px]>${p.producerName}${newBadge}</div>
          </div>
          <div class="index-cell-page text-muted">${String(p.pageNumber).padStart(2, '0')}</div>
        </div>
      </span>
    </a>
  `
}

function renderIndexHeader() {
  return `
    <div class="index-header-row">
      <span>Country</span>
      <span>Region</span>
      <span>Producer</span>
    </div>
  `
}

function renderIndexPages(producers) {
  const allRows = buildIndexRows(producers)
  const pages = chunkRowsIntoPages(allRows)

  return pages.map((pageRows, i) => `
    <div class="page bg-champagne px-16 py-12 font-body" ${i === 0 ? 'id="index"' : ''}>
      ${i === 0 ? '<h1 class="font-semibold text-h1 mb-8">Spis treści</h1>' : ''}
      <div class="index-grid">
        ${renderIndexHeader()}
        ${pageRows.map(renderIndexRow).join('')}
      </div>
    </div>
  `).join('')
}

function countIndexPages(producers, rowsPerPage = ROWS_PER_INDEX_PAGE) {
  return Math.ceil(buildIndexRows(producers).length / rowsPerPage)
}

module.exports = { renderIndexPages, countIndexPages }