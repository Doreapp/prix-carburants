/**
 * Script for index.md page
 */

(() => {
    const resultElement = document.querySelector("#statistics")
    new DataFetcher().getData()
        .then(salePoints => {
            resultElement.innerText = "Il y a " + salePoints.length + " points de vente."
        })
        .catch(_ => {
            console.log("Error fetching data from the repository")
        })
})()
