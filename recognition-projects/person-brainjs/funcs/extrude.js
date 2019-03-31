function extrude(data) {
  let result = [];
  let total = 0;
  let highest = -Infinity;
  let lowest = Infinity;
  data.forEach(val => {
    total += val;
    //console.log(val);
    if (val > highest) {
      highest = val;
    }
    if (val < lowest) {
      lowest = val;
    }
  });
  let middle = (highest - lowest) / 2;
  let average = total / data.length;
  let highestFromTop = 1 - highest;
  let lowestFromBottom = lowest;
  //console.log('highest, lowest, middle, average, highestFromTop, lowestFromBottom', highest, lowest, middle, average, highestFromTop, lowestFromBottom)
  data.forEach(val => {
    if (val > average) {
      val += highestFromTop;
      let distanceFromTop = 1 - val;
      val += distanceFromTop / 2;
    } else {
      val -= lowestFromBottom;
      let distanceFromBottom = val;
      val -= distanceFromBottom / 2;
    }
    result.push(val);
  });
  //console.log('Extruded data from', data, 'to', result);
  return result;
}

export default extrude;
