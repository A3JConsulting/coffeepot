module.exports = (function(object){
  var poll = require('./poll');
  //should be:
  //const poll = require(`${__dirname}/poll`);
  // poll.init();
  
  object.init = function(){
    poll();
  };

  return object;
}({}));
