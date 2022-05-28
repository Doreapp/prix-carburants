# Prix carburants

A website to display statistics and information about french fuel prices.

<p id="statistics">Stats</p>

<script src="/assets/javascript/fetch_data.js"></script>
<script type="text/javascript">
    const resultElement = document.querySelector("#statistics")
    new DataFetcher().getData()
    .then(data => {
        const salePoints = JSON.parse(data.responseText)
        resultElement.innerText = "There are " + salePoints.length + " sale points."
    })
    .catch(data => {
        console.log("Error fetching data from the repository")
    })
</script>