# WhatsApp Message Sender (Using whatsapp-web.js)

This project allows you to send automated messages via WhatsApp using the `whatsapp-web.js` library. It uses a WhatsApp Web client to send messages to any WhatsApp user. The message is sent using a phone number provided in the script.

## Requirements

- Node.js (v14 or later)
- Chromium installed on your system (for Puppeteer to run)
  - You can install Chromium using:
    ```bash
    sudo snap install chromium
    ```

Prequisite
  Node: curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt install nodejs -y
  Chromium: sudo snap install chromium (linux only)

## Installation

1. **Clone the repository** (if applicable):

   ```bash
   git clone https://github.com/francisgill1000/electon-whatsapp/.git
   ```

2. **npm i**:

4. **Configure path in puppeteer linux only**
   puppeteer: {
     executablePath: "/path/to/your/chromium", // Replace with the actual path
   },
