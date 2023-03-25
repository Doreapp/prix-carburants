import utils from "./utils.js"
import "./vendor/plotly.js"

/**
 * Build and display the map of sale points, as well as the fuel type selector
 * @param {Array<object>} salePoints List of sale points
 */
function buildMap(salePoints, fuelNames) {
  const data = {
    name: "French fuel sale points",
    type: "scattermapbox",
    mode: "markers",
    marker: {
      size: 20,
      colorscale: "Bluered",
      // opacity: 0.8,
      showscale: true,
    },
    cluster: {
      size: 20,
      color: "#1F77B4",
      enabled: true,
    },
  }

  const layout = {
    mapbox: {
      style: "open-street-map",
      center: { lat: 46.4, lon: 2.4 },
      zoom: 5,
    },
  }

  utils.buildSelector("#sale-points-selector", fuelNames, (e) => {
    const fuelName = e.target.innerText
    const fuelType = fuelNames.indexOf(fuelName) + 5
    const filtered = salePoints.filter((point) => point[fuelType] > 0)

    data.lat = filtered.map((point) => point[0] / 100000.0)
    data.lon = filtered.map((point) => point[1] / 100000.0)
    data.text = filtered.map(
      (point) =>
        `${point[5].toFixed(2)}€ - ${point[2]}, ${point[3]}, ${point[4]}`
    )
    data.marker.color = filtered.map((point) => point[fuelType])

    window.Plotly.newPlot("sale-points-map", [data], layout, {
      responsive: true,
    })
  })

  document.querySelector("#sale-points-selector button").click()
}

/**
 * Main function for ``sale_points.md`` file
 */
async function main() {
  const response = await fetch("./assets/data/latest.json")
  const data = await response.json()
  buildMap(data.data, data.keys.splice(5))
}

main()
