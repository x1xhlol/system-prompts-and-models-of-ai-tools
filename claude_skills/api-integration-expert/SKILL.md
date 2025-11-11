---
name: api-integration-expert
description: Expert in integrating REST, GraphQL, and WebSocket APIs with authentication, error handling, rate limiting, and caching. Use when building API clients, integrating third-party services, or designing API consumption patterns.
allowed-tools: Read, Write, Edit, Grep, Bash, WebFetch
---

# API Integration Expert

## Purpose
Comprehensive expertise in consuming and integrating external APIs with production-grade patterns including authentication, retry logic, rate limiting, caching, and error handling.

## When to Use
- Integrating third-party APIs (Stripe, Twilio, SendGrid, etc.)
- Building API client libraries
- Implementing REST or GraphQL consumers
- Setting up WebSocket connections
- Adding authentication flows (OAuth2, JWT, API keys)
- Implementing retry logic and circuit breakers
- Adding request/response caching
- Rate limiting and throttling

## Capabilities

### 1. REST API Integration
- HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Request/response handling
- Query parameters and request bodies
- Headers and authentication
- Pagination patterns (offset, cursor, page-based)
- Filtering, sorting, searching
- Multipart form data and file uploads

### 2. GraphQL Integration
- Query and Mutation operations
- Subscriptions for real-time data
- Fragment composition
- Variables and directives
- Error handling
- Caching strategies
- Pagination (relay-style cursor pagination)

### 3. WebSocket Integration
- Connection management
- Reconnection logic
- Heartbeat/ping-pong
- Message framing
- Binary data handling
- Fallback to HTTP polling

### 4. Authentication Patterns
- API Keys (header, query param)
- Bearer Tokens (JWT)
- OAuth 2.0 (Authorization Code, Client Credentials)
- Basic Auth
- HMAC signatures
- Token refresh flows

### 5. Error Handling & Resilience
- HTTP status code handling
- Retry with exponential backoff
- Circuit breaker pattern
- Timeout configuration
- Graceful degradation
- Error logging and monitoring

### 6. Performance Optimization
- Response caching (in-memory, Redis)
- Request batching
- Debouncing and throttling
- Connection pooling
- Streaming large responses
- Compression (gzip, brotli)

## Best Practices

```typescript
// Production-Ready API Client Example
import axios, { AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import CircuitBreaker from 'opossum';

class APIClient {
  private client: AxiosInstance;
  private cache: Map<string, { data: any; expires: number }>;

  constructor(private baseURL: string, private apiKey: string) {
    this.cache = new Map();

    // Configure axios with retry logic
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Exponential backoff retry
    axiosRetry(this.client, {
      retries: 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
               error.response?.status === 429; // Rate limit
      },
    });

    // Request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  // GET with caching
  async get<T>(endpoint: string, ttl: number = 60000): Promise<T> {
    const cached = this.cache.get(endpoint);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    const response = await this.client.get<T>(endpoint);
    this.cache.set(endpoint, {
      data: response.data,
      expires: Date.now() + ttl,
    });

    return response.data;
  }

  // POST with retry
  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.client.post<T>(endpoint, data);
    return response.data;
  }

  // Paginated requests
  async* getPaginated<T>(endpoint: string, params: any = {}) {
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.client.get<{ data: T[]; hasMore: boolean }>(
        endpoint,
        { params: { ...params, page } }
      );

      yield* response.data.data;

      hasMore = response.data.hasMore;
      page++;
    }
  }

  // Batch requests
  async batchGet<T>(endpoints: string[]): Promise<T[]> {
    return Promise.all(endpoints.map(e => this.get<T>(e)));
  }

  // Error handling
  private handleError(error: any) {
    if (error.response) {
      const { status, data } = error.response;
      console.error(`API Error ${status}:`, data);

      switch (status) {
        case 401:
          // Handle unauthorized
          this.refreshToken();
          break;
        case 429:
          // Rate limit - already handled by retry
          console.warn('Rate limited, retrying...');
          break;
        case 500:
        case 502:
        case 503:
          // Server errors
          console.error('Server error:', data);
          break;
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
  }

  private async refreshToken() {
    // Implement token refresh logic
  }
}
```

## GraphQL Client Example

```typescript
import { GraphQLClient, gql } from 'graphql-request';

class GraphQLAPIClient {
  private client: GraphQLClient;

  constructor(endpoint: string, token: string) {
    this.client = new GraphQLClient(endpoint, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  }

  async query<T>(query: string, variables?: any): Promise<T> {
    try {
      return await this.client.request<T>(query, variables);
    } catch (error) {
      this.handleGraphQLError(error);
      throw error;
    }
  }

  async mutation<T>(mutation: string, variables?: any): Promise<T> {
    return this.query<T>(mutation, variables);
  }

  // Type-safe queries
  async getUser(id: string) {
    const query = gql`
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          name
          email
          posts {
            id
            title
          }
        }
      }
    `;

    return this.query<{ user: User }>(query, { id });
  }

  private handleGraphQLError(error: any) {
    if (error.response?.errors) {
      error.response.errors.forEach((err: any) => {
        console.error('GraphQL Error:', err.message);
        if (err.extensions) {
          console.error('Extensions:', err.extensions);
        }
      });
    }
  }
}
```

## Rate Limiting & Circuit Breaker

```typescript
import Bottleneck from 'bottleneck';
import CircuitBreaker from 'opossum';

// Rate limiter (100 requests per minute)
const limiter = new Bottleneck({
  reservoir: 100,
  reservoirRefreshAmount: 100,
  reservoirRefreshInterval: 60 * 1000,
  maxConcurrent: 10,
});

// Circuit breaker
const breaker = new CircuitBreaker(apiCall, {
  timeout: 10000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000,
});

breaker.on('open', () => console.log('Circuit breaker opened'));
breaker.on('halfOpen', () => console.log('Circuit breaker half-open'));
breaker.on('close', () => console.log('Circuit breaker closed'));

async function apiCall(endpoint: string) {
  return limiter.schedule(() => axios.get(endpoint));
}

// Use with circuit breaker
async function safeAPICall(endpoint: string) {
  try {
    return await breaker.fire(endpoint);
  } catch (error) {
    console.error('API call failed:', error);
    // Return cached or default data
    return getCachedData(endpoint);
  }
}
```

## Configuration

```json
{
  "api": {
    "baseURL": "https://api.example.com",
    "timeout": 10000,
    "retries": 3,
    "retryDelay": 1000,
    "rateLimit": {
      "requests": 100,
      "per": "minute"
    },
    "cache": {
      "enabled": true,
      "ttl": 60000
    },
    "circuitBreaker": {
      "enabled": true,
      "timeout": 10000,
      "errorThreshold": 50,
      "resetTimeout": 30000
    }
  }
}
```

## Testing API Integrations

```typescript
import nock from 'nock';

describe('APIClient', () => {
  afterEach(() => nock.cleanAll());

  it('should retry on 429 rate limit', async () => {
    const scope = nock('https://api.example.com')
      .get('/data')
      .reply(429, { error: 'Rate limited' })
      .get('/data')
      .reply(200, { data: 'success' });

    const client = new APIClient('https://api.example.com', 'key');
    const result = await client.get('/data');

    expect(result).toEqual({ data: 'success' });
    expect(scope.isDone()).toBe(true);
  });

  it('should use cached data', async () => {
    nock('https://api.example.com')
      .get('/data')
      .reply(200, { data: 'cached' });

    const client = new APIClient('https://api.example.com', 'key');

    // First call - hits API
    const result1 = await client.get('/data');
    // Second call - uses cache
    const result2 = await client.get('/data');

    expect(result1).toEqual(result2);
  });
});
```

## Dependencies
- axios or fetch API
- axios-retry
- opossum (circuit breaker)
- bottleneck (rate limiting)
- graphql-request (for GraphQL)
- WebSocket client library

## Success Criteria
- ✓ Authentication properly implemented
- ✓ Retry logic with exponential backoff
- ✓ Rate limiting respected
- ✓ Circuit breaker prevents cascade failures
- ✓ Responses cached appropriately
- ✓ Errors handled and logged
- ✓ Timeouts configured
- ✓ Tests cover success and failure cases
