const { TERMS_CONTENT } = require('../content/terms')

function renderTermsPage(pageNumber, totalPages, priceType) {
  const content = TERMS_CONTENT[priceType] || TERMS_CONTENT.private

  const paragraphs = content
    .trim()
    .split('\n\n')
    .filter(Boolean)
    .map(p => `<p class="text-body mb-4">${p.trim()}</p>`)
    .join('')

  return `
    <div class="page bg-champagne px-16 py-12 font-body" id="terms">
      <div class="flex flex-row justify-between w-full items-center mb-8">
        <a href="#index" class="flex flex-row gap-2 items-center uppercase font-semibold text-xs no-underline">
          
          Powrót do Spisu Treści
        </a>
        <div class="text-xs text-opacity-40 text-off-black">${String(pageNumber).padStart(2, '0')} / ${totalPages}</div>
      </div>
      <h1 class="text-h1 mb-6">Warunki współpracy</h1>
      ${paragraphs}
    </div>
  `
}

module.exports = { renderTermsPage }