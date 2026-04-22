const { Client } = require('ssh2');

const conn = new Client();

const VpsConfig = {
  host: '208.122.28.26',
  port: 22,
  username: 'ubuntu',
  password: 'kAYqjET6umxar&#ZCGlse)0D9SN7(!'
};

const CODE_SERVER_PASSWORD = 'Ultramodul2025!';

const BASH_SCRIPT = `
echo "=========================================="
echo "    VPS PROVISIONING: CODE-SERVER START"
echo "=========================================="

echo "-> Installing code-server..."
curl -fsSL https://code-server.dev/install.sh | sh

echo "-> Configuring code-server..."
sudo -u ubuntu mkdir -p /home/ubuntu/.config/code-server
sudo -u ubuntu bash -c 'cat << EOF > /home/ubuntu/.config/code-server/config.yaml
bind-addr: 127.0.0.1:8080
auth: password
password: \${CODE_SERVER_PASSWORD}
cert: false
EOF'

echo "-> Starting code-server as a service..."
sudo systemctl enable --now code-server@ubuntu
sudo systemctl restart code-server@ubuntu

echo "-> Configuring Nginx for ide.ultramodul.xyz..."
sudo bash -c 'cat << "EOF" > /etc/nginx/sites-available/ide.ultramodul.xyz
server {
    listen 80;
    server_name ide.ultramodul.xyz;

    location / {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $host;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Accept-Encoding gzip;
    }
}
EOF'

sudo ln -sf /etc/nginx/sites-available/ide.ultramodul.xyz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

echo "-> Attempting to install SSL via Certbot (Will fail if DNS is not yet pointed to VPS IP)..."
sudo certbot --nginx -d ide.ultramodul.xyz --non-interactive --agree-tos -m cto@ultramodul.xyz || echo "Certbot failed, likely because DNS A Record for ide.ultramodul.xyz is not yet pointing to 208.122.28.26."

echo "-> Setting up Git environment..."
sudo -u ubuntu git config --global user.name "Ultramodul Dev"
sudo -u ubuntu git config --global user.email "cto@ultramodul.xyz"

# Install GitHub CLI if not exists
if ! command -v gh &> /dev/null
then
    echo "-> Installing GitHub CLI..."
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
    sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
    echo "deb [arch=\\$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
    sudo apt update
    sudo apt install gh -y
fi

echo "=========================================="
echo "  CODE-SERVER PROVISIONING COMPLETED!"
echo "  URL: http://ide.ultramodul.xyz"
echo "  Password: \${CODE_SERVER_PASSWORD}"
echo "=========================================="
`;

// Replace placeholder in script with actual password variable
const finalScript = BASH_SCRIPT.replace(/\$\{CODE_SERVER_PASSWORD\}/g, CODE_SERVER_PASSWORD);

console.log('Connecting to VPS: ' + VpsConfig.host);

conn.on('ready', () => {
  console.log('Client :: ready. Executing bash payload...');
  conn.exec(finalScript, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream :: close :: code: ' + code);
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
