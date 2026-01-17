# Clerk Authentication Setup

Clerk is **much simpler** than NextAuth - it just works! 🎉

## 🚀 Quick Setup (3 minutes)

### Step 1: Create Clerk Account

1. Go to **https://clerk.com**
2. Click **"Start building for free"**
3. Sign up with GitHub or email

### Step 2: Create Application

1. Click **"Create application"**
2. Name it: **"GitTok"**
3. Select **"GitHub"** as a sign-in option ✅
4. Click **"Create application"**

### Step 3: Get API Keys

After creating the app, you'll see:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

**Copy both keys!**

### Step 4: Update .env.local

Open `/Users/fdeclan/Public/gittok/.env.local` and add your keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_key_here
```

### Step 5: Start the App

```bash
npm run dev
```

### Step 6: Test

1. Visit http://localhost:3000
2. Click **"Sign in"** in the header
3. A beautiful modal appears! ✨
4. Click **"Continue with GitHub"**
5. Authorize
6. **You're signed in!** 🎉

---

## 📋 What You'll See in Clerk

### Clerk Dashboard Features
- ✅ User management
- ✅ Session management  
- ✅ Analytics
- ✅ Customization
- ✅ Webhooks
- ✅ Organizations (optional)

### Sign-In Options You Can Enable
- GitHub ✅ (already enabled)
- Google
- Email/Password
- Phone number
- Magic links
- And more!

---

## 🎨 Customization

### Already Configured

I've set up:
- Dark theme to match GitTok
- Modal sign-in (appears without leaving page)
- Custom sign-in/sign-up pages at `/sign-in` and `/sign-up`
- Protected routes (e.g., `/feed` requires auth)

### Change Theme Colors

In Clerk Dashboard:
1. Go to **Customization** → **Theme**
2. Choose colors that match GitTok
3. Save

---

## 🔒 Protected Routes

I've configured these routes to require authentication:

- `/feed` - Personalized feed (requires sign in)

You can add more in `middleware.ts`:

```typescript
const isProtectedRoute = createRouteMatcher([
  '/feed(.*)',
  '/settings(.*)',  // Add more here
])
```

---

## 📊 How It Works

### With Clerk

```
User clicks "Sign in"
     ↓
Clerk modal opens (beautiful UI)
     ↓
User clicks "GitHub"
     ↓
GitHub OAuth (handled by Clerk)
     ↓
User created in Clerk
     ↓
Session created automatically
     ↓
User redirected to /feed
     ↓
Done! ✅
```

### No Database Needed for Auth!

Clerk handles all user storage. Your Neon database is still available for other app data.

---

## 🎯 Benefits Over NextAuth

| Feature | NextAuth | Clerk |
|---------|----------|-------|
| Setup time | Hours | Minutes |
| Database required | Yes | No |
| UI components | Build yourself | Beautiful built-in |
| User management | Build yourself | Dashboard included |
| OAuth setup | Complex | One click |
| Docs | Good | Excellent |
| Support | Community | Professional |

---

## 🐛 Troubleshooting

### Error: "Clerk keys not found"

```bash
# Check keys are set
cat .env.local | grep CLERK

# Should show:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
# CLERK_SECRET_KEY=sk_test_...
```

### Error: "Invalid publishable key"

- Make sure you copied the **full key** including `pk_test_`
- No extra spaces
- Restart server after changing

### Sign-in modal doesn't appear

- Check browser console for errors
- Clear browser cache
- Make sure server is running

### GitHub OAuth not working

In Clerk Dashboard:
1. Go to **User & Authentication** → **Social Connections**
2. Click **GitHub**
3. Make sure it's **Enabled** ✅
4. (Optional) Add your own GitHub OAuth credentials for production

---

## 🌐 Production Setup

For production:

1. **Create production instance** in Clerk
2. **Update keys** in Vercel/your host
3. **Add domain** in Clerk dashboard
4. **Use production keys** (start with `pk_live_`)

---

## 📚 Resources

- **Clerk Docs:** https://clerk.com/docs
- **Next.js Guide:** https://clerk.com/docs/quickstarts/nextjs
- **Customization:** https://clerk.com/docs/customization

---

## ✅ Checklist

- [ ] Created Clerk account
- [ ] Created application in Clerk
- [ ] Enabled GitHub sign-in
- [ ] Copied Publishable Key
- [ ] Copied Secret Key  
- [ ] Added both to .env.local
- [ ] Restarted dev server
- [ ] Tested sign-in
- [ ] It works! 🎉

---

**Clerk is seriously that easy.** Once you add the keys, authentication just works!

