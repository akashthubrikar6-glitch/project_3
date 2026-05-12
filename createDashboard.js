const fs = require('fs');
const path = require('path');

const HISTORY_FILE = 'testTrendHistory.json';

function generateDashboard() {
  // Read history
  let history = [];
  if (fs.existsSync(HISTORY_FILE)) {
    history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  }

  if (history.length === 0) {
    console.log('❌ No history data found. Run tests first!');
    process.exit(1);
  }

  // Prepare data for charts
  const dates = history.map(r => r.date);
  const passRates = history.map(r => parseFloat(r.passPercentage));
  const failRates = history.map(r => parseFloat(r.failPercentage));
  const totalTests = history.map(r => r.totalTests);
  const failedTests = history.map(r => r.failedTests);
  const flakyTests = history.map(r => r.flakyTests);
  const durations = history.map(r => parseFloat(r.totalDuration));

  const latest = history[history.length - 1];
  const previous = history.length > 1 ? history[history.length - 2] : null;

  let passRateChange = 'N/A';
  if (previous) {
    const change = parseFloat(latest.passPercentage) - parseFloat(previous.passPercentage);
    passRateChange = `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Trend Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    header {
      background: white;
      padding: 30px;
      border-radius: 10px;
      margin-bottom: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 2.5em;
    }

    .header-meta {
      color: #666;
      font-size: 0.95em;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .metric-card {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .metric-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
    }

    .metric-label {
      color: #666;
      font-size: 0.85em;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .metric-value {
      font-size: 2.5em;
      font-weight: bold;
      color: #333;
    }

    .metric-change {
      font-size: 0.9em;
      margin-top: 8px;
      padding: 5px 10px;
      border-radius: 5px;
      display: inline-block;
    }

    .positive {
      background: #d4edda;
      color: #155724;
    }

    .negative {
      background: #f8d7da;
      color: #721c24;
    }

    .neutral {
      background: #e2e3e5;
      color: #383d41;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .chart-container {
      background: white;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .chart-title {
      font-size: 1.3em;
      font-weight: bold;
      color: #333;
      margin-bottom: 20px;
    }

    canvas {
      max-height: 400px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    footer {
      background: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
      color: #666;
      font-size: 0.9em;
    }

    .status-badge {
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      margin-top: 10px;
    }

    .status-success {
      background: #d4edda;
      color: #155724;
    }

    .status-warning {
      background: #fff3cd;
      color: #856404;
    }

    .status-danger {
      background: #f8d7da;
      color: #721c24;
    }

    .stats-table {
      width: 100%;
      margin-top: 20px;
      border-collapse: collapse;
    }

    .stats-table th {
      background: #f8f9fa;
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #333;
      border-bottom: 2px solid #dee2e6;
    }

    .stats-table td {
      padding: 12px;
      border-bottom: 1px solid #dee2e6;
    }

    .stats-table tr:hover {
      background: #f8f9fa;
    }

    .refresh-info {
      margin-top: 20px;
      padding: 15px;
      background: #e7f3ff;
      border-left: 4px solid #2196F3;
      border-radius: 5px;
      color: #0c5aa0;
      font-size: 0.9em;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📊 Test Trend Dashboard</h1>
      <div class="header-meta">
        <strong>Last Updated:</strong> ${latest.date} at ${latest.time}<br>
        <strong>Total Runs:</strong> ${history.length} | 
        <strong>Date Range:</strong> ${dates[0]} to ${dates[dates.length - 1]}
      </div>
    </header>

    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-label">Latest Pass Rate</div>
        <div class="metric-value">${latest.passPercentage}%</div>
        <div class="metric-change ${passRateChange.includes('+') ? 'positive' : passRateChange.includes('-') && passRateChange !== 'N/A' ? 'negative' : 'neutral'}">
          vs Previous: ${passRateChange}
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Latest Fail Rate</div>
        <div class="metric-value">${latest.failPercentage}%</div>
        <div class="metric-change neutral">
          Failed: ${latest.failedTests}/${latest.totalTests}
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Flaky Tests</div>
        <div class="metric-value">${latest.flakyTests}</div>
        <div class="metric-change ${latest.flakyTests > 0 ? 'negative' : 'positive'}">
          ${latest.flakyTests > 0 ? '⚠️ Detected' : '✅ None'}
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Avg Pass Rate</div>
        <div class="metric-value">${(passRates.reduce((a, b) => a + b, 0) / passRates.length).toFixed(2)}%</div>
        <div class="metric-change neutral">
          Across ${history.length} runs
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Best Performance</div>
        <div class="metric-value">${Math.max(...passRates).toFixed(2)}%</div>
        <div class="metric-change positive">
          Best pass rate
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Execution Time</div>
        <div class="metric-value">${latest.totalDuration}</div>
        <div class="metric-change neutral">
          Latest run
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-container">
        <div class="chart-title">Pass Rate Trend</div>
        <canvas id="passRateChart"></canvas>
      </div>

      <div class="chart-container">
        <div class="chart-title">Test Results Distribution</div>
        <canvas id="testDistributionChart"></canvas>
      </div>

      <div class="chart-container full-width">
        <div class="chart-title">Test Results Over Time</div>
        <canvas id="testTimelineChart"></canvas>
      </div>

      <div class="chart-container full-width">
        <div class="chart-title">Pass/Fail Rate Comparison</div>
        <canvas id="passFailChart"></canvas>
      </div>

      <div class="chart-container full-width">
        <div class="chart-title">Failed & Flaky Tests Trend</div>
        <canvas id="failFlakyChart"></canvas>
      </div>
    </div>

    <div class="chart-container">
      <div class="chart-title">📋 Complete History</div>
      <table class="stats-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Total</th>
            <th>Passed</th>
            <th>Failed</th>
            <th>Flaky</th>
            <th>Pass %</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${history.reverse().map(r => '<tr>' +
            '<td>' + r.date + '</td>' +
            '<td>' + r.time + '</td>' +
            '<td>' + r.totalTests + '</td>' +
            '<td style="color: #28a745; font-weight: bold;">' + r.passedTests + '</td>' +
            '<td style="color: #dc3545; font-weight: bold;">' + r.failedTests + '</td>' +
            '<td style="color: #ffc107; font-weight: bold;">' + r.flakyTests + '</td>' +
            '<td><strong>' + r.passPercentage + '%</strong></td>' +
            '<td>' + r.totalDuration + '</td>' +
          '</tr>').join('')}
        </tbody>
      </table>
      <div class="refresh-info">
        💡 <strong>Auto-generated dashboard</strong> - Refresh or regenerate after running \`node trendAnalysis.js\`
      </div>
    </div>

    <footer>
      <p>Generated on ${new Date().toLocaleString('en-IN')} | Test Automation Dashboard v1.0</p>
    </footer>
  </div>

  <script>
    const chartConfig = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          labels: {
            font: { size: 12 },
            padding: 15
          }
        }
      }
    };

    // Pass Rate Trend
    new Chart(document.getElementById('passRateChart'), {
      type: 'line',
      data: {
        labels: ${JSON.stringify(dates)},
        datasets: [{
          label: 'Pass Rate %',
          data: ${JSON.stringify(passRates)},
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: '#28a745',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        ...chartConfig,
        scales: {
          y: { min: 0, max: 100 }
        }
      }
    });

    // Test Distribution (Latest)
    new Chart(document.getElementById('testDistributionChart'), {
      type: 'doughnut',
      data: {
        labels: ['Passed', 'Failed', 'Flaky'],
        datasets: [{
          data: [${latest.passedTests}, ${latest.failedTests}, ${latest.flakyTests}],
          backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: chartConfig
    });

    // Test Count Timeline
    new Chart(document.getElementById('testTimelineChart'), {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(dates)},
        datasets: [
          {
            label: 'Passed',
            data: ${JSON.stringify(history.map(r => r.passedTests))},
            backgroundColor: '#28a745'
          },
          {
            label: 'Failed',
            data: ${JSON.stringify(history.map(r => r.failedTests))},
            backgroundColor: '#dc3545'
          },
          {
            label: 'Flaky',
            data: ${JSON.stringify(history.map(r => r.flakyTests))},
            backgroundColor: '#ffc107'
          }
        ]
      },
      options: {
        ...chartConfig,
        scales: {
          x: { stacked: true },
          y: { stacked: true }
        }
      }
    });

    // Pass/Fail Rate
    new Chart(document.getElementById('passFailChart'), {
      type: 'line',
      data: {
        labels: ${JSON.stringify(dates)},
        datasets: [
          {
            label: 'Pass Rate',
            data: ${JSON.stringify(passRates)},
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 4
          },
          {
            label: 'Fail Rate',
            data: ${JSON.stringify(failRates)},
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 4
          }
        ]
      },
      options: {
        ...chartConfig,
        scales: {
          y: { min: 0, max: 100 }
        }
      }
    });

    // Failed & Flaky Trend
    new Chart(document.getElementById('failFlakyChart'), {
      type: 'area',
      data: {
        labels: ${JSON.stringify(dates)},
        datasets: [
          {
            label: 'Failed Tests',
            data: ${JSON.stringify(history.map(r => r.failedTests))},
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.2)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Flaky Tests',
            data: ${JSON.stringify(history.map(r => r.flakyTests))},
            borderColor: '#ffc107',
            backgroundColor: 'rgba(255, 193, 7, 0.2)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: chartConfig
    });
  </script>
</body>
</html>`;

  fs.writeFileSync('dashboard.html', html);
  console.log('✅ Dashboard generated: dashboard.html');
  console.log('🌐 Open in browser: dashboard.html');
}

generateDashboard();
