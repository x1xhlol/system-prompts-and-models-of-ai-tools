const Logger = require('../utils/Logger');

class RealTimeAnalytics {
    constructor() {
        this.logger = new Logger();
        this.performanceData = new Map();
        this.analyticsHistory = [];
        this.realTimeMetrics = new Map();
        this.performanceThresholds = {
            responseTime: 1000, // ms
            accuracy: 0.8, // 80%
            efficiency: 0.7, // 70%
            adaptation: 0.6 // 60%
        };
    }

    async trackPerformance(agentId, performanceData) {
        try {
            const timestamp = new Date().toISOString();
            const enhancedData = {
                ...performanceData,
                timestamp,
                agentId,
                metrics: this.calculatePerformanceMetrics(performanceData),
                insights: this.generatePerformanceInsights(performanceData),
                recommendations: this.generatePerformanceRecommendations(performanceData)
            };

            // Store performance data
            if (!this.performanceData.has(agentId)) {
                this.performanceData.set(agentId, []);
            }
            this.performanceData.get(agentId).push(enhancedData);

            // Update real-time metrics
            this.updateRealTimeMetrics(agentId, enhancedData);

            // Store in analytics history
            this.analyticsHistory.push(enhancedData);

            // Keep only last 1000 entries for performance
            if (this.analyticsHistory.length > 1000) {
                this.analyticsHistory = this.analyticsHistory.slice(-1000);
            }

            this.logger.info(`📊 Performance tracked for agent ${agentId}`);
            return enhancedData;
        } catch (error) {
            this.logger.error('Failed to track performance:', error);
            throw error;
        }
    }

    calculatePerformanceMetrics(performanceData) {
        const metrics = {
            responseTime: this.calculateResponseTime(performanceData),
            accuracy: this.calculateAccuracy(performanceData),
            efficiency: this.calculateEfficiency(performanceData),
            adaptation: this.calculateAdaptation(performanceData),
            cognitiveLoad: this.calculateCognitiveLoad(performanceData),
            neuralEfficiency: this.calculateNeuralEfficiency(performanceData)
        };

        return metrics;
    }

    calculateResponseTime(performanceData) {
        const responseTime = performanceData.responseTime || 0;
        return Math.min(responseTime, 10000); // Cap at 10 seconds
    }

    calculateAccuracy(performanceData) {
        const accuracy = performanceData.accuracy || 0;
        return Math.max(0, Math.min(accuracy, 1)); // Normalize to 0-1
    }

    calculateEfficiency(performanceData) {
        const efficiency = performanceData.efficiency || 0;
        return Math.max(0, Math.min(efficiency, 1)); // Normalize to 0-1
    }

    calculateAdaptation(performanceData) {
        const adaptation = performanceData.adaptation || 0;
        return Math.max(0, Math.min(adaptation, 1)); // Normalize to 0-1
    }

    calculateCognitiveLoad(performanceData) {
        const cognitiveLoad = performanceData.cognitiveLoad || 0;
        return Math.max(0, Math.min(cognitiveLoad, 100)); // Normalize to 0-100
    }

    calculateNeuralEfficiency(performanceData) {
        const neuralEfficiency = performanceData.neuralEfficiency || 0;
        return Math.max(0, Math.min(neuralEfficiency, 100)); // Normalize to 0-100
    }

    generatePerformanceInsights(performanceData) {
        const insights = [];
        const metrics = this.calculatePerformanceMetrics(performanceData);

        if (metrics.responseTime > this.performanceThresholds.responseTime) {
            insights.push('Response time exceeds optimal threshold - consider optimization');
        }

        if (metrics.accuracy < this.performanceThresholds.accuracy) {
            insights.push('Accuracy below target threshold - review decision-making patterns');
        }

        if (metrics.efficiency < this.performanceThresholds.efficiency) {
            insights.push('Efficiency below optimal level - consider resource optimization');
        }

        if (metrics.adaptation < this.performanceThresholds.adaptation) {
            insights.push('Adaptation rate below target - enhance learning mechanisms');
        }

        if (metrics.cognitiveLoad > 80) {
            insights.push('High cognitive load detected - consider load balancing');
        }

        if (metrics.neuralEfficiency < 60) {
            insights.push('Neural efficiency below optimal - review network architecture');
        }

        return insights;
    }

    generatePerformanceRecommendations(performanceData) {
        const recommendations = [];
        const metrics = this.calculatePerformanceMetrics(performanceData);

        if (metrics.responseTime > this.performanceThresholds.responseTime) {
            recommendations.push('Implement response time optimization algorithms');
            recommendations.push('Consider parallel processing for complex tasks');
        }

        if (metrics.accuracy < this.performanceThresholds.accuracy) {
            recommendations.push('Enhance decision-making algorithms');
            recommendations.push('Implement additional validation layers');
        }

        if (metrics.efficiency < this.performanceThresholds.efficiency) {
            recommendations.push('Optimize resource allocation');
            recommendations.push('Implement caching mechanisms');
        }

        if (metrics.adaptation < this.performanceThresholds.adaptation) {
            recommendations.push('Enhance adaptive learning algorithms');
            recommendations.push('Implement real-time feedback loops');
        }

        if (metrics.cognitiveLoad > 80) {
            recommendations.push('Implement cognitive load balancing');
            recommendations.push('Add task prioritization mechanisms');
        }

        if (metrics.neuralEfficiency < 60) {
            recommendations.push('Optimize neural network architecture');
            recommendations.push('Implement neural efficiency monitoring');
        }

        return recommendations;
    }

    updateRealTimeMetrics(agentId, enhancedData) {
        const currentMetrics = this.realTimeMetrics.get(agentId) || {};
        const newMetrics = {
            ...currentMetrics,
            lastUpdate: enhancedData.timestamp,
            performanceScore: this.calculatePerformanceScore(enhancedData.metrics),
            trend: this.calculatePerformanceTrend(agentId, enhancedData),
            alerts: this.generatePerformanceAlerts(enhancedData.metrics)
        };

        this.realTimeMetrics.set(agentId, newMetrics);
    }

    calculatePerformanceScore(metrics) {
        const weights = {
            responseTime: 0.2,
            accuracy: 0.3,
            efficiency: 0.2,
            adaptation: 0.15,
            cognitiveLoad: 0.1,
            neuralEfficiency: 0.05
        };

        const normalizedResponseTime = Math.max(0, 1 - (metrics.responseTime / 10000));
        const score = (
            normalizedResponseTime * weights.responseTime +
            metrics.accuracy * weights.accuracy +
            metrics.efficiency * weights.efficiency +
            metrics.adaptation * weights.adaptation +
            (1 - metrics.cognitiveLoad / 100) * weights.cognitiveLoad +
            (metrics.neuralEfficiency / 100) * weights.neuralEfficiency
        );

        return Math.max(0, Math.min(score, 1));
    }

    calculatePerformanceTrend(agentId, currentData) {
        const agentHistory = this.performanceData.get(agentId) || [];
        if (agentHistory.length < 2) return 'stable';

        const recentScores = agentHistory.slice(-5).map(data => 
            this.calculatePerformanceScore(data.metrics)
        );

        const trend = this.calculateTrendFromScores(recentScores);
        return trend;
    }

    calculateTrendFromScores(scores) {
        if (scores.length < 2) return 'stable';

        const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
        const secondHalf = scores.slice(Math.floor(scores.length / 2));

        const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;

        const difference = secondAvg - firstAvg;
        const threshold = 0.05;

        if (difference > threshold) return 'improving';
        if (difference < -threshold) return 'declining';
        return 'stable';
    }

    generatePerformanceAlerts(metrics) {
        const alerts = [];

        if (metrics.responseTime > this.performanceThresholds.responseTime) {
            alerts.push({
                type: 'warning',
                message: 'Response time exceeds threshold',
                metric: 'responseTime',
                value: metrics.responseTime
            });
        }

        if (metrics.accuracy < this.performanceThresholds.accuracy) {
            alerts.push({
                type: 'error',
                message: 'Accuracy below threshold',
                metric: 'accuracy',
                value: metrics.accuracy
            });
        }

        if (metrics.cognitiveLoad > 90) {
            alerts.push({
                type: 'critical',
                message: 'Critical cognitive load detected',
                metric: 'cognitiveLoad',
                value: metrics.cognitiveLoad
            });
        }

        return alerts;
    }

    async getAgentAnalytics(agentId, timeRange = '24h') {
        try {
            const agentData = this.performanceData.get(agentId) || [];
            const filteredData = this.filterDataByTimeRange(agentData, timeRange);

            const analytics = {
                agentId,
                timeRange,
                dataPoints: filteredData.length,
                averageMetrics: this.calculateAverageMetrics(filteredData),
                trends: this.calculateTrends(filteredData),
                insights: this.generateAnalyticsInsights(filteredData),
                recommendations: this.generateAnalyticsRecommendations(filteredData)
            };

            return analytics;
        } catch (error) {
            this.logger.error('Failed to get agent analytics:', error);
            throw error;
        }
    }

    filterDataByTimeRange(data, timeRange) {
        const now = new Date();
        const timeRanges = {
            '1h': 60 * 60 * 1000,
            '6h': 6 * 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000
        };

        const rangeMs = timeRanges[timeRange] || timeRanges['24h'];
        const cutoffTime = new Date(now.getTime() - rangeMs);

        return data.filter(entry => new Date(entry.timestamp) >= cutoffTime);
    }

    calculateAverageMetrics(data) {
        if (data.length === 0) return {};

        const metrics = ['responseTime', 'accuracy', 'efficiency', 'adaptation', 'cognitiveLoad', 'neuralEfficiency'];
        const averages = {};

        metrics.forEach(metric => {
            const values = data.map(entry => entry.metrics[metric]).filter(val => val !== undefined);
            if (values.length > 0) {
                averages[metric] = values.reduce((sum, val) => sum + val, 0) / values.length;
            }
        });

        return averages;
    }

    calculateTrends(data) {
        if (data.length < 2) return {};

        const trends = {};
        const metrics = ['responseTime', 'accuracy', 'efficiency', 'adaptation', 'cognitiveLoad', 'neuralEfficiency'];

        metrics.forEach(metric => {
            const values = data.map(entry => entry.metrics[metric]).filter(val => val !== undefined);
            if (values.length >= 2) {
                trends[metric] = this.calculateTrendFromScores(values);
            }
        });

        return trends;
    }

    generateAnalyticsInsights(data) {
        const insights = [];
        const averageMetrics = this.calculateAverageMetrics(data);

        if (averageMetrics.responseTime > this.performanceThresholds.responseTime) {
            insights.push('Consistently high response times detected');
        }

        if (averageMetrics.accuracy < this.performanceThresholds.accuracy) {
            insights.push('Accuracy consistently below target threshold');
        }

        if (averageMetrics.cognitiveLoad > 80) {
            insights.push('Sustained high cognitive load observed');
        }

        return insights;
    }

    generateAnalyticsRecommendations(data) {
        const recommendations = [];
        const averageMetrics = this.calculateAverageMetrics(data);

        if (averageMetrics.responseTime > this.performanceThresholds.responseTime) {
            recommendations.push('Implement response time optimization');
            recommendations.push('Consider parallel processing architecture');
        }

        if (averageMetrics.accuracy < this.performanceThresholds.accuracy) {
            recommendations.push('Enhance decision-making algorithms');
            recommendations.push('Implement additional validation layers');
        }

        if (averageMetrics.cognitiveLoad > 80) {
            recommendations.push('Implement cognitive load balancing');
            recommendations.push('Add task prioritization mechanisms');
        }

        return recommendations;
    }

    async exportAnalytics(agentId, format = 'json') {
        try {
            const analytics = await this.getAgentAnalytics(agentId, '30d');
            
            if (format === 'json') {
                return JSON.stringify(analytics, null, 2);
            } else if (format === 'csv') {
                return this.convertToCSV(analytics);
            } else {
                throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            this.logger.error('Failed to export analytics:', error);
            throw error;
        }
    }

    convertToCSV(analytics) {
        const headers = ['timestamp', 'responseTime', 'accuracy', 'efficiency', 'adaptation', 'cognitiveLoad', 'neuralEfficiency'];
        const rows = analytics.dataPoints.map(data => [
            data.timestamp,
            data.metrics.responseTime,
            data.metrics.accuracy,
            data.metrics.efficiency,
            data.metrics.adaptation,
            data.metrics.cognitiveLoad,
            data.metrics.neuralEfficiency
        ]);

        const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
        return csvContent;
    }
}

module.exports = RealTimeAnalytics; 