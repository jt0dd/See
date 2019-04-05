import Logger from "../classes/logger.js";
import handleCanvas from "../funcs/handle-canvas.js";

let logger = new Logger("testResultsAccelerated");

function testResultsAccelerated(net, i = 0) {
  loadImage(
    "./test-frames/" + i + ".png",
    image => {
      if (image.type != "error") {
        i++;
        testResultsAccelerated(net, i);
      }
      if (image.type != "error") {
        let allTargets = [];
        let lastScale = 1;
        //for (let percent = 100; percent >= 10; percent -= 5) {
        let percent = 100;
          let percentScale = percent / 100;
          let adjustedScale = percentScale / lastScale;
          lastScale = percentScale;
          let newWidth = Math.round(image.width * adjustedScale);
          let newHeight = Math.round(image.height * adjustedScale);
          logger.log("Processing frame...");
          let dims = {w: newWidth, h: newHeight};
          net.addOutputScale(dims);
          let result = net.processFrame(image, dims);
          document.getElementById("accelerated-image-container").append(result);


          /*
          targets.forEach(target => {
            ctx.beginPath();
            ctx.lineWidth = "2";
            ctx.strokeStyle = "#40dd35";
            ctx.rect(target[0], target[1], 25, 25);
            ctx.stroke();
          });
          */
        //}

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
      }
    }
  );
}

export default testResultsAccelerated;
