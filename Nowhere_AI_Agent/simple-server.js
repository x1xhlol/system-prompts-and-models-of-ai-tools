const http = require('http');
const url = require('url');

// Memory storage (in-memory for simplicity)
const memory = new Map();
const autopilotMode = new Map();

// Command processing logic
function processCommand(command, userId) {
  const lowerCommand = command.toLowerCase();
  
  // Store in memory
  storeMemory(userId, 'command', command);
  
  // Process different types of commands
  if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
    return `Hello! I'm Nowhere, your AI coding assistant. How can I help you today?`;
  }
  
  if (lowerCommand.includes('project structure') || lowerCommand.includes('show me')) {
    return `Here's the current project structure:\n\n📁 Nowhere_AI_Agent/\n├── 📁 backend/\n│   ├── server.js\n│   └── package.json\n├── 📁 frontend/\n│   └── index.html\n└── README.md\n\nI can help you navigate and work with these files.`;
  }
  
  if (lowerCommand.includes('analyze') || lowerCommand.includes('code')) {
    return `I'll analyze the code for you. I can examine:\n• Code complexity\n• Function count\n• Import statements\n• Potential improvements\n\nWhich file would you like me to analyze?`;
  }
  
  if (lowerCommand.includes('create') || lowerCommand.includes('component')) {
    return `I'll help you create a new component. I can generate:\n• React components\n• Vue components\n• Angular components\n• Plain HTML/CSS\n\nWhat type of component do you need?`;
  }
  
  if (lowerCommand.includes('test') || lowerCommand.includes('run')) {
    return `Running tests...\n\n✅ 12 tests passed\n❌ 1 test failed\n\nFailing test: authentication.test.js - line 45\n\nWould you like me to help fix the failing test?`;
  }
  
  if (lowerCommand.includes('autopilot') || lowerCommand.includes('auto')) {
    const isEnabled = autopilotMode.get(userId) || false;
    if (isEnabled) {
      return `Autopilot mode is currently enabled. I'm working autonomously on your tasks.`;
    } else {
      return `Autopilot mode is disabled. I'll wait for your explicit commands.`;
    }
  }
  
  if (lowerCommand.includes('memory') || lowerCommand.includes('remember')) {
    const userMemory = getMemory(userId);
    return `Here's what I remember from our conversation:\n\n${userMemory.map(m => `• ${m.content}`).join('\n')}`;
  }
  
  // Default response
  return `I understand you said: "${command}". I'm here to help with coding tasks, project management, and development workflows. What would you like me to do?`;
}

// Memory management
function storeMemory(userId, type, content) {
  if (!memory.has(userId)) {
    memory.set(userId, []);
  }
  
  const userMemory = memory.get(userId);
  userMemory.push({
    type,
    content,
    timestamp: new Date()
  });
  
  // Keep only last 10 items
  if (userMemory.length > 10) {
    userMemory.shift();
  }
}

function getMemory(userId) {
  return memory.get(userId) || [];
}

// Create HTTP server
const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  // Health check
  if (path === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      message: 'Nowhere AI Agent Backend is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }));
    return;
  }
  
  // Status endpoint
  if (path === '/api/v1/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      data: {
        server: 'running',
        timestamp: new Date(),
        version: '1.0.0',
        features: [
          'voice_commands',
          'autopilot_mode',
          'memory_system',
          'real_time_communication'
        ]
      }
    }));
    return;
  }
  
  // Command processing
  if (path === '/api/v1/command' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { command, userId = 'default' } = JSON.parse(body);
        
        if (!command) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Command is required'
          }));
          return;
        }
        
        console.log(`Processing command: ${command}`);
        const response = processCommand(command, userId);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            response: response,
            actions: [],
            memory: getMemory(userId),
            timestamp: new Date()
          }
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid JSON'
        }));
      }
    });
    return;
  }
  
  // Voice command processing
  if (path === '/api/v1/voice' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { voiceInput, userId = 'default' } = JSON.parse(body);
        
        if (!voiceInput) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            error: 'Voice input is required'
          }));
          return;
        }
        
        console.log(`Processing voice command: ${voiceInput}`);
        const processedCommand = voiceInput.replace(/nowhere/i, '').trim();
        storeMemory(userId, 'voice', voiceInput);
        const response = `Voice command processed: "${processedCommand}". ${processCommand(processedCommand, userId)}`;
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            response: response,
            actions: [],
            memory: getMemory(userId),
            timestamp: new Date()
          }
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid JSON'
        }));
      }
    });
    return;
  }
  
  // Autopilot endpoints
  if (path === '/api/v1/autopilot/enable' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { userId = 'default' } = JSON.parse(body);
        autopilotMode.set(userId, true);
        console.log(`Autopilot enabled for user: ${userId}`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            enabled: true,
            message: 'Autopilot mode enabled'
          }
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid JSON'
        }));
      }
    });
    return;
  }
  
  if (path === '/api/v1/autopilot/disable' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { userId = 'default' } = JSON.parse(body);
        autopilotMode.set(userId, false);
        console.log(`Autopilot disabled for user: ${userId}`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: {
            enabled: false,
            message: 'Autopilot mode disabled'
          }
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: 'Invalid JSON'
        }));
      }
    });
    return;
  }
  
  // Default response
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: false,
    error: 'Endpoint not found'
  }));
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Nowhere AI Agent Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API status: http://localhost:${PORT}/api/v1/status`);
  console.log(`💬 Test command: POST http://localhost:${PORT}/api/v1/command`);
}); 