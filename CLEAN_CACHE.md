# 🧹 How to Delete Cache Files

## Quick Delete Commands

### 1. Delete `.next/` Build Cache (Next.js)
```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
```

### 2. Delete All Cache Folders at Once
```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
```

### 3. Full Clean (Nuclear Option - Deletes Everything)
```powershell
# Delete build/cache folders
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue

# Reinstall dependencies (run after deleting node_modules)
npm install
```

## What Each Cache Folder Does

- **`.next/`** - Next.js build output and cache (auto-generated)
- **`node_modules/.cache/`** - npm/package caches
- **`build/`** - Production build output (if exists)

## Safe to Delete?

✅ **YES - Safe to delete:**
- `.next/` - Will be regenerated on next `npm run dev`
- `node_modules/.cache/` - Will be regenerated as needed
- `build/` - Will be regenerated on next `npm run build`

⚠️ **DON'T delete:**
- `node_modules/` - Need to reinstall with `npm install` if deleted
- `src/` - Your source code!
- `prisma/dev.db` - Your database (unless you want to reset)

## Recommended: Delete .next/ Only

Since `.next/` is the main cache culprit and is already ignored in `.gitignore`:

```powershell
Remove-Item -Recurse -Force .next
```

Then restart your dev server:
```powershell
npm run dev
```

The `.next/` folder will be automatically recreated.
