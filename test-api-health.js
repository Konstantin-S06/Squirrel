/**
 * Test API Health Check Endpoint
 * 
 * Tests that the backend server is running and returning JSON (not HTML)
 * 
 * Usage:
 *   node test-api-health.js
 */

const http = require('http');
const portConfig = require('./config/ports');

const BACKEND_URL = portConfig.BACKEND_URL.replace('http://', '').replace('https://', '');
const [host, port] = BACKEND_URL.split(':');

const options = {
  hostname: host || 'localhost',
  port: parseInt(port) || 3001,
  path: '/api/health',
  method: 'GET',
  timeout: 2000,
  headers: {
    'Accept': 'application/json',
  },
};

console.log(`\n🔍 Testing backend health check...`);
console.log(`   URL: http://${options.hostname}:${options.port}${options.path}\n`);

const req = http.request(options, (res) => {
  let data = '';
  const contentType = res.headers['content-type'] || '';
  const isJson = contentType.includes('application/json');

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Content-Type: ${contentType}`);

    // Check if we got HTML instead of JSON
    if (data.includes('<!DOCTYPE') || data.includes('<html') || data.includes('<head>')) {
      console.error(`\n❌ ERROR: Backend returned HTML instead of JSON!`);
      console.error(`   This means the backend server is not running or not configured correctly.`);
      console.error(`   Response preview: ${data.substring(0, 200)}`);
      console.error(`\n   Fix: Start the backend server with: npm run server\n`);
      process.exit(1);
    }

    if (!isJson) {
      console.error(`\n❌ ERROR: Expected JSON but got ${contentType}`);
      console.error(`   Response: ${data.substring(0, 200)}`);
      process.exit(1);
    }

    try {
      const json = JSON.parse(data);
      console.log(`\n✅ SUCCESS: Backend is running and returning JSON!`);
      console.log(`   Response:`, JSON.stringify(json, null, 2));
      console.log(`\n   Backend server is healthy and properly configured.\n`);
      process.exit(0);
    } catch (error) {
      console.error(`\n❌ ERROR: Response is not valid JSON`);
      console.error(`   Response: ${data.substring(0, 200)}`);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error(`\n❌ ERROR: Cannot connect to backend server`);
  console.error(`   Error: ${error.message}`);
  console.error(`\n   Make sure the backend server is running:`);
  console.error(`   npm run server\n`);
  process.exit(1);
});

req.on('timeout', () => {
  console.error(`\n❌ ERROR: Connection timeout`);
  console.error(`   Backend server may not be running or is unresponsive.`);
  console.error(`\n   Try: npm run server\n`);
  req.destroy();
  process.exit(1);
});

req.end();
