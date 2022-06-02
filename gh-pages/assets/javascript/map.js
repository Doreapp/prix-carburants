
import "./vendor/leaflet.js"

const L = window["L"]

const COLORS = ["#FFEDA0", "#FED976", "#FEB24C", "#FD8D3C", "#FC4E2A", "#E31A1C", "#BD0026", "#800026"]

/**
 * Class to highlight some part of a map
 */
class Highlighter {
    /**
     * @param {object} map Leaflet map object
     * @param {object} geojson Leaflet geojson object
     */
    constructor(map, geojson) {
        this.geojson = geojson
        this.map = map
    }

    /**
     * Highlight the feature ``e.target``.
     * @param {*} e Event
     */
    highlightFeature(e) {
        var layer = e.target
        layer.setStyle({
            weight: 5,
            dashArray: "",
            fillOpacity: 0.9
        })
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront()
        }
    }

    /**
     * Reset the highlight of the feature ``e.target``.
     * @param {*} e event
     */
    resetHighlight(e) {
        this.geojson.resetStyle(e.target)
    }

    /**
     * Zoom on the feature ``e.target``.
     * @param {*} e event
     */
    zoomToFeature(e) {
        this.map.fitBounds(e.target.getBounds())
    }
}




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
            function getColor(value) {
                if (value === undefined) {
                    return "grey"
                }
                const index = Math.floor((value - min) * size / scope)
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
            let highlighter = new Highlighter(map, undefined)
            highlighter.geojson = L.geoJson(
                features,
                {
                    "style": style,
                    onEachFeature: (feature, layer) => {
                        layer.on({
                            mouseover: e => highlighter.highlightFeature(e),
                            mouseout: e => highlighter.resetHighlight(e),
                            click: e => highlighter.zoomToFeature(e)
                        })
                    }
                }
            ).addTo(map)
        })
}

export default { displayFrenchMap: displayFrenchMap }