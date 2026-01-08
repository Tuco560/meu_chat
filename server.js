const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let usuarios = {}; // socket.id -> nome

io.on('connection', (socket) => {

    socket.on('login', (nome) => {
        socket.nome = nome;
        usuarios[socket.id] = nome;
        socket.join('grupo');
        io.emit('usuarios', usuarios);
    });

    socket.on('mensagem-grupo', (texto) => {
        if (!socket.nome) return;
        io.to('grupo').emit('mensagem-grupo', {
            nome: socket.nome,
            texto
        });
    });

    socket.on('mensagem-privada', ({ paraId, texto }) => {
        if (!socket.nome) return;

        io.to(paraId).emit('mensagem-privada', {
            deId: socket.id,
            nome: socket.nome,
            texto
        });

        socket.emit('mensagem-privada', {
            deId: socket.id,
            nome: socket.nome,
            texto
        });
    });

    socket.on('digitando', ({ paraId }) => {
        socket.to(paraId || 'grupo')
            .emit('digitando', socket.nome);
    });

    socket.on('disconnect', () => {
        delete usuarios[socket.id];
        io.emit('usuarios', usuarios);
    });
});

server.listen(8000, () => {
    console.log('Servidor OK → http://localhost:8000');
});
