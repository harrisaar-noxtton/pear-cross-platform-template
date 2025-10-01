// scripts/fix-electron-paths.js
const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../dist-web/index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Convert absolute paths to relative paths
html = html.replace(/href="\/_expo\//g, 'href="./_expo/');
html = html.replace(/src="\/_expo\//g, 'src="./_expo/');

// Fix any remaining absolute asset paths
html = html.replace(/href="\/assets\//g, 'href="./assets/');
html = html.replace(/src="\/assets\//g, 'src="./assets/');

// Add base tag for relative path resolution
if (!html.includes('<base')) {
  html = html.replace('<head>', '<head>\n  <base href="./">');
}

fs.writeFileSync(htmlPath, html);
console.log('Fixed asset paths for Electron');
