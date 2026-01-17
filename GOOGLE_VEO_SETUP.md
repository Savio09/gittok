# Google Veo Setup Guide

You now have Google Veo integrated into GitTok! 🎬

## ✅ What's Already Done

1. ✅ Google Veo API implementation added
2. ✅ API key received: `AIzaSyAndNhTX8PAhxdECBLapEfoVzoO-E0_pko`
3. ✅ Video page configured to use Veo
4. ✅ Settings page created for easy provider switching

## 🚀 Quick Setup

### Step 1: Create Environment File

Create a file named `.env.local` in the project root:

```bash
cd /Users/fdeclan/Public/gittok
touch .env.local
```

### Step 2: Add the API Key

Open `.env.local` and add:

```env
# Google Veo API Key
NEXT_PUBLIC_GOOGLE_VEO_API_KEY=AIzaSyAndNhTX8PAhxdECBLapEfoVzoO-E0_pko

# Optional: GitHub API for better rate limits
NEXT_PUBLIC_GITHUB_TOKEN=your_github_token_here
```

### Step 3: Run the Application

```bash
npm run dev
```

### Step 4: Visit the Video Page

Open your browser and go to:
```
http://localhost:3000/video
```

Watch as GitTok generates AI videos for GitHub repos using Google Veo! 🎉

---

## 🎬 How It Works

### Video Generation Flow

```
1. Fetch trending GitHub repos
2. Extract repo data (name, language, stars, description)
3. Generate cinematic prompt:
   "Create a cinematic tech showcase video featuring 'react', 
    a JavaScript project with 145k stars..."
4. Send to Google Veo API
5. Receive generated video
6. Display in TikTok-style feed
```

### Example Prompt Generated

For the React repository:
```
Generate a dynamic video presentation for the GitHub project "react". 
Show a modern developer workspace with multiple screens displaying 
JavaScript code. Animate code compiling, terminal commands executing, 
and graphs showing growth. Feature holographic UI elements showing 
145,000 stars and 23,000 forks. A JavaScript library for building 
user interfaces. Style: Futuristic, professional, high-tech aesthetic.
```

---

## ⚙️ Settings Page

Visit http://localhost:3000/settings to:

- ✅ Switch between video providers (Veo, Runway, Nano Banana, Sora, Mock)
- ✅ See provider status and features
- ✅ View API configuration examples
- ✅ Save your preferences

---

## 🎨 Features Available

### On Video Page (`/video`)

1. **Auto-playing videos** - Videos start when in view
2. **Play/Pause control** - Click to control playback
3. **Mute/Unmute** - Toggle audio on/off
4. **View AI Prompt** - See the prompt used to generate each video
5. **Repository info overlay** - Name, description, stats
6. **Share button** - Share repos easily
7. **Navigation**:
   - Swipe up/down (mobile)
   - Scroll wheel (desktop)
   - Arrow keys (keyboard)
   - Navigation dots (click to jump)

---

## 🔧 Troubleshooting

### Videos Not Generating

**Check API Key:**
```bash
# Make sure .env.local exists and has the key
cat .env.local
```

**Restart Dev Server:**
```bash
# Kill the current server (Ctrl+C)
npm run dev
```

### "Mock Video" Shows Instead

The app falls back to mock videos if:
- API key is not found
- API request fails
- Rate limit exceeded
- Network error

This is intentional - the app always works!

### Check Console

Open browser console (F12) to see:
- API requests
- Generation status
- Error messages
- Fallback notifications

---

## 💡 Testing Different Providers

### Switch to Mock (No API needed)
```typescript
// In app/video/page.tsx
const [provider] = useState<VideoProvider>("mock");
```

### Switch to Nano Banana
```typescript
const [provider] = useState<VideoProvider>("nano-banana");
```
Add API key to `.env.local`:
```env
NEXT_PUBLIC_NANO_BANANA_API_KEY=your_key
```

### Switch to Runway ML
```typescript
const [provider] = useState<VideoProvider>("runway");
```
Add API key to `.env.local`:
```env
NEXT_PUBLIC_RUNWAY_API_KEY=your_key
```

Or use the Settings page at `/settings`!

---

## 📊 API Limits & Costs

### Google Veo
- **Rate Limits**: Varies by plan
- **Cost**: Check Google AI pricing
- **Quality**: Up to 4K
- **Duration**: 15-60 seconds
- **Features**: Audio generation, advanced physics

### Best Practices
1. **Start with mock** - Test the UI first
2. **Cache videos** - Store generated videos (future feature)
3. **Batch carefully** - Don't generate too many at once
4. **Monitor usage** - Check your Google Cloud console
5. **Handle errors** - App has automatic fallbacks

---

## 🎯 What to Try

### 1. Basic Video Generation
```bash
npm run dev
# Visit http://localhost:3000/video
```

### 2. Search + Generate
```bash
# Visit http://localhost:3000/search
# Search for: language:rust stars:>1000
# Then switch to video view (future feature)
```

### 3. Following Network + Videos
```bash
# Visit http://localhost:3000/following
# Enter a GitHub username
# See videos of forked repos (future feature)
```

### 4. Change Provider
```bash
# Visit http://localhost:3000/settings
# Select different provider
# Save and go to /video
```

---

## 🔐 Security Notes

⚠️ **Important**: Your API key is now in this README. For security:

1. **Never commit `.env.local`** - It's in .gitignore
2. **Regenerate key** if exposed publicly
3. **Use environment variables** in production
4. **Set usage limits** in Google Cloud Console

### Rotate Your Key

If you need to change the key:
1. Go to Google Cloud Console
2. Generate new API key
3. Update `.env.local`
4. Restart server

---

## 📚 Additional Resources

- [VIDEO_PROVIDERS.md](./VIDEO_PROVIDERS.md) - All provider details
- [QUICKSTART.md](./QUICKSTART.md) - 3-minute setup
- [README.md](./README.md) - Full documentation
- [Google Veo Documentation](https://deepmind.google/technologies/veo)

---

## 🎉 You're All Set!

Your GitTok app is now configured with Google Veo! 

**Next Steps:**
1. Run `npm run dev`
2. Visit http://localhost:3000/video
3. Watch AI-generated videos of GitHub repos
4. Explore different providers in Settings
5. Customize and enjoy!

---

**Need help?** Check the console for detailed logs or refer to the documentation files.

**Happy exploring!** 🚀

