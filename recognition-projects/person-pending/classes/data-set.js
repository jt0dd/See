import simplify from '../funcs/simplify.js';

function load(type, i = 0, callback) {
  let storage;
  if (type == "true") {
    storage = this.t;
  } else if (type == "false") {
    storage = this.f;
  }
  let asset = true;
  let assetPath = "./sets/" + type + "/" + i + ".png";
  //console.log("Loading", assetPath);
  asset = loadImage(
    assetPath,
    img => {
      if (img.type != "error") {
        let ctx = img.getContext("2d");
        let data = ctx.getImageData(0, 0, img.width, img.height);
        let simplifiedData;
        if (this.settings.canvas) {
          simplifiedData = data;
        } else {
          simplifiedData = data.data;
        }
        storage.push(simplifiedData);
        i++;
        load.apply(this, [type, i, callback]);
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
  constructor(callback, settings = {}) {
    this.settings = settings;
    this.t = [];
    this.f = [];
    let state = 0;
    load.apply(this, [
      "true",
      0,
      () => {
        state++;
        if (state == 2) {
          if (callback) callback(this);
        }
      }
    ]);
    load.apply(this, [
      "false",
      0,
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
