const express = require("express");
const path = require("path");
const fs = require("fs");
const { initializeWhatsAppClient, getClient } = require("./whatsappClient");

const csvFilePath = path.join(__dirname, "message_log.csv");

let server;

const createExpressServer = async (payload, mainWindow) => {
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
      const client = getClient();
      await client.sendMessage(formattedPhone, message);
      mainWindow.webContents.send(
        "messages",
        `Message sent successfully to ${phone} ${message}`
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

  // Start the server
  server = app.listen(payload.port, payload.ip, () => {
    console.log(`Server running on http://${payload.ip}:${payload.port}`);
  });
};

const stopExpressServer = () => {
  if (server) {
    server.close(() => {
      console.log(`Server Stop`);
    });
  }
};

module.exports = {
  createExpressServer,
  stopExpressServer,
};
