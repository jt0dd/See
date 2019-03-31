var zip = new JSZip();
var allContent = "";
var previousText = "";
var iterator = 0;
var counterText = "";

document.onreadystatechange = () => {
  if (document.readyState === "complete") {
    let button = document.getElementById("export-logs");
    button.onclick = () => {
      zip.file("_global.txt", allContent);
      zip.generateAsync({type: "blob"}).then(function(blob) {
        saveAs(blob, "logs.zip");
      });
    };
  }
};

class Logger {
  constructor(name = "Logger") {
    this.name = "[" + name + "]";
    this.content = "";
  }
  log() {
    let args = new Array(...arguments);
    console.log.apply(null, [this.name, ...arguments]);
    let text = "";
    args.forEach(arg => {
      if (typeof arg != "string" && typeof arg != "number") {
        if (Array.isArray(arg)) {
          arg = arg.join(', ');
        }
        if (typeof arg.toString == "function") {
          let string = arg.toString();
          if (string.length > 1000) {
            string = string.substring(0, 1000) + " ... ";
          }
          text += " " + string + " ";
        } else {
          text += " [Object] ";
        }
      } else {
        text += arg;
      }
      text += " ";
    });
    if (previousText === text) {
      iterator++;
      let trimLength = counterText.length;
      counterText = " (" + iterator + ") \r\n";
      if (iterator > 1) {
        allContent = allContent.substring(0, allContent.length - counterText.length);
        this.content = this.content.substring(0, this.content.length - counterText.length);
      }
      allContent += counterText;
      this.content += counterText;
    } else {
      previousText = text;
      iterator = 0;
      let line = text + "\r\n";
      allContent += line;
      this.content += line;
    }

    zip.file(this.name + ".txt", this.content);
  }
}

export default Logger;
