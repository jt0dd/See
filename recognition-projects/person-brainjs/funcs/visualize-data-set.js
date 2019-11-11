import DataSet from "../classes/data-set.js";
import ImageDataSet from "../classes/image-data-set.js";
import Logger from "../classes/logger.js";
import FrameProcessor from "../classes/frame-processor.js";
import edge from "../funcs/edge.js";
import simplify from "../funcs/simplify.js";
import convolute from "../funcs/convolute.js";
import extrude from "../funcs/extrude.js";

let logger = new Logger("visualizeDataSet");
let frameProcessor = new FrameProcessor();

function flattenData(data) {
  let result = [];
  data.forEach(arr => {
    arr.forEach(val => {
      result.push(val);
    });
  });
  return result;
}

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

function render(data, display, extrap = true, flatten = false) {
  if (flatten) {
    data = flattenData(data);
    logger.log('Flattened data:', data);
  }
  if (extrap) {
    data = extrapolateColorData(data);
    logger.log('Extrapolated data:', data);
  }
  let size = Math.round(Math.sqrt(data.length / 4));
  let clamped = new Uint8ClampedArray(data);
  let processedImgData = new ImageData(clamped, size);
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  canvas.width = size;
  canvas.height = size;
  ctx.putImageData(processedImgData, 0, 0);
  display.append(canvas);
}

function visualizeDataSet(callback, max = Infinity) {
  logger.log("Visualizing training data...");
  let container = document.getElementById("visualize-data-container");
  let elementCounter = 0;
  new ImageDataSet(
    data => {
      let dims = {w: data.t[0].width, h: data.t[0].height};
      frameProcessor.addScale(dims, {
        pipe: false
      });
      let kerelSet = frameProcessor.kernelSets[dims.w][dims.h];
      let filter = [1, 0, 1, 0, 1, 0, 1, 0, 1];
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
        container.append(display);
      //}
      });
      */

      data.t.forEach((img, index) => {
        let display = document.createElement("div");
        let result = document.createElement("div");
        result.className = "result-status";
        display.append(result);
        display.id = "t" + index;
        display.className = "true";

        let texture = kerelSet.render(img);
        console.log("[render] texture", texture);
        let pixels = new Uint8Array(texture.context.drawingBufferWidth * texture.context.drawingBufferHeight * 4);
        texture.context.readPixels(0, 0, texture.context.drawingBufferWidth, texture.context.drawingBufferHeight, texture.context.RGBA, texture.context.UNSIGNED_BYTE, pixels);
        console.log("pixels", pixels);
        render(pixels, display, false, false);

        texture = kerelSet.edge(texture);
        console.log("[edge] texture", texture);
        pixels = new Uint8Array(texture.context.drawingBufferWidth * texture.context.drawingBufferHeight * 4);
        texture.context.readPixels(0, 0, texture.context.drawingBufferWidth, texture.context.drawingBufferHeight, texture.context.RGBA, texture.context.UNSIGNED_BYTE, pixels);
        console.log("pixels", pixels);
        render(pixels, display, false, false);

        texture = kerelSet.simplify(texture);
        console.log("[simplify] texture", texture);
        pixels = new Uint8Array(texture.context.drawingBufferWidth * texture.context.drawingBufferHeight * 4);
        texture.context.readPixels(0, 0, texture.context.drawingBufferWidth, texture.context.drawingBufferHeight, texture.context.RGBA, texture.context.UNSIGNED_BYTE, pixels);
        console.log("pixels", pixels);
        render(pixels, display, true, false);

        texture = kerelSet.convolute(texture, filter);
        console.log("[convolute] texture", texture);
        pixels = new Uint8Array(texture.context.drawingBufferWidth * texture.context.drawingBufferHeight * 4);
        texture.context.readPixels(0, 0, texture.context.drawingBufferWidth, texture.context.drawingBufferHeight, texture.context.RGBA, texture.context.UNSIGNED_BYTE, pixels);
        console.log("pixels", pixels);
        render(pixels, display, true, false);

        texture = kerelSet.maxpool(texture);
        console.log("[maxpool] texture", texture);
        pixels = new Uint8Array(texture.context.drawingBufferWidth * texture.context.drawingBufferHeight * 4);
        texture.context.readPixels(0, 0, texture.context.drawingBufferWidth, texture.context.drawingBufferHeight, texture.context.RGBA, texture.context.UNSIGNED_BYTE, pixels);
        console.log("pixels", pixels);
        render(pixels, display, true, false);

        pixels = kerelSet.define(texture);
        console.log("[define] pixels", pixels);
        render(pixels, display, true, false);

        container.append(display);
      });

      setTimeout(() => {
        if (callback) callback();
      }, 3000);
    },
    {
      canvas: true
    }
  );
}

export default visualizeDataSet;
