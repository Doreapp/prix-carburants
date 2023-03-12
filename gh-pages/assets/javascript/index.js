import utils from "./utils.js"
import "./vendor/plotly.js"

/**
 * Populate the table containing prices averages
 * @param {Array} averages Average prices
 *  i.e. ``[2.01234, ...]``
 * @param {Array} fuelNames Corresponding fuel type's name
 *  i.e. ``["SP95", ...]``
 */
function populateAveragesTable(averages, fuelNames) {
  let parsedAverages = []
  for (let i in fuelNames) {
    parsedAverages.push({ name: fuelNames[i], price: averages[i] })
  }
  parsedAverages = parsedAverages.sort((obj1, obj2) => obj2.price - obj1.price) // by descending price
  utils.populateTable(
    "table#averages",
    parsedAverages.map((value) => [value.name, value.price.toFixed(2) + " €"])
  )
}

/**
 * Main function for ``index.md`` file
 */
async function main() {
  let response = await fetch("./assets/data/metrics.json")
  const metrics = await response.json()
  populateAveragesTable(metrics.averages_global, metrics.fuel_types)

  response = await fetch("./assets/geojson/french_departments.json")
  const geoJSON = await response.json()

  const names = {}
  for (const feature of geoJSON.features) {
    names[feature.properties.code] = feature.properties.nom
  }
  const sortedNames = []
  for (const id of metrics.departments) {
    sortedNames.push(names[id])
  }

  var data = [
    {
      type: "choropleth",
      name: "France",
      ids: metrics.departments,
      locations: metrics.departments,
      z: metrics.averages_by_departments[0],
      text: sortedNames,
      geojson: geoJSON,
      locationmode: "geojson-id",
      featureidkey: "properties.code",
    },
  ]

  const layout = {
    title: "France",
    geo: {
      showframe: false,
      showcoastlines: false,
      projection: {
        type: "mercator",
      },
      lonaxis: {
        range: [-6, 10],
      },
      lataxis: {
        range: [41, 52],
      },
    },
  }

  window.Plotly.newPlot("map", data, layout, layout)
}

main()
