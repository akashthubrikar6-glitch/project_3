# 🔀 GitHub Actions CI/CD Pipeline Setup

## Overview
Complete CI/CD automation for Cypress tests using GitHub Actions.

**3 Workflows included:**
1. **PR Tests** - Runs on pull requests & pushes to main
2. **Test Reports** - Daily scheduled tests + reports
3. **Deploy** - Deployment after test validation

---

## 📂 File Structure

```
.github/
└── workflows/
    ├── pr-tests.yml          # PR test automation
    ├── test-reports.yml      # Daily tests & reporting
    └── deploy.yml            # Deployment workflow
```

---

## 🔧 Workflow 1: PR Tests (`pr-tests.yml`)

### Triggers
```yaml
- Pull requests to main or develop branches
- Push to main branch
```

### What It Does
1. ✅ Checks out code
2. 📦 Sets up Node.js & dependencies
3. 🧪 Runs Cypress tests
4. 📊 Generates Excel reports
5. 🎨 Creates HTML dashboard
6. 📤 Uploads artifacts
7. 💬 Comments on PR with results
8. ❌ Fails if tests fail (blocks merge)

### Artifacts Generated
- `TestResults.xlsx` - Test results
- `TestTrends.xlsx` - Trend analysis
- `dashboard.html` - Interactive dashboard
- `cypress/reports/` - Mochawesome reports

### PR Comment Example
```
✅ Test Results

| Metric | Value |
|--------|-------|
| Total Tests | 1 |
| ✅ Passed | 1 |
| ❌ Failed | 0 |
| ⚠️ Flaky | 0 |
| Pass Rate | 100% |
| Duration | 4.84s |
```

---

## 📊 Workflow 2: Test Reports (`test-reports.yml`)

### Triggers
```yaml
- Push to main or develop
- Schedule: Daily at 9 AM UTC (0 9 * * *)
- Manual trigger (workflow_dispatch)
```

### What It Does
1. ✅ Runs Cypress tests
2. 📊 Generates all reports
3. 🎨 Creates dashboard
4. 📝 Creates job summary
5. 📤 Uploads artifacts (90-day retention)
6. 🚀 Deploys to GitHub Pages (optional)
7. 📦 Creates GitHub Release

### Features
- **Daily Scheduled Runs** - Automatic daily tests
- **GitHub Pages** - Publish reports publicly
- **Job Summary** - Test metrics in workflow summary
- **Release Creation** - Automatic release with reports
- **Artifact Retention** - 90 days for reports

### Enable GitHub Pages
1. Go to Settings → Pages
2. Select "GitHub Actions" as source
3. Reports accessible at: `https://username.github.io/project_3/dashboard.html`

---

## 🚀 Workflow 3: Deploy (`deploy.yml`)

### Triggers
```yaml
- Workflow completion (PR Tests or Test Reports)
- Only if tests passed
- Only on main branch
```

### What It Does
1. ✅ Validates test results
2. 🚀 Executes deployment
3. ✅ Reports success
4. ❌ Notifies if deployment fails

### Customize Deployment
Edit the "Deploy to production" step:

```yaml
- name: 🚀 Deploy to production
  run: |
    npm run build
    npm run deploy
    # Or use Docker:
    # docker build -t myapp .
    # docker push myapp
```

---

## ✅ Setup Instructions

### Step 1: Push to GitHub
```powershell
cd e:\cypress_project\project_3
git init
git add .
git commit -m "Add CI/CD pipeline"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cypress_project.git
git push -u origin main
```

### Step 2: Enable GitHub Actions
1. Go to GitHub repository
2. Click "Actions" tab
3. Actions should be enabled by default

### Step 3: Create Pull Request
```powershell
git checkout -b feature/test-feature
# Make changes
git add .
git commit -m "Add new tests"
git push origin feature/test-feature
```
Then create PR on GitHub - tests run automatically!

### Step 4: (Optional) Enable GitHub Pages
1. Go to Settings → Pages
2. Select "GitHub Actions" as source
3. Dashboard publicly available!

### Step 5: (Optional) Setup Deployment
Edit `.github/workflows/deploy.yml` and add your deployment commands.

---

## 📊 Workflow Status & Results

### View Workflow Runs
1. Click "Actions" tab in GitHub
2. Click workflow name
3. See all runs with status

### View Test Results
1. Click run details
2. Scroll to "Artifacts"
3. Download reports

### View Job Summary
In workflow run page, scroll down to see:
- Test metrics table
- Pass/fail counts
- Execution time
- Dashboard link

---

## 🔔 Enable Notifications

### GitHub Notifications
Automatic when tests fail in PR

### Email Notifications
Settings → Notifications → Choose email preferences

### Slack Integration (Optional)
```yaml
- name: 📢 Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Test Results: ${{ steps.results.outputs.pass_rate }}% passed'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## 📈 Scheduled Daily Tests

### Current Schedule
```
Cron: 0 9 * * *
Time: 9 AM UTC daily
Branch: main & develop
```

### Customize Schedule
Edit `test-reports.yml`:
```yaml
schedule:
  - cron: '0 9 * * *'  # 9 AM UTC daily
  # Other examples:
  # - cron: '0 * * * *'  # Every hour
  # - cron: '0 9 * * 1-5'  # Weekdays 9 AM
```

---

## 🔐 GitHub Secrets (Optional)

If using external services, add secrets:

1. Go to Settings → Secrets and variables → Actions
2. Add new repository secret
3. Use in workflows: `${{ secrets.SECRET_NAME }}`

### Example
```yaml
- name: Deploy with token
  env:
    DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
  run: ./deploy.sh
```

---

## 📋 Sample PR Workflow

```
1. Developer creates branch & makes changes
2. Pushes to GitHub & creates PR
   ↓
3. GitHub Actions: pr-tests.yml triggers
   - Runs Cypress tests
   - Generates reports
   - Uploads artifacts
   - Comments on PR with results
   ↓
4. If tests PASS: PR can be merged ✅
   - test-reports.yml triggers on merge
   - Generates daily report
   - Creates release
   - (Optional) Deploys to production
5. If tests FAIL: Block merge ❌
   - Developer fixes code
   - Pushes fix
   - Tests run again
```

---

## 🎨 Customize Workflows

### Change Node version
```yaml
node-version: 18.x  # Change to 16.x, 20.x, etc.
```

### Change OS
```yaml
runs-on: windows-latest  # or ubuntu-latest, macos-latest
```

### Add additional tests
```yaml
- name: 🧪 Run Cypress tests
  run: |
    npx cypress run --headless
    npm run lint
    npm run type-check
```

### Customize artifacts
```yaml
path: |
  TestResults.xlsx
  TestTrends.xlsx
  dashboard.html
  cypress/reports/
  # Add more files/folders
```

---

## 📊 Monitor Workflows

### Metrics to Track
- ✅ Test pass rate
- 🔴 Failed tests
- ⚠️ Flaky tests
- ⏱️ Execution time
- 🔄 PR merge rate
- 📈 Trend over time

### View in Dashboard
All metrics visible in GitHub Actions interface and our dashboard.

---

## 🚨 Troubleshooting

### Workflow not triggering
- Check `.github/workflows/` folder exists
- Commit files to repository
- Wait a few moments for GitHub to pick up changes

### Tests failing in CI but passing locally
```powershell
# Run with --headless flag like CI does
npx cypress run --headless
```

### Artifacts not uploading
- Check uploaded path exists
- Verify file names match

### GitHub Pages not working
- Go to Settings → Pages
- Select "GitHub Actions" as source
- Wait a few minutes for build

### Deployment not running
- Ensure previous workflow completed successfully
- Check `if` conditions in deploy.yml
- Verify on main branch

---

## 🔗 Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cypress Documentation](https://docs.cypress.io)
- [GitHub Pages Setup](https://pages.github.com)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---

## 📝 Environment Variables

Available in GitHub Actions workflows:

```yaml
github.ref              # Branch reference (refs/heads/main)
github.sha              # Commit SHA
github.run_number       # Run number
github.event_name       # Event type (pull_request, push, etc.)
github.repository       # repo owner/name
github.actor            # User who triggered
```

---

## 🎯 Next Steps

1. ✅ **CI/CD Pipelines** - DONE
2. **Slack Notifications** - Add Slack alerts
3. **Performance Tracking** - Track execution time trends
4. **Custom Reports** - Add more metrics to reports
5. **Automated Fixes** - Auto-fix failed tests

---

## 📞 Support

For workflow issues:
1. Check GitHub Actions documentation
2. View workflow logs in Actions tab
3. Check for syntax errors in YAML files
4. Ensure all paths are correct

---

**CI/CD Setup v1.0 | Complete GitHub Actions Integration**
