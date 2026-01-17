# GitTok 🎵

A TikTok-style web application for discovering and exploring trending GitHub repositories with an immersive, swipeable interface.

![GitTok](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)

## ✨ Features

### 🎯 Personalized Social Discovery
- **❤️ For You Feed**: Personalized content from developers you follow on GitHub
- **👥 Network Activity**: See what repos your network is starring and creating
- **📊 Trending in Network**: Discover repos multiple followers have starred
- **🔐 GitHub OAuth**: Sign in to unlock personalized feeds

### 🎬 AI Video Generation
- **AI-Generated Videos**: Automatically create stunning videos from repository data
- **Multiple Providers**: Support for Google Veo, Runway, Nano Banana, OpenAI Sora
- **Smart Prompts**: Cinematic tech-focused prompts generated from repo data
- **Video Controls**: Play/pause, mute/unmute, view AI prompts

### 💫 User Experience
- **TikTok-Style Interface**: Vertical scrolling with smooth animations
- **Social Context**: See who in your network starred each repo
- **Beautiful UI**: Modern, gradient-filled cards with smooth animations
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Works Without Auth**: Guest mode with trending repos

### 🔍 Discovery Features
- **Trending Repositories**: Discover the hottest repos on GitHub
- **Advanced Search**: Find repos by language, topic, stars, and more
- **Following Network**: Explore repos forked by people in any user's network
- **Real-time GitHub Data**: Powered by GitHub's official API

## 🚀 Getting Started

> **Quick Start**: Just run `npm install && npm run dev` - the app works immediately with mock data!

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A GitHub account (optional, for higher API rate limits)

### Installation

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd gittok
```

> 💡 **See [QUICKSTART.md](./QUICKSTART.md) for a 3-minute setup guide!**

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables** (Optional)

Create a `.env.local` file in the root directory:

```env
# Optional: For higher GitHub API rate limits
NEXT_PUBLIC_GITHUB_TOKEN=your_github_personal_access_token

# Optional: AI Video Generation APIs
NEXT_PUBLIC_RUNWAY_API_KEY=your_runway_api_key
NEXT_PUBLIC_NANO_BANANA_API_KEY=your_nano_banana_api_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key

# Optional: For GitHub OAuth authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_app_secret
```

**To get a GitHub Personal Access Token:**

- Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
- Generate new token with `public_repo` scope
- Copy the token and add it to your `.env.local` file

**AI Video Generation Setup (Optional):**
The app works with mock videos by default. To use real AI video generation:

- **Runway ML**: Sign up at [runwayml.com](https://runwayml.com) and get API access
- **Nano Banana**: Visit [nanobananavideo.com](https://nanobananavideo.com) for API access
- **OpenAI Sora**: Request access to Sora API (limited availability)
- **Google Veo**: Currently in limited preview

See [VIDEO_PROVIDERS.md](./VIDEO_PROVIDERS.md) for detailed setup instructions

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Pages & Features

### Home (`/`)

- Displays trending GitHub repositories from the past week
- Vertical scroll/swipe to navigate between repos
- Click navigation dots on the right to jump to specific repos
- Beautiful gradient cards with smooth animations

### AI Videos (`/video`) ⭐ NEW

- **AI-generated video content** for each repository
- TikTok-style video feed with auto-play
- Play/pause and mute/unmute controls
- View AI prompts used to generate videos
- Vertical swipe navigation between videos
- Stats overlay (stars, forks, watchers)
- Direct links to GitHub and project websites

### Following (`/following`)

- Enter any GitHub username
- Discover repositories forked by people they follow
- Great for finding what's popular in specific communities

### Search (`/search`)

- Advanced search with GitHub query syntax
- Filter by language, stars, topics, and more
- Examples:
  - `language:python stars:>1000`
  - `topic:machine-learning`
  - `react hooks`

## 🎨 UI Components

### RepoCard

Each repository is displayed as a beautiful, immersive card featuring:

- Repository owner avatar and username
- Repository name and description
- Programming language with color-coded badges
- Topic tags
- Stats: stars, forks, watchers, issues
- Links to GitHub and project website
- Animated background with gradient effects

### RepoFeed

- Implements smooth vertical scrolling
- Keyboard and mouse wheel navigation
- Touch/swipe support for mobile devices
- Visual navigation dots

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **GitHub API**: Octokit
- **Authentication**: NextAuth.js (optional)
- **Icons**: Lucide React

## 📦 Project Structure

```
gittok/
├── app/
│   ├── api/auth/          # NextAuth API routes
│   ├── following/         # Following network page
│   ├── search/            # Search page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/
│   ├── Header.tsx         # Navigation header
│   ├── RepoCard.tsx       # Repository card component
│   └── RepoFeed.tsx       # Scrolling feed component
├── lib/
│   └── github.ts          # GitHub API service
├── types/
│   └── repository.ts      # TypeScript types
└── README.md
```

## 🌐 API Rate Limits

Without authentication, GitHub API has a rate limit of 60 requests per hour. To increase this to 5,000 requests per hour:

1. Create a GitHub Personal Access Token
2. Add it to your `.env.local` as `NEXT_PUBLIC_GITHUB_TOKEN`

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add your environment variables in the Vercel dashboard
4. Deploy!

### Other Platforms

```bash
npm run build
npm run start
```

## 🎥 AI Video Generation

GitTok uses cutting-edge AI to automatically generate engaging videos for each repository:

### How it Works

1. **Extract Repository Data**: Name, description, language, stats
2. **Generate AI Prompt**: Create cinematic tech-focused prompts
3. **Call Video API**: Use Runway, Nano Banana, Sora, or Veo
4. **Display Video**: TikTok-style vertical feed with controls

### Prompt Examples

The app generates prompts like:

```
"Create a cinematic tech showcase video featuring 'React',
a JavaScript project. Show abstract code flowing on screens,
futuristic UI elements, and digital particles. Display the
project name prominently with glowing effects. 145K stars
as glowing particles. Style: Modern, tech, dark theme with
neon accents."
```

### Supported Providers

- ✅ **Mock** (Default) - Free demo videos
- 🎬 **Runway ML** - High-quality generation
- 🍌 **Nano Banana** - Studio-quality videos
- 🤖 **OpenAI Sora** - Advanced AI videos
- 🔮 **Google Veo** - Next-gen (preview)

See [VIDEO_PROVIDERS.md](./VIDEO_PROVIDERS.md) for setup instructions.

## 🎯 Future Enhancements

- [x] AI video generation integration
- [x] TikTok-style video feed
- [x] Multiple video provider support
- [ ] React Native mobile app
- [ ] User authentication and personalized feeds
- [ ] Save favorite repositories
- [ ] Video caching and CDN
- [ ] Real-time generation progress
- [ ] Custom video templates
- [ ] Filter by programming language
- [ ] Dark/light theme toggle
- [ ] Repository comparison feature

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and pull requests.

## 📄 License

MIT License - feel free to use this project for learning and personal use.

## 🙏 Acknowledgments

- Inspired by TikTok's intuitive vertical scrolling interface
- Built with GitHub's amazing API
- UI inspiration from modern design trends

---

**Made with ❤️ for the developer community**
