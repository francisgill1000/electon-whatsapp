const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  startServer: (port) => ipcRenderer.send("start-server", port),
  onServerStarted: (callback) =>
    ipcRenderer.on("server-started", (event, message) => callback(message)),
});
