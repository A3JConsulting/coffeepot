module.exports = (function(object){
  "use strict";

  var ipc = require("ipc");

  object.connect = function(){
    var websocket = new WebSocket("ws://localhost:8080");

    _parse(websocket);
  };
  object.status_change = function(payload){
    new Notification("Coffee consumed!", {
      title: payload.message.title,
      body: payload.message.body,
      icon: ""
    });

    ipc.send("change-tray-icon", payload.icon);
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
