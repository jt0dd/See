import Network from "../classes/network.js";
import Logger from "../classes/logger.js";
import FrameProcessor from "../classes/frame-processor.js";
let logger = new Logger("CompositeNetwork");
let processTime;

class CompositeNetwork {
  constructor(networkArray = []) {
    this.networkArray = networkArray;
    this.trainee = false;
    this.processTime = 0;
    this.kernels = {};
  }
  setFrameProcessor() {
    if (
      this.networkArray[0] &&
      this.networkArray[0].net &&
      this.networkArray[0].net.gpu
    ) {
      this.gpu = this.networkArray[0].net.gpu;
      logger.log("Established shared GPU:", this.gpu);
      this.frameProcessor = new FrameProcessor(this.gpu);
    } else {
      console.log("this.networkArray[0]", this.networkArray[0]);
      throw "Called setFrameProcessor before establishing a network to share a GPU with!";
    }
  }
  export() {
    let results = [];
    this.networkArray.forEach(network => {
      results.push(network.net.toJSON());
    });
    logger.log("Exported network", results);
    return results;
  }
  import(networkArray) {
    networkArray.forEach(net => {
      this.networkArray.push(new Network(null, net));
    });
    logger.log("Imported network", this.networkArray);
  }
  setOutputScales(image, steps) {
    if (!this.frameProcessor) {
      this.setFrameProcessor();
    }
    let imageWidth = image.width;
    let imageHeight = image.height;
    let prevDims = {w: imageWidth, h: imageHeight};
    let lastScale = 1;
    let step = Math.round(100 / steps);
    this.steps = steps;
    this.step = step;
    for (let percent = 100; percent >= step; percent -= step) {
      let percentScale = percent / 100;
      let adjustedScale = percentScale / lastScale;
      lastScale = percentScale;
      let newWidth = Math.round(imageWidth * adjustedScale);
      let newHeight = Math.round(imageHeight * adjustedScale);
      let dims = {w: newWidth, h: newHeight};
      prevDims = dims;
      this.frameProcessor.addScale(dims);
    }
  }
  processFrame(image, compositeContext) {
    logger.log("Processing frame...");
    let imageWidth = image.width;
    let imageHeight = image.height;
    let lastScale = 1;
    let start = performance.now();
    let prevDims = {w: imageWidth, h: imageHeight};
    let frameCount = 0;
    let allTargets = [];
    let passingOutputDuration = 0;
    for (let percent = 100; percent >= this.step; percent -= this.step) {
      frameCount++;
      let percentScale = percent / 100;
      let adjustedScale = percentScale / lastScale;
      lastScale = percentScale;
      let newWidth = Math.round(imageWidth * adjustedScale);
      let newHeight = Math.round(imageHeight * adjustedScale);
      let dims = {w: newWidth, h: newHeight};
      let scale = prevDims.w / dims.w;
      prevDims = dims;
      let resultTexture = this.frameProcessor.process(image, dims, scale);
      logger.log("resultTexture", resultTexture);
      let chunkSize = 15;
      let inputSize = this.networkArray[0].net.sizes[0];
      if (!this.kernels[inputSize]) {
        this.kernels[inputSize] = this.gpu
          .createKernel(
            function(texture, x, y, inputSqrt) {
              let xOffset = this.thread.x % inputSqrt;
              let yOffset = Math.round(this.thread.x / inputSqrt);
              let value = texture[x + xOffset][y + yOffset];
              return value;
            },
            {
              //pipeline: true
            }
          )
          .setOutput([inputSize]);
      }
      console.log("net", this.networkArray[0].net);
      let inputSqrt = Math.round(Math.sqrt(inputSize));
      logger.log("inputSize", inputSize);
      logger.log("inputSqrt", inputSqrt);
      let targets = [];
      let inputStart = performance.now();
      let runtimeDuration = 0;
      for (let x = 0; x < image.width - 4 - chunkSize; x += chunkSize) {
        for (let y = 0; y < image.height - 4 - chunkSize; y += chunkSize) {
          console.log(
            "resultTexture, x, y, inputSqrt",
            resultTexture,
            x,
            y,
            inputSqrt
          );
          let inputTexture = this.kernels[inputSize](
            resultTexture,
            x,
            y,
            inputSqrt
          );
          console.log("inputTexture", inputTexture);
          //let input =
          /*
            if (this.run(resultTexture, x, y, inputSqrt) === 1) {
              targets.push([x, y]);
              allTargets.push([x, y, 1 + (1 - percentScale)]);
            }
            */
        }
      }
      let inputEnd = performance.now();
      let duration = inputEnd - inputStart;
      passingOutputDuration += duration;

      let subsetContext = false;
      if (subsetContext) {
        targets.forEach(target => {
          subsetContext.beginPath();
          subsetContext.lineWidth = "2";
          subsetContext.strokeStyle = "#40dd35";
          subsetContext.rect(target[0], target[1], inputSqrt, inputSqrt);
          subsetContext.stroke();
        });
      }

      if (compositeContext) {
        allTargets.forEach(target => {
          compositeContext.beginPath();
          compositeContext.lineWidth = "2";
          compositeContext.strokeStyle = "#40dd35";
          compositeContext.rect(
            target[0],
            target[1],
            inputSqrt * target[3],
            inputSqrt * target[3]
          );
          compositeContext.stroke();
        });
      }
    }
    console.log(
      "Passing output duration for frame:",
      passingOutputDuration,
      "ms "
    );
    let end = performance.now();
    let duration = end - start;
    logger.log(
      "Processing frame complete with avg duration of",
      duration / frameCount + "ms and a total duration of",
      duration + "ms"
    );
  }
  run(input, x, y, inputSqrt) {
    let result = 0;
    this.processTime = 0;
    this.networkArray.forEach(network => {
      if (result === 0) {
        result = Math.round(network.run(input, x, y, inputSqrt)[0]);
        //console.log("network.processTime", network.processTime);
        this.processTime += network.processTime;
      }
    });
    return result;
  }
  testRun(input) {
    if (!this.trainee) {
      return this.run(input);
    }
    let result = 0;
    let testNetArray = this.networkArray.slice();
    testNetArray.push(this.trainee);
    testNetArray.forEach(network => {
      if (result === 0) {
        result = Math.round(network.run(input)[0]);
      }
    });
    return result;
  }
  setTrainee(net) {
    this.trainee = net;
  }
  generateWorkers() {
    this.workers = [];
    for (let i = 0; i < this.threads; i++) {
      this.workers.push(new Worker("./workers/main.js"));
      this.workers[i].postMessage({
        operation: "load-network-array",
        networkArray: this.export()
      });
    }
    console.log("Generated workers on ", this.threads, "threads.");
  }
  confirmTrainee() {
    this.networkArray.push(this.trainee);
    delete this.trainee;
  }
  train(dataSet, config, callback) {
    let data = [];
    dataSet.t.forEach(input => {
      data.push([input, [1]]);
    });
    dataSet.f.forEach(input => {
      data.push([input, [0]]);
    });
    let trainee = this.trainee;
    let relevantData = [];
    let skips = 0;
    let learns = 0;
    data.forEach(item => {
      let input = item[0];
      let expected = item[1][0];

      if (this.networkArray.length > 0) {
        let result = this.run(input);
        if (result === 0 || expected === 0) {
          logger.log(
            "Training trainee against any negative results, regardless of previous layer success."
          );
          relevantData.push(item);
        } else if (result !== expected) {
          logger.log(
            "Network failed to output expected [",
            expected,
            "], instead output was [",
            result,
            "], training trainee layer against this data."
          );
          relevantData.push(item);
          learns++;
        } else {
          logger.log(
            "Network already outputs [",
            expected,
            "], as expected [",
            result,
            "], not training trainee against this data."
          );
          skips++;
        }
      } else {
        logger.log(
          "Network is the first layer of the CompositeNetwork, training trainee layer against this (all) data."
        );
        relevantData.push(item);
      }
    });
    if (skips > 0) {
      logger.log(
        "Previous layers allow this layer to train for recognition of",
        skips,
        "fewer positive profiles, creating the opportunity for specialization toward the remaining",
        dataSet.t.length - skips,
        "positive profiles that the previous layer failed to recognize."
      );
    }
    this.trainee.train(relevantData, config, callback);
  }
}

export default CompositeNetwork;
