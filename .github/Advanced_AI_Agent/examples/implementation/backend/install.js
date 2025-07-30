const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Nowhere AI Agent Backend...');

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found');
  process.exit(1);
}

// Create logs directory
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
  console.log('✅ Created logs directory');
}

// Create .env file from example if it doesn't exist
if (!fs.existsSync('.env') && fs.existsSync('env.example')) {
  fs.copyFileSync('env.example', '.env');
  console.log('✅ Created .env file from env.example');
}

console.log('📦 Installing dependencies...');
try {
  // Try to install dependencies
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  console.log('💡 Try running: npm install manually');
}

console.log('🎯 Nowhere AI Agent Backend setup complete!');
console.log('📝 Next steps:');
console.log('   1. Edit .env file with your API keys');
console.log('   2. Run: npm run dev');
console.log('   3. Access the API at http://localhost:3001'); 