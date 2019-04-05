class FrameProcessor {
  constructor(dims) {
    this.gpu = new GPU();
    this.kernelSets = {};
    this.addScale(dims);
  }
  addScale(dims) {
    console.log("Adding scale to FrameProcessor", dims);
    let render = this.gpu
      .createKernel(function(image) {
        const pixel = image[this.thread.y][this.thread.x];
        this.color(pixel[0], pixel[1], pixel[2], pixel[3]);
      })
      .setGraphical(true)
      .setOutput([dims.w, dims.h]);
    //.pipeline(true);

    let edge = this.gpu
      .createKernel(function(texture) {
        let threshold = 80;
        return 255;
      })
      .setOutput([dims.w * 4 * dims.h]);
    //.pipeline(true);

    if (!this.kernelSets[dims.w]) this.kernelSets[dims.w] = {};
    if (!this.kernelSets[dims.w][dims.h]) this.kernelSets[dims.w][dims.h] = {};
    this.kernelSets[dims.w][dims.h].render = render;
    this.kernelSets[dims.w][dims.h].edge = edge;
  }
  process(image, dims) {
    console.log("Processing image:", image);
    let kernelSet = this.kernelSets[dims.w][dims.h];
    console.log("Kernel set:", kernelSet);
    console.log("Result canvas:", kernelSet.render._canvas);
    this.kernelSets[dims.w][dims.h].render(image);
    //let result = this.kernelSets[dims.w][dims.h].edge(texture);
    //console.log("Result of processing pipeline:", texture);


    return kernelSet.render._canvas; // should contain canvas
  }
}

export default FrameProcessor;

/*

.createKernel(function(data, channelWidth) {
  let threshold = 80;
  let remainder = this.thread.x % 4;
  let sourceIndex = this.thread.x - remainder;
  let x = (sourceIndex % channelWidth) / 4;
  let y = Math.floor((sourceIndex / channelWidth) / 4);
  let sourceR = data[sourceIndex];
  let sourceG = data[sourceIndex + 1];
  let sourceB = data[sourceIndex + 2];
  let sourceAverage = (sourceR + sourceG + sourceB) / 3;
  for (let subX = -1; subX <= 1; subX++) {
    for (let subY = -1; subY <= 1; subY++) {
      let searchIndex = (y + subY) * channelWidth + (x + subX) * 4;
      let searchR = data[searchIndex];
      let searchG = data[searchIndex + 1];
      let searchB = data[searchIndex + 2];
      let searchAverage = (searchR + searchG + searchB) / 3;
      let difference = Math.abs(searchAverage - sourceAverage);
      if (difference > threshold) {
        if (remainder === 0) {
          return 0;
        } else if (remainder === 1) {
          return 0;
        } else if (remainder === 2) {
          return 0;
        } else if (remainder === 3) {
          return 255;
        }
      }
    }
  }
  return 255;
})
.setOutput([dims.w * 4 * dims.h]);

*/
