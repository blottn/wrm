const http = require('http');
const { WebSocketServer } = require('ws');

// Arg parse
let minimist_opts = {
    default: {
        debug: false,
        port: 3000
    },
};
let args = require('minimist')(process.argv.slice(2), minimist_opts);
let { debug, port } = args;

// Create server
const wss = new WebSocketServer({ port });

// Initiate plugboard
let wrmholes = {};

wss.on('connection', (socket, request, client) => {
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
        if (debug)
            console.log(`${request.socket.remoteAddress} in ${request.url} sent: %s`, data);

        wrmholes[request.url].filter(s => s != socket)
            .map(client => client.send(data));
    });
});

console.log(`Swizzling the spacetime continuum... (on port ${port})`);
console.log(`Debug mode: ${debug}`);
