#!/usr/bin/env node

/**
 * check-duplicates.js - Duplicate Content Detector
 * 
 * Checks for duplicate or very similar prompts across tools
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.join(__dirname, '..');
const EXCLUDED_DIRS = ['.git', '.github', 'site', 'assets', 'node_modules', 'scripts', 'metadata'];

class DuplicateChecker {
  constructor() {
    this.files = [];
    this.hashes = new Map();
    this.duplicates = [];
    this.similar = [];
  }

  log(message, color = '') {
    const colors = {
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      reset: '\x1b[0m',
    };
    console.log(`${colors[color] || ''}${message}${colors.reset}`);
  }

  // Calculate hash of file content
  calculateHash(content) {
    return crypto.createHash('md5').update(content).digest('hex');
  }

  // Calculate similarity between two strings (simple)
  calculateSimilarity(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const maxLen = Math.max(len1, len2);
    
    if (maxLen === 0) return 100;
    
    // Simple substring matching
    const shorter = len1 < len2 ? str1 : str2;
    const longer = len1 >= len2 ? str1 : str2;
    
    let matches = 0;
    const chunkSize = 100; // Compare 100-char chunks
    
    for (let i = 0; i < shorter.length - chunkSize; i += chunkSize) {
      const chunk = shorter.substring(i, i + chunkSize);
      if (longer.includes(chunk)) {
        matches += chunkSize;
      }
    }
    
    return Math.round((matches / maxLen) * 100);
  }

  // Get all tool directories
  getToolDirectories() {
    return fs.readdirSync(ROOT_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(name => !EXCLUDED_DIRS.includes(name) && !name.startsWith('.'));
  }

  // Collect all prompt files
  collectFiles() {
    const toolDirs = this.getToolDirectories();

    toolDirs.forEach(toolName => {
      const toolPath = path.join(ROOT_DIR, toolName);
      const files = fs.readdirSync(toolPath);

      files.filter(f => 
        (f.toLowerCase().includes('prompt') || f.toLowerCase().includes('system')) &&
        (f.endsWith('.txt') || f.endsWith('.md'))
      ).forEach(file => {
        const filePath = path.join(toolPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        this.files.push({
          tool: toolName,
          file,
          path: filePath,
          content,
          hash: this.calculateHash(content),
          size: content.length,
        });
      });
    });
  }

  // Find exact duplicates
  findExactDuplicates() {
    const hashMap = new Map();

    this.files.forEach(file => {
      if (hashMap.has(file.hash)) {
        hashMap.get(file.hash).push(file);
      } else {
        hashMap.set(file.hash, [file]);
      }
    });

    hashMap.forEach((files, hash) => {
      if (files.length > 1) {
        this.duplicates.push({
          hash,
          count: files.length,
          files: files.map(f => ({
            tool: f.tool,
            file: f.file,
            size: f.size,
          })),
        });
      }
    });
  }

  // Find similar files (not exact duplicates)
  findSimilarFiles(threshold = 80) {
    this.log('\n🔍 Checking for similar files (this may take a while)...\n');

    for (let i = 0; i < this.files.length; i++) {
      for (let j = i + 1; j < this.files.length; j++) {
        const file1 = this.files[i];
        const file2 = this.files[j];

        // Skip if already exact duplicates
        if (file1.hash === file2.hash) continue;

        // Skip if size difference is too large (> 50%)
        const sizeDiff = Math.abs(file1.size - file2.size) / Math.max(file1.size, file2.size);
        if (sizeDiff > 0.5) continue;

        const similarity = this.calculateSimilarity(file1.content, file2.content);

        if (similarity >= threshold) {
          this.similar.push({
            similarity,
            file1: {
              tool: file1.tool,
              file: file1.file,
              size: file1.size,
            },
            file2: {
              tool: file2.tool,
              file: file2.file,
              size: file2.size,
            },
          });
        }
      }
    }

    // Sort by similarity
    this.similar.sort((a, b) => b.similarity - a.similarity);
  }

  // Print report
  printReport() {
    this.log('\n' + '='.repeat(60));
    this.log('🔍 Duplicate Content Report');
    this.log('='.repeat(60) + '\n');

    this.log(`📊 Total Files Analyzed: ${this.files.length}\n`);

    // Exact duplicates
    if (this.duplicates.length > 0) {
      this.log(`⚠️  Exact Duplicates Found: ${this.duplicates.length}\n`, 'yellow');
      
      this.duplicates.forEach((dup, index) => {
        this.log(`${index + 1}. Duplicate Set (${dup.count} files):`);
        dup.files.forEach(f => {
          this.log(`   - ${f.tool}/${f.file} (${f.size} bytes)`);
        });
        this.log('');
      });
    } else {
      this.log('✅ No exact duplicates found\n', 'green');
    }

    // Similar files
    if (this.similar.length > 0) {
      this.log(`⚠️  Similar Files Found: ${this.similar.length}\n`, 'yellow');
      
      this.similar.slice(0, 10).forEach((sim, index) => {
        this.log(`${index + 1}. ${sim.similarity}% similar:`);
        this.log(`   - ${sim.file1.tool}/${sim.file1.file}`);
        this.log(`   - ${sim.file2.tool}/${sim.file2.file}`);
        this.log('');
      });

      if (this.similar.length > 10) {
        this.log(`   ... and ${this.similar.length - 10} more\n`);
      }
    } else {
      this.log('✅ No similar files found (>80% similarity)\n', 'green');
    }

    this.log('='.repeat(60) + '\n');
  }

  // Save report
  saveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalFiles: this.files.length,
      exactDuplicates: this.duplicates,
      similarFiles: this.similar,
    };

    const outputPath = path.join(ROOT_DIR, 'duplicate-report.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    this.log(`📄 Detailed report saved to: duplicate-report.json\n`);
  }

  // Main execution
  run() {
    this.log('\n🔍 Checking for Duplicate Content...\n');

    this.collectFiles();
    this.findExactDuplicates();
    this.findSimilarFiles(80); // 80% similarity threshold

    this.printReport();
    this.saveReport();

    // Exit code
    const hasIssues = this.duplicates.length > 0 || this.similar.length > 0;
    process.exit(hasIssues ? 1 : 0);
  }
}

// Run checker
if (require.main === module) {
  const checker = new DuplicateChecker();
  checker.run();
}

module.exports = DuplicateChecker;
