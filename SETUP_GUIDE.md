# AI Storefront Setup Guide

## 1. Convex Setup (Backend)
```bash
cd C:\Users\RICHIE\Documents\ai-storefront
npx convex dev --configure new
```
- Creates free Convex account
- Generates deployment URL automatically
- Creates `convex.json` file

## 2. WorkOS Setup (Authentication)
1. Go to https://workos.com/ 
2. Create free account
3. Create new project
4. Get your Client ID from dashboard
5. Add to `.env.local`:
   ```
   VITE_WORKOS_CLIENT_ID=your_actual_client_id_here
   ```

## 3. Optional: AI Features (xAI/Grok)
1. Get API key from https://x.ai/
2. Add to `.env.local`:
   ```
   XAI_API_KEY=your_xai_api_key_here
   ```

## 4. Start Both Services
```bash
# Terminal 1: Start Convex
npx convex dev

# Terminal 2: Start React app
pnpm dev
```

## 5. Access Your App
- App: http://localhost:5173/
- Convex Dashboard: Check terminal output