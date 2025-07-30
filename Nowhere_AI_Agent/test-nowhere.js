const http = require('http');

console.log('🧪 Testing Nowhere AI Agent...\n');

// Test health endpoint
function testHealth() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Health check passed:', response.status);
          resolve(response);
        } catch (error) {
          console.log('❌ Health check failed:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Health check failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Test command endpoint
function testCommand() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      command: 'analyze this code',
      userId: 'test-user'
    });

    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/command',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Command test passed:', response.message);
          resolve(response);
        } catch (error) {
          console.log('❌ Command test failed:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Command test failed:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Test status endpoint
function testStatus() {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/status',
      method: 'GET'
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Status test passed:', response.data.autopilot ? 'Autopilot enabled' : 'Autopilot disabled');
          resolve(response);
        } catch (error) {
          console.log('❌ Status test failed:', error.message);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Status test failed:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Run all tests
async function runTests() {
  try {
    await testHealth();
    await testCommand();
    await testStatus();
    
    console.log('\n🎉 All tests passed! Nowhere AI Agent is working correctly.');
    console.log('\n📋 Available endpoints:');
    console.log('  • POST /api/v1/command - Process text commands');
    console.log('  • POST /api/v1/voice - Process voice commands');
    console.log('  • POST /api/v1/autopilot - Toggle autopilot mode');
    console.log('  • GET  /api/v1/memory/:userId - Get user memory');
    console.log('  • GET  /api/v1/status - Get system status');
    console.log('  • GET  /health - Health check');
    
  } catch (error) {
    console.log('\n❌ Some tests failed. Make sure the server is running on port 3001.');
    console.log('💡 Start the server with: cd backend && node server.js');
  }
}

runTests(); 