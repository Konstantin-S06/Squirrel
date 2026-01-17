# Backend Proxy Server Setup

This project includes a backend Express proxy server to resolve CORS issues with the Canvas API.

## Installation

Install the backend dependencies:

```bash
npm install
```

This will install:
- `express` - Web server framework
- `axios` - HTTP client for Canvas API requests
- `cors` - CORS middleware
- `dotenv` - Environment variable management
- `concurrently` - Run frontend and backend together (dev dependency)
- `nodemon` - Auto-restart server on changes (dev dependency)

## Running the Server

### Option 1: Run Both Frontend and Backend Together (Recommended for Development)

```bash
npm run dev
```

This will start both:
- Backend proxy server on `http://localhost:3001`
- React frontend on `http://localhost:3000`

### Option 2: Run Server Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm start
```

### Option 3: Development Mode with Auto-Reload

```bash
npm run server:dev
```

This uses `nodemon` to auto-restart the server when files change.

## Environment Variables

Create a `.env` file in the root directory (optional):

```env
PORT=3001
REACT_APP_PROXY_URL=http://localhost:3001
REACT_APP_USE_PROXY=true
```

The frontend will automatically use the proxy if `REACT_APP_USE_PROXY` is set to `true` (default).

## How It Works

1. **Frontend Request**: React app makes a request to `/api/canvas/*` on the backend proxy
2. **Backend Proxy**: Express server receives the request, adds the Canvas API key from the `X-Canvas-API-Key` header
3. **Canvas API**: Backend makes the actual request to Canvas API (no CORS issues)
4. **Response**: Backend forwards Canvas API response back to frontend

## API Endpoints

### Health Check
```
GET /api/health
```

### Canvas API Proxy
```
GET /api/canvas/api/v1/courses
POST /api/canvas/api/v1/...
```

**Headers Required:**
- `X-Canvas-API-Key`: Your Canvas API token

**Example:**
```javascript
fetch('http://localhost:3001/api/canvas/api/v1/courses?enrollment_state=active', {
  headers: {
    'X-Canvas-API-Key': 'your-api-key-here',
    'Content-Type': 'application/json'
  }
})
```

## Troubleshooting

### Port Already in Use

If port 3001 is already in use, change it in `.env`:
```env
PORT=3002
```

And update `REACT_APP_PROXY_URL` in your frontend `.env`:
```env
REACT_APP_PROXY_URL=http://localhost:3002
```

### CORS Errors Still Occurring

1. Make sure the backend server is running
2. Check that `REACT_APP_USE_PROXY=true` in your `.env` file
3. Verify the proxy URL matches the server port
4. Check browser console for specific error messages

### Connection Refused

- Ensure the backend server is running before starting the frontend
- Verify the proxy URL in `canvasService.ts` matches your server port
- Check that no firewall is blocking the connection

## Production Deployment

For production, you'll need to:

1. **Deploy the backend server** to a hosting service (Heroku, Railway, Render, etc.)
2. **Update the proxy URL** in your frontend environment variables
3. **Set up environment variables** on your hosting platform
4. **Enable CORS** only for your frontend domain

### Example Deployment (Heroku)

```bash
# Install Heroku CLI
heroku create squirrel-canvas-proxy

# Set environment variables
heroku config:set PORT=3001

# Deploy
git push heroku main
```

Then update your frontend `.env.production`:
```env
REACT_APP_PROXY_URL=https://squirrel-canvas-proxy.herokuapp.com
```
