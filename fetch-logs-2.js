const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec("tail -n 50 /home/ubuntu/.pm2/logs/ultramodul-wa-out.log", (err, stream) => {
    if (err) throw err;
    let dataStr = '';
    stream.on('close', () => {
      console.log(dataStr);
      conn.end();
    })
    .on('data', data => dataStr += data.toString())
    .stderr.on('data', data => console.error(data.toString()));
  });
}).connect({
  host: '208.122.28.26',
  port: 22,
  username: 'ubuntu',
  password: 'kAYqjET6umxar&#ZCGlse)0D9SN7(!'
});
