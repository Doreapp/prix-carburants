
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
        this.info = L.control()
        this.info.onAdd = function () {
            this._div = L.DomUtil.create("div", "info")
            this.update()
            return this._div
        }
        this.info.update = function (props) {
            let html = "<h4>Prix du SP95</h4>"
            if (props) {
                html += "<b>Department</b>: " + props.nom + " (" + props.code+")" + "<br />"
                for (let title in props.info) {
                    html += "<b>"+title+"</b>: " + props.info[title] + "<br />"
                }
            } else {
                html += "Hover over a state"
            }
            this._div.innerHTML = html
        }
        this.info.addTo(map)
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
        this.info.update(layer.feature.properties)
    }

    /**
     * Reset the highlight of the feature ``e.target``.
     * @param {*} e event
     */
    resetHighlight(e) {
        this.geojson.resetStyle(e.target)
        this.info.update()
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
 * Add a legend showing which color correspond to which value
 * @param {object} map Leaflet map object
 * @param {number} scope Values scope (i.e. max-min)
 * @param {number} min Values minimum value
 */
function addColorsLegend(map, scope, min) {
    let legend = L.control({position: "bottomright"})
    const step = scope/COLORS.length
    legend.onAdd = function () {
        let div = L.DomUtil.create("div", "info legend")
        for (let i = 0; i < COLORS.length; i++) {
            let start = min + i*step
            let end = start + step
            div.innerHTML +=
                "<i style=\"background:" + COLORS[i] + "\"></i> " +
                start.toFixed(2) + " &ndash; " + end.toFixed(2) + "<br>"
        }
        return div
    }
    legend.addTo(map)
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
                feature.properties.info = value.info
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
            addColorsLegend(map, scope, min)
        })
}

export default { displayFrenchMap: displayFrenchMap }