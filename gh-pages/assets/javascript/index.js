import utils from "./utils.js"
import "./vendor/plotly.js"

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

const Plotly = window["Plotly"]

/**
 * Plot sample data
 */
function plotData() {
    var data = [{
        type: "choropleth",
        locationmode: "USA-states",
        locations: ["AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"],
        z: ["4849377.0", "736732.0", "6731484.0", "2966369.0", "38802500.0", "5355866.0", "3596677.0", "935614.0", "658893.0", "19893297.0", "10097343.0", "1419561.0", "1634464.0", "12880580.0", "6596855.0", "3107126.0", "2904021.0", "4413457.0", "4649676.0", "1330089.0", "5976407.0", "6745408.0", "9909877.0", "5457173.0", "2994079.0", "6063589.0", "1023579.0", "1881503.0", "2839098.0", "1326813.0", "8938175.0", "2085572.0", "19746227.0", "9943964.0", "739482.0", "11594163.0", "3878051.0", "3970239.0", "12787209.0", "3548397.0", "1055173.0", "4832482.0", "853175.0", "6549352.0", "26956958.0", "2942902.0", "626562.0", "8326289.0", "7061530.0", "1850326.0", "5757564.0", "584153.0"],
        text: ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Puerto Rico", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"],
        autocolorscale: true
    }]

    var layout = {
        title: "2014 US Popultaion by State",
        geo: {
            scope: "usa",
            countrycolor: "rgb(255, 255, 255)",
            showland: true,
            landcolor: "rgb(217, 217, 217)",
            showlakes: true,
            lakecolor: "rgb(255, 255, 255)",
            subunitcolor: "rgb(255, 255, 255)",
            lonaxis: {},
            lataxis: {}
        }
    }

    Plotly.newPlot("tester", data, layout, { showLink: false })
}


/**
 * Main function for index file
 * @param {object} metrics Fuel's metrics
 * @param {object} fuelNames Fuel's names
 */
export default function main(metrics, fuelNames) {
    populateAveragesTable(metrics.averages, fuelNames)

    plotData()
}