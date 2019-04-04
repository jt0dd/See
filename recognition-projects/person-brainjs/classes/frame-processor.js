class FrameProcessor {
  constructor(canvas = document.createElement("canvas")) {
    this.gpu = new GPU(canvas);
    this.canvas = canvas;
    this.edge = gpu
      .createKernel(function(canvas) {
        const pixel = image[this.thread.y][this.thread.x];
        this.color(pixel[0], pixel[1], pixel[2], pixel[3]);
      })
      .setGraphical(true)
      .setOutput([canvas.width, canvas.height]);

    this.simplify = gpu
      .createKernel(function(canvas) {
        const pixel = image[this.thread.y][this.thread.x];
        this.color(255, pixel[1], pixel[2], pixel[3]);
      })
      .setGraphical(true)
      .setOutput([100]);

    this.convolute = gpu
      .createKernel(function(canvas) {
        const pixel = image[this.thread.y][this.thread.x];
        this.color(pixel[0], pixel[1], pixel[2], pixel[3]);
      })
      .setGraphical(true)
      .setOutput([100]);

    this.extrude = gpu
      .createKernel(function(canvas) {
        const pixel = image[this.thread.y][this.thread.x];
        this.color(pixel[0], pixel[1], pixel[2], pixel[3]);
      })
      .setGraphical(true)
      .setOutput([100]);
  }
  process(callback) {
    this.edge.apply(null, [this.canvas]);
    this.simplify.apply(null, [this.canvas]);
    this.convolute.apply(null, [this.canvas]);
    this.extrude.apply(null, [this.canvas]);
  }
}

export default FrameProcessor;
