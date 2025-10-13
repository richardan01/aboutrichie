# OpenAI Tracing Deployment Guide

## Current Status

✅ Python proxy server is running locally on port 8765
✅ Synthetic traces working and visible at https://platform.openai.com/traces
✅ Railway deployment files created
⚠️  Live chat messages NOT traced (proxy not publicly accessible)

## Problem

The Python proxy runs on `localhost:8765`, but Convex runs in AWS cloud and cannot access localhost. Chat messages bypass the proxy and use OpenAI SDK directly, so they don't appear in OpenAI Traces dashboard.

## Solution: Make Proxy Publicly Accessible

Choose ONE of these options:

### Option 1: ngrok (Fastest - Temporary Testing)

1. **Sign up for ngrok account** (if you haven't already):
   - Visit https://dashboard.ngrok.com/signup
   - Create free account

2. **Get your authtoken**:
   - Go to https://dashboard.ngrok.com/get-started/your-authtoken
   - Copy your authtoken

3. **Configure ngrok** (already installed in project root):
   ```bash
   ./ngrok.exe config add-authtoken YOUR_AUTHTOKEN_HERE
   ```

4. **Start ngrok tunnel**:
   ```bash
   ./ngrok.exe http 8765
   ```

5. **Copy the public URL** (looks like `https://abc123.ngrok-free.app`)

6. **Update Convex environment**:
   ```bash
   npx convex env set OPENAI_TRACES_PROXY_URL https://YOUR-NGROK-URL.ngrok-free.app/run
   ```

7. **Test**: Send a chat message in your web app and check https://platform.openai.com/traces

**Pros**: Works immediately, no deployment needed
**Cons**: URL changes each time you restart ngrok (free tier), requires ngrok running locally

---

### Option 2: Railway (Recommended - Production)

1. **Sign up for Railway**:
   - Visit https://railway.app
   - Sign up with GitHub

2. **Create new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account if needed

3. **Configure deployment**:
   - Select this repository
   - Set root directory to `python-agents`
   - Railway will auto-detect the config from `railway.json`

4. **Set environment variable**:
   - In Railway dashboard → Variables → Add Variable:
     - Name: `OPENAI_API_KEY`
    - Value: `<your-openai-api-key>`

5. **Deploy**:
   - Railway will build and deploy automatically
   - Wait for deployment to complete

6. **Get public URL**:
   - In Railway dashboard → Settings → Domains
   - Copy the generated URL (e.g., `https://yourapp.up.railway.app`)

7. **Update Convex environment**:
   ```bash
   npx convex env set OPENAI_TRACES_PROXY_URL https://yourapp.up.railway.app/run
   ```

8. **Test**: Send a chat message and check https://platform.openai.com/traces

**Pros**: Permanent URL, production-ready, free tier available
**Cons**: Requires manual setup through Railway dashboard

---

### Option 3: Render (Alternative - Production)

Similar to Railway:

1. Sign up at https://render.com
2. Create new "Web Service"
3. Connect GitHub repo, set root directory to `python-agents`
4. Add environment variable: `OPENAI_API_KEY`
5. Deploy
6. Copy public URL
7. Update Convex: `npx convex env set OPENAI_TRACES_PROXY_URL https://yourapp.onrender.com/run`

---

## Files Created

- `python-agents/railway.json` - Railway deployment config
- `python-agents/Procfile` - Process configuration for deployment
- `python-agents/runtime.txt` - Python version specification
- `python-agents/requirements.txt` - Python dependencies (already exists)

## Verification

After deployment, verify tracing works:

1. **Check proxy health**:
   ```bash
   curl https://YOUR-PUBLIC-URL/health
   ```
   Should return: `{"status":"ok","has_openai_key":true}`

2. **Test proxy directly**:
   ```bash
   curl -X POST https://YOUR-PUBLIC-URL/run \
     -H "Content-Type: application/json" \
     -d '{"prompt":"test message","group_id":"test-123"}'
   ```

3. **Send chat message** through web app

4. **View traces** at https://platform.openai.com/traces
   - Should see traces with thread IDs from your chat

## Current Local Setup

The proxy is running locally with these processes:
- Python proxy: port 8765 (multiple instances)
- Frontend: `pnpm dev`
- Convex: `pnpm convex:dev`

To stop local Python proxy:
```bash
taskkill //F //IM python.exe
```

## Next Steps

1. Choose deployment option (recommend ngrok for quick testing, Railway for production)
2. Follow steps above
3. Update OPENAI_TRACES_PROXY_URL in Convex
4. Test chat and verify traces appear
