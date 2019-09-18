// Store our API endpoint inside queryUrl

var queryUrl =  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
let techtonicUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


/* Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
  });*/



  renderMap(queryUrl, techtonicUrl);

  function renderMap(queryUrl, techtonicUrl) {

    // Performs GET request for the earthquake URL
    d3.json(queryUrl, function(data) {
      console.log(queryUrl)
      // Stores response into earthquakeData
      let earthquakeData = data;
      // Performs GET request for the fault lines URL
      d3.json(techtonicUrl, function(data) {
        // Stores response into faultLineData
        let faultLineData = data;
  
        // Passes data into createFeatures function
        createFeatures(earthquakeData, faultLineData);
      });
    });



    // Function to create features
    function createFeatures(earthquakeData, faultLineData) {

      // Defines two functions that are run once for each feature in earthquakeData
      // Creates markers for each earthquake and adds a popup describing the place, time, and magnitude of each
      function onEachQuakeLayer(feature, layer) {
        return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
          fillOpacity: 1,
          color: chooseColor(feature.properties.mag),
          fillColor: chooseColor(feature.properties.mag),
          radius:  markerSize(feature.properties.mag)
        });
      }

      function onEachEarthquake(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
      }
  
      // Defines a function that is run once for each feature in faultLineData
      // Create fault lines
      function onEachFaultLine(feature, layer) {
        L.polyline(feature.geometry.coordinates);
      }
  

  
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    let earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachEarthquake,
      pointToLayer: onEachQuakeLayer
    });

    // Creates a GeoJSON layer containing the features array of the faultLineData object
    // Run the onEachFaultLine function once for each element in the array
    let faultLines = L.geoJSON(faultLineData, {
      onEachFeature: onEachFaultLine,
      style: {
        weight: 2,
        color: 'blue'
      }
    });

    let timelineLayer = L.timeline(earthquakeData, {
      getInterval: function(feature) {
        return {
          start: feature.properties.time,
          end: feature.properties.time + feature.properties.mag * 10000000
        };
      },
      pointToLayer: onEachQuakeLayer,
      onEachFeature: onEachEarthquake
    });

    // Sends earthquakes, fault lines and timeline layers to the createMap function
    createMap(earthquakes, faultLines, timelineLayer);
  }

  

function createMap(earthquakes) {

  // Define satellitemap and darkmap layers
  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var outdoormap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoor",
    accessToken: API_KEY
  });
  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite Map": satellitemap,
    "LIght Map": lightmap,
    "Outdoor Map": outdoormap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
    //faultLines: faultLines
  };


  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [31.57853542647338,-99.580078125],
    zoom: 5,
    layers: [outdoors, faultLines]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: true
  }).addTo(myMap);

  // creating legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

	var div = L.DomUtil.create('div', 'info legend'),
		grades = [0, 10, 20, 50, 100, 200, 500, 1000],
		labels = [];

	// loop through our density intervals and generate a label with a colored square for each interval
	for (var i = 0; i < grades.length; i++) {
		div.innerHTML +=
			'<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
			grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
	}

	return div;
};

legend.addTo(myMap);

  // Adds timeline and timeline controls
  let timelineControl = L.timelineSliderControl({
    formatOutput: function(date) {
      return new Date(date).toString();
    }
  });
  timelineControl.addTo(myMap);
  timelineControl.addTimelines(timelineLayer);
  timelineLayer.addTo(myMap);
}
}

function chooseColor(magnitude) {
  return magnitude > 5 ? "red":
    magnitude > 4 ? "orange":
      magnitude > 3 ? "gold":
        magnitude > 2 ? "yellow":
          magnitude > 1 ? "yellowgreen":
            "greenyellow"; // <= 1 default
                            }


function markerSize(magnitude) {
  return magnitude * 5;
  }
