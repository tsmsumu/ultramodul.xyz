const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

function generateVersion() {
  try {
    // Get current date
    const now = new Date();
    
    // Format DDMMYYYY
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const dateStr = `${dd}${mm}${yyyy}`;
    
    // Format hhmmss
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hh}${mm}${ss}`;

    // Get latest git commit hash (short)
    let gitHash = 'UNKNOWN';
    let commitDate = now;
    
    const runGit = (cmd) => {
      try {
        return execSync(cmd).toString().trim();
      } catch (e) {
        return execSync(`"C:\\Program Files\\Git\\cmd\\git.exe" ${cmd.replace('git ', '')}`).toString().trim();
      }
    };

    try {
      gitHash = runGit('git rev-parse --short HEAD');
      const gitDateStr = runGit('git log -1 --format=%cd');
      commitDate = new Date(gitDateStr);
    } catch (e) {
      console.warn('Git is not available, using UNKNOWN for hash.');
    }

    // Calculate days ago
    const diffTime = Math.abs(now - commitDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    let daysStr = diffDays === 0 ? 'today' : `${diffDays} days ago`;

    // Construct the version string
    // Format: PUM Universal = (bisa diganti)
    // Version: DDMMYYY.hhmmss.code(VSCode OSS Version).Commit:UID.(x days ago)
    const platformName = "PUM Universal (Nexus Engine)";
    // Using 1.96 as a mockup for VSCode OSS Version or reading it if needed, hardcoding for now as requested.
    const vscodeVer = "1.96"; 
    const versionString = `${dateStr}.${timeStr}.${vscodeVer}(VSCode OSS).Commit:${gitHash}.(${daysStr})`;

    const output = {
      platform: platformName,
      version: versionString,
      raw: {
        date: dateStr,
        time: timeStr,
        hash: gitHash,
        daysAgo: diffDays
      }
    };

    // Write to apps/web/src/core/version.json
    const outputPath = path.join(__dirname, '../apps/web/src/core/version.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    
    console.log(`[Omni-Version Generator] Version injected: ${versionString}`);
  } catch (error) {
    console.error('[Omni-Version Generator] Failed to generate version:', error);
  }
}

generateVersion();
