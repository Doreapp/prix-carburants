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
  utils.populateTable("table#averages", [
    fuelNames,
    averages.map((price) => `${price.toFixed(2)}€`),
  ])
}

/**
 * Build the french map and additional elements
 * @param {Array} fuelNames Names of the fuel types.
 *  i.e. ``["SP95", ...]``
 * @param {Array} averages Average prices by fuel and department.
 *  i.e. ``[[2.123, ...], [...], ...]``
 */
async function buildFrenchMap(fuelNames, departmentCodes, averages) {
  const response = await fetch("./assets/geojson/french_departments.json")
  const geoJSON = await response.json()

  const names = {}
  for (const feature of geoJSON.features) {
    names[feature.properties.code] = feature.properties.nom
  }
  const sortedNames = []
  for (const id of departmentCodes) {
    sortedNames.push(names[id])
  }

  averages = averages.map((list) =>
    list.map((value) => (value > 0 ? value : undefined))
  )

  const data = {
    type: "choropleth",
    name: "Prix moyens des carburants par département",
    ids: departmentCodes,
    locations: departmentCodes,
    text: sortedNames,
    geojson: geoJSON,
    locationmode: "geojson-id",
    featureidkey: "properties.code",
    colorscale: "Reds",
  }

  const layout = {
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

  utils.buildSelector("#by-region-selector", fuelNames, (e) => {
    const fuelName = e.target.innerText
    data.z = averages[fuelNames.indexOf(fuelName)]
    window.Plotly.newPlot("by-region-map", [data], layout, { responsive: true })
  })

  document.querySelector("#by-region-selector button").click() // Select the first fuel type
}

/**
 * Main function for ``index.md`` file
 */
async function main() {
  const response = await fetch("./assets/data/metrics.json")
  const metrics = await response.json()

  populateAveragesTable(metrics.averages_global, metrics.fuel_types)

  await buildFrenchMap(
    metrics.fuel_types,
    metrics.departments,
    metrics.averages_by_departments
  )
}

main()
