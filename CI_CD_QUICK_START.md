# ⚡ GitHub Actions Quick Setup

## 🚀 5-Minute Setup

### Step 1: Verify Workflows Exist
```powershell
ls .github/workflows/
```
Should show:
- `pr-tests.yml`
- `test-reports.yml`
- `deploy.yml`

### Step 2: Push Your Code to GitHub

```powershell
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Add test automation with CI/CD"

# Create main branch
git branch -M main

# Add remote (replace USERNAME/REPO)
git remote add origin https://github.com/USERNAME/cypress_project.git

# Push
git push -u origin main
```

### Step 3: Done! ✅

Workflows are now active. Test them:

---

## 📋 What Each Workflow Does

### PR Tests (Runs on Pull Requests)
```
When: Someone creates a PR or pushes to main
What: 
  1. Runs Cypress tests
  2. Generates reports
  3. Creates dashboard
  4. Comments results on PR
  5. Blocks merge if tests fail
```

### Test Reports (Daily + On Push)
```
When: 
  - Every day at 9 AM UTC
  - When code is pushed to main
What:
  1. Runs all tests
  2. Creates Excel reports
  3. Generates dashboard
  4. Uploads to artifacts
  5. (Optional) Publishes to GitHub Pages
```

### Deploy (Automated Deployment)
```
When: Tests pass successfully
What:
  1. Validates test results
  2. Deploys application
  3. Notifies status
```

---

## 🧪 Test Your Workflows

### Method 1: Create a Test PR
```powershell
# Create new branch
git checkout -b test/ci-setup

# Make a small change to a test file
echo "// Test" >> cypress/support/commands.js

# Commit and push
git add .
git commit -m "Test CI workflow"
git push origin test/ci-setup
```

Go to GitHub → Create Pull Request → Watch workflow run! 🚀

### Method 2: Push to Main
```powershell
git push origin main
```

Go to Actions tab to see workflow running.

---

## 📊 View Results

1. **Go to GitHub Repository**
2. **Click "Actions" tab**
3. **Select workflow run**
4. **See results:**
   - ✅ Tests passed/failed
   - 📊 Test counts
   - 📤 Artifacts downloaded
   - 💬 PR comments

---

## 📥 Download Reports

### From GitHub Actions

1. Go to Actions → Workflow run
2. Scroll to "Artifacts"
3. Click "test-reports-XXX"
4. Download ZIP with:
   - TestResults.xlsx
   - TestTrends.xlsx
   - dashboard.html
   - Mochawesome reports

---

## 🌐 GitHub Pages (Optional)

### Enable Public Dashboard
1. Go to Settings → Pages
2. Select "GitHub Actions" source
3. Wait 2-5 minutes
4. Your dashboard at:
   ```
   https://username.github.io/project_3/dashboard.html
   ```

### Share with Team
```
Send link to team - no GitHub account needed!
They can view live dashboard.
```

---

## 🔔 Get Notifications

### Test Results in Email
1. Settings → Notifications
2. "Actions" section
3. Choose email preference

### PR Comments
Automatic! When PR tests complete, results shown as comment.

---

## 🛠️ Customize Workflows

### Change Test Schedule
Edit `.github/workflows/test-reports.yml`:

```yaml
schedule:
  - cron: '0 9 * * *'  # 9 AM UTC daily
```

Cron format: `minute hour day month weekday`

Examples:
```
0 9 * * *     # 9 AM daily
0 9 * * 1-5   # 9 AM weekdays
0 */6 * * *   # Every 6 hours
```

### Add Slack Notifications
Edit workflow YAML and add:

```yaml
- name: 📢 Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    text: 'Tests passed: ${{ steps.results.outputs.pass_rate }}%'
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

Then add Slack webhook in GitHub Secrets.

---

## ✅ Verify Everything Works

### Checklist
- [ ] `.github/workflows/` folder exists
- [ ] 3 YAML files in workflows folder
- [ ] Code pushed to GitHub
- [ ] Actions tab shows workflows
- [ ] Workflows triggered and completed
- [ ] Reports generated in artifacts
- [ ] PR comments show test results

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Workflows not showing | Commit `.github/` folder and push |
| Tests failing in CI | Run `npx cypress run --headless` locally |
| No artifacts | Check file paths in workflow YAML |
| PR not blocked | Ensure `fail-fast: false` is set |
| Schedule not running | Check cron syntax, wait for next scheduled time |

---

## 📊 Current Workflows Summary

| Workflow | Trigger | Artifacts | Status |
|----------|---------|-----------|--------|
| PR Tests | PR/Push | Reports, Dashboard | ✅ Ready |
| Test Reports | Daily 9AM, Push | Reports, Release | ✅ Ready |
| Deploy | Tests Pass | Deployment | ✅ Ready |

---

## 🚀 You're All Set!

Your CI/CD pipeline is now live! 🎉

**Workflows automatically:**
- ✅ Run tests on every PR
- ✅ Generate reports daily
- ✅ Block merges if tests fail
- ✅ Deploy when tests pass
- ✅ Create releases with reports

---

## 📚 Related Files

- [CI_CD_SETUP.md](CI_CD_SETUP.md) - Detailed guide
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Commands
- [COMPLETE_SUITE_SUMMARY.md](COMPLETE_SUITE_SUMMARY.md) - Overview

---

**CI/CD v1.0 | GitHub Actions Automation Ready** 🚀
