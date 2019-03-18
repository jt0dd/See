function simplify(data, threshold) {
  let result = [];
  let resultsRaw = [];
  for (let i = 0; i < data.length; i += 4) {
    let total = data[i] + data[i + 1] + data[i + 2];
    let average = total / 3;
    resultsRaw.push(average);
  }
  resultsRaw.forEach(val => {
    if (val > threshold) {
      result.push(1);
    } else {
      result.push(0);
    }
  });
  return result;
}

function load(type, setPath, i = 0, threshold, callback) {
  let storage;
  if (type == "true") {
    storage = this.t;
  } else if (type == "false") {
    storage = this.f;
  }
  let asset = true;
  let assetPath = "./sets/" + setPath + "/" + type + "/" + i + ".png";
  console.log("Loading", assetPath);
  asset = loadImage(
    assetPath,
    img => {
      if (img.type != "error") {
        let ctx = img.getContext("2d");
        let data = ctx.getImageData(0, 0, img.width, img.height).data;
        let simplifiedData = simplify(data, threshold);
        storage.push(simplifiedData);
        i++;
        load.apply(this, [type, setPath, i, threshold, callback]);
      } else {
        if (callback) callback();
      }
    },
    {
      canvas: true
    }
  );
}

class DataSet {
  constructor(setPath, threshold, callback) {
    this.t = [];
    this.f = [];
    let state = 0;
    load.apply(this, [
      "true",
      setPath,
      0,
      threshold,
      () => {
        state++;
        if (state == 2) {
          if (callback) callback(this);
        }
      }
    ]);
    load.apply(this, [
      "false",
      setPath,
      0,
      threshold,
      () => {
        state++;
        if (state == 2) {
          if (callback) callback(this);
        }
      }
    ]);
  }
}

export default DataSet;
