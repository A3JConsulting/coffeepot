module.exports = require('./build/Release/addon');

/*var fs = require('fs');

var scale = new hx711.HX711();

console.log(scale);
console.log(scale.getValues);

buffer = "";
timer = setInterval(function(){
	buffer += scale.getValues() + "\n";
}, 200);

setTimeout(function(){
	clearInterval(timer);
	fs.writeFileSync('output.csv', buffer);
}, 10000);*/
