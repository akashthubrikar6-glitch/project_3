#!/usr/bin/env node

/**
 * Master Test Report Script
 * Runs Cypress tests, generates Excel reports, and tracks trends
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const isWindows = process.platform === 'win32';

function executeCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n📌 ${description}...`);
    console.log(`   Running: ${command}\n`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
      } else {
        console.log(stdout);
        resolve();
      }
    });
  });
}

async function runFullPipeline() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        CYPRESS TEST AUTOMATION & REPORTING PIPELINE        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  try {
    // Step 1: Run Cypress Tests
    await executeCommand(
      'npx cypress run',
      'Step 1: Running Cypress Tests'
    );
    
    // Step 2: Generate Excel Report
    await executeCommand(
      'node reportToExcel.js',
      'Step 2: Generating Excel Report'
    );
    
    // Step 3: Generate Trend Analysis
    await executeCommand(
      'node trendAnalysis.js',
      'Step 3: Analyzing Test Trends & Generating Dashboard'
    );
    
    // Step 4: Summary
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║                   ✅ PIPELINE COMPLETED                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('📊 Generated Reports:');
    console.log('   ✓ TestResults.xlsx - Current run results');
    console.log('   ✓ TestTrends.xlsx - Historical trends & analysis');
    console.log('   ✓ dashboard.html - Interactive visualization');
    console.log('   ✓ testTrendHistory.json - Complete history log\n');
    
    console.log('📁 Report Locations:');
    console.log('   cypress/reports/ - Mochawesome HTML & JSON reports');
    console.log('   ./ - Excel trend reports & dashboard\n');
    
    console.log('🌐 View Dashboard:');
    console.log('   node openDashboard.js\n');
    
  } catch (error) {
    console.error('\n❌ Pipeline failed:', error.message);
    process.exit(1);
  }
}

runFullPipeline();
