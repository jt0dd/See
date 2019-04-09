import edge from "../funcs/edge.js";
import simplify from "../funcs/simplify.js";
import convolute from "../funcs/convolute.js";
import extrude from "../funcs/extrude.js";

let start;
let end;
let duration;
let processed;

class Network {
  constructor(config, net) {
    if (net) {
      this.net = new brain.NeuralNetworkGPU();
      this.net = this.net.fromJSON(net)
    } else {
      this.net = new brain.NeuralNetworkGPU(config);
    }
  }
  run(input, x, y, inputSqrt) {
    start = performance.now();
    return this.net.run(input);
    end = performance.now();
    duration = end - start;
    this.processTime = duration;
  }
  train(dataSet, config, callback) {
    let trainingData = [];
    dataSet.forEach(item => {
      trainingData.push({input: this.process(item[0]), output: item[1]});
    });
    this.net.trainAsync(trainingData, config).then(net => {
      callback(net);
    });
  }
}

export default Network;
