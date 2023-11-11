
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
  const destalify = () => { // Remove stale peers
    let now = Date.now();
    console.log('Checking peers:', peers);
    Object.keys(peers)
      .filter(who => (now - peers[who]) > tolerance)
      .map(who => {
        delete peers[who]
      });
    console.log('Done with peers:', peers);
    setTimeout(destalify, tolerance);
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
      peers[who] = Date.now();
      if (kind === 'msg') {
        listeners.forEach(l => l(content, who));
      }
    });
    ws.addEventListener('open', () => {
      startPeering();
      console.log('opened connection');
      ok({send, close, on, off});
    });
    ws.addEventListener('error', () => {
      console.log('there has been an error :S');
      perish('inner connection has died');
    });
  });
}
