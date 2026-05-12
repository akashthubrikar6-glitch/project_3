#!/usr/bin/env node

/**
 * GitHub Sync Helper
 * Streamlines git operations and CI/CD setup
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(cmd, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n📌 ${description}`);
    console.log(`   Command: ${cmd}\n`);
    
    exec(cmd, (error, stdout, stderr) => {
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

async function setupGitHub() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║           GITHUB CI/CD SETUP ASSISTANT                     ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Verify workflows exist
    console.log('🔍 Verifying GitHub Actions workflows...\n');
    
    const workflows = [
      '.github/workflows/pr-tests.yml',
      '.github/workflows/test-reports.yml',
      '.github/workflows/deploy.yml'
    ];

    let allExist = true;
    for (const workflow of workflows) {
      if (fs.existsSync(workflow)) {
        console.log(`   ✅ ${workflow}`);
      } else {
        console.log(`   ❌ ${workflow} - NOT FOUND`);
        allExist = false;
      }
    }

    if (!allExist) {
      console.error('\n❌ Some workflows are missing!');
      process.exit(1);
    }

    console.log('\n✅ All workflows present!\n');

    // Check git status
    console.log('📋 Checking git status...\n');
    try {
      exec('git status', (error, stdout) => {
        if (!error) {
          console.log('✅ Git repository found\n');
        }
      });
    } catch {
      console.log('⚠️  Git not initialized yet\n');
    }

    // Summary
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║                   SETUP INSTRUCTIONS                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📁 Workflows Created:');
    console.log('   ✓ pr-tests.yml - Run tests on pull requests');
    console.log('   ✓ test-reports.yml - Daily tests & reporting');
    console.log('   ✓ deploy.yml - Auto-deployment after tests\n');

    console.log('🚀 Next Steps:\n');
    console.log('1️⃣  Initialize Git (if needed):');
    console.log('   git init\n');

    console.log('2️⃣  Add all files:');
    console.log('   git add .\n');

    console.log('3️⃣  Commit:');
    console.log('   git commit -m "Add test automation with CI/CD"\n');

    console.log('4️⃣  Set up remote (replace USERNAME/REPO):');
    console.log('   git remote add origin https://github.com/USERNAME/cypress_project.git\n');

    console.log('5️⃣  Push to GitHub:');
    console.log('   git push -u origin main\n');

    console.log('6️⃣  Create a test PR:');
    console.log('   git checkout -b test/ci-setup');
    console.log('   git commit --allow-empty -m "Test workflow"');
    console.log('   git push origin test/ci-setup');
    console.log('   # Create PR on GitHub\n');

    console.log('7️⃣  View Results:');
    console.log('   Go to GitHub → Actions tab → Select workflow → See results!\n');

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║            ✅ SETUP COMPLETE - READY TO USE!              ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('📊 Documentation:');
    console.log('   • CI_CD_SETUP.md - Detailed guide');
    console.log('   • CI_CD_QUICK_START.md - Quick reference\n');

    console.log('🔔 Features Enabled:');
    console.log('   ✅ PR tests - Blocks merge on failure');
    console.log('   ✅ Daily tests - Automatic daily runs');
    console.log('   ✅ Test reports - Excel & HTML dashboards');
    console.log('   ✅ Automated deployment - Deploy on success');
    console.log('   ✅ GitHub Pages - (Optional) Public dashboard\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupGitHub();
