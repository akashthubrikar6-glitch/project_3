const fs = require('fs');
const path = require('path');

const historyDir = path.join(__dirname, '..', 'history');
const summaryFile = path.join(historyDir, 'monthly-summary.json');
const outputFile = path.join(historyDir, 'monthly-pie-chart.html');

function readSummary() {
  if (!fs.existsSync(summaryFile)) {
    throw new Error(`Monthly summary not found: ${summaryFile}. Run "node scripts/regressionHistory.js --summary" first.`);
  }

  const data = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
  return Array.isArray(data) ? data : [];
}

function getSelectedMonth(summary) {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    return summary.find((item) => item.month === args[0]) || null;
  }

  return summary[summary.length - 1] || null;
}

function createTableRows(summary) {
  return summary
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
}

function buildHtml(reportMonth, summary) {
  const labels = ['Passed', 'Failed', 'Skipped'];
  const values = [
    Number(reportMonth.passed || 0),
    Number(reportMonth.failed || 0),
    Number(reportMonth.skipped || 0),
  ];
  const colors = ['#27ae60', '#e74c3c', '#f39c12'];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Monthly Regression Pie Chart</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background: #f5f7fb;
      color: #1f2937;
    }
    .container {
      max-width: 1100px;
      margin: 40px auto;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.08);
      padding: 24px;
      margin-bottom: 24px;
    }
    h1 {
      margin-top: 0;
      margin-bottom: 14px;
    }
    .subtitle {
      color: #4b5563;
      margin-bottom: 20px;
    }
    .chart-wrap {
      max-width: 420px;
      margin: 0 auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
    }
    th, td {
      border-bottom: 1px solid #e5e7eb;
      padding: 10px 12px;
      text-align: left;
    }
    th {
      background: #eef2ff;
    }
    .badge {
      display: inline-block;
      background: #dbeafe;
      color: #1d4ed8;
      padding: 6px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="badge">Monthly Regression Report</div>
      <h1>${reportMonth.month}</h1>
      <div class="subtitle">
        Total: ${reportMonth.total} | Passed: ${reportMonth.passed} | Failed: ${reportMonth.failed} | Skipped: ${reportMonth.skipped} | Pass rate: ${reportMonth.passRate}%
      </div>
      <div class="chart-wrap">
        <canvas id="monthlyChart"></canvas>
      </div>
    </div>

    <div class="card">
      <h2>Monthly History</h2>
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
          ${createTableRows(summary)}
        </tbody>
      </table>
    </div>
  </div>

  <script>
    const ctx = document.getElementById('monthlyChart');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ${JSON.stringify(labels)},
        datasets: [{
          data: ${JSON.stringify(values)},
          backgroundColor: ${JSON.stringify(colors)}
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          },
          title: {
            display: true,
            text: 'Regression Status Distribution'
          }
        }
      }
    });
  </script>
</body>
</html>`;
}

try {
  const summary = readSummary();
  const reportMonth = getSelectedMonth(summary);

  if (!reportMonth) {
    console.log('No monthly summary data found for the selected month.');
    process.exit(1);
  }

  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, buildHtml(reportMonth, summary));
  console.log(`Monthly pie chart saved to ${outputFile}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
