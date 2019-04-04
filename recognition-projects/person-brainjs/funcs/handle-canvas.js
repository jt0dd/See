import getNextFileIndex from "../funcs/get-next-file-index.js";

let counter = 0;
let resultStorage = {
  positives: [],
  negatives: []
};

let globalStart = [getNextFileIndex("true"), getNextFileIndex("false")];

document.getElementById("export-data").onclick = () => {
  var zip = new JSZip();
  var positives = zip.folder("true");
  var negatives = zip.folder("false");
  for (let i = 0; i < resultStorage.positives.length; i++) {
    positives.file(i + globalStart[0] + ".png", resultStorage.positives[i]);
  }
  for (let i = 0; i < resultStorage.negatives.length; i++) {
    negatives.file(i + globalStart[1] + ".png", resultStorage.negatives[i]);
  }
  zip
    .generateAsync({
      type: "blob"
    })
    .then(function(content) {
      saveAs(content, "training-data.zip");
    });
};

function handleCanvas(
  canvases,
  wrappers,
  wrapper,
  canvas,
  ctx,
  dirtyCanvas,
  dirtyContext,
  dirtyCopy,
  start
) {
  globalStart = start;
  let inputWidth = 25;
  let gatheredDataSection = document.getElementById("gathered-data");
  let gatheredDataChildren = Array.from(gatheredDataSection.children);
  let positivesContainer = document.getElementById("positives");
  let negativesContainer = document.getElementById("negatives");
  //dirtyCanvas.onmouseenter = e => {};
  dirtyCanvas.onmouseleave = e => {
    dirtyContext.putImageData(dirtyCopy, 0, 0);
  };
  dirtyCanvas.oncontextmenu = e => {
    e.preventDefault();
    if (canvas.selected) {
      if (e.shiftKey) {
        for (
          let x = -1 * inputWidth * 5;
          x < inputWidth * 5 + inputWidth;
          x += inputWidth
        ) {
          for (
            let y = -1 * inputWidth * 5;
            y < inputWidth * 5 + inputWidth;
            y += inputWidth
          ) {
            let topLeftCornerX = e.offsetX - 9 + x;
            let topLeftCornerY = e.offsetY - 9 + y;
            let bottomRightCornerX = topLeftCornerX + inputWidth;
            let bottomRightCornerY = topLeftCornerY + inputWidth;
            if (
              topLeftCornerX > 0 &&
              topLeftCornerY > 0 &&
              bottomRightCornerX < canvas.width &&
              bottomRightCornerY < canvas.height
            ) {
              let selectionData = ctx.getImageData(
                topLeftCornerX,
                topLeftCornerY,
                inputWidth,
                inputWidth
              );
              let newCanvas = document.createElement("canvas");
              newCanvas.width = inputWidth;
              newCanvas.height = inputWidth;
              let newContext = newCanvas.getContext("2d");
              newContext.putImageData(selectionData, 0, 0);
              let blob = newCanvas.toBlob(function(blob) {
                resultStorage.negatives.push(blob);
              });
              let newCanvasWrapper = document.createElement("div");
              let newCanvasWrapperCover = document.createElement("div");
              let newCanvasWrapperImg = document.createElement("img");
              newCanvasWrapperImg.src = "./assets/trash.png";
              newCanvasWrapper.className = "data-wrapper";
              newCanvasWrapperCover.className = "data-wrapper-cover";
              gatheredDataChildren.forEach(child => {
                child.style.display = "flex";
              });
              gatheredDataChildren = [];
              newCanvasWrapperCover.append(newCanvasWrapperImg);
              newCanvasWrapper.append(newCanvasWrapperCover);
              newCanvasWrapper.append(newCanvas);
              negativesContainer.prepend(newCanvasWrapper);
            }
          }
        }
      } else {
        let selectionData = ctx.getImageData(
          e.offsetX - 12,
          e.offsetY - 12,
          inputWidth,
          inputWidth
        );
        let newCanvas = document.createElement("canvas");
        newCanvas.width = inputWidth;
        newCanvas.height = inputWidth;
        let newContext = newCanvas.getContext("2d");
        newContext.putImageData(selectionData, 0, 0);
        let blob = newCanvas.toBlob(function(blob) {
          resultStorage.negatives.push(blob);
        });
        let newCanvasWrapper = document.createElement("div");
        let newCanvasWrapperCover = document.createElement("div");
        let newCanvasWrapperImg = document.createElement("img");
        newCanvasWrapperImg.src = "./assets/trash.png";
        newCanvasWrapper.className = "data-wrapper";
        newCanvasWrapperCover.className = "data-wrapper-cover";
        gatheredDataChildren.forEach(child => {
          child.style.display = "flex";
        });
        gatheredDataChildren = [];
        newCanvasWrapperCover.append(newCanvasWrapperImg);
        newCanvasWrapper.append(newCanvasWrapperCover);
        newCanvasWrapper.append(newCanvas);
        negativesContainer.prepend(newCanvasWrapper);
      }
    }
  };
  dirtyCanvas.onmousemove = e => {
    if (e.shiftKey && canvas.selected) {
      dirtyContext.putImageData(dirtyCopy, 0, 0);
      for (
        let x = -1 * inputWidth * 5;
        x < inputWidth * 5 + inputWidth;
        x += inputWidth
      ) {
        for (
          let y = -1 * inputWidth * 5;
          y < inputWidth * 5 + inputWidth;
          y += inputWidth
        ) {
          let topLeftCornerX = e.offsetX - 12 + x;
          let topLeftCornerY = e.offsetY - 12 + y;
          let bottomRightCornerX = topLeftCornerX + inputWidth;
          let bottomRightCornerY = topLeftCornerY + inputWidth;
          if (
            topLeftCornerX > 0 &&
            topLeftCornerY > 0 &&
            bottomRightCornerX < dirtyCanvas.width &&
            bottomRightCornerY < dirtyCanvas.height
          ) {
            dirtyContext.beginPath();
            dirtyContext.lineWidth = "2";
            dirtyContext.strokeStyle = "#42f4b0";
            dirtyContext.rect(
              topLeftCornerX,
              topLeftCornerY,
              inputWidth,
              inputWidth
            );
            dirtyContext.stroke();
          }
        }
      }
    } else {
      dirtyContext.putImageData(dirtyCopy, 0, 0);
      dirtyContext.beginPath();
      dirtyContext.lineWidth = "2";
      dirtyContext.strokeStyle = "#42f4b0";
      dirtyContext.rect(e.offsetX - 12, e.offsetY - 12, inputWidth, inputWidth);
      dirtyContext.stroke();
    }
  };
  dirtyCanvas.onclick = e => {
    e.preventDefault();
    if (canvas.selected) {
      if (e.shiftKey) {
        for (
          let x = -1 * inputWidth * 5;
          x < inputWidth * 5 + inputWidth;
          x += inputWidth
        ) {
          for (
            let y = -1 * inputWidth * 5;
            y < inputWidth * 5 + inputWidth;
            y += inputWidth
          ) {
            let topLeftCornerX = e.offsetX - 9 + x;
            let topLeftCornerY = e.offsetY - 9 + y;
            let bottomRightCornerX = topLeftCornerX + 25;
            let bottomRightCornerY = topLeftCornerY + 25;
            if (
              topLeftCornerX > 0 &&
              topLeftCornerY > 0 &&
              bottomRightCornerX < dirtyCanvas.width &&
              bottomRightCornerY < dirtyCanvas.height
            ) {
              let selectionData = ctx.getImageData(
                topLeftCornerX,
                topLeftCornerY,
                25,
                25
              );
              let newCanvas = document.createElement("canvas");
              newCanvas.width = 25;
              newCanvas.height = 25;
              let newContext = newCanvas.getContext("2d");
              newContext.putImageData(selectionData, 0, 0);
              let blob = newCanvas.toBlob(function(blob) {
                resultStorage.positives.push(blob);
              });
              let newCanvasWrapper = document.createElement("div");
              let newCanvasWrapperCover = document.createElement("div");
              let newCanvasWrapperImg = document.createElement("img");
              newCanvasWrapperImg.src = "./assets/trash.png";
              newCanvasWrapper.className = "data-wrapper";
              newCanvasWrapperCover.className = "data-wrapper-cover";
              gatheredDataChildren.forEach(child => {
                child.style.display = "flex";
              });
              gatheredDataChildren = [];
              newCanvasWrapperCover.append(newCanvasWrapperImg);
              newCanvasWrapper.append(newCanvasWrapperCover);
              newCanvasWrapper.append(newCanvas);
              positivesContainer.prepend(newCanvasWrapper);
            }
          }
        }
      } else {
        let selectionData = ctx.getImageData(
          e.offsetX - 12,
          e.offsetY - 12,
          25,
          25
        );
        let newCanvas = document.createElement("canvas");
        newCanvas.width = 25;
        newCanvas.height = 25;
        let newContext = newCanvas.getContext("2d");
        newContext.putImageData(selectionData, 0, 0);
        let blob = newCanvas.toBlob(function(blob) {
          resultStorage.positives.push(blob);
        });
        let newCanvasWrapper = document.createElement("div");
        let newCanvasWrapperCover = document.createElement("div");
        let newCanvasWrapperImg = document.createElement("img");
        newCanvasWrapperImg.src = "./assets/trash.png";
        newCanvasWrapper.className = "data-wrapper";
        newCanvasWrapperCover.className = "data-wrapper-cover";
        gatheredDataChildren.forEach(child => {
          child.style.display = "flex";
        });
        gatheredDataChildren = [];
        newCanvasWrapperCover.append(newCanvasWrapperImg);
        newCanvasWrapper.append(newCanvasWrapperCover);
        newCanvasWrapper.append(newCanvas);
        positivesContainer.prepend(newCanvasWrapper);
      }
    } else {
      wrappers.forEach(item => {
        item.style.width = "";
        item.style.height = "";
        item.style.marginRight = "";
        item.className = "";
      });
      canvases.forEach(item => {
        item.selected = false;
        item.className = "";
        item.style.opacity = "";
      });
      wrapper.style.width = dirtyCanvas.width + "px";
      wrapper.style.height = dirtyCanvas.height + "px";
      wrapper.style.marginRight = "1000px";
      canvas.selected = true;
      wrapper.className = "selected";
      dirtyCanvas.className = "selected";
    }
  };
}

export default handleCanvas;
