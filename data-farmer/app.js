import Loader from "./classes/loader.js";
import DataGrabber from './classes/data-grabber.js';

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    let dataGrabber = new DataGrabber();
  }
};

let loader = new Loader(24, 25, data => {
  console.log("data", data);
  data.forEach(bitmaps => {

  });
}, [330, 3866]);
