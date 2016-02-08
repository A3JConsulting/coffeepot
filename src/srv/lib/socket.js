module.exports = (function(object){
  var ws = (require("ws").Server)({ port: 8080 });

  object.init = function(){
    ws.on("connection", function(pipe){
      var icon = 0;

      var tester = setInterval(function(){
        console.log("Sending data.");

        pipe.send(JSON.stringify({"method":"status_change", "payload": "state_0"+icon+".png"}));

        if(icon>=7){
          icon = 0;
        }else{
          icon++;
        }
      }, 6000);

      pipe.on("message", function(data){
        data = JSON.parse(data);

        try{
          object[data.method](data.payload);
        }catch(e){
          throw e;
        }
      });
    });
  };
  return object;
}({}));
