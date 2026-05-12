# 📊 Cypress Test Trend Analysis System

## Overview
Complete automation system to run tests, generate Excel reports, and track test trends over time.

---

## 📁 Files Created

### 1. **reportToExcel.js** (Current Run Results)
Converts the latest mochawesome report to Excel format
- **Output**: `TestResults.xlsx`
- **Columns**: Run, Test, Fail (status), Flaky (status)
- **Usage**: `node reportToExcel.js`

### 2. **trendAnalysis.js** (Trend Tracking)
Tracks historical test data and generates trend reports
- **Outputs**: 
  - `TestTrends.xlsx` - Multi-sheet trend report
  - `testTrendHistory.json` - Complete history log
- **Tracks**: Pass rate, fail rate, flaky tests, duration
- **Compares**: Current vs. previous run
- **Usage**: `node trendAnalysis.js`

### 3. **runFullPipeline.js** (Complete Automation)
Master script that runs everything in sequence
- **Steps**:
  1. Runs Cypress tests
  2. Generates Excel report
  3. Analyzes trends
  4. Displays summary
- **Usage**: `node runFullPipeline.js`

---

## 🚀 Quick Start

### Option 1: Run Complete Pipeline
```powershell
node runFullPipeline.js
```

### Option 2: Run Individual Steps
```powershell
# Run tests
npx cypress run

# Generate current run report
node reportToExcel.js

# Analyze trends
node trendAnalysis.js
```

---

## 📊 Report Details

### TestResults.xlsx (Current Run)
- Single sheet with all tests from current run
- Columns: Run ID, Test Name, Failed (1 or 0), Flaky (1 or 0)

### TestTrends.xlsx (Historical Data)
**3 Sheets included:**

1. **Summary Sheet**
   - Report generation date/time
   - Total runs tracked
   - Average pass/fail rates
   - Best and worst pass rates

2. **History Sheet**
   - Date-wise run history
   - Test counts (total, passed, failed, flaky)
   - Pass/fail percentages
   - Execution duration

3. **Trends Sheet**
   - Latest run results
   - Comparison with previous run
   - Overall statistics
   - Performance trends

### testTrendHistory.json
- Complete history in JSON format
- Records: timestamp, test counts, pass rates
- Used for historical analysis

---

## 📈 Metrics Tracked

For each test run:
- ✅ Total tests executed
- ✅ Passed tests
- ❌ Failed tests
- ⚠️ Flaky tests
- 📊 Pass percentage
- 📊 Fail percentage
- ⏱️ Total execution time

Trend Analysis:
- 📈 Pass rate trends over time
- 📉 Fail rate improvements
- ⚠️ Flaky test detection
- ⏱️ Performance duration tracking
- 🔄 Run-to-run comparisons

---

## 🔄 Automation Ideas

### Daily Scheduled Runs
Add to Windows Task Scheduler or cron:
```powershell
# Windows Task - Run every day at 9 AM
PowerShell -ExecutionPolicy Bypass -Command "cd E:\cypress_project\project_3 && node runFullPipeline.js"
```

### GitHub Actions (CI/CD)
Create `.github/workflows/test-report.yml`:
```yaml
name: Test & Report
on: [push, pull_request]
jobs:
  test:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: node runFullPipeline.js
      - uses: actions/upload-artifact@v2
        with:
          name: test-reports
          path: |
            TestResults.xlsx
            TestTrends.xlsx
            cypress/reports/
```

### Email Integration
```powershell
# Use PowerShell to email reports daily
$EmailParams = @{
  To = "team@example.com"
  Subject = "Daily Test Report - $(Get-Date -Format 'yyyy-MM-dd')"
  Body = "See attached test reports"
  Attachments = @('TestResults.xlsx', 'TestTrends.xlsx')
  SmtpServer = "smtp.gmail.com"
}
Send-MailMessage @EmailParams
```

---

## 📝 Next Steps

1. ✅ **Trend Analysis** - DONE
2. **Daily Automation** - Set up scheduled runs
3. **Email Integration** - Auto-send reports
4. **Dashboard** - Create HTML dashboard for visualization
5. **Slack Notifications** - Real-time test alerts

---

## 🛠️ Troubleshooting

**Issue: "mochawesome.json not found"**
- Run tests first: `npx cypress run`
- Check cypress.config.js has mochawesome reporter configured

**Issue: "no such file or directory"**
- Ensure you're in the project root: `E:\cypress_project\project_3`
- Check all files exist: `reportToExcel.js`, `trendAnalysis.js`

**Issue: Excel file is empty**
- Ensure Cypress tests ran successfully
- Check `cypress/reports/mochawesome.json` exists
- Verify test structure matches expected format

---

## 📞 Support
For issues or enhancements, modify the scripts based on your needs.
All files are documented and ready to extend!

---

**Last Updated**: May 12, 2026
