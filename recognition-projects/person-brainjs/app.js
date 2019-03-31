import DataSet from "./classes/data-set.js";

import testNet from "./funcs/test-net.js";
import visualizeDataSet from "./funcs/visualize-data-set.js";
import testResults from "./funcs/test-results.js";
import buildComposite from "./funcs/build-composite.js";

visualizeDataSet(() => {
  buildComposite(compositeNet => {
    console.log("compositeNet", compositeNet);
    new DataSet(data => {
      testNet(compositeNet, data, {
        logging: true
      });
      testResults(compositeNet);
    });
  }, null, 90);
});
