import Network from "../classes/network.js";

class CompositeNetwork {
  constructor(networkArray = []) {
    this.networkArray = networkArray;
    this.trainee = false;
  }
  run(input) {
    let result = 0;
    this.networkArray.forEach((network) => {
      if (result === 0) {
        result = Math.round(network.run(input)[0]);
      }
    });
    return result;
  }
  testRun(input) {
    let result = 0;
    let testNetArray = this.networkArray.slice();
    testNetArray.push(this.trainee);
    testNetArray.forEach((network) => {
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
    data.forEach(item => {
      let input = item[0];
      let expected = item[1][0];
      if (this.networkArray.length > 0) {
        let result = this.run(input);
        if (result === expected) {
          console.log(
            "Network already already outputs [",
            result,
            "] as expected [",
            expected,
            "], no need to train layer against this data."
          );
        } else {
          console.log(
            "Network failed to output expected [",
            expected,
            "], instead output was [",
            result,
            "], training trainee layer against this data."
          );
          relevantData.push(item);
        }
      } else {
        console.log(
          "Network is the first layer of the CompositeNetwork, training trainee layer against this (all) data."
        );
        relevantData.push(item);
      }
    });
    console.log('relevantData', relevantData);
    console.log('config', config);
    this.trainee.train(relevantData, config);
    //console.log('debug');
  }
}

export default CompositeNetwork;
