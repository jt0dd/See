function debugNet(net, data, settings) {
  let executionTimes = [];
  let tScore = 0;
  let fScore = 0;
  let failCount = 0;
  data.t.forEach(input => {
    let start = performance.now();
    let result = net.testRun(input);
    let end = performance.now();
    let duration = end - start;
    executionTimes.push(duration);
    if (settings.logging) {
      console.log("Should output [1] ->[" + Math.round(result) + "]");
    }
    let weight = 1;
    if (data.t.length < data.f.length) {
      weight = data.f.length / data.t.length;
    }
    if (result === 1) {
      tScore++;
    } else {
      failCount++;
      tScore--;
    }
    tScore *= weight;
  });
  data.f.forEach(input => {
    let start = performance.now();
    let result = net.testRun(input);
    let end = performance.now();
    let duration = end - start;
    executionTimes.push(duration);
    if (settings.logging) {
      console.log("Should output [0] ->[" + Math.round(result) + "]");
    }
    let weight = 1;
    if (data.f.length < data.t.length) {
      weight = data.t.length / data.f.length;
    }
    if (result === 0) {
      fScore++;
    } else {
      failCount++;
      fScore--;
    }
    fScore *= weight;
  });
  let score = tScore + fScore;
  let total = 0;
  executionTimes.forEach(duration => {
    total += duration;
  });
  let average = total / executionTimes.length;
  if (settings.logging) {
    console.log(
      "Success rate: " +
        ((data.f.length + data.t.length - failCount) /
          (data.f.length + data.t.length)) *
          100 +
        "%"
    );
    console.log("Average execution time: " + average + "ms");
  }
  return score;
}

export default debugNet;
