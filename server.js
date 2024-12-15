const express = require("express");
const path = require("path");
const fs = require("fs");
const { Client, LocalAuth } = require("whatsapp-web.js");

const csvFilePath = path.join(__dirname, "message_log.csv");

let server;
let whatsappClient;

// Initialize WhatsApp Web client
const initializeWhatsAppClient = (mainWindow) => {
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

const createExpressServer = (port, mainWindow) => {
  initializeWhatsAppClient(mainWindow);

  const app = express();
  app.use(express.json());

  app.get("/", (req, res) => {
    res.json({ message: "API Works" });
  });

  // Define the API endpoint
  app.post("/send-message", async (req, res) => {
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
      mainWindow.webContents.send(
        "messages",
        "Failed to send message:" + error
      );
      fs.appendFile(csvFilePath, logEntry, (err) => {
        if (err) {
          console.error("Error logging to CSV file:", err);
        }
      });
      res
        .status(500)
        .json({ success: false, error: "Failed to send message." });
    }
  });

  // Define API endpoints
  app.post("/submit", (req, res) => {
    console.log("Received input:", req.body);
    res.json({ message: "Server received the data", data: req.body });
  });

  // Start the server
  server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
};

const stopExpressServer = () => {
  if (server) {
    server.close(() => {
      console.log("Server stopped.");
    });
  }
};

module.exports = {
  createExpressServer,
  stopExpressServer,
};
