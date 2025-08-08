// Universal AI Agent - zero-dependency Node server (Node 18+)
// Features:
// - POST /chat { message, role?, optimizePrompt?: boolean }
// - Lightweight prompt optimizer (heuristics)
// - File-backed memory (memory.json)
// - Optional LLM call via OPENAI_API_KEY or ANTHROPIC_API_KEY using global fetch
// - CORS for local use

import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ENV } from './config/env.js';
import { optimizePrompt, respond } from './core/pipeline.js';
import { exec } from 'node:child_process';
import { initRedis, pushConversation } from './memory/redisStore.js';
import { initPg, logConversation } from './storage/pgLogger.js';
import { ingest as ragIngest, search as ragSearch, answer as ragAnswer } from './core/rag.js';
import { runAgents } from './core/agents.js';
import { continuousImprovement } from './core/continuous_improvement.js';
import { voiceIntegration } from './core/voice_integration.js';
import { pluginManager } from './core/plugin_system.js';
import { websocketServer } from './core/websocket.js';
import { advancedAuth } from './core/advanced_auth.js';
import { analytics } from './core/analytics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = Number(process.env.PORT || ENV.PORT || 8787);
const MEMORY_PATH = join(__dirname, 'memory.json');

function ensureMemory() {
  try {
    if (!existsSync(MEMORY_PATH)) {
      writeFileSync(MEMORY_PATH, JSON.stringify({ conversations: [] }, null, 2));
    }
  } catch (e) {
    console.error('Failed to init memory:', e);
  }
}

function readMemory() {
  try {
    return JSON.parse(readFileSync(MEMORY_PATH, 'utf-8'));
  } catch {
    return { conversations: [] };
  }
}

function writeMemory(data) {
  try {
    writeFileSync(MEMORY_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Failed to write memory:', e);
  }
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('content-length', Buffer.byteLength(body));
  res.end(body);
}

// --- Auth, Rate limiting, Logging helpers ---
function getIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function needsAuth(req) {
  const url = req.url || '';
  if (req.method === 'GET' && (url === '/' || url.startsWith('/health'))) return false;
  return !!ENV.AUTH_TOKEN;
}

function checkAuth(req) {
  if (!ENV.AUTH_TOKEN) return true;
  try {
    const h = req.headers['authorization'] || '';
    if (typeof h === 'string' && h.startsWith('Bearer ')) {
      const token = h.slice('Bearer '.length).trim();
      if (token === ENV.AUTH_TOKEN) return true;
    }
    const u = new URL(req.url, `http://localhost:${PORT}`);
    const qtok = u.searchParams.get('token');
    return qtok === ENV.AUTH_TOKEN;
  } catch {
    return false;
  }
}

const rlStore = new Map(); // ip -> { count, windowStart }
function rateLimited(ip) {
  const now = Date.now();
  const winMs = ENV.RATE_LIMIT_WINDOW_MS;
  const max = ENV.RATE_LIMIT_MAX;
  const cur = rlStore.get(ip) || { count: 0, windowStart: now };
  if (now - cur.windowStart >= winMs) {
    cur.windowStart = now;
    cur.count = 0;
  }
  cur.count += 1;
  rlStore.set(ip, cur);
  return cur.count > max;
}

function logReq(obj) {
  try {
    if (ENV.LOG_JSON) console.log(JSON.stringify(obj));
    else console.log(`[${obj.time}] ${obj.ip} ${obj.method} ${obj.url} -> ${obj.status} ${obj.ms}ms`);
  } catch {}
}

ensureMemory();
// Initialize optional backends
initRedis().then(() => console.log('Redis: initialized (if REDIS_URL set)')).catch(()=>{});
initPg().then(() => console.log('Postgres: initialized (if POSTGRES_URL set)')).catch(()=>{});
// Initialize plugin system
pluginManager.loadAllPlugins().then(() => console.log('Plugins: initialized')).catch(()=>{});
websocketServer.initialize();

// Initialize analytics tracking
analytics.on('alert', (alert) => {
  console.log(`🚨 Analytics Alert [${alert.severity}]: ${alert.message}`);
});

// Initialize advanced authentication
console.log('🔐 Advanced authentication system initialized');

/**
 * Handles incoming HTTP requests to the server.
 * Applies CORS headers, middleware for continuous learning, and logs request details.
 * Enforces authentication and rate limiting.
 * Routes requests to various endpoints for chat, RAG, multi-agent, voice processing, plugin management, and system health.
 * Responds with appropriate JSON or HTML content based on the endpoint.
 */
const server = createServer(async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.end();
  const start = Date.now();
  const ip = getIp(req);
  
  // Apply learning middleware for continuous improvement
  continuousImprovement.learningMiddleware(req, res, () => {});
  
  res.on('finish', () => {
    logReq({ time: new Date().toISOString(), ip, method: req.method, url: req.url, status: res.statusCode, ms: Date.now() - start });
  });
  if (needsAuth(req) && !checkAuth(req)) {
    return sendJson(res, 401, { error: 'unauthorized' });
  }
  if (rateLimited(ip)) {
    return sendJson(res, 429, { error: 'rate_limited' });
  }

  if (req.method === 'GET' && req.url === '/') {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    return res.end(`<!doctype html>
<html><head><meta charset="utf-8"><title>Universal AI Agent</title>
<style>body{font-family:ui-sans-serif,system-ui;margin:24px;max-width:1200px} input,textarea{width:100%} .row{margin:8px 0} .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px} .grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px} .health{background:#f0f9ff;padding:12px;border-radius:8px;margin:8px 0} .metric{background:#fff;padding:8px;border-radius:4px;margin:4px 0} .status-healthy{color:#059669} .status-warning{color:#d97706} .status-critical{color:#dc2626}</style>
</head><body>
<h1>🤖 Universal AI Agent</h1>
<div class="row">Auth Token (if configured): <input id="tok" placeholder="Paste bearer token here"></div>

<div class="health" id="healthPanel">
  <h3>System Health</h3>
  <div id="healthMetrics">Loading...</div>
  <button onclick="refreshHealth()">Refresh Health</button>
  <button onclick="runOptimization()">Run Optimization</button>
</div>

<div class="grid3">
  <div>
    <h2>💬 Chat</h2>
    <form id="f"><div class="row"><textarea rows="6" name="message" placeholder="Ask something..."></textarea></div>
    <label><input type="checkbox" name="opt" checked> Optimize prompt</label>
    <div class="row">
      <button>Send</button>
      <label style="margin-left:12px">Rating: <select name="rating"><option value="">-</option><option value="5">⭐⭐⭐⭐⭐</option><option value="4">⭐⭐⭐⭐</option><option value="3">⭐⭐⭐</option><option value="2">⭐⭐</option><option value="1">⭐</option></select></label>
    </div></form>
    <pre id="out"></pre>
  </div>
  <div>
    <h2>🧠 RAG</h2>
    <form id="ing"><div class="row"><textarea rows="4" name="text" placeholder="Document text to ingest"></textarea></div>
    <div class="row"><button>Ingest</button></div></form>
    <form id="sea"><div class="row"><input name="q" placeholder="Search query"><input name="k" value="5" style="width:80px"></div>
    <div class="row"><button>Search</button></div></form>
    <form id="ans"><div class="row"><input name="q" placeholder="Answer question with RAG"><input name="k" value="5" style="width:80px"></div>
    <div class="row"><button>Answer</button></div></form>
    <pre id="rag"></pre>
  </div>
  <div>
    <h2>🤝 Multi-agent</h2>
    <form id="ag"><div class="row"><textarea rows="4" name="task" placeholder="Task to plan/criticize/execute"></textarea></div>
    <div class="row"><button>Run Agents</button></div></form>
    <pre id="agents"></pre>
  </div>
</div>

<div class="row">
  <h2>🔧 Advanced Features</h2>
  <div class="grid">
    <div>
      <h3>🛠️ Tools</h3>
      <button onclick="testTool('/tools/git-info')">Git Info</button>
      <button onclick="testTool('/tools/fs-read?path=package.json')">Read Package.json</button>
      <button onclick="testTool('/tools/web?url=https://httpbin.org/json')">Web Fetch Test</button>
      <pre id="tools"></pre>
    </div>
    <div>
      <h3>🎙️ Voice</h3>
      <form id="tts"><div class="row"><input name="text" placeholder="Text to speak"></div>
      <div class="row"><button>Generate Speech</button></div></form>
      <form id="voiceCmd"><div class="row"><input name="command" placeholder="Voice command (e.g., 'analyze the code')"></div>
      <div class="row"><button>Process Voice Command</button></div></form>
      <div class="row">
        <label><input type="checkbox" id="autopilot"> Autopilot Mode</label>
        <select id="responseMode"><option value="detailed">Detailed</option><option value="brief">Brief</option><option value="interactive">Interactive</option></select>
      </div>
      <div id="voice"></div>
    </div>
  </div>
  <div>
    <h3>🔌 Plugins</h3>
    <button onclick="loadPlugins()">Load Plugins</button>
    <button onclick="executePlugin()">Execute Plugin</button>
    <button onclick="executeAIOrchestrator()">AI Orchestrator</button>
    <select id="pluginSelect"><option value="">Select plugin...</option></select>
    <pre id="plugins"></pre>
  </div>
  <div class="panel">
    <h3>📊 Advanced Analytics</h3>
    <div class="analytics-controls">
      <button onclick="loadAnalytics()">Load Dashboard</button>
      <button onclick="exportAnalytics('json')">Export JSON</button>
      <button onclick="exportAnalytics('csv')">Export CSV</button>
    </div>
    <div id="analyticsResults"></div>
  </div>
  <div class="panel">
    <h3>🔐 Authentication</h3>
    <div class="auth-controls">
      <input type="email" id="authEmail" placeholder="Email">
      <input type="password" id="authPassword" placeholder="Password">
      <button onclick="loginUser()">Login</button>
      <button onclick="registerUser()">Register</button>
    </div>
    <div id="authResults"></div>
  </div>
</div>

<script>
const f=document.getElementById('f'); const out=document.getElementById('out'); const tok=document.getElementById('tok');
const ing=document.getElementById('ing'); const sea=document.getElementById('sea'); const ans=document.getElementById('ans'); const rag=document.getElementById('rag');
const ag=document.getElementById('ag'); const agents=document.getElementById('agents'); const tools=document.getElementById('tools');
const tts=document.getElementById('tts'); const voice=document.getElementById('voice');
const voiceCmd = document.getElementById('voiceCmd');
const autopilot = document.getElementById('autopilot');
const responseMode = document.getElementById('responseMode');
const pluginSelect = document.getElementById('pluginSelect');
const plugins = document.getElementById('plugins');
const healthMetrics=document.getElementById('healthMetrics');

function headers(){ const t=tok.value.trim(); return t?{'content-type':'application/json','authorization':'Bearer '+t}:{'content-type':'application/json'} }

// Chat with rating feedback
f.addEventListener('submit', async (e)=>{e.preventDefault(); const data=new FormData(f);
  const payload={ message: data.get('message')||'', optimizePrompt: !!data.get('opt') };
  const rating = data.get('rating');
  const r=await fetch('/chat', {method:'POST', headers: headers(), body: JSON.stringify(payload)});
  const result = await r.text();
  out.textContent = result;
  
  // Submit rating if provided
  if (rating) {
    try {
      await fetch('/system/feedback', {
        method: 'POST', 
        headers: headers(), 
        body: JSON.stringify({endpoint: '/chat', rating: parseInt(rating), comment: 'UI feedback'})
      });
    } catch {}
  }
});

// RAG functions
ing.addEventListener('submit', async (e)=>{e.preventDefault(); const d=new FormData(ing);
  const payload={ text: d.get('text')||'' };
  const r=await fetch('/rag/ingest', {method:'POST', headers: headers(), body: JSON.stringify(payload)});
  rag.textContent=await r.text();
});
sea.addEventListener('submit', async (e)=>{e.preventDefault(); const d=new FormData(sea);
  const q=encodeURIComponent(d.get('q')||''); const k=encodeURIComponent(d.get('k')||'5');
  const r=await fetch('/rag/search?q='+q+'&k='+k, {headers: headers()});
  rag.textContent=await r.text();
});
ans.addEventListener('submit', async (e)=>{e.preventDefault(); const d=new FormData(ans);
  const q=encodeURIComponent(d.get('q')||''); const k=encodeURIComponent(d.get('k')||'5');
  const r=await fetch('/rag/answer?q='+q+'&k='+k, {headers: headers()});
  rag.textContent=await r.text();
});

// Multi-agent
ag.addEventListener('submit', async (e)=>{e.preventDefault(); const d=new FormData(ag);
  const payload={ task: d.get('task')||'' };
  const r=await fetch('/agents/run', {method:'POST', headers: headers(), body: JSON.stringify(payload)});
  agents.textContent=await r.text();
});

// Voice TTS
tts.addEventListener('submit', async (e)=>{e.preventDefault(); const d=new FormData(tts);
  const text = encodeURIComponent(d.get('text')||'');
  try {
    const r = await fetch('/voice/tts?text='+text, {headers: headers()});
    if (r.ok) {
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      voice.innerHTML = '<audio controls><source src="'+url+'" type="audio/wav"></audio>';
    } else {
      voice.textContent = 'TTS Error: ' + await r.text();
    }
  } catch (e) {
    voice.textContent = 'Error: ' + e.message;
  }
});

// Voice command processing
voiceCmd.addEventListener('submit', async (e)=>{e.preventDefault(); const d=new FormData(voiceCmd);
  const command = d.get('command')||'';
  try {
    const payload = { 
      text: command, 
      autopilot: autopilot.checked, 
      responseMode: responseMode.value 
    };
    const r = await fetch('/voice/process', {method:'POST', headers: headers(), body: JSON.stringify(payload)});
    const result = await r.json();
    voice.innerHTML = '<div><strong>Command:</strong> ' + command + '</div><div><strong>Response:</strong> ' + result.message + '</div>';
  } catch (e) {
    voice.textContent = 'Voice command error: ' + e.message;
  }
});

// Plugin management
async function loadPlugins() {
  try {
    const r = await fetch('/plugins/list', {headers: headers()});
    const pluginList = await r.json();
    pluginSelect.innerHTML = '<option value="">Select plugin...</option>';
    pluginList.forEach(plugin => {
      pluginSelect.innerHTML += '<option value="' + plugin.name + '">' + plugin.name + ' v' + plugin.version + '</option>';
    });
    plugins.textContent = JSON.stringify(pluginList, null, 2);
  } catch (e) {
    plugins.textContent = 'Error loading plugins: ' + e.message;
  }
}

async function executePlugin() {
  const pluginName = prompt('Plugin name:', 'web-scraper');
  const action = prompt('Action:', 'scrape');
  const url = prompt('URL:', 'https://example.com');
  
  if (!pluginName || !action) return;
  
  try {
    const response = await fetch(`/plugins/${pluginName}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (localStorage.getItem('authToken') || '')
      },
      body: JSON.stringify({
        action,
        parameters: { url }
      })
    });
    
    const result = await response.json();
    document.getElementById('pluginResults').innerHTML = 
      '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
  } catch (error) {
    document.getElementById('pluginResults').innerHTML = 
      '<div style="color: red;">Error: ' + error.message + '</div>';
  }
}

async function executeAIOrchestrator() {
  const task = prompt('Task for AI orchestration:', 'Analyze the performance of a web application');
  const workflow = prompt('Workflow (complex_problem, code_review, research_analysis, creative_solution):', 'complex_problem');
  
  if (!task) return;
  
  try {
    const response = await fetch('/ai/orchestrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (localStorage.getItem('authToken') || '')
      },
      body: JSON.stringify({
        task,
        workflow,
        parallel: false
      })
    });
    
    const result = await response.json();
    document.getElementById('pluginResults').innerHTML = 
      '<h4>AI Orchestration Result:</h4><pre>' + JSON.stringify(result, null, 2) + '</pre>';
  } catch (error) {
    document.getElementById('pluginResults').innerHTML = 
      '<div style="color: red;">Error: ' + error.message + '</div>';
  }
}

async function loadAnalytics() {
  try {
    const response = await fetch('/analytics', {
      headers: {
        'Authorization': 'Bearer ' + (localStorage.getItem('authToken') || '')
      }
    });
    
    const data = await response.json();
    document.getElementById('analyticsResults').innerHTML = 
      '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
  } catch (error) {
    document.getElementById('analyticsResults').innerHTML = 
      '<div style="color: red;">Error: ' + error.message + '</div>';
  }
}

async function exportAnalytics(format) {
  try {
    const response = await fetch(`/analytics/export?format=${format}`, {
      headers: {
        'Authorization': 'Bearer ' + (localStorage.getItem('authToken') || '')
      }
    });
    
    if (format === 'csv') {
      const text = await response.text();
      const blob = new Blob([text], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }
    
    document.getElementById('analyticsResults').innerHTML = 
      '<div style="color: green;">Export completed!</div>';
  } catch (error) {
    document.getElementById('analyticsResults').innerHTML = 
      '<div style="color: red;">Export error: ' + error.message + '</div>';
  }
}

async function loginUser() {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  
  if (!email || !password) {
    alert('Please enter email and password');
    return;
  }
  
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    
    if (result.success) {
      localStorage.setItem('authToken', result.accessToken);
      document.getElementById('authResults').innerHTML = 
        '<div style="color: green;">Login successful! Token stored.</div>';
    } else {
      document.getElementById('authResults').innerHTML = 
        '<div style="color: red;">Login failed: ' + result.message + '</div>';
    }
  } catch (error) {
    document.getElementById('authResults').innerHTML = 
      '<div style="color: red;">Login error: ' + error.message + '</div>';
  }
}

async function registerUser() {
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  
  if (!email || !password) {
    alert('Please enter email and password');
    return;
  }
  
  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, roles: ['user'] })
    });
    
    const result = await response.json();
    
    if (result.success) {
      document.getElementById('authResults').innerHTML = 
        '<div style="color: green;">Registration successful! User ID: ' + result.userId + '</div>';
    } else {
      document.getElementById('authResults').innerHTML = 
        '<div style="color: red;">Registration failed: ' + result.message + '</div>';
    }
  } catch (error) {
    document.getElementById('authResults').innerHTML = 
      '<div style="color: red;">Registration error: ' + error.message + '</div>';
  }
}

// Health monitoring
async function refreshHealth() {
  try {
    const r = await fetch('/system/health', {headers: headers()});
    const health = await r.json();
    const status = health.status || 'unknown';
    healthMetrics.innerHTML = `
      <div class="metric">Status: <span class="status-${status}">${status.toUpperCase()}</span></div>
      <div class="metric">Health Score: ${health.health_score || 0}/100</div>
      <div class="metric">Success Rate: ${health.performance?.success_rate?.toFixed(1) || 0}%</div>
      <div class="metric">Avg Response: ${health.performance?.avg_response_time?.toFixed(0) || 0}ms</div>
      <div class="metric">Total Requests: ${health.performance?.total_requests || 0}</div>
      <div class="metric">Learned Patterns: ${health.patterns?.learned_approaches || 0}</div>
    `;
  } catch (e) {
    healthMetrics.innerHTML = '<div class="metric">Health check failed: ' + e.message + '</div>';
  }
}

async function runOptimization() {
  try {
    const r = await fetch('/system/optimize', {method: 'POST', headers: headers()});
    const result = await r.json();
    if (result.optimizations_applied > 0) {
      alert('Applied ' + result.optimizations_applied + ' optimizations!');
      refreshHealth();
    } else {
      alert('No optimizations needed at this time.');
    }
  } catch (e) {
    alert('Optimization failed: ' + e.message);
  }
}

// Auto-refresh health every 30 seconds
setInterval(refreshHealth, 30000);
refreshHealth(); // Initial load
loadPlugins(); // Load plugins on startup
</script>
</body></html>`);
  }

  if (req.method === 'GET' && req.url === '/health') {
    return sendJson(res, 200, { status: 'ok', time: new Date().toISOString(), version: '0.1.1' });
  }

  if (req.method === 'GET' && req.url === '/memory') {
    return sendJson(res, 200, readMemory());
  }

  // Safe web fetch tool: GET /tools/web?url=https://...
  if (req.method === 'GET' && req.url?.startsWith('/tools/web')) {
    try {
      if (!ENV.ALLOW_WEB_FETCH) return sendJson(res, 403, { error: 'web_fetch_disabled' });
      const u = new URL(req.url, `http://localhost:${PORT}`);
      const target = u.searchParams.get('url') || '';
      if (!/^https?:\/\//i.test(target)) return sendJson(res, 400, { error: 'invalid_url' });
      const r = await fetch(target, { method: 'GET' });
      const text = await r.text();
      const limited = text.slice(0, 10000); // 10KB cap
      return sendJson(res, 200, { status: r.status, content: limited });
    } catch (e) {
      console.error('tools/web error:', e.message);
      return sendJson(res, 500, { error: 'fetch_failed' });
    }
  }

  if (req.method === 'POST' && req.url === '/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { message = '', role = 'user', optimizePrompt: doOpt = true } = JSON.parse(body || '{}');
        if (!message || typeof message !== 'string') return sendJson(res, 400, { error: 'message required' });

        // Prompt optimization
        const optimization = doOpt ? optimizePrompt(message) : null;

        // Compose messages with a system directive inspired by repo patterns
        const messages = [
          { role: 'system', content: 'You are a rigorous, concise, planning-first coding agent. Provide short, high-quality answers with runnable snippets when requested. Always propose next actions.' },
          { role, content: message }
        ];

        // Respond via pipeline (OpenAI, Anthropic, or offline fallback)
        const reply = await respond(messages);

        // Persist to memory
        const mem = readMemory();
        mem.conversations.push({
          id: Date.now(),
          ts: new Date().toISOString(),
          role,
          message,
          reply,
          optimization,
        });
        writeMemory(mem);

        // Push to Redis (recent list) and log to Postgres (if configured)
        try { await pushConversation({ ts: new Date().toISOString(), role, message, reply, optimization }); } catch {}
        try { await logConversation({ ts: new Date().toISOString(), role, message, reply, optimization }); } catch {}

        return sendJson(res, 200, { reply, optimization });
      } catch (e) {
        console.error('Chat error:', e);
        return sendJson(res, 500, { error: 'internal_error' });
      }
    });
    return;
  }

  // SSE stream endpoint: GET /stream?message=...
  if (req.method === 'GET' && req.url?.startsWith('/stream')) {
    try {
      const u = new URL(req.url, `http://localhost:${PORT}`);
      const message = u.searchParams.get('message') || '';
      const role = 'user';
      if (!message) {
        res.statusCode = 400;
        return res.end('message required');
      }
      const messages = [
        { role: 'system', content: 'You are a rigorous, concise, planning-first coding agent. Provide short, high-quality answers with runnable snippets when requested. Always propose next actions.' },
        { role, content: message }
      ];
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      (async () => {
        const reply = await respond(messages);
        // naive sentence chunking
        const chunks = String(reply).split(/(?<=[.!?])\s+/);
        for (const c of chunks) {
          res.write(`data: ${c}\n\n`);
          await new Promise(r => setTimeout(r, 80));
        }
        res.write('event: done\n');
        res.write('data: end\n\n');
        res.end();
      })();
      return;
    } catch (e) {
      console.error('stream error:', e);
      res.statusCode = 500;
      return res.end('stream_error');
    }
  }

  // Git info (read-only): GET /tools/git-info
  if (req.method === 'GET' && req.url === '/tools/git-info') {
    if (!ENV.ALLOW_GIT_INFO) return sendJson(res, 403, { error: 'git_info_disabled' });
    const run = (cmd) => new Promise((resolve) => {
      const p = exec(cmd, { cwd: __dirname, timeout: 4000 }, (err, stdout, stderr) => {
        resolve({ ok: !err, out: String(stdout||'').trim(), err: String(stderr||'').trim() });
      });
      p.on('error', () => resolve({ ok: false, out: '', err: 'spawn_error' }));
    });
    const rev = await run('git rev-parse --short HEAD');
    const status = await run('git status --porcelain -uno');
    return sendJson(res, 200, { rev, status });
  }

  // Sandboxed FS read: GET /tools/fs-read?path=relative/path
  if (req.method === 'GET' && req.url?.startsWith('/tools/fs-read')) {
    if (!ENV.ALLOW_FS_READ) return sendJson(res, 403, { error: 'fs_read_disabled' });
    try {
      const u = new URL(req.url, `http://localhost:${PORT}`);
      const rel = u.searchParams.get('path') || '';
      if (!rel || rel.includes('..')) return sendJson(res, 400, { error: 'invalid_path' });
      const target = join(__dirname, rel);
      if (!existsSync(target)) return sendJson(res, 404, { error: 'not_found' });
      const buf = readFileSync(target);
      if (buf.length > 64 * 1024) return sendJson(res, 413, { error: 'file_too_large' });
      const content = buf.toString('utf-8');
      return sendJson(res, 200, { path: rel, size: buf.length, content });
    } catch (e) {
      console.error('fs-read error:', e.message);
      return sendJson(res, 500, { error: 'fs_read_failed' });
    }
  }

  // Azure TTS: POST /voice/tts { text }
  if (req.method === 'POST' && req.url === '/voice/tts') {
    try {
      if (!ENV.AZURE_SPEECH_KEY || !ENV.AZURE_SPEECH_REGION) {
        res.statusCode = 501; return res.end('tts_not_configured');
      }
      let body = '';
      req.on('data', c => body += c);
      req.on('end', async () => {
        const { text = '' } = JSON.parse(body || '{}');
        if (!text) { res.statusCode = 400; return res.end('text_required'); }
        const ssml = `<?xml version="1.0" encoding="UTF-8"?>\n<speak version=\"1.0\" xml:lang=\"en-US\">\n  <voice xml:lang=\"en-US\" name=\"en-US-JennyNeural\">${text}</voice>\n</speak>`;
        const url = `https://${ENV.AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;
        const r = await fetch(url, {
          method: 'POST',
          headers: {
            'Ocp-Apim-Subscription-Key': ENV.AZURE_SPEECH_KEY,
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
          },
          body: ssml,
        });
        if (!r.ok) { res.statusCode = 502; return res.end('tts_failed'); }
        const audio = Buffer.from(await r.arrayBuffer());
        res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Content-Length': audio.length });
        return res.end(audio);
      });
      return;
    } catch (e) {
      console.error('tts error:', e.message);
      res.statusCode = 500; return res.end('tts_error');
    }
  }

  // System health endpoint
  if (req.method === 'GET' && req.url === '/system/health') {
    try {
      const health = selfImprovement.getSystemHealth();
      return sendJson(res, 200, health);
    } catch (e) {
      console.error('Health check error:', e);
      return sendJson(res, 500, { error: 'health_check_failed' });
    }
  }

  // System optimization endpoint
  if (req.method === 'POST' && req.url === '/system/optimize') {
    try {
      const optimization = await selfImprovement.autoOptimize();
      if (optimization) {
        return sendJson(res, 200, optimization);
      } else {
        return sendJson(res, 200, { message: 'no_optimizations_needed', optimizations_applied: 0 });
      }
    } catch (e) {
      console.error('Optimization error:', e);
      return sendJson(res, 500, { error: 'optimization_failed' });
    }
  }

  // User feedback endpoint for continuous learning
  if (req.method === 'POST' && req.url === '/system/feedback') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { endpoint, rating, comment } = JSON.parse(body || '{}');
        if (!endpoint || !rating) return sendJson(res, 400, { error: 'endpoint and rating required' });
        
        const context = { endpoint, timestamp: Date.now() };
        const outcome = { user_rating: rating };
        const userFeedback = { rating, comment };
        
        selfImprovement.recordInteraction(context, 'user_feedback', outcome, userFeedback);
        return sendJson(res, 200, { message: 'feedback_recorded' });
      } catch (e) {
        console.error('Feedback error:', e);
        return sendJson(res, 500, { error: 'feedback_failed' });
      }
    });
    return;
  }

  // Performance metrics endpoint
  if (req.method === 'GET' && req.url === '/system/metrics') {
    try {
      const report = selfImprovement.metrics.getPerformanceReport();
      return sendJson(res, 200, report);
    } catch (e) {
      console.error('Metrics error:', e);
      return sendJson(res, 500, { error: 'metrics_failed' });
    }
  }

  // Optimization suggestions endpoint
  if (req.method === 'GET' && req.url === '/system/suggestions') {
    try {
      const suggestions = await selfImprovement.getOptimizationSuggestions();
      return sendJson(res, 200, { suggestions });
    } catch (e) {
      console.error('Suggestions error:', e);
      return sendJson(res, 500, { error: 'suggestions_failed' });
    }
  }

  // Voice command processing endpoint
  if (req.method === 'POST' && req.url === '/voice/process') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { text, autopilot = false, responseMode = 'detailed' } = JSON.parse(body || '{}');
        if (!text) return sendJson(res, 400, { error: 'text required' });
        
        // Set voice processor mode
        voiceProcessor.autopilotMode = autopilot;
        voiceProcessor.responseMode = responseMode;
        
        const result = await voiceProcessor.processVoiceInput(text);
        return sendJson(res, 200, result);
      } catch (e) {
        console.error('Voice processing error:', e);
        return sendJson(res, 500, { error: 'voice_processing_failed' });
      }
    });
    return;
  }

  // Plugin list endpoint
  if (req.method === 'GET' && req.url === '/plugins/list') {
    try {
      const pluginList = pluginManager.getPluginList();
      return sendJson(res, 200, pluginList);
    } catch (e) {
      console.error('Plugin list error:', e);
      return sendJson(res, 500, { error: 'plugin_list_failed' });
    }
  }

  // Plugin execution endpoint
  if (req.method === 'POST' && req.url === '/plugins/execute') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { plugin, context } = JSON.parse(body || '{}');
        if (!plugin) return sendJson(res, 400, { error: 'plugin name required' });
        
        const result = await pluginManager.executePlugin(plugin, context || {});
        return sendJson(res, 200, result);
      } catch (e) {
        console.error('Plugin execution error:', e);
        return sendJson(res, 500, { error: 'plugin_execution_failed', message: e.message });
      }
    });
    return;
  }

  // Plugin management endpoints
  if (req.method === 'POST' && req.url?.startsWith('/plugins/')) {
    const action = req.url.split('/')[2];
    const pluginName = req.url.split('/')[3];
    
    try {
      switch (action) {
        case 'enable':
          await pluginManager.enablePlugin(pluginName);
          return sendJson(res, 200, { message: `Plugin ${pluginName} enabled` });
        case 'disable':
          await pluginManager.disablePlugin(pluginName);
          return sendJson(res, 200, { message: `Plugin ${pluginName} disabled` });
        default:
          return sendJson(res, 400, { error: 'invalid_action' });
      }
    } catch (e) {
      console.error('Plugin management error:', e);
      return sendJson(res, 500, { error: 'plugin_management_failed', message: e.message });
    }
  }

  res.statusCode = 404;
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Universal AI Agent listening on http://localhost:${PORT}`);
});
