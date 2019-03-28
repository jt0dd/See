import Logger from "../classes/logger.js";

import getChildWithClassname from "../funcs/get-child-with-classname.js";

let logger = new Logger('testNet');

function testNet(net, data, settings, callback = false) {
  let executionTimes = [];
  let tScore = 0;
  let fScore = 0;
  let failCount = 0;
  data.t.forEach((input, index) => {
    let start = performance.now();
    let result;
    if (net.trainee) {
      result = net.testRun(input);
    } else {
      result = net.run(input);
    }
    let end = performance.now();
    let duration = end - start;
    executionTimes.push(duration);
    if (settings.logging) {
      logger.log("Should output [1] ->[" + Math.round(result) + "]");
    }
    let weight = 1;
    if (data.t.length < data.f.length) {
      weight = data.f.length / data.t.length;
    }
    let element = document.getElementById("t" + index);
    let child = getChildWithClassname(element, "result-status");
    if (result === 1) {
      if (child) {
        child.style = "background-color: #40ef83";
      }
      tScore++;
    } else {
      if (child) {
        child.style = "background-color: #f45942";
      }
      failCount++;
      tScore -= weight;
    }
  });
  data.f.forEach((input, index) => {
    let start = performance.now();
    let result = net.testRun(input);
    let end = performance.now();
    let duration = end - start;
    executionTimes.push(duration);
    if (settings.logging) {
      logger.log("Should output [0] ->[" + Math.round(result) + "]");
    }
    let weight = 1;
    if (data.f.length < data.t.length) {
      weight = data.t.length / data.f.length;
    }
    let element = document.getElementById("f" + index);
    let child = getChildWithClassname(element, "result-status");
    if (result === 0) {
      if (child) {
        child.style = "background-color: #40ef83";
      }
      fScore++;
    } else {
      if (child) {
        child.style = "background-color: #f45942";
      }
      failCount++;
      fScore -= weight;
    }
  });
  let score = tScore + fScore;
  let total = 0;
  executionTimes.forEach(duration => {
    total += duration;
  });
  let average = total / executionTimes.length;
  let successRate =
    ((data.f.length + data.t.length - failCount) /
      (data.f.length + data.t.length)) *
    100;
  if (settings.logging) {
    logger.log("Success rate: " + successRate + "%");
    logger.log("Average execution time: " + average + "ms");
  }
  if (callback) {
    callback(net, successRate, failCount);
  }
  return score;
}

export default testNet;
