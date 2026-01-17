# GitTok Architecture

## Overview

GitTok is a Next.js 14 application that provides a TikTok-style interface for exploring GitHub repositories. It uses the App Router with React Server Components and Client Components where needed.

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: UI library with hooks and modern features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Animation library for smooth transitions
- **Lucide React**: Icon library

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Octokit**: Official GitHub API client
- **NextAuth.js**: Authentication (optional)

## Project Structure

```
gittok/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/[...nextauth]/  # Authentication endpoints
│   │   ├── search/              # Search API endpoint
│   │   └── trending/            # Trending repos endpoint
│   ├── following/               # Following network page
│   ├── language/[lang]/         # Language-specific pages
│   ├── search/                  # Search page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (trending)
│   └── globals.css              # Global styles
├── components/                  # React components
│   ├── Header.tsx               # Navigation header
│   ├── LanguageFilter.tsx       # Language filter component
│   ├── RepoCard.tsx             # Repository display card
│   ├── RepoFeed.tsx             # Vertical scrolling feed
│   └── ShareButton.tsx          # Share functionality
├── lib/                         # Utility libraries
│   └── github.ts                # GitHub API service
├── types/                       # TypeScript definitions
│   └── repository.ts            # Repository type
└── public/                      # Static assets
```

## Key Components

### RepoFeed
The main feed component that implements the TikTok-style scrolling:
- Vertical snap scrolling
- Touch/swipe support
- Mouse wheel navigation
- Keyboard arrow navigation
- Navigation dots for quick access

### RepoCard
Beautiful, immersive repository cards with:
- Gradient animated backgrounds
- Smooth enter/exit animations
- Repository metadata display
- Action buttons (GitHub, website, share)
- Responsive design

### Header
Navigation component with:
- Logo and branding
- Navigation links (Trending, Following, Search)
- Mobile responsive menu
- Fixed position with backdrop blur

## Data Flow

### 1. Trending Repositories (Home Page)

```
User → Home Page → fetchTrendingRepos() → GitHub API → Display in RepoFeed
```

The home page fetches trending repositories from the last week using GitHub's search API.

### 2. Following Network

```
User → Input Username → fetchUserFollowingForkedRepos() → GitHub API → Filter & Sort → Display
```

Fetches users that a given user follows, then finds repositories they've forked.

### 3. Search

```
User → Input Query → searchRepos() → GitHub API → Display Results
```

Uses GitHub's search API with support for advanced query syntax.

## API Integration

### GitHub API Service (`lib/github.ts`)

Three main functions:

1. **fetchTrendingRepos(language?, limit)**
   - Searches for recently created repos with >50 stars
   - Optional language filter
   - Falls back to mock data on error

2. **fetchUserFollowingForkedRepos(username)**
   - Gets list of users followed by username
   - Fetches forked repos from those users
   - Sorts by star count

3. **searchRepos(query, limit)**
   - Generic repository search
   - Supports GitHub query syntax
   - Sorts by star count

### Rate Limiting

- **Unauthenticated**: 60 requests/hour
- **With Token**: 5,000 requests/hour
- **With OAuth**: 5,000 requests/hour

The app includes mock data fallback to ensure it always works.

## State Management

### Client-Side State
- React hooks (`useState`, `useEffect`)
- No global state management needed (simple app)
- Each page manages its own data fetching

### URL State
- Search queries via URL parameters
- Language filtering via dynamic routes
- Username for following page via query params

## Styling Approach

### Tailwind CSS
- Utility-first approach
- Custom color scheme (dark theme)
- Responsive breakpoints (sm, md, lg)
- Backdrop blur effects
- Gradient backgrounds

### Animations
- Framer Motion for enter/exit animations
- CSS transitions for hover effects
- Scroll-based animations
- Smooth page transitions

## Performance Optimizations

1. **Image Optimization**
   - Next.js Image component
   - Lazy loading
   - Proper sizing

2. **Code Splitting**
   - Automatic with Next.js
   - Dynamic imports where needed

3. **Client Components Only Where Needed**
   - Most pages are client components (interactive)
   - API routes run on server

4. **Caching**
   - GitHub API responses could be cached (future enhancement)
   - Static assets cached by Next.js

## Responsive Design

### Mobile (< 768px)
- Hamburger menu
- Full-width cards
- Touch swipe navigation
- Optimized font sizes

### Tablet (768px - 1024px)
- Adjusted padding
- Responsive grid layouts

### Desktop (> 1024px)
- Full navigation bar
- Larger cards
- Mouse wheel navigation
- Keyboard shortcuts

## Future Enhancements

### Planned Features
1. React Native mobile app
2. User authentication with GitHub OAuth
3. Save favorite repositories
4. Repository comparison
5. Dark/light theme toggle
6. Advanced filters (date range, star count)
7. User profiles
8. Repository statistics charts
9. Trending developers

### Technical Improvements
1. Server-side caching with Redis
2. GraphQL for more efficient API calls
3. Progressive Web App (PWA)
4. Offline support
5. Analytics integration
6. Error boundary components
7. Unit and integration tests

## Security Considerations

1. **API Keys**
   - Store in environment variables
   - Never commit to version control
   - Use `.env.local` for development

2. **OAuth**
   - Secure callback URLs
   - CSRF protection via NextAuth
   - Token encryption

3. **XSS Prevention**
   - React's built-in escaping
   - Sanitize user input
   - CSP headers (future)

## Deployment

### Vercel (Recommended)
- Zero-config deployment
- Automatic HTTPS
- Edge network CDN
- Environment variable management

### Docker (Alternative)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup
- Set all environment variables in deployment platform
- Update `NEXTAUTH_URL` to production URL
- Configure GitHub OAuth callback URLs

## Contributing

### Development Workflow
1. Fork repository
2. Create feature branch
3. Make changes with TypeScript
4. Test locally
5. Submit pull request

### Code Style
- TypeScript strict mode
- ESLint for linting
- Prettier for formatting (optional)
- Meaningful component names
- Comments for complex logic

---

Built with ❤️ for the developer community

