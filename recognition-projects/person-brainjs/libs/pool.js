class Pool {
  constructor() {
    this.size = 2;
    this.step = 2;
  }
  run(input){
    //console.log('Pool input:', input) // demonstrates bugs currently (undefined input values)
    let max = 0;
    input.forEach((value, index)=>{
      if (value > max) {
        max = value;
      }
    });
    return max;
  }
}

export default Pool;
