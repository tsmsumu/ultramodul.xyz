const { Client } = require('ssh2');

const conn = new Client();

const VpsConfig = {
  host: '208.122.28.26',
  port: 22,
  username: 'ubuntu',
  password: 'kAYqjET6umxar&#ZCGlse)0D9SN7(!'
};

const BASH_SCRIPT = `
echo "=========================================="
echo "    VPS PROVISIONING ULTRAMODUL START"
echo "=========================================="

sudo DEBIAN_FRONTEND=noninteractive apt-get update
# Just install essentials, skip upgrade for speed if possible
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y curl git nginx build-essential sqlite3 libsqlite3-dev

echo "-> Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs

echo "-> Installing PNPM & PM2..."
sudo npm install -g pnpm pm2

echo "-> Setting up www directory..."
sudo mkdir -p /var/www/ultramodul
sudo chown -R ubuntu:ubuntu /var/www/ultramodul
cd /var/www

echo "-> Cloning/Updating Repository..."
if [ -d "ultramodul/.git" ]; then
  cd ultramodul
  git reset --hard HEAD
  git pull origin main
else
  sudo rm -rf ultramodul
  git clone https://github.com/tsmsumu/ultramodul.xyz.git ultramodul
  cd ultramodul
fi

echo "-> Installing Dependencies & Building Next.js..."
pnpm install
cd packages/db
NODE_ENV=production npx tsx migrate.ts
cd ../../apps/web

export NODE_ENV=production
# Next build required
pnpm run build

echo "-> Stopping existing PM2 process..."
pm2 delete ultramodul || true

echo "-> Starting Next.js via PM2..."
pm2 start pnpm --name "ultramodul" -- run start
pm2 save

echo "-> Nginx is already configured and SSL is managed by Certbot. Skipping rewrite..."
sudo nginx -t
sudo systemctl restart nginx

echo "=========================================="
echo "  VPS PROVISIONING SUCCESSFUL!"
echo "  App is running on http://208.122.28.26 and http://pum.ultramodul.xyz"
echo "=========================================="
`;

console.log('Connecting to VPS: ' + VpsConfig.host);

conn.on('ready', () => {
  console.log('Client :: ready. Executing bash payload...');
  conn.exec(BASH_SCRIPT, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data.toString('utf8'));
    });
  });
}).on('error', (err) => {
  console.log('Connection error:', err);
}).connect(VpsConfig);
