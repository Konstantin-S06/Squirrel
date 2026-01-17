/**
 * Simple Express Backend Proxy for Canvas API
 * 
 * This server proxies Canvas API requests to avoid CORS issues.
 * Canvas API blocks direct browser requests, so we make the request server-side.
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;
const CANVAS_DOMAIN = 'https://q.utoronto.ca';

// Enable CORS for frontend requests
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend proxy server is running',
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// IMPORTANT: Put specific routes BEFORE wildcard routes
// Proxy endpoint for Canvas courses API
// Accepts access_token as query parameter
app.get('/api/canvas/courses', async (req, res) => {
  try {
    // Debug logging
    console.log('=== Canvas Courses API Request ===');
    console.log('Path:', req.path);
    console.log('Query params:', req.query);
    console.log('Headers:', Object.keys(req.headers));
    
    // Get access_token from query parameter
    const accessToken = req.query.access_token;
    
    if (!accessToken) {
      console.log('❌ No access_token found in query parameters');
      return res.status(401).json({ 
        error: 'Access token required. Include access_token as query parameter.',
        received: {
          query: req.query,
          path: req.path,
        }
      });
    }
    
    console.log('✅ Access token found:', accessToken.substring(0, 10) + '...');

    // Forward query parameters from the request
    const enrollmentState = req.query.enrollment_state || 'active';
    const perPage = req.query.per_page || '100';
    
    // Build Canvas API URL with access_token as query parameter
    const canvasUrl = `${CANVAS_DOMAIN}/api/v1/courses?access_token=${accessToken}&enrollment_state=${enrollmentState}&per_page=${perPage}`;
    
    console.log(`Proxying request to Canvas: ${CANVAS_DOMAIN}/api/v1/courses`);
    console.log(`   Access token: ${accessToken.substring(0, 10)}...`);

    // Make the request to Canvas API (server-side, no CORS issues)
    const response = await axios({
      method: 'GET',
      url: canvasUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      // Don't validate status - forward whatever Canvas returns
      validateStatus: () => true,
    });

    console.log(`   Canvas response status: ${response.status}`);

    // Forward the response from Canvas
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Canvas proxy error:', error.message);
    res.status(500).json({ 
      error: 'Failed to proxy Canvas API request',
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Canvas API: ${CANVAS_DOMAIN}`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`📝 API endpoint: GET http://localhost:${PORT}/api/canvas/courses?access_token=TOKEN`);
});
