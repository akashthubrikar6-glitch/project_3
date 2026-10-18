const fs = require('fs');
const path = require('path');

const historyDir = path.join(__dirname, '..', 'history');
const historyFile = path.join(historyDir, 'regression-history.json');
const summaryFile = path.join(historyDir, 'monthly-summary.json');

function ensureHistoryDir() {
  if (!fs.existsSync(historyDir)) {
    fs.mkdirSync(historyDir, { recursive: true });
  }
}

function getRunSummaryFromMochawesome() {
  const reportPath = path.join(__dirname, '..', 'cypress', 'reports', 'mochawesome.json');

  if (!fs.existsSync(reportPath)) {
    return null;
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  let total = 0;

  if (!report || !report.results) {
    return null;
  }

  report.results.forEach((spec) => {
    if (!spec || !spec.suites) return;

    spec.suites.forEach((suite) => {
      if (!suite || !suite.tests) return;

      suite.tests.forEach((test) => {
        total += 1;
        const state = (test.state || '').toLowerCase();

        if (state === 'passed') passed += 1;
        else if (state === 'failed') failed += 1;
        else if (state === 'pending' || state === 'skipped') skipped += 1;
      });
    });
  });

  return {
    total,
    passed,
    failed,
    skipped,
    passRate: total ? ((passed / total) * 100).toFixed(2) : '0.00'
  };
}

function appendRun() {
  ensureHistoryDir();

  const summary = getRunSummaryFromMochawesome();
  if (!summary) {
    console.log('No mochawesome report found. Nothing added to history.');
    return;
  }

  const now = new Date();
  const record = {
    date: now.toISOString(),
    month: now.toISOString().slice(0, 7),
    total: summary.total,
    passed: summary.passed,
    failed: summary.failed,
    skipped: summary.skipped,
    passRate: Number(summary.passRate),
    runType: 'regression'
  };

  let history = [];
  if (fs.existsSync(historyFile)) {
    history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    if (!Array.isArray(history)) history = [];
  }

  history.push(record);
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));

  console.log(`Regression run recorded in ${historyFile}`);
  console.log(JSON.stringify(record, null, 2));
}

function buildMonthlySummary() {
  ensureHistoryDir();

  if (!fs.existsSync(historyFile)) {
    console.log('No regression history found yet.');
    return;
  }

  const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
  const grouped = {};

  history.forEach((entry) => {
    const month = entry.month || entry.date?.slice(0, 7) || 'unknown';

    if (!grouped[month]) {
      grouped[month] = { month, passed: 0, failed: 0, skipped: 0, totalRuns: 0 };
    }

    grouped[month].passed += Number(entry.passed || 0);
    grouped[month].failed += Number(entry.failed || 0);
    grouped[month].skipped += Number(entry.skipped || 0);
    grouped[month].totalRuns += 1;
  });

  const summary = Object.values(grouped).map((m) => ({
    ...m,
    total: m.passed + m.failed + m.skipped,
    passRate: m.total ? ((m.passed / (m.passed + m.failed + m.skipped)) * 100).toFixed(2) : '0.00'
  }));

  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  console.log(`Monthly summary saved to ${summaryFile}`);
  console.log(JSON.stringify(summary, null, 2));
}

const args = process.argv.slice(2);
if (args.includes('--summary')) {
  buildMonthlySummary();
} else {
  appendRun();
}
