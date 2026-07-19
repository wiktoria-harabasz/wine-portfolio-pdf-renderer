function renderIndexPage(producers) {
    const byCountry = {}
    producers.forEach(p => {
      if (!byCountry[p.country]) byCountry[p.country] = []
      byCountry[p.country].push(p)
    })
  
    const sectionsHtml = Object.entries(byCountry).map(([country, list]) => `
      <h3 class="font-display font-bold text-lg mt-6 capitalize">${country}</h3>
      <ul>
        ${list.map(p => `
          <li class="border-b border-ink/10 py-1">
            <a href="#producer-${p.slug}" class="flex justify-between text-ink no-underline">
              <span>${p.producerName}</span>
              <span class="text-muted">${p.region?.name || ''}</span>
            </a>
          </li>
        `).join('')}
      </ul>
    `).join('')
  
    return `
      <div class="page bg-bg-page px-16 py-12 font-body">
        <h1 class="font-display font-bold text-4xl">Wine Portfolio</h1>
        ${sectionsHtml}
      </div>
    `
  }
  
  module.exports = { renderIndexPage }