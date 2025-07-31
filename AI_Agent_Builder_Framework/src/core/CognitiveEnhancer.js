const Logger = require('../utils/Logger');

class CognitiveEnhancer {
    constructor() {
        this.logger = new Logger();
        this.enhancementHistory = new Map();
        this.cognitivePatterns = new Map();
        this.enhancementAlgorithms = new Map();
        this.initializeEnhancementAlgorithms();
    }

    initializeEnhancementAlgorithms() {
        // Initialize various cognitive enhancement algorithms
        this.enhancementAlgorithms.set('memory-enhancement', this.memoryEnhancement.bind(this));
        this.enhancementAlgorithms.set('attention-enhancement', this.attentionEnhancement.bind(this));
        this.enhancementAlgorithms.set('decision-enhancement', this.decisionEnhancement.bind(this));
        this.enhancementAlgorithms.set('creativity-enhancement', this.creativityEnhancement.bind(this));
        this.enhancementAlgorithms.set('learning-enhancement', this.learningEnhancement.bind(this));
        this.enhancementAlgorithms.set('adaptive-enhancement', this.adaptiveEnhancement.bind(this));
        
        this.logger.info(`🧠 Cognitive enhancer initialized with ${this.enhancementAlgorithms.size} algorithms`);
    }

    async enhanceCognition(agent, enhancementType = 'adaptive') {
        try {
            this.logger.info(`🧠 Starting cognitive enhancement with type: ${enhancementType}`);
            
            const enhancementResults = {
                timestamp: new Date().toISOString(),
                enhancementType,
                agentId: agent.id,
                originalCognition: agent.cognitivePatterns,
                enhancedCognition: {},
                enhancementMetrics: {},
                improvementFactors: {}
            };

            // Apply cognitive enhancement algorithms
            const enhancedCognition = await this.applyEnhancementAlgorithms(agent.cognitivePatterns, enhancementType);
            const improvementFactors = this.calculateImprovementFactors(agent.cognitivePatterns, enhancedCognition);
            
            enhancementResults.enhancedCognition = enhancedCognition;
            enhancementResults.improvementFactors = improvementFactors;
            enhancementResults.enhancementMetrics = this.calculateEnhancementMetrics(enhancementResults);

            // Store enhancement history
            this.storeEnhancementHistory(enhancementResults);

            this.logger.info(`🧠 Cognitive enhancement completed for agent ${agent.id}`);
            return enhancedCognition;
        } catch (error) {
            this.logger.error('Failed to enhance cognition:', error);
            throw error;
        }
    }

    async applyEnhancementAlgorithms(cognitivePatterns, enhancementType) {
        const enhancedPatterns = { ...cognitivePatterns };
        
        // Apply different enhancement algorithms based on type
        if (enhancementType === 'adaptive') {
            // Apply all enhancement algorithms with adaptive intensity
            enhancedPatterns.memory = await this.memoryEnhancement(cognitivePatterns.memory, 'adaptive');
            enhancedPatterns.attention = await this.attentionEnhancement(cognitivePatterns.attention, 'adaptive');
            enhancedPatterns.decision = await this.decisionEnhancement(cognitivePatterns.decision, 'adaptive');
            enhancedPatterns.creativity = await this.creativityEnhancement(cognitivePatterns.creativity, 'adaptive');
            enhancedPatterns.learning = await this.learningEnhancement(cognitivePatterns.learning, 'adaptive');
        } else {
            // Apply specific enhancement algorithm
            const algorithm = this.enhancementAlgorithms.get(enhancementType);
            if (algorithm) {
                const enhancedPattern = await algorithm(cognitivePatterns[enhancementType.split('-')[0]], enhancementType);
                enhancedPatterns[enhancementType.split('-')[0]] = enhancedPattern;
            }
        }

        return enhancedPatterns;
    }

    async memoryEnhancement(memoryPattern, enhancementType = 'adaptive') {
        const enhancementFactors = {
            'adaptive': 1.15,
            'memory-enhancement': 1.25,
            'default': 1.1
        };

        const factor = enhancementFactors[enhancementType] || enhancementFactors.default;
        
        return {
            ...memoryPattern,
            capacity: Math.min(memoryPattern.capacity * factor, 100),
            retrievalSpeed: Math.min(memoryPattern.retrievalSpeed * factor, 100),
            consolidation: Math.min(memoryPattern.consolidation * factor, 100),
            association: Math.min(memoryPattern.association * factor, 100),
            patternRecognition: Math.min(memoryPattern.patternRecognition * factor, 100),
            enhancementType: 'memory-enhancement'
        };
    }

    async attentionEnhancement(attentionPattern, enhancementType = 'adaptive') {
        const enhancementFactors = {
            'adaptive': 1.12,
            'attention-enhancement': 1.2,
            'default': 1.08
        };

        const factor = enhancementFactors[enhancementType] || enhancementFactors.default;
        
        return {
            ...attentionPattern,
            focus: Math.min(attentionPattern.focus * factor, 100),
            selectivity: Math.min(attentionPattern.selectivity * factor, 100),
            sustainedAttention: Math.min(attentionPattern.sustainedAttention * factor, 100),
            dividedAttention: Math.min(attentionPattern.dividedAttention * factor, 100),
            switching: Math.min(attentionPattern.switching * factor, 100),
            enhancementType: 'attention-enhancement'
        };
    }

    async decisionEnhancement(decisionPattern, enhancementType = 'adaptive') {
        const enhancementFactors = {
            'adaptive': 1.18,
            'decision-enhancement': 1.3,
            'default': 1.1
        };

        const factor = enhancementFactors[enhancementType] || enhancementFactors.default;
        
        return {
            ...decisionPattern,
            speed: Math.min(decisionPattern.speed * factor, 100),
            accuracy: Math.min(decisionPattern.accuracy * factor, 100),
            flexibility: Math.min(decisionPattern.flexibility * factor, 100),
            riskAssessment: Math.min(decisionPattern.riskAssessment * factor, 100),
            problemSolving: Math.min(decisionPattern.problemSolving * factor, 100),
            enhancementType: 'decision-enhancement'
        };
    }

    async creativityEnhancement(creativityPattern, enhancementType = 'adaptive') {
        const enhancementFactors = {
            'adaptive': 1.2,
            'creativity-enhancement': 1.35,
            'default': 1.15
        };

        const factor = enhancementFactors[enhancementType] || enhancementFactors.default;
        
        return {
            ...creativityPattern,
            divergentThinking: Math.min(creativityPattern.divergentThinking * factor, 100),
            convergentThinking: Math.min(creativityPattern.convergentThinking * factor, 100),
            originality: Math.min(creativityPattern.originality * factor, 100),
            fluency: Math.min(creativityPattern.fluency * factor, 100),
            flexibility: Math.min(creativityPattern.flexibility * factor, 100),
            enhancementType: 'creativity-enhancement'
        };
    }

    async learningEnhancement(learningPattern, enhancementType = 'adaptive') {
        const enhancementFactors = {
            'adaptive': 1.16,
            'learning-enhancement': 1.28,
            'default': 1.12
        };

        const factor = enhancementFactors[enhancementType] || enhancementFactors.default;
        
        return {
            ...learningPattern,
            rate: Math.min(learningPattern.rate * factor, 100),
            retention: Math.min(learningPattern.retention * factor, 100),
            transfer: Math.min(learningPattern.transfer * factor, 100),
            metaLearning: Math.min(learningPattern.metaLearning * factor, 100),
            adaptation: Math.min(learningPattern.adaptation * factor, 100),
            enhancementType: 'learning-enhancement'
        };
    }

    async adaptiveEnhancement(adaptivePattern, enhancementType = 'adaptive') {
        const enhancementFactors = {
            'adaptive': 1.14,
            'adaptive-enhancement': 1.22,
            'default': 1.1
        };

        const factor = enhancementFactors[enhancementType] || enhancementFactors.default;
        
        return {
            ...adaptivePattern,
            flexibility: Math.min(adaptivePattern.flexibility * factor, 100),
            resilience: Math.min(adaptivePattern.resilience * factor, 100),
            learningSpeed: Math.min(adaptivePattern.learningSpeed * factor, 100),
            environmentalAdaptation: Math.min(adaptivePattern.environmentalAdaptation * factor, 100),
            behavioralAdjustment: Math.min(adaptivePattern.behavioralAdjustment * factor, 100),
            enhancementType: 'adaptive-enhancement'
        };
    }

    calculateImprovementFactors(originalCognition, enhancedCognition) {
        const factors = {};
        
        for (const [patternType, enhancedPattern] of Object.entries(enhancedCognition)) {
            if (originalCognition[patternType]) {
                const originalPattern = originalCognition[patternType];
                factors[patternType] = {};
                
                for (const [metric, enhancedValue] of Object.entries(enhancedPattern)) {
                    if (typeof enhancedValue === 'number' && typeof originalPattern[metric] === 'number') {
                        factors[patternType][metric] = enhancedValue / originalPattern[metric];
                    }
                }
            }
        }
        
        return factors;
    }

    calculateEnhancementMetrics(enhancementResults) {
        const metrics = {
            overallImprovement: 0,
            patternImprovements: {},
            enhancementSuccess: 0,
            enhancementEfficiency: 0
        };

        let totalImprovement = 0;
        let improvementCount = 0;

        for (const [patternType, factors] of Object.entries(enhancementResults.improvementFactors)) {
            const patternImprovement = Object.values(factors).reduce((sum, factor) => sum + factor, 0) / Object.keys(factors).length;
            metrics.patternImprovements[patternType] = patternImprovement;
            totalImprovement += patternImprovement;
            improvementCount++;
        }

        if (improvementCount > 0) {
            metrics.overallImprovement = totalImprovement / improvementCount;
            metrics.enhancementSuccess = improvementCount / Object.keys(enhancementResults.improvementFactors).length;
            metrics.enhancementEfficiency = metrics.overallImprovement / enhancementResults.enhancementType.length;
        }

        return metrics;
    }

    storeEnhancementHistory(enhancementResults) {
        const historyKey = `${enhancementResults.agentId}-${enhancementResults.enhancementType}-${Date.now()}`;
        this.enhancementHistory.set(historyKey, enhancementResults);
        
        // Keep only last 100 enhancement histories
        if (this.enhancementHistory.size > 100) {
            const keys = Array.from(this.enhancementHistory.keys());
            const oldestKey = keys[0];
            this.enhancementHistory.delete(oldestKey);
        }
    }

    async enhanceCognitivePatterns(cognitivePatterns, enhancementType = 'adaptive') {
        try {
            this.logger.info(`🧠 Enhancing cognitive patterns with type: ${enhancementType}`);
            
            const enhancedPatterns = await this.applyEnhancementAlgorithms(cognitivePatterns, enhancementType);
            const improvementFactors = this.calculateImprovementFactors(cognitivePatterns, enhancedPatterns);
            
            const enhancementResult = {
                timestamp: new Date().toISOString(),
                enhancementType,
                originalPatterns: cognitivePatterns,
                enhancedPatterns,
                improvementFactors,
                metrics: this.calculateEnhancementMetrics({
                    enhancementType,
                    improvementFactors
                })
            };

            this.storeEnhancementHistory(enhancementResult);
            
            this.logger.info(`🧠 Cognitive patterns enhanced successfully`);
            return enhancedPatterns;
        } catch (error) {
            this.logger.error('Failed to enhance cognitive patterns:', error);
            throw error;
        }
    }

    async enhanceBasedOnPerformance(agentId, performanceData) {
        try {
            this.logger.info(`🧠 Enhancing cognition based on performance for agent ${agentId}`);
            
            // Analyze performance patterns to determine enhancement strategy
            const enhancementStrategy = this.determineEnhancementStrategy(performanceData);
            
            // Get current cognitive patterns for the agent
            const currentPatterns = this.cognitivePatterns.get(agentId) || this.getDefaultCognitivePatterns();
            
            // Apply performance-based enhancement
            const enhancedPatterns = await this.applyPerformanceBasedEnhancement(currentPatterns, enhancementStrategy);
            
            // Store enhanced patterns
            this.cognitivePatterns.set(agentId, enhancedPatterns);
            
            this.logger.info(`🧠 Performance-based cognitive enhancement completed for agent ${agentId}`);
            return enhancedPatterns;
        } catch (error) {
            this.logger.error('Failed to enhance based on performance:', error);
            throw error;
        }
    }

    determineEnhancementStrategy(performanceData) {
        const strategy = {
            type: 'adaptive',
            focus: [],
            intensity: 'medium'
        };

        // Analyze performance data to determine enhancement focus
        if (performanceData.responseTime > 1000) {
            strategy.focus.push('decision-enhancement');
            strategy.intensity = 'high';
        }

        if (performanceData.accuracy < 0.8) {
            strategy.focus.push('attention-enhancement');
            strategy.focus.push('decision-enhancement');
        }

        if (performanceData.efficiency < 0.7) {
            strategy.focus.push('learning-enhancement');
            strategy.focus.push('adaptive-enhancement');
        }

        if (performanceData.adaptation < 0.6) {
            strategy.focus.push('adaptive-enhancement');
            strategy.focus.push('learning-enhancement');
        }

        if (strategy.focus.length === 0) {
            strategy.focus.push('memory-enhancement');
            strategy.intensity = 'low';
        }

        return strategy;
    }

    async applyPerformanceBasedEnhancement(cognitivePatterns, strategy) {
        const enhancedPatterns = { ...cognitivePatterns };
        
        for (const focus of strategy.focus) {
            const enhancementType = `${focus}-enhancement`;
            const algorithm = this.enhancementAlgorithms.get(enhancementType);
            
            if (algorithm) {
                const patternKey = focus.split('-')[0];
                if (enhancedPatterns[patternKey]) {
                    enhancedPatterns[patternKey] = await algorithm(enhancedPatterns[patternKey], strategy.intensity);
                }
            }
        }
        
        return enhancedPatterns;
    }

    getDefaultCognitivePatterns() {
        return {
            memory: {
                capacity: 70,
                retrievalSpeed: 75,
                consolidation: 65,
                association: 80,
                patternRecognition: 85
            },
            attention: {
                focus: 75,
                selectivity: 70,
                sustainedAttention: 80,
                dividedAttention: 65,
                switching: 70
            },
            decision: {
                speed: 75,
                accuracy: 80,
                flexibility: 70,
                riskAssessment: 75,
                problemSolving: 80
            },
            creativity: {
                divergentThinking: 70,
                convergentThinking: 75,
                originality: 65,
                fluency: 80,
                flexibility: 75
            },
            learning: {
                rate: 75,
                retention: 80,
                transfer: 70,
                metaLearning: 65,
                adaptation: 75
            },
            adaptive: {
                flexibility: 75,
                resilience: 80,
                learningSpeed: 75,
                environmentalAdaptation: 70,
                behavioralAdjustment: 75
            }
        };
    }

    async getEnhancementHistory(agentId, timeRange = '30d') {
        try {
            const history = Array.from(this.enhancementHistory.values())
                .filter(result => result.agentId === agentId)
                .filter(result => this.isWithinTimeRange(result.timestamp, timeRange));
            
            return history;
        } catch (error) {
            this.logger.error('Failed to get enhancement history:', error);
            throw error;
        }
    }

    isWithinTimeRange(timestamp, timeRange) {
        const now = new Date();
        const targetTime = new Date(timestamp);
        const timeRanges = {
            '1h': 60 * 60 * 1000,
            '6h': 6 * 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000
        };
        
        const rangeMs = timeRanges[timeRange] || timeRanges['30d'];
        return (now.getTime() - targetTime.getTime()) <= rangeMs;
    }

    async exportEnhancementData(agentId, format = 'json') {
        try {
            const history = await this.getEnhancementHistory(agentId);
            const cognitivePatterns = this.cognitivePatterns.get(agentId);
            
            const exportData = {
                agentId,
                cognitivePatterns,
                enhancementHistory: history,
                exportTimestamp: new Date().toISOString()
            };
            
            if (format === 'json') {
                return JSON.stringify(exportData, null, 2);
            } else if (format === 'csv') {
                return this.convertToCSV(exportData);
            } else {
                throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            this.logger.error('Failed to export enhancement data:', error);
            throw error;
        }
    }

    convertToCSV(exportData) {
        const headers = ['timestamp', 'enhancementType', 'overallImprovement', 'enhancementSuccess'];
        const rows = exportData.enhancementHistory.map(entry => [
            entry.timestamp,
            entry.enhancementType,
            entry.metrics.overallImprovement,
            entry.metrics.enhancementSuccess
        ]);
        
        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        return csvContent;
    }
}

module.exports = CognitiveEnhancer; 