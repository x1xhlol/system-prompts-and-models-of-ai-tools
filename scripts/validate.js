#!/usr/bin/env node

/**
 * validate.js - Repository Structure Validator
 * 
 * Validates that all tool directories follow the required structure
 * and that files are properly formatted.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const REQUIRED_STRUCTURE = {
  toolDir: {
    'README.md': true, // Required in each tool directory
    'Prompt.txt': false, // At least one prompt file required (can be versioned)
    'Tools.json': false, // Optional
  }
};

const EXCLUDED_DIRS = ['.git', '.github', 'site', 'assets', 'node_modules', 'scripts', 'metadata'];
const ROOT_DIR = path.join(__dirname, '..');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

class Validator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.passed = 0;
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  error(message) {
    this.errors.push(message);
    this.log(`❌ ERROR: ${message}`, 'red');
  }

  warn(message) {
    this.warnings.push(message);
    this.log(`⚠️  WARNING: ${message}`, 'yellow');
  }

  success(message) {
    this.passed++;
    this.log(`✅ ${message}`, 'green');
  }

  info(message) {
    this.log(`ℹ️  ${message}`, 'blue');
  }

  // Get all tool directories
  getToolDirectories() {
    const dirs = fs.readdirSync(ROOT_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      .filter(name => !EXCLUDED_DIRS.includes(name) && !name.startsWith('.'));
    
    return dirs;
  }

  // Check if directory has at least one prompt file
  hasPromptFile(dirPath) {
    const files = fs.readdirSync(dirPath);
    return files.some(file => 
      file.toLowerCase().includes('prompt') && 
      (file.endsWith('.txt') || file.endsWith('.md'))
    );
  }

  // Validate tool directory structure
  validateToolDirectory(toolName) {
    const toolPath = path.join(ROOT_DIR, toolName);
    const files = fs.readdirSync(toolPath);

    let valid = true;

    // Check for README.md
    if (!files.includes('README.md')) {
      this.warn(`${toolName}: Missing README.md`);
      valid = false;
    }

    // Check for at least one prompt file
    if (!this.hasPromptFile(toolPath)) {
      this.error(`${toolName}: No prompt file found`);
      valid = false;
    }

    if (valid) {
      this.success(`${toolName}: Structure valid`);
    }

    return valid;
  }

  // Validate file content
  validatePromptFile(toolName, fileName) {
    const filePath = path.join(ROOT_DIR, toolName, fileName);
    const content = fs.readFileSync(filePath, 'utf-8');

    // Check if file is not empty
    if (content.trim().length === 0) {
      this.error(`${toolName}/${fileName}: File is empty`);
      return false;
    }

    // Check for common issues
    if (content.includes('[REDACTED]') && !content.includes('redaction')) {
      this.warn(`${toolName}/${fileName}: Contains [REDACTED] markers`);
    }

    // Check file size (warn if suspiciously small)
    if (content.length < 500) {
      this.warn(`${toolName}/${fileName}: Suspiciously small (${content.length} chars)`);
    }

    return true;
  }

  // Validate JSON files
  validateJsonFile(toolName, fileName) {
    const filePath = path.join(ROOT_DIR, toolName, fileName);
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      JSON.parse(content);
      this.success(`${toolName}/${fileName}: Valid JSON`);
      return true;
    } catch (error) {
      this.error(`${toolName}/${fileName}: Invalid JSON - ${error.message}`);
      return false;
    }
  }

  // Validate README.md in tool directory
  validateToolReadme(toolName) {
    const readmePath = path.join(ROOT_DIR, toolName, 'README.md');
    
    if (!fs.existsSync(readmePath)) {
      return false; // Already warned in validateToolDirectory
    }

    const content = fs.readFileSync(readmePath, 'utf-8');

    // Check for required sections (basic)
    const requiredSections = ['Overview', 'Files'];
    const missingSections = requiredSections.filter(section => 
      !content.toLowerCase().includes(section.toLowerCase())
    );

    if (missingSections.length > 0) {
      this.warn(`${toolName}/README.md: Missing sections: ${missingSections.join(', ')}`);
    }

    return true;
  }

  // Check for duplicate tool names (case-insensitive)
  checkDuplicates() {
    const dirs = this.getToolDirectories();
    const lowerCaseNames = dirs.map(d => d.toLowerCase());
    const duplicates = lowerCaseNames.filter((name, index) => 
      lowerCaseNames.indexOf(name) !== index
    );

    if (duplicates.length > 0) {
      this.error(`Duplicate tool directories found: ${duplicates.join(', ')}`);
    }
  }

  // Main validation
  run() {
    this.log('\n🔍 Starting Repository Validation...\n', 'blue');

    // Get all tool directories
    const toolDirs = this.getToolDirectories();
    this.info(`Found ${toolDirs.length} tool directories\n`);

    // Validate each tool directory
    toolDirs.forEach(toolName => {
      this.validateToolDirectory(toolName);
      
      // Validate specific files if they exist
      const toolPath = path.join(ROOT_DIR, toolName);
      const files = fs.readdirSync(toolPath);

      // Validate prompt files
      files.filter(f => f.toLowerCase().includes('prompt') && f.endsWith('.txt'))
        .forEach(file => this.validatePromptFile(toolName, file));

      // Validate JSON files
      files.filter(f => f.endsWith('.json'))
        .forEach(file => this.validateJsonFile(toolName, file));

      // Validate README
      this.validateToolReadme(toolName);
    });

    // Check for duplicates
    this.checkDuplicates();

    // Print summary
    this.printSummary();

    // Exit with appropriate code
    process.exit(this.errors.length > 0 ? 1 : 0);
  }

  printSummary() {
    this.log('\n' + '='.repeat(50), 'blue');
    this.log('📊 Validation Summary', 'blue');
    this.log('='.repeat(50) + '\n', 'blue');

    this.log(`✅ Passed: ${this.passed}`, 'green');
    this.log(`⚠️  Warnings: ${this.warnings.length}`, 'yellow');
    this.log(`❌ Errors: ${this.errors.length}`, 'red');

    if (this.errors.length === 0 && this.warnings.length === 0) {
      this.log('\n🎉 All validations passed!', 'green');
    } else if (this.errors.length === 0) {
      this.log('\n✅ Validation passed with warnings', 'yellow');
    } else {
      this.log('\n❌ Validation failed', 'red');
    }

    this.log('');
  }
}

// Run validator
if (require.main === module) {
  const validator = new Validator();
  validator.run();
}

module.exports = Validator;
