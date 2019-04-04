import Logger from "../classes/logger.js";

import handleCanvas from "../funcs/handle-canvas.js";

let logger = new Logger("testResults");
let wrappers = [];
let canvases = [];
let total = 0;

function testResults(net, i = 0) {
  loadImage(
    "./test-frames/" + i + ".png",
    img => {
      if (img.type != "error") {
        i++;
        testResults(net, i);
      }
      if (img.type != "error") {
        let rawContext = img.getContext("2d");
        let wrapper = document.createElement("div");
        wrapper.append(img);
        let allTargets = [];
        for (let percent = 100; percent >= 10; percent -= 5) {
          let scaleImg = loadImage.scale(
            img, // img or canvas element
            {maxWidth: img.width * (percent / 100)}
          );
          let cleanImg = document.createElement("canvas");
          canvases.push(cleanImg, scaleImg);
          cleanImg.width = scaleImg.width;
          cleanImg.height = scaleImg.height;
          let cleanContext = cleanImg.getContext("2d");
          cleanContext.drawImage(scaleImg, 0, 0);
          let bar = document.createElement("div");
          bar.className = "image-bar";
          let subwrapper = document.createElement("div");
          wrappers.push(subwrapper);
          let subwrapper2 = document.createElement("div");
          let targets = [];
          let runDurations = [];
          let ctx = scaleImg.getContext("2d");
          let step = 25;
          let startPass = performance.now();
          let processingDuration = 0;
          for (let x = 0; x + step < img.width; x += step) {
            for (let y = 0; y + step < img.height; y += step) {
              let input = ctx.getImageData(x, y, 25, 25).data;
              let startRun = performance.now();
              let result = net.run(input);
              processingDuration += net.processTime;
              let endRun = performance.now();
              let durationRun = endRun - startRun;
              runDurations.push(durationRun);
              if (Math.round(result) === 1) {
                targets.push([x, y]);
                let multiplier = 1 / (percent / 100);
                allTargets.push([x, y, multiplier]);
              }
            }
          }

          let endPass = performance.now();
          let durationPass = endPass - startPass;

          targets.forEach(target => {
            ctx.beginPath();
            ctx.lineWidth = "2";
            ctx.strokeStyle = "#40dd35";
            ctx.rect(target[0], target[1], 25, 25);
            ctx.stroke();
          });

          let copy = ctx.getImageData(0, 0, scaleImg.width, scaleImg.height);
          handleCanvas(
            canvases,
            wrappers,
            subwrapper,
            cleanImg,
            cleanContext,
            scaleImg,
            ctx,
            copy,
            [0, 0]
          );
          let container = document.getElementById("test-image-container");
          let expandImg = document.createElement("img");
          expandImg.src = "./assets/expand.png";
          container.append(wrapper);
          wrapper.append(subwrapper);
          subwrapper.append(subwrapper2);
          subwrapper2.append(scaleImg);
          subwrapper2.append(expandImg);
          if (targets.length > 0) {
            subwrapper2.append(bar);
          }
          runDurations.forEach(duration => {
            total += duration;
          });
        }

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
      }
    },
    {
      canvas: true
    }
  );
}

export default testResults;
