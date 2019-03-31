import Logger from "../classes/logger.js";

import getRandomNumber from "../funcs/get-random-number.js";
import getRandomProperty from "../funcs/get-random-property.js";

let logger = new Logger('Optimizer');

class Optimizer {
  constructor(optimizeFunc, runFunc, settings = {}) {
    this.optimizeFunc = optimizeFunc;
    this.runFunc = runFunc;
    this.iterations = 0;
    this.bestProduct;
    this.bestScore = -Infinity;
    this.settings = {
      targetScore: settings.targetScore || Infinity,
      maxIterations: settings.maxIterations || 100,
      timeout: settings.timeout || 8 * 60 * 1000
    };
  }
  optimize(callback) {
    // Add persistent setting success learning, multi thread, multi window and multi machine support here

    let start = performance.now();
    let varsRaw = this.optimizeFunc();
    let varsResult = {};
    let varsLength = Object.keys(varsRaw).length;
    Object.keys(varsRaw).forEach(key => {
      varsResult[key] = varsRaw[key][0];
    });
    for (let i = 0; i < getRandomNumber(1, varsLength); i++) {
      let prop = getRandomProperty(varsResult);
      varsResult[prop] = varsRaw[prop][1];
    }
    let finish;
    finish = (score, product, settings, derived) => {
      this.iterations++;
      let percent = Math.round(
        (this.iterations / this.settings.maxIterations) * 100
      );
      let now = performance.now();
      let duration = now - start;
      logger.log(
        "[Optimizer] Iteration completion: [" +
          percent +
          "%][" +
          this.iterations +
          " / " +
          this.settings.maxIterations +
          "]"
      );
      logger.log(
        "[Optimizer] Duration completion: [" +
          Math.round(duration / 1000 / 60) +
          "min / " +
          Math.round(this.settings.timeout / 1000 / 60) +
          "min]"
      );
      if (score > this.bestScore) {
        logger.log("Optimized with a new best score of " + score);
        this.bestScore = score;
        this.bestProduct = product;
        this.bestSettings = settings;
        this.bestDerived = derived;
      } else {
        logger.log(
          "sanity check this.bestScore, this.bestProduct",
          this.bestScore,
          this.bestProduct
        );
      }
      if (
        score < this.settings.targetScore &&
        this.iterations < this.settings.maxIterations &&
        duration < this.settings.timeout &&
        this.iterations > 1
      ) {
        logger.log(
          "Optimization iteration " +
            this.iterations +
            " ended with score of " +
            score
        );
        this.runFunc.apply(null, [varsResult, finish]);
        logger.log("Optimizer testing settings", varsResult);
      } else {
        logger.log(
          "Optimization finished with a best score of " +
            this.bestScore +
            " and a final product",
          this.bestProduct,
          settings
        );
        callback(this.bestProduct, this.bestSettings, this.bestDerived);
      }
    };

    varsRaw = this.optimizeFunc();
    varsResult = {};
    varsLength = Object.keys(varsRaw).length;
    Object.keys(varsRaw).forEach(key => {
      varsResult[key] = varsRaw[key][0];
    });

    this.runFunc.apply(null, [varsResult, finish]);
    logger.log("Optimizer testing settings", varsResult);
  }
}

export default Optimizer;
