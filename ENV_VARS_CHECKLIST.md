# Environment Variables Checklist for Vercel

Copy this checklist and fill in your actual values before adding them to Vercel.

## ✅ Required Environment Variables

### 1. Convex Backend URLs
```
CONVEX_DEPLOYMENT=
CONVEX_URL=
```
**How to get**: Run `pnpm run convex:deploy` - both should be set to the same URL it outputs

---

### 2. WorkOS Authentication
```
WORKOS_CLIENT_ID=
WORKOS_CLIENT_SECRET=
```
**How to get**: https://dashboard.workos.com/ → Configuration → API Keys

---

### 3. OpenAI
```
OPENAI_API_KEY=
```
**How to get**: https://platform.openai.com/api-keys → Create new secret key

---

### 4. Cohere (for embeddings/RAG)
```
COHERE_API_KEY=
```
**How to get**: https://dashboard.cohere.ai/api-keys → Create new API key

---

### 5. Resend (for emails)
```
RESEND_API_KEY=
```
**How to get**: https://resend.com/api-keys → Create API Key

---

## 📝 Quick Setup Steps

1. **Deploy Convex first**:
   ```bash
   pnpm run convex:deploy
   ```
   → Copy the deployment URL for items #1

2. **Gather API keys** from the links above for items #2-5

3. **Add to Vercel**:
   - Go to your Vercel project → Settings → Environment Variables
   - Add each variable above
   - Select "Production", "Preview", and "Development" environments

4. **Deploy to Vercel**!

## 🔍 Where These Are Used

- **CONVEX_DEPLOYMENT/URL**: Connects frontend to your Convex backend
- **WORKOS_CLIENT_ID/SECRET**: Powers user authentication
- **OPENAI_API_KEY**: AI chat responses (GPT-4o models)
- **COHERE_API_KEY**: Vector embeddings for RAG search
- **RESEND_API_KEY**: Email notifications and subscriptions


