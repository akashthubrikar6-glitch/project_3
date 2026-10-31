const fs = require('fs');
const path = require('path');

const historyDir = path.join(__dirname, '..', 'history');
const summaryFile = path.join(historyDir, 'monthly-summary.json');
const outputFile = path.join(historyDir, 'monthly-dashboard.html');

function readSummary() {
  if (!fs.existsSync(summaryFile)) {
    throw new Error(`Monthly summary not found: ${summaryFile}. Run "node scripts/regressionHistory.js --summary" first.`);
  }

  const data = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
  return Array.isArray(data) ? data : [];
}

function buildDashboard(summary) {
  const latestMonth = summary[summary.length - 1] || {
    month: 'No Data',
    totalCases: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    flaky: 0,
    total: 0,
    passRate: 0,
    tagBreakdown: {}
  };

  const regressionStats = latestMonth.tagBreakdown?.regression || {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    flaky: 0
  };
  const smokeStats = latestMonth.tagBreakdown?.smoke || {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    flaky: 0
  };

  const labels = summary.map((item) => item.month);
  const regressionSeries = summary.map((item) => item.tagBreakdown?.regression || {});
  const passSeries = regressionSeries.map((stats) => Number(stats.passed || 0));
  const failSeries = regressionSeries.map((stats) => Number(stats.failed || 0));
  const regressionTotal = Number(regressionStats.total || 0);
  const regressionPassRate = regressionTotal
    ? ((Number(regressionStats.passed || 0) / regressionTotal) * 100).toFixed(2)
    : '0.00';

  const pieLabels = ['Passed', 'Failed', 'Skipped', 'Flaky'];
  const pieData = [
    Number(regressionStats.passed || 0),
    Number(regressionStats.failed || 0),
    Number(regressionStats.skipped || 0),
    Number(regressionStats.flaky || 0),
  ];

  const tableRows = summary
    .slice()
    .reverse()
    .map((item) => {
      const stats = item.tagBreakdown?.regression || {};
      if (!Number(item.scenarioRuns || 0)) {
        return `
          <tr>
            <td>${item.month}</td>
            <td colspan="5">Not tracked - no scenario-level Cucumber results for this month</td>
          </tr>
        `;
      }

      const total = Number(stats.total || 0);
      const passRate = total ? ((Number(stats.passed || 0) / total) * 100).toFixed(2) : '0.00';
      return `
        <tr>
          <td>${item.month}</td>
          <td>${total}</td>
          <td>${Number(stats.passed || 0)}</td>
          <td>${Number(stats.failed || 0)}</td>
          <td>${Number(stats.skipped || 0)}</td>
          <td>${passRate}%</td>
        </tr>
      `;
    })
    .join('');

  const runHistoryRows = summary
    .flatMap((item) => item.runs || [])
    .filter((run) => run.tag === 'regression')
    .slice()
    .reverse()
    .map((run) => `
      <tr>
        <td>${new Date(run.date).toLocaleString()}</td>
        <td>${(run.features || []).join(', ') || 'N/A'}</td>
        <td>${run.total == null ? 'Not tracked' : run.total}</td>
        <td>${run.passed == null ? 'Not tracked' : run.passed}</td>
        <td>${run.failed == null ? 'Not tracked' : run.failed}</td>
        <td>${run.skipped == null ? 'Not tracked' : run.skipped}</td>
        <td>${run.passRate == null ? 'Not tracked' : `${run.passRate}%`}</td>
      </tr>
    `)
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Regression Monthly Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      margin: 0;
      background: #f3f6fb;
      font-family: Arial, sans-serif;
      color: #1f2937;
    }
    .container {
      max-width: 1200px;
      margin: 30px auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #1f3a8a, #2563eb);
      color: white;
      border-radius: 14px;
      padding: 22px 26px;
      margin-bottom: 22px;
      box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
    }
    h1 {
      margin: 0 0 10px 0;
      font-size: 30px;
    }
    .subtitle {
      margin: 0;
      color: #dbeafe;
      font-size: 14px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 22px;
    }
    .card {
      background: white;
      border-radius: 14px;
      padding: 20px;
      box-shadow: 0 8px 18px rgba(0,0,0,0.06);
    }
    .card h2 {
      margin-top: 0;
      margin-bottom: 12px;
      font-size: 18px;
    }
    .summary-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 10px 0;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .summary-box strong {
      font-size: 18px;
    }
    .badge {
      display: inline-block;
      background: #dbeafe;
      color: #1d4ed8;
      font-size: 12px;
      font-weight: bold;
      border-radius: 999px;
      padding: 6px 10px;
    }
    .chart-wrap {
      height: 300px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
      padding: 10px 12px;
    }
    th {
      background: #eef2ff;
    }
    @media (max-width: 700px) {
      .chart-wrap { height: 240px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">Monthly Regression Dashboard</div>
      <h1>Regression Summary</h1>
      <p class="subtitle">Latest month: ${latestMonth.month} | Regression scenario pass rate: ${regressionPassRate}%</p>
    </div>

    <div class="grid">
      <div class="card">
        <h2>Latest Month Snapshot</h2>
        <div class="summary-box"><span>Total Regression Scenarios</span><strong>${regressionTotal}</strong></div>
        <div class="summary-box"><span>Passed</span><strong>${regressionStats.passed || 0}</strong></div>
        <div class="summary-box"><span>Failed</span><strong>${regressionStats.failed || 0}</strong></div>
        <div class="summary-box"><span>Skipped</span><strong>${regressionStats.skipped || 0}</strong></div>

        <div style="margin-top:18px; padding-top:12px; border-top:1px solid #e5e7eb;">
          <h3 style="margin:0 0 10px 0; font-size:16px;">Smoke Scenario Counts</h3>
          <div class="summary-box"><span>Smoke Total</span><strong>${smokeStats.total || 0}</strong></div>
          <div class="summary-box"><span>Smoke Passed</span><strong>${smokeStats.passed || 0}</strong></div>
          <div class="summary-box"><span>Smoke Failed</span><strong>${smokeStats.failed || 0}</strong></div>
        </div>
      </div>

      <div class="card">
        <h2>Regression Scenario Results</h2>
        <div class="chart-wrap">
          <canvas id="pieChart"></canvas>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>Monthly Trend</h2>
      <div class="chart-wrap">
        <canvas id="trendChart"></canvas>
      </div>
    </div>

    <div class="card">
      <h2>Month-wise Table</h2>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Total Scenarios</th>
            <th>Passed</th>
            <th>Failed</th>
            <th>Skipped</th>
            <th>Pass Rate</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>

    <div class="card">
      <h2>Regression Scenarios by Run</h2>
      <table>
        <thead>
          <tr>
            <th>Run Date</th>
            <th>Feature(s)</th>
            <th>Total Scenarios</th>
            <th>Passed</th>
            <th>Failed</th>
            <th>Skipped</th>
            <th>Pass Rate</th>
          </tr>
        </thead>
        <tbody>
          ${runHistoryRows || '<tr><td colspan="7">No regression scenario history available.</td></tr>'}
        </tbody>
      </table>
    </div>
  </div>

  <script>
    const pieCtx = document.getElementById('pieChart');
    new Chart(pieCtx, {
      type: 'pie',
      data: {
        labels: ${JSON.stringify(pieLabels)},
        datasets: [{
          data: ${JSON.stringify(pieData)},
          backgroundColor: ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

    const trendCtx = document.getElementById('trendChart');
    new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ${JSON.stringify(labels)},
        datasets: [
          {
            label: 'Regression scenarios passed',
            data: ${JSON.stringify(passSeries)},
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            fill: false,
            tension: 0.3
          },
          {
            label: 'Regression scenarios failed',
            data: ${JSON.stringify(failSeries)},
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            fill: false,
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  </script>
</body>
</html>`;
}

if (require.main === module) {
  try {
    if (!fs.existsSync(historyDir)) {
      fs.mkdirSync(historyDir, { recursive: true });
    }

    const summary = readSummary();
    if (!summary.length) {
      console.log('No monthly data found. Run regression history first.');
      process.exit(1);
    }

    fs.writeFileSync(outputFile, buildDashboard(summary));
    console.log(`Monthly dashboard saved to ${outputFile}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = { buildDashboard };
