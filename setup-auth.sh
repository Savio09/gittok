#!/bin/bash

# GitTok Authentication Setup Script
echo "🚀 GitTok Authentication Setup"
echo "================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    echo "Creating .env.local..."
    cp .env.example .env.local
    echo "✅ Created .env.local from .env.example"
fi

# Check for DATABASE_URL
if grep -q "DATABASE_URL=\"postgresql://username:password" .env.local; then
    echo ""
    echo "⚠️  DATABASE_URL not configured!"
    echo ""
    echo "Please follow these steps:"
    echo "1. Go to https://neon.tech"
    echo "2. Create an account (free)"
    echo "3. Create a new project"
    echo "4. Copy the connection string"
    echo "5. Replace DATABASE_URL in .env.local"
    echo ""
    read -p "Press Enter once you've updated DATABASE_URL..."
fi

# Check for NEXTAUTH_SECRET
if grep -q "NEXTAUTH_SECRET=$" .env.local || grep -q "NEXTAUTH_SECRET=\"\"" .env.local; then
    echo ""
    echo "🔐 Generating NEXTAUTH_SECRET..."
    SECRET=$(openssl rand -base64 32)
    
    # Update .env.local with the secret
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$SECRET\"|" .env.local
    else
        # Linux
        sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=\"$SECRET\"|" .env.local
    fi
    
    echo "✅ NEXTAUTH_SECRET generated and added to .env.local"
fi

# Check for GitHub OAuth
if grep -q "GITHUB_ID=$" .env.local || grep -q "GITHUB_ID=\"\"" .env.local; then
    echo ""
    echo "⚠️  GitHub OAuth not configured!"
    echo ""
    echo "Please follow these steps:"
    echo "1. Go to https://github.com/settings/developers"
    echo "2. Click 'New OAuth App'"
    echo "3. Fill in:"
    echo "   - Name: GitTok Local"
    echo "   - Homepage: http://localhost:3000"
    echo "   - Callback: http://localhost:3000/api/auth/callback/github"
    echo "4. Copy Client ID and Secret"
    echo "5. Add them to .env.local"
    echo ""
    read -p "Press Enter once you've updated GITHUB_ID and GITHUB_SECRET..."
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database schema
echo ""
echo "🗄️  Setting up database..."
echo "This will create tables in your Neon database."
read -p "Press Enter to continue..."

npx prisma db push

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup complete!"
    echo ""
    echo "🎉 Setup complete! You can now:"
    echo ""
    echo "1. Start the app:"
    echo "   npm run dev"
    echo ""
    echo "2. View database:"
    echo "   npx prisma studio"
    echo ""
    echo "3. Visit http://localhost:3000"
    echo "   Click 'Sign in with GitHub'"
    echo ""
    echo "4. Enjoy your personalized feed!"
    echo ""
else
    echo ""
    echo "❌ Database setup failed!"
    echo ""
    echo "Please check:"
    echo "1. DATABASE_URL in .env.local is correct"
    echo "2. You have internet connection"
    echo "3. Neon database is active"
    echo ""
    echo "Run this script again after fixing the issue."
fi

