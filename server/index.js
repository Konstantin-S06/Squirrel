/**
 * Express Proxy Server for Canvas API
 *
 * This server proxies Canvas API requests to avoid CORS issues.
 * Canvas API blocks direct browser requests, so we make requests server-side.
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || process.env.PROXY_PORT || 3001;
const CANVAS_DOMAIN = 'https://q.utoronto.ca';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Configure CORS
const allowedOrigins = [
  FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(null, true); // Allow anyway for development
    }
  },
  credentials: true
}));

app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Canvas proxy server is running',
    port: PORT,
    timestamp: new Date().toISOString(),
    canvasDomain: CANVAS_DOMAIN
  });
});

// Universal Canvas API proxy - handles ALL Canvas API routes
app.all('/api/canvas/*', async (req, res) => {
  try {
    // Extract the Canvas API path from the request
    const canvasPath = req.path.replace('/api/canvas', '');

    // Get authorization token from header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log('❌ No authorization header found');
      return res.status(401).json({
        error: 'Authorization header required',
        hint: 'Add header: Authorization: Bearer YOUR_TOKEN'
      });
    }

    // Build the full Canvas URL
    const queryString = new URLSearchParams(req.query).toString();
    const canvasUrl = `${CANVAS_DOMAIN}${canvasPath}${queryString ? '?' + queryString : ''}`;

    console.log(`📡 Proxying ${req.method} request to Canvas:`);
    console.log(`   Path: ${canvasPath}`);
    console.log(`   Full URL: ${canvasUrl}`);
    console.log(`   Token: ${authHeader.substring(0, 20)}...`);

    // Make the request to Canvas API
    const response = await fetch(canvasUrl, {
      method: req.method,
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    });

    console.log(`   ✅ Canvas response: ${response.status} ${response.statusText}`);

    // Get response data
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Forward the response from Canvas
    res.status(response.status).json(data);

  } catch (error) {
    console.error('❌ Canvas proxy error:', error.message);
    res.status(500).json({
      error: 'Failed to proxy Canvas API request',
      message: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ====================================');
  console.log('   Canvas Proxy Server Started');
  console.log('🚀 ====================================');
  console.log(`   Server: http://localhost:${PORT}`);
  console.log(`   Canvas: ${CANVAS_DOMAIN}`);
  console.log(`   Frontend: ${FRONTEND_URL}`);
  console.log('');
  console.log('📍 Endpoints:');
  console.log(`   Health: GET http://localhost:${PORT}/api/health`);
  console.log(`   Canvas: * http://localhost:${PORT}/api/canvas/*`);
  console.log('');
  console.log('💡 Usage:');
  console.log('   Add header: Authorization: Bearer YOUR_CANVAS_TOKEN');
  console.log('   Example: GET /api/canvas/api/v1/users/self');
  console.log('');
});
