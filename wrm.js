const http = require('http');
const ws = require('ws');

const port = 3000;

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

let wrmholes = {};

wss.on('connection', (socket, request) => {
    if (wrmholes[request.url] == undefined) {
        wrmholes[request.url] = [];
    }
    wrmholes[request.url].push(socket);

    socket.on('close', (code, reason) => {
        wrmholes[request.url] = wrmholes[request.url].filter(
            s => s != socket
        );
    });

    socket.on('message', (data) => {
        wrmholes[request.url].filter(s => s != socket)
            .map(client => client.send(data));
    });
});
