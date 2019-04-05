import DataSet from "./classes/data-set.js";
import CompositeNetwork from "./classes/composite-network.js";
import Network from "./classes/network.js";
import scoreNet from "./funcs/score-net.js";
import visualizeDataSet from "./funcs/visualize-data-set.js";
import testResults from "./funcs/test-results.js";
import testResultsAccelerated from "./funcs/test-results-accelerated.js";
import buildComposite from "./funcs/build-composite.js";
import loadJSON from "./funcs/load-json.js";

function load(i = 0, callback, netArray = []) {
  loadJSON("./network-export/network-" + i + ".json", response => {
    if (response) {
      i++;
      netArray.push(response);
      console.log("Added network to netArray", netArray);
      load(i, callback, netArray);
    } else {
      callback(netArray);
    }
  });
}

loadJSON("./network-export/network-0.json", response => {
  if (response) {
    console.log("Loading pre-trained network");
    load(0, netArray => {
      let netArrayWrapped = [];
      netArray.forEach(net => {
        netArrayWrapped.push(new Network({}, net));
      });
      let compositeNet = new CompositeNetwork(netArrayWrapped);
      new DataSet(data => {
        //scoreNet(compositeNet, data, {ui: true});
        //testResults(compositeNet);
        testResultsAccelerated(compositeNet);
        //visualizeDataSet();
      });
    });
  } else {
    console.log("Training new network");
    buildComposite(
      compositeNet => {
        console.log("compositeNet", compositeNet);
        new DataSet(data => {
          scoreNet(compositeNet, data, {ui: true});
          testResults(compositeNet);
          visualizeDataSet();
        });
      },
      null,
      90
    );
  }
});
