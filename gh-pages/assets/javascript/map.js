
import "./vendor/leaflet.js"

const L = window["L"]

const COLORS = ["#FFEDA0", "#FED976", "#FEB24C", "#FD8D3C", "#FC4E2A", "#E31A1C", "#BD0026", "#800026"]

/**
 * Plot sample data
 * @param {object} values object, linking a department code (as an integer) to values.
 *  The value object should look like {value: 123, info: {toto: "tata", ...}}.
 *  Undefined values are taken as "not existant data".
 */
export function displayFrenchMap(values) {
    console.log(values)
    let map = L.map("map").setView([46.6309, 2.4527], 5)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 10,
        minZoom: 5,
        attribution: "© OpenStreetMap"
    }).addTo(map)
    fetch("./assets/geojson/french_departments.json")
        .then(response => {
            return response.json()
        })
        .then(data => {
            let features = data.features
            let max = -1, min = 999
            for (const feature of features) {
                let department = parseInt(feature.properties.code)
                let value = values[department.toString()]
                if (value.value !== undefined) {
                    max = Math.max(max, value.value)
                    min = Math.min(min, value.value)
                    feature.properties.value = value.value
                }
            }
            const scope = max - min, size = COLORS.length - 1
            console.log(max, min, scope, size)
            function getColor(value) {
                if (value === undefined) {
                    return "grey"
                }
                const index = Math.floor((value - min) * size / scope)
                console.log(value, index)
                return COLORS[index]
            }
            function style(feature) {
                return {
                    weight: 2,
                    opacity: 1,
                    color: "white",
                    dashArray: "3",
                    fillOpacity: 0.8,
                    fillColor: getColor(feature.properties.value)
                }
            }
            L.geoJson(features, { "style": style }).addTo(map)
        })
}

export default { displayFrenchMap: displayFrenchMap }