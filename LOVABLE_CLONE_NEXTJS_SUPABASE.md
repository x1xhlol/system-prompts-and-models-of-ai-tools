# 🚀 Lovable Clone - Next.js + Supabase Complete Guide

> Production-ready templates cho Next.js 14 App Router + Supabase stack

---

## 📋 Table of Contents

1. [Project Structure](#project-structure)
2. [Supabase Database Schema](#supabase-database-schema)
3. [Supabase Client Setup](#supabase-client-setup)
4. [Authentication](#authentication)
5. [Database Operations](#database-operations)
6. [Realtime Features](#realtime-features)
7. [File Storage](#file-storage)
8. [API Routes](#api-routes)
9. [Complete Components](#complete-components)

---

# 📁 I. PROJECT STRUCTURE

```
lovable-clone/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── signup/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── project/
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── callback/
│   │   │   │       └── route.ts
│   │   │   ├── chat/
│   │   │   │   └── route.ts
│   │   │   └── codegen/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── chat/
│   │   │   ├── chat-panel.tsx
│   │   │   └── chat-message.tsx
│   │   ├── preview/
│   │   │   ├── live-preview.tsx
│   │   │   └── console-panel.tsx
│   │   ├── sidebar/
│   │   │   ├── sidebar.tsx
│   │   │   ├── sections-panel.tsx
│   │   │   └── theme-panel.tsx
│   │   └── ui/
│   │       └── ... (shadcn components)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── ai/
│   │   │   ├── agent.ts
│   │   │   └── tools.ts
│   │   ├── hooks/
│   │   │   ├── use-chat.ts
│   │   │   ├── use-project.ts
│   │   │   └── use-realtime.ts
│   │   └── utils.ts
│   ├── types/
│   │   ├── database.types.ts (auto-generated)
│   │   └── index.ts
│   └── middleware.ts
├── supabase/
│   ├── migrations/
│   │   └── 00000000000000_initial_schema.sql
│   ├── functions/
│   │   └── chat-completion/
│   │       └── index.ts
│   └── config.toml
├── .env.local
├── next.config.js
├── package.json
└── tsconfig.json
```

---

# 🗄️ II. SUPABASE DATABASE SCHEMA

## 1. Initial Migration

**File: `supabase/migrations/00000000000000_initial_schema.sql`**

```sql
-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- USERS & AUTH
-- ============================================

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,

  -- Subscription
  subscription_plan text default 'free' check (subscription_plan in ('free', 'pro', 'enterprise')),
  subscription_status text default 'active' check (subscription_status in ('active', 'canceled', 'past_due')),

  -- Limits
  monthly_tokens integer default 50000,
  monthly_projects integer default 3,

  -- Stripe
  stripe_customer_id text unique,
  stripe_subscription_id text unique,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- PROJECTS
-- ============================================

create table public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,

  name text not null,
  description text,
  framework text default 'next' check (framework in ('next', 'vite', 'remix')),

  -- Project data (JSONB for flexibility)
  file_tree jsonb default '{}'::jsonb,
  design_system jsonb default '{}'::jsonb,
  dependencies jsonb default '{}'::jsonb,

  -- Conversation
  conversation_id uuid,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.projects enable row level security;

-- Policies
create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- Indexes
create index projects_user_id_idx on public.projects(user_id);
create index projects_updated_at_idx on public.projects(updated_at desc);

-- ============================================
-- CONVERSATIONS & MESSAGES
-- ============================================

create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.conversations enable row level security;

create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,

  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  tool_calls jsonb,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.messages enable row level security;

create policy "Users can view messages in own conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

create policy "Users can insert messages in own conversations"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
      and conversations.user_id = auth.uid()
    )
  );

-- Indexes
create index messages_conversation_id_idx on public.messages(conversation_id);
create index messages_created_at_idx on public.messages(created_at);

-- Add foreign key to projects
alter table public.projects
  add constraint projects_conversation_id_fkey
  foreign key (conversation_id)
  references public.conversations(id)
  on delete set null;

-- ============================================
-- DEPLOYMENTS
-- ============================================

create table public.deployments (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,

  provider text not null check (provider in ('vercel', 'netlify', 'cloudflare')),
  url text not null,
  status text default 'pending' check (status in ('pending', 'building', 'ready', 'error')),

  build_logs text,
  error text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.deployments enable row level security;

create policy "Users can view deployments of own projects"
  on public.deployments for select
  using (
    exists (
      select 1 from public.projects
      where projects.id = deployments.project_id
      and projects.user_id = auth.uid()
    )
  );

create policy "Users can insert deployments for own projects"
  on public.deployments for insert
  with check (
    exists (
      select 1 from public.projects
      where projects.id = deployments.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Indexes
create index deployments_project_id_idx on public.deployments(project_id);
create index deployments_status_idx on public.deployments(status);

-- ============================================
-- USAGE TRACKING
-- ============================================

create table public.usage (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,

  tokens integer not null,
  type text not null check (type in ('generation', 'chat')),

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.usage enable row level security;

create policy "Users can view own usage"
  on public.usage for select
  using (auth.uid() = user_id);

create policy "System can insert usage"
  on public.usage for insert
  with check (true);

-- Indexes
create index usage_user_id_idx on public.usage(user_id);
create index usage_created_at_idx on public.usage(created_at desc);

-- ============================================
-- PROJECT FILES (for WebContainer sync)
-- ============================================

create table public.project_files (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,

  file_path text not null,
  content text not null,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  unique(project_id, file_path)
);

alter table public.project_files enable row level security;

create policy "Users can manage files in own projects"
  on public.project_files for all
  using (
    exists (
      select 1 from public.projects
      where projects.id = project_files.project_id
      and projects.user_id = auth.uid()
    )
  );

-- Indexes
create index project_files_project_id_idx on public.project_files(project_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get monthly usage
create or replace function get_monthly_usage(target_user_id uuid)
returns integer as $$
  select coalesce(sum(tokens), 0)::integer
  from public.usage
  where user_id = target_user_id
  and created_at >= date_trunc('month', now());
$$ language sql security definer;

-- Function to check if user can generate (has tokens left)
create or replace function can_generate(target_user_id uuid, required_tokens integer)
returns boolean as $$
declare
  user_monthly_tokens integer;
  used_tokens integer;
begin
  select monthly_tokens into user_monthly_tokens
  from public.profiles
  where id = target_user_id;

  select get_monthly_usage(target_user_id) into used_tokens;

  return (user_monthly_tokens - used_tokens) >= required_tokens;
end;
$$ language plpgsql security definer;

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute procedure update_updated_at_column();

create trigger update_projects_updated_at before update on public.projects
  for each row execute procedure update_updated_at_column();

create trigger update_conversations_updated_at before update on public.conversations
  for each row execute procedure update_updated_at_column();

create trigger update_deployments_updated_at before update on public.deployments
  for each row execute procedure update_updated_at_column();

create trigger update_project_files_updated_at before update on public.project_files
  for each row execute procedure update_updated_at_column();

-- ============================================
-- REALTIME
-- ============================================

-- Enable realtime for necessary tables
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.project_files;
alter publication supabase_realtime add table public.deployments;
```

---

## 2. Generate TypeScript Types

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Generate types
npx supabase gen types typescript --project-id your-project-ref > src/types/database.types.ts
```

---

# ⚙️ III. SUPABASE CLIENT SETUP

## 1. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## 2. Environment Variables

**File: `.env.local`**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Optional: Service role key (for admin operations)
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# AI Provider
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Edge Function URL
NEXT_PUBLIC_SUPABASE_EDGE_FUNCTION_URL=https://xxxxx.supabase.co/functions/v1
```

## 3. Client-side Supabase Client

**File: `src/lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

## 4. Server-side Supabase Client

**File: `src/lib/supabase/server.ts`**

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        }
      }
    }
  );
}

// Admin client (uses service role key)
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {}
    }
  );
}
```

## 5. Middleware for Auth

**File: `src/middleware.ts`**

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options
          });
          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });
          response.cookies.set({
            name,
            value,
            ...options
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options
          });
          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });
          response.cookies.set({
            name,
            value: '',
            ...options
          });
        }
      }
    }
  );

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes
  if (!user && request.nextUrl.pathname.startsWith('/project')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if already logged in
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
```

---

# 🔐 IV. AUTHENTICATION

## 1. Auth Helpers

**File: `src/lib/supabase/auth.ts`**

```typescript
import { createClient } from './client';
import { createClient as createServerClient } from './server';

// Client-side auth
export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function signInWithGoogle() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) throw error;
  return data;
}

export async function signInWithGithub() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) throw error;
  return data;
}

// Server-side auth
export async function getUser() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getSession() {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
```

## 2. Auth Callback Route

**File: `src/app/auth/callback/route.ts`**

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to home page
  return NextResponse.redirect(new URL('/', request.url));
}
```

## 3. Login Page

**File: `src/app/(auth)/login/page.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, signInWithGoogle, signInWithGithub } from '@/lib/supabase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Github } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);
      router.push('/');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleGithubLogin = async () => {
    try {
      await signInWithGithub();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to your Lovable account
          </p>
        </div>

        <div className="space-y-4">
          {/* OAuth Buttons */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleGithubLogin}
          >
            <Github className="mr-2 h-4 w-4" />
            Continue with GitHub
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="text-sm text-destructive">{error}</div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

_Continue trong message tiếp theo với Database Operations, Realtime, và Complete Components..._
