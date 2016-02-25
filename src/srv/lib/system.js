module.exports = (function(object){
  var poll = require('./poll');
  
  object.init = function(){
    poll();

  };

  return object;
}({}));
