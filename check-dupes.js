const client = require('./src/sanity-client')

client
  .fetch(`*[_type == "wine"]{_id, wineName, vintage, "producer": producer->producerName}`)
  .then(wines => {
    const seen = {}
    wines.forEach(w => {
      const key = `${w.wineName}|${w.vintage}|${w.producer}`
      ;(seen[key] ||= []).push(w._id)
    })
    const dupes = Object.entries(seen).filter(([, ids]) => ids.length > 1)
    console.log(dupes.length ? dupes : 'No duplicate wines found')
  })