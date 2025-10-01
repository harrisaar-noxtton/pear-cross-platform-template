// scripts/fix-electron-paths.js
const fs = require('fs');
const path = require('path');

const rootHtmlPath = path.join(__dirname, '../dist-web/index.html');

// Check if index.html exists
if (!fs.existsSync(rootHtmlPath)) {
    console.error('index.html not found at:', rootHtmlPath);
    process.exit(1);
}

// Read the existing HTML from root index.html
let html = fs.readFileSync(rootHtmlPath, 'utf8');

// Convert absolute paths to relative paths for Pear
html = html.replace(/href="\/_expo\//g, 'href="./_expo/');
html = html.replace(/src="\/_expo\//g, 'src="./_expo/');
html = html.replace(/href="\/assets\//g, 'href="./assets/');
html = html.replace(/src="\/assets\//g, 'src="./assets/');

// Add type="module" to all script tags that don't already have a type attribute
html = html.replace(/<script(?![^>]*type=)([^>]*)>/g, '<script type="module"$1>');

// For script tags that already have a type attribute, update them to module if they're not already
html = html.replace(/<script([^>]*)type=["'](?!module)([^"']*?)["']([^>]*)>/g, '<script$1type="module"$3>');

// Add Pear-specific initialization with module type
const pearInit = `
<script type="module">
    // Pear API detection and initialization
    if (typeof Pear !== 'undefined') {
        console.log('Pear environment detected');
        console.log('Pear config:', Pear.config);
    }
</script>
`;

// Only add Pear init if it's not already present
if (!html.includes('Pear API detection and initialization')) {
    html = html.replace('</head>', pearInit + '</head>');
}

// Write back to the same index.html file
fs.writeFileSync(rootHtmlPath, html);
console.log('Updated index.html with module type script tags and Pear compatibility');
console.log('File location:', rootHtmlPath);
