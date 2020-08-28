const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocation } = require('./utils/messages');
const { getUser, getUserInRoom, addUser, removeUser } = require('./utils/users')

const app = express();

const server = http.createServer(app);
const io = socketio.listen(server)

const PORT = process.env.PORT || 4200;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

// let count = 0;

io.on('connection', (socket) => {
    

    socket.on('join', ({name, room}, callback) => {

      const { user, error } = addUser({
          id: socket.id,
          name,
          room
      })

      if (error) {
        return callback(error)
      }

      socket.join(user.room);

      console.log('io connected...');
      socket.emit('message', generateMessage(user.name + ' Welcome!'))
      socket.broadcast.to(room).emit('message', generateMessage(`${user.name} has joined`))


      io.to(user.room).emit('roomData', {
          room: user.room,
          users: getUserInRoom(user.room)
      })
      callback();
    })

    socket.on('onMessageSend', (message, callback) => {
      const user = getUser(socket.id)
      const filter = new Filter();
      if (filter.isProfane(message)) {
          return callback('Bad word used');
      }
      io.to(user.room).emit('message', generateMessage(user.name, message));
      callback();
    })

    socket.on('disconnect', () => {
        const user =  removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.name} left...`)); 
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }
    })

    socket.on('shareLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationShare', generateLocation(
            user.name,
            `https://www.google.com/maps?q=${location.lat},${location.lon}`)
        )
        callback()
    })
    // socket.emit('onUpdateCount', count);

    // socket.on('onCountIncrement', () => {
    //     count ++;
    //     // socket.emit('onUpdateCount', count); specific connection
    //     io.emit('onUpdateCount', count); // all conection
    // })
})

server.listen(PORT, () => {
    console.log('server started at ' + PORT)
})
