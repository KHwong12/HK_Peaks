require([
  "esri/Map",
  "esri/views/MapView"
], function(Map, MapView) {

  var map = new Map({
    basemap: "topo-vector"
  });

  var view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-118.71511,34.09042],
    zoom: 11
  });

});
