const { Client } = require('ssh2');
const conn = new Client();
conn.on('ready', () => {
  conn.exec('find /var/www -name "*.db"', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
    .on('data', data => console.log(data.toString()))
    .stderr.on('data', data => console.error(data.toString()));
  });
}).connect({host: '208.122.28.26', port: 22, username: 'ubuntu', password: 'kAYqjET6umxar&#ZCGlse)0D9SN7(!'});
