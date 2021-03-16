var Cesium = require('cesium/Cesium');
require('./css/main.css');
require('cesium/Widgets/widgets.css');
const axios = require('axios')
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMTc0MWMxMC1jNGIyLTQ0ZWYtYTg4Zi02ZTZkODhkMTU1NGUiLCJpZCI6NjEwNiwiaWF0IjoxNjE1MjEyMzk2fQ.blb64yAFKX_3Kbq5xmpY9NAsqmEcbQRSmwmESbSmCd4';
var viewer = new Cesium.Viewer('cesiumContainer');
const sendGetRequest = async (URL) => {
  try {
    return await axios.get(URL)
  } catch (error) {
    console.error(error)
  }
}
var STA_Server = "https://toronto-bike-snapshot.sensorup.com/v1.0/"
var my_Sta_Server="http://localhost:8080/FROST-Server/v1.0/"
const getThings = async () => {
  var thingUrl = STA_Server+'Things';
  const things = await sendGetRequest(thingUrl);
  if (things.data.value) {
    for (var i = 0; i < things.data.value.length; i++) {
      debugger
      var thing = things.data.value[i];
      var locations = await getLocations(thingUrl+'(' + things.data.value[i]["@iot.id"] + ')');
      createPinBuilderForThing(thing, locations);
    }
  }
}

const getLocations = async (url) => {
  var locationUrl = url + '/Locations';
  const location = await sendGetRequest(locationUrl);
  return location.data.value;
}

const createPinBuilderForThing = (thing, locations) => {
  for (var i = 0; i < locations.length; i++) {
    var pinBuilder = new Cesium.PinBuilder();
    let coord=locations[i].location.coordinates;
    var bluePin = viewer.entities.add({
      name: thing+ ' Location '+ locations[i].name,
      position: Cesium.Cartesian3.fromDegrees(coord[0], coord[1], coord[2]),
      billboard: {
        image: pinBuilder.fromText(i, Cesium.Color.ROYALBLUE, 48).toDataURL(),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      },
    });
  }
}
//getThings();
const changeColorOfStations = async () => {
  var request="https://toronto-bike-snapshot.sensorup.com/v1.0/Locations?$expand=Things/Datastreams($filter=ObservedProperty/name eq 'available_bikes'),Things/Datastreams/Observations($orderby=phenomenonTime desc;$top=1)";
  const locationsOfThings = await sendGetRequest(request);

  var i=0;
  var geoJsonFeatures = locationsOfThings.data.value.map(function(location) {
  return {
    type: 'Feature',
    geometry: location.location,
    properties: location
  };
});

  for (var i = 0; i < geoJsonFeatures.length; i++) {
    var availableBikes = geoJsonFeatures[i].properties.Things[0].Datastreams[0].Observations[0].result;
    var pinBuilder = new Cesium.PinBuilder();
    let coord= geoJsonFeatures[i].geometry.coordinates;
    var redPin = viewer.entities.add({
      name: ' Location :'+ geoJsonFeatures[i].properties.name,
      position: Cesium.Cartesian3.fromDegrees(coord[0], coord[1], coord[2]),
      billboard: {
        image: pinBuilder.fromText(availableBikes, availableBikes>5?Cesium.Color.ROYALBLUE:Cesium.Color.RED, 48).toDataURL(),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      },
    });
  }
}
changeColorOfStations()

//var viewer = new Cesium.Viewer('cesiumContainer');


