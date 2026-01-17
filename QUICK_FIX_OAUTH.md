# Quick Fix: GitHub OAuth Error

## The Error You're Seeing

```
client_id is required
```

**This means:** Your `.env.local` has empty values for `GITHUB_ID` and `GITHUB_SECRET`.

---

## 🚀 Quick Fix (5 Minutes)

### Step 1: Create GitHub OAuth App

1. **Go to GitHub:** https://github.com/settings/developers
2. **Click:** "OAuth Apps" (left sidebar)
3. **Click:** "New OAuth App" button
4. **Fill in the form:**

```
Application name: GitTok Local Dev
Homepage URL: http://localhost:3000
Authorization callback URL: http://localhost:3000/api/auth/callback/github
Application description: (optional) TikTok-style GitHub repo explorer
```

5. **Click:** "Register application"

### Step 2: Get Your Credentials

You'll see a screen with:

- **Client ID** - Copy this!
- **Client secrets** section - Click "Generate a new client secret"
- **Client Secret** - Copy this immediately (you can only see it once!)

### Step 3: Update .env.local

Open `/Users/fdeclan/Public/gittok/.env.local` and replace the empty lines:

**Before:**

```env
GITHUB_ID=
GITHUB_SECRET=
```

**After:**

```env
GITHUB_ID=Iv1.abc123def456
GITHUB_SECRET=abc123def456789xyz
```

(Use your actual values from GitHub!)

### Step 4: Restart the Server

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### Step 5: Test

1. Visit http://localhost:3000
2. Click "Sign in with GitHub"
3. Should redirect to GitHub OAuth page ✅
4. Authorize the app
5. Redirected back to your personalized feed! 🎉

---

## 🎯 Visual Guide

### What the GitHub OAuth App Settings Should Look Like:

```
┌─────────────────────────────────────────────┐
│ Application name: GitTok Local Dev         │
│ Homepage URL: http://localhost:3000        │
│ Callback URL: http://localhost:3000/api/  │
│               auth/callback/github          │
│                                             │
│ [Register application]                     │
└─────────────────────────────────────────────┘
```

### After Creating, You'll See:

```
┌─────────────────────────────────────────────┐
│ Client ID: Iv1.abc123def456                │ ← Copy this
│                                             │
│ Client secrets                              │
│ [Generate a new client secret]             │
│                                             │
│ Secret: abc123def456...                    │ ← Copy this
│ (Only shown once!)                          │
└─────────────────────────────────────────────┘
```

---

## ⚠️ Important Notes

1. **Client Secret is shown only once!**

   - Copy it immediately
   - If you lose it, generate a new one

2. **Don't share these credentials**

   - They give access to your OAuth app
   - Keep them in .env.local (already gitignored)

3. **Callback URL must be exact**

   - Must be: `http://localhost:3000/api/auth/callback/github`
   - No trailing slash
   - Must match exactly

4. **For production:**
   - Create a separate OAuth app
   - Use your production domain
   - Update callback URL accordingly

---

## 🐛 Troubleshooting

### Still getting "client_id is required"?

**Check:**

```bash
# View your .env.local
cat .env.local | grep GITHUB

# Should show:
# GITHUB_ID=Iv1.something
# GITHUB_SECRET=something_long
```

**If empty:**

- You didn't save .env.local
- Or you're editing the wrong file
- Make sure you're editing `/Users/fdeclan/Public/gittok/.env.local`

### "Restart server" - How?

```bash
# In your terminal where npm run dev is running:
# Press: Ctrl+C (or Cmd+C on Mac)
# Then run again:
npm run dev
```

### OAuth authorization fails?

**Check callback URL:**

- Must be exactly: `http://localhost:3000/api/auth/callback/github`
- In GitHub OAuth app settings
- Case-sensitive
- No typos

### "Application suspended" message?

- Your OAuth app might be flagged
- Check GitHub notifications
- Verify your account
- Try creating a new OAuth app

---

## 🎉 Once It Works

You'll be able to:

- ✅ Sign in with GitHub
- ✅ See your profile in header
- ✅ Access `/feed` - personalized feed
- ✅ View repos starred by people you follow
- ✅ Discover trending in your network
- ✅ Get social context on every repo

---

## 🔄 Alternative: Use Without OAuth (Temporary)

If you want to test the app while setting up OAuth, you can temporarily disable authentication:

**Option 1: Comment out GitHub provider**

Edit `app/api/auth/[...nextauth]/route.ts`:

```typescript
providers: [
  // GithubProvider({ ... }),  // Comment this out
],
```

**Option 2: Just browse without signing in**

The app works great without auth:

- Visit `/` for trending repos
- Visit `/video` for AI videos
- Visit `/search` for search
- You just won't have personalized feeds

---

## 📚 Need More Help?

- **GitHub OAuth Docs:** https://docs.github.com/en/developers/apps/building-oauth-apps
- **NextAuth Docs:** https://next-auth.js.org/providers/github
- **Video Tutorial:** Search YouTube for "github oauth app setup"

---

## ✅ Checklist

- [ ] Went to https://github.com/settings/developers
- [ ] Created new OAuth app
- [ ] Set callback URL correctly
- [ ] Copied Client ID
- [ ] Generated and copied Client Secret
- [ ] Pasted both into .env.local
- [ ] Saved .env.local file
- [ ] Restarted dev server
- [ ] Tested sign in
- [ ] Authentication working! 🎉

---

**This should take about 5 minutes total. You're almost there!** 🚀
