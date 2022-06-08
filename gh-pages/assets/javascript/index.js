import utils from "./utils.js"
import { DepartmentMap } from "./map.js"

/**
 * Populate the table containing prices averages
 * @param {Array} averages Average prices
 *  i.e. ``[2.01234, ...]``
 * @param {Array} fuelNames Corresponding fuel type's name
 *  i.e. ``["SP95", ...]``
 */
function populateAveragesTable(averages, fuelNames) {
    let parsedAverages = []
    for (let i in fuelNames) {
        parsedAverages.push({ name: fuelNames[i], price: averages[i] })
    }
    parsedAverages = parsedAverages.sort((obj1, obj2) => obj2.price - obj1.price) // by descending price
    utils.populateTable(
        "table#averages",
        parsedAverages.map(value => [value.name, value.price.toFixed(2) + " €"])
    )
}

/**
 * Build values usable as input for the Map Visualization
 * @param {Array} averages Averages prices by department
 *  i.e. ``[2.123, ...]``
 * @param {Array} departmentCodes Corresponding department's code
 *  i.e. ``["01", ...]``
 * @returns values usable in ``FrenchMap.setValues()`` function
 */
function buildMapValues(averages, departmentCodes) {
    let values = {}
    for (let i in averages) {
        const price = averages[i]
        const departmentCode = departmentCodes[i]
        if (price < 0) {
            values[departmentCode] = {
                value: undefined,
                info: { "Prix": "Pas de donnée" }
            }
        } else {
            values[departmentCode] = {
                value: price,
                info: { "Prix": price.toFixed(2) + "€" }
            }
        }
    }
    return values
}

/**
 * Build the french map and additional elements
 * @param {Array} fuelNames Names of the fuel types.
 *  i.e. ``["SP95", ...]``
 * @param {Array} averages Average prices by fuel and department.
 *  i.e. ``[[2.123, ...], [...], ...]``
 */
function buildFrenchMap(fuelNames, departmentCodes, averages) {
    let map = new DepartmentMap()
    utils.buildSelector("#selector", fuelNames, e => {
        const fuelName = e.target.innerText
        const departmentPrices = averages[fuelNames.indexOf(fuelName)]
        map.setValues(buildMapValues(departmentPrices, departmentCodes))
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
            buildFrenchMap(
                metrics.fuel_types,
                metrics.departments,
                metrics.averages_by_departments
            )
            populateAveragesTable(metrics.averages_global, metrics.fuel_types)
        })
        .catch(error => {
            console.error("Unable to fetch data", error)
        })
}

main()
