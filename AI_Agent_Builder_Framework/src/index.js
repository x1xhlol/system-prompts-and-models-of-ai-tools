const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import core modules
const AgentBuilder = require('./core/AgentBuilder');
const PromptEngine = require('./core/PromptEngine');
const ToolManager = require('./core/ToolManager');
const MemoryManager = require('./core/MemoryManager');
const ConfigManager = require('./core/ConfigManager');
const Logger = require('./utils/Logger');

// Import routes
const agentRoutes = require('./routes/agents');
const promptRoutes = require('./routes/prompts');
const toolRoutes = require('./routes/tools');
const configRoutes = require('./routes/config');

// Import middleware
const authMiddleware = require('./middleware/auth');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

class AIAgentBuilderFramework {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: process.env.CORS_ORIGIN || "*",
                methods: ["GET", "POST"]
            }
        });
        
        this.port = process.env.PORT || 3000;
        this.logger = new Logger();
        
        this.initializeMiddleware();
        this.initializeRoutes();
        this.initializeWebSocket();
        this.initializeErrorHandling();
    }

    initializeMiddleware() {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));
        
        // CORS
        this.app.use(cors({
            origin: process.env.CORS_ORIGIN || "*",
            credentials: true
        }));
        
        // Compression
        this.app.use(compression());
        
        // Logging
        this.app.use(morgan('combined', {
            stream: { write: message => this.logger.info(message.trim()) }
        }));
        
        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        // Rate limiting
        this.app.use(rateLimiter);
        
        // Authentication (optional)
        if (process.env.ENABLE_AUTH === 'true') {
            this.app.use(authMiddleware);
        }
    }

    initializeRoutes() {
        // API routes
        this.app.use('/api/agents', agentRoutes);
        this.app.use('/api/prompts', promptRoutes);
        this.app.use('/api/tools', toolRoutes);
        this.app.use('/api/config', configRoutes);
        
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                version: process.env.npm_package_version || '1.0.0',
                uptime: process.uptime()
            });
        });
        
        // Serve static files
        this.app.use(express.static(path.join(__dirname, '../public')));
        
        // Serve the main application
        this.app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../public/index.html'));
        });
    }

    initializeWebSocket() {
        this.io.on('connection', (socket) => {
            this.logger.info(`Client connected: ${socket.id}`);
            
            // Handle agent creation
            socket.on('create-agent', async (data) => {
                try {
                    const agentBuilder = new AgentBuilder();
                    const agent = await agentBuilder.createAgent(data);
                    socket.emit('agent-created', { success: true, agent });
                } catch (error) {
                    socket.emit('agent-created', { success: false, error: error.message });
                }
            });
            
            // Handle prompt generation
            socket.on('generate-prompt', async (data) => {
                try {
                    const promptEngine = new PromptEngine();
                    const prompt = await promptEngine.generatePrompt(data);
                    socket.emit('prompt-generated', { success: true, prompt });
                } catch (error) {
                    socket.emit('prompt-generated', { success: false, error: error.message });
                }
            });
            
            // Handle tool management
            socket.on('manage-tools', async (data) => {
                try {
                    const toolManager = new ToolManager();
                    const tools = await toolManager.manageTools(data);
                    socket.emit('tools-managed', { success: true, tools });
                } catch (error) {
                    socket.emit('tools-managed', { success: false, error: error.message });
                }
            });
            
            socket.on('disconnect', () => {
                this.logger.info(`Client disconnected: ${socket.id}`);
            });
        });
    }

    initializeErrorHandling() {
        // Global error handler
        this.app.use(errorHandler);
        
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            this.logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
        });
        
        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            this.logger.error('Uncaught Exception:', error);
            process.exit(1);
        });
    }

    async start() {
        try {
            // Initialize core services
            await this.initializeServices();
            
            // Start server
            this.server.listen(this.port, () => {
                this.logger.info(`🚀 AI Agent Builder Framework running on port ${this.port}`);
                this.logger.info(`📊 Dashboard available at http://localhost:${this.port}`);
                this.logger.info(`🔧 API available at http://localhost:${this.port}/api`);
            });
        } catch (error) {
            this.logger.error('Failed to start server:', error);
            process.exit(1);
        }
    }

    async initializeServices() {
        try {
            // Initialize configuration manager
            const configManager = new ConfigManager();
            await configManager.loadConfig();
            
            // Initialize memory manager
            const memoryManager = new MemoryManager();
            await memoryManager.initialize();
            
            this.logger.info('✅ Core services initialized successfully');
        } catch (error) {
            this.logger.error('❌ Failed to initialize core services:', error);
            throw error;
        }
    }

    async stop() {
        this.logger.info('🛑 Shutting down AI Agent Builder Framework...');
        this.server.close(() => {
            this.logger.info('✅ Server stopped gracefully');
            process.exit(0);
        });
    }
}

// Create and start the framework
const framework = new AIAgentBuilderFramework();

// Handle graceful shutdown
process.on('SIGTERM', () => framework.stop());
process.on('SIGINT', () => framework.stop());

// Start the framework
framework.start().catch(error => {
    console.error('Failed to start framework:', error);
    process.exit(1);
});

module.exports = AIAgentBuilderFramework; 