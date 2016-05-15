(function(){
  require("./lib/socket").init();
  var debug = process.argv.slice(2) == 'debug' ? true : false;
  require("./lib/poll")(debug);
}({}));
