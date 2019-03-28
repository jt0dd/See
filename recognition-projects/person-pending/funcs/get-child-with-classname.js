function getChildWithClassname(parent, classname) {
  if (!parent) {
    return false;
  }
  for (var i = 0; i < parent.childNodes.length; i++) {
    if (parent.childNodes[i].className == classname) {
      return parent.childNodes[i];
      break;
    }
  }
}

export default getChildWithClassname;
