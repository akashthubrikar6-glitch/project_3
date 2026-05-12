# 🚀 QUICK REFERENCE - Test Automation Commands

## One-Command Solutions

### ⚡ Run Everything (Recommended)
```powershell
node runFullPipeline.js
```
Runs tests → Generates reports → Analyzes trends in one command!

---

## Individual Commands

### 1️⃣ Run Cypress Tests
```powershell
npx cypress run
```
Executes all tests and generates mochawesome.json report

### 2️⃣ Generate Excel Report (Current Run)
```powershell
node reportToExcel.js
```
Creates `TestResults.xlsx` with test details

### 3️⃣ Analyze & Track Trends
```powershell
node trendAnalysis.js
```
Creates `TestTrends.xlsx` and `testTrendHistory.json`

---

## 📊 Reports Generated

**Instant Reports:**
- `TestResults.xlsx` - Current run results (1-2 seconds)
- `TestTrends.xlsx` - Historical trends & stats
- `testTrendHistory.json` - Complete history log

**Mochawesome Reports:**
- `cypress/reports/mochawesome.html` - Full test report (HTML)
- `cypress/reports/mochawesome.json` - Raw test data

---

## 📈 View Reports

### Open Excel Reports
```powershell
# Current results
Invoke-Item TestResults.xlsx

# Trend analysis
Invoke-Item TestTrends.xlsx

# View history log
Get-Content testTrendHistory.json
```

### Open HTML Report
```powershell
Invoke-Item cypress/reports/mochawesome.html
```

---

## 🔍 Key Metrics

**Tracked for Each Run:**
- ✅ Total Tests, Passed, Failed, Flaky
- 📊 Pass Rate %, Fail Rate %
- ⏱️ Execution Time
- 📈 Trend vs Previous Run
- 📉 Average Performance Stats

---

## ⏰ Schedule Daily Runs (Optional)

### Using Windows Task Scheduler
```powershell
# Create scheduled task
$trigger = New-ScheduledTaskTrigger -Daily -At 9am
$action = New-ScheduledTaskAction -Execute "PowerShell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File C:\runTests.ps1"
Register-ScheduledTask -TaskName "CypressTests" -Trigger $trigger -Action $action
```

---

## 📧 Email Reports (Optional)

```powershell
# Create sendReport.ps1
$date = Get-Date -Format "yyyy-MM-dd"
Send-MailMessage -To "team@company.com" `
  -Subject "Test Report - $date" `
  -Body "Daily test results attached" `
  -Attachments "TestResults.xlsx", "TestTrends.xlsx" `
  -SmtpServer "smtp.gmail.com" -From "reports@company.com"
```

---

## 💾 File Locations

```
project_3/
├── reportToExcel.js          # Current results script
├── trendAnalysis.js          # Trend tracking script
├── runFullPipeline.js        # Master automation script
├── TestResults.xlsx          # Current run report
├── TestTrends.xlsx           # Trend analysis report
├── testTrendHistory.json     # History log
└── cypress/
    └── reports/
        ├── mochawesome.html  # Full HTML report
        ├── mochawesome.json  # Test data
        └── mochawesome_*.json # Historical runs
```

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| No reports generated | Run `npx cypress run` first |
| File not found | Check working directory: `cd E:\cypress_project\project_3` |
| Empty Excel | Verify tests are passing in mochawesome.html |
| Wrong data | Delete old reports and run pipeline fresh |

---

## 📌 Pro Tips

✨ **Keep reports organized:**
```powershell
# Create dated folder
$date = Get-Date -Format "yyyy-MM-dd"
mkdir "reports\$date"
mv TestResults.xlsx "reports\$date\"
mv TestTrends.xlsx "reports\$date\"
```

✨ **Compare trends:**
Open `TestTrends.xlsx` → History sheet to see pass rate trends over time

✨ **Detect flaky tests:**
Look for tests with status = 1 in Flaky column of `TestResults.xlsx`

---

**Happy Testing! 🎉**
