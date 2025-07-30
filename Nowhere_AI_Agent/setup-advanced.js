const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Advanced Nowhere AI Agent...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Please run this script from the Nowhere_AI_Agent directory');
  process.exit(1);
}

// Create necessary directories
const directories = [
  'logs',
  'dist',
  'src/prompts',
  'src/config'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created directory: ${dir}`);
  }
});

// Copy environment file if it doesn't exist
if (!fs.existsSync('.env') && fs.existsSync('env.example')) {
  fs.copyFileSync('env.example', '.env');
  console.log('✅ Created .env file from env.example');
  console.log('📝 Please edit .env file with your API keys and configuration');
}

// Create system prompt file
const systemPromptPath = 'src/prompts/system_prompt.md';
if (!fs.existsSync(systemPromptPath)) {
  const systemPrompt = `# Nowhere AI Agent System Prompt

You are Nowhere, an advanced AI coding assistant with the following capabilities:

## Core Identity
- **Name**: Nowhere
- **Role**: Advanced AI coding assistant
- **Knowledge Cutoff**: 2025-07-28
- **Adaptive**: Continuously learning and improving

## Capabilities
- Multi-modal context understanding
- Autonomous problem solving
- Persistent memory system
- Planning-driven execution
- Adaptive learning system
- Voice integration
- Autopilot mode

## Response Guidelines
- Be concise but comprehensive
- Provide actionable solutions
- Maintain context awareness
- Adapt to user preferences
- Use natural, conversational tone

Always respond as Nowhere, the advanced AI coding assistant.`;

  fs.writeFileSync(systemPromptPath, systemPrompt);
  console.log('✅ Created system prompt file');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  console.log('💡 Try running: npm install manually');
}

// Build TypeScript
console.log('\n🔨 Building TypeScript...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ TypeScript build successful');
} catch (error) {
  console.error('❌ Failed to build TypeScript:', error.message);
  console.log('💡 Make sure TypeScript is installed: npm install -g typescript');
}

console.log('\n🎯 Advanced Nowhere AI Agent setup complete!\n');
console.log('📝 Next steps:');
console.log('   1. Edit .env file with your API keys');
console.log('   2. Start Redis and PostgreSQL (optional for full features)');
console.log('   3. Run: npm run dev');
console.log('   4. Access the API at http://localhost:3001');
console.log('   5. Open frontend/index.html in your browser\n');

console.log('🔧 Available commands:');
console.log('   npm run dev     - Start development server');
console.log('   npm run build   - Build for production');
console.log('   npm start       - Start production server');
console.log('   npm test        - Run tests\n');

console.log('🚀 Features available:');
console.log('   ✅ Advanced AI processing');
console.log('   ✅ Voice command integration');
console.log('   ✅ Autopilot mode');
console.log('   ✅ Persistent memory system');
console.log('   ✅ Real-time WebSocket communication');
console.log('   ✅ Multi-model AI support');
console.log('   ✅ Security & authentication');
console.log('   ✅ Rate limiting & protection');
console.log('   ✅ Comprehensive logging');
console.log('   ✅ Error handling & recovery\n');

console.log('🎉 Nowhere AI Agent is ready to use!'); 