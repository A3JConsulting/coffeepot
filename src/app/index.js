var app = require("app");
var ipc = require("ipc");
var menu = require("menu");
var path = require("path");

app.dock.hide();

app.on("ready", function(){
  var main = new (require("browser-window"))({ show: false});
      main.loadURL("file://" + __dirname + "/index.html");
      main.webContents.openDevTools({ detach: true });

  var tray = new (require("tray"))(path.join(__dirname, "/lib/assets/state_0.png"));

  tray.setContextMenu(menu.buildFromTemplate([
    {
      label: "Quit",
      accelerator: "Command+Q",
      click: function() { app.quit(); }
    }
  ]));

  ipc.on("change-tray-icon", function(event, arg){
    tray.setImage(path.join(__dirname, "/lib/assets/"+arg));
  });
});
