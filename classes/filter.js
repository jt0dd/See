class Filter {
  constructor() {
    this.size = 3;
    this.step = 1;
    this.filter = [1, 0, 1,
                   0, 1, 0,
                   1, 0, 1];
  }
  run(input){
    let result = 0;
    input.forEach((value, index)=>{
      result += value * this.filter[index];
    });
    //console.log('Filtered input [' + input.join(',') + '] to ' + result);
    return result / 9;
  }
}

export default Filter;
