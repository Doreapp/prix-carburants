/**
 * Tools to display Statistics on a French Map
 */
import "./vendor/leaflet.js"

// Leaflet ``L`` object
const L = window["L"]

// Colors to display on the map. From Yellow to Red.
const COLORS = [
    "#FFEDA0",
    "#FED976",
    "#FEB24C",
    "#FD8D3C",
    "#FC4E2A",
    "#E31A1C",
    "#BD0026",
    "#800026",
]

// Map-related constants
const MAP_CONSTANTS = {
    // eslint-disable-next-line quotes
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    center: [46.6309, 2.4527],
    minZoom: 6,
    maxZoom: 10,
    markersZoom: 8, // Min zoom level to display markers
    popupsZoom: 10, // Min zoom level to display popups
    markerConfig: {
        stroke: false,
        fillColor: "#155799",
        fillOpacity: 0.6,
        radius: 10,
    },
}

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
function createInfoElement(title = undefined) {
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
            html +=
                "<b>Département</b>: " + props.nom + " (" + props.code + ")" + "<br />"
            for (let title in props.info) {
                html += "<b>" + title + "</b>: " + props.info[title] + "<br />"
            }
        } else {
            html += "Survolez un département"
        }
        this._div.innerHTML = html
    }
    return info
}

/**
 * Map object
 */
export class Map {
    constructor(idSelector = "map") {
        this.map = L.map(idSelector).setView(MAP_CONSTANTS.center, MAP_CONSTANTS.minZoom)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            minZoom: MAP_CONSTANTS.minZoom,
            attribution: MAP_CONSTANTS.attribution,
        }).addTo(this.map)
        this.markers = new L.FeatureGroup()
        this.info = L.control()
        this.info.onAdd = function () {
            this._div = L.DomUtil.create("div", "info")
            this._div.innerHTML = "Zoomez pour voir les points de vente"
            return this._div
        }
        this.info.addTo(this.map)
        this.markersDisplayed = false
        this.popupsDisplayed = false
        this.map.on("zoomend", () => {
            this.onZoom(this.map.getZoom())
        })
        this.map.on("dragend", () => {
            this.onDrag()
        })
    }

    /**
     * Set the HTML text in the info element
     * @param {String} textHTML HTML text to use
     */
    setInfoHTML(textHTML) {
        this.info._div.innerHTML = textHTML
    }

    /**
     * Change the visibility of inbounds popups.
     * If visible is false, then every popup will be closed.
     * Else, inbound popups will be opened and outbound ones closed.
     * @param {boolean} visible Whether to show popups
     */
    changePopupVisibility(visible) {
        this.popupsDisplayed = visible
        const bounds = this.map.getBounds()
        for (const layer of this.markers.getLayers()) {
            if (visible && bounds.contains(layer.getLatLng())) {
                layer.openPopup()
            } else {
                layer.closePopup()
            }
        }
    }

    /**
     * Invalidate displayed data.
     * Recompute which popup should be opened and closed and
     *  what sentence is display in the info.
     */
    invalidate() {
        const zoom = this.map.getZoom()
        if (zoom > MAP_CONSTANTS.popupsZoom) {
            this.changePopupVisibility(true)
        }
        if (zoom < MAP_CONSTANTS.markersZoom) {
            this.setInfoHTML("Zoomez pour voir les points de vente")
        } else {
            this.setInfoHTML("Cliquez sur un point pour plus de détails")
        }
    }

    /**
     * Callback for map dragging
     */
    onDrag() {
        this.invalidate()
    }

    /**
     * Callback for map zooming
     * @param {number} zoom Zoom index
     */
    onZoom(zoom) {
        if (zoom < MAP_CONSTANTS.markersZoom) {
            if (this.markersDisplayed) {
                this.map.removeLayer(this.markers)
                this.setInfoHTML("Zoomez pour voir les points de vente")
            }
            this.markersDisplayed = false
        } else {
            if (!this.markersDisplayed) {
                this.map.addLayer(this.markers)
                this.setInfoHTML("Cliquez sur un point pour plus de détails")
            }
            this.markersDisplayed = true
        }
        if (zoom > MAP_CONSTANTS.popupsZoom) {
            this.changePopupVisibility(true)
        } else if (this.popupsDisplayed) {
            this.changePopupVisibility(false)
        }
    }

    /**
     * Remove all the markers
     */
    clearMarkers() {
        this.markers.clearLayers()
    }

    /**
     * Add a marker to the map
     * @param {number} latitude Latitude of the marker
     * @param {number} longitude Longitude of the marker
     * @param {String} shortInfo HTML text to display in marker's popup
     * @param {String} longInfo HTML text to display in info block, containing more details
     */
    addMarker(latitude, longitude, shortInfo, longInfo) {
        let marker = L.circleMarker(
            [latitude, longitude],
            MAP_CONSTANTS.markerConfig
        )
        marker.bindPopup(shortInfo, {
            autoClose: false,
            closeButton: false,
            closeOnClick: false,
        })
        marker.on("click", () => {
            this.setInfoHTML(longInfo)
        })
        marker.addTo(this.markers)
    }
}

/**
 * Department Map object. Usable to display statistics on french departments.
 */
export class DepartmentMap {
    constructor(idSelector = "map") {
        this.map = L.map(idSelector).setView(MAP_CONSTANTS.center, MAP_CONSTANTS.minZoom)
        this._onready = null
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png", {
            maxZoom: MAP_CONSTANTS.maxZoom,
            minZoom: MAP_CONSTANTS.minZoom,
            attribution: '©OpenStreetMap, ©CartoDB',
        }).addTo(this.map)
        loadFrenchGeojson().then((geojson) => {
            this.features = geojson.features
            this.geojson = L.geoJson(this.features)
            this.geojson.addTo(this.map)
            if (this._onready !== null) {
                this._onready()
            }
        })
    }

    /**
     * Set the values to display.
     * Values must contain data for every department (01-95).
     * It must be formed as ``values[departmentCode] = valueToDisplay``
     * @param {object} values Object containing values to link to each departement.
     *  An undefined value under ``value`` attribute will be treated as ``no data``
     * @param {string} title Title of the values
     */
    setValues(values, title = undefined) {
        if (this.features === undefined) {
            this._onready = () => this.setValues(values, title)
            return
        }
        this.max = -1
        this.min = 999999
        for (const feature of this.features) {
            const departmentCode = feature.properties.code
            let value = values[departmentCode]
            if (value === undefined) {
                console.error("No value for department with code", departmentCode)
                continue
            }
            if (value.value !== undefined) {
                this.max = Math.max(this.max, value.value)
                this.min = Math.min(this.min, value.value)
                feature.properties.value = value.value
            }
            feature.properties.info = value.info
        }
        this.scope = this.max - this.min

        this.geojson.removeFrom(this.map)
        this.geojson = L.geoJson(this.features, {
            style: (feature) => this.styleForFeature(feature),
            onEachFeature: (feature, layer) => {
                layer.on({
                    mouseover: (e) => this.highlightFeature(e),
                    mouseout: (e) => this.resetHighlight(e),
                    click: (e) => this.zoomToFeature(e),
                })
            },
        })
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
                    '<i style="background:' +
                    COLORS[i] +
                    '"></i> ' +
                    start.toFixed(2) +
                    " &ndash; " +
                    end.toFixed(2) +
                    "<br>"
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
        const index = Math.floor(
            ((value - this.min) * (COLORS.length - 1)) / this.scope
        )
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
            fillColor: this.colorForValue(feature.properties.value),
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
            fillOpacity: 0.9,
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

export default { DepartmentMap, Map }
