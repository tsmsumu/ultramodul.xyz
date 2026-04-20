const { Client } = require('ssh2');

const conn = new Client();
const VpsConfig = {
  host: '208.122.28.26',
  port: 22,
  username: 'ubuntu',
  password: 'kAYqjET6umxar&#ZCGlse)0D9SN7(!'
};

const BASH_SCRIPT = `
echo "-> Menginstal Certbot via Snap..."
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot

echo "-> Menjalankan Certbot untuk memasang Layar SSL Gembok Hijau (HTTPS)..."
sudo certbot --nginx -d pum.ultramodul.xyz --non-interactive --agree-tos -m cto@ultramodul.xyz

echo "-> Merestart Nginx..."
sudo systemctl restart nginx
echo "-> SSL BERHASIL DIPASANG!"
`;

conn.on('ready', () => {
  conn.exec(BASH_SCRIPT, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
    .on('data', data => process.stdout.write(data))
    .stderr.on('data', data => process.stderr.write(data.toString()));
  });
}).connect(VpsConfig);
