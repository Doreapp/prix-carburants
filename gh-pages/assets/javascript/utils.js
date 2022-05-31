

/**
 * Transform prices and names maps in a single array.
 * @param {Map<String, Number>} prices fuel type to price
 * @param {Map<String, String>} names fuel type to fuel name
 * @returns {Array<Map>} List of objects with ``name`` and ``price`` attributes
 */
export function mapPricesToNames(prices, names){
    let result = []
    for (let type in prices) {
        result.push({name: names[type], price: prices[type]})
    }
    return result
}

/**
 * Populate a Table element with value from the array.
 * For example an array ``[["A", 1], ["B", 2]]`` will result in a table like:
 * ```
 *  | A | 1 |
 *  | B | 2 |
 * ```
 * @param {String} tableQuery Query to find the DOM element, such as ``table#myTable``
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

export default {mapPricesToNames, populateTable}