import utils from "./utils.js"
import "./vendors/plotly.js"

/**
 * Populate the table containing prices averages
 * @param {Map<string, number>} averages Map from fuel_type to price
 * @param {Map<string, string>} fuelNames Map from fuel_type to fuel_name
 */
function populateAveragesTable(averages, fuelNames) {
    let parsedAverages = utils.mapPricesToNames(averages, fuelNames)
    parsedAverages = parsedAverages.sort((obj1, obj2) => obj2.price - obj1.price) // by descending price
    utils.populateTable(
        "table#averages",
        parsedAverages.map(value => [value.name, value.price.toFixed(2) + " €"])
    )
}

const Plotly = window["Plotly"]

/**
 * Main function for index file
 * @param {object} metrics Fuel's metrics
 * @param {object} fuelNames Fuel's names
 */
export default function main(metrics, fuelNames) {
    populateAveragesTable(metrics.averages, fuelNames)

    const TESTER = document.getElementById("tester")
    Plotly.newPlot(TESTER, [{
        x: [1, 2, 3, 4, 5],
        y: [1, 2, 4, 8, 16]
    }], { margin: { t: 0 } })
}