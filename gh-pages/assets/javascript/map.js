/**
 * Tools to display Statistics on a French Map
 */
import "./vendor/leaflet.js"

// Leaflet ``L`` object
const L = window["L"]

// Colors to display on the map. From Yellow to Red.
const COLORS = ["#FFEDA0", "#FED976", "#FEB24C", "#FD8D3C", "#FC4E2A", "#E31A1C", "#BD0026", "#800026"]

/**
 * Load a GeoJson of the french departments
 * @returns {Promise} a promise of a GeoJson
 */
async function loadFrenchGeojson() {
    const response = await fetch("./assets/geojson/french_departments.json")
    return await response.json()
}

/**
 * Create an info element to display on the top right of the map
 * @param {string} title Title of the info element, undefined to use none
 * @returns The created info element. Use ``info.addTo(map)``.
 */
function createInfoElement(title=undefined) {
    let info = L.control()
    info.onAdd = function () {
        this._div = L.DomUtil.create("div", "info")
        this.update()
        return this._div
    }
    info.update = function (props) {
        let html = ""
        if (title) {
            html += "<h4>" + title + "</h4>"
        }
        if (props) {
            html += "<b>Department</b>: " + props.nom + " (" + props.code + ")" + "<br />"
            for (let title in props.info) {
                html += "<b>" + title + "</b>: " + props.info[title] + "<br />"
            }
        } else {
            html += "Hover over a state"
        }
        this._div.innerHTML = html
    }
    return info
}


/**
 * French Map object. Usable to display statistics on french departments.
 */
export class FrenchMap {
    constructor() {
        this.map = L.map("map").setView([46.6309, 2.4527], 5)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 10,
            minZoom: 5,
            attribution: "© OpenStreetMap"
        }).addTo(this.map)
        loadFrenchGeojson()
            .then(geojson => {
                this.features = geojson.features
                this.geojson = L.geoJson(this.features)
                this.geojson.addTo(this.map)
            })
    }

    /**
     * Set the values to display.
     * Values must contain data for every department (01-95).
     * It must be formed as ``values[int(department)] = valueToDisplay``
     * @param {object} values Object containing values to link to each departement.
     *  An undefined value under ``value`` attribute will be treated as ``no data``
     * @param {string} title Title of the values
     */
    setValues(values, title=undefined) {
        this.max = -1
        this.min = 999999
        for (const feature of this.features) {
            const department = parseInt(feature.properties.code)
            let value = values[department.toString()]
            if (value.value !== undefined) {
                this.max = Math.max(this.max, value.value)
                this.min = Math.min(this.min, value.value)
                feature.properties.value = value.value
            }
            feature.properties.info = value.info
        }
        this.scope = this.max - this.min

        this.geojson.removeFrom(this.map)
        this.geojson = L.geoJson(
            this.features,
            {
                "style": feature => this.styleForFeature(feature),
                onEachFeature: (feature, layer) => {
                    layer.on({
                        mouseover: e => this.highlightFeature(e),
                        mouseout: e => this.resetHighlight(e),
                        click: e => this.zoomToFeature(e)
                    })
                }
            }
        )
        this.geojson.addTo(this.map)

        if (this.info) {
            this.map.removeControl(this.info)
        }
        this.info = createInfoElement(title)
        this.info.addTo(this.map)

        this.addColorsLegend()
    }

    /**
     * Add a legend that explain colors.
     * Uses ``max`` and ``min`` values.
     * Override existing legend.
     */
    addColorsLegend() {
        if (this.legend) {
            this.map.removeControl(this.legend)
        }
        this.legend = L.control({ position: "bottomright" })
        const step = this.scope / COLORS.length
        this.legend.onAdd = () => {
            let div = L.DomUtil.create("div", "info legend")
            for (let i = 0; i < COLORS.length; i++) {
                let start = this.min + i * step
                let end = start + step
                div.innerHTML +=
                    "<i style=\"background:" + COLORS[i] + "\"></i> " +
                    start.toFixed(2) + " &ndash; " + end.toFixed(2) + "<br>"
            }
            return div
        }
        this.legend.addTo(this.map)
    }

    /**
     * Return the color to apply for a value
     * @param {number} value
     * @returns The color, as a style value, to apply
     */
    colorForValue(value) {
        if (value === undefined) {
            return "grey"
        }
        const index = Math.floor((value - this.min) * (COLORS.length - 1) / this.scope)
        return COLORS[index]
    }

    /**
     * Return the style to apply to a particular feature
     * @param {object} feature Part of the Map
     * @returns style object to apply
     */
    styleForFeature(feature) {
        return {
            weight: 2,
            opacity: 1,
            color: "white",
            dashArray: "3",
            fillOpacity: 0.8,
            fillColor: this.colorForValue(feature.properties.value)
        }
    }

    /**
     * Highlight the feature ``e.target``.
     * @param {object} e Event
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
     * @param {object} e event
     */
    resetHighlight(e) {
        this.geojson.resetStyle(e.target)
        this.info.update()
    }

    /**
     * Zoom on the feature ``e.target``.
     * @param {object} e event
     */
    zoomToFeature(e) {
        this.map.fitBounds(e.target.getBounds())
    }
}

export default { FrenchMap }
