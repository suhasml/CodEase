const fs = require('fs');
const path = require('path');

// Read deployment file
const deploymentPath = path.join(__dirname, '../deployments/MemeAmmRouter.json');
const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

// Create metadata in Hedera format
const metadata = {
  "compiler": "0.8.20",
  "language": "Solidity",
  "abi": deployment.abi
};

// Write metadata file
const metadataPath = path.join(__dirname, '../verification/metadata.json');
fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

console.log('✅ Created metadata.json in correct Hedera format');
console.log('📋 Format: compiler, language, abi (as per Hedera docs)');