document.addEventListener("DOMContentLoaded", function(event) {

  const weatherAPI = "https://data.weather.gov.hk/weatherAPI/opendata/opendata.php?dataType=LTMV&lang=en&rformat=json";

  // Alternative: use fetch()

  // http://zetcode.com/javascript/jsonurl/
  // fetch(weatherAPI)
  //   .then(res => res.json())
  //   .then((out) => {
  //     var centralVis = out["data"][0][2];
  //
  //     document.getElementById("centralVis").innerHTML = centralVis;
  //   }).catch(err => console.error(err));

  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {

      var response = JSON.parse(this.responseText);

      // https://www.aspsnippets.com/Articles/Convert-JSON-data-to-HTML-Table-using-JavaScript.aspx

      var table = document.createElement("table");
      table.className = "table";

      //Add the header row.
      var row = table.insertRow(-1);

      // i = 1 to omit the first column of json (i.e. Date time)
      for (var i = 1; i < response.fields.length; i++) {
        var headerCell = document.createElement("th");
        headerCell.innerHTML = response.fields[i];
        row.appendChild(headerCell);
      }

      for (var i = 0; i < response.data.length; i++) {
        row = table.insertRow(-1);
        for (var j = 1; j < response.fields.length; j++) {
          var cell = row.insertCell(-1);
          cell.innerHTML = response.data[i][j];
        }
      }

      var dvTable = document.getElementById("visibilityDiv");
      dvTable.innerHTML = "";
      dvTable.appendChild(table);
    }
  };

  xmlhttp.open("GET", weatherAPI, true);
  xmlhttp.send();

  // Add Last Modified

  document.getElementById("lastModified").innerHTML = document.lastModified;
});
