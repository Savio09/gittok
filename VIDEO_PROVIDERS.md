# AI Video Generation Providers

GitTok supports multiple AI video generation providers to create stunning visual content from GitHub repository data. This guide explains how to set up and use each provider.

## 🎬 Supported Providers

1. **Mock** (Default) - Free demo videos for development
2. **Runway ML Gen-4** - High-quality AI video generation
3. **Nano Banana** - Easy-to-use video generation
4. **OpenAI Sora** - Advanced text-to-video
5. **Google Veo** - Next-gen video generation

---

## Mock Provider (Default)

**Cost**: Free  
**Setup Required**: None  
**Best For**: Development, testing, demos

The mock provider uses placeholder videos and doesn't require any API keys. It's perfect for:
- Local development
- Testing the UI
- Demonstrating the concept
- When you don't have API access

**Usage:**
```typescript
// Already configured by default
// No setup needed!
```

---

## Runway ML Gen-4

**Website**: [runwayml.com](https://runwayml.com)  
**Cost**: Paid plans starting at $12/month  
**Quality**: High-quality, realistic videos  
**Generation Time**: 30-60 seconds per video

### Features
- ✅ Text-to-video generation
- ✅ Image-to-video capabilities
- ✅ Up to 10-second clips
- ✅ 1080p resolution
- ✅ API access

### Setup Instructions

1. **Sign up for Runway**
   - Visit [runwayml.com](https://runwayml.com)
   - Create an account
   - Subscribe to a plan with API access

2. **Get your API key**
   - Go to Account Settings → API Keys
   - Generate a new API key
   - Copy the key

3. **Configure GitTok**
   ```env
   # Add to .env.local
   NEXT_PUBLIC_RUNWAY_API_KEY=your_runway_api_key_here
   ```

4. **Update the provider**
   ```typescript
   // In your component or config
   const provider = "runway";
   ```

### API Limits
- **Free tier**: Limited credits
- **Paid plans**: 125-625 credits/month
- **Credit cost**: ~5 credits per video

### Example Generated Prompts
```
"Create a cinematic tech showcase video featuring 'React', 
a JavaScript project. Show abstract code flowing on screens, 
futuristic UI elements, and digital particles..."
```

---

## Nano Banana

**Website**: [nanobananavideo.com](https://nanobananavideo.com)  
**Cost**: Free tier available, Pro from $20/month  
**Quality**: Studio-quality videos  
**Generation Time**: 1-2 minutes per video

### Features
- ✅ Text-to-video
- ✅ Image-to-video
- ✅ Character consistency
- ✅ Multiple scenes
- ✅ Commercial rights
- ✅ API access (Pro plan)

### Setup Instructions

1. **Sign up for Nano Banana**
   - Visit [nanobananavideo.com](https://nanobananavideo.com)
   - Create a free account or subscribe to Pro

2. **Get API access**
   - Upgrade to Pro plan for API access
   - Navigate to API section in dashboard
   - Generate API key

3. **Configure GitTok**
   ```env
   # Add to .env.local
   NEXT_PUBLIC_NANO_BANANA_API_KEY=your_nano_banana_key_here
   ```

4. **Update the provider**
   ```typescript
   const provider = "nano-banana";
   ```

### Usage Limits
- **Free tier**: 10-20 generations/day
- **Pro tier**: 100-500 generations/day
- **Video length**: Up to 15 seconds
- **Resolution**: 1080p

### Tips for Best Results
- Keep prompts clear and descriptive
- Specify "cinematic", "tech", "modern" style
- Include color schemes (dark theme, neon accents)
- Request specific aspect ratios (9:16 for mobile)

---

## OpenAI Sora

**Website**: [openai.com/sora](https://openai.com/sora)  
**Cost**: ChatGPT Plus ($20/month) + Sora access  
**Quality**: Photorealistic, high-quality  
**Generation Time**: 1-3 minutes per video

### Features
- ✅ Advanced text-to-video
- ✅ Up to 1-minute videos
- ✅ 1080p resolution
- ✅ Multiple aspect ratios
- ✅ Physics understanding

### Setup Instructions

1. **Get Sora access**
   - Subscribe to ChatGPT Plus
   - Request Sora access (may be waitlisted)
   - Wait for approval email

2. **Get your API key**
   - Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key

3. **Configure GitTok**
   ```env
   # Add to .env.local
   NEXT_PUBLIC_OPENAI_API_KEY=sk-your_openai_key_here
   ```

4. **Update the provider**
   ```typescript
   const provider = "sora";
   ```

### API Limits
- **Rate limits**: 50 requests/day (initial)
- **Video length**: Up to 20 seconds (API)
- **Resolution**: 1080p standard, 4K available
- **Cost**: ~$0.50-1.00 per video (estimated)

### Important Notes
⚠️ Sora API is in limited beta as of December 2024  
⚠️ Strict content policies apply  
⚠️ Cannot generate videos with identifiable people  

---

## Google Veo

**Website**: [Google AI](https://deepmind.google/technologies/veo)  
**Cost**: TBD (Currently in preview)  
**Quality**: High-resolution, up to 4K  
**Generation Time**: Variable

### Features
- ✅ Text-to-video
- ✅ Up to 4K resolution
- ✅ Audio generation
- ✅ Advanced physics
- ✅ Long videos (60+ seconds)

### Setup Instructions

1. **Join waitlist**
   - Visit Google Veo preview page
   - Sign up for early access
   - Wait for approval

2. **Get API credentials**
   - Access Google Cloud Console
   - Enable Veo API
   - Create service account credentials

3. **Configure GitTok**
   ```env
   # Add to .env.local
   NEXT_PUBLIC_GOOGLE_VEO_KEY=your_veo_key_here
   ```

### Current Status
⏳ **Limited Preview** - Not yet publicly available  
📧 Waitlist required  
🔮 Full release date TBD  

---

## Choosing a Provider

### For Development
✅ **Mock** - Free, instant, no setup

### For Production (Budget-Friendly)
✅ **Nano Banana** - Good balance of quality and cost

### For Production (Best Quality)
✅ **Runway ML** - Professional results, reliable API

### For Future-Proof
✅ **Sora/Veo** - Cutting-edge, but limited access

---

## Cost Comparison

| Provider | Free Tier | Paid Plans | Per Video Cost | Quality |
|----------|-----------|------------|----------------|---------|
| Mock | ✅ Unlimited | N/A | $0 | Demo |
| Nano Banana | 10-20/day | $20+/month | ~$0.10-0.40 | High |
| Runway ML | Limited | $12+/month | ~$0.25-0.50 | Very High |
| OpenAI Sora | ❌ | $20/month + usage | ~$0.50-1.00 | Excellent |
| Google Veo | ⏳ Preview | TBD | TBD | Excellent |

---

## Integration Example

### Basic Usage

```typescript
import { generateRepoVideo } from "@/lib/videoGeneration";

// Generate a video for a repository
const video = await generateRepoVideo(repo, {
  provider: "nano-banana",
  duration: 15,
  aspectRatio: "9:16",
  quality: "hd",
});

console.log("Video URL:", video.url);
```

### Batch Generation

```typescript
import { batchGenerateVideos } from "@/lib/videoGeneration";

// Generate videos for multiple repos
const videos = await batchGenerateVideos(repos, {
  provider: "runway",
  duration: 10,
  aspectRatio: "9:16",
});

videos.forEach((video, repoId) => {
  console.log(`Video for ${repoId}: ${video.url}`);
});
```

---

## Troubleshooting

### "API key not found"
Make sure you've added the key to `.env.local` and restarted the dev server:
```bash
npm run dev
```

### "Rate limit exceeded"
- Check your provider's usage dashboard
- Reduce batch size
- Add delays between requests
- Upgrade to higher tier

### "Video generation failed"
The app will automatically fall back to mock videos:
- Check your API key is valid
- Verify you have credits/usage remaining
- Check provider status page

### "Videos not loading"
- Check browser console for errors
- Verify video URLs are accessible
- Check CORS settings
- Try a different provider

---

## Best Practices

### 1. Start with Mock
Always test your implementation with the mock provider first.

### 2. Cache Videos
Consider caching generated videos to avoid regenerating:
```typescript
// Store in database or CDN
const cachedVideo = await getCachedVideo(repoId);
if (!cachedVideo) {
  const video = await generateRepoVideo(repo);
  await cacheVideo(repoId, video);
}
```

### 3. Handle Failures Gracefully
Always have a fallback:
```typescript
try {
  return await generateWithProvider(repo, provider);
} catch (error) {
  console.error(error);
  return generateMockVideo(repo);
}
```

### 4. Monitor Costs
- Set up billing alerts
- Track API usage
- Implement rate limiting
- Use free tiers for development

### 5. Optimize Prompts
- Test different prompt styles
- Keep prompts focused
- Specify technical details
- Request appropriate durations

---

## Future Enhancements

- [ ] Video caching system
- [ ] Provider selection UI
- [ ] Real-time generation progress
- [ ] Video quality settings
- [ ] Custom prompt templates
- [ ] A/B testing for prompts
- [ ] Video analytics

---

## Resources

- [Runway ML API Docs](https://docs.runwayml.com)
- [OpenAI Sora Guide](https://openai.com/sora)
- [Google Veo Research](https://deepmind.google/technologies/veo)
- [AI Video Generation Best Practices](https://www.youtube.com/results?search_query=ai+video+generation+tutorial)

---

**Need help?** Open an issue on GitHub or check the main README.md!

