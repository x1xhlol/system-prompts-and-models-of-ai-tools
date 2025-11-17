# 🏭 Lovable Clone - Production Ready Setup

> CI/CD, Monitoring, Security, Performance, và Deployment Guide

---

# 📑 Table of Contents

1. [CI/CD Pipeline](#cicd-pipeline)
2. [Monitoring & Analytics](#monitoring--analytics)
3. [Security Best Practices](#security-best-practices)
4. [Performance Optimization](#performance-optimization)
5. [Production Deployment](#production-deployment)
6. [Disaster Recovery](#disaster-recovery)

---

# 🔄 I. CI/CD PIPELINE

## 1. GitHub Actions Workflow

**File: `.github/workflows/ci.yml`**

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '18.x'

jobs:
  lint-and-type-check:
    name: Lint & Type Check
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript check
        run: npx tsc --noEmit

  test:
    name: Test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          flags: unittests

  e2e-test:
    name: E2E Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint-and-type-check, test]

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: .next/

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: [build, e2e-test]
    if: github.ref == 'refs/heads/develop'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel Staging
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: [build, e2e-test]
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.VERCEL_ORG_ID }}

      - name: Create Sentry release
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
          SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
        with:
          environment: production
```

## 2. Pre-commit Hooks

**File: `.husky/pre-commit`**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run lint-staged
npx lint-staged

# Run type check
npm run type-check
```

**File: `.husky/commit-msg`**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Validate commit message
npx --no -- commitlint --edit ${1}
```

**File: `package.json` (add scripts)**

```json
{
  "scripts": {
    "prepare": "husky install",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "test:watch": "vitest",
    "type-check": "tsc --noEmit",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"**/*.{ts,tsx,md}\""
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{md,json}": [
      "prettier --write"
    ]
  }
}
```

## 3. Commitlint Configuration

**File: `commitlint.config.js`**

```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Formatting
        'refactor', // Code restructuring
        'perf',     // Performance
        'test',     // Tests
        'chore',    // Maintenance
        'ci',       // CI/CD
        'build'     // Build system
      ]
    ]
  }
};
```

---

# 📊 II. MONITORING & ANALYTICS

## 1. Sentry Error Tracking

**File: `src/lib/sentry.ts`**

```typescript
import * as Sentry from '@sentry/nextjs';

export function initSentry() {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 1.0,

      // Performance Monitoring
      integrations: [
        new Sentry.BrowserTracing({
          tracePropagationTargets: [
            'localhost',
            /^https:\/\/.*\.vercel\.app/
          ]
        }),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true
        })
      ],

      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      beforeSend(event, hint) {
        // Filter out sensitive data
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers;
        }
        return event;
      }
    });
  }
}

// Custom error logging
export function logError(error: Error, context?: Record<string, any>) {
  console.error(error);

  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context
    });
  }
}

// Performance monitoring
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({ name, op });
}
```

**File: `src/app/layout.tsx` (add Sentry)**

```typescript
import { initSentry } from '@/lib/sentry';

// Initialize Sentry
if (typeof window !== 'undefined') {
  initSentry();
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## 2. PostHog Analytics

**File: `src/lib/posthog.ts`**

```typescript
import posthog from 'posthog-js';

export function initPostHog() {
  if (
    typeof window !== 'undefined' &&
    process.env.NEXT_PUBLIC_POSTHOG_KEY
  ) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: (posthog) => {
        if (process.env.NODE_ENV === 'development') {
          posthog.debug();
        }
      },
      capture_pageview: false, // We'll manually track
      capture_pageleave: true,
      autocapture: {
        dom_event_allowlist: ['click', 'submit'],
        element_allowlist: ['button', 'a']
      }
    });
  }
}

export function trackEvent(
  eventName: string,
  properties?: Record<string, any>
) {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties);
  }
}

export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, traits);
  }
}

export function trackPageView() {
  if (typeof window !== 'undefined') {
    posthog.capture('$pageview');
  }
}
```

**File: `src/components/analytics/posthog-provider.tsx`**

```typescript
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initPostHog, trackPageView } from '@/lib/posthog';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    trackPageView();
  }, [pathname, searchParams]);

  return <>{children}</>;
}
```

## 3. Performance Monitoring

**File: `src/lib/performance.ts`**

```typescript
import { Metric } from 'web-vitals';

export function sendToAnalytics(metric: Metric) {
  // Send to PostHog
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture('web_vitals', {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_id: metric.id,
      metric_rating: metric.rating
    });
  }

  // Send to Vercel Analytics
  if (process.env.NEXT_PUBLIC_VERCEL_ENV) {
    const body = JSON.stringify({
      dsn: process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID,
      id: metric.id,
      page: window.location.pathname,
      href: window.location.href,
      event_name: metric.name,
      value: metric.value.toString(),
      speed: navigator?.connection?.effectiveType || ''
    });

    const url = 'https://vitals.vercel-insights.com/v1/vitals';

    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body);
    } else {
      fetch(url, { body, method: 'POST', keepalive: true });
    }
  }
}

// Log slow renders
export function logSlowRender(componentName: string, renderTime: number) {
  if (renderTime > 16) {
    // More than 1 frame (60fps)
    console.warn(`Slow render: ${componentName} took ${renderTime}ms`);

    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('slow_render', {
        component: componentName,
        render_time: renderTime
      });
    }
  }
}
```

**File: `src/app/layout.tsx` (add Web Vitals)**

```typescript
'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { sendToAnalytics } from '@/lib/performance';

export function WebVitals() {
  useReportWebVitals((metric) => {
    sendToAnalytics(metric);
  });

  return null;
}
```

## 4. Logging System

**File: `src/lib/logger.ts`**

```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => {
      return { level: label };
    }
  },
  redact: {
    paths: ['password', 'apiKey', 'token'],
    remove: true
  },
  ...(process.env.NODE_ENV === 'production'
    ? {
        // Structured logging for production
        transport: {
          target: 'pino/file',
          options: { destination: 1 } // stdout
        }
      }
    : {
        // Pretty printing for development
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true
          }
        }
      })
});

export { logger };

// Usage:
// logger.info({ userId: '123', action: 'login' }, 'User logged in');
// logger.error({ err, context }, 'Error occurred');
```

---

# 🔒 III. SECURITY BEST PRACTICES

## 1. Security Headers

**File: `next.config.js`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
              "frame-src 'self'"
            ].join('; ')
          }
        ]
      }
    ];
  },

  // Enable React Strict Mode
  reactStrictMode: true,

  // Remove powered by header
  poweredByHeader: false,

  // Compression
  compress: true,

  // Image optimization
  images: {
    domains: ['*.supabase.co'],
    formats: ['image/avif', 'image/webp']
  }
};

module.exports = nextConfig;
```

## 2. Rate Limiting

**File: `src/lib/rate-limit.ts`**

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

// Create rate limiter
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
  analytics: true
});

// Custom rate limits
export const aiRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '60 s'), // 3 AI requests per minute
  analytics: true
});

export const authRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '60 s'), // 5 auth attempts per minute
  analytics: true
});
```

**File: `src/middleware.ts` (add rate limiting)**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ratelimit } from '@/lib/rate-limit';

export async function middleware(request: NextRequest) {
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString()
          }
        }
      );
    }
  }

  return NextResponse.next();
}
```

## 3. Input Validation

**File: `src/lib/validation.ts`**

```typescript
import { z } from 'zod';

// User schemas
export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),
  fullName: z.string().min(2, 'Name must be at least 2 characters')
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

// Project schemas
export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  framework: z.enum(['next', 'vite', 'remix'])
});

// Message schema
export const chatMessageSchema = z.object({
  message: z.string().min(1).max(5000),
  conversationId: z.string().uuid()
});

// Validate function
export function validate<T>(schema: z.Schema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((e) => e.message).join(', ');
      throw new Error(`Validation failed: ${errors}`);
    }
    throw error;
  }
}
```

## 4. SQL Injection Prevention

Already handled by Supabase RLS, but for raw queries:

**File: `src/lib/supabase/safe-query.ts`**

```typescript
import { createClient } from './server';

export async function safeQuery<T>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  const supabase = await createClient();

  // Use parameterized queries
  const { data, error } = await supabase.rpc('execute_safe_query', {
    query_string: query,
    query_params: params
  });

  if (error) throw error;
  return data;
}

// Example usage:
// const users = await safeQuery(
//   'SELECT * FROM users WHERE email = $1',
//   ['user@example.com']
// );
```

---

# ⚡ IV. PERFORMANCE OPTIMIZATION

## 1. Image Optimization

**File: `src/components/optimized-image.tsx`**

```typescript
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        onLoadingComplete={() => setIsLoading(false)}
        className={`
          duration-700 ease-in-out
          ${isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'}
        `}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
```

## 2. Code Splitting

**File: `src/app/project/[id]/page.tsx`**

```typescript
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading';

// Lazy load heavy components
const ProjectEditor = dynamic(
  () => import('@/components/project/project-editor'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

const LivePreview = dynamic(
  () => import('@/components/preview/live-preview'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
);

export default async function ProjectPage({ params }: { params: { id: string } }) {
  // ... fetch data

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ProjectEditor project={project} />
    </Suspense>
  );
}
```

## 3. Database Query Optimization

**File: `src/lib/supabase/optimized-queries.ts`**

```typescript
import { createClient } from './server';

// Use select to only fetch needed columns
export async function getProjects() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select('id, name, description, updated_at') // Only needed fields
    .order('updated_at', { ascending: false })
    .limit(20); // Pagination

  if (error) throw error;
  return data;
}

// Use joins to avoid N+1 queries
export async function getProjectWithMessages(projectId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      conversations (
        id,
        messages (
          id,
          role,
          content,
          created_at
        )
      )
    `)
    .eq('id', projectId)
    .single();

  if (error) throw error;
  return data;
}

// Use count for pagination
export async function getProjectsWithCount(page: number = 1, limit: number = 20) {
  const supabase = await createClient();

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from('projects')
    .select('*', { count: 'exact' })
    .range(from, to)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return {
    projects: data,
    total: count,
    page,
    totalPages: Math.ceil((count || 0) / limit)
  };
}
```

---

_Continue với Production Deployment và Disaster Recovery trong message tiếp..._
