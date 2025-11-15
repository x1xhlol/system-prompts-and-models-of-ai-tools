#!/bin/bash

# AI Prompts Explorer - Web Setup Script
# This script sets up the Next.js web application

set -e

echo "🚀 AI Prompts Explorer - Web Setup"
echo "=================================="
echo ""

# Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v)
echo "Found Node.js: $NODE_VERSION"

if [[ ! "$NODE_VERSION" =~ ^v(22|23|24|25) ]]; then
    echo "⚠️  Warning: Node.js 22+ is recommended (found $NODE_VERSION)"
fi

echo ""

# Check if we're in the web directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the web/ directory"
    exit 1
fi

# Install dependencies
echo "📥 Installing dependencies..."
npm install

echo ""

# Generate metadata if needed
if [ ! -f "data/index.json" ]; then
    echo "📊 Generating metadata..."
    cd ..
    python3 scripts/generate_metadata.py
    mkdir -p web/data
    cp scripts/index.json web/data/
    cd web
    echo "✓ Metadata generated"
else
    echo "✓ Metadata already exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 You can now run the development server:"
echo "   npm run dev"
echo ""
echo "📖 The app will be available at:"
echo "   http://localhost:3000"
echo ""
echo "📚 Other commands:"
echo "   npm run build  - Build for production"
echo "   npm start      - Start production server"
echo "   npm run lint   - Lint code"
echo ""
