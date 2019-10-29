const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocation } = require('./utils/messages');
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('./utils/users');

// Express & Socket Init
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const pubDir = path.join(__dirname, '../public');
app.use(express.static(pubDir));

// WebSocket Connection
io.on('connection', socket => {
  // Listen for join
  socket.on('join', (options, callback) => {
    const { error, user } = addUser({ id: socket.id, ...options });

    if (error) {
      return callback(error);
    }

    // Create room
    socket.join(user.room);

    // Emit welcome message
    socket.emit(
      'message',
      generateMessage(`Welcome to ${user.room}, ${user.username}!`)
    );
    socket.broadcast
      .to(user.room)
      .emit('message', generateMessage(`${user.username} has joined!`));

    // Get room details
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    callback();
  });

  // Listen for messages
  socket.on('sendMessage', (message, status) => {
    const user = getUser(socket.id);
    // Bad words
    const filter = new Filter();
    // Emit message
    io.to(user.room).emit(
      'message',
      generateMessage(filter.clean(message), user.username)
    );
    // Callback
    status('✓');
  });

  // Listen for location
  socket.on('sendLocation', (coords, status) => {
    const user = getUser(socket.id);
    // Emit location
    io.to(user.room).emit(
      'locationMessage',
      generateLocation(
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`,
        user.username
      )
    );
    // Callback
    status('✓');
  });

  // Disconnection
  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        generateMessage(`${user.username} has left!`)
      );
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

// Server Listen Port
const port = process.env.PORT;
server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
