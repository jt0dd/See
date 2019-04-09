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
      let compositeCanvas = document.createElement("canvas");
      let compositeContext = compositeCanvas.getContext("2d");
      compositeCanvas.width = image.width;
      compositeCanvas.height = image.height;
      document.getElementById("test-image-container").append(compositeCanvas);
      let steps = 4;
      net.setOutputScales(image, steps);

      let result = net.processFrame(image, compositeContext);
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

        */
  });
}

export default testResultsAccelerated;
