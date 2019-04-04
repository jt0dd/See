import Optimizer from "../classes/optimizer.js";
import DataSet from "../classes/data-set.js";
import Network from "../classes/network.js";
import CompositeNetwork from "../classes/composite-network.js";
import Logger from "../classes/logger.js";

import getRandomNumber from "../funcs/get-random-number.js";
import getRandomDecimal from "../funcs/get-random-decimal.js";
import scoreNet from "../funcs/score-net.js";

let optimizerMinutes = 1;
let trainerMinutes = 1;

let logger = new Logger('trainNetwork');

function trainNetworkLayer(originNetwork, finalCallback) {
  const optimizerSettings = {
    // targetScore : Infinity,
    //maxIterations: 30,
    timeout: optimizerMinutes * 60 * 1000
  };
  new Optimizer(
    () => {
      let activations = ["sigmoid", "relu", "leaky-relu", "tanh"];
      const optimizeables = {
        layerCount: [1, getRandomNumber(2, 5)],
        learnRate: [0.3, getRandomDecimal(0.1, 0.9)],
        momentum: [0.1, getRandomDecimal(0.1, 0.9)],
        learningRate: [0.01, getRandomDecimal(0.01, 0.5)],
        activation: [
          "sigmoid",
          activations[Math.floor(Math.random() * activations.length)]
        ],
        leakyReluAlpha: [0.01, getRandomDecimal(0.01, 0.5)]
      };
      return optimizeables;
    },
    (vars, callback) => {
      new DataSet(data => {
        logger.log("Data loaded", data);
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
          inputRange: 20,
          hiddenLayers: layerArray,
          outputSize: outputSize,
          learningRate: vars.learningRate,
          activation: vars.activation, // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
          leakyReluAlpha: vars.leakyReluAlpha
        };
        let initialized = false;
        let previousErr = Infinity;
        let stagnantCount = 0;
        let tooSlowCount = 0;
        let prevProgressTime = performance.now();
        let logInterval = 100;
        let logCounter = 0;
        const trainerConfig = {
          iterations: 20000, // the maximum times to iterate the training data --> number greater than 0
          errorThresh: 0.00005, // the acceptable error percentage from training data --> number between 0 and 1
          log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
          logPeriod: logInterval,
          callback: e => {
            logCounter++;
            if (e.error) {
              if (e.error < 0.00005) {
                logger.log('Got exceptional error rate', e.error);
              } else if (e.error < 0.0005) {
                logger.log('Got good error rate', e.error);
              }
              if (logCounter % logInterval === 0) {
                let now = performance.now();
                let timeSinceIteration = now - prevProgressTime;
                prevProgressTime = performance.now();
                if (timeSinceIteration > 20000) {
                  tooSlowCount++;
                }
                if (timeSinceIteration > 20000 && tooSlowCount > 5) {
                  logger.log(
                    "Time since last iteration",
                    timeSinceIteration,
                    "-> Too slow, ending training."
                  );
                  net.trainee.net.trainOpts.iterations = 1;
                }
                initialized = true;
                let targetProgress = previousErr * 0.0000003;
                if (!(e.error < previousErr - targetProgress)) {
                  stagnantCount++;
                  if (stagnantCount >= 50) {
                    logger.log(
                      "trainingError",
                      e.error,
                      "not progressing to goal of",
                      previousErr - targetProgress,
                      "-> Stagnant, ending training."
                    );
                    net.trainee.net.trainOpts.iterations = 1;
                  }
                }
                previousErr = e.error;
              }
            }
          },
          callbackPeriod: 1,
          learningRate: vars.learnRate, // scales with delta to effect training rate --> number between 0 and 1
          momentum: vars.momentum, // scales with next layer's change value --> number between 0 and 1
          timeout: trainerMinutes * 60 * 1000
        };
        let executionTimes = [];
        let successScore = 0;
        let failureWeight = 1000;
        let successWeight = 1000;
        let newNet = new Network(config);
        let net;
        if (!originNetwork) {
          logger.log("Training the first layer of a new CompositeNetwork");
          net = new CompositeNetwork();
          net.setTrainee(newNet);
        } else {
          logger.log("Training a new layer of existing CompositeNetwork");
          net = new CompositeNetwork(originNetwork.networkArray);
          net.setTrainee(newNet);
        }
        net.train(data, trainerConfig, () => {
          successScore =
            scoreNet(net, data, {
              logging: true
            }) * 10;
          let score = 0;
          //score -= net.processTime * 100;
          //score -= average * 400;
          score += successScore;
          let derived = {
            layerArray
          };
          callback(score, net, vars, derived);
        });
      });
    },
    optimizerSettings
  ).optimize((result, settings, derived) => {
    let net = result;
    net.confirmTrainee();
    logger.log("Optimization result", result, settings, derived);
    if (finalCallback) {
      finalCallback(net);
    }
  });
}

export default trainNetworkLayer;
