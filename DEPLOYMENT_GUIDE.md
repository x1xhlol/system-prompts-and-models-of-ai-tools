# 🚀 Deployment Guide

## Quick Deployment to GitHub Pages

Follow these steps to deploy your enhanced AI Coding Tools repository with all the new features.

---

## Step 1: Commit and Push Changes

### Check what's changed:
```powershell
git status
```

### Stage all changes:
```powershell
git add .
```

### Commit with a descriptive message:
```powershell
git commit -m "feat: Add metadata system, REST API, examples, and CI/CD pipeline

- Added 32 JSON metadata files for all tools
- Generated 39 REST API endpoints
- Created working examples in Python, JavaScript, and PowerShell
- Set up GitHub Actions for automated deployment
- Enhanced README with comprehensive documentation
- Added version comparison and automation tools"
```

### Push to GitHub:
```powershell
git push origin main
```

---

## Step 2: Enable GitHub Pages

### Option A: Via GitHub Web UI (Recommended)

1. **Go to your repository on GitHub:**
   ```
   https://github.com/sahiixx/system-prompts-and-models-of-ai-tools
   ```

2. **Click on "Settings"** (top navigation)

3. **Scroll down to "Pages"** (left sidebar under "Code and automation")

4. **Configure GitHub Pages:**
   - **Source:** Select "GitHub Actions" (NOT "Deploy from a branch")
   - This will use the `.github/workflows/deploy.yml` file we created

5. **Click "Save"**

6. **Wait for deployment:**
   - Go to "Actions" tab
   - You should see a workflow running
   - Wait for the green checkmark (takes 2-3 minutes)

7. **Access your site:**
   ```
   https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/
   ```

### Option B: Via GitHub CLI (if installed)

```powershell
# Enable GitHub Pages with GitHub Actions
gh api repos/sahiixx/system-prompts-and-models-of-ai-tools/pages `
  --method POST `
  --field source[branch]=main `
  --field source[path]=/
```

---

## Step 3: Verify Deployment

### Check GitHub Actions:
```powershell
# Open Actions page in browser
Start-Process "https://github.com/sahiixx/system-prompts-and-models-of-ai-tools/actions"
```

### Monitor the workflow:
1. Go to the "Actions" tab in your repository
2. Click on the most recent workflow run
3. Watch the build process
4. Look for:
   - ✅ Setup Node.js
   - ✅ Setup Python
   - ✅ Generate Metadata
   - ✅ Generate API Endpoints
   - ✅ Build Enhanced Site
   - ✅ Deploy to GitHub Pages

### Access your deployed site:
```powershell
# Open the deployed site
Start-Process "https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/"
```

---

## Step 4: Test Your Deployment

### Test API Endpoints:
```powershell
# Test the API index
curl https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/index.json

# Test a specific tool
curl https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/tools/cursor.json
```

### Test with Python:
```python
import requests

# Fetch all tools
response = requests.get('https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/index.json')
tools = response.json()
print(f"Found {len(tools['tools'])} tools")

# Fetch specific tool
cursor = requests.get('https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/api/tools/cursor.json').json()
print(f"Cursor has {len([k for k,v in cursor['features'].items() if v])} features")
```

---

## Step 5: Update Repository Settings (Optional)

### Add Website URL:
1. Go to repository main page
2. Click the gear icon next to "About"
3. Add website: `https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/`
4. Add description: "Comprehensive collection of AI coding tools system prompts with metadata, REST API, and interactive site"
5. Add topics: `ai`, `coding-tools`, `system-prompts`, `api`, `metadata`
6. Click "Save changes"

---

## Troubleshooting

### If deployment fails:

#### Check Node.js version in workflow:
```yaml
# In .github/workflows/deploy.yml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Make sure this is correct
```

#### Check Python version:
```yaml
- name: Setup Python
  uses: actions/setup-python@v5
  with:
    python-version: '3.11'  # Make sure this is correct
```

#### View workflow logs:
1. Go to Actions tab
2. Click on failed workflow
3. Expand each step to see error messages

#### Common issues:

**Issue:** "Node modules not found"
**Solution:** Make sure `site/package.json` exists and is committed

**Issue:** "Python script failed"
**Solution:** Check that all Python scripts are in the `scripts/` directory

**Issue:** "Permission denied"
**Solution:** Make sure GitHub Pages is enabled in repository settings

**Issue:** "404 on deployed site"
**Solution:** 
- Verify Pages is set to "GitHub Actions" not "Deploy from a branch"
- Check that the workflow completed successfully
- Wait 5-10 minutes for DNS propagation

---

## Automatic Updates

Once deployed, **any push to the main branch** will automatically:
1. Generate fresh metadata
2. Update API endpoints
3. Build the enhanced site
4. Deploy to GitHub Pages

**No manual intervention needed!**

---

## Testing Locally (Optional)

### Build site locally:

```powershell
# Install Node.js first (if not already installed)
# Download from: https://nodejs.org/

# Then run:
cd site
npm install
node build-enhanced.js

# Open the site
Start-Process "dist/index.html"
```

---

## Custom Domain (Optional)

### To use a custom domain:

1. **Add CNAME file:**
   ```powershell
   # In site/dist/ directory
   echo "yourdomain.com" > CNAME
   ```

2. **Configure DNS:**
   - Add A records pointing to GitHub Pages IPs:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153
   - Or add CNAME record: `sahiixx.github.io`

3. **Update GitHub Pages settings:**
   - Go to Settings → Pages
   - Enter your custom domain
   - Enable "Enforce HTTPS"

---

## Monitoring

### View deployment status:
```powershell
# Check latest deployment
gh run list --limit 5
```

### View site analytics:
- Use Google Analytics
- Use GitHub traffic insights (Settings → Insights → Traffic)

---

## Success Checklist

- [ ] Code pushed to GitHub
- [ ] GitHub Actions workflow running
- [ ] Workflow completed successfully
- [ ] GitHub Pages enabled
- [ ] Site accessible at URL
- [ ] API endpoints responding
- [ ] Metadata files accessible
- [ ] Repository "About" section updated

---

## Next Steps After Deployment

1. ✅ **Share your site:**
   ```
   https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/
   ```

2. ✅ **Update your README badges:**
   ```markdown
   [![Website](https://img.shields.io/website?url=https%3A%2F%2Fsahiixx.github.io%2Fsystem-prompts-and-models-of-ai-tools%2F)](https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/)
   [![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-success)](https://sahiixx.github.io/system-prompts-and-models-of-ai-tools/)
   ```

3. ✅ **Announce on social media:**
   - Twitter/X
   - LinkedIn
   - Reddit (r/programming, r/MachineLearning)
   - Discord communities

4. ✅ **Monitor traffic and usage**

---

## Support

If you encounter any issues:
1. Check the [GitHub Actions logs](https://github.com/sahiixx/system-prompts-and-models-of-ai-tools/actions)
2. Review the [troubleshooting section](#troubleshooting) above
3. Open an issue in the repository

---

*Last updated: October 2, 2025*  
**Status: Ready for deployment! 🚀**
