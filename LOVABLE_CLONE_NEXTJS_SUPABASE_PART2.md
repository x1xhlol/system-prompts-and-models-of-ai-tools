# 🚀 Lovable Clone - Next.js + Supabase (Part 2)

> Database Operations, Realtime, API Routes, và Complete Components

---

# 📊 V. DATABASE OPERATIONS

## 1. Database Hooks

**File: `src/lib/hooks/use-projects.ts`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type ProjectUpdate = Database['public']['Tables']['projects']['Update'];

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function createProject(project: ProjectInsert) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) throw error;

    setProjects((prev) => [data, ...prev]);
    return data;
  }

  async function updateProject(id: string, updates: ProjectUpdate) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    setProjects((prev) =>
      prev.map((p) => (p.id === id ? data : p))
    );
    return data;
  }

  async function deleteProject(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects
  };
}
```

**File: `src/lib/hooks/use-project.ts`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

export function useProject(projectId: string | null) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      setLoading(false);
      return;
    }

    fetchProject();
  }, [projectId]);

  async function fetchProject() {
    if (!projectId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;
      setProject(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function updateFileTree(fileTree: any) {
    if (!projectId) return;

    const { data, error } = await supabase
      .from('projects')
      .update({ file_tree: fileTree })
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    setProject(data);
    return data;
  }

  async function updateDesignSystem(designSystem: any) {
    if (!projectId) return;

    const { data, error } = await supabase
      .from('projects')
      .update({ design_system: designSystem })
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;
    setProject(data);
    return data;
  }

  return {
    project,
    loading,
    error,
    updateFileTree,
    updateDesignSystem,
    refetch: fetchProject
  };
}
```

**File: `src/lib/hooks/use-conversation.ts`**

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type Message = Database['public']['Tables']['messages']['Row'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];

export function useConversation(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    fetchMessages();
  }, [conversationId]);

  async function fetchMessages() {
    if (!conversationId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function addMessage(message: MessageInsert) {
    const { data, error } = await supabase
      .from('messages')
      .insert(message)
      .select()
      .single();

    if (error) throw error;

    setMessages((prev) => [...prev, data]);
    return data;
  }

  return {
    messages,
    loading,
    error,
    addMessage,
    refetch: fetchMessages
  };
}
```

---

# ⚡ VI. REALTIME SUBSCRIPTIONS

## 1. Realtime Hook

**File: `src/lib/hooks/use-realtime-messages.ts`**

```typescript
'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';
import type { RealtimeChannel } from '@supabase/supabase-js';

type Message = Database['public']['Tables']['messages']['Row'];

export function useRealtimeMessages(
  conversationId: string | null,
  onMessage: (message: Message) => void
) {
  const supabase = createClient();

  useEffect(() => {
    if (!conversationId) return;

    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      channel = supabase
        .channel(`conversation:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
          },
          (payload) => {
            onMessage(payload.new as Message);
          }
        )
        .subscribe();
    };

    setupSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [conversationId]);
}
```

**File: `src/lib/hooks/use-realtime-project-files.ts`**

```typescript
'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type ProjectFile = Database['public']['Tables']['project_files']['Row'];

export function useRealtimeProjectFiles(
  projectId: string | null,
  onFileChange: (file: ProjectFile, event: 'INSERT' | 'UPDATE' | 'DELETE') => void
) {
  const supabase = createClient();

  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project-files:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_files',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            onFileChange(payload.new as ProjectFile, payload.eventType);
          } else if (payload.eventType === 'DELETE') {
            onFileChange(payload.old as ProjectFile, 'DELETE');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);
}
```

---

# 📁 VII. FILE STORAGE

## 1. Storage Helper

**File: `src/lib/supabase/storage.ts`**

```typescript
import { createClient } from './client';

const BUCKET_NAME = 'project-assets';

export async function uploadFile(
  projectId: string,
  file: File,
  path?: string
): Promise<string> {
  const supabase = createClient();

  const filePath = path || `${projectId}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path);

  return publicUrl;
}

export async function deleteFile(filePath: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) throw error;
}

export async function listFiles(projectId: string): Promise<string[]> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(projectId);

  if (error) throw error;

  return data.map((file) => file.name);
}

export function getPublicUrl(filePath: string): string {
  const supabase = createClient();

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return data.publicUrl;
}
```

## 2. Upload Component Example

**File: `src/components/upload/image-upload.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { uploadFile } from '@/lib/supabase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  projectId: string;
  onUpload: (url: string) => void;
}

export function ImageUpload({ projectId, onUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const url = await uploadFile(projectId, file);
      onUpload(url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="hidden"
        id="image-upload"
      />
      <Button
        variant="outline"
        onClick={() => document.getElementById('image-upload')?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </>
        )}
      </Button>
    </div>
  );
}
```

---

# 🔌 VIII. API ROUTES WITH SUPABASE

## 1. Chat API Route

**File: `src/app/api/chat/route.ts`**

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, conversationId } = await request.json();

    // Check usage limits
    const { data: profile } = await supabase
      .from('profiles')
      .select('monthly_tokens')
      .eq('id', user.id)
      .single();

    const { data: usageData } = await supabase
      .rpc('get_monthly_usage', { target_user_id: user.id });

    const remainingTokens = (profile?.monthly_tokens || 0) - (usageData || 0);

    if (remainingTokens < 1000) {
      return NextResponse.json(
        { error: 'Monthly token limit exceeded' },
        { status: 429 }
      );
    }

    // Get conversation history
    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    // Save user message
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: message
    });

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are Lovable, an AI that helps users build web applications.'
        },
        ...(messages || []).map((msg) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7
    });

    const response = completion.choices[0].message.content || '';

    // Save assistant message
    await supabase.from('messages').insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: response
    });

    // Track usage
    const tokensUsed = completion.usage?.total_tokens || 0;
    await supabase.from('usage').insert({
      user_id: user.id,
      tokens: tokensUsed,
      type: 'chat'
    });

    return NextResponse.json({ response, tokensUsed });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 2. Streaming Chat Route

**File: `src/app/api/chat/stream/route.ts`**

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  const supabase = await createClient();

  // Verify authentication
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { message, conversationId } = await request.json();

  // Get conversation history
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  // Save user message
  await supabase.from('messages').insert({
    conversation_id: conversationId,
    role: 'user',
    content: message
  });

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const openaiStream = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are Lovable, an AI that helps users build web applications.'
            },
            ...(messages || []).map((msg) => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content
            })),
            {
              role: 'user',
              content: message
            }
          ],
          stream: true
        });

        let fullResponse = '';

        for await (const chunk of openaiStream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;

          const data = encoder.encode(`data: ${JSON.stringify({ token: content })}\n\n`);
          controller.enqueue(data);
        }

        // Save complete assistant message
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: fullResponse
        });

        // Track usage (estimate)
        const tokensUsed = Math.ceil(fullResponse.length / 4);
        await supabase.from('usage').insert({
          user_id: user.id,
          tokens: tokensUsed,
          type: 'chat'
        });

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    }
  });
}
```

---

# 🎯 IX. COMPLETE INTEGRATED COMPONENTS

## 1. Project Dashboard Page

**File: `src/app/(dashboard)/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProjectList } from '@/components/project/project-list';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false });

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Your Projects</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage your AI-generated applications
        </p>
      </div>

      <ProjectList initialProjects={projects || []} />
    </div>
  );
}
```

## 2. Project List Component (Client)

**File: `src/components/project/project-list.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Plus, FolderOpen, Trash2 } from 'lucide-react';
import type { Database } from '@/types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectListProps {
  initialProjects: Project[];
}

export function ProjectList({ initialProjects }: ProjectListProps) {
  const [projects, setProjects] = useState(initialProjects);
  const router = useRouter();
  const supabase = createClient();

  const handleCreateProject = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create conversation first
    const { data: conversation } = await supabase
      .from('conversations')
      .insert({ user_id: user.id })
      .select()
      .single();

    if (!conversation) return;

    // Create project
    const { data: project } = await supabase
      .from('projects')
      .insert({
        user_id: user.id,
        name: `New Project ${projects.length + 1}`,
        conversation_id: conversation.id
      })
      .select()
      .single();

    if (project) {
      setProjects([project, ...projects]);
      router.push(`/project/${project.id}`);
    }
  };

  const handleDeleteProject = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id);
    setProjects(projects.filter((p) => p.id !== id));
  };

  return (
    <div>
      <Button onClick={handleCreateProject} className="mb-6">
        <Plus className="mr-2 h-4 w-4" />
        New Project
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>
                {project.description || 'No description'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="text-sm text-muted-foreground">
                Framework: {project.framework}
              </div>
              <div className="text-sm text-muted-foreground">
                Updated: {new Date(project.updated_at).toLocaleDateString()}
              </div>
            </CardContent>

            <CardFooter className="flex gap-2">
              <Button
                variant="default"
                className="flex-1"
                onClick={() => router.push(`/project/${project.id}`)}
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                Open
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDeleteProject(project.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

## 3. Project Editor Page

**File: `src/app/(dashboard)/project/[id]/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ProjectEditor } from '@/components/project/project-editor';

export default async function ProjectPage({
  params
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!project) {
    redirect('/');
  }

  return <ProjectEditor project={project} />;
}
```

## 4. Project Editor Component (Client)

**File: `src/components/project/project-editor.tsx`**

```typescript
'use client';

import { ChatPanel } from '@/components/chat/chat-panel';
import { LivePreview } from '@/components/preview/live-preview';
import { Sidebar } from '@/components/sidebar/sidebar';
import type { Database } from '@/types/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

interface ProjectEditorProps {
  project: Project;
}

export function ProjectEditor({ project }: ProjectEditorProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar projectId={project.id} />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat */}
        <div className="w-1/2 border-r">
          <ChatPanel
            projectId={project.id}
            conversationId={project.conversation_id}
          />
        </div>

        {/* Preview */}
        <div className="w-1/2">
          <LivePreview projectId={project.id} />
        </div>
      </div>
    </div>
  );
}
```

---

# 🚀 X. DEPLOYMENT

## 1. package.json

```json
{
  "name": "lovable-clone",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "supabase:gen-types": "npx supabase gen types typescript --project-id your-project-ref > src/types/database.types.ts"
  },
  "dependencies": {
    "@supabase/ssr": "^0.1.0",
    "@supabase/supabase-js": "^2.39.0",
    "@webcontainer/api": "^1.1.9",
    "next": "^14.2.0",
    "openai": "^4.28.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-markdown": "^9.0.1",
    "react-syntax-highlighter": "^15.5.0",
    "zustand": "^4.5.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/react-syntax-highlighter": "^15.5.11",
    "autoprefixer": "^10.4.18",
    "eslint": "^8",
    "eslint-config-next": "14.2.0",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

## 2. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - OPENAI_API_KEY
```

---

# ✅ XI. COMPLETE SETUP CHECKLIST

## Supabase Setup

- [ ] Create Supabase project
- [ ] Run database migration
- [ ] Enable authentication providers (Google, GitHub)
- [ ] Create storage bucket `project-assets`
- [ ] Set up RLS policies
- [ ] Enable Realtime for tables
- [ ] Generate TypeScript types

## Next.js Setup

- [ ] Create Next.js 14 app
- [ ] Install Supabase packages
- [ ] Configure environment variables
- [ ] Set up middleware
- [ ] Create auth pages (login/signup)
- [ ] Set up API routes

## Features

- [ ] User authentication (email + OAuth)
- [ ] Project CRUD operations
- [ ] Real-time chat with AI
- [ ] File management
- [ ] Live preview
- [ ] Design system customization
- [ ] Deployment integration

---

**Hoàn tất! Bạn giờ có complete Next.js + Supabase setup cho Lovable Clone! 🎉**
