const PRODUCER_QUERY = `*[_type == "producer" && _id == $id][0]{
    producerName,
    country,
    region->{name},
    subregion[]->{name},
    producerInfo,
    "mapImageUrl": mapImage.asset->url,
     "wines": *[_type == "wine" && producer._ref == ^._id]{
      wineName,
    wineType,
    vintage,
    price,
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
    isSoldOut,
    isAllocationOnly
    }
  }`
  
  module.exports = { PRODUCER_QUERY }