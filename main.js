const { app, BrowserWindow, ipcMain, screen } = require("electron");
const { createExpressServer, stopExpressServer } = require("./server");

let mainWindow;

const createWindow = () => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: width, // Set to screen width
    height: height, // Set to screen height
    // fullscreen: true, // Enables full screen mode
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

  ipcMain.on("start-server", async (event, payload) => {
    try {
      await createExpressServer(payload, mainWindow);

      event.reply(
        "server-started",
        `Server running on http://${payload.ip}:${payload.port}`
      );
    } catch (error) {
      event.reply("server-started", `Failed to start server: ${error.message}`);
    }
  });

  ipcMain.on("stop-server", async (event) => {
    try {
      stopExpressServer();
    } catch (error) {
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
