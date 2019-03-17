import DataSet from "./classes/data-set.js";
console.log("Predator activated...");
new DataSet("letter-mini", 150, data => {
  console.log("Data loaded", data);
  const {Layer, Network} = window.synaptic;
  let inputLayer = new Layer(625);
  let hiddenLayer = new Layer(625);
  let outputLayer = new Layer(1);
  inputLayer.project(hiddenLayer);
  hiddenLayer.project(outputLayer);
  let myNetwork = new Network({
    input: inputLayer,
    hidden: [hiddenLayer],
    output: outputLayer
  });
  var learningRate = 0.5;
  for (var i = 0; i < 1000; i++) {
    data.t.forEach(input => {
      myNetwork.activate(input);
      myNetwork.propagate(learningRate, [1]);
    });
    data.f.forEach(input => {
      myNetwork.activate(input);
      myNetwork.propagate(learningRate, [0]);
    });
  }
  data.t.forEach(input => {
    let result = myNetwork.activate(input);
    console.log('Should output [1] ->[' + Math.round(result[0]) + ']');
  });
  data.f.forEach(input => {
    let result = myNetwork.activate(input);
    console.log('Should output [0] ->[' + Math.round(result[0]) + ']');
  });
});
