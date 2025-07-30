#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Nowhere AI Agent Backend...\n');

// Create comprehensive package.json
const packageJson = {
  "name": "nowhere-backend",
  "version": "1.0.0",
  "description": "Advanced Nowhere AI Agent Backend with TypeScript",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "dev:watch": "nodemon --exec ts-node src/index.ts",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "dotenv": "^16.3.1",
    "socket.io": "^4.7.4",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "winston": "^3.11.0",
    "rate-limiter-flexible": "^3.0.8",
    "redis": "^4.6.10",
    "pg": "^8.11.3",
    "openai": "^4.20.1",
    "@anthropic-ai/sdk": "^0.9.1",
    "axios": "^1.6.2",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/compression": "^1.7.5",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/bcryptjs": "^2.4.6",
    "@types/multer": "^1.4.11",
    "@types/uuid": "^9.0.7",
    "@types/pg": "^8.10.9",
    "typescript": "^5.3.2",
    "ts-node": "^10.9.1",
    "nodemon": "^3.0.1",
    "eslint": "^8.55.0",
    "@typescript-eslint/eslint-plugin": "^6.13.1",
    "@typescript-eslint/parser": "^6.13.1",
    "prettier": "^3.1.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.8"
  },
  "keywords": [
    "ai",
    "coding-assistant",
    "voice-integration",
    "autopilot",
    "nowhere",
    "typescript"
  ],
  "author": "Nowhere Team",
  "license": "MIT"
};

// Create TypeScript config
const tsConfig = {
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
};

// Create directory structure
const directories = [
  'src',
  'src/core',
  'src/memory',
  'src/tools',
  'src/voice',
  'src/routes',
  'src/middleware',
  'src/utils',
  'logs',
  'dist'
];

console.log('📁 Creating directory structure...');
directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  ✅ Created: ${dir}`);
  }
});

// Write package.json
console.log('\n📦 Creating package.json...');
fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('  ✅ Created: package.json');

// Write tsconfig.json
console.log('\n⚙️ Creating TypeScript configuration...');
fs.writeFileSync('tsconfig.json', JSON.stringify(tsConfig, null, 2));
console.log('  ✅ Created: tsconfig.json');

// Create .env.example
const envExample = `# AI Models
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Database (Optional - for full features)
REDIS_URL=redis://localhost:6379
POSTGRES_URL=postgresql://username:password@localhost:5432/nowhere_db

# Security
JWT_SECRET=your_jwt_secret_here
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100

# Voice (Optional)
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=your_azure_region_here

# Server Configuration
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
`;

console.log('\n🔧 Creating environment template...');
fs.writeFileSync('env.example', envExample);
console.log('  ✅ Created: env.example');

// Create .gitignore
const gitignore = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build output
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
`;

console.log('\n🚫 Creating .gitignore...');
fs.writeFileSync('.gitignore', gitignore);
console.log('  ✅ Created: .gitignore');

console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('  ✅ Dependencies installed successfully');
} catch (error) {
  console.log('  ⚠️ npm install failed, but setup is complete');
  console.log('  💡 You can run "npm install" manually later');
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('  1. Copy env.example to .env and add your API keys');
console.log('  2. Run: npm run build');
console.log('  3. Run: npm run dev');
console.log('  4. Open frontend/index.html in your browser');
console.log('\n🚀 Nowhere AI Agent is ready to launch!'); 