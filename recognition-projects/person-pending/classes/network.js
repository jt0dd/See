import edge from "../funcs/edge.js";
import simplify from "../funcs/simplify.js";
import convolute from "../funcs/convolute.js";
import extrude from "../funcs/extrude.js";

class Network {
  constructor(config) {
    this.net = new brain.NeuralNetwork(config);
  }
  process(imageData) {
    let processed;
    processed = edge(imageData, 25, 25, 24);
    processed = simplify(processed, 50);
    processed = convolute(processed);
    processed = extrude(processed);
    return processed;
  }
  run(input) {
    return this.net.run(this.process(input));
  }
  train(dataSet, config) {
    console.log("Training network...");
    let trainingData = [];
    dataSet.forEach(item => {
      trainingData.push({input: this.process(item[0]), output: item[1]});
    });
    console.log("trainingData", trainingData);
    console.log('config', config);
    console.log('this.net', this.net);
    if (this.net.hasTrained) {
      throw 'This network is being trained a second time';
    }
    this.net.train(trainingData, config);
    this.net.hasTrained = true;
    console.log('should have trained');
    console.log('this.net', this.net);

    console.log('this.net', this.net);
  }
}

export default Network;
