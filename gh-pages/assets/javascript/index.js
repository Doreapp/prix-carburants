/**
 * Script for index.md page
 */

(() => {
    const resultElement = document.querySelector("#statistics")
    new DataFetcher().getData()
    .then(data => {
        const salePoints = JSON.parse(data.responseText)
        resultElement.innerText = "There are " + salePoints.length + " sale points."
    })
    .catch(_ => {
        console.log("Error fetching data from the repository")
    })
})()