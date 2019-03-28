import Logger from "../classes/logger.js";

let logger = new Logger('testResults');

function testResults(net, i = 0) {
  loadImage(
    "./test-frames/" + i + ".png",
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
            let result = net.run(input);
            let endRun = performance.now();
            let durationRun = endRun - startRun;
            runDurations.push(durationRun);
            if (Math.round(result) === 1) {
              logger.log("result", result);
              logger.log("Recognized enemy at [" + x + ", " + y + "]");
              targets.push([x, y]);
            }
          }
        }
        let endPass = performance.now();
        let durationPass = endPass - startPass;
        logger.log("We found targets:", targets);
        targets.forEach(target => {
          ctx.beginPath();
          ctx.lineWidth = "2";
          ctx.strokeStyle = "#40dd35";
          ctx.rect(target[0], target[1], 25, 25);
          ctx.stroke();
        });
        document.body.append(img);
        logger.log(
          "[Performance Logging] Total frame processing took " +
            durationPass +
            "ms."
        );
        let total = 0;
        runDurations.forEach(duration => {
          total += duration;
        });
        let average = total / runDurations.length;
        logger.log(
          "[Performance Logging] Average net run [25px x 25px] took: " +
            average +
            "ms."
        );
        i++;
        testResults(net, i);
      }
    },
    {
      canvas: true
    }
  );
}

export default testResults;
