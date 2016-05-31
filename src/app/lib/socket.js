module.exports = (function(object){
  "use strict";

  var ipc = require("ipc");

  object.connect = function(){
    var websocket = new WebSocket("ws://172.30.33.96:8080");
    _parse(websocket);
  };

  object.getIcon = function(cups){
    console.debug('getIcon', cups);
    return 'state_'+cups+'.png';
  };

  object.brewingWasInitiated = function(payload){
    console.debug('brewingWasInitiated', payload);
    new Notification("Brewing started.", {
      body: "Coffee's on it's way."
    });
    ipc.send("change-tray-icon", "state_0.png");
  };

  object.brewingWasCompleted = function(payload){
    console.debug('brewingWasCompleted', payload);
    new Notification("Brewing completed.", {
      body: "Coffee's ready."
    });
    ipc.send("change-tray-icon", object.getIcon(payload.cups));
  };

  object.potWasRemoved = function(payload){
    console.debug('potWasRemoved', payload);
    new Notification("The coffeepot removed.", {
      body: "Possible consumption."
    });
    ipc.send("change-tray-icon", "state_0.png");
  };

  object.potWasReplaced = function(payload){
    console.debug('potWasReplaced', payload);
    ipc.send('change-tray-icon', object.getIcon(payload.cups));
  }

  object.brewingWasHalted = function(payload){
    new Notification("Varning!", {
      body: 'Någon taaar kaffe trots pågående bryggning :/'
    });
    console.debug(payload);
  }

  object.brewingWasResumed = function(payload){
    console.debug(payload);
  }

  object.updateCups = function(cups){
    console.debug('Update cups to: ', cups);
    const numberOfCups = (cups < 0) ? 0 : (cups < 10) ? 10 : cups
    ipc.send('change-tray-icon', object.getIcon(numberOfCups));

  }

  function _parse(ws){
    ws.onmessage = function(blob){
      const payload = JSON.parse(blob.data);
      //Debug
      console.debug(payload);

      try{
        if (payload.event) {
          object[payload.event](payload)
        }else{
          object.updateCups(payload.cups)
          console.debug(payload);
        }
      }catch(e){
        console.error(e)
      }
    };
  }

  return object;
}({}));
