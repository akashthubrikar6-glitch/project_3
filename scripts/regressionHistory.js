const fs = require('fs');
const path = require('path');

const historyDir = path.join(__dirname, '..', 'history');
const historyFile = path.join(historyDir, 'regression-history.json');
const summaryFile = path.join(historyDir, 'monthly-summary.json');

function getScenarioStatus(steps) {
  const statuses = steps.map((step) => String(step.result && step.result.status || '').toLowerCase());
  if (statuses.some((status) => ['failed', 'undefined', 'ambiguous'].includes(status))) return 'failed';
  if (statuses.length && statuses.every((status) => status === 'passed')) return 'passed';
  return 'skipped';
}

function summarizeCucumberFeatures(features, tag) {
  if (!Array.isArray(features)) {
    throw new Error('Cucumber JSON report must contain an array of features.');
  }

  const scenarios = [];
  features.forEach((feature) => {
    const featureTags = (feature.tags || []).map((item) => item.name);
    (feature.elements || []).forEach((element) => {
      if (element.type && element.type !== 'scenario') return;
      if (element.keyword && !String(element.keyword).toLowerCase().includes('scenario')) return;

      const tags = [...featureTags, ...(element.tags || []).map((item) => item.name)];
      if (tag !== 'all' && !tags.includes(`@${tag}`)) return;

      const steps = element.steps || [];
      scenarios.push({
        feature: feature.name || 'Unknown feature',
        name: element.name || 'Unnamed scenario',
        status: getScenarioStatus(steps),
        durationSeconds: steps.reduce((total, step) => {
          const duration = Number(step.result && step.result.duration);
          return total + (Number.isFinite(duration) ? duration / 1e9 : 0);
        }, 0)
      });
    });
  });

  const summary = {
    total: scenarios.length,
    passed: scenarios.filter((scenario) => scenario.status === 'passed').length,
    failed: scenarios.filter((scenario) => scenario.status === 'failed').length,
    skipped: scenarios.filter((scenario) => scenario.status === 'skipped').length,
    scenarios,
    source: 'cucumber'
  };
  summary.passRate = summary.total ? ((summary.passed / summary.total) * 100).toFixed(2) : '0.00';
  summary.features = [...new Set(scenarios.map((scenario) => scenario.feature))];
  return summary;
}

function getRunSummaryFromCucumber(tag) {
  const reportPath = path.join(__dirname, '..', 'cypress', 'reports', 'cucumber-json', 'output.json');
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Cucumber JSON report not found: ${reportPath}`);
  }

  const features = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  return summarizeCucumberFeatures(features, tag);
}

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

  const tagValue = (process.env.TAGS || '').toLowerCase();
  const tag = tagValue.includes('@smoke') ? 'smoke' : tagValue.includes('@regression') ? 'regression' : 'all';
  const summary = tag === 'regression'
    ? getRunSummaryFromCucumber(tag)
    : getRunSummaryFromMochawesome();
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
    tag: summary.tag || tag,
    features: summary.features || [],
    runType: summary.tag || tag,
    ...(summary.source ? { scenarioSource: summary.source, scenarios: summary.scenarios } : {})
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

function buildMonthlySummaryData(history) {
  const grouped = {};

  history.forEach((entry) => {
    const month = entry.month || entry.date?.slice(0, 7) || 'unknown';
    const tag = (entry.tag || entry.runType || 'all').toLowerCase();

    if (!grouped[month]) {
      grouped[month] = {
        month,
        passed: 0,
        failed: 0,
        skipped: 0,
        flaky: 0,
        totalRuns: 0,
        scenarioRuns: 0,
        tagBreakdown: {},
        runs: []
      };
    }

    if (!grouped[month].tagBreakdown[tag]) {
      grouped[month].tagBreakdown[tag] = {
        tag,
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        flaky: 0,
        runCount: 0
      };
    }

    const hasScenarioResults = entry.scenarioSource === 'cucumber';
    const runEntry = {
      date: entry.date,
      total: hasScenarioResults ? Number(entry.total || 0) : null,
      passed: hasScenarioResults ? Number(entry.passed || 0) : null,
      failed: hasScenarioResults ? Number(entry.failed || 0) : null,
      skipped: hasScenarioResults ? Number(entry.skipped || 0) : null,
      flaky: Number(entry.flaky || 0),
      passRate: hasScenarioResults ? Number(entry.passRate || 0) : null,
      runType: entry.runType || 'regression',
      tag: entry.tag || entry.runType || 'all',
      features: Array.isArray(entry.features) ? entry.features : [],
      scenarioSource: hasScenarioResults ? entry.scenarioSource : null,
      scenarios: hasScenarioResults && Array.isArray(entry.scenarios) ? entry.scenarios : []
    };

    grouped[month].runs.push(runEntry);
    grouped[month].totalRuns += 1;

    if (hasScenarioResults) {
      grouped[month].scenarioRuns += 1;
      grouped[month].passed += runEntry.passed;
      grouped[month].failed += runEntry.failed;
      grouped[month].skipped += runEntry.skipped;
      grouped[month].flaky += runEntry.flaky;

      grouped[month].tagBreakdown[tag].total += runEntry.total;
      grouped[month].tagBreakdown[tag].passed += runEntry.passed;
      grouped[month].tagBreakdown[tag].failed += runEntry.failed;
      grouped[month].tagBreakdown[tag].skipped += runEntry.skipped;
      grouped[month].tagBreakdown[tag].flaky += runEntry.flaky;
      grouped[month].tagBreakdown[tag].runCount += 1;
    }
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
        scenarioRuns: m.scenarioRuns,
        total,
        passRate,
        tagBreakdown: m.tagBreakdown || {},
        runs: m.runs
          .slice()
          .sort((a, b) => new Date(a.date) - new Date(b.date))
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month));

  return summary;
}

function buildMonthlySummary() {
  ensureHistoryDir();

  if (!fs.existsSync(historyFile)) {
    console.log('No regression history found yet.');
    return;
  }

  const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
  const summary = buildMonthlySummaryData(history);
  fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  console.log(`Monthly summary saved to ${summaryFile}`);
  console.log(JSON.stringify(summary, null, 2));
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--summary')) {
    buildMonthlySummary();
  } else {
    appendRun();
  }
}

module.exports = { summarizeCucumberFeatures, buildMonthlySummaryData };
