import utils from "./utils.js"
import { FrenchMap } from "./map.js"

/**
 * Populate the table containing prices averages
 * @param {object} averages Object containing ``price`` by ``fuel type``.
 *  i.e. ``{"1": 2.01234, "2": ...}``
 * @param {object} fuelNames Object containing ``fuel name`` by ``fuel type``.
 *  i.e. ``{"1": "SP95", "2": ...}``
 */
function populateAveragesTable(averages, fuelNames) {
    let parsedAverages = utils.mapPricesToNames(averages, fuelNames)
    parsedAverages = parsedAverages.sort((obj1, obj2) => obj2.price - obj1.price) // by descending price
    utils.populateTable(
        "table#averages",
        parsedAverages.map(value => [value.name, value.price.toFixed(2) + " €"])
    )
}

/**
 * Build values usable as input for the Map Visualization
 * @param {object} averages price averages by department and fuel type.
 *  i.e. ``{"44": {"1": 2.123, "2": ...}, "45": {...}}``
 * @param {number} fuelType identifier of the fuel type to extract prices from
 * @returns values usable in ``FrenchMap.setValues()`` function
 */
function buildMapValues(averages, fuelType) {
    let values = {}
    for (const department in averages) {
        const price = averages[department][fuelType]
        if (price < 0) {
            values[department] =  {
                value: undefined,
                info: {"Prix": "Pas de donnée"}
            }
        } else {
            values[department] =  {
                value: price,
                info: {"Prix": price.toFixed(2) + "€"}
            }
        }
    }
    return values
}

/**
 * Build the french map and additional elements
 * @param {object} rawFuelTypes fuel types from identifier to name.
 *  i.e. ``{"1": "SP95", "2": ...}``
 * @param {object} averages prices average from department to fuelType to price average.
 *  i.e. ``{"44": {"1": 2.123, "2": ...}, "45": {...}}``
 */
function buildFrenchMap(rawFuelTypes, averages) {
    let fuelTypes = []
    let inverseMap = {}
    let map = new FrenchMap()
    for(let key in rawFuelTypes) {
        const name = rawFuelTypes[key]
        fuelTypes.push(name)
        inverseMap[name.toLowerCase()] = key
    }
    utils.buildSelector("#selector", fuelTypes, e => {
        const fuelName = e.target.innerText
        map.setValues(buildMapValues(averages, inverseMap[fuelName.toLowerCase()]))
    })
}

/**
 * Main function for ``index.md`` file
 */
function main() {
    fetch("./assets/data/metrics.json")
        .then(response => {
            return response.json()
        })
        .then(metrics => {
            buildFrenchMap(metrics.fuel_types, metrics.metrics.averages)
            populateAveragesTable(metrics.metrics.averages.total, metrics.fuel_types)
        })
        .catch(error => {
            console.error("Unable to fetch data", error)
        })
}

main()
