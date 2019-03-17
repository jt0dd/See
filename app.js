import DataSet from "./classes/data-set.js";
console.log("Predator activated...");
new DataSet("letter-mini", 150, data => {
  console.log("Data loaded", data);
  const config = {
    inputSize: 100,
    //inputRange: 20,
    //hiddenLayers: [20, 20],
    outputSize: 1,
    learningRate: 0.01,
    decayRate: 0.999
  };
  const net = new brain.NeuralNetworkGPU(config);
  let trainingSet = [];
  for (var i = 0; i < 1000; i++) {
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
  }
  console.log('Built training set', trainingSet);
  net.train(trainingSet);
  console.log("[1, 0] -> [1] ->", );
  console.log("[0, 1] -> [1] ->", Math.round(net.run([0, 1])));
  console.log("[0, 0] -> [0] ->", Math.round(net.run([0, 0])));
  console.log("[1, 1] -> [0] ->", Math.round(net.run([1, 1])));
  data.t.forEach(input => {
    let result = Math.round(net.run(input));
    console.log('Should output [1] ->[' + result[0] + ']');
  });
  data.f.forEach(input => {
    let result = Math.round(net.run(input));
    console.log('Should output [0] ->[' + result[0] + ']');
  });
});
