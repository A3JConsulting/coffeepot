module.exports = (function(object){
  var ws = (require("ws").Server)({ port: 8080 });

  object.init = function(){
    ws.on("connection", function(pipe){
      var icon = "foo1.png";

      var tester = setInterval(function(){
        console.log("Sending data.");

        pipe.send(JSON.stringify({"method":"status_change", "payload": icon}));

        if(icon === "foo1.png"){
          icon = "foo2.png";
        }else{
          icon = "foo1.png";
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
