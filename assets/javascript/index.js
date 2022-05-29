/**
 * Script for index.md page
 */
import {DataFetcher} from "./tools.js"

const resultElement = document.querySelector("#statistics")
new DataFetcher().getData()
    .then(salePoints => {
        resultElement.innerText = "Il y a " + salePoints.length + " points de vente."
    })
    .catch(() => {
        console.log("Error fetching data from the repository")
    })
