const { Client } = require('ssh2');
const conn = new Client();
const VpsConfig = { host: '208.122.28.26', port: 22, username: 'ubuntu', password: 'kAYqjET6umxar&#ZCGlse)0D9SN7(!' };

conn.on('ready', () => {
  conn.exec('pm2 logs ultramodul --lines 50 --nostream', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
    .on('data', data => process.stdout.write(data))
    .stderr.on('data', data => process.stderr.write(data.toString()));
  });
}).connect(VpsConfig);
