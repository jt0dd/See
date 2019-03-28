import DataSet from "../classes/data-set.js";

import edge from "../funcs/edge.js";
import simplify from "../funcs/simplify.js";
import convolute from "../funcs/convolute.js";
import extrude from "../funcs/extrude.js";

function extrapolateColorData(data) {
  let result = [];
  data.forEach(val => {
    result.push(val * 255);
    result.push(val * 255);
    result.push(val * 255);
    result.push(255);
  });
  return result;
}

function render(data, display, extrap = true) {
  if (extrap) {
    data = extrapolateColorData(data);
  }
  let size = Math.round(Math.sqrt(data.length / 4));
  let clamped = new Uint8ClampedArray(data);
  //console.log('data', data);
  let processedImgData = new ImageData(clamped, size);
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  canvas.width = size;
  canvas.height = size;
  ctx.putImageData(processedImgData, 0, 0);
  display.append(canvas);
}

function visualizeDataSet(callback, max = Infinity) {
  console.log("Visualizing training data...");
  let elementCounter = 0;
  new DataSet(
    data => {
      /*
      data.f.forEach((imgData, index) => {
        //elementCounter ++;
        //if (elementCounter < max) {
          let display = document.createElement("div");
          let result = document.createElement("div");
          result.className = "result-status";
          display.append(result);
          display.id = 'f' + index;
          display.className = "false";
          let data = imgData.data;
          let canvas1 = document.createElement("canvas");
          let ctx1 = canvas1.getContext("2d");
          canvas1.width = imgData.width;
          canvas1.height = imgData.height;
          ctx1.putImageData(imgData, 0, 0);
          display.append(canvas1);
          data = edge(data, 25, 25, 24);
          render(data, display, false);
          data = simplify(data, 50);
          data = convolute(data);
          render(data, display);
          data = extrude(data);
          render(data, display);
          document.body.append(display);
        //}
      });
      */
      data.t.forEach((imgData, index) => {
        //elementCounter ++;
        //if (elementCounter < max) {
        let display = document.createElement("div");
        let result = document.createElement("div");
        result.className = "result-status";
        display.append(result);
        display.id = 't' + index;
        display.className = "true";
        let data = imgData.data;
        let canvas1 = document.createElement("canvas");
        let ctx1 = canvas1.getContext("2d");
        canvas1.width = imgData.width;
        canvas1.height = imgData.height;
        ctx1.putImageData(imgData, 0, 0);
        display.append(canvas1);
        data = edge(data, 25, 25, 24);
        render(data, display, false);
        data = simplify(data, 50);
        data = convolute(data);
        render(data, display);
        data = extrude(data);
        render(data, display);
        document.body.append(display);
      //}
      });
      setTimeout(()=>{
        callback();
      }, 3000)
    },
    {
      canvas: true
    }
  );

}

export default visualizeDataSet;
