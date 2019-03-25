function edge(data, width, height, threshold) {
  let resultImg = [];
  let map = [];
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let done = false;
      let sourceIndex = y * width * 4 + x * 4;
      //result[sourceIndex / 4] = 0;
      resultImg[sourceIndex] = 255;
      resultImg[sourceIndex + 1] = 255;
      resultImg[sourceIndex + 2] = 255;
      resultImg[sourceIndex + 3] = 255;
      if (map[sourceIndex]) {
        continue;
      }
      for (let subX = -1; subX < 2; subX++) {
        for (let subY = -1; subY < 2; subY++) {
          let searchIndex = (y + subY) * width * 4 + (x + subX) * 4;
          let searchR = data[searchIndex];
          let searchG = data[searchIndex + 1];
          let searchB = data[searchIndex + 2];
          let searchAverage = (searchR + searchG + searchB) / 3;
          let sourceR = data[sourceIndex];
          let sourceG = data[sourceIndex + 1];
          let sourceB = data[sourceIndex + 2];
          let sourceAverage = (sourceR + sourceG + sourceB) / 3;
          let difference = Math.abs(searchAverage - sourceAverage);
          if (done) {
            map[searchIndex] = true;
          }
          if (difference > threshold) {
            map[sourceIndex] = true;
            map[searchIndex] = true;
            resultImg[searchIndex] = 0;
            resultImg[searchIndex + 1] = 0;
            resultImg[searchIndex + 2] = 0;
            resultImg[searchIndex + 3] = 255;
            done = true;
          }
        }
      }
    }
  }
  //console.log('edged result', resultImg);
  return resultImg;
}

export default edge;
