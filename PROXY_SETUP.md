# Canvas Proxy Server Setup Guide

## Overview

This Express proxy server solves the CORS issue when connecting to Canvas LMS API from the browser. Canvas blocks direct browser requests, so we proxy them through a Node.js server.

## Architecture

```
Browser (localhost:3000) 
    ↓ (No CORS issues - same origin policy allows this)
Proxy Server (localhost:3001)
    ↓ (Server-to-server request - no CORS restrictions)
Canvas API (q.utoronto.ca)
```

## Quick Start

### Option 1: Run Both Servers Together (Recommended)

```bash
npm run dev
```

This starts:
- ✅ React app on `http://localhost:3000`
- ✅ Proxy server on `http://localhost:3001`

### Option 2: Run Servers Separately

**Terminal 1 - Start Proxy:**
```bash
npm run proxy
```

**Terminal 2 - Start React App:**
```bash
npm start
```

## Files Changed

### 1. `server/index.js`
- Complete Express proxy implementation
- Handles ALL Canvas API routes with wildcard routing
- Proper CORS configuration
- Detailed logging for debugging

### 2. `src/services/canvasConfig.ts`
- Updated to use proxy by default (`USE_PROXY = true`)
- All Canvas API functions now route through proxy
- Better error messages for debugging

### 3. `.env.development`
```
REACT_APP_PROXY_URL=http://localhost:3001/api/canvas
```

### 4. `server/.env`
```
FRONTEND_URL=http://localhost:3000
PROXY_PORT=3001
```

### 5. `package.json`
Added scripts:
- `npm run proxy` - Start proxy server only
- `npm run dev` - Start both servers concurrently

## How It Works

### Request Flow

1. **Browser makes request:**
   ```javascript
   fetch('http://localhost:3001/api/canvas/api/v1/users/self', {
     headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
   })
   ```

2. **Proxy receives and forwards:**
   ```javascript
   // Proxy extracts path: /api/v1/users/self
   // Forwards to: https://q.utoronto.ca/api/v1/users/self
   ```

3. **Canvas responds to proxy:**
   ```
   Canvas API → Proxy Server (200 OK with user data)
   ```

4. **Proxy forwards back to browser:**
   ```
   Proxy → Browser (200 OK with user data)
   ```

## API Endpoints

### Health Check
```bash
GET http://localhost:3001/api/health
```

Response:
```json
{
  "status": "ok",
  "message": "Canvas proxy server is running",
  "port": 3001,
  "timestamp": "2026-02-27T10:30:00.000Z",
  "canvasDomain": "https://q.utoronto.ca"
}
```

### Canvas Proxy (All Routes)
```bash
GET/POST/PUT/DELETE http://localhost:3001/api/canvas/*
```

Examples:
```bash
# Get user profile
GET /api/canvas/api/v1/users/self

# Get courses
GET /api/canvas/api/v1/courses?enrollment_state=active

# Get assignments
GET /api/canvas/api/v1/courses/12345/assignments
```

## Testing the Proxy

### 1. Check Proxy is Running
```bash
curl http://localhost:3001/api/health
```

### 2. Test Canvas API Call
```bash
curl -H "Authorization: Bearer YOUR_CANVAS_TOKEN" \
  http://localhost:3001/api/canvas/api/v1/users/self
```

### 3. Check Console Logs
The proxy logs every request:
```
📡 Proxying GET request to Canvas:
   Path: /api/v1/users/self
   Full URL: https://q.utoronto.ca/api/v1/users/self
   Token: Bearer 11170~abc...
   ✅ Canvas response: 200 OK
```

## Troubleshooting

### Proxy Server Won't Start

**Error:** `EADDRINUSE: address already in use :::3001`

**Solution:** Kill the process on port 3001
```bash
lsof -ti:3001 | xargs kill -9
```

### Cannot Connect to Proxy

**Error in browser console:**
```
Failed to fetch
Cannot connect to proxy server. Make sure it is running on port 3001.
```

**Solution:**
1. Check proxy is running: `curl http://localhost:3001/api/health`
2. Start proxy if not running: `npm run proxy`
3. Check `.env.development` has correct URL

### Canvas API Returns 401

**Error:** `Canvas API Error: 401 Unauthorized`

**Solutions:**
- Your Canvas token is invalid or expired
- Generate a new token from Canvas settings
- Make sure token is correctly saved in Firestore

### CORS Errors Still Appearing

If you still see CORS errors, it means:
1. The proxy isn't running
2. `USE_PROXY` is set to `false` in `canvasConfig.ts`
3. The frontend is trying to call Canvas directly

**Solution:** Set `USE_PROXY = true` in `canvasConfig.ts`

## Production Deployment

### Environment Variables

**Frontend (Vercel, Netlify, etc.):**
```bash
REACT_APP_PROXY_URL=https://your-api-domain.com/api/canvas
```

**Backend (Heroku, Railway, etc.):**
```bash
FRONTEND_URL=https://your-app-domain.com
PORT=8080  # Or whatever your host requires
```

### Update CORS Origins

In `server/index.js`, add your production domains:
```javascript
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:3000',
  'https://your-deployed-app.vercel.app'
];
```

## Security Notes

- ✅ Tokens are sent in Authorization headers (not query params)
- ✅ CORS is properly configured to only allow your frontend
- ✅ No token logging (only first 20 chars for debugging)
- ⚠️ Don't commit `.env` files to Git (add to `.gitignore`)
- ⚠️ Use HTTPS in production

## Benefits of This Approach

✅ **No CORS Issues** - Browser talks to same-origin proxy
✅ **Secure** - Tokens stay in headers
✅ **Flexible** - Supports all Canvas API endpoints
✅ **Easy Development** - Run both servers with one command
✅ **Production Ready** - Environment variable support

## Next Steps

1. ✅ Start the proxy: `npm run dev`
2. ✅ Go to Canvas Setup page in your app
3. ✅ Enter your Canvas API token
4. ✅ Watch the console logs - you should see successful requests!

Now your Canvas integration should work perfectly! 🎉
