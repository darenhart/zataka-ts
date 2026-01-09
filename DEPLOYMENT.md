# Deployment Guide

## 🚀 GitHub Pages Deployment (Simplest Option)

Your game is configured for automatic deployment to GitHub Pages.

---

## Quick Deploy (3 Steps)

### 1. Install the deployment tool
```bash
npm install
```

### 2. Deploy to GitHub Pages
```bash
npm run deploy
```

This command will:
- ✅ Build your TypeScript code
- ✅ Create optimized production bundle
- ✅ Push to `gh-pages` branch automatically
- ✅ Deploy to GitHub Pages

### 3. Enable GitHub Pages (First Time Only)

After running `npm run deploy`, go to your GitHub repo:

1. Go to: https://github.com/darenhart/zataka-ts/settings/pages
2. Under "Source", select: `Deploy from a branch`
3. Under "Branch", select: `gh-pages` and `/ (root)`
4. Click "Save"

**Done!** Your game will be live at:
**https://darenhart.github.io/zataka-ts/**

---

## 📋 Deployment Checklist

Before deploying:
- [ ] All tests passing: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] Game works in dev mode: `npm run dev`
- [ ] Committed all changes: `git status`

---

## 🔄 Updating Your Deployment

Every time you want to update the live site:

```bash
# 1. Make your changes
# 2. Test locally
npm run dev

# 3. Deploy
npm run deploy
```

That's it! GitHub Pages will update automatically (takes ~1 minute).

---

## 🛠️ Configuration Details

### Vite Configuration
The `vite.config.ts` has been configured with:
```typescript
base: '/zataka-ts/' // Your GitHub Pages URL path
```

### Package.json Scripts
```json
"deploy": "npm run build && gh-pages -d dist"
```

This script:
1. Runs TypeScript compilation
2. Builds production bundle with Vite
3. Deploys the `dist/` folder to `gh-pages` branch

---

## 🌐 Custom Domain (Optional)

If you want to use a custom domain (like `zatacka.yourdomain.com`):

1. Add a `CNAME` file to the `public/` folder with your domain
2. Configure DNS with your domain provider
3. Enable custom domain in GitHub Pages settings

---

## 🐛 Troubleshooting

### "gh-pages not found"
```bash
npm install gh-pages --save-dev
```

### "Permission denied"
Make sure you're authenticated with GitHub:
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### "404 Not Found" after deployment
- Check that GitHub Pages is enabled (see step 3 above)
- Wait 1-2 minutes for GitHub to update
- Check the `gh-pages` branch exists in your repo

### Assets not loading (blank page)
- Make sure `base: '/zataka-ts/'` is in `vite.config.ts`
- Rebuild and redeploy: `npm run deploy`

---

## 📊 Build Information

**Current Configuration:**
- Bundle size: ~22 kB (6.7 kB gzipped)
- Target: ES2022
- Minification: esbuild
- Source maps: Enabled

**Assets:**
- TypeScript source: 28 files
- Production code: 4,489 lines
- Test code: 6,673 lines
- Total bundle: 18 modules

---

## 🎉 Success!

Once deployed, your game will be live at:
**https://darenhart.github.io/zataka-ts/**

Share the link and enjoy! 🎮

---

**Last Updated**: 2026-01-09
