const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);

const port = 3000;

const roomsURl = '/room/';

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => {console.log(`Wormholes open on ${port}`)});
