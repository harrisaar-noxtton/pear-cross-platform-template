// inject-pear-controls.js
const fs = require('fs');
const path = require('path');

function injectPearControls(htmlFilePath) {
  const fullPath = path.join(__dirname, '..', htmlFilePath);
  
  try {
    // Read the HTML file
    let htmlContent = fs.readFileSync(fullPath, 'utf8');
    
    // Define the titlebar HTML to prepend
    const titlebarHTML = `    <div id="titlebar">
      <pear-ctrl></pear-ctrl>
    </div>
`;
    
    // Define the styles to append
    const pearStyles = `      pear-ctrl[data-platform="darwin"] { 
        margin-top: 12px; margin-left: 10px;
      }

      #titlebar {
        -webkit-app-region: drag;
        z-index: 20000;
        padding:0;
        margin:0;
        width: 100%;
        position: fixed;
        left: 0;
        top: 0;
        background-color: #92929200;
      }
`;
    
    // Prepend titlebar to body
    const bodyOpenTagMatch = htmlContent.match(/<body[^>]*>/);
    if (bodyOpenTagMatch) {
      const bodyOpenTag = bodyOpenTagMatch[0];
      const bodyInsertIndex = htmlContent.indexOf(bodyOpenTag) + bodyOpenTag.length;
      htmlContent = htmlContent.slice(0, bodyInsertIndex) + '\n' + titlebarHTML + htmlContent.slice(bodyInsertIndex);
    } else {
      throw new Error('Could not find <body> tag in HTML file');
    }
    
    // Append styles to existing style tag
    const styleCloseTagIndex = htmlContent.indexOf('</style>');
    if (styleCloseTagIndex !== -1) {
      htmlContent = htmlContent.slice(0, styleCloseTagIndex) + '\n' + pearStyles + htmlContent.slice(styleCloseTagIndex);
    } else {
      throw new Error('Could not find </style> tag in HTML file');
    }
    
    // Write back to file
    fs.writeFileSync(fullPath, htmlContent, 'utf8');
    
    console.log(`Successfully injected pear controls into: ${htmlFilePath}`);
  } catch (error) {
    console.error('Error injecting pear controls:', error.message);
    process.exit(1);
  }
}

// Get file path from command line argument
const htmlFilePath = process.argv[2];

if (!htmlFilePath) {
  console.error('Please provide an HTML file path as an argument');
  process.exit(1);
}

injectPearControls(htmlFilePath);