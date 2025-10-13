# Missing Environment Variables for Vercel Deployment

Based on your codebase analysis, here are the **missing environment variables** you need to add to Vercel:

## 🚨 Critical Missing Variables

### Frontend Variables (VITE_ prefix)
```
VITE_CONVEX_URL=
VITE_WORKOS_CLIENT_ID=
```
**These are REQUIRED** - your app won't work without them!

---

## 🔧 Backend Variables (process.env)

### Already Covered ✅
- `OPENAI_API_KEY` ✅
- `RESEND_API_KEY` ✅ 
- `WORKOS_CLIENT_ID` ✅

### Missing Backend Variables ❌
```
WORKOS_API_KEY=
WORKOS_WEBHOOK_SECRET=
RESEND_AUDIENCE_LIST_ID=
```

### Optional/Optimization Variables
```
NODE_ENV=production
OTEL_SERVICE_NAME=ai-storefront
OTEL_SERVICE_VERSION=1.0.0
PHOENIX_API_KEY=
PHOENIX_COLLECTOR_ENDPOINT=
OPENAI_TRACES_PROXY_URL=
```

---

## 📋 Complete Vercel Environment Variables Checklist

### Frontend (VITE_ prefix - REQUIRED)
```
VITE_CONVEX_URL=https://your-deployment.convex.cloud
VITE_WORKOS_CLIENT_ID=client_your_workos_client_id
```

### Backend (process.env)
```
# Core Convex
CONVEX_DEPLOYMENT=https://your-deployment.convex.cloud
CONVEX_URL=https://your-deployment.convex.cloud

# WorkOS Authentication
WORKOS_CLIENT_ID=client_your_workos_client_id
WORKOS_CLIENT_SECRET=sk_your_workos_client_secret
WORKOS_API_KEY=sk_your_workos_api_key
WORKOS_WEBHOOK_SECRET=your_webhook_secret

# AI Services
OPENAI_API_KEY=sk-proj-your_openai_key

# Email Services
RESEND_API_KEY=re_your_resend_key
RESEND_AUDIENCE_LIST_ID=your_audience_list_id

# Optional/Optimization
NODE_ENV=production
OTEL_SERVICE_NAME=ai-storefront
OTEL_SERVICE_VERSION=1.0.0
```

---

## 🔍 How to Get Missing Values

### 1. VITE_CONVEX_URL
- Same as your `CONVEX_DEPLOYMENT` value
- Format: `https://your-deployment-name.convex.cloud`

### 2. VITE_WORKOS_CLIENT_ID  
- Same as your `WORKOS_CLIENT_ID` value
- Format: `client_xxxxxxxxxxxxxxxx`

### 3. WORKOS_API_KEY
- Go to WorkOS Dashboard → API Keys
- Different from CLIENT_SECRET - this is the API key

### 4. WORKOS_WEBHOOK_SECRET
- Go to WorkOS Dashboard → Webhooks
- Create a webhook endpoint
- Copy the webhook secret

### 5. RESEND_AUDIENCE_LIST_ID
- Go to Resend Dashboard → Audiences
- Create an audience list
- Copy the audience ID

---

## ⚡ Quick Fix Steps

1. **Add the 2 critical VITE_ variables** to Vercel immediately
2. **Add the missing WORKOS variables** for full auth functionality  
3. **Add RESEND_AUDIENCE_LIST_ID** for email subscriptions
4. **Redeploy** your Vercel app

Your app should work much better after adding these! 🚀

