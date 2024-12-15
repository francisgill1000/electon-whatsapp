const { ipcRenderer } = require("electron");
const main = document.getElementById("main");

let initialState = true;

main.innerHTML = `
  <h1>Start Whatsapp Server</h1>
    <form id="portForm">
    <label for="port">Port:</label>
    <input type="number" id="port" name="port" required />
    <button type="submit">Start Server</button>
  </form>
  <p id="status"></p>
`;

const status = document.getElementById("status");

// Listen for status updates
ipcRenderer.on("status", (event, message) => {
  status.textContent = message;
});

// Listen for messages updates
ipcRenderer.on("messages", (event, message) => {
  let messages = document.getElementById("messages");

  if (!messages) {
    messages = document.createElement("pre");
    messages.id = "messages";
    main.appendChild(messages);
  }

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

const portForm = document.getElementById("portForm");

portForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent the default form submission

  const status = document.getElementById("status");

  status.textContent = "Waiting for QR code...";

  const portInput = document.getElementById("port");
  const port = portInput.value;

  if (port) {
    ipcRenderer.send("start-server", port); // Send the port to the main process
    status.textContent = `Attempting to start server on port ${port}...`;
  } else {
    status.textContent = "Please enter a valid port number.";
  }
});
