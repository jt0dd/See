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
    this.processTime = 0;
    if (net) {
      this.net = new brain.NeuralNetwork();
      this.net = this.net.fromJSON(net)
    } else {
      this.net = new brain.NeuralNetwork(config);
    }
  }
  process(imageData) {
    start = performance.now();
    processed = edge(imageData, 25, 25, 24);
    processed = simplify(processed, 50);
    processed = convolute(processed);
    processed = extrude(processed);
    end = performance.now();
    duration = end - start;
    this.processTime += duration;
    return processed;
  }
  run(input) {
    this.processTime = 0;
    return this.net.run(this.process(input));
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
