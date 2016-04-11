var hx711 = require('./build/Release/addon');
var fs = require('fs');

var scale = new hx711.HX711();

console.log(scale);
console.log(scale.getValue);

buffer = "";
timer = setInterval(function(){
	buffer += scale.getValue() + ",";
}, 200);

setTimeout(function(){
	clearInterval(timer);
	fs.writeFileSync('output.csv', buffer);
}, 10000);
