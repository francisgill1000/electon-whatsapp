const express = require("express");
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API Works" });
});
const port = 3000; // Example port

let client;

app.get("/qr", (req, res) => {
  client = new Client({
    authStrategy: new LocalAuth(),
  });

  client.on("qr", (qr) => {
    let qrBox = document.getElementById("qrBox");

    if (qr === null) {
      // Remove the QR box if it exists
      if (qrBox) {
        qrBox.remove();
      }
    } else {
      // Create QR box if it does not exist
      if (!qrBox) {
        qrBox = document.createElement("pre");
        qrBox.id = "qrBox";
        main.appendChild(qrBox);
      }

      qrcode.generate(qr, { small: true }, (qrCode) => {
        if (qrCode) {
          qrBox.textContent = qrCode; // Set QR code inside pre tag

          res.send(qrBox);
        }
      });
    }
  });

  client.on("ready", () => {
    console.log("Client is ready!");
    res.send("Client is ready!");
  });

  client.on("authenticated", () => {
    console.log("Authenticated successfully!");
    res.send("Authenticated successfully!");
  });

  client.on("auth_failure", (message) => {
    console.error(`Authentication failed: ${message}`);
    res.status(500).send(`Authentication failed: ${message}`);
  });

  client.on("disconnected", (reason) => {
    console.error(`Disconnected: ${reason}`);
    res.status(500).send(`Disconnected: ${reason}`);
  });

  client.initialize();
});

// Define the API endpoint
app.post("/send-message", async (req, res) => {
  const { phone, message } = req.body;

  // Validate the input
  if (!phone || !message) {
    res.send("Phone number and message are required.");

    return res
      .status(400)
      .json({ error: "Phone number and message are required." });
  }

  const formattedPhone = `${phone}@c.us`; // Format the phone number

  try {
    await client.sendMessage(formattedPhone, message);

    // const logEntry = `${new Date().toISOString()},${phone},${message},Success\n`;
    // fs.appendFile(csvFilePath, logEntry, (err) => {
    //   if (err) {
    //     console.error("Error logging to CSV file:", err);
    //   }
    // });

    res
      .status(200)
      .json({ success: true, message: "Message sent successfully!" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, error: "Failed to send message." });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
