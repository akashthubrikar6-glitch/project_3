#!/usr/bin/env node

/**
 * Open Dashboard
 * Generates and opens the test dashboard in your default browser
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('📊 Preparing dashboard...\n');

// Generate fresh dashboard
try {
  require('./createDashboard.js');
} catch (error) {
  console.error('Error generating dashboard:', error.message);
  process.exit(1);
}

// Open in browser
const dashboardPath = path.resolve('dashboard.html');
const command = process.platform === 'win32' 
  ? `start ${dashboardPath}`
  : process.platform === 'darwin'
  ? `open ${dashboardPath}`
  : `xdg-open ${dashboardPath}`;

console.log('\n🌐 Opening dashboard in browser...\n');

exec(command, (error) => {
  if (error) {
    console.log(`📄 Dashboard file: ${dashboardPath}`);
    console.log('Manual open: Right-click → Open in Browser');
  }
});
