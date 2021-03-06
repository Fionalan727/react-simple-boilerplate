// server.js

const express = require('express');
const SocketServer = require('ws').Server;
const UUID = require("uuid");
const WebSocket = require('ws');
const randomColor = require('randomcolor');
// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });
wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  };
  

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  console.log('Client connected');
  wss.clients.forEach(function each(client) {
    let color_and_users = {loggedIn: wss.clients.size, color: randomColor()};
    wss.broadcast(JSON.stringify(color_and_users));
  });
  ws.on('message', (message) => {
    let cMessage = JSON.parse(message)
    switch (cMessage.type) {
      case 'postMessage':
      cMessage.type = 'incomingMessage';
      cMessage.id = UUID();
      
      cMessage.content = cMessage.content;
      cMessage.username = cMessage.username;
      console.log(cMessage);
      break;  
      case 'postNotification':
        cMessage.type = 'incomingNotification';
        cMessage.content = cMessage.content;
        cMessage.id = UUID();
        
        break;
    }
   
    wss.broadcast(JSON.stringify(cMessage));
    
    console.log("user " + cMessage.username + " said " + cMessage.content)
  })
  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => console.log('Client disconnected'));
    wss.broadcast(wss.clients.size);
});