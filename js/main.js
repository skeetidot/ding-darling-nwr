// Define Global Variables

// Esri basemap tiles
var Esri_WorldGrayCanvas = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
});

var Esri_WorldGrayReference = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
});

var Wikimedia = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
    attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
    minZoom: 1,
    maxZoom: 19
});


// Initialize global variables for the layer groups that will be included in the layer list
var roadsLayerGroup = L.layerGroup(),
    trailsLayerGroup = L.layerGroup(),
    trailFeaturesLayerGroup = L.layerGroup(),
    visitorServiceFeaturesLayerGroup = L.layerGroup(),
    eBirdHotspotsLayerGroup = L.layerGroup();


// Initialize global variables for data layers
var refugeBoundary,
    roads,
    trails,
    trailFeatures,
    parkingLots,
    visitorServiceFeatures,
    eBirdHotspots;


// Initialize global variables for the layer list and overlays
var layerList,
    overlays;


// Initialize global variables for icons

// Creates the bird marker
// Plugin Source: https://github.com/lvoogdt/Leaflet.awesome-markers
// Font Awesome Markers: https://fontawesome.com/icons?from=io
var bird = L.AwesomeMarkers.icon({
    prefix: 'fa', // font awesome
    icon: 'crow',
    markerColor: 'cadetblue', // background color
    iconColor: 'white' // foreground color
});


// Set a global variable for the CARTO username
var cartoUserName = "lewinkler2";


// Set global variables for the CARTO database queries

// SQL queries to get all features from each layer
var sqlQueryRefugeBoundary = "SELECT * FROM refuge_boundary",
    sqlQueryRoads = "SELECT * FROM roads",
    sqlQueryTrails = "SELECT * FROM trails",
    sqlQueryTrailFeatures = "SELECT * FROM trail_features WHERE type_ IN ('Bench', 'Sign', 'Bridge -sf')",
    sqlQueryParkingLots = "SELECT * FROM parking_lots",
    sqlQueryVisitorServiceFeatures = "SELECT * FROM visitor_service_features",
    sqlQueryeBirdHotspots = "SELECT * FROM ebird_hotspots";



// Set the basemap for the layer list
// Only include one basemap so it is not part of the layer list
var baseMaps = {
    "Wikimedia": Wikimedia
};


// Set the overlays to include in the layer list
var overlays = {
    "Roads": roadsLayerGroup,
    "Trails": trailsLayerGroup,
    "Trail Features": trailFeaturesLayerGroup,
    "Points of Interest": visitorServiceFeaturesLayerGroup,
    "eBird Hotspots": eBirdHotspotsLayerGroup
};


// Set the map options
var mapOptions = {
    center: [26.454422, -82.108508], // centered in Ding Darling NWR
    zoom: 13,
    minZoom: 13,
    maxZoom: 19,
    maxBounds: L.latLngBounds([26.586689, -82.259155], [26.398794, -81.867178]), // panning bounds so the user doesn't pan too far away from the refuge
    bounceAtZoomLimits: false, // Set it to false if you don't want the map to zoom beyond min/max zoom and then bounce back when pinch-zooming
    layers: [Wikimedia, roadsLayerGroup, trailsLayerGroup, trailFeaturesLayerGroup, visitorServiceFeaturesLayerGroup, eBirdHotspotsLayerGroup] // Set the layers to build into the layer control
};


// Create a new Leaflet map with the map options
var map = L.map('map', mapOptions);


// Add the zoom control in the top left corner
map.zoomControl.setPosition('topleft');


// Add the layer control to the map
layerList = L.control.layers(baseMaps, overlays, {
    collapsed: false, // Keep the layer list open
    autoZIndex: true, // Assign zIndexes in increasing order to all of its layers so that the order is preserved when switching them on/off
    hideSingleBase: true // Hide the base layers section when there is only one layer
}).addTo(map);


// Add the basemap
map.addLayer(Wikimedia);


// Run the load data functions automatically when document loads
$(document).ready(function () {
    loadRefugeBoundary();
    loadParkingLots();
    loadRoads();
    loadTrails();
    loadTrailFeatures();
    loadVisitorServiceFeatures();
    loadeBirdHotspots();
});


// Function to load the refuge boundary onto the map
function loadRefugeBoundary() {

    // If the layer is already shown on the map, remove it
    if (map.hasLayer(refugeBoundary)) {
        map.removeLayer(refugeBoundary);
    };

    // Run the specified sqlQuery from CARTO, return it as a JSON, convert it to a Leaflet GeoJson, and add it to the map with a popup

    // For the data source, enter the URL that goes to the SQL API, including our username and the SQL query
    $.getJSON("https://" + cartoUserName + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlQueryRefugeBoundary, function (data) {

        // Convert the JSON to a Leaflet GeoJson
        refugeBoundary = L.geoJson(data, {

            // Create an initial style for each feature
            style: function (feature) {
                return {
                    color: '#5c8944', // set stroke color
                    weight: 1, // set stroke weight
                    opacity: 0.7, // set stroke opacity
                    fillOpacity: 0.25, // override default fill opacity
                    fillColor: '#bbe1a4' // set fill color
                };
            }

        }).addTo(map);
    });
};


// Function to load the refuge parking lots onto the map
function loadParkingLots() {

    // If the layer is already shown on the map, remove it
    if (map.hasLayer(parkingLots)) {
        map.removeLayer(parkingLots);
    };

    // Run the specified sqlQuery from CARTO, return it as a JSON, convert it to a Leaflet GeoJson, and add it to the map with a popup

    // For the data source, enter the URL that goes to the SQL API, including our username and the SQL query
    $.getJSON("https://" + cartoUserName + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlQueryParkingLots, function (data) {

        // Convert the JSON to a Leaflet GeoJson
        parkingLots = L.geoJson(data, {

            // Create an initial style for each feature
            style: function (feature) {
                return {
                    color: '#666666', // set stroke color
                    weight: 1, // set stroke weight
                    opacity: 1, // set stroke opacity
                    fillColor: '#999999', // set fill color
                    fillOpacity: 0.5 // set fill opacity
                };
            },
            
            // Loop through each feature
            onEachFeature: function (feature, layer) {

                // Bind the nameto a popup
                layer.bindPopup(feature.properties.route_name + " (" + feature.properties.surface_ty + ")");

            }               

        }).addTo(map);
    });
};


// Function to load the refuge roads onto the map
function loadRoads() {

    // If the layer is already shown on the map, remove it
    if (map.hasLayer(roads)) {
        map.removeLayer(roads);
    };

    // Run the specified sqlQuery from CARTO, return it as a JSON, convert it to a Leaflet GeoJson, and add it to the map with a popup

    // For the data source, enter the URL that goes to the SQL API, including our username and the SQL query
    $.getJSON("https://" + cartoUserName + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlQueryRoads, function (data) {

        // Convert the JSON to a Leaflet GeoJson
        roads = L.geoJson(data, {

            // Create an initial style for each feature
            style: function (feature) {
                return {
                    color: '#9e559c', // set stroke color
                    weight: 2.5, // set stroke weight
                    opacity: 1 // set stroke opacity
                };
            },
            
            // Loop through each feature
            onEachFeature: function (feature, layer) {

                // Bind the nameto a popup
                layer.bindPopup(feature.properties.route_name);

            }               

        }).addTo(roadsLayerGroup);
    });
};


// Function to load the refuge trails onto the map
function loadTrails() {

    // If the layer is already shown on the map, remove it
    if (map.hasLayer(trails)) {
        map.removeLayer(trails);
    };

    // Run the specified sqlQuery from CARTO, return it as a JSON, convert it to a Leaflet GeoJson, and add it to the map with a popup

    // For the data source, enter the URL that goes to the SQL API, including our username and the SQL query
    $.getJSON("https://" + cartoUserName + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlQueryTrails, function (data) {

        // Convert the JSON to a Leaflet GeoJson
        trails = L.geoJson(data, {

            // Create an initial style for each feature
            style: function (feature) {
                return {
                    color: '#e60000', // set stroke color
                    weight: 1.5, // set stroke weight
                    opacity: 1, // set stroke opacity
                    dashArray: '5, 5', // set the dashed line pattern
                    lineJoin: 'miter' // set the line join type
                    // Line Join Types: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linejoin
                };
            },
            
            // Loop through each feature
            onEachFeature: function (feature, layer) {

                // Bind the nameto a popup
                layer.bindPopup(feature.properties.name);

            }               

        }).addTo(trailsLayerGroup);
    });
};


// Function to load the refuge trail features onto the map
function loadTrailFeatures() {

    // If the layer is already shown on the map, remove it
    if (map.hasLayer(trailFeatures)) {
        map.removeLayer(trailFeatures);
    };

    // Run the specified sqlQuery from CARTO, return it as a JSON, convert it to a Leaflet GeoJson, and add it to the map with a popup

    // For the data source, enter the URL that goes to the SQL API, including our username and the SQL query
    $.getJSON("https://" + cartoUserName + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlQueryTrailFeatures, function (data) {

        // Convert the JSON to a Leaflet GeoJson
        trailFeatures = L.geoJson(data, {

            // Create a style for the points
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    fillColor: '#5d0000',
                    fillOpacity: 1,
                    color: '#ffffff',
                    weight: 0.25,
                    opacity: 1,
                    radius: 2.5
                });
            },
            
            // Loop through each feature
            onEachFeature: function (feature, layer) {

                // Bind the nameto a popup
                layer.bindPopup(feature.properties.type_);

            }               

        }).addTo(trailFeaturesLayerGroup);
    });

};



// Function to load the refuge visitor service features (points of interest) onto the map
function loadVisitorServiceFeatures() {

    // If the layer is already shown on the map, remove it
    if (map.hasLayer(visitorServiceFeatures)) {
        map.removeLayer(visitorServiceFeatures);
    };

    // Run the specified sqlQuery from CARTO, return it as a JSON, convert it to a Leaflet GeoJson, and add it to the map with a popup

    // For the data source, enter the URL that goes to the SQL API, including our username and the SQL query
    $.getJSON("https://" + cartoUserName + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlQueryVisitorServiceFeatures, function (data) {

        // Convert the JSON to a Leaflet GeoJson
        visitorServiceFeatures = L.geoJson(data, {

            // Create a style for the points
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    fillColor: '#ffffff',
                    fillOpacity: 1,
                    color: '#3e3e3e',
                    weight: 0.5,
                    opacity: 1,
                    radius: 10
                });
            },
            
            // Loop through each feature
            onEachFeature: function (feature, layer) {

                // Bind the nameto a popup
                layer.bindPopup(feature.properties.name);

            }            

        }).addTo(visitorServiceFeaturesLayerGroup);
    });
};


// Function to load eBird hotspots near the refuge onto the map
function loadeBirdHotspots() {

    // If the layer is already shown on the map, remove it
    if (map.hasLayer(eBirdHotspots)) {
        map.removeLayer(eBirdHotspots);
    };

    // Run the specified sqlQuery from CARTO, return it as a JSON, convert it to a Leaflet GeoJson, and add it to the map with a popup

    // For the data source, enter the URL that goes to the SQL API, including our username and the SQL query
    $.getJSON("https://" + cartoUserName + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlQueryeBirdHotspots, function (data) {

        // Convert the JSON to a Leaflet GeoJson
        eBirdHotspots = L.geoJson(data, {

            // Create a style for the points
            pointToLayer: function (feature, latlng) {

                return L.marker(latlng, {
                    icon: bird
                });

            },
            
            // Loop through each feature
            onEachFeature: function (feature, layer) {

                // Bind the nameto a popup
                layer.bindPopup(feature.properties.name + " Birding Hotspot");

            }               

        }).addTo(eBirdHotspotsLayerGroup);
        
        map.removeLayer(eBirdHotspotsLayerGroup);
    });
};