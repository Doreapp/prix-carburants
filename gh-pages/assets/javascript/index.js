import utils from "./utils.js"
import { FrenchMap } from "./map.js"

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

/**
 * Build values usable as input for the Map Visualization
 * @param {object} averages price averages by department and fuel type
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
                info: {"Price": "No data"}
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
 * @param {object} rawFuelTypes fuel types from identifier to name
 * @param {object} averages prices average from department to fuelType to price average
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
 * Main function for index file
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
