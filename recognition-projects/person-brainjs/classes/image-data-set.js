import simplify from "../funcs/simplify.js";
let cache = {};

function load(type, i = 0, callback) {
  let storage;
  if (type == "true") {
    storage = this.t;
  } else if (type == "false") {
    storage = this.f;
  }
  let asset = true;
  let assetPath = "./sets/" + type + "/" + i + ".png";
  if (cache[assetPath]) {
    let img = cache[assetPath];
    storage.push(img);
    i++;
    load.apply(this, [type, i, callback]);
  } else {
    asset = loadImage(
      assetPath,
      img => {
        if (img.type != "error") {
          cache[assetPath] = img;
          storage.push(img);
          i++;
          load.apply(this, [type, i, callback]);
        } else {
          if (callback) callback();
        }
      }
    );
  }
}

class ImageDataSet {
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

export default ImageDataSet;
