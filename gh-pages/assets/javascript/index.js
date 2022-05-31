/**
 * Script for index.md page
 */
import {DataFetcher} from "./tools.js"

const resultElement = document.querySelector("#statistics")
new DataFetcher().getLatest()
    .then(data => {
        displayLatestData(resultElement, data)
    })
    .catch(err => {
        console.log("Error fetching data from the repository", err)
    })

/**
 * Display sale points in ``root`` DOM element
 * @param {Element} root
 * @param {Object} data
 */
function displayLatestData(root, data) {
    const types = data["fuel_types"]
    const salePoints = data["sale_points"]
    console.log(types, salePoints.length)
    let prices = {}
    for(let type in types) {
        prices[type] = [0, 0]
    }
    salePoints.forEach(salePoint => {
        for(let type in salePoint.prices) {
            let price = salePoint.prices[type]
            if(price) {
                prices[type][0] += price[1] // Price
                prices[type][1]++ // Number
            }
        }
    })
    let resultHTML = "Prix moyens en ce moment:<table>"
    for(let type in types) {
        let average = prices[type][0] / prices[type][1]
        resultHTML += "<tr><td>" + types[type] + "</td><td>" + average.toFixed(2) + "€</td></tr>"
    }
    resultHTML += "</table>"
    root.innerHTML = resultHTML
}
