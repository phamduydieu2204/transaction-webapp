/**
 * Deploy Helper - Tự động cập nhật version khi deploy
 * Run: node scripts/deploy-helper.js
 */

const fs = require('fs');
const path = require('path');

// Read current version
const versionFile = path.join(__dirname, '../version.json');
const versionData = JSON.parse(fs.readFileSync(versionFile, 'utf8'));

// Increment version
const parts = versionData.version.split('.');
parts[2] = (parseInt(parts[2]) + 1).toString();
const newVersion = parts.join('.');

// Update version.json
versionData.version = newVersion;
versionData.lastUpdate = new Date().toISOString().split('T')[0];
fs.writeFileSync(versionFile, JSON.stringify(versionData, null, 2));

// Update versionManager.js
const versionManagerFile = path.join(__dirname, 'versionManager.js');
let versionManagerContent = fs.readFileSync(versionManagerFile, 'utf8');
versionManagerContent = versionManagerContent.replace(
  /return '[\d.]+'/,
  `return '${newVersion}'`
);
fs.writeFileSync(versionManagerFile, versionManagerContent);

// Update service worker cache name
const swFile = path.join(__dirname, '../sw.js');
let swContent = fs.readFileSync(swFile, 'utf8');
swContent = swContent.replace(
  /const CACHE_NAME = 'transaction-app-v[\d]+'/,
  `const CACHE_NAME = 'transaction-app-v${Date.now()}'`
);
swContent = swContent.replace(
  /const DYNAMIC_CACHE = 'transaction-app-dynamic-v[\d]+'/,
  `const DYNAMIC_CACHE = 'transaction-app-dynamic-v${Date.now()}'`
);
fs.writeFileSync(swFile, swContent);
