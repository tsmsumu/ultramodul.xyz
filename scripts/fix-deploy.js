const { Client } = require('ssh2');

const conn = new Client();
const VpsConfig = {
  host: '208.122.28.26',
  port: 22,
  username: 'ubuntu',
  password: 'kAYqjET6umxar&#ZCGlse)0D9SN7(!'
};

const BASH_SCRIPT = `
echo "-> Fixing permissions for /var/www..."
sudo chown -R ubuntu:ubuntu /var/www

echo "-> Re-cloning repository..."
cd /var/www
rm -rf ultramodul
git clone https://github.com/tsmsumu/ultramodul.xyz.git ultramodul

cd ultramodul
echo "-> Installing dependencies..."
pnpm install

# Force Absolute Path for the whole monorepo (LETAKKAN DI LUAR FOLDER GIT AGAR TIDAK TERHAPUS SAAT RE-CLONE)
export DATABASE_URL="file:/var/www/production.db"

echo "-> Stopping old PM2 processes to release File Locks..."
pm2 delete ultramodul || true

echo "-> Migrating Database Schema without deleting data (Drizzle Push)..."

cd packages/db
pnpm exec drizzle-kit push
cd ../..

echo "-> Building Next.js Apps..."
cd apps/web
export NODE_ENV=production
pnpm run build

echo "-> Restarting PM2 process..."
pm2 start pnpm --name "ultramodul" --cwd /var/www/ultramodul/apps/web --env DATABASE_URL="file:/var/www/production.db" -- run start
pm2 save

echo "-> Restarting Nginx Server..."
sudo systemctl restart nginx
echo "-> VPS DEPLOYMENT FIXED!"
`;

conn.on('ready', () => {
  conn.exec(BASH_SCRIPT, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
    .on('data', data => process.stdout.write(data))
    .stderr.on('data', data => process.stderr.write(data.toString()));
  });
}).connect(VpsConfig);
