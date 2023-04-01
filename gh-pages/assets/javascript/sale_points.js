import utils from "./utils.js"
import { Map } from "./map.js"

/**
 * Build and display the map of sale points, as well as the fuel type selector
 * @param {Array<object>} salePoints List of sale points
 */
function buildMap(salePoints, fuelNames) {
  let map = new Map("sale-points-map")
  map.locate()
  utils.buildSelector("#sale-points-selector", fuelNames, (e) => {
    const fuelName = e.target.innerText
    const fuelType = fuelNames.indexOf(fuelName) + 5
    map.clearMarkers()
    for (let salePoint of salePoints) {
      const price = salePoint[fuelType]
      if (price < 0) {
        continue
      }
      const shortInfo = "<b>" + price.toFixed(2) + "€</b>"
      const longInfo =
        shortInfo +
        "<br />" +
        [salePoint[2], salePoint[3], salePoint[4]].join(", ")
      map.addMarker(
        salePoint[0] / 100000.0,
        salePoint[1] / 100000.0,
        shortInfo,
        longInfo
      )
    }
    map.invalidate()
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
