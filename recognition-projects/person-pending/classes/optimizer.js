import getRandomNumber from "../funcs/get-random-number.js";
import getRandomProperty from "../funcs/get-random-property.js";

class Optimizer {
  constructor(optimizeFunc, runFunc, settings = {}) {
    this.optimizeFunc = optimizeFunc;
    this.runFunc = runFunc;
    this.iterations = 0;
    this.bestProduct;
    this.bestScore = -Infinity;
    this.settings = {
      targetScore: settings.targetScore || Infinity,
      maxIterations: settings.maxIterations || 10,
      timeout: settings.timeout || 5 * 60 * 1000
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
      let percent = Math.round(this.iterations / this.settings.maxIterations * 100);

      let now = performance.now();
      let duration = now - start;
      console.log(
        "[Optimizer] Iteration completion: [" +
          percent +
          "%][" +
          this.iterations +
          " / " +
          this.settings.maxIterations +
          "]"
      );
      console.log(
        "[Optimizer] Duration completion: [" +
          Math.round(duration / 1000 / 60) +
          "min / " +
          Math.round(this.settings.timeout / 1000 / 60) +
          "min]"
      );
      if (
        this.iterations < 2 ||
        score < this.settings.targetScore &&
        this.iterations < this.settings.maxIterations &&
        duration < this.settings.timeout
      ) {
        console.log(
          "Optimization iteration " +
            this.iterations +
            " ended with score of " +
            score
        );
        if (score > this.bestScore) {
          console.log("Optimized with a new best score of " + score);
          this.bestScore = score;
          this.bestProduct = product;
          this.bestSettings = settings;
          this.bestDerived = derived;
        }
        this.runFunc.apply(null, [varsResult, finish]);
        console.log("Optimizer testing settings", varsResult);
      } else {
        console.log(
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
    console.log("Optimizer testing settings", varsResult);
  }
}

export default Optimizer;
