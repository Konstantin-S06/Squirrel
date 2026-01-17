# RESTART SERVER - IMPORTANT!

## The Problem

You're getting an error that says:
```
"Canvas API key required. Include it in X-Canvas-API-Key header."
```

But the current server code expects `access_token` as a query parameter, NOT a header.

This means **an old version of the server is still running**.

## The Fix

**You MUST restart the backend server:**

1. **Find the terminal running `npm run server`**
   - Look for the terminal window where you started the server
   - It should show: `🚀 Backend proxy server running on http://localhost:3001`

2. **Stop the server**
   - Press `Ctrl+C` in that terminal
   - Wait for it to stop completely

3. **Restart the server**
   ```bash
   npm run server
   ```

4. **Verify it restarted**
   You should see:
   ```
   🚀 Backend proxy server running on http://localhost:3001
   📡 Canvas API: https://q.utoronto.ca
   ✅ Health check: http://localhost:3001/api/health
   📝 API endpoint: GET http://localhost:3001/api/canvas/courses?access_token=TOKEN
   ```

5. **Try the request again**
   - Go to the `/courses` page
   - Click "Fetch Courses from Canvas API"
   - Check both browser console AND server console for logs

## How to Check if Server Restarted Correctly

After restarting, test with:
```bash
curl "http://localhost:3001/api/canvas/courses?access_token=test"
```

If you see:
- ✅ `"Access token required..."` = Server restarted correctly
- ❌ `"Canvas API key required. Include it in X-Canvas-API-Key header."` = Server NOT restarted

## Debug Logging Added

I've added debug logging that will show:
- What URL is being called
- If the access_token is present
- What the server receives

Check **both**:
1. **Browser console** (F12 → Console tab)
2. **Server console** (terminal running `npm run server`)

This will help identify what's happening.
