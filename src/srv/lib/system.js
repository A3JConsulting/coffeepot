module.exports = (function(object){
  //const poll = require(`${__dirname}/poll`);
  const hx711 = require("hx711");
  const filter = require("./filter");

  object.init = function(){
    //buffer = "";

    timer = setInterval(function(){
      const values = hx711.getValues()
      const filteredValues = filter(values)
    	console.log(filteredValues);
    }, 200);

    /*
    setTimeout(function(){
    	clearInterval(timer);
    	console.log(buffer);
    }, 10000);*/

    //poll();
    //state.init();
  };

  /*function _read(file){
    const fs = require("fs");

    var derp = fs.readFileSync(`${__dirname}/../../${file}`, "utf8").split("\r\n");
    var herp = [];

    for(var i of derp){
      herp.push(i.split(",")[1]);
    }
    herp.pop();
    console.log(herp);
    console.log(Math.min(...herp));
    console.log(Math.max(...herp));
  }*/

  return object;
}({}));
