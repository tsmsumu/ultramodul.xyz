const { Client } = require('ssh2');

const conn = new Client();
const VpsConfig = {
  host: '208.122.28.26',
  port: 22,
  username: 'ubuntu',
  password: 'kAYqjET6umxar&#ZCGlse)0D9SN7(!'
};

const BASH_SCRIPT = `
echo "-> Fixing PM2 path issue..."
cd /var/www/ultramodul/apps/web

echo "-> Restarting PM2 process..."
pm2 delete ultramodul || true
pm2 start pnpm --name "ultramodul" --cwd /var/www/ultramodul/apps/web -- run start
pm2 save

sudo systemctl restart nginx
echo "-> PM2 FIXED!"
`;

conn.on('ready', () => {
  conn.exec(BASH_SCRIPT, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
    .on('data', data => process.stdout.write(data))
    .stderr.on('data', data => process.stderr.write(data.toString()));
  });
}).connect(VpsConfig);
