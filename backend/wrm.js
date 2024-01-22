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

wss.on('connection', (socket, request) => {
    let hb = setInterval(() => {
      // TODO check 
      socket.ping();
    });
    console.log(`new connection on ${request.url}`);
    if (wrmholes[request.url] == undefined) {
        wrmholes[request.url] = [];
    }
    wrmholes[request.url].push(socket);

    socket.on('close', (code, reason) => {
        clearInterval(hb);
        console.log(`connection closed ${request.url}`);
        wrmholes[request.url] = wrmholes[request.url].filter(
            s => s != socket
        );
        console.log(`${request.url} has ${wrmholes[request.url].lenth}`);
    });

    socket.on('error', msg => {
      console.log(msg);
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
