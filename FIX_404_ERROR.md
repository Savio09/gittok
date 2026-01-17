# Fixing the 404 OAuth Callback Error

## The Issue

You're getting a 404 error at:

```
http://localhost:3000/api/auth/callback/github?code=...
```

This means NextAuth's API route isn't being recognized by Next.js.

## ✅ Fixes Applied

I've made several changes to fix this:

### 1. Updated NextAuth Configuration

- Made it more explicit with `NextAuthOptions`
- Added debug mode for development
- Better error handling in callbacks

### 2. Cleared Build Cache

- Deleted `.next` folder
- This ensures Next.js picks up the new route

### 3. Added Middleware

- Created `middleware.ts` for NextAuth
- Helps with route matching

### 4. Created Test Route

- Added `/api/test` to verify API routes work

---

## 🚀 Steps to Fix

### Step 1: Stop the Server

Press `Ctrl+C` (or `Cmd+C`) in your terminal

### Step 2: Restart the Server

```bash
npm run dev
```

### Step 3: Test API Routes

Before trying OAuth, verify APIs work:

**Visit:** http://localhost:3000/api/test

**Should see:**

```json
{
  "message": "API routes are working!",
  "timestamp": "2024-12-31T..."
}
```

**If this works:** API routes are fine ✅

**If 404:** There's a deeper routing issue

### Step 4: Test NextAuth Route

Visit: http://localhost:3000/api/auth/signin

**Should see:** NextAuth sign-in page (or redirect)

**If 404:** NextAuth isn't loading

### Step 5: Try GitHub OAuth Again

1. Go to: http://localhost:3000
2. Click "Sign in with GitHub"
3. Authorize on GitHub
4. Should redirect back without 404 ✅

---

## 🐛 If Still Getting 404

### Check 1: Environment Variables

```bash
# Verify they're set
cat .env.local | grep GITHUB

# Should show:
# GITHUB_ID=Iv1.something
# GITHUB_SECRET=something_long
```

### Check 2: Verify File Structure

```bash
ls -la app/api/auth/\[...nextauth\]/

# Should show:
# route.ts
```

### Check 3: Check for TypeScript Errors

```bash
# Run build to check for errors
npm run build
```

### Check 4: Restart Completely

```bash
# Kill server completely
killall node

# Clear everything
rm -rf .next node_modules/.cache

# Restart
npm run dev
```

---

## 🔍 Alternative: Check Server Logs

When you click "Sign in with GitHub", check your terminal for errors:

**Look for:**

- `Error: ...` messages
- `ECONNREFUSED` (database connection issues)
- `P1001` (Prisma can't connect)
- TypeScript errors

**Common Issues:**

### Database Connection Error

```
Error: P1001: Can't reach database server
```

**Fix:**

```bash
# Test database connection
npx prisma db push
```

### Environment Variables Not Loaded

```
Error: client_id is required
```

**Fix:**

- Make sure `.env.local` exists
- Has `GITHUB_ID` and `GITHUB_SECRET`
- Restart server after changing

### Port Already in Use

```
Error: Port 3000 is already in use
```

**Fix:**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

---

## 🔧 Manual Route Test

Create a test file to verify routing works:

**Create:** `app/test-route/page.tsx`

```typescript
export default function TestPage() {
  return <div>Test route works!</div>;
}
```

**Visit:** http://localhost:3000/test-route

**If this 404s:** There's a fundamental Next.js routing issue

---

## 🎯 Common Causes & Solutions

### Cause 1: Next.js Cache Issue

**Symptoms:** Routes work, then suddenly 404

**Solution:**

```bash
rm -rf .next
npm run dev
```

### Cause 2: Wrong Next.js Version

**Symptoms:** Dynamic routes don't work

**Solution:**

```bash
# Check version
npm list next

# Should be 15.x
```

### Cause 3: File Naming Issue

**Symptoms:** Catch-all route not recognized

**Solution:**

- Verify folder name is `[...nextauth]` (with brackets!)
- File must be `route.ts` not `route.tsx`

### Cause 4: TypeScript Errors

**Symptoms:** Route compiles but doesn't work

**Solution:**

```bash
npx tsc --noEmit
```

### Cause 5: Environment Variables Not Available

**Symptoms:** `client_id is required` or similar

**Solution:**

- Restart dev server
- Check `.env.local` exists
- Verify values aren't empty

---

## 📊 Debugging Checklist

- [ ] Stopped and restarted dev server
- [ ] Cleared `.next` folder
- [ ] `/api/test` route works (returns JSON)
- [ ] `/api/auth/signin` loads (not 404)
- [ ] `.env.local` has `GITHUB_ID` and `GITHUB_SECRET`
- [ ] Database connected (ran `npx prisma db push`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Checked server logs for errors
- [ ] Tried different browser (clear cache)
- [ ] Checked GitHub OAuth callback URL is correct

---

## 🆘 Last Resort

If nothing works, try this nuclear option:

```bash
# 1. Stop server
Ctrl+C

# 2. Delete everything
rm -rf .next node_modules package-lock.json

# 3. Reinstall
npm install

# 4. Regenerate Prisma
npx prisma generate

# 5. Start fresh
npm run dev
```

---

## ✅ Expected Behavior

When OAuth works correctly:

1. Click "Sign in with GitHub"
2. Redirected to: `https://github.com/login/oauth/authorize?client_id=...`
3. Click "Authorize"
4. Redirected to: `http://localhost:3000/api/auth/callback/github?code=...`
5. NextAuth processes the callback
6. User created in database
7. Redirected to: `http://localhost:3000/feed`
8. See your personalized feed! 🎉

**Current status:** You're getting to step 4 but it's 404ing there

**This fix should:** Make step 4 work correctly

---

**Try restarting the server and test again!** 🚀

If still having issues, check the terminal output when you try to sign in.
