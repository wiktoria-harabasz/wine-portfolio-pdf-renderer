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
        <a href="#index" class="flex gap-2 items-center opacity-40">
            <div class="flex items-center">
                <img src="assets/icons/chevron_left.svg" style="width: 5px"/>
                <img src="assets/icons/chevron_left.svg" style="width: 5px"/>
            </div>
            <span class="flex flex-row gap-2 items-center text-sm text-off-black no-underline">
            Powrót do Spisu Treści
            </span>
        </a>
        <div class="text-xs text-opacity-40 text-off-black">${String(pageNumber).padStart(2, '0')} / ${totalPages}</div>
      </div>
      <h1 class="text-h1 mb-6">Warunki współpracy</h1>
      ${paragraphs}
    </div>
  `
}

module.exports = { renderTermsPage }