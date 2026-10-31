const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const cucumberJsonPath = path.join(rootDir, 'cypress', 'reports', 'cucumber-json', 'output.json');
const summaryPath = path.join(rootDir, 'history', 'regression-run-summary.md');
const durationSeconds = Number(process.env.REGRESSION_DURATION_SECONDS);
const startedAt = process.env.REGRESSION_STARTED_AT || new Date().toISOString();

function escapeMarkdown(value) {
  return String(value || '')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getStepDurationSeconds(step) {
  const nanoseconds = Number(step.result && step.result.duration);
  return Number.isFinite(nanoseconds) ? nanoseconds / 1e9 : 0;
}

function getScenarioStatus(steps) {
  const statuses = steps.map((step) => String(step.result && step.result.status || '').toLowerCase());
  if (statuses.some((status) => ['failed', 'undefined', 'ambiguous'].includes(status))) return 'Failed';
  if (statuses.length && statuses.every((status) => status === 'passed')) return 'Passed';
  return 'Skipped';
}

if (!fs.existsSync(cucumberJsonPath)) {
  throw new Error(`Cucumber JSON report not found: ${cucumberJsonPath}`);
}

const features = JSON.parse(fs.readFileSync(cucumberJsonPath, 'utf8'));
if (!Array.isArray(features)) {
  throw new Error('Cucumber JSON report must contain an array of features.');
}

const scenarios = [];
features.forEach((feature) => {
  const featureTags = (feature.tags || []).map((tag) => tag.name);
  (feature.elements || []).forEach((element) => {
    if (element.type && element.type !== 'scenario') return;
    if (element.keyword && !String(element.keyword).toLowerCase().includes('scenario')) return;

    const scenarioTags = (element.tags || []).map((tag) => tag.name);
    if (![...featureTags, ...scenarioTags].includes('@regression')) return;

    const steps = element.steps || [];
    scenarios.push({
      feature: feature.name || 'Unknown feature',
      name: element.name || 'Unnamed scenario',
      status: getScenarioStatus(steps),
      durationSeconds: steps.reduce((total, step) => total + getStepDurationSeconds(step), 0),
      steps
    });
  });
});

const counts = scenarios.reduce((result, scenario) => {
  result[scenario.status.toLowerCase()] += 1;
  return result;
}, { passed: 0, failed: 0, skipped: 0 });

const durationText = Number.isFinite(durationSeconds) && durationSeconds >= 0
  ? `${durationSeconds}s`
  : 'Not available';
const lines = [
  '## Regression test run',
  '',
  `- **Started (UTC):** ${startedAt}`,
  `- **Total duration:** ${durationText}`,
  '',
  '| Total scenarios | Passed | Failed | Skipped |',
  '|---:|---:|---:|---:|',
  `| ${scenarios.length} | ${counts.passed} | ${counts.failed} | ${counts.skipped} |`,
  '',
  '### Test case results',
  '',
  '| Feature | Test case | Result | Test case time |',
  '|---|---|---|---:|'
];

scenarios.forEach((scenario) => {
  lines.push(
    `| ${escapeMarkdown(scenario.feature)} | ${escapeMarkdown(scenario.name)} | ${scenario.status} | ${scenario.durationSeconds.toFixed(2)}s |`
  );
});

if (scenarios.length === 0) {
  lines.push('| - | No @regression scenarios found | - | - |');
}

lines.push('', '### Test case steps', '');
scenarios.forEach((scenario) => {
  lines.push(`<details><summary>${escapeHtml(scenario.feature)} - ${escapeHtml(scenario.name)} (${scenario.status})</summary>`, '');
  if (scenario.steps.length === 0) {
    lines.push('No step details were recorded.', '');
  } else {
    lines.push('| Step | Result | Time |', '|---|---|---:|');
    scenario.steps.forEach((step) => {
      const stepStatus = String(step.result && step.result.status || 'unknown');
      const stepName = `${step.keyword || ''}${step.name || ''}`.trim();
      lines.push(`| ${escapeMarkdown(stepName)} | ${escapeMarkdown(stepStatus)} | ${getStepDurationSeconds(step).toFixed(2)}s |`);
    });
    lines.push('');
  }
  lines.push('</details>', '');
});

fs.mkdirSync(path.dirname(summaryPath), { recursive: true });
const markdown = `${lines.join('\n')}\n`;
fs.writeFileSync(summaryPath, markdown);

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
}

const reporter = require('cucumber-html-reporter');
reporter.generate({
  theme: 'bootstrap',
  jsonFile: cucumberJsonPath,
  output: path.join(rootDir, 'cypress', 'reports', 'regression-report.html'),
  reportSuiteAsScenarios: true,
  launchReport: false,
  metadata: {
    'Test Environment': 'GitHub Actions',
    'Report Type': 'Regression Tests',
    'Started (UTC)': startedAt,
    'Duration': durationText
  }
});

console.log(`Regression run summary written to ${summaryPath}`);
