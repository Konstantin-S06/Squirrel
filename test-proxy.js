/**
 * Simple test script to check if the proxy server is running
 */

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('✅ Proxy server is running!');
      console.log('Response:', json);
      process.exit(0);
    } catch (error) {
      console.log('❌ Proxy server returned invalid JSON');
      console.log('Response:', data.substring(0, 200));
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Proxy server is NOT running on port 3001');
  console.log('Error:', error.message);
  console.log('\nTo start it, run: npm run server\n');
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Connection to proxy server timed out');
  console.log('Make sure the server is running: npm run server\n');
  req.destroy();
  process.exit(1);
});

req.end();
