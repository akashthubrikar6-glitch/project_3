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
  const features = new Set();

  if (!report || !report.results) {
    return null;
  }

  report.results.forEach((spec) => {
    if (!spec || !spec.suites) return;

    spec.suites.forEach((suite) => {
      if (!suite || !suite.tests) return;

      const featureName = suite.title || 'Unknown Feature';
      if (featureName) features.add(featureName);

      suite.tests.forEach((test) => {
        total += 1;
        const state = (test.state || '').toLowerCase();

        if (state === 'passed') passed += 1;
        else if (state === 'failed') failed += 1;
        else if (state === 'pending' || state === 'skipped') skipped += 1;
      });
    });
  });

  const tagValue = (process.env.TAGS || '').toLowerCase();
  const tag = tagValue.includes('@smoke') ? 'smoke' : tagValue.includes('@regression') ? 'regression' : 'all';

  return {
    total,
    passed,
    failed,
    skipped,
    passRate: total ? ((passed / total) * 100).toFixed(2) : '0.00',
    tag,
    features: Array.from(features)
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
    flaky: 0,
    passRate: Number(summary.passRate),
    tag: summary.tag,
    features: summary.features || [],
    runType: summary.tag || 'regression'
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
      grouped[month] = {
        month,
        passed: 0,
        failed: 0,
        skipped: 0,
        flaky: 0,
        totalRuns: 0,
        runs: []
      };
    }

    const runEntry = {
      date: entry.date,
      total: Number(entry.total || 0),
      passed: Number(entry.passed || 0),
      failed: Number(entry.failed || 0),
      skipped: Number(entry.skipped || 0),
      flaky: Number(entry.flaky || 0),
      passRate: Number(entry.passRate || 0),
      runType: entry.runType || 'regression'
    };

    grouped[month].runs.push(runEntry);
    grouped[month].passed += runEntry.passed;
    grouped[month].failed += runEntry.failed;
    grouped[month].skipped += runEntry.skipped;
    grouped[month].flaky += runEntry.flaky;
    grouped[month].totalRuns += 1;
  });

  const summary = Object.values(grouped)
    .map((m) => {
      const total = m.passed + m.failed + m.skipped;
      const passRate = total ? ((m.passed / total) * 100).toFixed(2) : '0.00';

      return {
        month: m.month,
        totalCases: total,
        passed: m.passed,
        failed: m.failed,
        skipped: m.skipped,
        flaky: m.flaky,
        totalRuns: m.totalRuns,
        total,
        passRate,
        runs: m.runs
          .slice()
          .sort((a, b) => new Date(a.date) - new Date(b.date))
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));

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
