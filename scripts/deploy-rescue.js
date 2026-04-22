const { Client } = require('ssh2');

const conn = new Client();
const VpsConfig = {
  host: '208.122.28.26',
  port: 22,
  username: 'ubuntu',
  password: 'kAYqjET6umxar&#ZCGlse)0D9SN7(!'
};

const BASH_SCRIPT = `
set -e
echo "Starting rescue deploy..."
cd /var/www/ultramodul
pnpm install
export DATABASE_URL="file:/var/www/production.db"
cd packages/db
yes "" | pnpm exec drizzle-kit push
cd ../..
cd apps/web
export NODE_ENV=production
pnpm run build
pm2 delete ultramodul || true
pm2 start pnpm --name "ultramodul" --cwd /var/www/ultramodul/apps/web --env DATABASE_URL="file:/var/www/production.db" -- run start
sudo systemctl restart nginx
echo "Rescue deploy complete."
`;

conn.on('ready', () => {
  conn.exec(BASH_SCRIPT, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => {
      conn.end();
      console.log('Done.');
    })
    .on('data', data => process.stdout.write(data))
    .stderr.on('data', data => process.stderr.write(data.toString()));
  });
}).connect(VpsConfig);
