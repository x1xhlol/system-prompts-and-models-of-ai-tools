#!/usr/bin/env node

/**
 * Unified AI Platform - Main Entry Point
 * 
 * This is the main entry point for the Unified AI Platform that combines
 * the best patterns and architectures from leading AI systems.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Load configuration
const config = require('../config/system-config.json');
const toolsConfig = require('../config/tools.json');

class UnifiedAIPlatform {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.isInitialized = false;
        
        // Initialize core components
        this.memory = new Map(); // Simple in-memory storage
        this.tools = toolsConfig;
        this.plans = new Map();
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    setupMiddleware() {
        // Security middleware
        this.app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    scriptSrc: ["'self'"],
                    imgSrc: ["'self'", "data:", "https:"],
                },
            },
        }));

        // CORS configuration
        this.app.use(cors({
            origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
        }));

        // Compression
        this.app.use(compression());

        // Logging
        this.app.use(morgan('combined'));

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

        // Static files
        this.app.use('/static', express.static(path.join(__dirname, '../public')));

        // Request logging
        this.app.use((req, res, next) => {
            console.log(`${req.method} ${req.path} - ${req.ip}`);
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
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
            });
        });

        // API routes
        this.app.get('/api/v1/tools', (req, res) => {
            res.json({
                tools: this.tools,
                count: this.tools.length,
                description: 'Available tools for the Unified AI Platform'
            });
        });

        this.app.get('/api/v1/memory', (req, res) => {
            res.json({
                memories: Array.from(this.memory.entries()),
                count: this.memory.size,
                description: 'In-memory storage for user preferences and context'
            });
        });

        this.app.post('/api/v1/memory', (req, res) => {
            const { key, value } = req.body;
            if (key && value) {
                this.memory.set(key, {
                    content: value,
                    created_at: new Date().toISOString(),
                    last_accessed: new Date().toISOString()
                });
                res.json({ success: true, message: 'Memory stored successfully' });
            } else {
                res.status(400).json({ error: 'Key and value are required' });
            }
        });

        this.app.get('/api/v1/plans', (req, res) => {
            res.json({
                plans: Array.from(this.plans.entries()),
                count: this.plans.size,
                description: 'Execution plans for complex tasks'
            });
        });

        this.app.post('/api/v1/plans', (req, res) => {
            const { task_description, steps } = req.body;
            if (task_description) {
                const planId = `plan_${Date.now()}`;
                this.plans.set(planId, {
                    task_description,
                    steps: steps || [],
                    created_at: new Date().toISOString(),
                    status: 'created'
                });
                res.json({ 
                    success: true, 
                    plan_id: planId,
                    message: 'Plan created successfully' 
                });
            } else {
                res.status(400).json({ error: 'Task description is required' });
            }
        });

        // Platform capabilities
        this.app.get('/api/v1/capabilities', (req, res) => {
            res.json({
                platform: config.platform,
                core_capabilities: config.core_capabilities,
                operating_modes: config.operating_modes,
                performance: config.performance,
                description: 'Unified AI Platform combines the best patterns from Cursor, Devin, Manus, v0, and other AI systems'
            });
        });

        // Demo endpoint
        this.app.get('/api/v1/demo', (req, res) => {
            res.json({
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
            });
        });
    }

    setupErrorHandling() {
        // 404 handler
        this.app.use((req, res, next) => {
            res.status(404).json({
                error: 'Not Found',
                message: `Route ${req.method} ${req.path} not found`,
                timestamp: new Date().toISOString()
            });
        });

        // Global error handler
        this.app.use((error, req, res, next) => {
            console.error('Unhandled error:', error);

            res.status(error.status || 500).json({
                error: 'Internal Server Error',
                message: process.env.NODE_ENV === 'production' 
                    ? 'An unexpected error occurred' 
                    : error.message,
                timestamp: new Date().toISOString(),
                ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
            });
        });
    }

    async start() {
        return new Promise((resolve, reject) => {
            this.app.listen(this.port, () => {
                this.isInitialized = true;
                console.log(`🚀 Unified AI Platform running on port ${this.port}`);
                console.log(`📊 Health check: http://localhost:${this.port}/health`);
                console.log(`🔧 API Documentation: http://localhost:${this.port}/api/v1/capabilities`);
                console.log(`🎯 Demo: http://localhost:${this.port}/api/v1/demo`);
                
                this.logPlatformCapabilities();
                
                resolve();
            });

            this.app.on('error', (error) => {
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

    async stop() {
        console.log('🛑 Shutting down Unified AI Platform...');
        console.log('✅ Platform shutdown complete');
    }
}

// Graceful shutdown handling
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    if (platform) {
        await platform.stop();
    }
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    if (platform) {
        await platform.stop();
    }
    process.exit(0);
});

// Start the platform
let platform;
async function main() {
    try {
        platform = new UnifiedAIPlatform();
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

module.exports = { UnifiedAIPlatform }; 