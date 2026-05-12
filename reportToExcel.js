const fs = require('fs');
const xlsx = require('xlsx');

const filePath = 'TestResults.xlsx';
const sheetName = 'Results';

// Read report
const report = JSON.parse(fs.readFileSync('cypress/reports/mochawesome.json'));

let rows = [];

// Extract results
report.results.forEach(spec => {
  spec.suites.forEach(suite => {
    suite.tests.forEach(test => {
      let status = test.state.toUpperCase();

      // Detect flaky
      if (test.attempts && test.attempts.length > 1) {
        const first = test.attempts[0].state;
        const last = test.attempts[test.attempts.length - 1].state;

        if (first === 'failed' && last === 'passed') {
          status = 'FLAKY';
        }
      }

      rows.push({
        test: test.title,
        fail: status === 'FAILED' ? 1 : 0,
        flaky: status === 'FLAKY' ? 1 : 0
      });
    });
  });
});

// Load or create workbook
let wb;
let ws;

if (fs.existsSync(filePath)) {
  wb = xlsx.readFile(filePath);
  ws = wb.Sheets[sheetName];
} else {
  wb = xlsx.utils.book_new();
  ws = xlsx.utils.aoa_to_sheet([['Run', 'Test', 'Fail', 'Flaky']]); // header
}

// Find next empty row
let range = xlsx.utils.decode_range(ws['!ref']);
let nextRow = range.e.r + 1;

// Write data into specific columns
rows.forEach((r, index) => {
  const rowNum = nextRow + index;
  ws[`A${rowNum}`] = { v: 'Run_1' }; // Column A
  ws[`B${rowNum}`] = { v: r.test }; // Column B
  ws[`C${rowNum}`] = { v: r.fail }; // Column C
  ws[`D${rowNum}`] = { v: r.flaky }; // Column D
});

// Update sheet range
ws['!ref'] = xlsx.utils.encode_range({
  s: { r: 0, c: 0 },
  e: { r: nextRow + rows.length - 1, c: 3 }
});

// Append sheet if new
if (!wb.Sheets[sheetName]) {
  xlsx.utils.book_append_sheet(wb, ws, sheetName);
}

// Save file
xlsx.writeFile(wb, filePath);

console.log(`Test results written to ${filePath}`);
