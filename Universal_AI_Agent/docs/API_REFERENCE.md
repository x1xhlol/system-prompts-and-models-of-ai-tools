# Universal AI Agent - API Reference

## Table of Contents

1. [Authentication](#authentication)
2. [Core Endpoints](#core-endpoints)
3. [AI Chat & Streaming](#ai-chat--streaming)
4. [RAG (Retrieval-Augmented Generation)](#rag-retrieval-augmented-generation)
5. [Multi-Agent Orchestration](#multi-agent-orchestration)
6. [Voice Integration](#voice-integration)
7. [Plugin System](#plugin-system)
8. [Analytics & Monitoring](#analytics--monitoring)
9. [WebSocket API](#websocket-api)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)
12. [SDK Examples](#sdk-examples)

## Authentication

### Bearer Token Authentication

All API endpoints (except `/` and `/health`) require authentication when `AUTH_TOKEN` is configured.

```http
Authorization: Bearer your_auth_token_here
```

### JWT Authentication

For advanced authentication, use JWT tokens:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure_password",
  "mfaCode": "123456" // Optional, if MFA is enabled
}
```

**Response:**

```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionId": "session_id_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "roles": ["user"],
    "mfaEnabled": false
  }
}
```

## Core Endpoints

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "status": "healthy",
  "uptime": 3600,
  "memory": "512MB",
  "connections": {
    "redis": "connected",
    "postgres": "connected"
  },
  "features": {
    "rag": true,
    "voice": true,
    "plugins": true,
    "multiAgent": true
  }
}
```

### System Information

```http
GET /system/info
Authorization: Bearer your_token
```

**Response:**

```json
{
  "version": "1.0.0",
  "nodeVersion": "18.17.0",
  "platform": "linux",
  "architecture": "x64",
  "environment": "production",
  "features": ["rag", "voice", "plugins", "multi-agent"],
  "limits": {
    "maxRequestSize": "50MB",
    "rateLimit": {
      "window": 60000,
      "max": 100
    }
  }
}
```

## AI Chat & Streaming

### Standard Chat

```http
POST /chat
Authorization: Bearer your_token
Content-Type: application/json

{
  "message": "Hello, how can you help me?",
  "optimizePrompt": true,
  "context": "optional context",
  "userId": "user123"
}
```

**Response:**

```json
{
  "response": "Hello! I'm your Universal AI Agent...",
  "metadata": {
    "model": "gpt-4",
    "tokens": 150,
    "responseTime": 1200,
    "optimized": true
  },
  "conversationId": "conv_123"
}
```

### Streaming Chat

```http
GET /stream?message=Hello&optimizePrompt=true
Authorization: Bearer your_token
Accept: text/event-stream
```

**Server-Sent Events Response:**



data: {"type": "start", "conversationId": "conv_123"}

data: {"type": "chunk", "content": "Hello! I'm", "index": 0}

data: {"type": "chunk", "content": " your Universal", "index": 1}

data: {"type": "end", "metadata": {"tokens": 150, "model": "gpt-4"}}
```

### Conversation History

```http
GET /conversations
Authorization: Bearer your_token
```

**Query Parameters:**

- `limit`: Number of conversations (default: 50)
- `offset`: Pagination offset (default: 0)
- `userId`: Filter by user ID

**Response:**

```json
{
  "conversations": [
    {
      "id": "conv_123",
      "userId": "user123",
      "messages": [
        {
          "role": "user",
          "content": "Hello",
          "timestamp": "2024-01-01T12:00:00Z"
        },
        {
          "role": "assistant",
          "content": "Hello! How can I help?",
          "timestamp": "2024-01-01T12:00:01Z"
        }
      ],
      "createdAt": "2024-01-01T12:00:00Z",
      "updatedAt": "2024-01-01T12:00:01Z"
    }
  ],
  "total": 1,
  "hasMore": false
}
```

## RAG (Retrieval-Augmented Generation)

### Ingest Documents

```http
POST /rag/ingest
Authorization: Bearer your_token
Content-Type: application/json

{
  "documents": [
    {
      "id": "doc1",
      "content": "This is a sample document content...",
      "metadata": {
        "title": "Sample Document",
        "author": "John Doe",
        "category": "technical"
      }
    }
  ],
  "collection": "knowledge_base"
}
```

**Response:**

```json
{
  "success": true,
  "ingested": 1,
  "failed": 0,
  "collection": "knowledge_base",
  "processingTime": 1500
}
```

### Search Documents

```http
POST /rag/search
Authorization: Bearer your_token
Content-Type: application/json

{
  "query": "machine learning algorithms",
  "collection": "knowledge_base",
  "limit": 5,
  "threshold": 0.7
}
```

**Response:**

```json
{
  "results": [
    {
      "id": "doc1",
      "content": "Machine learning algorithms are...",
      "score": 0.95,
      "metadata": {
        "title": "ML Guide",
        "category": "technical"
      }
    }
  ],
  "query": "machine learning algorithms",
  "totalResults": 1,
  "searchTime": 50
}
```

### RAG-Enhanced Answer

```http
POST /rag/answer
Authorization: Bearer your_token
Content-Type: application/json

{
  "question": "What are the best machine learning algorithms?",
  "collection": "knowledge_base",
  "maxContext": 3,
  "includeContext": true
}
```

**Response:**

```json
{
  "answer": "Based on the knowledge base, the best machine learning algorithms include...",
  "sources": [
    {
      "id": "doc1",
      "title": "ML Guide",
      "relevanceScore": 0.95
    }
  ],
  "context": [
    {
      "content": "Machine learning algorithms are...",
      "source": "doc1"
    }
  ],
  "confidence": 0.92
}
```

## Multi-Agent Orchestration

### Execute Multi-Agent Task

```http
POST /agents/execute
Authorization: Bearer your_token
Content-Type: application/json

{
  "task": "Analyze the performance of our web application and suggest optimizations",
  "agents": ["planner", "critic", "executor"],
  "parallel": false,
  "maxIterations": 3
}
```

**Response:**

```json
{
  "success": true,
  "taskId": "task_123",
  "results": [
    {
      "agent": "planner",
      "role": "Task Planner",
      "response": "I'll break down the web app performance analysis into...",
      "executionTime": 2000
    },
    {
      "agent": "critic",
      "role": "Critical Reviewer",
      "response": "The analysis approach looks comprehensive, but consider...",
      "executionTime": 1800
    },
    {
      "agent": "executor",
      "role": "Solution Executor",
      "response": "Based on the plan and critique, here are the optimizations...",
      "executionTime": 2200
    }
  ],
  "finalSynthesis": "Comprehensive analysis complete. Key recommendations: ...",
  "totalExecutionTime": 6000,
  "confidence": 0.89
}
```

### Get Task Status

```http
GET /agents/task/{taskId}
Authorization: Bearer your_token
```

**Response:**

```json
{
  "taskId": "task_123",
  "status": "completed",
  "progress": 100,
  "currentAgent": null,
  "results": [...],
  "startTime": "2024-01-01T12:00:00Z",
  "endTime": "2024-01-01T12:00:06Z"
}
```

## Voice Integration

### Text-to-Speech

```http
POST /voice/tts
Authorization: Bearer your_token
Content-Type: application/json

{
  "text": "Hello, this is your AI assistant speaking.",
  "voice": "neural",
  "language": "en-US",
  "speed": 1.0,
  "format": "mp3"
}
```

**Response:**

```json
{
  "success": true,
  "audioUrl": "/audio/tts_123.mp3",
  "duration": 3.5,
  "format": "mp3",
  "size": 56789
}
```

### Voice Command Processing

```http
POST /voice/command
Authorization: Bearer your_token
Content-Type: application/json

{
  "command": "analyze the latest sales data",
  "context": "dashboard",
  "userId": "user123"
}
```

**Response:**

```json
{
  "success": true,
  "command": "analyze the latest sales data",
  "intent": "data_analysis",
  "entities": ["sales data"],
  "action": "execute_analysis",
  "response": "I'll analyze the latest sales data for you...",
  "audioResponse": "/audio/response_123.mp3"
}
```

### Autopilot Mode

```http
POST /voice/autopilot
Authorization: Bearer your_token
Content-Type: application/json

{
  "mode": "start", // "start", "stop", "status"
  "context": "development",
  "preferences": {
    "verbosity": "medium",
    "autoExecute": false
  }
}
```

**Response:**

```json
{
  "success": true,
  "mode": "active",
  "sessionId": "autopilot_123",
  "status": "Autopilot mode activated. I'm ready to assist you.",
  "capabilities": ["voice_commands", "proactive_suggestions", "context_awareness"]
}
```

## Plugin System

### List Available Plugins

```http
GET /plugins
Authorization: Bearer your_token
```

**Response:**

```json
{
  "plugins": [
    {
      "name": "web-scraper",
      "version": "1.0.0",
      "description": "Advanced web scraping and content extraction",
      "category": "utility",
      "status": "active",
      "permissions": ["web_access"]
    },
    {
      "name": "database-analyzer",
      "version": "1.0.0",
      "description": "Database schema and performance analysis",
      "category": "analysis",
      "status": "active",
      "permissions": ["database_access"]
    }
  ],
  "total": 2
}
```

### Execute Plugin

```http
POST /plugins/{pluginName}/execute
Authorization: Bearer your_token
Content-Type: application/json

{
  "action": "scrape",
  "parameters": {
    "url": "https://example.com",
    "selector": ".content",
    "format": "text"
  }
}
```

**Response:**

```json
{
  "success": true,
  "plugin": "web-scraper",
  "action": "scrape",
  "result": {
    "content": "Scraped content here...",
    "metadata": {
      "title": "Example Page",
      "url": "https://example.com",
      "scrapedAt": "2024-01-01T12:00:00Z"
    }
  },
  "executionTime": 2500
}
```

### Install Plugin

```http
POST /plugins/install
Authorization: Bearer your_token
Content-Type: application/json

{
  "source": "npm",
  "package": "@universal-ai/plugin-example",
  "version": "1.0.0"
}
```

**Response:**

```json
{
  "success": true,
  "plugin": "example-plugin",
  "version": "1.0.0",
  "status": "installed",
  "message": "Plugin installed successfully"
}
```

## Analytics & Monitoring

### Get Dashboard Data

```http
GET /analytics/dashboard
Authorization: Bearer your_token
```

**Response:**

```json
{
  "overview": {
    "uptime": 86400,
    "totalRequests": 1500,
    "successRate": "98.5",
    "averageResponseTime": 850,
    "activeUsers": 25,
    "healthScore": 95
  },
  "requests": {
    "total": 1500,
    "successful": 1478,
    "failed": 22,
    "byHour": [10, 15, 20, ...],
    "topEndpoints": [
      {
        "endpoint": "POST /chat",
        "requests": 800,
        "averageTime": 1200,
        "errorRate": 1.2
      }
    ]
  },
  "ai": {
    "totalTokens": 150000,
    "totalCost": 25.50,
    "averageResponseTime": 1100,
    "topModels": [
      {
        "model": "gpt-4",
        "requests": 600,
        "tokens": 90000,
        "cost": 18.00
      }
    ]
  }
}
```

### Get System Metrics

```http
GET /analytics/metrics
Authorization: Bearer your_token
```

**Query Parameters:**

- `timeRange`: `1h`, `24h`, `7d`, `30d` (default: `24h`)
- `metric`: `requests`, `performance`, `errors`, `users`

**Response:**

```json
{
  "timeRange": "24h",
  "metrics": {
    "requests": {
      "timestamps": ["2024-01-01T00:00:00Z", ...],
      "values": [10, 15, 20, ...]
    },
    "responseTime": {
      "timestamps": ["2024-01-01T00:00:00Z", ...],
      "values": [850, 920, 780, ...]
    }
  }
}
```

### Export Analytics Data

```http
GET /analytics/export
Authorization: Bearer your_token
```

**Query Parameters:**

- `format`: `json`, `csv` (default: `json`)
- `timeRange`: `1h`, `24h`, `7d`, `30d` (default: `24h`)

**Response:** File download with analytics data

## WebSocket API

### Connection

```javascript
const ws = new WebSocket('wss://your-domain.com');

// Authenticate after connection
ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your_bearer_token'
  }));
};
```

### Message Types

#### Authentication

```json
{
  "type": "auth",
  "token": "your_bearer_token"
}
```

#### Chat Streaming

```json
{
  "type": "stream_chat",
  "text": "Hello, how are you?",
  "optimizePrompt": true,
  "userId": "user123"
}
```

#### Voice Command

```json
{
  "type": "voice_command",
  "command": "analyze the data",
  "context": "dashboard"
}
```

#### Plugin Execution

```json
{
  "type": "plugin_execute",
  "plugin": "web-scraper",
  "action": "scrape",
  "parameters": {
    "url": "https://example.com"
  }
}
```

### Server Messages

#### Authentication Success

```json
{
  "type": "auth_success",
  "userId": "user123",
  "sessionId": "session_456"
}
```

#### Chat Response

```json
{
  "type": "chat_response",
  "message": "Hello! How can I help you?",
  "conversationId": "conv_123"
}
```

#### Stream Chunk

```json
{
  "type": "stream_chunk",
  "chunk": "Hello! I'm",
  "index": 0,
  "total": 10
}
```

#### Error

```json
{
  "type": "error",
  "message": "Authentication failed",
  "code": "AUTH_ERROR"
}
```

## Error Handling

### Standard Error Response

```json
{
  "error": true,
  "message": "Detailed error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T12:00:00Z",
  "requestId": "req_123"
}
```

### Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH_REQUIRED` | Authentication required | 401 |
| `AUTH_INVALID` | Invalid authentication token | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `RATE_LIMITED` | Rate limit exceeded | 429 |
| `VALIDATION_ERROR` | Request validation failed | 400 |
| `INTERNAL_ERROR` | Internal server error | 500 |
| `SERVICE_UNAVAILABLE` | External service unavailable | 503 |

## Rate Limiting

### Default Limits

- **Window**: 60 seconds
- **Max Requests**: 100 per window per IP
- **Burst**: 10 requests per second

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704110400
X-RateLimit-Window: 60
```

### Rate Limit Exceeded Response

```json
{
  "error": true,
  "message": "Rate limit exceeded",
  "code": "RATE_LIMITED",
  "retryAfter": 45,
  "limit": 100,
  "window": 60
}
```

## SDK Examples

### JavaScript/Node.js

```javascript
class UniversalAIClient {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async chat(message, options = {}) {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message,
        ...options
      })
    });
    
    return response.json();
  }

  async streamChat(message, onChunk) {
    const response = await fetch(
      `${this.baseUrl}/stream?message=${encodeURIComponent(message)}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'text/event-stream'
        }
      }
    );

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          onChunk(data);
        }
      }
    }
  }
}

// Usage
const client = new UniversalAIClient('https://your-domain.com', 'your_token');

// Standard chat
const response = await client.chat('Hello, how are you?');
console.log(response.response);

// Streaming chat
await client.streamChat('Tell me a story', (chunk) => {
  if (chunk.type === 'chunk') {
    process.stdout.write(chunk.content);
  }
});
```

### Python

```python
import requests
import json
from typing import Optional, Dict, Any

class UniversalAIClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url.rstrip('/')
        self.token = token
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        })

    def chat(self, message: str, **kwargs) -> Dict[str, Any]:
        """Send a chat message and get response"""
        response = self.session.post(
            f'{self.base_url}/chat',
            json={'message': message, **kwargs}
        )
        response.raise_for_status()
        return response.json()

    def rag_ingest(self, documents: list, collection: str = 'default') -> Dict[str, Any]:
        """Ingest documents into RAG system"""
        response = self.session.post(
            f'{self.base_url}/rag/ingest',
            json={'documents': documents, 'collection': collection}
        )
        response.raise_for_status()
        return response.json()

    def rag_search(self, query: str, collection: str = 'default', limit: int = 5) -> Dict[str, Any]:
        """Search documents in RAG system"""
        response = self.session.post(
            f'{self.base_url}/rag/search',
            json={'query': query, 'collection': collection, 'limit': limit}
        )
        response.raise_for_status()
        return response.json()

    def execute_plugin(self, plugin_name: str, action: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a plugin action"""
        response = self.session.post(
            f'{self.base_url}/plugins/{plugin_name}/execute',
            json={'action': action, 'parameters': parameters}
        )
        response.raise_for_status()
        return response.json()

# Usage
client = UniversalAIClient('https://your-domain.com', 'your_token')

# Chat
response = client.chat('Hello, how are you?')
print(response['response'])

# RAG
documents = [
    {
        'id': 'doc1',
        'content': 'This is a sample document...',
        'metadata': {'title': 'Sample Doc'}
    }
]
client.rag_ingest(documents)

search_results = client.rag_search('sample document')
print(search_results['results'])
```

### cURL Examples

```bash
# Chat
curl -X POST https://your-domain.com/chat \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'

# RAG Search
curl -X POST https://your-domain.com/rag/search \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{"query": "machine learning", "limit": 5}'

# Plugin Execution
curl -X POST https://your-domain.com/plugins/web-scraper/execute \
  -H "Authorization: Bearer your_token" \
  -H "Content-Type: application/json" \
  -d '{"action": "scrape", "parameters": {"url": "https://example.com"}}'

# Analytics
curl -X GET https://your-domain.com/analytics/dashboard \
  -H "Authorization: Bearer your_token"
```

For more examples and detailed integration guides, see the [Deployment Guide](DEPLOYMENT_GUIDE.md) and [Plugin Development Guide](PLUGIN_DEVELOPMENT.md).
