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
  "esri/tasks/support/FeatureSet",

  "esri/widgets/Sketch/SketchViewModel",
  "esri/widgets/Slider",
  "esri/geometry/geometryEngine",
  "esri/core/promiseUtils"
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
  FeatureSet,

  SketchViewModel,
  Slider,
  geometryEngine,
  promiseUtils

) {

  // Geoprocessing url
  var gpUrl = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Elevation/ESRI_Elevation_World/GPServer/Viewshed";

  var map = new Map({
    basemap: "satellite",
    ground: "world-elevation"
  });

  // https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-ElevationLayer.html
  var elevLyr = new ElevationLayer({
  // Custom elevation service
    url: "https://tiles.arcgis.com/tiles/6j1KwZfY2fZrfNMR/arcgis/rest/services/HK_DTM/ImageServer"
  });
  // Add elevation layer to the map's ground.
  map.ground.layers.add(elevLyr);

  var view = new SceneView({
    container: "viewDiv",
    map: map,
    camera: {
      // autocasts as new Camera()
      position: [114.20, 22.25, 3000],
      tilt: 75
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


  var peaks = new FeatureLayer({
    url: "https://services5.arcgis.com/xH8UmTNerx1qYfXM/arcgis/rest/services/peak_3D/FeatureServer/0",
    popupTemplate: popupTemplate
  });

  map.add(peaks);

  ///

  // add a GraphicsLayer for the sketches and the buffer
  const sketchLayer = new GraphicsLayer();
  const bufferLayer = new GraphicsLayer();
  view.map.addMany([bufferLayer, sketchLayer]);

  let sceneLayer = null;
  let sceneLayerView = null;
  let bufferSize = 0;

  // Assign scene layer once webscene is loaded and initialize UI

  queryDiv.style.display = "block";

  view.ui.add([queryDiv], "bottom-left");

  // use SketchViewModel to draw polygons that are used as a query
  let sketchGeometry = null;
  const sketchViewModel = new SketchViewModel({
    layer: sketchLayer,
    defaultUpdateOptions: {
      tool: "reshape",
      toggleToolOnClick: false
    },
    view: view,
    defaultCreateOptions: { hasZ: false }
  });

  sketchViewModel.on("create", function(event) {
    if (event.state === "complete") {
      sketchGeometry = event.graphic.geometry;
      runQuery();
    }
  });

  sketchViewModel.on("update", function(event) {
    if (event.state === "complete") {
      sketchGeometry = event.graphics[0].geometry;
      runQuery();
    }
  });

  // draw geometry buttons - use the selected geometry to sktech
  document
    .getElementById("point-geometry-button")
    .addEventListener("click", geometryButtonsClickHandler);
  function geometryButtonsClickHandler(event) {
    const geometryType = event.target.value;
    clearGeometry();
    sketchViewModel.create(geometryType);
  }

  const bufferNumSlider = new Slider({
    container: "bufferNum",
    min: 1,
    max: 20,
    steps: 0.1,
    visibleElements: {
      labels: true
    },
    precision: 4,
    labelFormatFunction: function(value, type) {
      return value.toString() + "km";
    },
    values: [5]
  });

  // Default buffer size
  bufferSize = bufferNumSlider.values[0]

  // get user entered values for buffer
  bufferNumSlider.on(
    ["thumb-change", "thumb-drag"],
    bufferVariablesChanged
  );
  function bufferVariablesChanged (event) {
    bufferSize = event.value
  }
  // Clear the geometry and set the default renderer
  document
    .getElementById("clearGeometry")
    .addEventListener("click", clearGeometry);

  // Clear the geometry and set the default renderer
  function clearGeometry() {
    sketchGeometry = null;
    sketchViewModel.cancel();
    sketchLayer.removeAll();
    bufferLayer.removeAll();
    clearHighlighting();
    clearCharts();
    resultDiv.style.display = "none";
  }


  /********************
   Viewshed
  ********************/

  // https://developers.arcgis.com/javascript/latest/api-reference/esri-symbols-PointSymbol3D.html
  var markerSymbol = {
    type: "point-3d", // autocasts as new PointSymbol3D()
    symbolLayers: [{
      type: "object",  // autocasts as new ObjectSymbol3DLayer()
      width: 100,    // diameter of the object from east to west in meters
      height: 100,  // height of object in meters
      depth: 100,   // diameter of the object from north to south in meters
      resource: { primitive: "sphere" },
      material: { color: [231, 70, 60, 0.8] }
    }],
    verticalOffset: {
      screenLength: 40,
      minWorldLength: 100
    },
    callout: {
      type: "line",  // autocasts as new LineCallout3D()
      size: 1.5,
      color: [150, 150, 150, 0.8],
      border: {
        color: [50, 50, 50, 0.8]
      }
    }
  };

  var fillSymbol = {
    type: "simple-fill", // autocasts as new SimpleFillSymbol()
    color: [226, 119, 40, 0.75],
    outline: {
      // autocasts as new SimpleLineSymbol()
      color: "#ffffff",
      width: 0.5
    }
  };

  var gp = new Geoprocessor(gpUrl);

  gp.outSpatialReference = {
    // autocasts as new SpatialReference()
    wkid: 102100
  };

  view.on("click", computeViewshed);

  function computeViewshed(event) {

    // TODO: Redraw buffer when user drag the slider
    // Caused by clicking new point instead of changing slider
    // if (event.mapPoint !== undefined)

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

    vsDistance.distance = bufferSize;
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
