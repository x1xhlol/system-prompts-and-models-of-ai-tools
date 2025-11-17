# 🚀 Lovable Clone - Advanced Features & Production Setup

> Edge Functions, Webhooks, Testing, CI/CD, Monitoring, và Advanced Features

---

# 📑 Table of Contents

1. [Supabase Edge Functions](#supabase-edge-functions)
2. [Webhook Handlers](#webhook-handlers)
3. [Testing Setup](#testing-setup)
4. [CI/CD Pipeline](#cicd-pipeline)
5. [Monitoring & Analytics](#monitoring--analytics)
6. [Advanced Features](#advanced-features)
7. [Production Deployment](#production-deployment)

---

# ⚡ I. SUPABASE EDGE FUNCTIONS

## 1. AI Chat Edge Function

**File: `supabase/functions/chat-completion/index.ts`**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import OpenAI from 'https://esm.sh/openai@4.28.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! }
        }
      }
    );

    // Verify user
    const {
      data: { user },
      error: authError
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { message, conversationId, systemPrompt } = await req.json();

    // Check usage limits
    const { data: canGenerate } = await supabaseClient.rpc('can_generate', {
      target_user_id: user.id,
      required_tokens: 2000
    });

    if (!canGenerate) {
      return new Response(
        JSON.stringify({ error: 'Monthly token limit exceeded' }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get conversation history
    const { data: messages } = await supabaseClient
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(20); // Last 20 messages for context

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY')
    });

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt || 'You are Lovable, an AI that helps build web apps.'
        },
        ...(messages || []).map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const response = completion.choices[0].message.content;
    const tokensUsed = completion.usage?.total_tokens || 0;

    // Save user message
    await supabaseClient.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: message
    });

    // Save assistant message
    await supabaseClient.from('messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: response
    });

    // Track usage
    await supabaseClient.from('usage').insert({
      user_id: user.id,
      tokens: tokensUsed,
      type: 'chat'
    });

    return new Response(
      JSON.stringify({ response, tokensUsed }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

## 2. Code Generation Edge Function

**File: `supabase/functions/generate-code/index.ts`**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.17.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! }
        }
      }
    );

    const {
      data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { prompt, projectId, componentType } = await req.json();

    // Load Lovable system prompt from storage
    const { data: systemPromptData } = await supabaseClient.storage
      .from('system-prompts')
      .download('lovable-agent-prompt.txt');

    const systemPrompt = await systemPromptData?.text();

    // Get project context
    const { data: project } = await supabaseClient
      .from('projects')
      .select('file_tree, design_system')
      .eq('id', projectId)
      .single();

    // Initialize Anthropic (better for code generation)
    const anthropic = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY')
    });

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `${systemPrompt}

## Project Context
File Tree:
\`\`\`json
${JSON.stringify(project?.file_tree, null, 2)}
\`\`\`

Design System:
\`\`\`json
${JSON.stringify(project?.design_system, null, 2)}
\`\`\`

## Task
Generate a ${componentType} component:
${prompt}

Return the complete code with proper imports and exports.
`
        }
      ]
    });

    const generatedCode = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Track usage
    await supabaseClient.from('usage').insert({
      user_id: user.id,
      tokens: message.usage.input_tokens + message.usage.output_tokens,
      type: 'generation'
    });

    return new Response(
      JSON.stringify({
        code: generatedCode,
        tokensUsed: message.usage.input_tokens + message.usage.output_tokens
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
```

## 3. Deploy Edge Functions

**File: `supabase/functions/deploy.sh`**

```bash
#!/bin/bash

# Deploy all edge functions to Supabase

echo "🚀 Deploying Edge Functions to Supabase..."

# Deploy chat completion
echo "📦 Deploying chat-completion..."
supabase functions deploy chat-completion \
  --no-verify-jwt \
  --project-ref $SUPABASE_PROJECT_REF

# Deploy code generation
echo "📦 Deploying generate-code..."
supabase functions deploy generate-code \
  --no-verify-jwt \
  --project-ref $SUPABASE_PROJECT_REF

# Set secrets
echo "🔐 Setting secrets..."
supabase secrets set \
  OPENAI_API_KEY=$OPENAI_API_KEY \
  ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  --project-ref $SUPABASE_PROJECT_REF

echo "✅ Deployment complete!"
```

---

# 🔗 II. WEBHOOK HANDLERS

## 1. Stripe Webhooks

**File: `src/app/api/webhooks/stripe/route.ts`**

```typescript
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;

        if (!userId) break;

        // Update user subscription
        await supabase
          .from('profiles')
          .update({
            subscription_plan: session.metadata?.plan || 'pro',
            subscription_status: 'active',
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            monthly_tokens: session.metadata?.plan === 'pro' ? 200000 : 50000,
            monthly_projects: session.metadata?.plan === 'pro' ? 10 : 3
          })
          .eq('id', userId);

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from('profiles')
          .update({
            subscription_status: subscription.status,
            subscription_plan:
              subscription.items.data[0].price.metadata.plan || 'pro'
          })
          .eq('stripe_subscription_id', subscription.id);

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            subscription_plan: 'free',
            monthly_tokens: 50000,
            monthly_projects: 3
          })
          .eq('stripe_subscription_id', subscription.id);

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;

        await supabase
          .from('profiles')
          .update({
            subscription_status: 'past_due'
          })
          .eq('stripe_customer_id', invoice.customer as string);

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
```

## 2. GitHub Webhooks

**File: `src/app/api/webhooks/github/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();

  // Verify signature
  const signature = req.headers.get('x-hub-signature-256');
  const body = await req.text();

  const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET!);
  const digest = 'sha256=' + hmac.update(body).digest('hex');

  if (signature !== digest) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const payload = JSON.parse(body);
  const event = req.headers.get('x-github-event');

  try {
    switch (event) {
      case 'push': {
        // Handle push events (auto-deploy)
        const { repository, ref, commits } = payload;

        // Find project linked to this repo
        const { data: project } = await supabase
          .from('projects')
          .select('*')
          .eq('github_repo', repository.full_name)
          .single();

        if (project) {
          // Trigger deployment
          await supabase.from('deployments').insert({
            project_id: project.id,
            provider: 'vercel',
            status: 'pending',
            url: ''
          });

          // You can trigger Vercel deployment here
          // await triggerVercelDeployment(project);
        }

        break;
      }

      case 'pull_request': {
        const { action, pull_request } = payload;

        if (action === 'opened' || action === 'synchronize') {
          // Create preview deployment for PR
          // await createPreviewDeployment(pull_request);
        }

        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('GitHub webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
```

## 3. Vercel Deploy Webhook

**File: `src/app/api/webhooks/vercel/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createAdminClient();
  const payload = await req.json();

  try {
    const { deployment, type } = payload;

    // Find deployment in database
    const { data: existingDeployment } = await supabase
      .from('deployments')
      .select('*')
      .eq('url', deployment.url)
      .single();

    if (!existingDeployment) {
      return NextResponse.json({ received: true });
    }

    let status = 'pending';
    let buildLogs = '';

    switch (type) {
      case 'deployment.created':
        status = 'building';
        break;
      case 'deployment.ready':
        status = 'ready';
        break;
      case 'deployment.error':
        status = 'error';
        buildLogs = deployment.errorMessage || 'Deployment failed';
        break;
    }

    // Update deployment status
    await supabase
      .from('deployments')
      .update({
        status,
        build_logs: buildLogs,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingDeployment.id);

    // Notify user via realtime
    await supabase
      .from('deployments')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', existingDeployment.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Vercel webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
```

---

# 🧪 III. TESTING SETUP

## 1. Vitest Configuration

**File: `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

**File: `src/test/setup.ts`**

```typescript
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    }))
  })
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}));
```

## 2. Component Tests

**File: `src/components/chat/__tests__/chat-panel.test.tsx`**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatPanel } from '../chat-panel';

describe('ChatPanel', () => {
  it('renders chat input', () => {
    render(<ChatPanel projectId="test-id" conversationId="conv-id" />);

    expect(
      screen.getByPlaceholderText(/describe what you want to build/i)
    ).toBeInTheDocument();
  });

  it('sends message on button click', async () => {
    const { getByRole, getByPlaceholderText } = render(
      <ChatPanel projectId="test-id" conversationId="conv-id" />
    );

    const input = getByPlaceholderText(/describe what you want to build/i);
    const button = getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Create a button' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Create a button')).toBeInTheDocument();
    });
  });

  it('disables input while loading', async () => {
    const { getByPlaceholderText, getByRole } = render(
      <ChatPanel projectId="test-id" conversationId="conv-id" />
    );

    const input = getByPlaceholderText(/describe what you want to build/i);
    const button = getByRole('button');

    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(button);

    expect(input).toBeDisabled();
  });
});
```

## 3. E2E Tests with Playwright

**File: `playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
});
```

**File: `e2e/auth.spec.ts`**

```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('user can sign up', async ({ page }) => {
    await page.goto('/signup');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.fill('input[name="fullName"]', 'Test User');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
  });

  test('user can sign in', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
  });
});

test.describe('Project Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('user can create a project', async ({ page }) => {
    await page.click('text=New Project');

    await expect(page).toHaveURL(/\/project\/.+/);
    await expect(page.locator('text=Chat')).toBeVisible();
  });

  test('user can send chat message', async ({ page }) => {
    await page.click('text=New Project');

    const textarea = page.locator('textarea');
    await textarea.fill('Create a button component');
    await page.click('button:has-text("Send")');

    await expect(
      page.locator('text=Create a button component')
    ).toBeVisible();
  });
});
```

---

_Tiếp tục với CI/CD, Monitoring, và Advanced Features..._
