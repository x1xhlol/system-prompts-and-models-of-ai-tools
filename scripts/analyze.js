#!/usr/bin/env node

/**
 * analyze.js - Repository Pattern Analyzer
 * 
 * Analyzes all prompts in the repository to extract:
 * - Common patterns
 * - Security rules
 * - Tool architectures
 * - Statistics
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(__dirname, '..');
const EXCLUDED_DIRS = ['.git', '.github', 'site', 'assets', 'node_modules', 'scripts', 'metadata'];

class Analyzer {
  constructor() {
    this.tools = [];
    this.patterns = {
      security: [],
      conciseness: [],
      toolUsage: [],
      verification: [],
      parallel: [],
    };
    this.stats = {
      totalTools: 0,
      totalPrompts: 0,
      totalLines: 0,
      avgPromptLength: 0,
      avgToolCount: 0,
    };
  }

  log(message) {
    console.log(message);
  }

  // Get all tool directories
  getToolDirectories() {
    return fs.readdirSync(ROOT_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(name => !EXCLUDED_DIRS.includes(name) && !name.startsWith('.'));
  }

  // Analyze a prompt file
  analyzePrompt(toolName, fileName, content) {
    const lines = content.split('\n');
    const lowerContent = content.toLowerCase();

    // Extract patterns
    const analysis = {
      toolName,
      fileName,
      lineCount: lines.length,
      charCount: content.length,
      patterns: {
        hasSecurityRules: /never.*log.*secret|never.*expose|security|malicious/i.test(content),
        hasConciseness: /concise|brief|short|1-3 sentences|no preamble/i.test(content),
        hasToolInstructions: /tool|function|available tools/i.test(content),
        hasVerification: /verify|check|validate|test/i.test(content),
        hasParallel: /parallel|simultaneously|independent/i.test(content),
        hasTodo: /todo|progress|track/i.test(content),
        hasMemory: /memory|remember|persist|context/i.test(content),
        hasSubAgents: /sub-agent|delegate|oracle|reasoning/i.test(content),
      },
    };

    // Count security mentions
    const securityKeywords = ['never log', 'never expose', 'secret', 'api key', 'password', 'security'];
    analysis.securityMentions = securityKeywords.filter(kw => 
      lowerContent.includes(kw)
    ).length;

    return analysis;
  }

  // Analyze tool directory
  analyzeTool(toolName) {
    const toolPath = path.join(ROOT_DIR, toolName);
    const files = fs.readdirSync(toolPath);

    const promptFiles = files.filter(f => 
      (f.toLowerCase().includes('prompt') || f.toLowerCase().includes('system')) && 
      (f.endsWith('.txt') || f.endsWith('.md'))
    );

    const toolFiles = files.filter(f => f.endsWith('.json'));

    const tool = {
      name: toolName,
      promptCount: promptFiles.length,
      hasTools: toolFiles.length > 0,
      hasReadme: files.includes('README.md'),
      prompts: [],
    };

    // Analyze each prompt
    promptFiles.forEach(file => {
      const content = fs.readFileSync(path.join(toolPath, file), 'utf-8');
      const analysis = this.analyzePrompt(toolName, file, content);
      tool.prompts.push(analysis);
    });

    // Count tools if tools.json exists
    if (tool.hasTools) {
      try {
        const toolsContent = fs.readFileSync(path.join(toolPath, toolFiles[0]), 'utf-8');
        const toolsData = JSON.parse(toolsContent);
        tool.toolCount = Array.isArray(toolsData) ? toolsData.length : 
          (toolsData.tools ? toolsData.tools.length : 0);
      } catch (error) {
        tool.toolCount = 0;
      }
    }

    return tool;
  }

  // Calculate statistics
  calculateStats() {
    this.stats.totalTools = this.tools.length;
    this.stats.totalPrompts = this.tools.reduce((sum, t) => sum + t.promptCount, 0);
    this.stats.totalLines = this.tools.reduce((sum, t) => 
      sum + t.prompts.reduce((s, p) => s + p.lineCount, 0), 0
    );

    const allPrompts = this.tools.flatMap(t => t.prompts);
    this.stats.avgPromptLength = allPrompts.length > 0 ?
      Math.round(allPrompts.reduce((sum, p) => sum + p.lineCount, 0) / allPrompts.length) : 0;

    const toolsWithCounts = this.tools.filter(t => t.toolCount);
    this.stats.avgToolCount = toolsWithCounts.length > 0 ?
      Math.round(toolsWithCounts.reduce((sum, t) => sum + t.toolCount, 0) / toolsWithCounts.length) : 0;
  }

  // Extract common patterns
  extractPatterns() {
    const allPrompts = this.tools.flatMap(t => t.prompts);

    // Count pattern occurrences
    const patternCounts = {
      security: allPrompts.filter(p => p.patterns.hasSecurityRules).length,
      conciseness: allPrompts.filter(p => p.patterns.hasConciseness).length,
      tools: allPrompts.filter(p => p.patterns.hasToolInstructions).length,
      verification: allPrompts.filter(p => p.patterns.hasVerification).length,
      parallel: allPrompts.filter(p => p.patterns.hasParallel).length,
      todo: allPrompts.filter(p => p.patterns.hasTodo).length,
      memory: allPrompts.filter(p => p.patterns.hasMemory).length,
      subAgents: allPrompts.filter(p => p.patterns.hasSubAgents).length,
    };

    return patternCounts;
  }

  // Generate report
  generateReport() {
    const patternCounts = this.extractPatterns();
    const totalPrompts = this.stats.totalPrompts;

    const report = {
      summary: {
        totalTools: this.stats.totalTools,
        totalPrompts: this.stats.totalPrompts,
        totalLines: this.stats.totalLines,
        avgPromptLength: this.stats.avgPromptLength,
        avgToolCount: this.stats.avgToolCount,
      },
      patterns: {
        security: {
          count: patternCounts.security,
          percentage: Math.round((patternCounts.security / totalPrompts) * 100),
        },
        conciseness: {
          count: patternCounts.conciseness,
          percentage: Math.round((patternCounts.conciseness / totalPrompts) * 100),
        },
        toolInstructions: {
          count: patternCounts.tools,
          percentage: Math.round((patternCounts.tools / totalPrompts) * 100),
        },
        verification: {
          count: patternCounts.verification,
          percentage: Math.round((patternCounts.verification / totalPrompts) * 100),
        },
        parallelExecution: {
          count: patternCounts.parallel,
          percentage: Math.round((patternCounts.parallel / totalPrompts) * 100),
        },
        todoTracking: {
          count: patternCounts.todo,
          percentage: Math.round((patternCounts.todo / totalPrompts) * 100),
        },
        memorySystem: {
          count: patternCounts.memory,
          percentage: Math.round((patternCounts.memory / totalPrompts) * 100),
        },
        subAgents: {
          count: patternCounts.subAgents,
          percentage: Math.round((patternCounts.subAgents / totalPrompts) * 100),
        },
      },
      topTools: this.tools
        .sort((a, b) => b.prompts.reduce((s, p) => s + p.lineCount, 0) - 
                        a.prompts.reduce((s, p) => s + p.lineCount, 0))
        .slice(0, 10)
        .map(t => ({
          name: t.name,
          prompts: t.promptCount,
          lines: t.prompts.reduce((s, p) => s + p.lineCount, 0),
          hasTools: t.hasTools,
          toolCount: t.toolCount || 0,
        })),
    };

    return report;
  }

  // Print report to console
  printReport(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 Repository Analysis Report');
    console.log('='.repeat(60) + '\n');

    console.log('📈 Summary Statistics:');
    console.log(`  Total Tools: ${report.summary.totalTools}`);
    console.log(`  Total Prompts: ${report.summary.totalPrompts}`);
    console.log(`  Total Lines: ${report.summary.totalLines.toLocaleString()}`);
    console.log(`  Avg Prompt Length: ${report.summary.avgPromptLength} lines`);
    console.log(`  Avg Tool Count: ${report.summary.avgToolCount}\n`);

    console.log('🔍 Pattern Analysis:');
    Object.entries(report.patterns).forEach(([name, data]) => {
      const label = name.replace(/([A-Z])/g, ' $1').trim();
      console.log(`  ${label}: ${data.count} (${data.percentage}%)`);
    });

    console.log('\n🏆 Top 10 Tools by Prompt Size:');
    report.topTools.forEach((tool, index) => {
      console.log(`  ${index + 1}. ${tool.name} - ${tool.lines} lines, ${tool.prompts} prompts, ${tool.toolCount} tools`);
    });

    console.log('\n' + '='.repeat(60) + '\n');
  }

  // Save report to file
  saveReport(report) {
    const outputPath = path.join(ROOT_DIR, 'analysis-report.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`📄 Detailed report saved to: analysis-report.json\n`);
  }

  // Main analysis
  run() {
    console.log('\n🔍 Analyzing Repository...\n');

    // Get all tool directories
    const toolDirs = this.getToolDirectories();
    console.log(`Found ${toolDirs.length} tool directories\n`);

    // Analyze each tool
    toolDirs.forEach(toolName => {
      const tool = this.analyzeTool(toolName);
      this.tools.push(tool);
      console.log(`✓ Analyzed ${toolName}`);
    });

    // Calculate statistics
    this.calculateStats();

    // Generate and print report
    const report = this.generateReport();
    this.printReport(report);

    // Save detailed report
    this.saveReport(report);
  }
}

// Run analyzer
if (require.main === module) {
  const analyzer = new Analyzer();
  analyzer.run();
}

module.exports = Analyzer;
