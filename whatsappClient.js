const { Client, LocalAuth } = require("whatsapp-web.js");


let whatsappClient;

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

module.exports = {
  initializeWhatsAppClient,
};
