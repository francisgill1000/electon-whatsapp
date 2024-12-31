const { Client, LocalAuth } = require("whatsapp-web.js");

const qrcode = require("qrcode-terminal");

let whatsappClient;

const initializeWhatsAppClient = async (phone, message) => {
  whatsappClient = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      executablePath: "/snap/bin/chromium", // Replace with the actual path
    },
  });

  // Event listeners
  whatsappClient.on("qr", (qr) => {
    qrcode.generate(qr, { small: true }, (qrCode) => {
      if (qrCode) {
        console.log(qrCode);
      }
    });
  });

  whatsappClient.on("ready", () => {
    console.log("Client is ready!");

    // Now that the client is ready, send the message
    sendMessage(phone, message);
  });

  whatsappClient.on("authenticated", () => {
    console.log("Authenticated successfully!");
  });

  whatsappClient.on("auth_failure", (message) => {
    console.log("Authentication failed:", message);
  });

  whatsappClient.on("disconnected", (reason) => {
    console.log("Disconnected:", reason);
  });

  // Initialize client
  whatsappClient.initialize();
};

const sendMessage = async (phone, message) => {
  const formattedPhone = `${phone}@c.us`; // Format the phone number
  try {
    if (!whatsappClient) return;

    await whatsappClient.sendMessage(formattedPhone, message);
    console.log({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.log(error);
  }
};

// Initialize WhatsApp client
initializeWhatsAppClient(`923108559858`, `New Year message`);
