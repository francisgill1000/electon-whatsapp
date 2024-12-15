const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { createExpressServer, stopExpressServer } = require("./server");

let mainWindow;

// Function to create the Electron window
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false, // Enable IPC communication
    },
  });

  mainWindow.loadFile("index.html");
  mainWindow.on("closed", () => (mainWindow = null));
};



// Electron app lifecycle
app.on("ready", () => {
  createWindow();

  ipcMain.on("start-server", (event, port) => {
    try {
      createExpressServer(port,mainWindow);

      event.reply(
        "server-started",
        `Server running on http://localhost:${port}`
      );
    } catch (error) {
      console.error("Error starting server:", error);
      event.reply("server-started", `Failed to start server: ${error.message}`);
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
