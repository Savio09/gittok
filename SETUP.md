# GitTok Setup Guide

## Quick Start (No Configuration Required)

The app works out of the box with mock data! Just run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start exploring!

## Full Setup with GitHub API (Optional)

For the best experience with real GitHub data and higher rate limits, follow these steps:

### 1. Create a GitHub Personal Access Token

1. Go to [GitHub Settings](https://github.com/settings/tokens)
2. Click on **Developer settings** (left sidebar)
3. Click on **Personal access tokens** → **Tokens (classic)**
4. Click **Generate new token** → **Generate new token (classic)**
5. Give your token a descriptive name (e.g., "GitTok App")
6. Select scopes:
   - ✅ `public_repo` (Access public repositories)
   - ✅ `read:user` (Read user profile data)
   - ✅ `user:follow` (Follow/unfollow users)
7. Click **Generate token**
8. **Important**: Copy the token immediately! You won't be able to see it again.

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your token:

```env
NEXT_PUBLIC_GITHUB_TOKEN=ghp_your_token_here
```

### 3. Optional: GitHub OAuth for User Login

If you want to add user authentication:

1. Create a GitHub OAuth App:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click **New OAuth App**
   - Fill in:
     - Application name: `GitTok`
     - Homepage URL: `http://localhost:3000`
     - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
   - Click **Register application**

2. Copy the **Client ID** and generate a **Client Secret**

3. Add to `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_string_here
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
```

To generate a secure `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

### 4. Restart the Development Server

```bash
npm run dev
```

## GitHub API Rate Limits

| Authentication | Requests per Hour |
|---------------|-------------------|
| No token      | 60                |
| With token    | 5,000             |
| With OAuth    | 5,000             |

## Troubleshooting

### "API rate limit exceeded"

- Add a GitHub token to your `.env.local`
- Wait an hour for the rate limit to reset
- The app will fall back to mock data automatically

### "Cannot find module 'react'"

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors

```bash
npm run build
```

This will show any type errors that need to be fixed.

## Production Deployment

### Vercel

1. Push your code to GitHub
2. Import on [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_GITHUB_TOKEN`
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET`
   - `GITHUB_ID`
   - `GITHUB_SECRET`

### Other Platforms

Make sure to set the build command and environment variables:

```bash
# Build
npm run build

# Start
npm run start

# Port (default 3000)
PORT=3000
```

## Development Tips

### Hot Reload

The app uses Next.js hot reload. Changes to code will automatically refresh the browser.

### Mock Data

The `lib/github.ts` file includes mock data that's used when API calls fail. This ensures the app always works, even without API access.

### API Routes

- `/api/trending` - Get trending repos
- `/api/search` - Search repositories
- `/api/auth/[...nextauth]` - Authentication endpoints

### Testing Different Languages

Navigate to:
- `/language/typescript`
- `/language/python`
- `/language/rust`
- etc.

## Need Help?

Open an issue on GitHub or check the main README.md for more information.

