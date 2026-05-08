# Deployment Guide

This guide will help you deploy the Business Plan website to Vercel.

## Prerequisites

- GitHub, GitLab, or Bitbucket account
- Vercel account (free tier is sufficient)

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push to Git Repository

1. Initialize git if not already done:
\`\`\`bash
git init
git add .
git commit -m "Initial commit: Business plan website"
\`\`\`

2. Create a repository on GitHub and push:
\`\`\`bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
\`\`\`

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will auto-detect Next.js - no configuration needed
5. Click "Deploy"

Your site will be live in ~2 minutes at: `https://your-project-name.vercel.app`

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

\`\`\`bash
pnpm add -g vercel
\`\`\`

### Step 2: Login

\`\`\`bash
vercel login
\`\`\`

### Step 3: Deploy

From the project directory:

\`\`\`bash
vercel
\`\`\`

Follow the prompts:
- Set up and deploy: `Y`
- Which scope: Select your account
- Link to existing project: `N`
- Project name: Enter your preferred name
- Directory: Press Enter (current directory)
- Override settings: `N`

### Step 4: Deploy to Production

\`\`\`bash
vercel --prod
\`\`\`

## Custom Domain (Optional)

### Add Custom Domain on Vercel

1. Go to your project on Vercel
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Update DNS records as instructed by Vercel

## Environment Variables

This project doesn't require environment variables, but if you need to add any:

1. Go to Project Settings → Environment Variables
2. Add variables for Production, Preview, and Development

## Post-Deployment Checks

After deployment, verify:

- [ ] Homepage loads correctly
- [ ] Arabic/English language toggle works
- [ ] All three plan pages render properly
- [ ] Navigation works smoothly
- [ ] Dark/light mode toggle functions
- [ ] Print styles work (try printing a page)
- [ ] Mobile responsive design looks good
- [ ] RTL (Arabic) and LTR (English) layouts work correctly

## Troubleshooting

### Build Errors

If the build fails, check:
1. All dependencies are in package.json
2. No TypeScript errors: `pnpm build` locally
3. Node.js version is 18+ in Vercel settings

### Preview vs Production

- Each commit creates a preview deployment
- Only `main` branch deployments go to production
- Test on preview URLs before merging to main

## Monitoring

Vercel provides:
- Analytics (visits, countries, browsers)
- Speed Insights (performance metrics)
- Error logging (runtime errors)

Access these in your project dashboard.

## Support

For issues with deployment:
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support

