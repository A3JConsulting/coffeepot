module.exports = (function(object){
  "use strict";

  const ipc = require("ipc");

  object.connect = function(){
    let websocket = new WebSocket("ws://172.30.33.96:8080");
    _parse(websocket);
  };

  object.brewingWasInitiated = function(payload){
    console.debug('brewingWasInitiated', payload);
    new Notification("Averto!", {
      body: "La kafo fermentan progreso."
    });
    updateCupsIcon(0);
  };

  object.brewingWasCompleted = function(payload){
    console.debug('brewingWasCompleted', payload);
    new Notification("Averto!", {
      body: "La kafo estas preta."
    });
    updateCupsIcon(payload.cups);
  };

  object.potWasRemoved = function(payload){
    console.debug('potWasRemoved', payload);
    new Notification("Averto!", {
      body: "La kafkruĉo estas forigita."
    });
    updateCupsIcon(0);
  };

  object.potWasReplaced = function(payload){
    console.debug('potWasReplaced', payload);
    updateCupsIcon(payload.cups);
  }

  object.brewingWasHalted = function(payload){
    new Notification("Averto!", {
      body: 'Iu preeeenas mian kafon dum fermentan!?'
    });
  }

  object.brewingWasResumed = function(payload){
    console.debug(payload);
  }

  function _parse(ws){
    ws.onmessage = function(blob){
      const payload = JSON.parse(blob.data);
      console.debug(payload);
      try {
        propagateState(payload)
      } catch(e) {
        console.error(e)
      }
    };
  }

  function propagateState(payload) {
    if (payload.event) {
      object[payload.event](payload)
    } elseif (payload.state === 'IDLE') {
      updateCupsIcon(payload.cups)
    }
  }

  function updateCupsIcon(cups) {
    const numberOfCups = (cups < 0) ? 0 : (cups > 10) ? 10 : cups // 0-10 cups only
    ipc.send('change-tray-icon', getIcon(numberOfCups));
  }

  function getIcon(cups){
    return 'state_'+cups+'.png';
  };

  return object;
}({}));
