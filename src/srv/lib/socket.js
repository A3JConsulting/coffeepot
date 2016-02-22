module.exports = (function(object){
  var ws = (require("ws").Server)({ port: 8080 });

  object.init = function(){
    var tester;

    ws.on("connection", function(pipe){
      var icon = 10;

      tester = setInterval(function(){
        console.log("Sending data.");

        pipe.send(JSON.stringify({"method":"status_change", "payload": "state_"+icon+".png"}));

        if(icon === 0){
          icon = 10;
        }else{
          icon--;
        }
      }, 1000);

      pipe.on("message", function(data){
        data = JSON.parse(data);

        try{
          object[data.method](data.payload);
        }catch(e){
          throw e;
        }
      });

      pipe.on("close", function(){
        clearInterval(tester);
      });
    });

  };
  return object;
}({}));
