const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal'); // Import qrcode-terminal package

// Use LocalAuth for session persistence
const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true }); // Display QR code in terminal
});

client.on('ready', () => {
    console.log('Client is ready!');
    client.sendMessage('923132044626@c.us', 'Hello, this is a test message!'); // Append '@c.us' to the phone number
});

client.on('authenticated', () => {
    console.log('Authenticated successfully!');
});

client.on('auth_failure', (message) => {
    console.error('Authentication failed!', message);
});

client.on('disconnected', (reason) => {
    console.log('Client was logged out', reason);
});

client.initialize();
