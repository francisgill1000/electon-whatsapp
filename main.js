const { app, BrowserWindow, ipcMain } = require("electron");
const { Client, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const csvFilePath = path.join(__dirname, "message_log.csv");


let mainWindow;
let whatsappClient;

// Create Express server
const apiServer = express();
apiServer.use(bodyParser.json());

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

// Initialize WhatsApp Web client
const initializeWhatsAppClient = () => {
  whatsappClient = new Client({
    authStrategy: new LocalAuth(),
  });

  whatsappClient.on("qr", (qr) => {
    mainWindow.webContents.send("qr", qr); // Send QR code to the renderer process
  });

  whatsappClient.on("ready", () => {
    mainWindow.webContents.send("status", "Client is ready!");
    mainWindow.webContents.send("qr", null);
  });

  whatsappClient.on("authenticated", () => {
    mainWindow.webContents.send("status", "Authenticated successfully!");
    mainWindow.webContents.send("qr", null);
  });

  whatsappClient.on("auth_failure", (message) => {
    mainWindow.webContents.send("status", `Authentication failed: ${message}`);
  });

  whatsappClient.on("disconnected", (reason) => {
    mainWindow.webContents.send("status", `Disconnected: ${reason}`);
  });

  whatsappClient.initialize();
};

// Define the API endpoint
apiServer.post("/send-message", async (req, res) => {
  const { phone, message } = req.body;

  // Validate the input
  if (!phone || !message) {
    mainWindow.webContents.send(
      "messages",
      "Phone number and message are required."
    );

    return res
      .status(400)
      .json({ error: "Phone number and message are required." });
  }

  const formattedPhone = `${phone}@c.us`; // Format the phone number

  try {
    await whatsappClient.sendMessage(formattedPhone, message);
    mainWindow.webContents.send(
      "messages",
      `Message sent successfully to ${phone}`
    );

    const logEntry = `${new Date().toISOString()},${phone},${message},Success\n`;
    fs.appendFile(csvFilePath, logEntry, (err) => {
      if (err) {
        console.error("Error logging to CSV file:", err);
      }
    });

    res
      .status(200)
      .json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    mainWindow.webContents.send("messages", "Failed to send message:" + error);
    fs.appendFile(csvFilePath, logEntry, (err) => {
      if (err) {
        console.error("Error logging to CSV file:", err);
      }
    });
    res.status(500).json({ success: false, error: "Failed to send message." });
  }
});

// Start the Express server
const startApiServer = (port = 3000) => {
  apiServer.listen(port, () => {
    mainWindow.webContents.send(
      "messages",
      `API server is running on http://localhost:${port}`
    );
  });
};

// Electron app lifecycle
app.on("ready", () => {
  createWindow();
  initializeWhatsAppClient();
  startApiServer();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) createWindow();
});
