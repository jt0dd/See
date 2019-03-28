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
    this.box = document.getElementById("box");
    console.log("box", this.box);
    this.mouseX;
    this.mouseY;
    document.onmousemove = () => {
      handleMouseMove.apply(this);
    };
  }
}

export default DataGrabber;
