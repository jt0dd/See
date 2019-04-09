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

function readContext(context) {
  let result = new Uint8Array(
    context.drawingBufferWidth * context.drawingBufferHeight * 4
  );
  context.readPixels(
    x,
    y,
    context.drawingBufferWidth,
    context.drawingBufferHeight,
    context.RGBA,
    context.UNSIGNED_BYTE,
    input
  );
  return result;
}
function flattenData(data) {
  let result = [];
  data.forEach(arr => {
    arr.forEach(val => {
      result.push(val);
    });
  });
  return result;
}

function normalizeColorData(data) {
  let result = [];
  data.forEach(val => {
    result.push(val / 5);
  });
  return result;
}

function extendColorData(data) {
  let result = [];
  data.forEach(val => {
    result.push(val);
    result.push(val);
    result.push(val);
    result.push(255);
  });
  return result;
}

function extrapolateColorData(data) {
  let result = [];
  data.forEach(val => {
    result.push(Math.floor(val * 255));
  });
  return result;
}

function render(data, display, settings = {
  extrapolate : false,
  extend: false,
  flatten: false,
  normalize: false
}) {
  if (settings.read) {
    data = readContext(data);
    //logger.log('Flattened data:', data);
  }
  if (settings.flatten) {
    data = flattenData(data);
    //logger.log('Flattened data:', data);
  }
  if (settings.normalize) {
    data = normalizeColorData(data);
    //logger.log('Normalized data:', data);
  }
  if (settings.extrapolate) {
    data = extrapolateColorData(data);
    //logger.log('Extrapolated data:', data);
  }
  if (settings.extend) {
    data = extendColorData(data);
    //logger.log('Extended data:', data);
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

      data.t.forEach((img, index) => {
        let display = document.createElement("div");
        let result = document.createElement("div");
        result.className = "result-status";
        display.append(result);
        display.id = "t" + index;
        display.className = "true";

        let texture = kerelSet.render(img);
        //console.log("[render] texture", texture);
        let pixels = new Uint8Array(texture.context.drawingBufferWidth * texture.context.drawingBufferHeight * 4);
        texture.context.readPixels(0, 0, texture.context.drawingBufferWidth, texture.context.drawingBufferHeight, texture.context.RGBA, texture.context.UNSIGNED_BYTE, pixels);
        //console.log("pixels", pixels);
        render(pixels, display, {
          flatten: false,
          normalize: false,
          extrapolate : false,
          extend: false
        });

        texture = kerelSet.edge(texture);
        //console.log("[edge] texture", texture);
        pixels = new Uint8Array(texture.context.drawingBufferWidth * texture.context.drawingBufferHeight * 4);
        texture.context.readPixels(0, 0, texture.context.drawingBufferWidth, texture.context.drawingBufferHeight, texture.context.RGBA, texture.context.UNSIGNED_BYTE, pixels);
        //console.log("pixels", pixels);
        render(pixels, display, {
          flatten: false,
          normalize: false,
          extrapolate : false,
          extend: false
        });

        pixels = kerelSet.simplify(texture);
        //console.log("[simplify] pixels", pixels);
        render(pixels, display, {
          flatten: true,
          normalize: false,
          extrapolate : true,
          extend: true
        });

        pixels = kerelSet.convolute(pixels, filter);
        //console.log("[convolute] pixels", pixels);
        render(pixels, display, {
          flatten: true,
          normalize: true,
          extrapolate : true,
          extend: true
        });

        pixels = kerelSet.maxpool(pixels);
        //console.log("[maxpool] pixels", pixels);
        render(pixels, display, {
          flatten: true,
          normalize: false,
          extrapolate : true,
          extend: true
        });

        pixels = kerelSet.define(pixels);
        //console.log("[define] pixels", pixels);
        render(pixels, display, {
          flatten: true,
          normalize: false,
          extrapolate : true,
          extend: true
        });

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
