function simplify(data, threshold) {
  let result = [];
  let resultsRaw = [];
  for (let i = 0; i < data.length; i += 4) {
    let total = data[i] + data[i + 1] + data[i + 2];
    let average = total / 3;
    resultsRaw.push(average);
  }
  resultsRaw.forEach(val => {
    if (val > threshold) {
      result.push(1);
    } else {
      result.push(0);
    }
  });
  return result;
}

export default simplify;
