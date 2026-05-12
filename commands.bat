@echo off
REM Test Automation Commands - Quick Reference
REM Run this from: E:\cypress_project\project_3

echo.
echo ========================================
echo  TEST AUTOMATION QUICK COMMANDS
echo ========================================
echo.
echo Choose an option:
echo.
echo 1. Run Full Pipeline (Tests + Reports + Dashboard)
echo    Command: node runFullPipeline.js
echo.
echo 2. Run Tests Only
echo    Command: npx cypress run
echo.
echo 3. Generate Excel Report
echo    Command: node reportToExcel.js
echo.
echo 4. Analyze Trends
echo    Command: node trendAnalysis.js
echo.
echo 5. View Dashboard
echo    Command: node openDashboard.js
echo.
echo 6. Open TestResults.xlsx
echo    Command: Invoke-Item TestResults.xlsx
echo.
echo 7. Open TestTrends.xlsx
echo    Command: Invoke-Item TestTrends.xlsx
echo.
echo 8. View Test History (JSON)
echo    Command: Get-Content testTrendHistory.json | ConvertFrom-Json | Format-Table
echo.
echo 9. List All Generated Files
echo    Command: Get-ChildItem | Where {$_.Extension -in '.xlsx','.html','.json'} | Select Name, Length
echo.
echo ========================================
echo.
echo Tip: Type any command above directly in PowerShell!
echo.
