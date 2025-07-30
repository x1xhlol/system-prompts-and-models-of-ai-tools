const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Nowhere AI Agent...\n');

// Check if we're in the right directory
if (!fs.existsSync('backend/server.js')) {
  console.error('❌ Please run this script from the Nowhere_AI_Agent directory');
  process.exit(1);
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { cwd: 'backend', stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.log('⚠️  Dependencies installation failed, but you can still run the server\n');
}

// Create logs directory
if (!fs.existsSync('backend/logs')) {
  fs.mkdirSync('backend/logs');
  console.log('✅ Created logs directory');
}

console.log('🎯 Nowhere AI Agent setup complete!\n');
console.log('📝 To start Nowhere:');
console.log('   1. Run: cd backend && node server.js');
console.log('   2. Open: frontend/index.html in your browser');
console.log('   3. Start chatting with Nowhere!\n');

console.log('🔧 Available commands:');
console.log('   • "Hello Nowhere, show me the project structure"');
console.log('   • "Nowhere, analyze this code file"');
console.log('   • "Create a new component for the user interface"');
console.log('   • "Run the tests and show me the results"');
console.log('   • "Enable autopilot mode"\n');

console.log('🚀 Starting server...');
try {
  execSync('node server.js', { cwd: 'backend', stdio: 'inherit' });
} catch (error) {
  console.log('✅ Server stopped');
} 