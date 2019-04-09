class FrameProcessor {
  constructor(gpu) {
    if (gpu) {
      this.gpu = gpu;
    } else {
      this.gpu = new GPU();
    }
    this.kernelSets = {};
    this.filter = [1, 0, 1, 0, 1, 0, 1, 0, 1]; // this should be calculated dynamically and imported to support dynamic filter sizing
  }
  addScale(
    dims,
    settings = {
      pipe: true
    }
  ) {
    console.log("Adding scale to FrameProcessor", dims);

    let scale = this.gpu
      .createKernel(
        function(image, scale) {
          const pixel =
            image[Math.floor(this.thread.y * scale)][
              Math.floor(this.thread.x * scale)
            ];
          this.color(pixel[0], pixel[1], pixel[2], pixel[3]);
        },
        {
          pipeline: true
        }
      )
      .setGraphical(true)
      .setOutput([dims.w, dims.h]);

    let render = this.gpu
      .createKernel(
        function(image) {
          const pixel = image[this.thread.y][this.thread.x];
          this.color(pixel[0], pixel[1], pixel[2], pixel[3]);
        },
        {
          pipeline: true
        }
      )
      .setGraphical(true)
      .setOutput([dims.w, dims.h]);

    let edge = this.gpu
      .createKernel(
        function(texture) {
          let threshold = 12 / 255;
          let sourcePixel = texture[this.thread.y][this.thread.x];
          let sourceOption1 = sourcePixel[0];
          let sourceOption2 = sourcePixel[1];
          let sourceOption3 = sourcePixel[2];
          let sourceOption4 = (sourcePixel[0] + sourcePixel[1]) / 2;
          let sourceOption5 = (sourcePixel[0] + sourcePixel[2]) / 2;
          let sourceOption6 = (sourcePixel[1] + sourcePixel[2]) / 2;
          let sourceOption7 =
            (sourcePixel[0] + sourcePixel[1] + sourcePixel[2]) / 3;
          let flag = 1;
          for (let subX = -1; subX <= 0; subX++) {
            for (let subY = -1; subY <= 0; subY++) {
              let choice = Math.random();
              let targetPixel =
                texture[this.thread.y + subY][this.thread.x + subX];
              let targetOption1 = targetPixel[0];
              let targetOption2 = targetPixel[1];
              let targetOption3 = targetPixel[2];
              let targetOption4 = (targetPixel[0] + targetPixel[1]) / 2;
              let targetOption5 = (targetPixel[0] + targetPixel[2]) / 2;
              let targetOption6 = (targetPixel[1] + targetPixel[2]) / 2;
              let targetOption7 =
                (targetPixel[0] + targetPixel[1] + targetPixel[2]) / 3;
              let difference1 = Math.abs(targetOption1 - sourceOption1);
              let difference2 = Math.abs(targetOption2 - sourceOption2);
              let difference3 = Math.abs(targetOption3 - sourceOption3);
              let difference4 = Math.abs(targetOption4 - sourceOption4);
              let difference5 = Math.abs(targetOption5 - sourceOption5);
              let difference6 = Math.abs(targetOption6 - sourceOption6);
              let difference7 = Math.abs(targetOption7 - sourceOption7);
              let difference = difference1;
              //let difference = Math.min(difference1, difference2, difference3, difference4); // feature broken
              if (difference2 < difference) {
                difference = difference2;
              }
              if (difference3 < difference) {
                difference = difference3;
              }
              if (difference4 < difference) {
                difference = difference4;
              }
              if (difference5 < difference) {
                difference = difference5;
              }
              if (difference6 < difference) {
                difference = difference6;
              }
              if (difference7 < difference) {
                difference = difference7;
              }
              if (difference > threshold && choice > 0.1) {
                this.color(0, 0, 0, 1);
                flag = 0;
                subY++;
                subX++;
                subY++;
                subX++;
              }
            }
          }
          if (flag == 1) {
            this.color(1, 1, 1, 1);
          }
        },
        {
          pipeline: true
        }
      )
      .setGraphical(true)
      .setOutput([dims.w, dims.h]);

    let simplify = this.gpu
      .createKernel(
        function(texture) {
          let pixel = texture[this.thread.y][this.thread.x];
          if (pixel[0] > 0) {
            return 0;
          } else {
            return 1;
          }
        },
        {
          pipeline: settings.pipe
        }
      )
      .setOutput([dims.w, dims.h]);

    let convolute = this.gpu
      .createKernel(
        function(texture, filter) {
          let poolSide = 1;
          let negativePoolSide = poolSide * -1;
          let value = 0;
          let x = 0;
          for (let xOffset = negativePoolSide; xOffset <= poolSide; xOffset++) {
            let y = 0;
            for (
              let yOffset = negativePoolSide;
              yOffset <= poolSide;
              yOffset++
            ) {
              let yIndex = this.thread.y + 1 + yOffset;
              let xIndex = this.thread.x + 1 + xOffset;
              value += texture[yIndex][xIndex] * filter[x * 3 + y];
              y++;
            }
            x++;
          }
          return value;
        },
        {
          pipeline: settings.pipe
        }
      )
      .setOutput([dims.w - 2, dims.h - 2]);

    let maxpool = this.gpu
      .createKernel(
        function(texture) {
          let max = 5; // should be generated dynamically based on filter size
          let poolSide = 1;
          let negativePoolSide = poolSide * -1;
          let value = 5;
          for (let xOffset = negativePoolSide; xOffset <= poolSide; xOffset++) {
            for (
              let yOffset = negativePoolSide;
              yOffset <= poolSide;
              yOffset++
            ) {
              let yIndex = this.thread.y + 1 + yOffset;
              let xIndex = this.thread.x + 1 + xOffset;
              if (texture[yIndex][xIndex] < value) {
                value = texture[yIndex][xIndex];
              }
            }
          }
          return value / max;
        },
        {
          pipeline: settings.pipe
        }
      )
      .setOutput([dims.w - 4, dims.h - 4]);

    let define = this.gpu
      .createKernel(
        function(texture) {
          let value = texture[this.thread.y][this.thread.x];
          if (value > 0.75) {
            let distanceHalf = (1 - value) / 2;
            return value + distanceHalf;
          } else if (value > 0.5) {
            let distanceHalf = (value - 0.5) / 2;
            return value - distanceHalf;
          } else if (value > 0.2) {
            let distanceHalf = (0.5 - value) / 2;
            return value + distanceHalf;
          } else {
            let distanceHalf = value / 2;
            return value - distanceHalf;
          }
        },
        {
          pipeline: settings.pipe
        }
      )
      .setOutput([dims.w - 4, dims.h - 4]);

    if (!this.kernelSets[dims.w]) this.kernelSets[dims.w] = {};
    if (!this.kernelSets[dims.w][dims.h]) this.kernelSets[dims.w][dims.h] = {};
    this.kernelSets[dims.w][dims.h].scale = scale;
    this.kernelSets[dims.w][dims.h].render = render;
    this.kernelSets[dims.w][dims.h].edge = edge;
    this.kernelSets[dims.w][dims.h].simplify = simplify;
    this.kernelSets[dims.w][dims.h].convolute = convolute;
    this.kernelSets[dims.w][dims.h].maxpool = maxpool;
    this.kernelSets[dims.w][dims.h].define = define;
  }
  process(image, dims, scale) {
    let kernelSet = this.kernelSets[dims.w][dims.h];
    let start = performance.now();
    let scaledImageTexture = kernelSet.scale(image, scale);
    let texture1 = kernelSet.render(scaledImageTexture);
    let texture2 = kernelSet.edge(texture1);
    let texture3 = kernelSet.simplify(texture2);
    let texture4 = kernelSet.convolute(texture3, this.filter);
    let texture5 = kernelSet.maxpool(texture4);
    let result = kernelSet.define(texture5);
    let end = performance.now();
    let duration = end - start;
    console.log("Processing", dims, "took", duration + "ms");
    return result;
  }
}

export default FrameProcessor;
