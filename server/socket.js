// socket.js
const socketIo = require('socket.io');
let io;

module.exports = {
  init: (server) => {
    io = socketIo(server, {
      // Your socket.io configuration here.
      cors: {
        origin: "*",
      },
      // More configuration options...
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
