// Define Global Variables

// Wikimedia basemap tiles
var Wikimedia = L.tileLayer('https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png', {
    attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
    minZoom: 1,
    maxZoom: 19
});

var Esri_WorldImagery = L.tileLayer('https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '<a href="http://www.arcgis.com/home/item.html?id=da10cf4ba254469caf8016cd66369157">Esri</a>',
    maxNativeZoom: 18,
    maxZoom: 19
});

// Initialize global variables for the feature groups that will be included in the layer list
var trailFeaturesLayerGroup = L.featureGroup(),
    visitorServiceFeaturesLayerGroup = L.featureGroup(),
    eBirdHotspotsLayerGroup = L.featureGroup(),
    wildlifeObservationsLayerGroup = L.featureGroup();


// Initialize global variables for data layers
var refugeBoundary,
    roads,
    trails,
    trailFeatures,
    parkingLots,
    visitorServiceFeatures,
    eBirdHotspots,
    wildlifeObservations;


// Initialize global variables for the layer list and overlays
var layerList,
    overlays;


// Initialize a global variable to hold the current location
var myLocation = null;


// Initialize a global variable that will hold the marker at the current location
var locationMarker = null;


// Initialize the default bounds of the map
var bounds = [[26.421850916199865, -82.30390548706056],
              [26.512515912899676, -81.97431564331055]]


// Initialize the list of common species for each species family
var speciesJsonList = {
    
    "Birds" : 
    [
        {"species" : "Anhinga"},
        {"species" : "Belted Kingfisher"},
        {"species" : "Black-bellied Plover"},
        {"species" : "Blue-gray Gnatcatcher"},
        {"species" : "Blue-winged Teal"},
        {"species" : "Carolina Wren"},
        {"species" : "Common Gallinule"},
        {"species" : "Common Grackle"},
        {"species" : "Common Ground Dove"},
        {"species" : "Double-crested Cormorant"},
        {"species" : "Dunlin"},
        {"species" : "Eurasian Collared Dove"},
        {"species" : "Fish Crow"},
        {"species" : "Gray Catbird"},
        {"species" : "Great Blue Heron"},
        {"species" : "Great Crested Flycatcher"},
        {"species" : "Great Egret"},
        {"species" : "Greater Yellowlegs"},
        {"species" : "Green Heron"},
        {"species" : "Killdeer"},
        {"species" : "Least Sandpiper"},
        {"species" : "Lesser Yellowlegs"},
        {"species" : "Little Blue Heron"},
        {"species" : "Mottled Duck"},
        {"species" : "Mourning Dove"},
        {"species" : "Northern Cardinal"},
        {"species" : "Osprey"},
        {"species" : "Palm Warbler"},
        {"species" : "Pied-billed Grebe"},
        {"species" : "Pileated Woodpecker"},
        {"species" : "Prairie Warbler"},
        {"species" : "Red-bellied Woodpecker"},
        {"species" : "Red-shouldered Hawk"},
        {"species" : "Reddish Egret"},
        {"species" : "Roseate Spoonbill"},
        {"species" : "Ruddy Turnstone"},
        {"species" : "Semipalmated Plover"},
        {"species" : "Short-billed Dowitcher"},
        {"species" : "Snowy Egret"},
        {"species" : "Spotted Sandpiper"},
        {"species" : "Tricolored Heron"},
        {"species" : "Turkey Vulture"},
        {"species" : "Western Sandpiper"},
        {"species" : "White Ibis"},
        {"species" : "White-eyed Vireo"},
        {"species" : "Willet"},
        {"species" : "Yellow-crowned Night Heron"},
        {"species" : "Yellow-throated Warbler"}     
    ],
    "Mammals" : 
    [
        {"species" : "Bobcat"},
        {"species" : "Bottlenose Dolphin"},
        {"species" : "Coyote"},
        {"species" : "Florida Manatee"},
        {"species" : "Marsh Rabbit"},
        {"species" : "Nine-banded Armadillo"},
        {"species" : "Northern Raccoon"},
        {"species" : "River Otter"},
        {"species" : "Virginia Opossum"}     
    ],
    "Reptiles" : 
    [
        {"species" : "American Alligator"},
        {"species" : "Black Racer"},
        {"species" : "Brown Anole Lizard"},
        {"species" : "Chicken Turtle"},
        {"species" : "Diamondback Terrapin"},
        {"species" : "Florida Banded Water Snake"},
        {"species" : "Florida Box Turtle"},
        {"species" : "Florida Softshell Turtle"},
        {"species" : "Gopher Tortoise"},
        {"species" : "Green Anole Lizard"},
        {"species" : "Green Iguana"},
        {"species" : "Mangrove Salt Marsh Water Snake"},
        {"species" : "Peninsula Cooter Turtle"},
        {"species" : "Red Rat Snake / Corn Snake"},
        {"species" : "Ring-necked Snake"},
        {"species" : "Southern Five-lined Skink"},
        {"species" : "Yellow Rate Snake"}
    ],
    "Amphibians" : 
    [
        {"species" : "Cuban Tree Frog"},
        {"species" : "Pig Frog"},
        {"species" : "Southern Leopard Frog"},
        {"species" : "Southern Toad"}
    ],
    "Insects and Arachnids" : 
    [
        {"species" : "Blue Ceraunus Butterfly"},
        {"species" : "Cloudless Sulphur Butterfly"},
        {"species" : "Giant Swallowtail Butterfly"},
        {"species" : "Great Southern White Butterfly"},
        {"species" : "Gulf Fritillary Butterfly"},
        {"species" : "Halloween Pennant Butterfly"},
        {"species" : "Lubber Grasshopper"},
        {"species" : "Mangrove Buckeye Butterfly"},
        {"species" : "Mangrove Skipper"},
        {"species" : "Monarch Butterfly"},
        {"species" : "White Peacock Butterfly"},
        {"species" : "Zebra Longwing Butterfly"}
    ],
    "Crustaceans" : 
    [
        {"species" : "Fiddler Crab"},
        {"species" : "Horseshoe Crab"},
        {"species" : "Mangrove Tree Crab"}
    ]    
};


// Create a variable to store the species family dropdown
var speciesFamilyDropdown = $("#speciesFamilyDropdown")


// Update the species dropdown when the user selects a species family
speciesFamilyDropdown.on('change', function () {
    
    // Create a variable to store the selected species family
    var selectedSpeciesFamily = $("#speciesFamilyDropdown option:selected").text();
    
    // Update the species dropdown based on the selected species family
    updateSpeciesDropdown(selectedSpeciesFamily);
});


// Function to update the species dropdown based on the selected species family
var updateSpeciesDropdown = function (speciesFamily) {
    
    // Initialize a variable to store the species list
    var listItems = "";
    
    // Loop through the list of species for the selected species family
    for (var i = 0; i < speciesJsonList[speciesFamily].length; i++) {
        
        // Add a new <option> value for the current species
        listItems += "<option value='" + speciesJsonList[speciesFamily][i].species + "'>" + speciesJsonList[speciesFamily][i].species + "</option>";
    }
    
    // Add the species list to the species dropdown
    $("#ui-controls #speciesDropdown").html(listItems);
}


// Create a variable to store the filter by theme dropdown
var filterByThemeDropdown = $("#filterDropdown");


// Update the species dropdown when the user selects a species family
filterByThemeDropdown.on('change', function () {
    
    // Create a variable to store the value of the selected theme
    var selectedTheme = $("#filterDropdown option:selected").val();
    
    // Update the points of interest based on the selected theme
    filterPointsOfInterest(selectedTheme);
    
});

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

// Create a marker for a pavilion
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
    sqlQueryRoads = "SELECT * FROM roads WHERE f_class IN (1, 2)", // all public roads
    sqlQueryTrails = "SELECT * FROM trails",
    sqlQueryTrailFeatures = "SELECT * FROM trail_features WHERE feature_type IN ('Bench', 'Sign', 'Bridge')",
    sqlQueryParkingLots = "SELECT * FROM parking_lots",
    sqlQueryVisitorServiceFeatures = "SELECT * FROM visitor_service_features",
    sqlQueryeBirdHotspots = "SELECT * FROM ebird_hotspots",
    sqlQueryWildlifeObservations = "SELECT * from wildlife_observations_collector";


// Initialize a SQL query for the filtered visitor service features
// Set the initial value to show all features
var sqlQueryFilteredVisitorServiceFeatures = sqlQueryVisitorServiceFeatures;


// Set the basemap for the layer list
// If only one basemap is included, it is not part of the layer list
var baseMaps = {
    "Streets": Wikimedia,
    "Imagery": Esri_WorldImagery
};


// Set the overlays to include in the layer list
var overlays = {
    "Trail Features": trailFeaturesLayerGroup,
    "Points of Interest": visitorServiceFeaturesLayerGroup,
    "eBird Hotspots": eBirdHotspotsLayerGroup,
    "Wildlife Observations": wildlifeObservationsLayerGroup
};


// Set the map options
var mapOptions = {
    center: [26.474422, -82.058508], // centered in Ding Darling NWR
    zoom: 13,
    minZoom: 13,
    maxZoom: 19,
    zoomControl: false, // do not add a zoom control by default (it will be added based on screen width)
    maxBounds: L.latLngBounds([26.586689, -82.409155], [26.398794, -81.867178]), // panning bounds so the user doesn't pan too far away from the refuge
    bounceAtZoomLimits: false, // Set it to false if you don't want the map to zoom beyond min/max zoom and then bounce back when pinch-zooming
    layers: [trailFeaturesLayerGroup, visitorServiceFeaturesLayerGroup, eBirdHotspotsLayerGroup, wildlifeObservationsLayerGroup] // Set the layers to build into the layer control
};


// Create a new Leaflet map with the map options
var map = L.map('map', mapOptions);


// Initialize a zoom control that will show in the top right corner based on the detected screen width
var zoomControl = L.control.zoom({
    position: 'topleft'
});


// Add the layer control to the map
layerList = L.control.layers(baseMaps, overlays, {
    collapsed: false, // Keep the layer list open
    autoZIndex: true, // Assign zIndexes in increasing order to all of its layers so that the order is preserved when switching them on/off
    // hideSingleBase: true // Hide the base layers section when there is only one layer
}).addTo(map);


// Create Leaflet Draw Control for the draw tools and toolbox
var drawControl = new L.Control.Draw({

    // Disable drawing of polygons, polylines, rectangles, and circles
    // Users will only be able to draw markers (points)
    draw: {
        polygon: false,
        polyline: false,
        rectangle: false,
        circle: false
    },

    // Disable editing and deleting points
    edit: false,
    remove: false,
    position: 'topright'
});


// Boolean global variable used to control visiblity
// Do not show the draw control on the map initially
// It will be displayed once the user clicks Start Editing
var controlOnMap = false;


// Create variable for Leaflet.draw features
var drawnItems = new L.FeatureGroup();


// Add the basemap
map.addLayer(Wikimedia);


// Build the sidebar and add it to the map
// Source: https://github.com/nickpeihl/leaflet-sidebar-v2, with show/hide functionality from
// https://github.com/turbo87/leaflet-sidebar/
var sidebar = L.control.sidebar({
    autopan: true, // whether to maintain the centered map point when opening the sidebar
    closeButton: true, // whether to add a close button to the panes
    container: 'sidebar', // the DOM container or #ID of a predefined sidebar container that should be used
    position: 'left', // left or right
}).addTo(map);


// Run the load data functions automatically when document loads
$(document).ready(function () {

    // Load all of the data
    loadRoads();
    loadTrails();
    loadTrailFeatures();
    loadVisitorServiceFeatures(sqlQueryFilteredVisitorServiceFeatures);
    loadeBirdHotspots();
    loadWildlifeObservations();
    loadParkingLots();
    loadRefugeBoundary();

    // Get the user's current location
    locateUser();

    // Detect the screen size and get the appropriate sidebar and zoom display
    getResponsiveDisplay();

});


// Function that locates the user
function locateUser() {
    map.locate({
        setView: true,
        maxZoom: 13
    });
}


// When the window is resized
$(window).resize(function () {

    // Detect the screen size and get the appropriate sidebar and zoom display
    getResponsiveDisplay();

});


// Map Event Listener listening for when the user location is found
// When the location is found, run the locationFound(e) function
map.on('locationfound', locationFound);


// Map Event Listener listening for when the user location is not found
// If the location is not found, run the locationNotFound(e) function
map.on('locationerror', locationNotFound);


// Function that gets the screen width and customizes the display
function getResponsiveDisplay() {

    // Get the screen width
    var screenWidth = screen.width;
    console.log("Screen Width: " + screenWidth);

    // Get the header text
    var headerText = $('#home h1');
    
    // Get the header text
    var submitHeaderText = $('#submitTab h1');

    // If the screen width is less than 800 pixels
    if (screenWidth < 800) {

        // Collapse the sidebar
        sidebar.close();

        // Remove the zoom control
        zoomControl.remove();

        // Abbreviate the header text
        headerText.text('J.N. "Ding" Darling NWR');
        submitHeaderText.text('Submit Observations');

        // Zoom out to show the extent of the refuge at this scale
        map.setMinZoom(11);
        map.setZoom(11);

        // Fit the map to the refuge bounds
        map.fitBounds(bounds);

    }

    // If the screen width is greater than or equal to 800 pixels
    else if (screenWidth >= 800) {

        // Expand the sidebar and show the home tab
        sidebar.open('home');

        // Add the zoom control
        zoomControl.addTo(map);

        // If the screen width is less than 1200 pixels, show the abbreviated header text
        // Otherwise, show the full header text
        if (screenWidth < 1200) {
            headerText.text('J.N. "Ding" Darling NWR');
            submitHeaderText.text('Submit Observations');
        } else {
            headerText.text('J.N. "Ding" Darling National Wildlife Refuge');
        }

        // Show the extent of the refuge at its original scale
        map.setMinZoom(13);
        map.setZoom(13);

        // Fit the map to the refuge bounds
        map.fitBounds(bounds);

    }
}


// Function to load the refuge boundary onto the map
function loadRefugeBoundary() {

    // If the layer is already shown on the map, remove it
    if (map.hasLayer(refugeBoundary)) {
        map.removeLayer(refugeBoundary);
    }

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
}


// Function to load the refuge parking lots onto the map
function loadParkingLots() {

    // If the layer is already shown on the map, remove it
    if (map.hasLayer(parkingLots)) {
        map.removeLayer(parkingLots);
    }

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
}


// Function to load the refuge roads onto the map
function loadRoads() {

    // If the layer is already shown on the map, remove it
    if (map.hasLayer(roads)) {
        map.removeLayer(roads);
    }

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


}


// Function to load the refuge trails onto the map
function loadTrails() {

    // If the layer is already shown on the map, remove it
    if (map.hasLayer(trails)) {
        map.removeLayer(trails);
    }

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

                var length = parseFloat(feature.properties.sec_length).toFixed(2).toLocaleString();

                // Bind the nameto a popup
                layer.bindPopup(feature.properties.name + " (" + length + " mi)");

            }

        }).addTo(map);

        // Bring the layer to the back of the layer order
        trails.bringToBack();

    });
}


// Function to load the refuge trail features onto the map
function loadTrailFeatures() {

    // If the layer is already shown on the map, remove it
    if (map.hasLayer(trailFeatures)) {
        map.removeLayer(trailFeatures);
    }

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

}


// Function to load the refuge visitor service features (points of interest) onto the map
function loadVisitorServiceFeatures(sqlQueryFilteredVisitorServiceFeatures) {

    // If the layer is already shown on the map, remove it
    if (map.hasLayer(visitorServiceFeatures)) {
        map.removeLayer(visitorServiceFeatures);
    }
    
    // Clear the contents of the visitor service features layer group
    // so it can be redrawn with the filtered set
    visitorServiceFeaturesLayerGroup.clearLayers();

    // Run the specified sqlQuery from CARTO, return it as a JSON, convert it to a Leaflet GeoJson, and add it to the map with a popup
    // For the data source, enter the URL that goes to the SQL API, including our username and the SQL query
    $.getJSON("https://" + cartoUserName + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlQueryFilteredVisitorServiceFeatures, function (data) {

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

                // Bind the name to a popup
                layer.bindPopup(feature.properties.name);

            }

        }).addTo(visitorServiceFeaturesLayerGroup);


    });
}


// Function to load eBird hotspots near the refuge onto the map
function loadeBirdHotspots() {

    // If the layer is already shown on the map, remove it
    if (map.hasLayer(eBirdHotspots)) {
        map.removeLayer(eBirdHotspots);
    }

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
}


// Function to get the icon for each visitor service feature based on its category
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
    } else {
        return scenicViewpointIcon; // default option if there is no valid category, should not be used
    }
}


// Function to load the user-submitted wildlife observations onto the map
function loadWildlifeObservations() {

    // If the layer is already shown on the map, remove it
    if (map.hasLayer(wildlifeObservations)) {
        map.removeLayer(wildlifeObservations);
    }

    // Run the specified sqlQuery from CARTO, return it as a JSON, convert it to a Leaflet GeoJson, and add it to the map with a popup

    // For the data source, enter the URL that goes to the SQL API, including our username and the SQL query
    $.getJSON("https://" + cartoUserName + ".carto.com/api/v2/sql?format=GeoJSON&q=" + sqlQueryWildlifeObservations, function (data) {

        // Convert the JSON to a Leaflet GeoJson
        wildlifeObservations = L.geoJson(data, {

            // Create a style for the points
            pointToLayer: function (feature, latlng) {
                
                // Get the species family to use to set its marker color
                var speciesFamily = feature.properties.species_family;
                
                return L.circleMarker(latlng, {
                    fillColor: getWildlifeObservationMarkerColor(speciesFamily),
                    fillOpacity: 1,
                    color: '#3d3d3d',
                    weight: 0.25,
                    opacity: 1,
                    radius: 5
                });
            },

            // Loop through each feature
            onEachFeature: function (feature, layer) {

                console.log(feature.properties.species);

                // Bind the nameto a popup
                layer.bindPopup(feature.properties.species);

            }

        }).addTo(wildlifeObservationsLayerGroup);

    });

}


// Function to get the color for each wildlife observation marker based on its species family
function getWildlifeObservationMarkerColor(speciesFamily) {

    if (speciesFamily == "Birds") {
        return '#ff69b4';
    } else if (speciesFamily == "Mammals") {
        return '#e31a1c';
    } else if (speciesFamily == "Reptiles") {
        return '#ffff99';
    } else if (speciesFamily == "Amphibians") {
        return '#33a02c';
    } else if (speciesFamily == "Insects and Arachnids") {
        return '#3d3d3d';
    } else if (speciesFamily == "Crustaceans") {
        return '#1f78b4';
    } else {
        return 'white'; // default option if there is no valid species family, should not be used
    }

}


// Function to filter the points of interest based on the selected theme
function filterPointsOfInterest(selectedTheme) {

    console.log("Selected Theme: " + selectedTheme);

    // All Points of Interest
    if (selectedTheme == "all") {

        // Update the SQL query to the one showing all features
        sqlQueryFilteredVisitorServiceFeatures = sqlQueryVisitorServiceFeatures;

        // Reload the points of interest
        loadVisitorServiceFeatures(sqlQueryFilteredVisitorServiceFeatures);
    }
    
    // Practical Information
    else if (selectedTheme == "visitorCenters") {

        // Update the SQL query to the one showing all visitor centers
        // 11 - information/visitor center     
        sqlQueryFilteredVisitorServiceFeatures = "SELECT * FROM visitor_service_features WHERE category IN (11)";

        // Reload the points of interest
        loadVisitorServiceFeatures(sqlQueryFilteredVisitorServiceFeatures);
    }       

    // Driving
    else if (selectedTheme == "drivingTour") {

        // Update the SQL query to the one showing driving attractions
        //  4 - driving tour entry and exit
        // 11 - information/visitor center
        // 14 - scenic viewpoint       
        // 15 - observation deck
        // 16 - parking
        // 23 - lighthouse
        sqlQueryFilteredVisitorServiceFeatures = "SELECT * FROM visitor_service_features WHERE category IN (4, 11, 14, 15, 16, 23)";

        // Reload the points of interest
        loadVisitorServiceFeatures(sqlQueryFilteredVisitorServiceFeatures);
    }

    // Hiking
    else if (selectedTheme == "hiking") {

        // Update the SQL query to the one showing hiking features
        // 12 - interpretive sign
        // 14 - scenic viewpoint
        // 15 - observation deck
        // 18 - restroom
        // 19 - pavilion
        // 20 - trailhead
        sqlQueryFilteredVisitorServiceFeatures = "SELECT * FROM visitor_service_features WHERE category IN (12, 14, 15, 18, 19, 20)";

        // Reload the points of interest
        loadVisitorServiceFeatures(sqlQueryFilteredVisitorServiceFeatures);
    }

    // Fishing and Boating
    else if (selectedTheme == "fishingBoating") {

        // Update the SQL query to the one showing fishing and boating features
        // 5 - fishing site
        // 6 - fishing pier
        // 8 - hand launch / small boat launch
        sqlQueryFilteredVisitorServiceFeatures = "SELECT * FROM visitor_service_features WHERE category IN (5, 6, 8)";

        // Reload the points of interest
        loadVisitorServiceFeatures(sqlQueryFilteredVisitorServiceFeatures);
    }
    
    // Picnicking
    else if (selectedTheme == "picnicking") {

        // Update the SQL query to the one showing picnic areas
        // 17 - picnic area
        sqlQueryFilteredVisitorServiceFeatures = "SELECT * FROM visitor_service_features WHERE category IN (17)";

        // Reload the points of interest
        loadVisitorServiceFeatures(sqlQueryFilteredVisitorServiceFeatures);
    }
    
    // Beaches
    else if (selectedTheme == "beaches") {

        // Update the SQL query to the one showing picnic areas
        // 35 - beach access
        sqlQueryFilteredVisitorServiceFeatures = "SELECT * FROM visitor_service_features WHERE category IN (35)";

        // Reload the points of interest
        loadVisitorServiceFeatures(sqlQueryFilteredVisitorServiceFeatures);
    }
    
    // Inside the Park
    else if (selectedTheme == "insideThePark") {

        // Update the SQL query to the one showing features inside the park
        sqlQueryFilteredVisitorServiceFeatures = "SELECT visitor_service_features.name, visitor_service_features.category, visitor_service_features.the_geom FROM visitor_service_features, refuge_boundary WHERE ST_Intersects(visitor_service_features.the_geom, refuge_boundary.the_geom)";
        
        console.log(sqlQueryFilteredVisitorServiceFeatures);

        // Reload the points of interest
        loadVisitorServiceFeatures(sqlQueryFilteredVisitorServiceFeatures);
    }
    
    // Within 0.25 miles from current location
    else if (selectedTheme == "nearby") {
        
        var sqlQueryFilteredVisitorServiceFeatures = "SELECT * FROM visitor_service_features WHERE ST_Distance_Sphere(the_geom, ST_MakePoint(" + myLocation.lng + "," + myLocation.lat + ")) <= 1609.34 * 0.5";
        
        console.log(sqlQueryFilteredVisitorServiceFeatures);
        
        // Reload the points of interest
        loadVisitorServiceFeatures(sqlQueryFilteredVisitorServiceFeatures);        
    }

}


// Function that will run when the location of the user is found
function locationFound(e) {

    // Get the current location
    myLocation = e.latlng;

    // If the current location is outside the bounds of the map, reset the map to the refuge bounds
    if (myLocation.lat < bounds[0][0] || myLocation.lat > bounds[1][0] ||
        myLocation.long < bounds[0][1] || myLocation.long > bounds[1][1]) {

        alert("You are outside of the refuge");

        // Reset the map to the refuge bounds
        map.fitBounds(bounds);

        // Disable the Use Current Location button, so observations can only be submitted by clicking a point
        $('#ui-controls #currentLocationButton').attr("disabled", true);

    
    // The current location is within the bounds of the map
    } else {

        // Remove the locationMarker if it's already on the map
        if (map.hasLayer(locationMarker)) {
            map.removeLayer(locationMarker);
        }

        // Add the locationMarker layer to the map at the current location
        locationMarker = L.marker(e.latlng, {
            icon: myLocationIcon
        });

        // Bind a popup
        locationMarker.bindPopup("You are here");

        // Add the location marker to the map
        locationMarker.addTo(map);

        // Initialize a variable to store an array of filter dropdown values
        var filterDropdownArray = [];

        // Loop through the existing filter dropdown values
        $('#filterDropdown > option').each(function () {
            
            // Get the current value
            var value = $(this).val();
            
            // Push it into the filter dropdown array
            filterDropdownArray.push(value);

        });

        // Initialize a new dropdown value for the nearby filter value
        var nearbyTheme = $('<option value="nearby">Within 1/2 mile of my location</option>');

        // If the filter dropdown array does not yet include the nearby filter, add it
        if (!filterDropdownArray.includes("nearby")) {
            $('#filterDropdown').append(nearbyTheme);
        }
    }
}


// Function that will run if the location of the user is not found
function locationNotFound(e) {

    // Display the default error message from Leaflet
    alert(e.message);
    
    // Disable the Use Current Location button, so observations can only be submitted by clicking a point
    $('#ui-controls #currentLocationButton').attr("disabled", true);    

}


// Function to add the draw control to the map to start editing
function startEdits() {
    
    // Remove the drawnItems layer from the map
    map.removeLayer(drawnItems);
    
    // Clear the latitude and longitude textboxes
    $('#ui-controls #latitude').val("");
    $('#ui-controls #longitude').val("");   
    $('#speciesFamilyDropdown').val('default').attr('selected');
    $('#speciesDropdown').val('default').attr('selected');    

    // If the draw control is already on the map remove it and set the controlOnMap flag back to false
    if (controlOnMap == true) {
        map.removeControl(drawControl);
        controlOnMap = false;
    }

    // Add the draw control to the map and set the controlOnMap flag to true
    map.addControl(drawControl);
    controlOnMap = true;
    
    // If the screen width is less than 800 pixels
    if (screen.width < 800) {
        
        // Collapse the sidebar
        sidebar.close();        
    }

};


// Function to remove the draw control from the map
function stopEdits() {

    // Remove the draw control from the map and set the controlOnMap flag back to false
    map.removeControl(drawControl);
    controlOnMap = false;
};


// Function to run when the Current Location button is clicked
function addPointAtCurrentLocation() {

    // Get the user's current location
    locateUser();

    console.log("in add point at current location");
    console.log(myLocation);

    // When a feature is created on the map, a layer on which it sits is also created.
    // Create the locationMarker layer from the current location
    locationMarker = L.marker(myLocation, {
        icon: myLocationIcon
    });
    
    // Get the latitude and longitude
    var latitude = myLocation.lat;
    var longitude = myLocation.lng;   
    
    // Populate the latitude and longitude textboxes with the coordinates of the current location
    $('#ui-controls #latitude').val(latitude);
    $('#ui-controls #longitude').val(longitude);
    
    // Add the new layer to the drawnItems feature group
    drawnItems.addLayer(locationMarker);

    // Add the drawnItems feature group to the map
    map.addLayer(drawnItems);

    // Expand the sidebar and show the submit tab for the user to enter attributes about the new feature
    sidebar.open('submitTab');

}


// Function to run when a feature is drawn on the map
// Add the feature to the drawnItems layer and get its coordinates
map.on('draw:created', function (e) {

    // Remove the point tool
    stopEdits();
    
    // Expand the sidebar and show the submit tab for the user to enter attributes about the new feature
    sidebar.open('submitTab');

    // When a feature is created on the map, a layer on which it sits is also created. Create a new layer from this automatically created layer.
    var layer = e.layer;

    // Get the latitude and longitude
    var latitude = layer.getLatLng().lat;
    var longitude = layer.getLatLng().lng;

    // Add the new layer to the drawnItems feature group
    drawnItems.addLayer(layer);

    // Add the drawnItems feature group to the map
    map.addLayer(drawnItems);

    // Expand the sidebar and show the submit tab for the user to enter attributes about the new feature
    sidebar.open('submitTab');
    
    // Populate the latitude and longitude textboxes with the coordinates of the clicked point
    $('#ui-controls #latitude').val(latitude);
    $('#ui-controls #longitude').val(longitude);    

});


// Function to create variables for the location and attributes of the point just drawn and run a SQL query to insert the point into the data_collector layer in CARTO
function setData() {
    
    // Get the name and description submitted by the user
    var speciesFamily = $("#speciesFamilyDropdown option:selected").text();
    var species = $("#speciesDropdown option:selected").text();

    // Loop through each of the drawn items
    drawnItems.eachLayer(function (layer) {

        // Write a SQL/PostGIS query to insert the geometry, name, and description for the drawn item into the data_collector table
        // Set the spatial reference baesd on the GeoJSON
        var sql = "INSERT INTO wildlife_observations_collector (the_geom, species_family, species, latitude, longitude) VALUES (ST_SetSRID(ST_GeomFromGeoJSON('";

        // Get the coordinates of the drawn point and add them to the SQL statement
        var a = layer.getLatLng();
        var sql2 = '{"type":"Point","coordinates":[' + a.lng + "," + a.lat + "]}'),4326),'" + speciesFamily + "','" + species + "','" + parseFloat(a.lat) + "','" + parseFloat(a.lng) + "')";

        // Combine the two parts of the SQL statement
        var pURL = sql + sql2;
        
        console.log(pURL);

        /* Full SQL statement:
        INSERT INTO data_collector (the_geom, species_family, species, latitude, longitude)
                
        VALUES ST_SetSRID(ST_GeomFromGeoJSON('{"type":"Point","coordinates":[ {longitude value},{latitude value} ]}'),4326), '{description value}','{name value}','{longitude value}','{latitude value}')";
        */

        // Submit the SQL statement to the PHP proxy, so it can be added to the database without exposing the CARTO API key
        submitToProxy(pURL);
        console.log("Feature has been submitted to the proxy");
    });

    // Remove the drawn items layer from the map
    map.removeLayer(drawnItems);

    // Create a new empty drawnItems feature group to capture the next user-drawn data
    drawnItems = new L.FeatureGroup();

};


// Function to cancel the newly drawn points
function cancelData() {
    
    // Remove the drawnItems layer from the map
    map.removeLayer(drawnItems);
    
    // Clear the latitude and longitude textboxes
    $('#ui-controls #latitude').val('');
    $('#ui-controls #longitude').val('');
    $('#speciesFamilyDropdown').val('default').attr('selected');
    $('#speciesDropdown').val('default').attr('selected');
}


// Function to submit data to the PHP proxy using the jQuery post() method
var submitToProxy = function (q) {
    $.post("php/callProxy.php", { // <--- Enter the path to your callProxy.php file here
        qurl: q,
        cache: false,
        timeStamp: new Date().getTime()
    }, function (data) {
        console.log(data);

        // Refresh the layer to show the updated data
        refreshLayer();
    });
};


// Function to refresh the layers to show the updated dataset
function refreshLayer() {
    
    // Remove the existing wildlife observations layer
    if (map.hasLayer(wildlifeObservations)) {
        map.removeLayer(wildlifeObservations);
    };
    
    // Reload the wildlife observations layer with the new point
    loadWildlifeObservations();
    
    // If the screen width is less than 800 pixels
    if (screen.width < 800) {
        
        // Collapse the sidebar
        sidebar.close();        
    }
};