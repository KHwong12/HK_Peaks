document.addEventListener("DOMContentLoaded", function(event) {

  const weatherAPI = "https://data.weather.gov.hk/weatherAPI/opendata/opendata.php?dataType=LTMV&lang=en&rformat=json";

  // http://zetcode.com/javascript/jsonurl/
  fetch(weatherAPI)
    .then(res => res.json())
    .then((out) => {
        var centralVis = out["data"][0][2];

        document.getElementById("centralVis").innerHTML = centralVis;
      }).catch(err => console.error(err));

  document.getElementById("lastModified").innerHTML = document.lastModified;
});
