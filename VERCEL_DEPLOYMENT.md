# Vercel Deployment Guide

## Required Environment Variables

You'll need to set up the following environment variables in your Vercel project:

### Convex Configuration
- `CONVEX_DEPLOYMENT` - Your Convex deployment URL (e.g., `https://your-deployment.convex.cloud`)
- `CONVEX_URL` - Same as CONVEX_DEPLOYMENT (for compatibility)

### WorkOS Authentication
- `WORKOS_CLIENT_ID` - Your WorkOS client ID
- `WORKOS_CLIENT_SECRET` - Your WorkOS client secret (server-side only)

### AI/OpenAI Configuration
- `OPENAI_API_KEY` - Your OpenAI API key
- `COHERE_API_KEY` - Your Cohere API key (if using Cohere)
- `XAI_API_KEY` - Your xAI API key (if using xAI)

### Email Configuration
- `RESEND_API_KEY` - Your Resend API key for email functionality

### Optional Environment Variables
- `NODE_ENV` - Set to "production" for production builds
- `VITE_CONVEX_URL` - Frontend Convex URL (if different from backend)

## Deployment Steps

### 1. Prepare Your Repository
1. Ensure all your changes are committed and pushed to your Git repository
2. Make sure your `package.json` has the correct build scripts
3. Verify that `vercel.json` is in your project root

### 2. Deploy Convex Backend
1. Run `pnpm run convex:deploy` to deploy your Convex backend
2. Note the deployment URL provided by Convex
3. This URL will be used as your `CONVEX_DEPLOYMENT` environment variable

### 3. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Vercel should automatically detect this as a React Router project
5. Configure the following settings:
   - **Framework Preset**: Other
   - **Build Command**: `pnpm run build`
   - **Output Directory**: `build/client`
   - **Install Command**: `pnpm install`

### 4. Set Environment Variables
In your Vercel project dashboard:
1. Go to Settings → Environment Variables
2. Add all the required environment variables listed above
3. Make sure to set them for Production, Preview, and Development environments as needed

### 5. Deploy
1. Click "Deploy" in Vercel
2. Wait for the build to complete
3. Your app will be available at the provided Vercel URL

## Troubleshooting

### Build Issues
- Ensure Node.js version is 22+ (as specified in package.json engines)
- Check that all dependencies are properly installed
- Verify that the build command completes successfully locally

### Runtime Issues
- Check that all environment variables are set correctly
- Verify Convex deployment is accessible
- Check Vercel function logs for any runtime errors

### Authentication Issues
- Ensure WorkOS configuration is correct
- Verify that redirect URLs are properly configured in WorkOS
- Check that JWT configuration matches between frontend and backend

## Post-Deployment

1. Test all major functionality
2. Verify authentication flow works
3. Check that Convex queries and mutations work correctly
4. Test email functionality if applicable
5. Monitor Vercel analytics and logs

## Custom Domain (Optional)
1. In Vercel dashboard, go to Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed by Vercel
4. Enable SSL certificate (automatic)
