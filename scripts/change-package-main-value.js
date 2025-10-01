// change-package-main-value.js
const fs = require('fs');
const path = require('path');

function changePacketsMainValue(newValue) {
  const packagePath = path.join(__dirname, '..', 'package.json');
  
  try {
    // Read current package.json
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Update main value
    packageData.main = newValue;
    
    // Write back to file
    fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
    
    console.log(`Successfully changed main to: ${newValue}`);
  } catch (error) {
    console.error('Error updating package.json:', error.message);
  }
}

// Get value from command line argument
const newMainValue = process.argv[2];

if (!newMainValue) {
  console.error('Please provide a new main value as an argument');
  process.exit(1);
}

changePacketsMainValue(newMainValue);
