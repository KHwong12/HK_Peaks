document.addEventListener("DOMContentLoaded", function(event) {

  // https://stackoverflow.com/questions/2499567/how-to-make-a-json-call-to-a-url/2499647#2499647
  function Get(yourUrl){
      var Httpreq = new XMLHttpRequest(); // a new request
      Httpreq.open("GET",yourUrl,false);
      Httpreq.send(null);
      return Httpreq.responseText;
  }

  // https://www.hko.gov.hk/en/weatherAPI/doc/files/HKO_Open_Data_API_Documentation.pdf
  const weatherAPI = "http://data.weather.gov.hk/weatherAPI/opendata/opendata.php?dataType=LTMV&lang=en&rformat=json";

  var json = JSON.parse(Get(weatherAPI));

  var centralVis = json["data"][0][2];

  document.getElementById("centralVis").innerHTML = centralVis;

  document.getElementById("lastModified").innerHTML = document.lastModified;
});
