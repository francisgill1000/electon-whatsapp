const { Client, LocalAuth } = require("whatsapp-web.js");

let whatsappClient;

const initializeWhatsAppClient = (mainWindow) => {
  whatsappClient = new Client({
    authStrategy: new LocalAuth(),
  });

  whatsappClient.on("qr", (qr) => {
    mainWindow.webContents.send("qr", qr);
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

  // whatsappClient.on("message", (message) => {
  //   const phoneWithoutAtCUs = message.from.replace("@c.us", ""); // Remove @c.us
  //   mainWindow.webContents.send("messages", `Message recieved from ${ phoneWithoutAtCUs} ${message.body}`);
  // });

  whatsappClient.initialize();
};

const getClient = () => {
  if (!whatsappClient) {
    throw new Error("WhatsApp Client is not initialized.");
  }
  return whatsappClient;
};

module.exports = {
  initializeWhatsAppClient,
  getClient,
};
