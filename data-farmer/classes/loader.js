let counter = 0;
let resultStorage = {
  positives: [],
  negatives: []
};
let globalStart = [0, 0];

document.getElementById("export").onclick = () => {
  var zip = new JSZip();
  var positives = zip.folder("true");
  var negatives = zip.folder("false");
  for (let i = globalStart[0]; i < resultStorage.positives.length + globalStart[0]; i++) {
    console.log('storing', resultStorage.positives[i]);
    positives.file(i + ".png", resultStorage.positives[i]);
  }
  for (let i = globalStart[1]; i < resultStorage.negatives.length + globalStart[1]; i++) {
    console.log('storing', resultStorage.negatives[i]);
    negatives.file(i + ".png", resultStorage.negatives[i]);
  }
  zip
    .generateAsync({
      type: "blob"
    })
    .then(function(content) {
      saveAs(content, "training-data.zip");
    });
};

function render(canvas){
  document.getElementById("content").append(canvas);
  let ctx = canvas.getContext("2d");
  canvas.oncontextmenu = e => {
    e.preventDefault();
    let selectionData = ctx.getImageData(e.offsetX - 9, e.offsetY - 9, 25, 25);
    let newCanvas = document.createElement("canvas");
    newCanvas.width = 25;
    newCanvas.height = 25;
    let newContext = newCanvas.getContext("2d");
    newContext.putImageData(selectionData, 0, 0);
    let blob = newCanvas.toBlob(function (blob) {
      resultStorage.negatives.push(blob);
    });
    console.log("Right click detected", e.offsetX, e.offsetY);
    document.getElementById("negatives").prepend(newCanvas);
  };
  canvas.onclick = e => {
    e.preventDefault();
    let selectionData = ctx.getImageData(e.offsetX - 9, e.offsetY - 9, 25, 25);
    let newCanvas = document.createElement("canvas");
    newCanvas.width = 25;
    newCanvas.height = 25;
    let newContext = newCanvas.getContext("2d");
    newContext.putImageData(selectionData, 0, 0);
    let blob = newCanvas.toBlob(function (blob) {
      resultStorage.positives.push(blob);
    });
    console.log("Left click detected", e.offsetX, e.offsetY);
    document.getElementById("positives").prepend(newCanvas);
  };
}

function load(i = 0, storage = [], size, percent, threshold, callback) {
  let asset = true;
  let width;
  let height;
  let assetPath = "./raw/" + i + ".png";
  console.log("Loading", assetPath);
  asset = loadImage(
    assetPath,
    img => {
      img = loadImage.scale(
        img, // img or canvas element
        {maxWidth: img.width * (percent / 100)}
      );
      if (img.type != "error") {
        render(img);
        i++;
        load.apply(this, [i, storage, size, percent, threshold, callback]);
        //data = null;
      } else {
        if (callback) callback(storage);
      }
    },
    {
      maxWidth: width * (percent / 100),
      canvas: true
    }
  );
}

function loadInit(percent = 100, threshold, size, callback) {
  console.log(
    "Initiating load of data processing at [" + percent + "%] scale.",
    threshold
  );
  load.apply(this, [
    0,
    [],
    size,
    percent,
    threshold,
    data => {
      if (percent <= 5) {
        callback(data);
      } else {
        percent -= 3;
        callback(data);
        loadInit(percent, threshold, size, callback);
      }
    }
  ]);
}

class Loader {
  constructor(threshold, size, callback, start) {
    globalStart = start;
    loadInit(100, threshold, size, callback);
  }
}

export default Loader;
