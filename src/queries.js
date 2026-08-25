const PRODUCER_QUERY = `*[_type == "producer" && _id == $id][0]{
    producerName,
    isNewInPortfolio,
    country,
    region->{name},
    subregion[]->{name},
    producerInfo,
    "mapImageUrl": mapImage.asset->url,
     "wines": *[_type == "wine" && producer._ref == ^._id]{
    wineName,
    wineSubName,
    hideFromPrivate,
    hideFromHoreca,
    wineType,
    vintage,
    pricePrivate,
    priceHoreca,
    grapeVariety[]->{name},
    classification,
    dosage,
    sugar,
    degorgement,
    base,
    bottled,
    isSparkling,
    isFortified,
    isSmallBottle,
    isMagnumBottle,
    isNew,
    isNewVintage,
    isBackInStock,
    isSoldOut,
    isSoldOutHoreca,
    isSoldOutPrivate,
    isAllocationOnly,
    isSansSulfite
    }
  }`

  const ALL_PRODUCERS_QUERY = `*[_type == "producer"] | order(country asc, producerName asc){
    _id,
    producerName,
    country,
    region->{name},
    "slug": slug.current
  }`

const ALL_WINES_QUERY = `*[_type == "wine"] | order(producer->country asc, producer->region->name asc, producer->producerName asc){
  _id,
  wineName,
  "slug": slug.current,
  "producerName": producer->producerName,
  "producerSlug": producer->slug.current,
  "country": producer->country,
  "region": producer->region->name,
  wineType,
  vintage
}`

const WINE_SPEC_QUERY = `*[_type == "wine" && _id == $id][0]{
  wineName,
  wineSubName,
  vintage,
  wineType,
  isSparkling,
  isFortified,
  isMagnumBottle,
  isSmallBottle,
  "bottleImageUrl": bottleImage.asset->url,
  "producerName": producer->producerName,
  "country": producer->country,
  "region": producer->region->name,
  "subregion": producer->subregion[]->name,
  grapeVariety[]->{name},
  classification,
  vintageReport,
  terroir,
  wineMaking,
  tastingNotes
}`
  
  
  module.exports = { PRODUCER_QUERY, ALL_PRODUCERS_QUERY, ALL_WINES_QUERY, WINE_SPEC_QUERY }