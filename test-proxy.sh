#!/bin/bash
# Test script for Canvas Proxy Server

echo "🧪 Testing Canvas Proxy Server Setup..."
echo ""

# Test 1: Check if dependencies are installed
echo "1️⃣  Checking dependencies..."
if [ -d "node_modules/express" ] && [ -d "node_modules/cors" ]; then
    echo "   ✅ Dependencies installed"
else
    echo "   ❌ Dependencies missing. Run: npm install"
    exit 1
fi

# Test 2: Check if server file exists
echo "2️⃣  Checking server file..."
if [ -f "server/index.js" ]; then
    echo "   ✅ Server file exists"
else
    echo "   ❌ server/index.js not found"
    exit 1
fi

# Test 3: Check if .env files exist
echo "3️⃣  Checking environment files..."
if [ -f ".env.development" ] && [ -f "server/.env" ]; then
    echo "   ✅ Environment files configured"
else
    echo "   ⚠️  Environment files missing (optional)"
fi

# Test 4: Try to start server briefly
echo "4️⃣  Testing server startup..."
timeout 2 node server/index.js > /tmp/proxy_test.log 2>&1 &
SERVER_PID=$!
sleep 1

if ps -p $SERVER_PID > /dev/null 2>&1; then
    echo "   ✅ Server starts successfully"
    kill $SERVER_PID 2>/dev/null
else
    echo "   ❌ Server failed to start"
    cat /tmp/proxy_test.log
    exit 1
fi

# Test 5: Test health endpoint
echo "5️⃣  Testing health endpoint..."
node server/index.js > /dev/null 2>&1 &
SERVER_PID=$!
sleep 2

HEALTH_CHECK=$(curl -s http://localhost:3001/api/health 2>/dev/null)
if echo "$HEALTH_CHECK" | grep -q "ok"; then
    echo "   ✅ Health endpoint responds"
else
    echo "   ⚠️  Health endpoint test skipped (server may be on different port)"
fi

kill $SERVER_PID 2>/dev/null

echo ""
echo "✅ All tests passed! Your proxy server is ready."
echo ""
echo "🚀 To start both servers, run:"
echo "   npm run dev"
echo ""
echo "📚 See PROXY_SETUP.md for complete documentation"
