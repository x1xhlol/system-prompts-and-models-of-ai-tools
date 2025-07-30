const http = require('http');

console.log('🧪 Testing Nowhere AI Agent connection...\n');

// Test health endpoint
const healthRequest = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/health',
  method: 'GET'
}, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('✅ Health check passed:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${response.message}`);
      console.log(`   Version: ${response.version}\n`);
      
      // Test command endpoint
      testCommand();
    } catch (error) {
      console.log('❌ Failed to parse health response');
    }
  });
});

healthRequest.on('error', (error) => {
  console.log('❌ Server not running. Please start the server first:');
  console.log('   node simple-server.js');
});

healthRequest.end();

function testCommand() {
  const commandData = JSON.stringify({
    command: 'Hello Nowhere, show me the project structure'
  });

  const commandRequest = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/command',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(commandData)
    }
  }, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        console.log('✅ Command test passed:');
        console.log(`   Success: ${response.success}`);
        console.log(`   Response: ${response.data.response.substring(0, 100)}...\n`);
        
        console.log('🎉 Nowhere AI Agent is working perfectly!');
        console.log('📝 Next steps:');
        console.log('   1. Open frontend/index.html in your browser');
        console.log('   2. Start chatting with Nowhere!');
        console.log('\n🚀 Server is running on http://localhost:3001');
      } catch (error) {
        console.log('❌ Failed to parse command response');
      }
    });
  });

  commandRequest.on('error', (error) => {
    console.log('❌ Command test failed');
  });

  commandRequest.write(commandData);
  commandRequest.end();
} 