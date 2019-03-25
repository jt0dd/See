import Network from "../classes/network.js";

class CompositeNetwork {
  constructor(networkArray = []) {
    this.networkArray = networkArray;
    this.trainee = false;
  }
  run(input) {
    let result = 0;
    this.networkArray.forEach(network => {
      if (result === 0) {
        result = Math.round(network.run(input)[0]);
        console.log("tested network result", result);
      }
    });
    return result;
  }
  testRun(input) {
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
  confirmTrainee() {
    this.networkArray.push(this.trainee);
    delete this.trainee;
  }
  train(dataSet, config) {
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
    data.forEach(item => {
      let input = item[0];
      let expected = item[1][0];

      if (this.networkArray.length > 0) {
        let result = this.run(input);
        if (result === 0) {
          console.log(
            "Training trainee against any negative results, regardless of previous layer success."
          );
          relevantData.push(item);
        } else if (result !== expected) {
          console.log(
            "Network failed to output expected [",
            expected,
            "], instead output was [",
            result,
            "], training trainee layer against this data."
          );
          relevantData.push(item);
        } else {
          console.log(
            "Network already outputs [",
            expected,
            "], as expected [",
            result,
            "], not training trainee against this data."
          );
          skips++;
        }
      } else {
        console.log(
          "Network is the first layer of the CompositeNetwork, training trainee layer against this (all) data."
        );
        relevantData.push(item);
      }
    });
    if (skips > 0) {
      console.log(
        "Previous layers allow this layer to train for recognition of ",
        skips,
        "fewer positive profiles, creating the opportunity for specialization."
      );
    }
    console.log("relevantData", relevantData);
    this.trainee.train(relevantData, config);
  }
}

export default CompositeNetwork;
