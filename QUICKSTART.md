# 🚀 Quick Start - Canvas Proxy Server

## Your Canvas proxy is ready! Here's how to use it:

### Start Everything
```bash
npm run dev
```

**That's it!** Both servers will start:
- React app: http://localhost:3000
- Proxy server: http://localhost:3001

### Test Canvas Connection

1. Open http://localhost:3000 in your browser
2. Navigate to Canvas Setup page
3. Enter your Canvas API token
4. Click "Save Canvas Token"
5. Watch the browser console - you should see:
   ```
   Fetching Canvas courses from: proxy
   Canvas courses response status: 200
   Successfully connected! Found X courses.
   ```

### If You Get Errors

**"Cannot connect to proxy server"**
- The proxy isn't running
- Open a new terminal and run: `npm run proxy`

**"Canvas API Error: 401"**
- Your Canvas token is invalid or expired
- Get a new token from Canvas Settings

**CORS errors**
- Make sure you're using `npm run dev` (not just `npm start`)
- Check `canvasConfig.ts` has `USE_PROXY = true`

### What Changed?

✅ **Before**: Direct Canvas API → CORS errors ❌  
✅ **Now**: Browser → Proxy → Canvas → Success! ✅

---

**Need more help?** See `PROXY_SETUP.md` for complete documentation.

**Ready?** Run `npm run dev` and test your Canvas connection! 🎉
