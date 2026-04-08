# Deployment Guide

This guide will help you deploy **Pomodoro Plant** to GitHub Pages so you can access it from anywhere, including your phone.

## Prerequisites

- A GitHub account (free)
- Git installed on your local machine
- This project already initialized as a git repository

## Quick Start

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the **"+"** icon in the top right, then **"New repository"**
3. Repository name: `pomodoro-plant`
4. Description: "Grow virtual plants while focusing with the Pomodoro technique"
5. Choose **Public** (required for free GitHub Pages)
6. **Do NOT** initialize with README, .gitignore, or license (we already have these)
7. Click **"Create repository"**

### 2. Push Your Code to GitHub

GitHub will show you commands to push an existing repository. Run these in your terminal:

```bash
# If you haven't already, add the remote (replace <username> with your GitHub username)
git remote add origin https://github.com/<username>/pomodoro-plant.git

# Push your code
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top navigation)
3. In the left sidebar, click **Pages**
4. Under **"Source"**, select **"GitHub Actions"**
   - This tells GitHub to use our workflow instead of deploying from a branch
5. That's it! The deployment will start automatically

### 4. Wait for Deployment

1. Click the **Actions** tab in your repository
2. You'll see a workflow run called "Test and Deploy"
3. Wait for both jobs to complete (usually 1-2 minutes):
   - ✅ **Run Tests** - Runs all 28 tests
   - ✅ **Deploy to Pages** - Uploads and deploys your app
4. Once both are green, your app is live!

### 5. Access Your App

Your app will be available at:

```
https://<username>.github.io/pomodoro-plant/
```

**Example:** If your username is `janedoe`, your app URL is:
```
https://janedoe.github.io/pomodoro-plant/
```

You can now:
- Visit this URL on your phone
- Add it to your home screen as a PWA
- Share it with friends!

---

## How Updates Work

Every time you push changes to the `main` branch, GitHub Actions will:

1. **Run all tests** - If any test fails, deployment is blocked
2. **Deploy to GitHub Pages** - Only if all tests pass

### Making Updates

```bash
# Make your changes to the code

# Stage and commit
git add .
git commit -m "Description of your changes"

# Push to GitHub (triggers automatic deployment)
git push origin main
```

Within 1-2 minutes, your changes will be live at your GitHub Pages URL.

---

## Troubleshooting

### My site shows a 404 error

**Cause:** GitHub Pages is configured to deploy from a branch instead of GitHub Actions.

**Solution:**
1. Go to Settings → Pages
2. Under "Source", select **"GitHub Actions"**
3. Wait a minute, then refresh your site

### Tests are failing in GitHub Actions

**Cause:** Code has a bug or test is broken.

**Solution:**
1. Run tests locally: `npm test`
2. Fix any failing tests
3. Commit and push the fix

### Service worker not updating

**Cause:** Browser caching.

**Solution:**
1. Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
2. Or clear cache in browser settings
3. The service worker cache name (`pomodoro-plant-v1`) can be incremented to force updates

### Changes aren't showing up

**Check these:**
1. Did the GitHub Action complete successfully? (Check the Actions tab)
2. Did you push to the `main` branch?
3. Try a hard refresh in your browser
4. Check the deployment URL is correct: `https://<username>.github.io/pomodoro-plant/`

---

## Testing Locally Before Deployment

Always test your changes locally before pushing:

```bash
# Run the development server
make serve

# In another terminal, run tests
npm test
```

Visit `http://localhost:8000` to test your changes.

---

## Advanced: Custom Domain (Optional)

If you own a domain name, you can use it instead of `<username>.github.io`:

1. Go to Settings → Pages
2. Under "Custom domain", enter your domain (e.g., `pomodoro.example.com`)
3. Add a CNAME record in your domain registrar pointing to `<username>.github.io`
4. Wait for DNS propagation (can take up to 24 hours)
5. Enable "Enforce HTTPS" once the domain is verified

---

## Understanding the Workflow

The `.github/workflows/deploy.yml` file defines our deployment pipeline:

```
Push to main
    ↓
[Job 1: Run Tests]
  • Checkout code
  • Setup Node.js 20
  • Run npm test (28 tests)
    ↓
  ✅ All pass? → Continue
  ❌ Any fail? → STOP (no deployment)
    ↓
[Job 2: Deploy]
  • Upload static files
  • Deploy to GitHub Pages
    ↓
  ✅ Live at https://<username>.github.io/pomodoro-plant/
```

This ensures broken code never reaches production!

---

## Support

If you encounter issues not covered here:

1. Check the [GitHub Pages documentation](https://docs.github.com/en/pages)
2. Review the Actions tab for error messages
3. Ensure all tests pass locally with `npm test`

---

## URLs Reference

- **Repository:** `https://github.com/<username>/pomodoro-plant`
- **Live App:** `https://<username>.github.io/pomodoro-plant/`
- **Actions (CI/CD):** `https://github.com/<username>/pomodoro-plant/actions`

Replace `<username>` with your actual GitHub username.

---

**Congratulations!** Your Pomodoro Plant app is now live on the internet! 🌱🎉
