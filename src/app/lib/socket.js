module.exports = (function(object){
  "use strict";

  var ipc = require("ipc");

  object.connect = function(){
    var websocket = new WebSocket("ws://coffeepot.local:8080");

    _parse(websocket);
  };
  object.idle = function(payload){
    /*new Notification("Coffee consumed!", {
      title: payload.message.title,
      body: payload.message.body,
      icon: ""
    });*/
    ipc.send("change-tray-icon", "state_"+payload+".png");
  };
  object.filter_or_pot_removed = function(payload){
    new Notification("The coffeepot is removed!", {
      body: "Possible consumption."
    });

    ipc.send("change-tray-icon", "state_0.png");
  };
  function _parse(ws){
    ws.onmessage = function(blob){
      var data = JSON.parse(blob.data);
      //Debug
      console.log(data);

      try{
        object[data.state](data.cups);
      }catch(e){
        throw e;
      }
    };
  }
  return object;
}({}));
