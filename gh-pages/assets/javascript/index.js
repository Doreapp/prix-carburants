import utils from "./utils.js"
import "./vendor/plotly.js"
import "./vendor/leaflet.js"

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

const L = window["L"]

/**
 * Plot sample data
 */
function plotData() {
    let map = L.map("map").setView([51.505, -0.09], 13)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap"
    }).addTo(map)
}


/**
 * Main function for index file
 * @param {object} metrics Fuel's metrics
 * @param {object} fuelNames Fuel's names
 */
export default function main(metrics, fuelNames) {
    populateAveragesTable(metrics.averages, fuelNames)

    plotData()
}