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
    let start = performance.now();
    let varsRaw = this.optimizeFunc();
    console.log('varsRaw', varsRaw);
    let varsResult = {};
    let varsLength = Object.keys(varsRaw).length;
    Object.keys(varsRaw).forEach(key => {
      varsResult[key] = varsRaw[key][0];
    });
    console.log('varsResult', varsResult);
    for (let i = 0; i < getRandomNumber(1, varsLength); i++) {
      let prop = getRandomProperty(varsResult);
      console.log('prop', prop);
      varsResult[prop] = varsRaw[prop][1];
    }
    let finish;
    finish = (score, product, settings, derived) => {
      this.iterations++;
      let now = performance.now();
      let duration = now - start;
      if (
        score < this.settings.targetScore &&
        this.iterations < this.settings.maxIterations &&
        duration < this.settings.timeout
      ) {
        console.log('Optimization iteration ' + this.iterations + ' ended with score of ' + score);
        if (score > this.bestScore) {
          console.log('Optimized with a new best score of ' + score);
          this.bestScore = score;
          this.bestProduct = product;
          this.bestSettings = settings;
          this.bestDerived = derived;
        }
        this.runFunc.apply(null, [varsResult, finish]);
        console.log('Optimizer testing settings', varsResult);
      } else {
        console.log('Optimization finished with a best score of ' + this.bestScore + ' and a final product', this.bestProduct, settings);
        callback(this.bestProduct, this.bestSettings, this.bestDerived);
      }
    };
    this.runFunc.apply(null, [varsResult, finish]);
    console.log('Optimizer testing settings', varsResult);
  }
}

export default Optimizer;
