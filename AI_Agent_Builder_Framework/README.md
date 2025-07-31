# 🤖 AI Agent Builder Framework

A comprehensive framework for building custom AI agents based on industry patterns and best practices from leading AI tools.

## 🚀 Features

### **Core Capabilities**
- **Modular Agent Creation**: Build custom AI agents with configurable personalities, capabilities, and tools
- **Template System**: Pre-built templates based on industry-leading AI systems
- **Dynamic Prompt Generation**: Automatically generate system prompts based on agent configuration
- **Tool Management**: Comprehensive tool integration and management system
- **Memory Systems**: Persistent memory with configurable storage and retention
- **Real-time Communication**: WebSocket-based real-time agent communication
- **RESTful API**: Complete API for agent management and interaction

### **Agent Types**
- **Autonomous Agents**: Self-directed execution with minimal user intervention
- **Guided Assistants**: Information gathering and decision support
- **Specialized Tools**: Domain-specific expertise and capabilities
- **Hybrid Agents**: Combination of autonomous and guided approaches

### **Personality Profiles**
- **Helpful**: Supportive and comprehensive assistance
- **Professional**: Efficient and accurate communication
- **Friendly**: Warm and approachable interaction
- **Formal**: Structured and detailed communication
- **Creative**: Innovative problem-solving approach

### **Communication Styles**
- **Conversational**: Natural, engaging dialogue
- **Formal**: Structured and comprehensive
- **Brief**: Concise and focused
- **Detailed**: Thorough explanations and context
- **Technical**: Precise terminology and depth

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ai-agent-builder-framework.git
cd ai-agent-builder-framework

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the framework
npm start

# For development
npm run dev
```

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Security
CORS_ORIGIN=http://localhost:3000
ENABLE_AUTH=false
JWT_SECRET=your-jwt-secret

# AI Model Configuration
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Database Configuration
DATABASE_URL=your-database-url
REDIS_URL=your-redis-url

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

## 🎯 Quick Start

### 1. Create Your First Agent

```javascript
const AgentBuilder = require('./src/core/AgentBuilder');

const agentBuilder = new AgentBuilder();

const agent = await agentBuilder.createAgent({
    name: "My Custom Assistant",
    type: "autonomous",
    personality: "helpful",
    communicationStyle: "conversational",
    capabilities: ["code-generation", "web-search", "file-operations"],
    memory: true,
    planning: true
});

console.log('Agent created:', agent.id);
```

### 2. Using Templates

```javascript
// Create agent from template
const agent = await agentBuilder.createFromTemplate('cursor-v1.2', {
    name: "My Cursor-like Agent",
    customPrompt: "Additional custom instructions..."
});
```

### 3. API Usage

```bash
# Create an agent
curl -X POST http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Agent",
    "type": "autonomous",
    "personality": "helpful"
  }'

# List all agents
curl http://localhost:3000/api/agents

# Get specific agent
curl http://localhost:3000/api/agents/{agent-id}
```

## 🏗️ Architecture

### Core Modules

```
src/
├── core/
│   ├── AgentBuilder.js      # Main agent creation logic
│   ├── PromptEngine.js      # Dynamic prompt generation
│   ├── ToolManager.js       # Tool management and integration
│   ├── MemoryManager.js     # Memory system management
│   └── ConfigManager.js     # Configuration management
├── routes/
│   ├── agents.js           # Agent management endpoints
│   ├── prompts.js          # Prompt management endpoints
│   ├── tools.js            # Tool management endpoints
│   └── config.js           # Configuration endpoints
├── middleware/
│   ├── auth.js             # Authentication middleware
│   ├── rateLimiter.js      # Rate limiting
│   └── errorHandler.js     # Error handling
├── utils/
│   ├── Logger.js           # Logging utility
│   └── Validator.js        # Input validation
└── templates/
    ├── cursor-v1.2.json    # Cursor agent template
    ├── devin-ai.json       # Devin AI template
    └── replit-agent.json   # Replit agent template
```

### Data Structure

```javascript
{
  "id": "uuid",
  "name": "Agent Name",
  "type": "autonomous|guided|specialized|hybrid",
  "personality": "helpful|professional|friendly|formal|creative",
  "communicationStyle": "conversational|formal|brief|detailed|technical",
  "capabilities": ["code-generation", "web-search", ...],
  "tools": [...],
  "memory": true,
  "planning": false,
  "customPrompt": "Additional instructions...",
  "systemPrompt": "Generated system prompt...",
  "toolsConfig": [...],
  "memoryConfig": {...},
  "createdAt": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "status": "active"
}
```

## 🔌 API Reference

### Agents

#### `POST /api/agents`
Create a new agent

**Request Body:**
```json
{
  "name": "string",
  "type": "autonomous|guided|specialized|hybrid",
  "personality": "helpful|professional|friendly|formal|creative",
  "communicationStyle": "conversational|formal|brief|detailed|technical",
  "capabilities": ["string"],
  "tools": ["string"],
  "memory": boolean,
  "planning": boolean,
  "customPrompt": "string"
}
```

#### `GET /api/agents`
List all agents

#### `GET /api/agents/:id`
Get specific agent

#### `PUT /api/agents/:id`
Update agent

#### `DELETE /api/agents/:id`
Delete agent

### Prompts

#### `POST /api/prompts/generate`
Generate a system prompt

**Request Body:**
```json
{
  "type": "autonomous",
  "personality": "helpful",
  "communicationStyle": "conversational",
  "capabilities": ["code-generation"],
  "customPrompt": "string"
}
```

### Tools

#### `GET /api/tools`
List available tools

#### `POST /api/tools`
Add custom tool

### Configuration

#### `GET /api/config`
Get framework configuration

#### `PUT /api/config`
Update framework configuration

## 🎨 WebSocket Events

### Client to Server

- `create-agent`: Create a new agent
- `generate-prompt`: Generate a system prompt
- `manage-tools`: Manage agent tools

### Server to Client

- `agent-created`: Agent creation result
- `prompt-generated`: Prompt generation result
- `tools-managed`: Tool management result

## 📊 Templates

### Available Templates

- **cursor-v1.2**: Cursor AI agent template
- **devin-ai**: Devin AI autonomous agent
- **replit-agent**: Replit coding assistant
- **perplexity**: Perplexity search assistant
- **cluely**: Cluely guided assistant
- **lovable**: Lovable friendly assistant

### Creating Custom Templates

```json
{
  "name": "my-custom-template",
  "description": "My custom agent template",
  "version": "1.0.0",
  "config": {
    "type": "autonomous",
    "personality": "helpful",
    "communicationStyle": "conversational",
    "capabilities": ["code-generation", "web-search"],
    "memory": true,
    "planning": true
  }
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --testPathPattern=AgentBuilder.test.js

# Run tests with coverage
npm test -- --coverage
```

## 📈 Monitoring

### Health Check

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "uptime": 3600
}
```

### Logging

The framework uses Winston for logging with configurable levels:

- `error`: Error messages
- `warn`: Warning messages
- `info`: Information messages
- `debug`: Debug messages

## 🔒 Security

### Authentication

Enable authentication by setting `ENABLE_AUTH=true` in your environment variables.

### Rate Limiting

Built-in rate limiting to prevent abuse:

- 100 requests per minute per IP
- 1000 requests per hour per IP

### CORS

Configurable CORS settings for cross-origin requests.

## 🚀 Deployment

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com
ENABLE_AUTH=true
JWT_SECRET=your-secure-jwt-secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

This framework is inspired by and builds upon the patterns from:

- Cursor AI
- Devin AI
- Replit Agent
- Perplexity
- Cluely
- Lovable
- And many other AI systems

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/ai-agent-builder-framework/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/ai-agent-builder-framework/discussions)
- **Documentation**: [Wiki](https://github.com/your-username/ai-agent-builder-framework/wiki)

---

**Built with ❤️ for the AI community** 