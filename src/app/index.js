var app = require("app");
var ipc = require("ipc");
var path = require("path");

app.on("ready", function(){
  var main = new (require("browser-window"))({ show: false});
      main.loadURL("file://" + __dirname + "/index.html");
      //main.webContents.openDevTools({ detach: true });

  var tray = new (require("tray"))(path.join(__dirname, "/lib/assets/foo1.png"));

  ipc.on("change-tray-icon", function(event, arg){
    tray.setImage(path.join(__dirname, "/lib/assets/"+arg));
  });
});
