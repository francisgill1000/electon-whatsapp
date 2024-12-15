const { ipcRenderer } = require("electron");
const main = document.getElementById("main");
const status = document.getElementById("status");

// Listen for status updates
ipcRenderer.on("status", (event, message) => {
  status.textContent = message;
});

// Listen for messages updates
ipcRenderer.on("messages", (event, message) => {
  let messages = document.getElementById("messages");

  if (message === null) {
    messages.remove();
  } else {
    messages.innerHTML += message + "<br>"; // Use innerHTML here for line breaks
  }
});

// Listen for QR code updates
ipcRenderer.on("qr", (event, qr) => {
  const qrcode = require("qrcode-terminal");

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
      }
    });
  }
});

const startButton = document.getElementById("startButton");

startButton.addEventListener("click", (event) => {
  event.preventDefault(); // Prevent the default form submission

  const status = document.getElementById("status");

  status.textContent = "Waiting for QR code...";

  let payload = {
    ip: document.getElementById("ip").value,
    port: document.getElementById("port").value,
  };

  if (ip && port) {
    try {
      ipcRenderer.send("start-server", payload); // Send the port to the main process
      status.textContent = `Attempting to start server on ip = ${payload.ip} port = ${payload.port}`;
    } catch (error) {
      event.reply("server-started", `Failed to start server: ${error.message}`);
    }
  } else {
    status.textContent = "Please enter a valid port number.";
  }
});

const stopButton = document.getElementById("stopButton");

stopButton.addEventListener("click", (event) => {
  event.preventDefault(); // Prevent the default form submission

  const status = document.getElementById("status");

  try {
    ipcRenderer.send("stop-server");
    status.textContent = `Server Stopped`;
  } catch (error) {
    status.textContent = `Failed to Server Stopped ` + error;
  }
});
