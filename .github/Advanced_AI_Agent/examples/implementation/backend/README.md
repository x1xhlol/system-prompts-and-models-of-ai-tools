# 🚀 Nowhere AI Agent Backend

Advanced AI coding assistant backend with voice integration, autopilot mode, and adaptive learning capabilities.

## 🎯 Features

- **Voice Command Processing** - Natural language voice commands
- **Autopilot Mode** - Autonomous task execution
- **Adaptive Learning** - Memory system with persistent context
- **Multi-Model Support** - OpenAI GPT-4.1+ and Anthropic Claude 3.5 Sonnet
- **Real-time Communication** - WebSocket support for live collaboration
- **Rate Limiting** - Protection against abuse
- **Comprehensive Logging** - Structured logging with Winston

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │◄──►│  Nowhere API    │◄──►│  AI Models      │
│   (React/Web)   │    │   (Express)     │    │  (OpenAI/Claude)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Voice APIs     │    │  Memory System  │    │  Tool Executor  │
│  (Speech/Text)  │    │   (Redis/DB)    │    │  (File/Code)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Redis (for memory and rate limiting)
- PostgreSQL (optional, for persistent storage)
- OpenAI API key
- Anthropic API key

### Installation

1. **Clone and install dependencies:**
```bash
cd Advanced_AI_Agent/implementation/backend
npm install
```

2. **Set up environment variables:**
```bash
cp env.example .env
# Edit .env with your API keys and configuration
```

3. **Start the development server:**
```bash
npm run dev
```

The server will start on `http://localhost:3001`

## 📋 API Endpoints

### Core Commands

#### Process Command
```http
POST /api/v1/command
Content-Type: application/json

{
  "command": "Create a React component for user authentication",
  "context": {
    "userId": "user123",
    "projectId": "project456",
    "currentFile": "src/components/Auth.jsx",
    "codebase": {...},
    "userPreferences": {...}
  }
}
```

#### Voice Command Processing
```http
POST /api/v1/voice
Content-Type: application/json

{
  "voiceInput": "Nowhere, create a new user component",
  "context": {
    "userId": "user123",
    "projectId": "project456"
  }
}
```

### Autopilot Mode

#### Enable Autopilot
```http
POST /api/v1/autopilot/enable
Content-Type: application/json

{
  "context": {
    "userId": "user123",
    "projectId": "project456"
  }
}
```

#### Disable Autopilot
```http
POST /api/v1/autopilot/disable
Content-Type: application/json

{
  "context": {
    "userId": "user123",
    "projectId": "project456"
  }
}
```

### Memory Management

#### Get Memory
```http
GET /api/v1/memory/:userId/:projectId?sessionId=session123
```

#### Clear Memory
```http
DELETE /api/v1/memory/:userId/:projectId?sessionId=session123
```

### System Status

#### Health Check
```http
GET /health
```

#### Status
```http
GET /api/v1/status
```

#### Configuration
```http
GET /api/v1/config
```

## 🎙️ Voice Commands

### Navigation Commands
- "Go to file [filename]"
- "Show me the main function"
- "Navigate to [component/module]"
- "Open [file path]"

### Execution Commands
- "Run the tests"
- "Deploy to staging"
- "Build the project"
- "Start the development server"

### Analysis Commands
- "Analyze this code"
- "Find performance issues"
- "Check for security vulnerabilities"
- "Review the code quality"

### Creation Commands
- "Create a new [component/function/class]"
- "Add authentication"
- "Implement [feature]"
- "Generate [type]"

### Debugging Commands
- "Fix this error"
- "Debug the issue"
- "Optimize this function"
- "Resolve the conflict"

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3001` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `ANTHROPIC_API_KEY` | Anthropic API key | Required |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `POSTGRES_URL` | PostgreSQL connection URL | Optional |
| `JWT_SECRET` | JWT signing secret | Required in production |
| `LOG_LEVEL` | Logging level | `info` |

### Rate Limiting

- **General API**: 100 requests per minute
- **Voice Commands**: 50 requests per minute
- **Block Duration**: 15 minutes (general), 30 minutes (voice)

## 🛠️ Development

### Project Structure

```
backend/
├── src/
│   ├── core/           # Nowhere AI core logic
│   ├── memory/         # Memory management system
│   ├── tools/          # Tool execution engine
│   ├── voice/          # Voice processing
│   ├── middleware/     # Express middleware
│   ├── routes/         # API routes
│   ├── utils/          # Utility functions
│   ├── websocket/      # WebSocket handlers
│   └── index.ts        # Server entry point
├── logs/               # Application logs
├── tests/              # Test files
├── package.json        # Dependencies
└── env.example         # Environment template
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Lint code
npm run format       # Format code
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔒 Security

### Authentication
- JWT-based authentication (optional in development)
- Role-based access control
- Secure session management

### Rate Limiting
- IP-based rate limiting
- Separate limits for voice commands
- Configurable limits and durations

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection with Helmet
- CORS configuration

## 📊 Monitoring

### Logging
- Structured JSON logging
- Different log levels (error, warn, info, debug)
- File-based logging with rotation
- Request/response logging

### Health Checks
- `/health` endpoint for monitoring
- Database connectivity checks
- AI model availability checks

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### Environment Setup

1. Set production environment variables
2. Configure Redis and PostgreSQL
3. Set up SSL certificates
4. Configure reverse proxy (nginx)
5. Set up monitoring and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API examples

---

**Nowhere AI Agent** - The most advanced AI coding assistant with voice integration and autonomous capabilities. 