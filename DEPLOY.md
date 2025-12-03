# Deployment Guide

## Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

### Step 1: Prepare Your Code

1. **Commit all changes:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   ```

2. **Push to GitHub:**
   ```bash
   # If you haven't created a GitHub repo yet:
   # 1. Go to https://github.com/new
   # 2. Create a new repository
   # 3. Then run:

   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to [Vercel](https://vercel.com/)**
   - Sign up/Login with GitHub

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)

4. **Set Environment Variables:**

   Click "Environment Variables" and add:

   **Required:**
   ```
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:xxxxxxxxxxxxx
   ```

   **Optional:**
   ```
   NEXTAUTH_URL=https://your-project.vercel.app
   NEXTAUTH_SECRET=your-secret-key-here
   ```

   **Important:** Set these for all environments (Production, Preview, Development)

5. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (2-3 minutes)
   - Your app will be live at `https://your-project.vercel.app`

### Step 3: Update Firebase Security Rules

After deployment, update your Firestore security rules for production:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Firestore Database → Rules
4. Update rules (add authentication later):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /entries/{entryId} {
      // For now, allow read/write (add auth later)
      allow read, write: if true;
    }
  }
}
```

### Step 4: Verify Deployment

- [ ] Home page loads
- [ ] Write diary page works
- [ ] AI correction works
- [ ] Diary saving works
- [ ] Diary list displays

## Quick Deploy with Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow the prompts
```

## Environment Variables Checklist

Before deploying, make sure you have:

- [ ] `OPENAI_API_KEY` - Your OpenAI API key
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` - From Firebase Console
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - From Firebase Console
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - From Firebase Console
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - From Firebase Console
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - From Firebase Console
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` - From Firebase Console

## Troubleshooting

### Build Fails

- Check Node.js version (Vercel uses latest LTS automatically)
- Verify all environment variables are set
- Check build logs in Vercel dashboard

### Runtime Errors

- Check browser console
- Check Vercel function logs
- Verify Firebase security rules

### API Errors

- Verify OpenAI API key is correct
- Check OpenAI account billing/quota
- Verify Firebase environment variables

## Post-Deployment

1. **Update NEXTAUTH_URL:**
   - After first deployment, update `NEXTAUTH_URL` to your Vercel domain
   - Redeploy or update environment variable

2. **Custom Domain (Optional):**
   - Go to Project Settings → Domains
   - Add your custom domain

3. **Monitor:**
   - Check Vercel Analytics
   - Monitor API usage
   - Set up error tracking (optional)
