import Logger from "../classes/logger.js";

import handleCanvas from "../funcs/handle-canvas.js";

let logger = new Logger("testResults");
let wrappers = [];
let canvases = [];

function testResults(net, i = 0) {
  loadImage(
    "./test-frames/" + i + ".png",
    img => {
      if (img.type != "error") {
        i++;
        testResults(net, i);
      }
      let rawContext = img.getContext("2d");
      let wrapper = document.createElement("div");
      wrapper.append(img);
      let allTargets = [];
      for (let percent = 100; percent >= 10; percent -= 5) {
        let bar = document.createElement("div");
        bar.className = "image-bar";
        let cover = document.createElement("div");
        bar.className = "image-cover";
        let subwrapper = document.createElement("div");
        wrappers.push(subwrapper);
        let subwrapper2 = document.createElement("div");
        let scaleImg = loadImage.scale(
          img, // img or canvas element
          {maxWidth: img.width * (percent / 100)}
        );
        if (img.type != "error") {
          let targets = [];
          let runDurations = [];
          let ctx = scaleImg.getContext("2d");
          let step = 10;
          let startPass = performance.now();
          for (let x = 0; x + step < img.width; x += step) {
            for (let y = 0; y + step < img.height; y += step) {
              let input = ctx.getImageData(x, y, 25, 25).data;
              let startRun = performance.now();
              let result = net.run(input);
              let endRun = performance.now();
              let durationRun = endRun - startRun;
              runDurations.push(durationRun);
              if (Math.round(result) === 1) {
                logger.log("result", result);
                logger.log("Recognized enemy at [" + x + ", " + y + "]");
                targets.push([x, y]);
                allTargets.push([x, y, percent / 100]);
              }
            }
          }
          let endPass = performance.now();
          let durationPass = endPass - startPass;
          logger.log("We found targets:", targets);
          logger.log(
            "[Performance Logging] Total frame processing took " +
              durationPass +
              "ms."
          );
          targets.forEach(target => {
            ctx.beginPath();
            ctx.lineWidth = "2";
            ctx.strokeStyle = "#40dd35";
            ctx.rect(target[0], target[1], 25, 25);
            ctx.stroke();
          });
          let cleanImg = document.createElement("canvas");
          canvases.push(cleanImg);
          cleanImg.width = scaleImg.width;
          cleanImg.height = scaleImg.height;
          let cleanContext = cleanImg.getContext("2d");
          cleanContext.drawImage(scaleImg, 0, 0);
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
          container.append(wrapper);
          wrapper.append(subwrapper);
          subwrapper.append(subwrapper2);
          subwrapper2.append(scaleImg);
          subwrapper2.append(bar);
          subwrapper2.append(cover);
          let total = 0;
          runDurations.forEach(duration => {
            total += duration;
          });
          let average = total / runDurations.length;
          logger.log(
            "[Performance Logging] Average net run [25px x 25px] took: " +
              average +
              "ms with a total processing time by network of: " + total
          );
        }
      }
      allTargets.forEach(target => {
        rawContext.beginPath();
        rawContext.lineWidth = "2";
        rawContext.strokeStyle = "#40dd35";
        rawContext.rect(Math.round(target[0] * target[3]), Math.round(target[1] * target[3]), 25, 25);
        rawContext.stroke();
      });
    },
    {
      canvas: true
    }
  );
}

export default testResults;
