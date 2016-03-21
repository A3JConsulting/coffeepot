module.exports = (function(object){
  const poll = require(`${__dirname}/poll`);

  object.init = function(){
    poll();

    _read("brygger");
    _read("kanna_borta");

    //state.init();
  };

  function _read(file){
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
  }

  return object;
}({}));
