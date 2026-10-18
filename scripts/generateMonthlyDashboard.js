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
    passed: 0,
    failed: 0,
    skipped: 0,
    total: 0,
    passRate: 0
  };

  const labels = summary.map((item) => item.month);
  const passSeries = summary.map((item) => Number(item.passed || 0));
  const failSeries = summary.map((item) => Number(item.failed || 0));

  const pieLabels = ['Passed', 'Failed', 'Skipped'];
  const pieData = [
    Number(latestMonth.passed || 0),
    Number(latestMonth.failed || 0),
    Number(latestMonth.skipped || 0),
  ];

  const tableRows = summary
    .slice()
    .reverse()
    .map((item) => `
      <tr>
        <td>${item.month}</td>
        <td>${item.passed}</td>
        <td>${item.failed}</td>
        <td>${item.skipped}</td>
        <td>${item.passRate}%</td>
      </tr>
    `)
    .join('');

  const runHistoryRows = summary
    .flatMap((item) => item.runs || [])
    .slice()
    .reverse()
    .map((run) => `
      <tr>
        <td>${new Date(run.date).toLocaleString()}</td>
        <td>${run.total}</td>
        <td>${run.passed}</td>
        <td>${run.failed}</td>
        <td>${run.skipped}</td>
        <td>${run.passRate}%</td>
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
      <p class="subtitle">Latest month: ${latestMonth.month} | Pass rate: ${latestMonth.passRate}%</p>
    </div>

    <div class="grid">
      <div class="card">
        <h2>Latest Month Snapshot</h2>
        <div class="summary-box"><span>Total</span><strong>${latestMonth.total}</strong></div>
        <div class="summary-box"><span>Passed</span><strong>${latestMonth.passed}</strong></div>
        <div class="summary-box"><span>Failed</span><strong>${latestMonth.failed}</strong></div>
        <div class="summary-box"><span>Skipped</span><strong>${latestMonth.skipped}</strong></div>
      </div>

      <div class="card">
        <h2>Latest Month Pie Chart</h2>
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
      <h2>Run-by-Run History</h2>
      <table>
        <thead>
          <tr>
            <th>Run Date</th>
            <th>Total</th>
            <th>Passed</th>
            <th>Failed</th>
            <th>Skipped</th>
            <th>Pass Rate</th>
          </tr>
        </thead>
        <tbody>
          ${runHistoryRows || '<tr><td colspan="6">No run history available.</td></tr>'}
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
          backgroundColor: ['#22c55e', '#ef4444', '#f59e0b']
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
            label: 'Passed',
            data: ${JSON.stringify(passSeries)},
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            fill: false,
            tension: 0.3
          },
          {
            label: 'Failed',
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
