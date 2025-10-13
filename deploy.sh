#!/bin/bash

# Vercel Deployment Script for AI Storefront
# This script helps deploy your React Router + Convex app to Vercel

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Please ensure the configuration file exists."
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🔧 Building the project..."
pnpm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"

echo "🌐 Deploying Convex backend..."
pnpm run convex:deploy

if [ $? -ne 0 ]; then
    echo "❌ Convex deployment failed. Please check your Convex configuration."
    exit 1
fi

echo "✅ Convex deployment completed!"

echo ""
echo "🎉 Ready for Vercel deployment!"
echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com and create a new project"
echo "2. Import your Git repository"
echo "3. Set the following environment variables in Vercel:"
echo "   - CONVEX_DEPLOYMENT (from the Convex deployment output above)"
echo "   - CONVEX_URL (same as CONVEX_DEPLOYMENT)"
echo "   - WORKOS_CLIENT_ID"
echo "   - WORKOS_CLIENT_SECRET"
echo "   - OPENAI_API_KEY"
echo "   - COHERE_API_KEY (if using)"
echo "   - XAI_API_KEY (if using)"
echo "   - RESEND_API_KEY"
echo "4. Deploy!"
echo ""
echo "📖 For detailed instructions, see VERCEL_DEPLOYMENT.md"



