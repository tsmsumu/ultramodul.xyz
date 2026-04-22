const { Client } = require('ssh2');

const conn = new Client();

const VpsConfig = {
  host: '208.122.28.26',
  port: 22,
  username: 'ubuntu',
  password: 'kAYqjET6umxar&#ZCGlse)0D9SN7(!'
};

const BASH_SCRIPT = `
echo "=== SISTEM OPERASI ==="
lsb_release -d | cut -f2
echo "---"

echo "=== CPU (PROSESOR) ==="
echo "Model: $(cat /proc/cpuinfo | grep 'model name' | uniq | cut -d':' -f2 | sed -e 's/^[[:space:]]*//')"
echo "Cores: $(nproc)"
echo "---"

echo "=== MEMORI (RAM) ==="
free -h | grep "Mem:" | awk '{print "Total: " $2 "\\nTerpakai: " $3 "\\nTersedia: " $7}'
echo "---"

echo "=== PENYIMPANAN (DISK) ==="
df -h / | awk 'NR==2 {print "Total: " $2 "\\nTerpakai: " $3 " (" $5 ")\\nSisa: " $4}'
echo "======================"
`;

conn.on('ready', () => {
  conn.exec(BASH_SCRIPT, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
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
