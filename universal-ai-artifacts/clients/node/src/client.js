import { rateLimitedFetch } from '../../utils/rate_limit.js';

export class UniversalAIClient {
  constructor(baseUrl, token) {
    this.baseUrl = (baseUrl || '').replace(/\/$/, '');
    this.token = token;
  }

  _headers(json = true) {
    const headers = { 'Authorization': `Bearer ${this.token}` };
    if (json) headers['Content-Type'] = 'application/json';
    return headers;
  }

  async chat(message, options = {}) {
    const response = await rateLimitedFetch(fetch, `${this.baseUrl}/chat`, {
      method: 'POST',
      headers: this._headers(true),
      body: JSON.stringify({ message, ...options })
    });
    return response.json();
  }

  async streamChat(message, onChunk, { optimizePrompt = true } = {}) {
    const url = `${this.baseUrl}/stream?message=${encodeURIComponent(message)}&optimizePrompt=${optimizePrompt}`;
    const response = await rateLimitedFetch(fetch, url, {
      method: 'GET',
      headers: { ...this._headers(false), 'Accept': 'text/event-stream' }
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      for (const line of chunk.split('\n')) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (onChunk) onChunk(data);
          } catch (_) { /* ignore parse errors */ }
        }
      }
    }
  }

  async getConversations({ limit = 50, offset = 0, userId } = {}) {
    const url = new URL(`${this.baseUrl}/conversations`);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('offset', String(offset));
    if (userId) url.searchParams.set('userId', userId);

    const response = await rateLimitedFetch(fetch, url.toString(), {
      method: 'GET',
      headers: this._headers(false)
    });
    return response.json();
  }

  async ragIngest(documents, collection = 'knowledge_base') {
    const response = await rateLimitedFetch(fetch, `${this.baseUrl}/rag/ingest`, {
      method: 'POST',
      headers: this._headers(true),
      body: JSON.stringify({ documents, collection })
    });
    return response.json();
  }

  async ragSearch(query, { collection = 'knowledge_base', limit = 5, threshold } = {}) {
    const payload = { query, collection, limit };
    if (typeof threshold === 'number') payload.threshold = threshold;
    const response = await rateLimitedFetch(fetch, `${this.baseUrl}/rag/search`, {
      method: 'POST',
      headers: this._headers(true),
      body: JSON.stringify(payload)
    });
    return response.json();
  }

  async ragAnswer(question, { collection = 'knowledge_base', maxContext = 3, includeContext = true } = {}) {
    const response = await rateLimitedFetch(fetch, `${this.baseUrl}/rag/answer`, {
      method: 'POST',
      headers: this._headers(true),
      body: JSON.stringify({ question, collection, maxContext, includeContext })
    });
    return response.json();
  }

  async listPlugins() {
    const response = await rateLimitedFetch(fetch, `${this.baseUrl}/plugins`, {
      method: 'GET',
      headers: this._headers(false)
    });
    return response.json();
  }

  async executePlugin(pluginName, action, parameters = {}) {
    const response = await rateLimitedFetch(fetch, `${this.baseUrl}/plugins/${encodeURIComponent(pluginName)}/execute`, {
      method: 'POST',
      headers: this._headers(true),
      body: JSON.stringify({ action, parameters })
    });
    return response.json();
  }

  async analyticsDashboard() {
    const response = await rateLimitedFetch(fetch, `${this.baseUrl}/analytics/dashboard`, {
      method: 'GET',
      headers: this._headers(false)
    });
    return response.json();
  }
}

export default UniversalAIClient;