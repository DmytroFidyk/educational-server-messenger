const express = require('express');
const http = require('http');

const app = express();

app.set('port', process.env.PORT || 7000);

const server = http.createServer(app);

const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    }
});

app.get('/', (req, res) => {
    res.send('Сервер працює');
});

let messageCounter = 0;
let participants = [];

io.on('connection', socket => {
    const id = socket.id;

    socket.on('user write', text => {
        io.emit('write', text);
    });

    socket.on('stop write', text => {
        io.emit('stop', text);
    });

    socket.on('new participant', newParticipant => {
        participants.push(newParticipant);
        io.emit('participants', participants);
    });

    socket.on('new message', message => {
        message.id = messageCounter += 1;
        io.emit('incoming', message);
    });

    socket.on('disconnect', () => {
        participants = participants.filter(item => {
            return item.userId !== id;
        });

        io.emit('participants', participants);
    });
});

server.listen(app.get('port'), () => {
    console.log(`Server started`);
});