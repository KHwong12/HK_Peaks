require([
  "esri/Map",
  "esri/views/SceneView",
  "esri/layers/ElevationLayer",
  "esri/layers/GraphicsLayer",
  "esri/layers/FeatureLayer",
  "esri/Graphic",
  "esri/geometry/Point",
  "esri/tasks/Geoprocessor",
  "esri/tasks/support/LinearUnit",
  "esri/tasks/support/FeatureSet"
], function (
  Map,
  SceneView,
  ElevationLayer,
  GraphicsLayer,
  FeatureLayer,
  Graphic,
  Point,
  Geoprocessor,
  LinearUnit,
  FeatureSet
) {

  // Geoprocessing url
  var gpUrl = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Elevation/ESRI_Elevation_World/GPServer/Viewshed";

  var map = new Map({
    basemap: "satellite",
    ground: "world-elevation"
  });

  // var elevLyr = new ElevationLayer({
  // // Custom elevation service
  //   url: "https://tiles.arcgis.com/tiles/6j1KwZfY2fZrfNMR/arcgis/rest/services/HK_DTM/ImageServer"
  // });
  // // Add elevation layer to the map's ground.
  // map.ground.layers.add(elevLyr);

  var view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: {
      // autocasts as new Camera()
      position: [114.17, 22.3, 5184],
      tilt: 60
    }
  });

  var graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  /********************
   Peaks Layer
  ********************/

  // Create the PopupTemplate
  // https://developers.arcgis.com/javascript/latest/sample-code/featurelayerview-query/index.html
  const popupTemplate = {
    // autocasts as new PopupTemplate()
    title: "{NAME}",
    content: [
      {
        type: "fields",
        fieldInfos: [
          {
            fieldName: "name",
            label: "Chinese Name"
          },
          {
            fieldName: "name_en",
            label: "English Name"
          },
          {
            fieldName: "ele",
            label: "Elevation (m)",
            format: {
              places: 0,
              digitSeparator: true
            }
          }
        ]
      }
    ]
  };


  // Peaks layer
  var peaks = new FeatureLayer({
    url: "https://services5.arcgis.com/xH8UmTNerx1qYfXM/arcgis/rest/services/peak_3D/FeatureServer/0",
    popupTemplate: popupTemplate
  });

  map.add(peaks);


  /********************
   Viewshed
  ********************/

  var markerSymbol = {
    type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
    color: "#114514",
    outline: {
      // autocasts as new SimpleLineSymbol()
      color: "#ffffff",
      width: 1
    }
  };

  var fillSymbol = {
    type: "simple-fill", // autocasts as new SimpleFillSymbol()
    color: [226, 119, 40, 0.75],
    outline: {
      // autocasts as new SimpleLineSymbol()
      color: "#ffffff",
      width: 1
    }
  };

  var gp = new Geoprocessor(gpUrl);

  gp.outSpatialReference = {
    // autocasts as new SpatialReference()
    wkid: 102100
  };

  view.on("click", computeViewshed);

  function computeViewshed(event) {
    graphicsLayer.removeAll();

    var point = new Point({
      longitude: event.mapPoint.longitude,
      latitude: event.mapPoint.latitude
    });

    var inputGraphic = new Graphic({
      geometry: point,
      symbol: markerSymbol
    });

    graphicsLayer.add(inputGraphic);

    var inputGraphicContainer = [];
    inputGraphicContainer.push(inputGraphic);
    var featureSet = new FeatureSet();
    featureSet.features = inputGraphicContainer;

    var vsDistance = new LinearUnit();
    vsDistance.distance = 5;
    vsDistance.units = "kilometers";

    var params = {
      Input_Observation_Point: featureSet,
      Viewshed_Distance: vsDistance
    };

    gp.execute(params).then(drawResultData);
  }

  function drawResultData(result) {
    var resultFeatures = result.results[0].value.features;

    // Assign each resulting graphic a symbol
    var viewshedGraphics = resultFeatures.map(function (feature) {
      feature.symbol = fillSymbol;
      return feature;
    });

    // Add the resulting graphics to the graphics layer
    graphicsLayer.addMany(viewshedGraphics);

    /********************************************************************
     * Animate to the result. This is a temporary workaround
     * for animating to an array of graphics in a SceneView. In a future
     * release, you will be able to replicate this behavior by passing
     * the graphics directly to the goTo function, like the following:
     *
     * view.goTo(viewshedGraphics);
     ********************************************************************/
    view
      .goTo({
        target: viewshedGraphics,
        tilt: 0
      })
      .catch(function(error) {
        if (error.name != "AbortError") {
          console.error(error);
        }
      });
  }
});
