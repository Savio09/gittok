# GitTok Quick Start Guide

Get GitTok running in 3 minutes! 🚀

## Option 1: Basic Setup (No API Keys)

Perfect for trying out the app immediately:

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser
# Visit http://localhost:3000
```

**That's it!** The app will use mock data and demo videos.

---

## Option 2: With GitHub API (Recommended)

Get real trending repositories with higher rate limits:

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cat > .env.local << EOF
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token_here
EOF

# 3. Start development server
npm run dev
```

**Get a GitHub token:**
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select `public_repo` scope
4. Copy and paste into `.env.local`

---

## Option 3: With AI Video Generation

Experience the full app with AI-generated videos:

### Step 1: Choose a Provider

**Easiest:** Nano Banana  
- Sign up: https://nanobananavideo.com
- Free tier available
- Good quality

**Best Quality:** Runway ML  
- Sign up: https://runwayml.com
- Paid plans from $12/month
- Professional results

### Step 2: Get API Key

1. Sign up for your chosen provider
2. Navigate to API settings
3. Generate API key
4. Copy the key

### Step 3: Configure

```bash
# Create .env.local with your keys
cat > .env.local << EOF
# GitHub API (optional but recommended)
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token

# Choose one video provider:
NEXT_PUBLIC_NANO_BANANA_API_KEY=your_nano_banana_key
# OR
NEXT_PUBLIC_RUNWAY_API_KEY=your_runway_key
# OR
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key
EOF
```

### Step 4: Run

```bash
npm run dev
```

Visit http://localhost:3000/video to see AI-generated videos!

---

## 🎬 Pages Overview

| URL | Description |
|-----|-------------|
| `/` | Trending repos (static cards) |
| `/video` | **AI video feed** ⭐ |
| `/following` | Repos from followed users |
| `/search` | Search repositories |
| `/language/python` | Python-specific repos |

---

## 🎮 Controls

### Keyboard
- `↓` or `→` - Next repo
- `↑` or `←` - Previous repo

### Mouse
- Scroll wheel - Navigate repos
- Click dots - Jump to repo

### Touch
- Swipe up - Next repo
- Swipe down - Previous repo

### Video Controls
- Play/Pause button - Control playback
- Mute/Unmute - Control audio
- Code icon - View AI prompt

---

## 🐛 Troubleshooting

### "Cannot find module 'react'"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "API rate limit exceeded"
Add a GitHub token to `.env.local` (see Option 2)

### Videos not loading
- Check API key in `.env.local`
- Restart dev server: `npm run dev`
- Check provider status page
- App will fallback to demo videos

### Port 3000 already in use
```bash
npm run dev -- -p 3001
# Then visit http://localhost:3001
```

---

## 📱 Testing on Mobile

### Local Network Access

1. Find your local IP:
```bash
# macOS/Linux
ifconfig | grep "inet "
# Look for 192.168.x.x

# Windows
ipconfig
# Look for IPv4 Address
```

2. Update `.env.local`:
```env
NEXTAUTH_URL=http://192.168.1.x:3000
```

3. Start server:
```bash
npm run dev
```

4. On mobile, visit:
```
http://192.168.1.x:3000
```

---

## 🚀 Deploy to Production

### Vercel (1-Click Deploy)

1. Push code to GitHub
2. Visit https://vercel.com
3. Import your repository
4. Add environment variables
5. Deploy!

### Manual Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 📚 Learn More

- [README.md](./README.md) - Full documentation
- [VIDEO_PROVIDERS.md](./VIDEO_PROVIDERS.md) - AI video setup
- [SETUP.md](./SETUP.md) - Detailed setup guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Technical details

---

## 🎉 Next Steps

1. ✅ Got it running? Try the video page: `/video`
2. 🔍 Search for your favorite language
3. 👥 Check out repos from followed users
4. 🎨 Explore the code and customize!

---

## 💡 Tips

- Start with mock data (Option 1)
- Add GitHub token for better experience (Option 2)
- Add video API when ready (Option 3)
- Check console for helpful logs
- All features work without API keys!

---

**Happy coding!** 🎉

Need help? Open an issue on GitHub!

