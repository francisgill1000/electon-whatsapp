const { app, BrowserWindow, ipcMain } = require('electron');
const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');

let mainWindow;
let whatsappClient;

// Function to create the Electron window
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // Enable IPC communication
        },
    });

    mainWindow.loadFile('index.html');
    mainWindow.on('closed', () => (mainWindow = null));
};

// Initialize WhatsApp Web client
const initializeWhatsAppClient = () => {
    whatsappClient = new Client({
        authStrategy: new LocalAuth(),
    });

    whatsappClient.on('qr', (qr) => {
        mainWindow.webContents.send('qr', qr); // Send QR code to the renderer process
    });

    whatsappClient.on('ready', () => {
        console.log('Client is ready!');
        mainWindow.webContents.send('status', 'Client is ready!');
    });

    whatsappClient.on('authenticated', () => {
        console.log('Authenticated successfully!');
        mainWindow.webContents.send('status', 'Authenticated successfully!');
    });

    whatsappClient.on('auth_failure', (message) => {
        console.error('Authentication failed!', message);
        mainWindow.webContents.send('status', `Authentication failed: ${message}`);
    });

    whatsappClient.on('disconnected', (reason) => {
        console.log('Client was logged out:', reason);
        mainWindow.webContents.send('status', `Disconnected: ${reason}`);
    });

    whatsappClient.initialize();
};

// Listen for send-message events from the renderer process
ipcMain.on('send-message', (event, { phone, message }) => {
    if (!phone || !message) {
        event.reply('status', 'Phone number and message are required.');
        return;
    }

    const formattedPhone = `${phone}@c.us`; // Format the phone number
    whatsappClient
        .sendMessage(formattedPhone, message)
        .then(() => {
            event.reply('status', `Message sent successfully! to ${phone}`);
        })
        .catch((error) => {
            console.error('Failed to send message:', error);
            event.reply('status', `Failed to send message: ${error}`);
        });
});

// Electron app lifecycle
app.on('ready', () => {
    createWindow();
    initializeWhatsAppClient();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) createWindow();
});
