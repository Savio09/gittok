# Personalized Feeds - GitTok Social Features

## 🎯 Overview

GitTok now has **personalized, social feeds** based on your GitHub network! Instead of just showing generic trending repos, you get content from developers you actually follow.

---

## ✨ New Features

### 1. **For You Feed** (`/feed`) ⭐

Your personalized feed shows:

#### Content from Your Network
- **Repos starred** by people you follow
- **Projects created** by developers you follow  
- **Trending in network** - repos multiple followers starred
- **Recent activity** - what your network is working on

#### Smart Ranking
- Prioritizes repos with multiple interactions
- Balances popularity with recency
- Shows diverse content from your network

### 2. **Authenticated Experience**

When signed in with GitHub:
- ✅ Personalized "For You" feed
- ✅ Network activity tracking
- ✅ Social context ("@username starred this")
- ✅ Better recommendations
- ✅ Your profile in header

### 3. **Guest Experience**

Without signing in:
- ✅ Generic trending feed (still awesome!)
- ✅ All AI video features
- ✅ Search and explore
- ✅ No limitations on viewing

---

## 🚀 Setup Instructions

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   ```
   Application name: GitTok Local
   Homepage URL: http://localhost:3000
   Authorization callback URL: http://localhost:3000/api/auth/callback/github
   ```
4. Click **"Register application"**
5. Copy your **Client ID**
6. Generate a **Client Secret** and copy it

### Step 2: Update .env.local

Add your GitHub OAuth credentials:

```env
# Google Veo API Key
NEXT_PUBLIC_GOOGLE_VEO_API_KEY=AIzaSyAndNhTX8PAhxdECBLapEfoVzoO-E0_pko

# GitHub OAuth (for personalized feeds)
GITHUB_ID=your_github_client_id_here
GITHUB_SECRET=your_github_client_secret_here

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### Step 3: Restart Server

```bash
npm run dev
```

### Step 4: Sign In

1. Visit http://localhost:3000
2. Click **"Sign in with GitHub"** in the header
3. Authorize the app
4. Redirected to your personalized feed!

---

## 📱 Pages & Features

### Trending (`/`)
**Public - No Auth Required**
- Generic trending repos
- Updated hourly
- Still has AI videos
- Great for discovery

### For You (`/feed`) ⭐
**Auth Required - Personalized**
- Content from people you follow
- Network activity
- Smart recommendations
- Social context

**Shows:**
```
┌─────────────────────────────────┐
│ @kentcdodds starred this        │  ← Social context
│                                 │
│ [AI Generated Video]            │  ← Video content
│                                 │
│ Repository: remix               │
│ Description: Build better...    │
│                                 │
│ ⭐ 23k  🔱 2k                   │
│                                 │
│ 3 people you follow starred    │  ← Network signal
└─────────────────────────────────┘
```

### Videos (`/video`)
**Public - AI Generated**
- Trending repos with AI videos
- No auth required
- Generic content

### Search (`/search`)
**Public - Advanced Search**
- Find any repo
- Advanced filters
- No auth required

---

## 🎨 Feed Types

### 1. Personalized Feed
```typescript
getPersonalizedFeed(accessToken, username, limit)
```

Returns:
- Repos starred by people you follow
- Projects created by your network
- Sorted by stars and relevance

### 2. Network Activity Feed
```typescript
getNetworkActivityFeed(accessToken, limit)
```

Returns:
- Real-time activity from your network
- Stars, forks, creates
- Chronological order

### 3. Trending in Network
```typescript
getTrendingInNetwork(accessToken, username, limit)
```

Returns:
- Repos multiple followers starred
- Network consensus picks
- Highly relevant content

### 4. Hybrid Feed (Default)
```typescript
getHybridFeed(accessToken, username, limit)
```

Returns:
- Mix of all above
- Smart ranking
- Best personalized experience

---

## 🔐 Permissions & Privacy

### What We Access
- ✅ Your public GitHub profile
- ✅ People you follow
- ✅ Your public stars
- ✅ Public repos from your network

### What We DON'T Access
- ❌ Private repositories
- ❌ Write access to anything
- ❌ Your email (unless public)
- ❌ Sensitive data

### Data Storage
- ❌ **We don't store any data**
- ✅ All fetched in real-time
- ✅ No database, no tracking
- ✅ Session-only authentication

---

## 💡 How It Works

### Authentication Flow
```
1. User clicks "Sign in with GitHub"
2. GitHub OAuth popup appears
3. User authorizes read-only access
4. Session created with access token
5. Token used to fetch network data
6. Personalized feed generated
```

### Feed Generation Flow
```
1. Get list of people you follow (max 50)
2. For each person:
   - Fetch repos they've starred (5 most recent)
   - Fetch repos they've created (3 most recent)
   - Track common repos (multiple people starred)
3. Aggregate and deduplicate
4. Rank by:
   - Number of followers who starred it
   - Total star count
   - Recency
5. Generate AI videos for top repos
6. Display in TikTok feed
```

---

## 🎯 Use Cases

### Discover What Your Heroes Use
```
Following Kent C. Dodds, Dan Abramov, Sarah Drasner?
See what tools they're actually using and starring!
```

### Find Trending in Your Community
```
If 5 people you follow starred the same repo,
it's probably worth checking out!
```

### Stay Updated
```
See new projects from developers you admire
Get notified about hot repos in your network
```

### Learn & Grow
```
Discover tools your network finds valuable
Find libraries your peers are using
```

---

## 🚀 Example Scenarios

### Scenario 1: React Developer

**You follow:** Dan Abramov, Kent C. Dodds, Ryan Florence

**Your feed shows:**
- New React libraries they starred
- Performance tools they're using
- UI frameworks they created
- State management solutions trending in React community

### Scenario 2: Rust Developer

**You follow:** Steve Klabnik, Carol Nichols, Niko Matsakis

**Your feed shows:**
- New Rust crates they starred
- Systems programming tools
- Performance benchmarks
- Rust learning resources

### Scenario 3: Full-Stack Developer

**You follow:** Mix of frontend, backend, DevOps folks

**Your feed shows:**
- Diverse toolkit
- Different perspectives
- Cross-domain solutions
- Trending across multiple communities

---

## 🔧 Customization

### Change Feed Algorithm

Edit `lib/personalizedFeed.ts`:

```typescript
// Prioritize by different factors
uniqueItems.sort((a, b) => {
  // More weight to recency
  const timeWeight = 0.7;
  const starsWeight = 0.3;
  
  const scoreA = (timeScore(a) * timeWeight) + (a.repo.stargazers_count * starsWeight);
  const scoreB = (timeScore(b) * timeWeight) + (b.repo.stargazers_count * starsWeight);
  
  return scoreB - scoreA;
});
```

### Add More Feed Types

```typescript
// Trending languages in your network
export async function getTrendingLanguages(accessToken: string) {
  // Implementation
}

// Most active repos in network
export async function getMostActiveRepos(accessToken: string) {
  // Implementation  
}
```

---

## 📊 Benefits Over Generic Feed

| Feature | Generic Feed | Personalized Feed |
|---------|-------------|-------------------|
| Relevance | Medium | Very High |
| Discovery | Good | Excellent |
| Serendipity | High | Medium |
| Quality Signal | Star count | Network consensus |
| Engagement | Good | Better |
| Learning | Generic | Targeted |

---

## 🎬 Combined with AI Videos

The magic happens when you combine:
1. **Personalized content** (relevant to you)
2. **AI-generated videos** (engaging format)
3. **TikTok-style UI** (addictive experience)

Result: **The most engaging way to discover code!**

---

## 🐛 Troubleshooting

### "Sign in required" error

- Check GitHub OAuth app is created
- Verify GITHUB_ID and GITHUB_SECRET in .env.local
- Ensure callback URL is correct
- Restart dev server

### Empty feed after signing in

- You might not follow anyone yet
- Go to GitHub and follow developers
- Wait a few minutes and refresh

### "Network error"

- Check internet connection
- Verify GitHub API isn't rate limited
- Check access token is valid

### Videos not generating

- This is separate from personalized feed
- Check Google Veo API key
- See VIDEO_PROVIDERS.md

---

## 📚 API Reference

### `getPersonalizedFeed(accessToken, username, limit)`

Generates personalized feed from network.

**Returns:** Array of FeedItem with repo + social context

### `getNetworkActivityFeed(accessToken, limit)`

Gets real-time activity from followed users.

**Returns:** Chronological feed of stars/forks/creates

### `getTrendingInNetwork(accessToken, username, limit)`

Finds repos multiple followers starred.

**Returns:** Consensus picks from network

### `getHybridFeed(accessToken, username, limit)`

Mix of all feed types, intelligently ranked.

**Returns:** Best personalized experience

---

## 🎉 Summary

GitTok is now a **social discovery platform**:

✅ **Personalized feeds** based on who you follow  
✅ **Network activity** tracking  
✅ **AI-generated videos** for every repo  
✅ **TikTok-style** addictive UX  
✅ **Privacy-focused** (no data storage)  
✅ **Works without auth** (guest mode)  

**The best way to discover GitHub repos** is now personalized to YOUR network!

---

Ready to try it? Set up GitHub OAuth and visit `/feed`! 🚀

