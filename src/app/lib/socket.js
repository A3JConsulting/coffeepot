module.exports = (function(object){
  "use strict";

  var ipc = require("ipc");

  object.connect = function(){
    var websocket = new WebSocket("ws://172.30.33.77:8080");

    _parse(websocket);
  };
  object.IDLE = function(payload){
    /*new Notification("Coffee consumed!", {
      title: payload.message.title,
      body: payload.message.body,
      icon: ""
    });*/
    if(payload < 11){
      ipc.send("change-tray-icon", "state_"+payload+".png");
    }
  };
  object.BREWING = function(){

    /*new Notification("Brewing initiated!", {
      body: "Coffee's on it's way."
    });*/

    ipc.send("change-tray-icon", "state_0.png");
  };
  object.FILTER_OR_POT_REMOVED = function(payload){
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
