import utils from "./utils.js"
import "./vendor/plotly.js"
import "./vendor/leaflet.js"

const COLORS = ["#800026", "#BD0026", "#E31A1C", "#FC4E2A", "#FD8D3C", "#FEB24C", "#FED976", "#FFEDA0"]

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
 * @param {Map<string, Map<string, number>>} averages Map from department to fuel_type to prices
 */
function plotData(averages) {
    let map = L.map("map").setView([46.6309, 2.4527], 5)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 10,
        minZoom: 5,
        attribution: "© OpenStreetMap"
    }).addTo(map)
    fetch("./assets/geojson/french_departments.json")
        .then(response => {
            return response.json()
        })
        .then(data => {
            let features = data.features
            let max = -1, min = 999
            for (const feature of features) {
                let department = parseInt(feature.properties.code)
                let average = averages[department.toString()]["1"]
                if(average >= 0) {
                    max = Math.max(max, average)
                    min = Math.min(min, average)
                    feature.properties.price = average
                }
            }
            const scope = max-min, size = COLORS.length
            function getColor(price) {
                if (price < 0) {
                    return "grey"
                }
                const index = Math.trunc((price - min) * size / scope)
                return COLORS[index]
            }
            function style(feature) {
                return {
                    weight: 2,
                    opacity: 1,
                    color: "white",
                    dashArray: "3",
                    fillOpacity: 0.8,
                    fillColor: getColor(feature.properties.price)
                }
            }
            L.geoJson(features, {"style": style}).addTo(map)
        })
}


/**
 * Main function for index file
 */
function main() {
    fetch("./assets/data/metrics.json")
        .then(response => {
            return response.json()
        })
        .then(metrics => {
            populateAveragesTable(metrics.metrics.averages.total, metrics.fuel_types)
            plotData(metrics.metrics.averages)
        })
        .catch(error => {
            console.error("Unable to fetch data", error)
        })
}

main()