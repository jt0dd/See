import Logger from "../classes/logger.js";
import handleCanvas from "../funcs/handle-canvas.js";

let logger = new Logger("testResultsAccelerated");

function testResultsAccelerated(net, i = 0) {
  loadImage("./test-frames/" + i + ".png", image => {
    if (image.type != "error") {
      i++;
      testResultsAccelerated(net, i);
    }
    if (image.type != "error") {
      let steps = 4;
      net.setOutputScales(image, steps);
      let result = net.processFrame(image);
    }

    //logger.log('Result', result);

    /*
        logger.log("[Performance Logging] Frame processing time: " + total);
        logger.log("We found targets:", allTargets);

        let speedTarget = 6;
        let speedTargetFraction = 1000 / speedTarget;
        let speedFraction = speedTargetFraction / total;
        document.getElementById("stat-speed-progress").style.width =
          "calc(" + Math.ceil(speedFraction * 100) + "% - 10px)";
        document.getElementById("stat-speed-text").innerText =
          Math.round(total) +
          "ms per 1080p frame of target " + Math.round(speedTargetFraction) + "ms - " +
          Math.round(1000 / total) +
          "FPS / " +
          speedTarget +
          "FPS target";

        allTargets.forEach(target => {
          rawContext.beginPath();
          rawContext.lineWidth = "3";
          rawContext.strokeStyle = "#40dd35";
          rawContext.rect(
            Math.round(target[0] * target[2]),
            Math.round(target[1] * target[2]),
            25 * target[2],
            25 * target[2]
          );
          rawContext.stroke();
        });
        */
  });
}

export default testResultsAccelerated;
