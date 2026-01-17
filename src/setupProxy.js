/**
 * Setup Proxy for Create React App (React Scripts)
 * 
 * This file configures the development proxy to forward API requests
 * from the frontend dev server to the backend API server.
 * 
 * PROBLEM FIXED:
 * - Before: Frontend fetched /api/* which hit React dev server -> returned index.html (HTML)
 * - After: Frontend fetches /api/* which gets proxied to backend -> returns JSON
 * 
 * HOW IT WORKS:
 * - All requests to /api/* from the frontend are automatically forwarded
 *   to the backend server at http://localhost:3001
 * - This only works in development; production needs a different setup
 */

const { createProxyMiddleware } = require('http-proxy-middleware');
const portConfig = require('../config/ports');

module.exports = function(app) {
  const backendUrl = portConfig.BACKEND_URL;
  const backendPort = portConfig.BACKEND_PORT;
  
  console.log(`🔗 Setting up proxy: /api/* -> ${backendUrl}`);

  // Proxy all /api/* requests to the backend server
  app.use(
    '/api',
    createProxyMiddleware({
      target: backendUrl,
      changeOrigin: true,
      // Don't rewrite the path - keep /api in the request
      // Backend expects /api/health, /api/canvas/*, etc.
      pathRewrite: {
        '^/api': '/api', // Keep /api prefix
      },
      // Log proxy activity in development
      logLevel: 'debug',
      // Handle errors gracefully
      onError: (err, req, res) => {
        console.error('❌ Proxy error:', err.message);
        res.status(500).json({
          error: 'Backend server unreachable',
          message: `Cannot connect to backend at ${backendUrl}. Make sure the server is running with: npm run server`,
          details: err.message,
        });
      },
      // Handle proxy response
      onProxyRes: (proxyRes, req, res) => {
        // Ensure all API responses are JSON (never HTML)
        const contentType = proxyRes.headers['content-type'] || '';
        if (contentType.includes('text/html')) {
          console.error('⚠️ Backend returned HTML instead of JSON for:', req.path);
          // Don't send HTML - return error JSON instead
          res.status(500).json({
            error: 'Backend returned HTML instead of JSON',
            message: 'The backend server may not be running correctly',
            path: req.path,
          });
          return;
        }
        
        // Ensure content-type is set to JSON for all API responses
        if (!contentType.includes('application/json')) {
          proxyRes.headers['content-type'] = 'application/json';
        }
      },
    })
  );
};
