function renderCoverPage(coverLabel) {
    return `
      <div class="page bg-champagne p-8 font-body flex flex-col justify-center items-center" id="cover">
        <h1 style="font-size: 128px; letter-spacing: -1px;" class="font-semibold mb-4">Portfolio</h1>
        <h2 class="text-h2 capitalize">${coverLabel || ''}</h2>
      </div>
    `
  }
  
  module.exports = { renderCoverPage }