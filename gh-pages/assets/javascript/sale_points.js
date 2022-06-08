import utils from "./utils.js"
import { Map } from "./map.js"

/**
 * Build and display the map of sale points for a fixed fuel type
 * TODO handle dynamically fuel type
 * @param {Array<object>} salePoints List of sale points
 */
function buildMap(salePoints, fuelNames) {
    let map = new Map()
    utils.buildSelector("#selector", fuelNames, e => {
        const fuelName = e.target.innerText
        const fuelType = fuelNames.indexOf(fuelName) + 5
        map.clearMarkers()
        for (let salePoint of salePoints) {
            const price = salePoint[fuelType]
            if (price < 0) {
                continue
            }
            const shortInfo = "<b>" + price.toFixed(2) +"€</b>"
            const longInfo = shortInfo + "<br />"
                + [salePoint[2], salePoint[3], salePoint[4]].join(", ")
            map.addMarker(
                salePoint[0]/100000.0,
                salePoint[1]/100000.0,
                shortInfo,
                longInfo
            )
        }
        map.invalidate()
    })
}

/**
 * Main function for ``sale_points.md`` file
 */
function main() {
    fetch("./assets/data/latest.json")
        .then(response => {
            return response.json()
        })
        .then(data => {
            buildMap(data.data, data.keys.splice(5))
        })
        .catch(error => {
            console.error("Unable to fetch data", error)
        })
}

main()
