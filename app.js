import DataSet from "./classes/data-set.js";
console.log("Predator activated...");
new DataSet("letter", 150, data => {
  console.log("Data loaded", data);
  const config = {
    inputSize: 625,
    //inputRange: 20,
    //hiddenLayers: [20, 20],
    outputSize: 1,
    learningRate: 0.01,
    decayRate: 0.999
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
  console.log('Built training set', trainingSet);
  net.train(trainingSet);
  data.t.forEach(input => {
    let result = Math.round(net.run(input));
    console.log('Should output [1] ->[' + result   + ']');
  });
  data.f.forEach(input => {
    let result = Math.round(net.run(input));
    console.log('Should output [0] ->[' + result + ']');
  });
});
