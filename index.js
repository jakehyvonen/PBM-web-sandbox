const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const net = require('net');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket server
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  // Create a TCP client to connect to your TCP server
  const tcpClient = new net.Socket();

  tcpClient.connect(YourTCPServerPort, YourTCPServerHost, () => {
    console.log('Connected to TCP server');
  });

  // Handle WebSocket messages and relay to TCP server
  ws.on('message', (message) => {
    console.log('Received WebSocket message:', message);

    // Relay the WebSocket message to the TCP server
    tcpClient.write(message);
  });

  // Handle TCP server responses and relay to WebSocket client
  tcpClient.on('data', (data) => {
    console.log('Received data from TCP server:', data.toString());

    // Relay the TCP server response to the WebSocket client
    ws.send(data.toString());
  });

  // Handle WebSocket and TCP client disconnects
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    tcpClient.end();
  });

  tcpClient.on('close', () => {
    console.log('TCP client disconnected');
  });
});

// Start the Express server
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
