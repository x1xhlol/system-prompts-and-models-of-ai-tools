const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(__dirname, 'dist');
const FILES_DIR = path.join(DIST_DIR, 'files');

// Directories to exclude from scanning
const EXCLUDED_DIRS = ['.git', 'node_modules', 'site', 'assets'];

// File extensions to include
const INCLUDED_EXTENSIONS = ['.txt', '.json', '.md'];

// Utility function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Generate HTML for individual file pages
function generateFileHTML(filePath, content, fileInfo) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const extension = path.extname(filePath);
  const language = extension === '.json' ? 'json' : extension === '.md' ? 'markdown' : 'text';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(relativePath)} - System Prompts</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            background: #0d1117;
            color: #c9d1d9;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        header {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #30363d;
        }
        
        h1 {
            color: #58a6ff;
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .breadcrumb {
            font-size: 14px;
            color: #8b949e;
        }
        
        .breadcrumb a {
            color: #58a6ff;
            text-decoration: none;
        }
        
        .breadcrumb a:hover {
            text-decoration: underline;
        }
        
        .file-info {
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        
        .file-info div {
            margin-bottom: 5px;
        }
        
        .file-info strong {
            color: #8b949e;
            margin-right: 10px;
        }
        
        pre {
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 20px;
            overflow-x: auto;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 14px;
            line-height: 1.5;
        }
        
        code {
            color: #c9d1d9;
        }
        
        .back-button {
            display: inline-block;
            padding: 8px 16px;
            background: #21262d;
            color: #58a6ff;
            text-decoration: none;
            border-radius: 6px;
            font-size: 14px;
            margin-top: 20px;
            border: 1px solid #30363d;
        }
        
        .back-button:hover {
            background: #30363d;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${escapeHtml(path.basename(filePath))}</h1>
            <div class="breadcrumb">
                <a href="../index.html">Home</a> / ${escapeHtml(relativePath)}
            </div>
        </header>
        
        <div class="file-info">
            <div><strong>Path:</strong> ${escapeHtml(relativePath)}</div>
            <div><strong>Size:</strong> ${fileInfo.size} bytes</div>
            <div><strong>Lines:</strong> ${content.split('\\n').length}</div>
        </div>
        
        <pre><code class="${language}">${escapeHtml(content)}</code></pre>
        
        <a href="../index.html" class="back-button">← Back to Index</a>
    </div>
</body>
</html>`;
}

// Generate HTML for index page
function generateIndexHTML(fileTree, stats) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Prompts and Models of AI Tools</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            background: #0d1117;
            color: #c9d1d9;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        header {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px 20px;
            background: linear-gradient(135deg, #1f6feb 0%, #58a6ff 100%);
            border-radius: 10px;
            color: white;
        }
        
        h1 {
            font-size: 32px;
            margin-bottom: 10px;
        }
        
        .subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 20px;
            text-align: center;
        }
        
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: #58a6ff;
            display: block;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 14px;
            color: #8b949e;
        }
        
        .file-tree {
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 6px;
            padding: 20px;
        }
        
        .directory {
            margin-bottom: 20px;
        }
        
        .directory-name {
            font-size: 18px;
            font-weight: bold;
            color: #58a6ff;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #30363d;
        }
        
        .file-list {
            list-style: none;
            padding-left: 20px;
        }
        
        .file-item {
            margin: 8px 0;
        }
        
        .file-link {
            color: #c9d1d9;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            padding: 5px 10px;
            border-radius: 4px;
            transition: background 0.2s;
        }
        
        .file-link:hover {
            background: #21262d;
            color: #58a6ff;
        }
        
        .file-icon {
            margin-right: 8px;
        }
        
        footer {
            margin-top: 40px;
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #30363d;
            color: #8b949e;
            font-size: 14px;
        }
        
        footer a {
            color: #58a6ff;
            text-decoration: none;
        }
        
        footer a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>📜 System Prompts and Models of AI Tools</h1>
            <p class="subtitle">A comprehensive collection of system prompts and configurations</p>
        </header>
        
        <div class="stats">
            <div class="stat-card">
                <span class="stat-number">${stats.totalFiles}</span>
                <span class="stat-label">Total Files</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${stats.totalDirectories}</span>
                <span class="stat-label">Directories</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${Math.round(stats.totalSize / 1024)}KB</span>
                <span class="stat-label">Total Size</span>
            </div>
        </div>
        
        <div class="file-tree">
            ${generateFileTreeHTML(fileTree)}
        </div>
        
        <footer>
            <p>Generated from <a href="https://github.com/sahiixx/system-prompts-and-models-of-ai-tools" target="_blank">sahiixx/system-prompts-and-models-of-ai-tools</a></p>
        </footer>
    </div>
</body>
</html>`;
}

// Generate HTML for file tree
function generateFileTreeHTML(tree) {
  let html = '';
  
  const sortedDirs = Object.keys(tree).sort();
  
  for (const dir of sortedDirs) {
    const files = tree[dir];
    if (files.length === 0) continue;
    
    html += `<div class="directory">
      <div class="directory-name">📁 ${escapeHtml(dir)}</div>
      <ul class="file-list">`;
    
    const sortedFiles = files.sort((a, b) => a.name.localeCompare(b.name));
    
    for (const file of sortedFiles) {
      const icon = file.name.endsWith('.json') ? '📋' : file.name.endsWith('.md') ? '📄' : '📝';
      html += `<li class="file-item">
        <a href="files/${escapeHtml(file.id)}.html" class="file-link">
          <span class="file-icon">${icon}</span>
          ${escapeHtml(file.name)}
        </a>
      </li>`;
    }
    
    html += `</ul></div>`;
  }
  
  return html;
}

// Scan directory recursively
function scanDirectory(dir, baseDir = dir, fileTree = {}, stats = { totalFiles: 0, totalDirectories: 0, totalSize: 0 }) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = path.relative(baseDir, fullPath);
    
    // Skip excluded directories
    if (EXCLUDED_DIRS.some(excluded => relativePath.startsWith(excluded))) {
      continue;
    }
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      stats.totalDirectories++;
      scanDirectory(fullPath, baseDir, fileTree, stats);
    } else if (stat.isFile()) {
      const ext = path.extname(fullPath);
      
      if (INCLUDED_EXTENSIONS.includes(ext)) {
        const dirName = path.dirname(relativePath);
        const displayDir = dirName === '.' ? 'Root' : dirName;
        
        if (!fileTree[displayDir]) {
          fileTree[displayDir] = [];
        }
        
        stats.totalFiles++;
        stats.totalSize += stat.size;
        
        fileTree[displayDir].push({
          name: path.basename(fullPath),
          path: fullPath,
          relativePath: relativePath,
          id: Buffer.from(relativePath).toString('base64').replace(/[^a-zA-Z0-9]/g, '_'),
          size: stat.size
        });
      }
    }
  }
  
  return { fileTree, stats };
}

// Main build function
function build() {
  console.log('🚀 Starting build process...\n');
  
  // Clean and create dist directories
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.mkdirSync(FILES_DIR, { recursive: true });
  
  console.log('📂 Scanning repository...');
  const { fileTree, stats } = scanDirectory(ROOT_DIR);
  
  console.log(`\n📊 Statistics:`);
  console.log(`   - Total files: ${stats.totalFiles}`);
  console.log(`   - Total directories: ${stats.totalDirectories}`);
  console.log(`   - Total size: ${Math.round(stats.totalSize / 1024)}KB\n`);
  
  // Generate individual file pages
  console.log('📝 Generating file pages...');
  let generatedPages = 0;
  
  for (const dir in fileTree) {
    for (const file of fileTree[dir]) {
      try {
        const content = fs.readFileSync(file.path, 'utf-8');
        const html = generateFileHTML(file.path, content, { size: file.size });
        const outputPath = path.join(FILES_DIR, `${file.id}.html`);
        fs.writeFileSync(outputPath, html);
        generatedPages++;
      } catch (error) {
        console.error(`   ⚠️  Error processing ${file.relativePath}: ${error.message}`);
      }
    }
  }
  
  console.log(`   ✓ Generated ${generatedPages} file pages`);
  
  // Generate index page
  console.log('\n📄 Generating index page...');
  const indexHTML = generateIndexHTML(fileTree, stats);
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexHTML);
  console.log('   ✓ Index page generated');
  
  console.log('\n✨ Build completed successfully!');
  console.log(`\n📁 Output directory: ${DIST_DIR}`);
  console.log('🌐 Run "npm run preview" to view the site locally\n');
}

// Run build
try {
  build();
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
