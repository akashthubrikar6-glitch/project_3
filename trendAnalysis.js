const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const HISTORY_FILE = 'testTrendHistory.json';
const REPORT_FILE = 'TestTrends.xlsx';

// Read current test results
function getCurrentResults() {
  const reportPath = 'cypress/reports/mochawesome.json';
  
  // Check if report file exists
  if (!fs.existsSync(reportPath)) {
    console.warn(`⚠️  No test report found at ${reportPath}`);
    return {
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('en-IN'),
      time: new Date().toLocaleTimeString('en-IN'),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      flakyTests: 0,
      passPercentage: '0.00',
      failPercentage: '0.00',
      totalDuration: '0s'
    };
  }
  
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  let flakyTests = 0;
  let totalDuration = 0;
  
  report.results.forEach(spec => {
    spec.suites.forEach(suite => {
      suite.tests.forEach(test => {
        totalTests++;
        totalDuration += test.duration || 0;
        
        if (test.state === 'passed') {
          passedTests++;
        } else if (test.state === 'failed') {
          failedTests++;
        }
        
        // Detect flaky
        if (test.attempts && test.attempts.length > 1) {
          const first = test.attempts[0].state;
          const last = test.attempts[test.attempts.length - 1].state;
          if (first === 'failed' && last === 'passed') {
            flakyTests++;
          }
        }
      });
    });
  });
  
  return {
    timestamp: new Date().toISOString(),
    date: new Date().toLocaleDateString('en-IN'),
    time: new Date().toLocaleTimeString('en-IN'),
    totalTests,
    passedTests,
    failedTests,
    flakyTests,
    passPercentage: ((passedTests / totalTests) * 100).toFixed(2),
    failPercentage: ((failedTests / totalTests) * 100).toFixed(2),
    totalDuration: (totalDuration / 1000).toFixed(2) + 's'
  };
}

// Load or create history
function loadHistory() {
  if (fs.existsSync(HISTORY_FILE)) {
    return JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  }
  return [];
}

// Save history
function saveHistory(history) {
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
  console.log(`✓ History saved (${history.length} runs recorded)`);
}

// Generate trend analysis
function generateTrends(history) {
  if (history.length === 0) return null;
  
  const latest = history[history.length - 1];
  const previous = history.length > 1 ? history[history.length - 2] : null;
  
  return {
    latest,
    previous,
    improvement: previous ? {
      passRate: (parseFloat(latest.passPercentage) - parseFloat(previous.passPercentage)).toFixed(2) + '%',
      failReduction: (parseFloat(previous.failPercentage) - parseFloat(latest.failPercentage)).toFixed(2) + '%',
      durationChange: (parseFloat(latest.totalDuration) - parseFloat(previous.totalDuration))
    } : null,
    stats: {
      avgPassRate: (history.reduce((sum, r) => sum + parseFloat(r.passPercentage), 0) / history.length).toFixed(2),
      avgFailRate: (history.reduce((sum, r) => sum + parseFloat(r.failPercentage), 0) / history.length).toFixed(2),
      totalRuns: history.length,
      bestPassRate: Math.max(...history.map(r => parseFloat(r.passPercentage))).toFixed(2),
      worstPassRate: Math.min(...history.map(r => parseFloat(r.passPercentage))).toFixed(2)
    }
  };
}

// Create Excel report with trends
function createTrendReport(history) {
  let wb = xlsx.utils.book_new();
  
  // Summary sheet
  const summaryData = [
    ['Test Trend Analysis Report'],
    ['Generated', new Date().toLocaleString('en-IN')],
    [],
    ['Total Runs', history.length],
    ['Latest Run Date', history[history.length - 1].date],
    ['Average Pass Rate', (history.reduce((sum, r) => sum + parseFloat(r.passPercentage), 0) / history.length).toFixed(2) + '%'],
    ['Best Pass Rate', Math.max(...history.map(r => parseFloat(r.passPercentage))).toFixed(2) + '%'],
    ['Worst Pass Rate', Math.min(...history.map(r => parseFloat(r.passPercentage))).toFixed(2) + '%']
  ];
  const summarySummary = xlsx.utils.aoa_to_sheet(summaryData);
  xlsx.utils.book_append_sheet(wb, summarySummary, 'Summary');
  
  // History sheet
  const historyData = [
    ['Date', 'Time', 'Total Tests', 'Passed', 'Failed', 'Flaky', 'Pass %', 'Fail %', 'Duration']
  ];
  
  history.forEach(run => {
    historyData.push([
      run.date,
      run.time,
      run.totalTests,
      run.passedTests,
      run.failedTests,
      run.flakyTests,
      run.passPercentage + '%',
      run.failPercentage + '%',
      run.totalDuration
    ]);
  });
  
  const historySheet = xlsx.utils.aoa_to_sheet(historyData);
  // Set column widths
  historySheet['!cols'] = [
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 10 },
    { wch: 12 }
  ];
  xlsx.utils.book_append_sheet(wb, historySheet, 'History');
  
  // Trends sheet
  const trends = generateTrends(history);
  const trendsData = [
    ['Trend Analysis'],
    [],
    ['Latest Results'],
    ['Total Tests', trends.latest.totalTests],
    ['Passed', trends.latest.passedTests],
    ['Failed', trends.latest.failedTests],
    ['Flaky', trends.latest.flakyTests],
    ['Pass Rate', trends.latest.passPercentage + '%'],
    []
  ];
  
  if (trends.improvement) {
    trendsData.push(['Comparison with Previous Run']);
    trendsData.push(['Pass Rate Change', trends.improvement.passRate]);
    trendsData.push(['Fail Rate Reduction', trends.improvement.failReduction]);
  }
  
  trendsData.push(
    [],
    ['Overall Statistics'],
    ['Average Pass Rate', trends.stats.avgPassRate + '%'],
    ['Average Fail Rate', trends.stats.avgFailRate + '%'],
    ['Best Pass Rate', trends.stats.bestPassRate + '%'],
    ['Worst Pass Rate', trends.stats.worstPassRate + '%']
  );
  
  const trendsSheet = xlsx.utils.aoa_to_sheet(trendsData);
  xlsx.utils.book_append_sheet(wb, trendsSheet, 'Trends');
  
  xlsx.writeFile(wb, REPORT_FILE);
  console.log(`✓ Trend report generated: ${REPORT_FILE}`);
}

// Main execution
function main() {
  try {
    console.log('📊 Analyzing test trends...\n');
    
    const currentResults = getCurrentResults();
    console.log('Current Run Results:');
    console.log(`  Total Tests: ${currentResults.totalTests}`);
    console.log(`  Passed: ${currentResults.passedTests} (${currentResults.passPercentage}%)`);
    console.log(`  Failed: ${currentResults.failedTests} (${currentResults.failPercentage}%)`);
    console.log(`  Flaky: ${currentResults.flakyTests}`);
    console.log(`  Duration: ${currentResults.totalDuration}\n`);
    
    let history = loadHistory();
    history.push(currentResults);
    saveHistory(history);
    
    const trends = generateTrends(history);
    
    if (trends && trends.improvement) {
      console.log('📈 Comparison with Previous Run:');
      console.log(`  Pass Rate: ${trends.improvement.passRate}`);
      console.log(`  Fail Rate Reduction: ${trends.improvement.failReduction}\n`);
    }
    
    console.log('📊 Overall Statistics:');
    console.log(`  Average Pass Rate: ${trends?.stats?.avgPassRate || '0'}%`);
    console.log(`  Total Runs Tracked: ${trends?.stats?.totalRuns || '0'}`);
    console.log(`  Best Pass Rate: ${trends?.stats?.bestPassRate || '0'}%`);
    console.log(`  Worst Pass Rate: ${trends?.stats?.worstPassRate || '0'}%\n`);
    
    createTrendReport(history);
    
    // Generate dashboard
    const { execSync } = require('child_process');
    try {
      execSync('node createDashboard.js', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  Dashboard generation skipped');
    }
  } catch (error) {
    console.error('❌ Error in trend analysis:', error.message);
    console.log('Continuing despite error...');
  }
}

main();
