import Optimizer from "./classes/optimizer.js";
import DataSet from "./classes/data-set.js";
import CompositeNetwork from "./classes/composite-network.js";

import trainNetworkLayer from "./funcs/train-network-layer.js";
import debugNet from "./funcs/debug-net.js";

trainNetworkLayer(null, net1 => {
  console.log('net1', net1);
  trainNetworkLayer(net1, net2 => {
    console.log('net2', net2);
    new DataSet(data => {
      debugNet(net2, data, {
        logging: true
      });
      loadImage(
        "./test-frames/0.png",
        img => {
          if (img.type != "error") {
            let targets = [];
            let runDurations = [];
            let ctx = img.getContext("2d");
            let step = 10;
            let startPass = performance.now();
            for (let x = 0; x + step < img.width; x += step) {
              for (let y = 0; y + step < img.height; y += step) {
                let input = ctx.getImageData(x, y, 25, 25).data;
                let startRun = performance.now();
                let result = net2.run(input);
                let endRun = performance.now();
                let durationRun = endRun - startRun;
                runDurations.push(durationRun);
                if (Math.round(result) === 1) {
                  console.log('result', result)
                  console.log('Recognized enemy at [' + x + ', ' + y + ']')
                  targets.push([x, y]);
                }
              }
            }
            let endPass = performance.now();
            let durationPass = endPass - startPass;
            console.log("We found targets:", targets);
            targets.forEach(target => {
              ctx.beginPath();
              ctx.lineWidth = "2";
              ctx.strokeStyle = "#40dd35";
              ctx.rect(target[0], target[1], 25, 25);
              ctx.stroke();
            })
            document.body.append(img);
            console.log('[Performance Logging] Total frame processing took ' + durationPass + 'ms.');
            let total = 0;
            runDurations.forEach((duration) => {
              total += duration;
            });
            let average = total / runDurations.length;
            console.log('[Performance Logging] Average net2 run [25px x 25px] took: ' + average + 'ms.');
          } else {
            throw "Bad image url.";
          }
        },
        {
          canvas: true
        }
      );
    });
  });
});
