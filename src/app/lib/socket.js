module.exports = (function(object){
  "use strict";

  var ipc = require("ipc");

  object.connect = function(){
    var websocket = new WebSocket("ws://localhost:8080");

    _parse(websocket);
  };
  object.status_change = function(arg){
    /*new Notification("Coffee consumed!", {
      title: "WebSocket",
      body: "Please observe status."
    });*/

    ipc.send("change-tray-icon", arg);
  };
  function _parse(ws){
    ws.onmessage = function(blob){
      var data = JSON.parse(blob.data);

      try{
        object[data.method](data.payload);
      }catch(e){
        throw e;
      }
    };
  }
  return object;
}({}));
