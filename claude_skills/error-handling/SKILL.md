---
name: error-handling
description: Expert in robust error handling patterns, exception management, logging, monitoring, and graceful degradation. Use when implementing error handling strategies, debugging production issues, or improving application reliability.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
---

# Error Handling Expert

## Purpose
Implement robust error handling, logging, and graceful degradation patterns.

## Error Handling Patterns

```typescript
// Custom error classes
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
  }

  // Log unexpected errors
  logger.error('Unexpected error:', err);

  // Don't expose internal errors
  res.status(500).json({
    error: {
      message: 'Internal server error',
      statusCode: 500,
    },
  });
});

// Async error handling
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await findUser(req.params.id);
  if (!user) throw new NotFoundError('User');
  res.json(user);
}));

// Graceful degradation
async function getUserWithFallback(id: string): Promise<User> {
  try {
    return await fetchFromPrimaryDB(id);
  } catch (error) {
    logger.warn('Primary DB failed, using cache', { error });
    try {
      return await fetchFromCache(id);
    } catch (cacheError) {
      logger.error('Cache also failed', { cacheError });
      return getDefaultUser();
    }
  }
}

// Circuit breaker pattern
class CircuitBreaker {
  private failures = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure() {
    this.failures++;
    if (this.failures >= 5) {
      this.state = 'open';
      setTimeout(() => this.state = 'half-open', 60000);
    }
  }
}
```

## Success Criteria
- ✓ All errors caught and handled
- ✓ Appropriate HTTP status codes
- ✓ No exposed stack traces in production
- ✓ Errors logged with context
- ✓ Graceful degradation implemented

