# GitTok

A TikTok-style platform that turns GitHub repositories into narrated, swipeable slideshows. Instead of reading through READMEs, you swipe through bite-sized presentations that give you the essence of a project in seconds.

## How It Works

GitTok fetches a repository's metadata and README from GitHub, parses out the key information (description, features, stats, topics), and assembles it into an animated slideshow with text-to-speech narration. No manual content creation required.

Each slideshow has six slides:

1. **Intro** -- project name, avatar, language badge
2. **Overview** -- what the project does (extracted from description/README)
3. **Features** -- key features parsed from the README or inferred from metadata
4. **Stats** -- animated counters for stars, forks, and watchers
5. **Topics** -- relevant tags and categories
6. **CTA** -- link back to the GitHub repository

Slides advance automatically when the narration finishes, or you can tap to navigate manually.

## Three Ways to Discover

| Feed | Route | Auth Required | Description |
|------|-------|---------------|-------------|
| **Trending** | `/` | No | Most popular repos from the past week on GitHub |
| **Discover** | `/discover` | No | Curated slideshows of standout projects (React, Next.js, VS Code, etc.) |
| **For You** | `/feed` | Yes (GitHub OAuth) | Personalized feed powered by your GitHub social graph |

The **For You** feed pulls your following list, then surfaces repos that people in your network have starred, forked, or created. Each item shows social context explaining why it appeared in your feed.

## Tech Stack

### Frontend (Next.js)
- **Next.js 15** with App Router
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for slide animations
- **Clerk** for GitHub OAuth authentication
- **Web Speech API** for client-side text-to-speech (with remote TTS fallback)

### Backend (Python FastAPI)
- **FastAPI** with Pydantic schemas
- **GitHub REST API** (via httpx) for repo data, README fetching, and social graph queries
- **Slideshow generation** from README parsing + metadata inference
- **Text-to-speech** via OpenAI or Cloudflare Workers AI (with disk caching)
- **SQLite** for repo snapshot persistence

### Architecture

The Next.js frontend talks to the Python backend through API route proxies. This keeps GitHub tokens and TTS API keys off the client. The backend handles all GitHub API calls, slideshow assembly, and audio synthesis.

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- A GitHub personal access token

### Setup

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -e ".[dev]"
cd ..

# Copy environment template and fill in your keys
cp .env.example .env.local
```

Required environment variables:

| Variable | Purpose |
|----------|---------|
| `GITHUB_TOKEN` | GitHub API access (backend) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk authentication |
| `CLERK_SECRET_KEY` | Clerk server-side auth |
| `DATABASE_URL` | PostgreSQL for Clerk user sync |
| `OPENAI_API_KEY` or Cloudflare credentials | Remote text-to-speech (optional) |

### Running

```bash
# Terminal 1: Start the Python backend
npm run dev:backend

# Terminal 2: Start the Next.js frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
gittok/
  app/
    api/              # Next.js API routes (proxy to backend)
    discover/         # Curated slideshow feed
    feed/             # Personalized "For You" feed
    search/           # Repository search
    settings/         # User preferences
    sign-in/          # Clerk sign-in
    sign-up/          # Clerk sign-up
    page.tsx          # Trending home page
  backend/
    server/
      api/router.py   # FastAPI endpoints
      services/       # GitHub, slides, feeds, speech
      core/           # Config, DB, models, schemas
  components/
    DiscoverCard.tsx   # Slideshow-enabled repo card
    DiscoverFeed.tsx   # Swipeable feed with windowed rendering
    SlideshowPlayer.tsx # Core slideshow engine with voiceover
    RepoCard.tsx       # Simple repo info card (trending/search)
    RepoFeed.tsx       # Simple swipeable feed
    Header.tsx         # Navigation
  lib/
    frontendApi.ts     # Client-side API calls
    backend.ts         # Server-side proxy helper
    appSettings.ts     # User preferences (localStorage)
  types/
    repository.ts      # Shared TypeScript types
```

## Historical Context

The original vision was to generate AI videos for repositories using providers like Runway, Sora, and Google Veo. After evaluating the constraints (slow generation, high cost, inconsistent quality), the project pivoted to client-side slideshows. They generate instantly, cost nothing, and communicate project information more effectively. The legacy AI video code has been removed.
