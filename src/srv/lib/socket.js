module.exports = (function(object){
  var wss = (require("ws").Server)({ port: 8080 });

  let state = {};

  object.init = function(){

    wss.on("connection", function(socket){
      // var icon = 10
      // socket.send(JSON.stringify({
      //   method: "status_change",
      //   payload: {
      //     icon: "state_"+icon+".png",
      //     message: {
      //       title: 'Min titel',
      //       body: 'Lorem Ipsum'
      //     }
      //   }
      // }));
      socket.send(state);

      socket.on("message", function(data){
        data = JSON.parse(data);

        try{
          object[data.method](data.payload);
        }catch(e){
          throw e;
        }
      });

    });

  };

  object.broadcast = function(msg){
    wss.clients.forEach(function each(client) {
        client.send(msg);
    });
    state = msg;
  };

  object.sendToClient = function(id, msg){
    const client = wss.clients.find(function(client){
      return client.id === id;
    });
    state = msg;

    client.send(msg);
  }

  object.sendToAdmins = function(msg){
    wss.clients
      .filter(function(client){
        return client.isAdmin && client.isAdmin === true;
      })
      .forEach(function each(client) {
        client.send(msg);
    });
    state = msg;
  }

  return object;
}({}));
