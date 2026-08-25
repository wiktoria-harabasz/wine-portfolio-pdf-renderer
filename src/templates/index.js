
function renderProducerRow(p) {
  // const newBadge = p.isNewInPortfolio
  //   ? `<span class="text-[10px] font-bold text-green-600 uppercase ml-1">New</span>`
  //   : ''
  // return `
  //   <li>
  //     <a href="#producer-${p.slug}" class="flex items-center justify-between gap-2 text-off-black no-underline">
  //       <div class="flex flex-row items-start gap-2">
  //         <span class="font-semibold text-off-black text-[10px]">(${String(p.producerNumber).padStart(2, '0')})</span>
  //         <span class="uppercase font-semibold">${p.producerName}</span>
  //         ${newBadge}
  //       </div>
  //       <span class="text-muted text-sm">${p.pageNumber}</span>
  //     </a>
  //   </li>
  // `
    return `
      <li>
        <a href="#producer-${p.slug}" class="flex items-center justify-between gap-2 text-off-black no-underline">
        <div class="flex flex-row items-start gap-2">
          <span class="font-semibold text-off-black text-[10px]">(${String(p.producerNumber).padStart(2, '0')})</span>

          <span class="uppercase font-semibold">${p.producerName}</span>
          </div>
          <span class="text-muted text-sm">${p.pageNumber}</span>
        </a>
      </li>
    `
  }

  
  function renderRegionSection(region, producers) {
    return `
      <div class="index-region flex flex-col gap-4">
        <h4 class="index-region-title capitalize ml-4 text-off-black">//<span class="ml-1">${region}</span></h4>
        <ul class="index-producers flex flex-col gap-4 ml-4 text-off-black">
          ${producers.map(renderProducerRow).join('')}
        </ul>
      </div>
    `
  }
  
  function renderCountrySection(country, regions) {
    return `
      <div class="index-country flex flex-col gap-4">
        <h3 class="index-country-title capitalize font-semibold text-off-black">${country}</h3>
        <div class="index-regions flex flex-col gap-4 text-off-black">
          ${Object.entries(regions).map(([region, producers]) => renderRegionSection(region, producers)).join('')}
        </div>
      </div>
    `
  }

  function groupByCountryAndRegion(producers) {
    const grouped = {}
    producers.forEach(p => {
      const country = p.country
      const region = p.region?.name || 'Other'
      if (!grouped[country]) grouped[country] = {}
      if (!grouped[country][region]) grouped[country][region] = []
      grouped[country][region].push(p)
    })
    return grouped
  }
  
  function renderIndexPage(producers) {
    const grouped = groupByCountryAndRegion(producers)
    const countriesHtml = Object.entries(grouped)
      .map(([country, regions]) => renderCountrySection(country, regions))
      .join('')
  
    return `
      <div class="page bg-champagne px-16 py-12 font-body" id="index">
        <h1 class="font-semibold uppercase text-h1 mb-8">spis treści</h1>


        <div class="flex flex-col gap-2">
          ${countriesHtml}
        </div>
      </div>
    `
  }
  
  module.exports = { renderIndexPage }