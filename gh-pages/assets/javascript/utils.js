/**
 * Utilities
 */

/**
 * Transform prices and names in a single array.
 * @param {Map<String, Number>} prices Map fuel_type to price
 * @param {Map<String, String>} names Map fuel_type to fuel_name
 * @returns {Array<Map>} List of objects with ``name`` and ``price`` attributes
 */
export function mapPricesToNames(prices, names) {
    let result = []
    for (let type in prices) {
        result.push({ name: names[type], price: prices[type] })
    }
    return result
}

/**
 * Populate a Table element with the values from the array.
 * For example, an array ``[["A", 1], ["B", 2]]`` will result in a table like:
 * ```
 *  | A | 1 |
 *  | B | 2 |
 * ```
 * @param {String} tableQuery Query to find the DOM element, such as ``table#myTable``.
 * @param {Array<Array>} array 2D array. First index defines the row, second one the column.
 */
export function populateTable(tableQuery, array) {
    let tableElement = document.querySelector(tableQuery)
    array.forEach(row => {
        let rowElement = document.createElement("tr")
        row.forEach(cell => {
            let cellElement = document.createElement("td")
            cellElement.innerText = cell
            rowElement.appendChild(cellElement)
        })
        tableElement.appendChild(rowElement)
    })
}

/**
 * Build a Selector element, allowing the user to select a single value in the list
 * @param {string} elementQuery Query to use in ``document.querySelector()``
 * @param {array} possibilities List of possiblities of the selector
 * @param {function} callback Function to call when an item is selected
 */
export function buildSelector(elementQuery, possibilities, callback) {
    let element = document.querySelector(elementQuery)
    let selectedElement = undefined
    const onSelected = e => {
        const element = e.target
        if (selectedElement === e.target){
            return
        }
        if (selectedElement) {
            selectedElement.classList.remove("active")
        }
        selectedElement = element
        selectedElement.classList.add("active")
        callback(e)
    }
    for (let possibility of possibilities) {
        let possibilityElement = document.createElement("button")
        possibilityElement.classList.add("selectable")
        possibilityElement.innerText = possibility
        possibilityElement.onclick = onSelected
        element.appendChild(possibilityElement)
    }
}

export default { mapPricesToNames, populateTable, buildSelector }
