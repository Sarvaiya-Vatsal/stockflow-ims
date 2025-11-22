# Git Setup Guide - Push to GitHub

Follow these steps to push your StockMaster project to GitHub:

## Step 1: Initialize Git Repository

Open PowerShell in the `stockflow-ims` directory and run:

```powershell
cd D:\StockMaster\stockflow-ims
git init
```

## Step 2: Configure Git (if not already done)

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Step 3: Add All Files

```powershell
git add .
```

## Step 4: Create Initial Commit

```powershell
git commit -m "Initial commit: StockMaster Inventory Management System"
```

## Step 5: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click the **"+"** icon in the top right
3. Select **"New repository"**
4. Name it: `StockMaster` or `stockflow-ims`
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

## Step 6: Connect Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```powershell
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/StockMaster.git

# Or if you prefer SSH:
# git remote add origin git@github.com:YOUR_USERNAME/StockMaster.git
```

## Step 7: Push to GitHub

```powershell
# Push to main branch
git branch -M main
git push -u origin main
```

If you're asked for credentials:
- **Username**: Your GitHub username
- **Password**: Use a **Personal Access Token** (not your GitHub password)
  - Go to: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
  - Generate new token with `repo` scope
  - Use this token as your password

## Step 8: Verify

Go to your GitHub repository page and verify all files are uploaded.

---

## Common Commands for Future Updates

### Check Status
```powershell
git status
```

### Add Changes
```powershell
git add .
# Or add specific files:
# git add filename.txt
```

### Commit Changes
```powershell
git commit -m "Description of your changes"
```

### Push Changes
```powershell
git push
```

### Pull Latest Changes (if working with others)
```powershell
git pull
```

---

## Troubleshooting

### If you get "fatal: not a git repository"
- Make sure you're in the `stockflow-ims` directory
- Run `git init` first

### If you get authentication errors
- Use Personal Access Token instead of password
- Or set up SSH keys for GitHub

### If you want to change remote URL
```powershell
git remote set-url origin https://github.com/YOUR_USERNAME/StockMaster.git
```

### If you want to see remote URL
```powershell
git remote -v
```

---

## Important Notes

✅ **Already created files:**
- `.gitignore` - Ignores node_modules, .env files, etc.
- `README.md` - Project documentation

⚠️ **Make sure these are NOT committed:**
- `.env` files (already in .gitignore)
- `node_modules/` (already in .gitignore)
- Any sensitive credentials

---

## Quick Copy-Paste Commands

```powershell
# Navigate to project
cd D:\StockMaster\stockflow-ims

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: StockMaster Inventory Management System"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/StockMaster.git

# Push
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username!

