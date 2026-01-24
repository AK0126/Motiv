# Vercel Deployment Guide

## Prerequisites

- GitHub account
- Vercel account (free tier is sufficient)
- Supabase project already set up with database schema deployed

## Step 1: Push to GitHub

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Repository name: `motiv` (or your preferred name)
   - Set to **Public** or **Private** (your choice)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

2. **Push your local code to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/motiv.git
   git branch -M main
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your actual GitHub username.

## Step 2: Deploy to Vercel

1. **Go to Vercel:**
   - Visit https://vercel.com/new
   - Sign in with your GitHub account (if not already signed in)

2. **Import Your Repository:**
   - Click "Import Git Repository"
   - Select your `motiv` repository
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Should auto-detect as "Vite" (if not, select it)
   - **Root Directory:** Leave as `./` (default)
   - **Build Command:** `npm run build` (should be auto-filled)
   - **Output Directory:** `dist` (should be auto-filled)
   - **Install Command:** `npm install` (should be auto-filled)

4. **Add Environment Variables:**

   Click "Environment Variables" and add your environment variables:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | `...` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | `...` |

   **Important:** Make sure to add these to **Production**, **Preview**, and **Development** environments by checking all three boxes.

5. **Deploy:**
   - Click "Deploy"
   - Wait ~2 minutes for the build to complete
   - You'll see a success screen with your deployment URL

## Step 3: Configure Supabase URL Allowlist

To enable authentication from your Vercel domain:

1. **Get Your Vercel URL:**
   - After deployment, copy your Vercel URL (e.g., `https://motiv-abc123.vercel.app`)

2. **Update Supabase Configuration:**
   - Go to your Supabase dashboard: https://supabase.com/dashboard/project/qvprmppaqhdrervbzcxy
   - Navigate to **Authentication** → **URL Configuration**
   - Under "Site URL", set it to your Vercel URL
   - Under "Redirect URLs", add your Vercel URL

3. **Test Authentication:**
   - Visit your Vercel URL
   - Try signing up with a new account
   - Verify you can log in and access your data

## Step 4: Custom Domain (Optional)

If you want a custom domain like `motiv.yourdomain.com`:

1. **In Vercel Dashboard:**
   - Go to your project settings
   - Click "Domains"
   - Enter your custom domain
   - Follow the DNS configuration instructions

2. **Update Supabase:**
   - Add your custom domain to the Supabase "Redirect URLs" list

## Continuous Deployment

Your app is now set up for automatic deployments:

- **Every push to `main`** → Automatic production deployment
- **Pull requests** → Preview deployments with unique URLs
- **Instant rollback** → Click "Rollback" on any previous deployment

## Vercel Commands

After deployment, useful commands:

```bash
# Link local project to Vercel (optional)
npm i -g vercel
vercel link

# Pull environment variables to local
vercel env pull

# Deploy manually from CLI
vercel --prod
```

## Your Deployment URLs

After successful deployment, you'll have:

- **Production URL:** `https://motiv-[random].vercel.app`
- **Project Dashboard:** `https://vercel.com/[username]/motiv`

## Troubleshooting

### Build Fails

Check the Vercel build logs. Common issues:
- Missing environment variables
- npm dependencies issues (try deleting `node_modules` and `package-lock.json` locally, reinstalling, and pushing again)

### Authentication Doesn't Work

- Verify environment variables are set correctly in Vercel
- Check Supabase URL Configuration includes your Vercel domain
- Check browser console for CORS errors

### App Loads But Shows Errors

- Open browser DevTools → Console
- Look for API errors
- Verify Supabase project is running and accessible
- Check that your database tables and RLS policies are set up correctly

## Success Checklist

After deployment, verify:

- [ ] App loads at Vercel URL
- [ ] Sign up creates new account
- [ ] Login works with credentials
- [ ] Data persists after logout/login
- [ ] All features work (calendar, analytics, categories)
- [ ] No console errors
- [ ] Mobile responsive

## Next Steps

- Share your Vercel URL with users
- Monitor usage in Vercel Analytics (free tier includes basic analytics)
- Monitor database usage in Supabase dashboard
- Set up custom domain (optional)
- Enable Vercel speed insights (optional)

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
