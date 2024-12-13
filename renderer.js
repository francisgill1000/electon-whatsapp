const { ipcRenderer } = require("electron");
const main = document.getElementById("main");

const heading = document.createElement("h1");
const pre = document.createElement("pre");
const status = document.createElement("p");
const messages = document.createElement("pre");

status.id = "status";
status.textContent = "Waiting for QR code..."; // Initial text
heading.textContent = "WhatsApp Web Electron";

// Clear any previous content in the main div
main.innerHTML = "";
main.appendChild(heading);
main.appendChild(status);
main.appendChild(messages);

// Listen for status updates
ipcRenderer.on("status", (event, message) => {
  status.textContent = message;
});

ipcRenderer.on("messages", (event, message) => {
  messages.innerHTML += message + "<br>"; // Use innerHTML here for line breaks
});

// Listen for QR code updates
ipcRenderer.on("qr", (event, qr) => {
  const qrcode = require("qrcode-terminal");

  // Generate QR code and append it to the pre tag
  if (qr === null) {
    // Clear the QR code when it's set to null
    pre.textContent = ""; // Clear the content of the pre tag
  } else {
    // Generate QR code and append it to the pre tag
    qrcode.generate(qr, { small: true }, (qrCode) => {
      if (qrCode) {
        pre.textContent = qrCode; // Set QR code inside pre tag
        main.appendChild(pre);
      }
    });
  }
});
