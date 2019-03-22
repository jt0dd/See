let counter = 0;
let resultStorage = {
  positives: [],
  negatives: []
};

document.getElementById("export").onclick = () => {
  var zip = new JSZip();
  var positives = zip.folder("true");
  var negatives = zip.folder("false");
  for (let i = 0; i < resultStorage.positives.length; i++) {
    console.log('storing', resultStorage.positives[i]);
    positives.file(i + ".png", resultStorage.positives[i], {binary: true});
  }
  for (let i = 0; i < resultStorage.negatives.length; i++) {
    console.log('storing', resultStorage.negatives[i]);
    negatives.file(i + ".png", resultStorage.negatives[i], {binary: true});
  }
  zip
    .generateAsync({
      type: "blob"
    })
    .then(function(content) {
      saveAs(content, "training-data.zip");
    });
};

//.then(function(content) {
//saveAs(content, "example.zip");
//});

function edge(data, width, height, threshold) {
  console.log(
    "Getting edge of bitmap",
    data,
    "width",
    width,
    "height",
    height,
    "thresh",
    threshold
  );
  //let result = [];
  let resultImg = [];
  let map = [];
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let done = false;
      let sourceIndex = y * width * 4 + x * 4;
      //result[sourceIndex / 4] = 0;
      resultImg[sourceIndex] = 255;
      resultImg[sourceIndex + 1] = 255;
      resultImg[sourceIndex + 2] = 255;
      resultImg[sourceIndex + 3] = 255;
      if (map[sourceIndex]) {
        continue;
      }
      for (let subX = -1; subX < 2; subX++) {
        for (let subY = -1; subY < 2; subY++) {
          let searchIndex = (y + subY) * width * 4 + (x + subX) * 4;
          let searchR = data[searchIndex];
          let searchG = data[searchIndex + 1];
          let searchB = data[searchIndex + 2];
          let searchAverage = (searchR + searchG + searchB) / 3;
          let sourceR = data[sourceIndex];
          let sourceG = data[sourceIndex + 1];
          let sourceB = data[sourceIndex + 2];
          let sourceAverage = (sourceR + sourceG + sourceB) / 3;
          let difference = Math.abs(searchAverage - sourceAverage);
          if (done) {
            map[searchIndex] = true;
          }
          if (difference > threshold) {
            map[sourceIndex] = true;
            map[searchIndex] = true;
            //if (!done){
            //result[searchIndex / 4] = 1;
            //resultImg[sourceIndex] = 0;
            //resultImg[sourceIndex + 1] = 0;
            //resultImg[sourceIndex + 2] = 0;
            //resultImg[sourceIndex + 3] = 255;
            resultImg[searchIndex] = 0;
            resultImg[searchIndex + 1] = 0;
            resultImg[searchIndex + 2] = 0;
            resultImg[searchIndex + 3] = 255;
            //}
            done = true;
          }
        }
      }
    }
  }
  let bitmaps = {
    //result: {data: result, width: width / 4},
    resultImg: {data: resultImg, width: width, height: height}
  };
  let dataRaw = resultImg;
  let clamped = Uint8ClampedArray.from(dataRaw);
  let imageData = new ImageData(clamped, bitmaps.resultImg.width);
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  canvas.width = bitmaps.resultImg.width;
  canvas.height = bitmaps.resultImg.height;
  ctx.putImageData(imageData, 0, 0);
  document.getElementById("content").append(canvas);

  canvas.oncontextmenu = e => {
    e.preventDefault();
    let selectionData = ctx.getImageData(e.offsetX - 7, e.offsetY - 7, 25, 25);
    let newCanvas = document.createElement("canvas");
    newCanvas.width = 25;
    newCanvas.height = 25;
    let newContext = newCanvas.getContext("2d");
    newContext.putImageData(selectionData, 0, 0);
    console.log("Right click detected", e.offsetX, e.offsetY);
    resultStorage.negatives.push(selectionData);
    document.getElementById("negatives").prepend(newCanvas);
  };
  canvas.onclick = e => {
    e.preventDefault();
    let selectionData = ctx.getImageData(e.offsetX - 7, e.offsetY - 7, 25, 25);
    let newCanvas = document.createElement("canvas");
    newCanvas.width = 25;
    newCanvas.height = 25;
    let newContext = newCanvas.getContext("2d");
    newContext.putImageData(selectionData, 0, 0);
    console.log("Left click detected", e.offsetX, e.offsetY);
    resultStorage.positives.push(selectionData);
    document.getElementById("positives").prepend(newCanvas);
  };
  //return {
  //result: {data: result, width: width / 4},
  //resultImg: {data: resultImg, width: width, height: height}
  //};
}

function chunk(data, size, width, height) {
  let result = [];
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
        let ctx = img.getContext("2d");
        let data = ctx.getImageData(0, 0, img.width, img.height).data;
        let simplifiedData = edge(data, img.width, img.height, threshold);
        storage.push(simplifiedData);
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
      if (percent <= 8) {
        callback(data);
      } else {
        percent -= 8;
        callback(data);
        loadInit(percent, threshold, size, callback);
      }
    }
  ]);
}

class Loader {
  constructor(threshold, size, callback) {
    loadInit(100, threshold, size, callback);
  }
}

export default Loader;
