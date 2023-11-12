
export const connect = (url,
  tolerance=5000,
  beatInterval=tolerance / 5.0) => {
  let ws = new WebSocket(url);
  let me = Math.random() * Number.MAX_SAFE_INTEGER;

  const pushMessage = (kind, content) => {
    ws.send(JSON.stringify({
      who: me,
      kind, content}));
  };

  let peers = {}; // Consider local storage persist
  const peerListeners = {join: [], leave: []};

  const destalify = () => { // Remove stale peers
    let now = Date.now();
    console.log('Checking peers:', peers);
    Object.keys(peers)
      .filter(who => (now - peers[who]) > tolerance)
      .filter(who => delete peers[who])
      .forEach(w =>
        peerListeners.leave.forEach(f => f(w))
      );
    console.log('Done with peers:', peers);
    setTimeout(destalify, tolerance);
    // TODO instead sleep for the amount remaining to the next interval
    // It could be the listeners took ages so we might need to immediately rerun
  }
  const beat = () => { // Heartbeat
    pushMessage('beat', {});
    // Beat heart 5 times per tolerance
    setTimeout(beat, tolerance / 5.0);
  }
  const startPeering = () => {
    destalify();
    beat();
  }

  const peerOn = (join, leave) => {
    peerListeners.join.push(join);
    peerListeners.leave.push(leave);
  }
  const peerOff = (f, g) => {
    let i = peerListeners.join.indexOf(f);
    peerListeners.join.splice(i, i + 1);

    let j = peerListeners.leave.indexOf(g);
    peerListeners.leave.splice(j, j + 1);
  }

  let close = () => {
    ws.close();
  }
  let send = (content) => {
    // wrap a message and push it
    pushMessage('msg', content);
  }

  let listeners = [];
  let on = (fn) => {
    listeners.push(fn);
  }
  let off = (fn) => {
    let i = listeners.indexOf(fn);
    listeners.splice(i, i + 1);
  }

  return new Promise((ok, perish) => {
    ws.addEventListener('message', async ({data}) => {
      let { kind, who, content } = JSON.parse(await data.text());
      console.log(`received message`);
      if (!(who in peers)) {
        peerListeners.join.forEach(f => f(who));
      }
      peers[who] = Date.now();
      if (kind === 'msg') {
        listeners.forEach(l => l(content, who));
      }
    });

    ws.addEventListener('open', () => {
      startPeering();
      console.log('opened connection');
      ok({send, close, on, off, 'peering': {
          'on': peerOn,
          'off': peerOff,
        }
      });
    });
    ws.addEventListener('error', () => {
      console.log('there has been an error :S');
      perish('inner connection has died');
    });
  });
}
