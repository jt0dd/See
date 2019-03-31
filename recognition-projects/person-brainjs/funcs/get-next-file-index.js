function test(type, i = 0, callback) {
  let assetPath = "./sets/" + type + "/" + i + ".png";
  //console.log("Loading", assetPath);
  loadImage(assetPath, img => {
    if (img.type == "error") {
      if (callback) callback(i);
    }
  });
}

function getNextFileIndex(type) {
  test(type, 0, index => {
    return index;
  });
}

export default getNextFileIndex;
