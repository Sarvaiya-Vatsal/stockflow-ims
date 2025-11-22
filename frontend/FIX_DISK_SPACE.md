# Fixing Disk Space Issues for npm Install

## Error Explanation

The `ENOSPC: no space left on device` error means your system doesn't have enough free disk space to install npm packages.

## Quick Solutions

### 1. Clear npm Cache
```powershell
npm cache clean --force
```

### 2. Check Disk Space
```powershell
# Check available space on C: drive
Get-PSDrive C | Select-Object Used,Free
```

### 3. Free Up Space

#### Option A: Clear npm cache and temp files
```powershell
# Clear npm cache
npm cache clean --force

# Clear Windows temp files
Remove-Item -Path "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue

# Clear npm cache directory
Remove-Item -Path "$env:APPDATA\npm-cache" -Recurse -Force -ErrorAction SilentlyContinue
```

#### Option B: Uninstall unused programs
- Go to Settings > Apps > Uninstall unused applications

#### Option C: Clear browser cache and downloads
- Clear browser cache
- Delete old downloads

#### Option D: Use Disk Cleanup
```powershell
# Run Windows Disk Cleanup
cleanmgr /d C:
```

### 4. Install Dependencies in Smaller Batches

Instead of installing everything at once, install in smaller groups:

```powershell
# Essential packages first
npm install next react react-dom typescript @types/react @types/node @types/react-dom

# Then Tailwind
npm install tailwindcss postcss autoprefixer

# Then API/State management
npm install axios @tanstack/react-query zustand

# Then forms
npm install react-hook-form @hookform/resolvers zod

# Then utilities
npm install date-fns lucide-react clsx
```

### 5. Use Alternative Package Manager (if available)

If you have yarn or pnpm installed:
```powershell
# Using yarn
yarn install

# Or using pnpm
pnpm install
```

### 6. Check npm Cache Location

```powershell
# Check npm cache location
npm config get cache

# Change cache location to a drive with more space (if you have one)
npm config set cache "D:\npm-cache"
```

## Minimum Space Requirements

- Next.js project: ~200-300 MB for node_modules
- npm cache: Can grow to several GB
- Recommended: At least 1-2 GB free space

## After Freeing Space

1. Clear npm cache: `npm cache clean --force`
2. Try installing again: `npm install`
3. If still fails, install in batches (see option 4 above)

## Alternative: Use Existing node_modules

If you have another Next.js project with similar dependencies, you could:
1. Copy node_modules from that project (not recommended, but works in a pinch)
2. Or use a shared node_modules location

## Check What's Using Space

```powershell
# Find large directories
Get-ChildItem -Path C:\ -Directory -ErrorAction SilentlyContinue | 
    Sort-Object @{Expression={$_.GetFiles().Length}},Descending | 
    Select-Object -First 10 FullName, @{Name="Size(MB)";Expression={[math]::Round($_.GetFiles().Length/1MB,2)}}
```

