import Optimizer from "../classes/optimizer.js";
import DataSet from "../classes/data-set.js";

import getRandomNumber from "../funcs/get-random-number.js";

function getOptimalNetwork(callback){
  const optimizerSettings = {
    //targetScore : Infinity,
    //maxIterations : Infinity,
    //timeout: Infinity
  }
  new Optimizer(()=>{
    const optimizeables = {
      layerCount : [1, getRandomNumber(2, 5)]
    }
    return optimizeables;
  }, (vars, callback)=>{
    new DataSet("letter", 50, data => {
      console.log("Data loaded", data);
      const layerArray = [];
      const inputSize = 2500;
      const outputSize = 1;
      let smallest = getRandomNumber(inputSize, outputSize);
      for (let i = 0; i < vars.layerCount; i++){
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
        outputSize: outputSize
      };
      const trainerConfig = {
        //iterations: 100, // the maximum times to iterate the training data --> number greater than 0
        //errorThresh: 0.01, // the acceptable error percentage from training data --> number between 0 and 1
        log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
        //logPeriod: 10, // iterations between logging out --> number greater than 0
        //learningRate: 0.3, // scales with delta to effect training rate --> number between 0 and 1
        //momentum: 0.1, // scales with next layer's change value --> number between 0 and 1
        //callback: null, // a periodic call back that can be triggered while training --> null or function
        //callbackPeriod: 10, // the number of iterations through the training data between callback calls --> number greater than 0
        timeout: 20000
      };
      const net = new brain.NeuralNetwork(config);
      let trainingSet = [];
      data.t.forEach(input => {
        trainingSet.push({
          input: input,
          output: [1]
        });
      });
      data.f.forEach(input => {
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
      data.t.forEach(input => {
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
      data.f.forEach(input => {
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
  }, optimizerSettings).optimize((result, settings, derived)=>{
    let net = result;
    console.log('Optimization result', result, settings, derived);
    new DataSet("letter", 50, data => {
      console.log("Data loaded", data);
      const layerArray = derived.layerArray;
      const inputSize = 2500;
      const outputSize = 1;
      const config = {
        inputSize: inputSize,
        //inputRange: 20,
        hiddenLayers: layerArray,
        outputSize: outputSize
      };
      let executionTimes = [];
      data.t.forEach(input => {
        let start = performance.now();
        let result = Math.round(net.run(input));
        let end = performance.now();
        let duration = end - start;
        executionTimes.push(duration);
        console.log("Should output [1] ->[" + result + "]");
      });
      data.f.forEach(input => {
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
      callback(net);
    });
  });
}

export default getOptimalNetwork;
