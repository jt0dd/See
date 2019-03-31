import DataSet from "../classes/data-set.js";
import Logger from "../classes/logger.js";

import testNet from "../funcs/test-net.js";
import trainNetworkLayer from "../funcs/train-network-layer.js";

let logger = new Logger('buildComposite');

function buildComposite(callback, existingNet = null, target = 99){
  trainNetworkLayer(existingNet, newNet => {
    new DataSet(data => {
      testNet(newNet, data, {
        logging: true
      }, (newNet, successRate, failCount) => {
        if (successRate < target) {
          logger.log('Composite network [', newNet, '] currently at successRate of [' + successRate + '%] and failCount of ', failCount, ', building next layer.');
          buildComposite(callback, newNet, target);
        } else {
          logger.log('Composite network built successfully [', newNet, '] with successRate of [' + successRate + '%] and failCount of ', failCount);
          callback(newNet);
        }
      });
    });
  });
}

export default buildComposite;
