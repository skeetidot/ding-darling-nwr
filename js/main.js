// Define Global Variables

// Wikimedia basemap tiles
var Wikimedia = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
    attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
    minZoom: 1,
    maxZoom: 19
});


// Initialize global variables for the layer groups that will be included in the layer list
var trailFeaturesLayerGroup = L.featureGroup(),
    visitorServiceFeaturesLayerGroup = L.featureGroup(),
    eBirdHotspotsLayerGroup = L.featureGroup();


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


// Initialize a global variable to hold the current location
var myLocation = null;


// Initialize a global variable that will hold the marker at the current location
var locationMarker = null;



// Initialize global variables for icons

// Create the bird marker
// Plugin Source: https://github.com/lvoogdt/Leaflet.awesome-markers
// Font Awesome Markers: https://fontawesome.com/icons?from=io
var birdIcon = L.AwesomeMarkers.icon({
    prefix: 'fa', // font awesome
    icon: 'crow',
    markerColor: 'cadetblue', // background color
    iconColor: 'white' // foreground color
});


// Create a marker for the user's current location
var myLocationIcon = L.AwesomeMarkers.icon({
    prefix: 'fa', // font awesome
    icon: 'location-arrow',
    markerColor: 'blue', // background color
    iconColor: 'white' // foreground color
});


// Create a marker for a driving tour
var drivingTourIcon = L.icon({
    iconUrl: "icons/4_driving_tour.png"
});

// Create a marker for a fishing point
var fishingPointIcon = L.icon({
    iconUrl: "icons/5_fishing.png"
});

// Create a marker for a fishing pier
var fishingPierIcon = L.icon({
    iconUrl: "icons/6_fishing_pier.png"
});

// Create a marker for a hand launch / small boat launch
var smallBoatLaunchIcon = L.icon({
    iconUrl: "icons/8_hand_launch_small_boat_launch.png"
});

// Create a marker for an information point
var infoPointIcon = L.icon({
    iconUrl: "icons/11_information.png"
});

// Create a marker for an interpretive sign
var interpretiveSignIcon = L.icon({
    iconUrl: "icons/12_interpretive_sign.png"
});

// Create a marker for a scenic viewpoint
var scenicViewpointIcon = L.icon({
    iconUrl: "icons/14_scenic_viewpoint.png"
});

// Create a marker for an observation deck
var observationDeckIcon = L.icon({
    iconUrl: "icons/15_observation_deck.png"
});

// Create a marker for a parking area
var parkingIcon = L.icon({
    iconUrl: "icons/16_parking.png"
});

// Create a marker for a picnic area
var picnicAreaIcon = L.icon({
    iconUrl: "icons/17_picnic_area.png"
});

// Create a marker for a restroom
var restroomIcon = L.icon({
    iconUrl: "icons/18_restroom.png"
});

// Create a marker for a restroom
var pavilionIcon = L.icon({
    iconUrl: "icons/19_pavilion.png"
});

// Create a marker for a trailhead
var trailheadIcon = L.icon({
    iconUrl: "icons/20_trailhead.png"
});

// Create a marker for a lighthouse
var lighthouseIcon = L.icon({
    iconUrl: "icons/23_lighthouse.png"
});

// Create a marker for beach access
var beachAccessIcon = L.icon({
    iconUrl: "icons/35_beach_access.png"
});



// Set a global variable for the CARTO username
var cartoUserName = "lewinkler2";


// Set global variables for the CARTO database queries

// SQL queries to get all features from each layer
var sqlQueryRefugeBoundary = "SELECT * FROM refuge_boundary",
    sqlQueryRoads = "SELECT * FROM roads WHERE f_class IN (1, 2)",
    sqlQueryTrails = "SELECT * FROM trails",
    sqlQueryTrailFeatures = "SELECT * FROM trail_features WHERE feature_type IN ('Bench', 'Sign', 'Bridge')",
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
    layers: [Wikimedia, trailFeaturesLayerGroup, visitorServiceFeaturesLayerGroup, eBirdHotspotsLayerGroup] // Set the layers to build into the layer control
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

    // Load all of the data
    loadRoads();
    loadTrails();
    loadTrailFeatures();
    loadVisitorServiceFeatures();
    loadeBirdHotspots();
    loadParkingLots();
    loadRefugeBoundary();

    // Get the user's current location
    locateUser();

});


// Function that locates the user
function locateUser() {
    map.locate({
        setView: true,
        maxZoom: 13
    });
}


// Set the current location to the point clicked on the map
map.on('click', locationFound);

// Map Event Listener listening for when the user location is found
// When the location is found, run the locationFound(e) function
map.on('locationfound', locationFound);

// Map Event Listener listening for when the user location is not found
// If the location is not found, run the locationNotFound(e) function
map.on('locationerror', locationNotFound);


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
                    weight: 1.5, // set stroke weight
                    opacity: 1, // set stroke opacity
                    fillOpacity: 0.25, // override default fill opacity
                    fillColor: '#bbe1a4' // set fill color
                };
            }

        }).addTo(map);

        // Bring the layer to the back of the layer order
        refugeBoundary.bringToBack();
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
                layer.bindPopup(feature.properties.route_name + " (" + feature.properties.surface_type + ")");

            }

        }).addTo(map);

        // Bring the layer to the back of the layer order
        parkingLots.bringToBack();
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

        }).addTo(map);

        // Bring the layer to the back of the layer order
        roads.bringToBack();
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
                    dashArray: '5, 5' // set the dashed line pattern
                    //lineJoin: 'miter' // set the line join type
                    // Line Join Types: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linejoin
                };
            },

            // Loop through each feature
            onEachFeature: function (feature, layer) {

                var length = parseFloat(feature.properties.sec_length).toFixed(2).toLocaleString()

                // Bind the nameto a popup
                layer.bindPopup(feature.properties.name + " (" + length + " mi)");

            }

        }).addTo(map);

        // Bring the layer to the back of the layer order
        trails.bringToBack();

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
                layer.bindPopup(feature.properties.feature_type);

            }

        }).addTo(trailFeaturesLayerGroup);

        // Turn the layer off by default
        map.removeLayer(trailFeaturesLayerGroup);
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

                // Get the feature category to use to set its icon
                var featureType = feature.properties.category;

                // Get the appropriate visitor service icon based on the feature category
                return L.marker(latlng, {
                    icon: getVisitorServiceIcon(featureType)
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
                    icon: birdIcon
                });

            },

            // Loop through each feature
            onEachFeature: function (feature, layer) {

                // Bind the nameto a popup
                layer.bindPopup(feature.properties.name + " Birding Hotspot");

            }

        }).addTo(eBirdHotspotsLayerGroup);

        // Turn the layer off by default
        map.removeLayer(eBirdHotspotsLayerGroup);
    });
};


function getVisitorServiceIcon(category) {

    if (category == 4) {
        return drivingTourIcon;
    } else if (category == 5) {
        return fishingPointIcon;
    } else if (category == 6) {
        return fishingPierIcon;
    } else if (category == 8) {
        return smallBoatLaunchIcon;
    } else if (category == 11) {
        return infoPointIcon;
    } else if (category == 12) {
        return interpretiveSignIcon;
    } else if (category == 14) {
        return scenicViewpointIcon;
    } else if (category == 15) {
        return observationDeckIcon;
    } else if (category == 16) {
        return parkingIcon;
    } else if (category == 17) {
        return picnicAreaIcon;
    } else if (category == 18) {
        return restroomIcon;
    } else if (category == 19) {
        return pavilionIcon;
    } else if (category == 20) {
        return trailheadIcon;
    } else if (category == 23) {
        return lighthouseIcon;
    } else if (category == 35) {
        return beachAccessIcon;
    }


};

// Function that will run when the location of the user is found
function locationFound(e) {

    // Get the current location
    myLocation = e.latlng;

    // Remove locationMarker if it's already on the map
    if (map.hasLayer(locationMarker)) {
        map.removeLayer(locationMarker);
    };

    // Add the locationMarker layer to the map at the current location
    locationMarker = L.marker(e.latlng, {
        icon: myLocationIcon
    });

    //map.addLayer(locationMarker);
    locationMarker.addTo(map);

    console.log(myLocation);
};


// Function that will run if the location of the user is not found
function locationNotFound(e) {

    // Display the default error message from Leaflet
    alert(e.message);
};