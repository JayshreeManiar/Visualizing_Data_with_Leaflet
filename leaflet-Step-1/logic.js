// Store our API endpoint inside queryUrl

var queryUrl =  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
  });


  function createFeatures(earthquakeData) {
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJson(earthquakeData, {
      onEachFeature: function (feature, layer){
        layer.bindPopup("<h3>" + feature.properties.place + "<br> Magnitude: " + feature.properties.mag +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
      },
      pointToLayer: function (feature, latlng) {
        return new L.circle(latlng,
          {radius: getRadius(feature.properties.mag),
            fillColor: getColor(feature.properties.mag),
            fillOpacity: .7,
            stroke: true,
            color: "black",
            weight: .5
        })
      }
    });
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes)
   }
   function getColor(d) {
    return d > 5 ? '#F30' :
    d > 4  ? '#F60' :
    d > 3  ? '#F90' :
    d > 2  ? '#FC0' :
    d > 1   ? '#FF0' :
            '#9F3';   
   }
   function getRadius(value){
    return value*15000
   }

   // Add Legend
   let legend = L.control({position: 'bottomright'});

   legend.onAdd = function(map) {
     let div = L.DomUtil.create('div', 'info legend'),
       grades = [0, 1, 2, 3, 4, 5],
       labels = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];

     for (let i = 0; i < grades.length; i++) {
       div.innerHTML += '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
               grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
     }

     return div;
   };

   legend.addTo(myMap);

   // chooseColor function
function chooseColor(magnitude) {
  return magnitude > 5 ? "red":
    magnitude > 4 ? "orange":
      magnitude > 3 ? "gold":
        magnitude > 2 ? "yellow":
          magnitude > 1 ? "yellowgreen":
            "greenyellow"; // <= 1 default
}

    // Adds timeline and timeline controls
    let timelineControl = L.timelineSliderControl({
      formatOutput: function(date) {
        return new Date(date).toString();
      }
    });
    timelineControl.addTo(myMap);
    timelineControl.addTimelines(timelineLayer);
    timelineLayer.addTo(myMap);
  


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

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Satellite Map": satellitemap,
    "Light Map": lightmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [31.57853542647338,-99.580078125],
    zoom: 5,
    layers: [satellitemap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}




