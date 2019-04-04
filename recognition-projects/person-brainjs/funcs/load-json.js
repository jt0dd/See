function loadJSON(path, callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", path, true);
  xobj.onreadystatechange = function() {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(JSON.parse(xobj.responseText));
    } else if (xobj.readyState == 4 && xobj.status == "404") {
      callback(false);
    }
  };
  xobj.send(null);
}

export default loadJSON;
