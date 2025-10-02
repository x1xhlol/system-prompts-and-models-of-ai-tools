const fs = require('fs');
const path = require('path');

// Configuration
const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(__dirname, 'dist');
const FILES_DIR = path.join(DIST_DIR, 'files');
const METADATA_DIR = path.join(ROOT_DIR, 'metadata');

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

// Load metadata files
function loadMetadata() {
  const metadata = [];
  
  if (!fs.existsSync(METADATA_DIR)) {
    return metadata;
  }
  
  const files = fs.readdirSync(METADATA_DIR);
  
  for (const file of files) {
    if (file.endsWith('.json') && file !== 'README.md') {
      try {
        const content = fs.readFileSync(path.join(METADATA_DIR, file), 'utf-8');
        metadata.push(JSON.parse(content));
      } catch (error) {
        console.warn(`Warning: Could not load metadata from ${file}`);
      }
    }
  }
  
  return metadata;
}

// Generate enhanced HTML for individual file pages
function generateFileHTML(filePath, content, fileInfo, metadata) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const extension = path.extname(filePath);
  const language = extension === '.json' ? 'json' : extension === '.md' ? 'markdown' : 'text';
  const lines = content.split('\n');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(relativePath)} - System Prompts</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <style>
        :root {
            --bg-primary: #0d1117;
            --bg-secondary: #161b22;
            --bg-tertiary: #21262d;
            --border-color: #30363d;
            --text-primary: #c9d1d9;
            --text-secondary: #8b949e;
            --accent-color: #58a6ff;
            --success-color: #3fb950;
            --warning-color: #d29922;
        }
        
        [data-theme="light"] {
            --bg-primary: #ffffff;
            --bg-secondary: #f6f8fa;
            --bg-tertiary: #eaeef2;
            --border-color: #d0d7de;
            --text-primary: #24292f;
            --text-secondary: #57606a;
            --accent-color: #0969da;
            --success-color: #1a7f37;
            --warning-color: #9a6700;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            background: var(--bg-primary);
            color: var(--text-primary);
            padding: 20px;
            transition: background 0.3s, color 0.3s;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        
        header {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        
        .header-left {
            flex: 1;
        }
        
        h1 {
            color: var(--accent-color);
            font-size: 24px;
            margin-bottom: 10px;
        }
        
        .breadcrumb {
            font-size: 14px;
            color: var(--text-secondary);
        }
        
        .breadcrumb a {
            color: var(--accent-color);
            text-decoration: none;
        }
        
        .breadcrumb a:hover {
            text-decoration: underline;
        }
        
        .controls {
            display: flex;
            gap: 10px;
        }
        
        button {
            padding: 8px 16px;
            background: var(--bg-secondary);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.2s;
        }
        
        button:hover {
            background: var(--bg-tertiary);
        }
        
        .theme-toggle {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 8px 12px;
            cursor: pointer;
            font-size: 18px;
        }
        
        .file-info {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
            font-size: 14px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
        }
        
        .file-info div {
            display: flex;
            align-items: center;
        }
        
        .file-info strong {
            color: var(--text-secondary);
            margin-right: 10px;
        }
        
        .code-container {
            position: relative;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            margin-bottom: 20px;
        }
        
        .code-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 15px;
            border-bottom: 1px solid var(--border-color);
            background: var(--bg-tertiary);
            border-radius: 6px 6px 0 0;
        }
        
        .code-language {
            font-size: 12px;
            color: var(--text-secondary);
            text-transform: uppercase;
            font-weight: 600;
        }
        
        .copy-button {
            padding: 4px 12px;
            font-size: 12px;
        }
        
        .copy-button.copied {
            background: var(--success-color);
            color: white;
            border-color: var(--success-color);
        }
        
        pre {
            margin: 0;
            padding: 20px;
            overflow-x: auto;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 14px;
            line-height: 1.5;
            border-radius: 0 0 6px 6px;
        }
        
        .line-numbers {
            position: absolute;
            left: 0;
            top: 48px;
            bottom: 0;
            width: 50px;
            padding: 20px 10px;
            text-align: right;
            color: var(--text-secondary);
            user-select: none;
            border-right: 1px solid var(--border-color);
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .code-with-lines pre {
            padding-left: 70px;
        }
        
        .actions {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .back-button, .download-button {
            display: inline-block;
            padding: 8px 16px;
            background: var(--bg-tertiary);
            color: var(--accent-color);
            text-decoration: none;
            border-radius: 6px;
            font-size: 14px;
            border: 1px solid var(--border-color);
        }
        
        .back-button:hover, .download-button:hover {
            background: var(--border-color);
        }
        
        @media (max-width: 768px) {
            header {
                flex-direction: column;
                gap: 15px;
            }
            
            .controls {
                width: 100%;
            }
            
            .file-info {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="header-left">
                <h1>${escapeHtml(path.basename(filePath))}</h1>
                <div class="breadcrumb">
                    <a href="../index.html">Home</a> / ${escapeHtml(relativePath)}
                </div>
            </div>
            <div class="controls">
                <button class="theme-toggle" onclick="toggleTheme()" title="Toggle theme">
                    🌓
                </button>
            </div>
        </header>
        
        <div class="file-info">
            <div><strong>Path:</strong> ${escapeHtml(relativePath)}</div>
            <div><strong>Size:</strong> ${fileInfo.size.toLocaleString()} bytes</div>
            <div><strong>Lines:</strong> ${lines.length.toLocaleString()}</div>
            <div><strong>Type:</strong> ${language}</div>
        </div>
        
        <div class="code-container code-with-lines">
            <div class="code-header">
                <span class="code-language">${language}</span>
                <button class="copy-button" onclick="copyCode()">Copy</button>
            </div>
            <div class="line-numbers" id="lineNumbers"></div>
            <pre><code class="${language}" id="codeContent">${escapeHtml(content)}</code></pre>
        </div>
        
        <div class="actions">
            <a href="../index.html" class="back-button">← Back to Index</a>
            <a href="#" class="download-button" onclick="downloadFile(); return false;">⬇ Download</a>
        </div>
    </div>
    
    <script>
        // Initialize syntax highlighting
        hljs.highlightAll();
        
        // Generate line numbers
        const lineCount = ${lines.length};
        const lineNumbers = document.getElementById('lineNumbers');
        for (let i = 1; i <= lineCount; i++) {
            lineNumbers.innerHTML += i + '\\n';
        }
        
        // Theme toggle
        function toggleTheme() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        }
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Copy code functionality
        function copyCode() {
            const code = document.getElementById('codeContent').textContent;
            navigator.clipboard.writeText(code).then(() => {
                const button = document.querySelector('.copy-button');
                button.textContent = 'Copied!';
                button.classList.add('copied');
                setTimeout(() => {
                    button.textContent = 'Copy';
                    button.classList.remove('copied');
                }, 2000);
            });
        }
        
        // Download file
        function downloadFile() {
            const code = document.getElementById('codeContent').textContent;
            const filename = '${escapeHtml(path.basename(filePath))}';
            const blob = new Blob([code], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }
    </script>
</body>
</html>`;
}

// Generate enhanced index HTML with search and filters
function generateIndexHTML(fileTree, stats, metadata) {
  const metadataJson = JSON.stringify(metadata, null, 2);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Prompts and Models of AI Tools</title>
    <style>
        :root {
            --bg-primary: #0d1117;
            --bg-secondary: #161b22;
            --bg-tertiary: #21262d;
            --border-color: #30363d;
            --text-primary: #c9d1d9;
            --text-secondary: #8b949e;
            --accent-color: #58a6ff;
            --success-color: #3fb950;
            --warning-color: #d29922;
        }
        
        [data-theme="light"] {
            --bg-primary: #ffffff;
            --bg-secondary: #f6f8fa;
            --bg-tertiary: #eaeef2;
            --border-color: #d0d7de;
            --text-primary: #24292f;
            --text-secondary: #57606a;
            --accent-color: #0969da;
            --success-color: #1a7f37;
            --warning-color: #9a6700;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            background: var(--bg-primary);
            color: var(--text-primary);
            padding: 20px;
            transition: background 0.3s, color 0.3s;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        header {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px 20px;
            background: linear-gradient(135deg, #1f6feb 0%, #58a6ff 100%);
            border-radius: 10px;
            color: white;
            position: relative;
        }
        
        .theme-toggle {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 6px;
            padding: 8px 12px;
            cursor: pointer;
            font-size: 18px;
        }
        
        h1 {
            font-size: 32px;
            margin-bottom: 10px;
        }
        
        .subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .search-filter-section {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 20px;
            margin-bottom: 30px;
        }
        
        .search-box {
            width: 100%;
            padding: 12px 20px;
            font-size: 16px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            background: var(--bg-primary);
            color: var(--text-primary);
            margin-bottom: 15px;
        }
        
        .search-box:focus {
            outline: 2px solid var(--accent-color);
        }
        
        .filters {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .filter-group {
            flex: 1;
            min-width: 200px;
        }
        
        .filter-group label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            color: var(--text-secondary);
            margin-bottom: 5px;
        }
        
        select {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid var(--border-color);
            border-radius: 6px;
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 14px;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 20px;
            text-align: center;
            transition: transform 0.2s;
        }
        
        .stat-card:hover {
            transform: translateY(-2px);
        }
        
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: var(--accent-color);
            display: block;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 14px;
            color: var(--text-secondary);
        }
        
        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            border-bottom: 2px solid var(--border-color);
        }
        
        .tab {
            padding: 10px 20px;
            background: transparent;
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            font-size: 16px;
            border-bottom: 2px solid transparent;
            margin-bottom: -2px;
            transition: all 0.2s;
        }
        
        .tab:hover {
            color: var(--text-primary);
        }
        
        .tab.active {
            color: var(--accent-color);
            border-bottom-color: var(--accent-color);
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .file-tree {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 20px;
        }
        
        .directory {
            margin-bottom: 20px;
        }
        
        .directory-name {
            font-size: 18px;
            font-weight: bold;
            color: var(--accent-color);
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--border-color);
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .directory-name:hover {
            color: var(--success-color);
        }
        
        .collapse-icon {
            font-size: 14px;
            transition: transform 0.2s;
        }
        
        .directory.collapsed .collapse-icon {
            transform: rotate(-90deg);
        }
        
        .directory.collapsed .file-list {
            display: none;
        }
        
        .file-list {
            list-style: none;
            padding-left: 20px;
        }
        
        .file-item {
            margin: 8px 0;
        }
        
        .file-link {
            color: var(--text-primary);
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            padding: 5px 10px;
            border-radius: 4px;
            transition: background 0.2s;
        }
        
        .file-link:hover {
            background: var(--bg-tertiary);
            color: var(--accent-color);
        }
        
        .file-icon {
            margin-right: 8px;
        }
        
        .tool-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        
        .tool-card {
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            padding: 20px;
            transition: all 0.2s;
        }
        
        .tool-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .tool-card h3 {
            color: var(--accent-color);
            margin-bottom: 10px;
        }
        
        .tool-card p {
            color: var(--text-secondary);
            font-size: 14px;
            margin-bottom: 15px;
        }
        
        .tool-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-bottom: 15px;
        }
        
        .tag {
            background: var(--bg-tertiary);
            color: var(--text-primary);
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 12px;
        }
        
        .tool-link {
            display: inline-block;
            color: var(--accent-color);
            text-decoration: none;
            font-size: 14px;
        }
        
        .tool-link:hover {
            text-decoration: underline;
        }
        
        .comparison-table {
            width: 100%;
            border-collapse: collapse;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            overflow: hidden;
        }
        
        .comparison-table th,
        .comparison-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid var(--border-color);
        }
        
        .comparison-table th {
            background: var(--bg-tertiary);
            font-weight: 600;
            color: var(--text-secondary);
        }
        
        .comparison-table tr:hover {
            background: var(--bg-tertiary);
        }
        
        footer {
            margin-top: 40px;
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid var(--border-color);
            color: var(--text-secondary);
            font-size: 14px;
        }
        
        footer a {
            color: var(--accent-color);
            text-decoration: none;
        }
        
        footer a:hover {
            text-decoration: underline;
        }
        
        .no-results {
            text-align: center;
            padding: 40px;
            color: var(--text-secondary);
        }
        
        @media (max-width: 768px) {
            .filters {
                flex-direction: column;
            }
            
            .tool-grid {
                grid-template-columns: 1fr;
            }
            
            .comparison-table {
                font-size: 12px;
            }
            
            .comparison-table th,
            .comparison-table td {
                padding: 8px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <button class="theme-toggle" onclick="toggleTheme()" title="Toggle theme">
                🌓
            </button>
            <h1>📜 System Prompts and Models of AI Tools</h1>
            <p class="subtitle">A comprehensive collection of system prompts and configurations from 30+ AI coding tools</p>
        </header>
        
        <div class="search-filter-section">
            <input 
                type="text" 
                class="search-box" 
                id="searchBox" 
                placeholder="🔍 Search tools, files, or content..."
                onkeyup="handleSearch()"
            />
            <div class="filters">
                <div class="filter-group">
                    <label>Tool Type</label>
                    <select id="typeFilter" onchange="applyFilters()">
                        <option value="all">All Types</option>
                        <option value="IDE Plugin">IDE Plugins</option>
                        <option value="CLI Tool">CLI Tools</option>
                        <option value="Web Platform">Web Platforms</option>
                        <option value="Autonomous Agent">Autonomous Agents</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Pricing</label>
                    <select id="pricingFilter" onchange="applyFilters()">
                        <option value="all">All Pricing</option>
                        <option value="free">Free</option>
                        <option value="freemium">Freemium</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Features</label>
                    <select id="featureFilter" onchange="applyFilters()">
                        <option value="all">All Features</option>
                        <option value="agentMode">Agent Mode</option>
                        <option value="parallelExecution">Parallel Execution</option>
                        <option value="todoTracking">TODO Tracking</option>
                        <option value="memorySystem">Memory System</option>
                    </select>
                </div>
            </div>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <span class="stat-number">${stats.totalFiles}</span>
                <span class="stat-label">Total Files</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${stats.totalDirectories}</span>
                <span class="stat-label">Tool Directories</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${Math.round(stats.totalSize / 1024)}KB</span>
                <span class="stat-label">Total Size</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${metadata.length}</span>
                <span class="stat-label">Tools Documented</span>
            </div>
        </div>
        
        <div class="tabs">
            <button class="tab active" onclick="switchTab('files')">📁 Files</button>
            <button class="tab" onclick="switchTab('tools')">🛠️ Tools</button>
            <button class="tab" onclick="switchTab('comparison')">📊 Comparison</button>
        </div>
        
        <div id="filesTab" class="tab-content active">
            <div class="file-tree" id="fileTree">
                ${generateFileTreeHTML(fileTree)}
            </div>
        </div>
        
        <div id="toolsTab" class="tab-content">
            <div class="tool-grid" id="toolGrid">
                ${generateToolCardsHTML(metadata)}
            </div>
        </div>
        
        <div id="comparisonTab" class="tab-content">
            ${generateComparisonTableHTML(metadata)}
        </div>
        
        <footer>
            <p>Generated from <a href="https://github.com/sahiixx/system-prompts-and-models-of-ai-tools" target="_blank">sahiixx/system-prompts-and-models-of-ai-tools</a></p>
            <p style="margin-top: 10px;">Built with ❤️ for the AI coding community</p>
        </footer>
    </div>
    
    <script>
        // Store metadata globally
        const metadata = ${metadataJson};
        
        // Theme toggle
        function toggleTheme() {
            const html = document.documentElement;
            const currentTheme = html.getAttribute('data-theme') || 'dark';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        }
        
        // Load saved theme
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Tab switching
        function switchTab(tabName) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            document.querySelectorAll('.tab').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Show selected tab
            document.getElementById(tabName + 'Tab').classList.add('active');
            event.target.classList.add('active');
        }
        
        // Directory collapse/expand
        document.querySelectorAll('.directory-name').forEach(dir => {
            dir.addEventListener('click', function() {
                this.parentElement.classList.toggle('collapsed');
            });
        });
        
        // Search functionality
        function handleSearch() {
            const query = document.getElementById('searchBox').value.toLowerCase();
            
            // Search in files tab
            document.querySelectorAll('.file-item').forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(query) ? 'block' : 'none';
            });
            
            // Search in tools tab
            document.querySelectorAll('.tool-card').forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(query) ? 'block' : 'none';
            });
            
            // Hide empty directories
            document.querySelectorAll('.directory').forEach(dir => {
                const visibleFiles = Array.from(dir.querySelectorAll('.file-item')).some(item => item.style.display !== 'none');
                dir.style.display = visibleFiles ? 'block' : 'none';
            });
        }
        
        // Filter functionality
        function applyFilters() {
            const typeFilter = document.getElementById('typeFilter').value;
            const pricingFilter = document.getElementById('pricingFilter').value;
            const featureFilter = document.getElementById('featureFilter').value;
            
            document.querySelectorAll('.tool-card').forEach(card => {
                const slug = card.dataset.slug;
                const tool = metadata.find(t => t.slug === slug);
                
                if (!tool) {
                    card.style.display = 'none';
                    return;
                }
                
                let show = true;
                
                if (typeFilter !== 'all' && tool.type !== typeFilter) {
                    show = false;
                }
                
                if (pricingFilter !== 'all' && tool.pricing.model !== pricingFilter) {
                    show = false;
                }
                
                if (featureFilter !== 'all' && !tool.features[featureFilter]) {
                    show = false;
                }
                
                card.style.display = show ? 'block' : 'none';
            });
        }
    </script>
</body>
</html>`;
}

// Generate file tree HTML
function generateFileTreeHTML(tree) {
  let html = '';
  
  const sortedDirs = Object.keys(tree).sort();
  
  for (const dir of sortedDirs) {
    const files = tree[dir];
    if (files.length === 0) continue;
    
    html += `<div class="directory">
      <div class="directory-name">
        <span>📁 ${escapeHtml(dir)}</span>
        <span class="collapse-icon">▼</span>
      </div>
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
  
  return html || '<div class="no-results">No files found</div>';
}

// Generate tool cards HTML
function generateToolCardsHTML(metadata) {
  if (metadata.length === 0) {
    return '<div class="no-results">No tools found</div>';
  }
  
  let html = '';
  
  for (const tool of metadata) {
    const tags = tool.tags || [];
    const tagsHTML = tags.slice(0, 3).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
    
    html += `
    <div class="tool-card" data-slug="${tool.slug}">
      <h3>${escapeHtml(tool.name)}</h3>
      <p>${escapeHtml(tool.description || 'No description available')}</p>
      <div class="tool-tags">${tagsHTML}</div>
      <a href="#" class="tool-link">View Details →</a>
    </div>`;
  }
  
  return html;
}

// Generate comparison table HTML
function generateComparisonTableHTML(metadata) {
  if (metadata.length === 0) {
    return '<div class="no-results">No tools available for comparison</div>';
  }
  
  let html = `
  <div style="overflow-x: auto;">
    <table class="comparison-table">
      <thead>
        <tr>
          <th>Tool</th>
          <th>Type</th>
          <th>Pricing</th>
          <th>Agent Mode</th>
          <th>Parallel</th>
          <th>TODO System</th>
          <th>Memory</th>
        </tr>
      </thead>
      <tbody>`;
  
  for (const tool of metadata) {
    html += `
      <tr>
        <td><strong>${escapeHtml(tool.name)}</strong></td>
        <td>${escapeHtml(tool.type)}</td>
        <td>${escapeHtml(tool.pricing?.model || 'Unknown')}</td>
        <td>${tool.features?.agentMode ? '✅' : '❌'}</td>
        <td>${tool.features?.parallelExecution ? '✅' : '❌'}</td>
        <td>${tool.features?.todoTracking ? '✅' : '❌'}</td>
        <td>${tool.features?.memorySystem ? '✅' : '❌'}</td>
      </tr>`;
  }
  
  html += `
      </tbody>
    </table>
  </div>`;
  
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
  console.log('🚀 Starting enhanced build process...\n');
  
  // Clean and create dist directories
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });
  fs.mkdirSync(FILES_DIR, { recursive: true });
  
  console.log('📂 Scanning repository...');
  const { fileTree, stats } = scanDirectory(ROOT_DIR);
  
  console.log('📊 Loading metadata...');
  const metadata = loadMetadata();
  
  console.log(`\n📊 Statistics:`);
  console.log(`   - Total files: ${stats.totalFiles}`);
  console.log(`   - Total directories: ${stats.totalDirectories}`);
  console.log(`   - Total size: ${Math.round(stats.totalSize / 1024)}KB`);
  console.log(`   - Tools with metadata: ${metadata.length}\n`);
  
  // Generate individual file pages
  console.log('📝 Generating file pages...');
  let generatedPages = 0;
  
  for (const dir in fileTree) {
    for (const file of fileTree[dir]) {
      try {
        const content = fs.readFileSync(file.path, 'utf-8');
        const html = generateFileHTML(file.path, content, { size: file.size }, metadata);
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
  console.log('\n📄 Generating enhanced index page...');
  const indexHTML = generateIndexHTML(fileTree, stats, metadata);
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), indexHTML);
  console.log('   ✓ Index page generated with search, filters, and comparison');
  
  console.log('\n✨ Enhanced build completed successfully!');
  console.log(`\n📁 Output directory: ${DIST_DIR}`);
  console.log('🌐 Open dist/index.html to view the site\n');
  console.log('✨ New features:');
  console.log('   • 🔍 Search across all files and tools');
  console.log('   • 🎨 Dark/Light theme toggle');
  console.log('   • 🏷️ Filter by type, pricing, and features');
  console.log('   • 📋 Copy code with one click');
  console.log('   • 📊 Comparison table view');
  console.log('   • 📱 Mobile-responsive design\n');
}

// Run build
try {
  build();
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
