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

function renderWineRow(w) {
  return `
    <li>
      
      <a href="#wine-${w.slug}" class="flex justify-between items-center text-off-black no-underline">
        
        <span>${w.wineName}${w.vintage ? ' ' + w.vintage : ''}</span>
       
        <span class="text-muted text-sm">${w.pageNumber}</span>
      </a>
    </li>
  `
}

function renderProducerGroup(producer, wines) {
  return `
   
     
        <h5 class="font-semibold text-sm uppercase">${producer}</h5>
      
      <ul class="flex flex-col gap-4">
      
        ${wines.map(renderWineRow).join('')}
      </ul>
     
   
  `
}

function renderRegionGroup(region, producers) {
  return `
   
      
        
          
     
      
      <div class="grid grid-cols-[25%_25%_50%] gap-y-4">
      <h4 class="font-semibold uppercase text-sm">${region}</h4>
        ${Object.entries(producers).map(([producer, wines]) => renderProducerGroup(producer, wines)).join('')}
      </div>
     
  `
}

function renderCountryGroup(country, regions) {
  return `
    <div class="flex flex-col gap-4">
    
         
          <h3 class=" flex rounded bg-off-black text-champagne px-2 py-0.5 font-semibold text-sm uppercase">${country}</h3>
      
    
      
      
        ${Object.entries(regions).map(([region, producers]) => renderRegionGroup(region, producers)).join('')}
     
    </div>
  `
}

function renderWineIndexPage(wines) {
  const grouped = groupByCountryRegionProducer(wines)
  const countriesHtml = Object.entries(grouped)
    .map(([country, regions]) => renderCountryGroup(country, regions))
    .join('')

  return `
    <div class="page bg-champagne px-16 py-12 font-body" id="index">
      <h1 class="font-semibold uppercase text-h1 mb-8">Wine Database</h1>
      <div class="flex flex-col gap-8">
        ${countriesHtml}
      </div>
    </div>
  `
}


// <div class="flex flex-row gap-1 items-center">
//           <div class="w-1 h-1 border border-solid border-off-black rounded-lg "></div>
//           <div class="w-1 h-1 border border-solid border-off-black rounded-lg "></div>
//           <div class="w-1 h-1 border border-solid border-off-black rounded-lg "></div>
//         </div>

module.exports = { renderWineIndexPage }