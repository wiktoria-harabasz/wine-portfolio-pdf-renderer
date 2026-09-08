function renderCoverPage(coverLabel) {
    return `
    <div style="position:relative; justify-content: center;" class="page bg-champagne text-merlot p-8 font-body flex flex-col justify-center h-full items-center" id="cover">
        <div class="flex flex-col justify-center items-center self-center text-merlot">
        <img style="margin-bottom: 40px; width: 180px; color="currentColor" src="assets/icons/nowofalowi_icon_merlot.svg"/>
            <h1 style="font-size: 128px; letter-spacing: -1px; color: #5350E4!important;" class="font-semibold mb-4 text-merlot">Portfolio</h1>
            <h2 style="font-size: 24px; color: #5350E4!important;" class="font-semibold capitalize text-merlot">${coverLabel || ''}</h2>
        </div>
    </div>
    `
  }
  
  module.exports = { renderCoverPage }