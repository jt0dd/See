class FrameProcessor {
  constructor() {
    this.gpu = new GPU();
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
          let threshold = 24 / 255;
          let sourcePixel = texture[this.thread.y][this.thread.x];
          let sourceAverage =
            (sourcePixel[0] + sourcePixel[1] + sourcePixel[2]) / 3;

          let flag = 1;
          for (let subX = -1; subX <= 0; subX++) {
            for (let subY = -1; subY <= 0; subY++) {
              let choice = Math.random();
              let targetPixel =
                texture[this.thread.y + subY][this.thread.x + subX];
              let targetAverage =
                (targetPixel[0] + targetPixel[1] + targetPixel[2]) / 3;
              if (
                Math.abs(targetAverage - sourceAverage) > threshold &&
                choice > 0.25
              ) {
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
      .createKernel(function(texture) {
        let value = texture[this.thread.y][this.thread.x];
        if (value > 0.75) {
          let distanceHalf = (1 - value) / 2;
          return value + distanceHalf;
        } else if (value > 0.5) {
          let distanceHalf = (value - 0.5) / 2;
          return value - distanceHalf;
        } else if (value > 0.25) {
          let distanceHalf = (0.5 - value) / 2;
          return value + distanceHalf;
        } else {
          let distanceHalf = value / 2;
          return value - distanceHalf;
        }
      })
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
    return {scaledImageTexture, result};
  }
}

export default FrameProcessor;
