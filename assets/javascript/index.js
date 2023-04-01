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
  utils.populateTable("table#averages", [
    fuelNames,
    averages.map((price) => `${price.toFixed(2)}€`),
  ])
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
        info: { Prix: "Pas de donnée" },
      }
    } else {
      values[departmentCode] = {
        value: price,
        info: { Prix: price.toFixed(2) + "€" },
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
  let map = new DepartmentMap("by-region-map")
  utils.buildSelector("#by-region-selector", fuelNames, (e) => {
    const fuelName = e.target.innerText
    const departmentPrices = averages[fuelNames.indexOf(fuelName)]
    map.setValues(buildMapValues(departmentPrices, departmentCodes))
  })
  document.querySelector("#by-region-selector button").click() // Select the first fuel type
}

/**
 * Main function for ``index.md`` file
 */
async function main() {
  const response = await fetch("./assets/data/metrics.json")
  const metrics = await response.json()

  populateAveragesTable(metrics.averages_global, metrics.fuel_types)

  buildFrenchMap(
    metrics.fuel_types,
    metrics.departments,
    metrics.averages_by_departments
  )
}

main()
