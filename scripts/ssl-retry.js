const { Client } = require('ssh2');

const conn = new Client();
const VpsConfig = {
  host: '208.122.28.26',
  port: 22,
  username: 'ubuntu',
  password: 'kAYqjET6umxar&#ZCGlse)0D9SN7(!'
};

const BASH_SCRIPT = `
echo "-> Menunggu proses instalasi Snap selesai..."
sudo snap watch --last=install-snap || true
sudo snap install certbot --classic || true
sudo ln -sf /snap/bin/certbot /usr/bin/certbot

echo "-> Menjalankan Certbot (HTTPS)..."
sudo certbot --nginx -d pum.ultramodul.xyz --non-interactive --agree-tos -m admin@ultramodul.xyz

echo "-> Merestart Nginx..."
sudo systemctl restart nginx
echo "-> RETRY SSL BERHASIL!"
`;

conn.on('ready', () => {
  conn.exec(BASH_SCRIPT, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
    .on('data', data => process.stdout.write(data))
    .stderr.on('data', data => process.stderr.write(data.toString()));
  });
}).connect(VpsConfig);
