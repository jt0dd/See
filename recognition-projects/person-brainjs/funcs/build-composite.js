import DataSet from "../classes/data-set.js";
import Logger from "../classes/logger.js";
import scoreNet from "../funcs/score-net.js";
import trainNetworkLayer from "../funcs/train-network-layer.js";

let logger = new Logger("buildComposite");

function buildComposite(callback, existingNet = null, target = 99) {
  document.getElementById("stat-comp-accuracy-target").style.width =
    target + "%";
  trainNetworkLayer(existingNet, newNet => {
    new DataSet(data => {
      scoreNet(
        newNet,
        data,
        {
          logging: true
        },
        (newNet, successRate, failCount, fFailCount, tFailCount) => {
          if (successRate < target) {
            logger.log(
              "Composite network [",
              newNet,
              "] currently at successRate of [" +
                successRate +
                "%] and failCount of ",
              failCount,
              ", building next layer."
            );
            buildComposite(callback, newNet, target);
          } else {
            logger.log(
              "Composite network built successfully [",
              newNet,
              "] with successRate of [" + successRate + "%] and failCount of ",
              failCount
            );
            document.getElementById("export-network").onclick = () => {
              var zip = new JSZip();
              var networkFolder = zip.folder("network");

              newNet.export().forEach((networkJSON, index) => {
                console.log("Exporting JSON", networkJSON);
                networkFolder.file(
                  "network-" + index + ".json",
                  JSON.stringify(networkJSON)
                );
              });
              zip.generateAsync({type: "blob"}).then(function(content) {
                // see FileSaver.js
                saveAs(content, "network-" + Math.round(successRate) + ".zip");
                //var blob = new Blob(networkJSON, {type: "text/plain;charset=utf-8"});
                //saveAs(blob, "network" + index + ".json");
              });
            };

            callback(newNet);
          }
        }
      );
    });
  });
}

export default buildComposite;
