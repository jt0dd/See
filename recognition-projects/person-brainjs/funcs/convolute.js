import Filter from "../classes/filter.js";
import Pool from "../classes/pool.js";

let filter = new Filter();
let pool = new Pool();

function convolute(bitmap) {
  let convolution = [];
  let bitmapSize = 25; // Math.floor(Math.sqrt(bitmap.length))
  let filterSide = 1;
  let steps = Math.floor(bitmapSize / filter.step);
  for (let x = 0; x < steps; x++) {
    for (let y = 0; y < steps; y++) {
      let input = [];
      for (
        let subX = x * filter.step - filterSide;
        subX <= x * filter.step + filterSide;
        subX++
      ) {
        for (
          let subY = y * filter.step - filterSide;
          subY <= y * filter.step + filterSide;
          subY++
        ) {
          if (subX >= 0 && subY >= 0) {
            let index = subY * (bitmapSize - 1) + subX + 1;
            input.push(bitmap[index]);
          } else {
            input.push(0);
          }
        }
      }
      convolution.push(filter.run(input));
    }
  }
  let maxPool = [];
  let poolSide = 1;
  steps = Math.floor(bitmapSize / pool.step);
  for (let x = 0; x <= bitmapSize; x += pool.step) {
    for (let y = 0; y <= bitmapSize; y += pool.step) {
      let input = [];
      for (let subX = 0; subX < pool.size; subX++) {
        for (let subY = 0; subY < pool.size; subY++) {
          let index = (y + subY) * bitmapSize + (x + subX); //let index = (y + subY) * (bitmapSize - 1) + (x + subX) + 1;
          input.push(convolution[index]);
        }
      }
      maxPool.push(pool.run(input));
    }
  }
  //console.log('convoluted result', maxPool);
  return maxPool;
}

export default convolute;
