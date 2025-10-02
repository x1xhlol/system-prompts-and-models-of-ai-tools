/**
 * Example: Consuming the AI Tools API with JavaScript/Node.js
 * 
 * This script demonstrates various ways to interact with the
 * system-prompts-and-models-of-ai-tools API endpoints.
 */

const fs = require('fs').promises;
const path = require('path');

class AIToolsAPI {
    constructor(apiBasePath = 'api') {
        this.apiBase = apiBasePath;
    }

    async loadJSON(filename) {
        const filePath = path.join(this.apiBase, filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    }

    async getAllTools() {
        return await this.loadJSON('index.json');
    }

    async getTool(slug) {
        return await this.loadJSON(`tools/${slug}.json`);
    }

    async getByType() {
        return await this.loadJSON('by-type.json');
    }

    async getByPricing() {
        return await this.loadJSON('by-pricing.json');
    }

    async getFeatures() {
        return await this.loadJSON('features.json');
    }

    async getStatistics() {
        return await this.loadJSON('statistics.json');
    }

    async search(query) {
        const searchData = await this.loadJSON('search.json');
        const queryLower = query.toLowerCase();
        
        return searchData.index.filter(tool => {
            const keywords = tool.keywords.join(' ').toLowerCase();
            const name = tool.name.toLowerCase();
            const desc = tool.description.toLowerCase();
            
            return keywords.includes(queryLower) ||
                   name.includes(queryLower) ||
                   desc.includes(queryLower);
        });
    }
}

async function main() {
    const api = new AIToolsAPI();

    console.log('🚀 AI Tools API - JavaScript Examples\n');
    console.log('='.repeat(60));

    // Example 1: Get all tools
    console.log('\n📊 Example 1: Get All Tools');
    console.log('-'.repeat(60));
    const allTools = await api.getAllTools();
    console.log(`Total tools: ${allTools.tools.length}`);
    console.log(`Generated: ${allTools.generated}`);
    console.log('\nFirst 3 tools:');
    allTools.tools.slice(0, 3).forEach(tool => {
        console.log(`  - ${tool.name} (${tool.type}) - ${tool.pricing}`);
    });

    // Example 2: Get a specific tool
    console.log('\n🎯 Example 2: Get Specific Tool (Cursor)');
    console.log('-'.repeat(60));
    const cursor = await api.getTool('cursor');
    console.log(`Name: ${cursor.name}`);
    console.log(`Type: ${cursor.type}`);
    console.log(`Description: ${cursor.description}`);
    console.log(`Features: ${cursor.features.slice(0, 5).join(', ')}...`);
    console.log(`Models: ${cursor.models.slice(0, 3).join(', ')}...`);

    // Example 3: Get tools by type
    console.log('\n📁 Example 3: Get Tools by Type');
    console.log('-'.repeat(60));
    const byType = await api.getByType();
    Object.entries(byType.by_type).forEach(([type, tools]) => {
        console.log(`${type}: ${tools.length} tools`);
        const examples = tools.slice(0, 3).map(t => t.name).join(', ');
        console.log(`  Examples: ${examples}`);
    });

    // Example 4: Get tools by pricing
    console.log('\n💰 Example 4: Get Tools by Pricing');
    console.log('-'.repeat(60));
    const byPricing = await api.getByPricing();
    Object.entries(byPricing.by_pricing).forEach(([pricing, tools]) => {
        console.log(`${pricing}: ${tools.length} tools`);
    });

    // Example 5: Get feature matrix
    console.log('\n🔧 Example 5: Feature Adoption Matrix');
    console.log('-'.repeat(60));
    const features = await api.getFeatures();
    console.log(`Total features tracked: ${Object.keys(features.features).length}`);
    console.log('\nMost common features:');
    Object.entries(features.features).slice(0, 5).forEach(([name, data]) => {
        const adoptionRate = (data.count / allTools.tools.length) * 100;
        console.log(`  - ${name}: ${data.count} tools (${adoptionRate.toFixed(1)}%)`);
    });

    // Example 6: Get statistics
    console.log('\n📈 Example 6: Repository Statistics');
    console.log('-'.repeat(60));
    const stats = await api.getStatistics();
    console.log(`Total tools: ${stats.total_tools}`);
    console.log(`Total features: ${stats.total_features}`);
    console.log(`Total models: ${stats.total_models}`);
    console.log(`\nMost common type: ${stats.most_common_type.type} (${stats.most_common_type.count} tools)`);
    console.log(`Most common pricing: ${stats.most_common_pricing.pricing} (${stats.most_common_pricing.count} tools)`);
    console.log('\nTop 3 features:');
    stats.most_common_features.slice(0, 3).forEach(feature => {
        console.log(`  - ${feature.feature}: ${feature.count} tools`);
    });

    // Example 7: Search functionality
    console.log('\n🔍 Example 7: Search for "agent" tools');
    console.log('-'.repeat(60));
    const searchResults = await api.search('agent');
    console.log(`Found ${searchResults.length} tools matching 'agent':`);
    searchResults.slice(0, 5).forEach(result => {
        console.log(`  - ${result.name} (${result.type})`);
    });

    // Example 8: Find tools with specific features
    console.log('\n🎨 Example 8: Find Tools with "Code Generation"');
    console.log('-'.repeat(60));
    const toolsWithCodeGen = allTools.tools.filter(tool =>
        tool.features.includes('Code generation')
    );
    console.log(`Found ${toolsWithCodeGen.length} tools with code generation:`);
    toolsWithCodeGen.slice(0, 5).forEach(tool => {
        console.log(`  - ${tool.name}`);
    });

    // Example 9: Find free tools
    console.log('\n💵 Example 9: Find Free Tools');
    console.log('-'.repeat(60));
    const freeTools = allTools.tools.filter(tool => tool.pricing === 'free');
    console.log(`Found ${freeTools.length} free tools:`);
    freeTools.forEach(tool => {
        console.log(`  - ${tool.name} (${tool.type})`);
    });

    // Example 10: Compare two tools
    console.log('\n⚖️  Example 10: Compare Cursor vs GitHub Copilot');
    console.log('-'.repeat(60));
    const copilot = await api.getTool('github-copilot');

    console.log(`\n${cursor.name}:`);
    console.log(`  Type: ${cursor.type}`);
    console.log(`  Pricing: ${cursor.pricing}`);
    console.log(`  Features: ${cursor.features.length} total`);
    console.log(`  Models: ${cursor.models.length} total`);

    console.log(`\n${copilot.name}:`);
    console.log(`  Type: ${copilot.type}`);
    console.log(`  Pricing: ${copilot.pricing}`);
    console.log(`  Features: ${copilot.features.length} total`);
    console.log(`  Models: ${copilot.models.length} total`);

    // Find unique features
    const cursorFeatures = new Set(cursor.features);
    const copilotFeatures = new Set(copilot.features);
    
    const uniqueCursor = [...cursorFeatures].filter(f => !copilotFeatures.has(f));
    const uniqueCopilot = [...copilotFeatures].filter(f => !cursorFeatures.has(f));
    const shared = [...cursorFeatures].filter(f => copilotFeatures.has(f));

    console.log(`\nShared features: ${shared.length}`);
    console.log(`Unique to Cursor: ${uniqueCursor.length}`);
    if (uniqueCursor.length > 0) {
        console.log(`  Examples: ${uniqueCursor.slice(0, 3).join(', ')}`);
    }
    console.log(`Unique to Copilot: ${uniqueCopilot.length}`);
    if (uniqueCopilot.length > 0) {
        console.log(`  Examples: ${uniqueCopilot.slice(0, 3).join(', ')}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Examples completed!');
    console.log('\nFor more information, see: api/README.md');
}

// Run examples
main().catch(console.error);
