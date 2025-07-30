const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Nowhere AI Agent Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Test endpoint
app.get('/api/v1/status', (req, res) => {
  res.json({
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
  });
});

// Test command endpoint
app.post('/api/v1/command', (req, res) => {
  const { command } = req.body;
  
  res.json({
    success: true,
    data: {
      response: `Nowhere processed your command: "${command}"`,
      actions: [],
      memory: {},
      timestamp: new Date()
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Nowhere AI Agent Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔧 API status: http://localhost:${PORT}/api/v1/status`);
  console.log(`💬 Test command: POST http://localhost:${PORT}/api/v1/command`);
}); 