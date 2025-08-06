#!/usr/bin/env node

/**
 * Simplified Unified AI Platform Server
 * 
 * This is a simplified version that can run with minimal dependencies
 * for demonstration purposes.
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

// Simple configuration
const config = {
    platform: {
        name: "Unified AI Platform",
        version: "1.0.0",
        description: "A comprehensive AI platform combining best patterns from leading AI systems"
    },
    core_capabilities: {
        multi_modal: { enabled: true },
        memory_system: { enabled: true },
        tool_system: { enabled: true },
        planning_system: { enabled: true },
        security: { enabled: true }
    },
    performance: {
        response_time: { target_ms: 1000 },
        memory_usage: { max_mb: 512 },
        concurrent_operations: { max_parallel: 10 }
    }
};

class SimpleUnifiedAIPlatform {
    constructor() {
        this.port = process.env.PORT || 3000;
        this.memory = new Map();
        this.plans = new Map();
        this.isInitialized = false;
    }

    createServer() {
        return http.createServer((req, res) => {
            const parsedUrl = url.parse(req.url, true);
            const pathname = parsedUrl.pathname;
            const method = req.method;

            // Set CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            res.setHeader('Content-Type', 'application/json');

            // Handle preflight requests
            if (method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            // Route handling
            try {
                this.handleRequest(req, res, pathname, method, parsedUrl);
            } catch (error) {
                console.error('Error handling request:', error);
                res.writeHead(500);
                res.end(JSON.stringify({
                    error: 'Internal Server Error',
                    message: error.message,
                    timestamp: new Date().toISOString()
                }));
            }
        });
    }

    handleRequest(req, res, pathname, method, parsedUrl) {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            let data = {};
            if (body) {
                try {
                    data = JSON.parse(body);
                } catch (e) {
                    // Ignore parsing errors for GET requests
                }
            }

            switch (pathname) {
                case '/':
                    this.handleIndex(req, res);
                    break;
                case '/health':
                    this.handleHealthCheck(req, res);
                    break;
                case '/api/v1/tools':
                    this.handleTools(req, res);
                    break;
                case '/api/v1/memory':
                    if (method === 'GET') {
                        this.handleGetMemory(req, res);
                    } else if (method === 'POST') {
                        this.handlePostMemory(req, res, data);
                    }
                    break;
                case '/api/v1/plans':
                    if (method === 'GET') {
                        this.handleGetPlans(req, res);
                    } else if (method === 'POST') {
                        this.handlePostPlans(req, res, data);
                    }
                    break;
                case '/api/v1/capabilities':
                    this.handleCapabilities(req, res);
                    break;
                case '/api/v1/demo':
                    this.handleDemo(req, res);
                    break;
                default:
                    res.writeHead(404);
                    res.end(JSON.stringify({
                        error: 'Not Found',
                        message: `Route ${method} ${pathname} not found`,
                        timestamp: new Date().toISOString()
                    }));
            }
        });
    }

    handleIndex(req, res) {
        const indexPath = path.join(__dirname, '../public/index.html');
        try {
            const html = fs.readFileSync(indexPath, 'utf8');
            res.setHeader('Content-Type', 'text/html');
            res.writeHead(200);
            res.end(html);
        } catch (error) {
            res.writeHead(404);
            res.end('HTML interface not found');
        }
    }

    handleHealthCheck(req, res) {
        res.writeHead(200);
        res.end(JSON.stringify({
            status: 'healthy',
            platform: 'Unified AI Platform',
            version: config.platform.version,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            initialized: this.isInitialized,
            features: {
                multi_modal: config.core_capabilities.multi_modal.enabled,
                memory_system: config.core_capabilities.memory_system.enabled,
                tool_system: config.core_capabilities.tool_system.enabled,
                planning_system: config.core_capabilities.planning_system.enabled,
                security: config.core_capabilities.security.enabled
            }
        }));
    }

    handleTools(req, res) {
        // Load tools from config
        const toolsPath = path.join(__dirname, '../config/tools.json');
        let tools = [];
        
        try {
            const toolsData = fs.readFileSync(toolsPath, 'utf8');
            tools = JSON.parse(toolsData);
        } catch (error) {
            console.error('Error loading tools:', error);
        }

        res.writeHead(200);
        res.end(JSON.stringify({
            tools: tools,
            count: tools.length,
            description: 'Available tools for the Unified AI Platform'
        }));
    }

    handleGetMemory(req, res) {
        res.writeHead(200);
        res.end(JSON.stringify({
            memories: Array.from(this.memory.entries()),
            count: this.memory.size,
            description: 'In-memory storage for user preferences and context'
        }));
    }

    handlePostMemory(req, res, data) {
        const { key, value } = data;
        if (key && value) {
            this.memory.set(key, {
                content: value,
                created_at: new Date().toISOString(),
                last_accessed: new Date().toISOString()
            });
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, message: 'Memory stored successfully' }));
        } else {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Key and value are required' }));
        }
    }

    handleGetPlans(req, res) {
        res.writeHead(200);
        res.end(JSON.stringify({
            plans: Array.from(this.plans.entries()),
            count: this.plans.size,
            description: 'Execution plans for complex tasks'
        }));
    }

    handlePostPlans(req, res, data) {
        const { task_description, steps } = data;
        if (task_description) {
            const planId = `plan_${Date.now()}`;
            this.plans.set(planId, {
                task_description,
                steps: steps || [],
                created_at: new Date().toISOString(),
                status: 'created'
            });
            res.writeHead(200);
            res.end(JSON.stringify({ 
                success: true, 
                plan_id: planId,
                message: 'Plan created successfully' 
            }));
        } else {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Task description is required' }));
        }
    }

    handleCapabilities(req, res) {
        res.writeHead(200);
        res.end(JSON.stringify({
            platform: config.platform,
            core_capabilities: config.core_capabilities,
            performance: config.performance,
            description: 'Unified AI Platform combines the best patterns from Cursor, Devin, Manus, v0, and other AI systems'
        }));
    }

    handleDemo(req, res) {
        res.writeHead(200);
        res.end(JSON.stringify({
            message: 'Unified AI Platform Demo',
            features: [
                'Multi-Modal Processing',
                'Context-Aware Memory',
                'Modular Tool System',
                'Intelligent Planning',
                'Security-First Design',
                'Real-time Communication'
            ],
            systems_combined: [
                'Cursor - Tool system and memory management',
                'Devin - Planning and execution modes',
                'Manus - Modular architecture and event streams',
                'v0 - Multi-modal processing capabilities',
                'Orchids.app - Decision-making frameworks'
            ],
            status: 'Ready for deployment!'
        }));
    }

    async start() {
        return new Promise((resolve, reject) => {
            const server = this.createServer();
            
            server.listen(this.port, () => {
                this.isInitialized = true;
                console.log(`🚀 Unified AI Platform running on port ${this.port}`);
                console.log(`📊 Health check: http://localhost:${this.port}/health`);
                console.log(`🔧 API Documentation: http://localhost:${this.port}/api/v1/capabilities`);
                console.log(`🎯 Demo: http://localhost:${this.port}/api/v1/demo`);
                
                this.logPlatformCapabilities();
                
                resolve();
            });

            server.on('error', (error) => {
                console.error('Failed to start server:', error);
                reject(error);
            });
        });
    }

    logPlatformCapabilities() {
        console.log('🎯 Platform Capabilities:');
        console.log(`   • Multi-Modal Processing: ${config.core_capabilities.multi_modal.enabled ? '✅' : '❌'}`);
        console.log(`   • Memory System: ${config.core_capabilities.memory_system.enabled ? '✅' : '❌'}`);
        console.log(`   • Tool System: ${config.core_capabilities.tool_system.enabled ? '✅' : '❌'}`);
        console.log(`   • Planning System: ${config.core_capabilities.planning_system.enabled ? '✅' : '❌'}`);
        console.log(`   • Security: ${config.core_capabilities.security.enabled ? '✅' : '❌'}`);
        
        console.log(`📈 Performance Targets:`);
        console.log(`   • Response Time: ${config.performance.response_time.target_ms}ms`);
        console.log(`   • Memory Usage: ${config.performance.memory_usage.max_mb}MB`);
        console.log(`   • Concurrent Operations: ${config.performance.concurrent_operations.max_parallel}`);
        
        console.log('🎉 Unified AI Platform successfully launched!');
    }
}

// Graceful shutdown handling
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});

// Start the platform
async function main() {
    try {
        const platform = new SimpleUnifiedAIPlatform();
        await platform.start();
    } catch (error) {
        console.error('Failed to start Unified AI Platform:', error);
        process.exit(1);
    }
}

// Only start if this file is run directly
if (require.main === module) {
    main();
}

module.exports = { SimpleUnifiedAIPlatform }; 