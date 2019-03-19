import Optimizer from "../classes/optimizer.js";
import DataSet from "../classes/data-set.js";
import Convoluter from "../classes/convoluter.js";

import getRandomNumber from "../funcs/get-random-number.js";
import getRandomDecimal from "../funcs/get-random-decimal.js";

let convoluter = new Convoluter();
function getOptimalNetwork(convolute, finalCallback) {
  const optimizerSettings = {
    //targetScore : Infinity,
    //maxIterations : Infinity,
    timeout: 10 * 60 * 1000
  };
  new Optimizer(
    () => {
      let activations = ['sigmoid', 'relu', 'leaky-relu', 'tanh'];
      const optimizeables = {
        layerCount: [1, getRandomNumber(2, 5)],
        learnRate: [0.3, getRandomDecimal(0.1, 0.9)],
        momentum: [0.1, getRandomDecimal(0.1, 0.9)],
        errorThresh: [0.001, getRandomDecimal(0.001, 0.1)],
        learningRate: [0.01, getRandomDecimal(0.01, 0.5)],
        activation: ['sigmoid', activations[Math.floor(Math.random() * activations.length)]],
        leakyReluAlpha: [0.01, getRandomDecimal(0.01, 0.5)]
      };
      return optimizeables;
    },
    (vars, callback) => {
      new DataSet("a", 50, data => {
        console.log("Data loaded", data);
        const layerArray = [];
        const inputSize = 169;
        const outputSize = 1;
        let smallest = getRandomNumber(inputSize, outputSize);
        for (let i = 0; i < vars.layerCount; i++) {
          let random = getRandomNumber(smallest, outputSize);
          if (random > smallest) {
            smallest = random;
          }
          layerArray.push(random);
        }
        const config = {
          inputSize: inputSize,
          //inputRange: 20,
          hiddenLayers: layerArray,
          outputSize: outputSize,
          learningRate: vars.learningRate,
          activation: vars.activation,  // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
          leakyReluAlpha: vars.leakyReluAlpha
        };
        const trainerConfig = {
          //iterations: 100, // the maximum times to iterate the training data --> number greater than 0
          errorThresh: vars.errorThresh, // the acceptable error percentage from training data --> number between 0 and 1
          log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
          learningRate: vars.learnRate, // scales with delta to effect training rate --> number between 0 and 1
          momentum: vars.momentum, // scales with next layer's change value --> number between 0 and 1
          timeout: 3 * 60 * 1000
        };
        const net = new brain.NeuralNetwork(config);
        let trainingSet = [];
        let t = [];
        data.t.forEach(bitmap => {
          t.push(convoluter.run(bitmap));
        });
        let f = [];
        data.f.forEach(bitmap => {
          f.push(convoluter.run(bitmap));
        });
        console.log('debug', data.t, data.f)
        console.log('debug2', t, f)
        t.forEach(input => {
          trainingSet.push({
            input: input,
            output: [1]
          });
        });
        f.forEach(input => {
          trainingSet.push({
            input: input,
            output: [0]
          });
        });
        let executionTimes = [];
        console.log("Built training set", trainingSet);
        net.train(trainingSet, trainerConfig);
        let successScore = 0;
        let failureWeight = 1000;
        let successWeight = 1000;
        t = [];
        data.t.forEach(bitmap => {
          t.push(convoluter.run(bitmap));
        });
        f = [];
        data.f.forEach(bitmap => {
          f.push(convoluter.run(bitmap));
        });
        t.forEach(input => {
          let start = performance.now();
          let result = Math.round(net.run(input));
          let end = performance.now();
          let duration = end - start;
          executionTimes.push(duration);
          console.log("Should output [1] ->[" + result + "]");
          if (result === 1) {
            successScore += successWeight;
          } else {
            successScore -= failureWeight;
          }
        });
        f.forEach(input => {
          let start = performance.now();
          let result = Math.round(net.run(input));
          let end = performance.now();
          let duration = end - start;
          executionTimes.push(duration);
          console.log("Should output [0] ->[" + result + "]");
          if (result === 0) {
            successScore += successWeight;
          } else {
            successScore -= failureWeight;
          }
        });
        let total = 0;
        executionTimes.forEach(duration => {
          total += duration;
        });
        let average = total / executionTimes.length;
        console.log("Average execution time:", average + "ms");
        console.log(net);
        let score = 0;
        score -= net.hiddenLayers.length * 100;
        score -= average * 400;
        score += successScore;
        let derived = {
          layerArray
        };
        callback(score, net, vars, derived);
      });
    },
    optimizerSettings
  ).optimize((result, settings, derived) => {
    let net = result;
    console.log("Optimization result", result, settings, derived);
    new DataSet("a", 50, data => {
      console.log("Data loaded", data);
      const layerArray = derived.layerArray;
      const inputSize = 169;
      const outputSize = 1;
      const config = {
        inputSize: inputSize,
        //inputRange: 20,
        hiddenLayers: layerArray,
        outputSize: outputSize
      };
      let executionTimes = [];
      let t = [];
      data.t.forEach(bitmap => {
        t.push(convoluter.run(bitmap));
      });
      let f = [];
      data.f.forEach(bitmap => {
        f.push(convoluter.run(bitmap));
      });
      t.forEach(input => {
        let start = performance.now();
        let result = Math.round(net.run(input));
        let end = performance.now();
        let duration = end - start;
        executionTimes.push(duration);
        console.log("Should output [1] ->[" + result + "]");
      });
      f.forEach(input => {
        let start = performance.now();
        let result = Math.round(net.run(input));
        let end = performance.now();
        let duration = end - start;
        executionTimes.push(duration);
        console.log("Should output [0] ->[" + result + "]");
      });
      let total = 0;
      executionTimes.forEach(duration => {
        total += duration;
      });
      let average = total / executionTimes.length;
      console.log("Average execution time:", average + "ms");
      console.log(net);
      if (finalCallback) {
        finalCallback(net);
      }
    });
  });
}

export default getOptimalNetwork;
