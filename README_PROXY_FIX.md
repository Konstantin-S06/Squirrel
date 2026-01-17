# Proxy Configuration Fix

## Problem Identified

The frontend was receiving HTML instead of JSON from `/api/*` endpoints because:

1. **No proxy configuration**: React Scripts (Create React App) doesn't automatically proxy API requests
2. **Missing setupProxy.js**: Without a proxy setup, `/api/*` requests hit the React dev server, which returns `index.html` (HTML) for unmatched routes
3. **Hardcoded ports**: Ports were hardcoded in multiple places, making configuration difficult

## Solution Implemented

### 1. Created Frontend Proxy (`src/setupProxy.js`)

**What it does:**
- Automatically forwards all `/api/*` requests from frontend dev server to backend on port 3001
- Only works in development (Create React App feature)
- Detects HTML responses and returns JSON errors instead

**How it works:**
```javascript
// All requests to /api/* are forwarded to backend
fetch('/api/health') → http://localhost:3001/api/health
```

### 2. Centralized Port Configuration (`config/ports.js`)

**What it does:**
- Single source of truth for all port configuration
- Reads from environment variables
- Falls back to sensible defaults

**Configuration:**
- Backend: Port 3001 (via `PORT` or `BACKEND_PORT` env var)
- Frontend: Port 3000 (via `REACT_APP_PORT` or `FRONTEND_PORT` env var)
- Backend URL: `http://localhost:3001` (via `REACT_APP_PROXY_URL` or `BACKEND_URL` env var)

### 3. Backend Improvements (`server/index.js`)

**What was fixed:**
- ✅ Always returns JSON (never HTML) for all API routes
- ✅ Proper CORS headers for frontend requests
- ✅ Health check endpoint at `/api/health`
- ✅ 404 handler returns JSON (not HTML)
- ✅ Better error messages

**New endpoint:**
```bash
GET /api/health
# Returns: { "status": "ok", "message": "Backend API server is running", "port": 3001 }
```

### 4. Improved Error Handling (`src/utils/apiClient.ts`)

**What it does:**
- Detects HTML responses automatically
- Provides clear error messages when backend is unreachable
- Centralized API request utility

**Usage:**
```typescript
import { apiRequest, checkBackendHealth } from './utils/apiClient';

// Check if backend is running
const isHealthy = await checkBackendHealth();

// Make API request (auto-detects HTML errors)
const data = await apiRequest('/api/health');
```

## How to Use

### Development

1. **Start backend server** (Terminal 1):
   ```bash
   npm run server
   ```
   Server starts on port 3001

2. **Start frontend dev server** (Terminal 2):
   ```bash
   npm start
   ```
   Frontend starts on port 3000 (or 3002 if configured)

3. **Or run both together**:
   ```bash
   npm run dev
   ```

### Testing

1. **Test health check**:
   ```bash
   curl http://localhost:3001/api/health
   ```
   Should return JSON: `{"status":"ok",...}`

2. **Test from frontend**:
   ```javascript
   fetch('/api/health')
     .then(r => r.json())
     .then(console.log);
   ```

## Configuration

### Environment Variables

**Backend (.env in root):**
```env
PORT=3001
BACKEND_PORT=3001
```

**Frontend (.env in root):**
```env
REACT_APP_PORT=3000
REACT_APP_PROXY_URL=http://localhost:3001
```

### Port Configuration File

Edit `config/ports.js` to change default ports:

```javascript
module.exports = {
  BACKEND_PORT: 3001,
  FRONTEND_PORT: 3000,
  BACKEND_URL: 'http://localhost:3001',
};
```

## Architecture

```
Frontend (port 3000/3002)
  ↓ fetch('/api/health')
React Dev Server
  ↓ setupProxy.js forwards to
Backend (port 3001)
  ↓ returns JSON
Frontend receives JSON ✅
```

**Before (broken):**
```
Frontend (port 3000)
  ↓ fetch('/api/health')
React Dev Server
  ↓ no proxy configured
React Dev Server returns index.html ❌
Frontend receives HTML ❌
```

## Production

For production, you'll need a different setup:

1. **Build frontend**: `npm run build`
2. **Serve static files**: Use nginx/Apache to serve frontend
3. **API proxy**: Configure nginx to proxy `/api/*` to backend server
4. **Or**: Deploy backend separately and update `REACT_APP_PROXY_URL` to production URL

## Files Changed

1. ✅ `src/setupProxy.js` - Created (frontend proxy configuration)
2. ✅ `config/ports.js` - Created (centralized port config)
3. ✅ `server/index.js` - Updated (better error handling, JSON responses)
4. ✅ `src/utils/apiClient.ts` - Created (API client with HTML detection)
5. ✅ `src/services/canvasService.ts` - Updated (use relative paths for proxy)

## Verification

To verify the fix works:

1. Start backend: `npm run server`
2. Start frontend: `npm start`
3. Open browser console
4. Run: `fetch('/api/health').then(r => r.json()).then(console.log)`
5. Should see: `{status: "ok", ...}` (JSON, not HTML)

If you see HTML, the backend isn't running or proxy isn't configured correctly.
