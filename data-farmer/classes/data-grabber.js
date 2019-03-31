function handleMouseMove(event) {
  var eventDoc, doc, body;

  event = event || window.event; // IE-ism

  // If pageX/Y aren't available and clientX/Y are,
  // calculate pageX/Y - logic taken from jQuery.
  // (This is to support old IE)
  if (event.pageX == null && event.clientX != null) {
    eventDoc = (event.target && event.target.ownerDocument) || document;
    doc = eventDoc.documentElement;
    body = eventDoc.body;

    event.pageX =
      event.clientX +
      ((doc && doc.scrollLeft) || (body && body.scrollLeft) || 0) -
      ((doc && doc.clientLeft) || (body && body.clientLeft) || 0);
    event.pageY =
      event.clientY +
      ((doc && doc.scrollTop) || (body && body.scrollTop) || 0) -
      ((doc && doc.clientTop) || (body && body.clientTop) || 0);
  }
  this.mouseX = event.pageX;
  this.mouseY = event.pageY;
  this.box.style.left = event.pageX - 12 + "px";
  this.box.style.top = event.pageY - 12 + "px";
  //console.log('x, y', event.pageX, event.pageY);
}

class DataGrabber {
  constructor() {
    let divs = {};
    let inputWidth = 25;
    for (
      let x = -1 * inputWidth * 5;
      x < inputWidth * 5 + inputWidth;
      x += inputWidth
    ) {
      divs[x] = {};
      for (let y = -1 * inputWidth * 5; y < inputWidth * 5 + inputWidth; y += inputWidth) {
        let element = document.createElement("div");
        document.body.append(element);
        divs[x][y] = element;
        element.className = "box";
      }
    }
    this.box = document.getElementById("box");
    this.mouseX;
    this.mouseY;
    this.shiftdown;
    document.onmousemove = e => {
      Object.keys(divs).forEach(rowKey => {
        let row = divs[rowKey];
        Object.keys(row).forEach(divKey => {
          let div = row[divKey];
          if (e.shiftKey) {
            div.style["left"] = parseInt(rowKey) + e.pageX - 12 + "px";
            div.style["top"] = parseInt(divKey) + e.pageY - 12 + "px";
            div.style["opacity"] = 1;
          } else {
            div.style["opacity"] = 0;
          }
        });
      });
      handleMouseMove.apply(this);
      if (e.shiftKey) {
        this.shiftdown = true;
      } else {
        this.shiftdown = false;
      }
    };
  }
}

export default DataGrabber;
