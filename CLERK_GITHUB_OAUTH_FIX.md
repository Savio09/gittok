# Fix: GitHub OAuth Token for Personalized Feed

This document explains how to configure Clerk to properly retrieve GitHub OAuth tokens for the personalized feed feature.

## ⚠️ The Problem

When you sign in with GitHub via Clerk, the personalized feed falls back to "Trending" repos instead of showing your personalized feed. This happens because:

1. Clerk needs **explicit configuration** to store and return OAuth access tokens
2. GitHub OAuth needs **specific scopes** to access your followers, starred repos, and activity

## ✅ The Solution

### Step 1: Configure GitHub OAuth in Clerk Dashboard

1. **Go to Clerk Dashboard**: https://dashboard.clerk.com
2. **Select your application** (GitTok)
3. Navigate to: **User & Authentication** → **Social Connections**
4. Click on **GitHub**

### Step 2: Enable Custom Credentials (Required for Token Access)

By default, Clerk uses its own GitHub OAuth app. To get access tokens, you need to:

1. **Toggle ON**: "Use custom credentials"
2. Create a GitHub OAuth App (see below)
3. Enter your Client ID and Client Secret

### Step 3: Create GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in the details:

```
Application name: GitTok
Homepage URL: http://localhost:3000 (or your production URL)
Authorization callback URL: https://clerk.YOUR_CLERK_SUBDOMAIN.accounts.dev/v1/oauth_callback
```

**Important**: Get the correct callback URL from Clerk Dashboard → GitHub settings

4. Click **"Register application"**
5. Copy the **Client ID**
6. Generate and copy a **Client Secret**

### Step 4: Configure OAuth Scopes

In Clerk Dashboard → GitHub settings, add these scopes:

```
read:user
user:follow
public_repo
```

**Why these scopes?**
- `read:user`: Access basic profile info
- `user:follow`: Access list of people you follow
- `public_repo`: Access public repository data (stars, activity)

### Step 5: Enable "Fetch OAuth access tokens"

In Clerk Dashboard → GitHub settings:
- Toggle ON: **"Enable OAuth access tokens"**
- This allows your app to retrieve the GitHub access token

### Step 6: Re-authenticate

After configuring:
1. Sign out of GitTok
2. Sign back in with GitHub
3. **Important**: You may need to re-authorize the app to grant new scopes
4. Visit `/feed` to see your personalized feed

## 🔍 Debugging

### Check Server Logs

When the personalized feed API runs, check your terminal for these logs:

```
Auth result - userId: user_xxxxx
Clerk user found: user_xxxxx
External accounts: [{ provider: 'oauth_github', username: 'your-github-username' }]
GitHub username: your-github-username
Attempting to get OAuth token for user: user_xxxxx
OAuth tokens response: { hasData: true, dataLength: 1, firstToken: { hasToken: true, tokenLength: 40, scopes: ['read:user', 'user:follow'] } }
```

### Common Issues

#### "No access token found"
- Clerk isn't configured to return OAuth tokens
- Enable "Use custom credentials" and "Enable OAuth access tokens"

#### "Token length: 0" or "hasToken: false"
- Re-authenticate after enabling custom credentials
- Check that OAuth scopes are added in Clerk

#### "401 Unauthorized" from GitHub API
- Token may be expired or revoked
- Re-authenticate with GitHub

#### "403 Forbidden" from GitHub API
- Rate limited OR insufficient scopes
- Add the required scopes in Clerk

### Test the API Directly

```bash
# In browser console when signed in:
fetch('/api/feed/personalized').then(r => r.json()).then(console.log)

# Check for:
# - source: "personalized" (success)
# - source: "trending" with message (problem)
# - debug object with hasToken, hasUsername
```

## 📋 Complete Clerk Configuration Checklist

- [ ] Clerk Dashboard → GitHub → "Use custom credentials" ON
- [ ] Created GitHub OAuth App with correct callback URL
- [ ] Entered Client ID and Secret in Clerk
- [ ] Added scopes: `read:user`, `user:follow`, `public_repo`
- [ ] "Enable OAuth access tokens" is ON
- [ ] Signed out and signed back in after configuration
- [ ] Re-authorized the GitHub OAuth app (if prompted)

## 🎯 Expected Result

After proper configuration:
1. Sign in with GitHub
2. Go to `/feed`
3. See "For You (@your-username)" badge instead of "Trending"
4. See repos starred/created by people you follow

## 📚 Additional Resources

- [Clerk Social Connections Docs](https://clerk.com/docs/authentication/social-connections/github)
- [Clerk OAuth Access Tokens](https://clerk.com/docs/users/oauth-access-tokens)
- [GitHub OAuth Scopes](https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps)
