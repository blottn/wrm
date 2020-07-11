const path = require('path');
const http = require('http');
const ws = require('ws');

const port = 3000;

const roomsURl = '/room/';

let server = http.createServer((req, res) => {
    response.writeHead(404);
    response.end();
});

server.listen(port, () => {
    console.log(`wrm listening on ${port}`);
});

let wss = new ws.Server({
    server: server
});

let rooms = {};

function getRoomNumber(path) {
}

wss.on('connection', (socket, request) => {
    if (rooms[request.url] == undefined) {
        rooms[request.url] = [];
    }
    rooms[request.url].push(socket);

    socket.on('close', (code, reason) => {
        rooms[request.url] = rooms[request.url].filter(s => s != socket);
    });

    socket.on('message', (data) => {
        rooms[request.url].filter(s => s != socket)
            .map(client => client.send(data));
    });
});
