import { connect } from './client.js';


let { send, close, on, off, peering} = await connect('ws://localhost:3000');
console.log(send, close);
on((m, who) => {
  console.log(`${who} says ${m}`);
});

peering.on((who) => {
    console.log(`${who} has connected`);
  }, (who) => {
    console.log(`${who} has left`);
  }
);

let greet = () => {
  console.log('saying hi');
  send('hi');
  setTimeout(greet, 1000 + Math.random() * 1500);
}

setTimeout(greet, 1000 + Math.random() * 1500);
