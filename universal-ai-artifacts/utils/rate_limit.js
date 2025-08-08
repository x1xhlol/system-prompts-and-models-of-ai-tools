export async function rateLimitedFetch(fetchFn, url, options = {}, {
  maxRetries = 4,
  baseDelayMs = 500,
  backoffFactor = 2,
  maxDelayMs = 8000
} = {}) {
  let attempt = 0;
  const originalBody = options.body;

  while (true) {
    try {
      // Re-clone simple bodies for retries
      if (attempt > 0 && typeof originalBody === 'string') {
        options.body = originalBody;
      }

      const response = await fetchFn(url, options);
      if (response.status !== 429 && response.status < 500) {
        return response; // success or client error
      }

      // 429 or 5xx -> retry
      if (attempt >= maxRetries) {
        return response; // give back last response
      }

      const retryAfter = parseInt(response.headers.get('Retry-After') || '0', 10);
      const delayFromHeader = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 0;
      const backoff = Math.min(baseDelayMs * Math.pow(backoffFactor, attempt), maxDelayMs);
      const jitter = Math.floor(Math.random() * 250);
      const delayMs = Math.max(delayFromHeader, backoff) + jitter;

      await new Promise((r) => setTimeout(r, delayMs));
      attempt += 1;
      continue;
    } catch (err) {
      if (attempt >= maxRetries) throw err;
      const backoff = Math.min(baseDelayMs * Math.pow(backoffFactor, attempt), maxDelayMs);
      const jitter = Math.floor(Math.random() * 250);
      await new Promise((r) => setTimeout(r, backoff + jitter));
      attempt += 1;
    }
  }
}