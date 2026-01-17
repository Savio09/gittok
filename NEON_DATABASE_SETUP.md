# Neon PostgreSQL Database Setup

GitTok uses Neon PostgreSQL for storing user authentication data via NextAuth.js.

## 🚀 Quick Setup

### Step 1: Create Neon Account

1. Go to [https://neon.tech](https://neon.tech)
2. Click **"Sign Up"** (free tier available!)
3. Sign in with GitHub or email

### Step 2: Create a New Project

1. Click **"Create a project"**
2. Choose a name: `gittok` or `gittok-dev`
3. Select region (closest to you)
4. Click **"Create project"**

### Step 3: Get Database URL

1. In your Neon dashboard, go to your project
2. Click **"Connection Details"**
3. Copy the **"Connection string"**
4. It looks like:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require
   ```

### Step 4: Add to .env.local

```bash
cd /Users/fdeclan/Public/gittok

# If .env.local doesn't exist, create it
touch .env.local

# Add your database URL
echo 'DATABASE_URL="your_connection_string_here"' >> .env.local
```

Or edit `.env.local` manually:

```env
# Neon PostgreSQL Database
DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require"

# Google Veo API Key (already configured)
NEXT_PUBLIC_GOOGLE_VEO_API_KEY=AIzaSyAndNhTX8PAhxdECBLapEfoVzoO-E0_pko

# GitHub OAuth (Required for authentication)
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# NextAuth Secret (Generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_random_secret_here
NEXTAUTH_URL=http://localhost:3000
```

### Step 5: Install Dependencies

```bash
npm install
```

This installs:
- `@prisma/client` - Prisma database client
- `@next-auth/prisma-adapter` - NextAuth + Prisma integration
- `prisma` (dev dependency) - Prisma CLI

### Step 6: Run Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push
```

Expected output:
```
✔ Generated Prisma Client
✔ Database synced
```

### Step 7: Verify Database

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This opens a GUI at `http://localhost:5555` where you can see your tables:
- `User`
- `Account`
- `Session`
- `VerificationToken`

### Step 8: Start Application

```bash
npm run dev
```

Visit http://localhost:3000 and sign in with GitHub!

---

## 📊 Database Schema

The database stores NextAuth.js authentication data:

### User Table
```sql
- id (unique identifier)
- name (from GitHub)
- email (from GitHub)
- emailVerified
- image (avatar URL)
- username (GitHub username)
```

### Account Table
```sql
- id
- userId (foreign key to User)
- provider ("github")
- providerAccountId (GitHub user ID)
- access_token (GitHub access token) ← Used for API calls
- refresh_token
- expires_at
- token_type
- scope
```

### Session Table
```sql
- id
- sessionToken (unique)
- userId (foreign key to User)
- expires
```

### VerificationToken Table
```sql
- identifier
- token
- expires
```

---

## 🔍 How It Works

1. **User signs in** with GitHub
2. **NextAuth creates**:
   - User record (if new user)
   - Account record (GitHub connection)
   - Session (for authentication)
3. **Access token stored** in Account table
4. **Token used** to fetch personalized feed
5. **Session validated** on each request

---

## 🛠 Prisma Commands

### View Database
```bash
npx prisma studio
```

### Update Schema
After editing `prisma/schema.prisma`:
```bash
npx prisma db push
```

### Reset Database (⚠️ Deletes all data)
```bash
npx prisma db push --force-reset
```

### Generate Types
```bash
npx prisma generate
```

---

## 🔐 Security Best Practices

### 1. Never Commit .env.local
Already in `.gitignore`, but double-check:
```bash
cat .gitignore | grep .env
```

### 2. Use Connection Pooling (Production)
For production, use Neon's connection pooling:
```env
# Replace in production
DATABASE_URL="postgresql://username:password@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require&pgbouncer=true"
```

### 3. Rotate Secrets
Periodically regenerate:
- NEXTAUTH_SECRET
- GitHub OAuth credentials
- Database password (in Neon dashboard)

---

## 🌐 Neon Features

### Free Tier Includes
- ✅ 0.5 GB storage
- ✅ 1 project
- ✅ 10 branches
- ✅ Autoscaling
- ✅ Point-in-time restore (7 days)

### Branching (Cool Feature!)
Create database branches for development:
```bash
# In Neon dashboard, create a branch
# Get new connection string
# Use in .env.local for testing
```

### Monitoring
View in Neon dashboard:
- Query performance
- Connection count
- Storage usage
- Database size

---

## 🐛 Troubleshooting

### Error: "Can't reach database server"

**Check:**
1. Database URL is correct in `.env.local`
2. Internet connection is active
3. Firewall isn't blocking PostgreSQL (port 5432)

**Fix:**
```bash
# Test connection
npx prisma db push
```

### Error: "Authentication failed"

**Check:**
1. Password in DATABASE_URL is correct
2. No special characters need URL encoding
3. Database user has correct permissions

**Fix:**
Go to Neon dashboard → Reset password → Update .env.local

### Error: "Table does not exist"

**Run migrations:**
```bash
npx prisma db push
```

### Error: "Prisma Client not generated"

**Generate client:**
```bash
npx prisma generate
```

### Error: "NextAuth session not found"

**Check:**
1. NEXTAUTH_SECRET is set
2. Database is accessible
3. Tables exist (run `npx prisma studio`)

**Clear sessions:**
```bash
# Delete all sessions in Prisma Studio
# Or reset database
npx prisma db push --force-reset
```

---

## 🔄 Development Workflow

### Local Development
```bash
# 1. Start with fresh database
npx prisma db push

# 2. Run dev server
npm run dev

# 3. Sign in to test
# Visit http://localhost:3000

# 4. Check data in Prisma Studio
npx prisma studio
```

### Testing
```bash
# Create test database branch in Neon
# Update DATABASE_URL in .env.local
# Run migrations
npx prisma db push
```

---

## 📈 Production Deployment

### Vercel + Neon

1. **Create production database** in Neon
2. **Add environment variables** in Vercel:
   ```
   DATABASE_URL=your_production_database_url
   NEXTAUTH_SECRET=your_production_secret
   GITHUB_ID=your_github_id
   GITHUB_SECRET=your_github_secret
   NEXTAUTH_URL=https://yourdomain.com
   ```
3. **Deploy:**
   ```bash
   git push
   ```
4. **Run migrations** (automatic in Vercel):
   - Prisma generates client on build
   - Database schema synced automatically

---

## 💡 Why Neon?

✅ **Serverless** - Pay for what you use  
✅ **Fast** - Low latency, instant connections  
✅ **Branching** - Git-like database branches  
✅ **Auto-scaling** - Scales to zero when idle  
✅ **Free tier** - Perfect for development  
✅ **PostgreSQL** - Industry standard  

---

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js with Prisma](https://next-auth.js.org/adapters/prisma)
- [Connection Pooling](https://neon.tech/docs/connect/connection-pooling)

---

## ✅ Verification Checklist

- [ ] Neon account created
- [ ] Database project created
- [ ] Connection string copied
- [ ] DATABASE_URL in .env.local
- [ ] Dependencies installed (`npm install`)
- [ ] Prisma client generated (`npx prisma generate`)
- [ ] Database schema pushed (`npx prisma db push`)
- [ ] Tables visible in Prisma Studio
- [ ] GitHub OAuth configured
- [ ] NEXTAUTH_SECRET generated
- [ ] App starts successfully
- [ ] Sign in works
- [ ] User data stored in database

---

**Once completed, GitHub authentication will work perfectly!** 🎉

Run `npm run dev` and test by signing in at http://localhost:3000

