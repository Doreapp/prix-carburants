import utils from "./utils.js"
import map from "./map.js"

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

function displayAveragesMap(averages) {
    let values = {}
    for (const department in averages) {
        const price = averages[department]["2"]
        if (price < 0) {
            values[department] =  {
                value: undefined,
                info: {"Price": "No data"}
            }
        } else {
            values[department] =  {
                value: price,
                info: {"Price": price}
            }
        }
    }
    map.displayFrenchMap(values)
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
            displayAveragesMap(metrics.metrics.averages)
        })
        .catch(error => {
            console.error("Unable to fetch data", error)
        })
}

main()