# 🚀 Lovable Clone - Quick Start Guide

> Hướng dẫn bắt đầu nhanh để build MVP trong 2-4 tuần

---

## 📋 Prerequisites

```bash
# Required
- Node.js >= 18.0.0
- npm hoặc pnpm
- Git
- PostgreSQL (hoặc Supabase account)

# Optional but Recommended
- Docker Desktop
- VS Code
- OpenAI API key hoặc Anthropic API key
```

---

## 🏁 Quick Start (MVP trong 2 tuần)

### **Bước 1: Setup Project Structure**

```bash
# Create monorepo
npx create-turbo@latest lovable-clone
cd lovable-clone

# Structure
lovable-clone/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Backend API
├── packages/
│   ├── ui/           # Shared UI components
│   ├── agent/        # AI agent logic
│   ├── database/     # Prisma schema
│   └── config/       # Shared configs
└── turbo.json
```

### **Bước 2: Initialize Frontend**

```bash
cd apps/web

# Create Next.js app
npx create-next-app@latest . --typescript --tailwind --app

# Install dependencies
npm install @radix-ui/react-dialog @radix-ui/react-tabs
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react
npm install zustand
npm install react-markdown
npm install @uiw/react-textarea-code-editor

# Install shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button dialog input textarea tabs scroll-area
```

**File: `apps/web/app/page.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { ChatPanel } from '@/components/chat-panel';
import { LivePreview } from '@/components/live-preview';
import { Sidebar } from '@/components/sidebar';

export default function Home() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat Panel */}
        <div className="w-1/2 border-r">
          <ChatPanel />
        </div>

        {/* Live Preview */}
        <div className="w-1/2">
          <LivePreview />
        </div>
      </div>
    </div>
  );
}
```

### **Bước 3: Setup Backend API**

```bash
cd apps/api

# Initialize
npm init -y
npm install express cors dotenv
npm install -D typescript @types/node @types/express tsx

# AI dependencies
npm install openai @anthropic-ai/sdk
npm install langchain @langchain/openai

# Initialize TypeScript
npx tsc --init
```

**File: `apps/api/src/index.ts`**
```typescript
import express from 'express';
import cors from 'cors';
import { chatRouter } from './routes/chat';
import { codegenRouter } from './routes/codegen';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/codegen', codegenRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
```

### **Bước 4: Setup Database**

**Option A: Supabase (Recommended - Easier)**

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Go to https://supabase.com
# Create new project
# Copy URL and anon key to .env
```

**File: `.env`**
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
```

**Option B: Local PostgreSQL + Prisma**

```bash
cd packages/database

npm install prisma @prisma/client
npx prisma init

# Edit prisma/schema.prisma (copy from ARCHITECTURE.md section VII)
npx prisma migrate dev --name init
npx prisma generate
```

### **Bước 5: Implement Basic Chat**

**File: `apps/web/components/chat-panel.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call API
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, history: messages })
      });

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Chat</h1>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-black'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your app..."
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button onClick={sendMessage} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### **Bước 6: Implement AI Chat Handler**

**File: `apps/api/src/routes/chat.ts`**
```typescript
import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req, res) => {
  try {
    const { message, history } = req.body;

    // Build messages for OpenAI
    const messages = [
      {
        role: 'system',
        content: `You are Lovable, an AI assistant that helps users build web applications.
You can generate React components, fix bugs, and provide coding guidance.
Always respond in a helpful and concise manner.`
      },
      ...history.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: message
      }
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 2000
    });

    const response = completion.choices[0].message.content;

    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export { router as chatRouter };
```

### **Bước 7: Implement Code Generation**

**File: `apps/api/src/routes/codegen.ts`**
```typescript
import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Load Lovable system prompt
import { readFileSync } from 'fs';
import { join } from 'path';

const LOVABLE_PROMPT = readFileSync(
  join(__dirname, '../../../prompts/lovable-agent.txt'),
  'utf-8'
);

router.post('/generate', async (req, res) => {
  try {
    const { requirement, context } = req.body;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: LOVABLE_PROMPT
        },
        {
          role: 'user',
          content: `Generate a React component for: ${requirement}

Context: ${JSON.stringify(context, null, 2)}`
        }
      ],
      temperature: 0.2, // Lower for more consistent code
      max_tokens: 4000
    });

    const code = completion.choices[0].message.content;

    // Parse and validate code
    const parsed = parseGeneratedCode(code);

    res.json({
      code: parsed.code,
      filePath: parsed.filePath,
      imports: parsed.imports
    });
  } catch (error) {
    console.error('Codegen error:', error);
    res.status(500).json({ error: 'Failed to generate code' });
  }
});

function parseGeneratedCode(response: string) {
  // Extract code blocks from markdown
  const codeBlockRegex = /```(?:typescript|tsx|jsx)?\n([\s\S]*?)```/g;
  const matches = [...response.matchAll(codeBlockRegex)];

  if (matches.length === 0) {
    return { code: response, filePath: 'src/components/Generated.tsx', imports: [] };
  }

  const code = matches[0][1];

  // Extract file path if specified
  const filePathMatch = response.match(/File: `(.+?)`/);
  const filePath = filePathMatch ? filePathMatch[1] : 'src/components/Generated.tsx';

  // Extract imports
  const imports = code.match(/^import .+ from .+$/gm) || [];

  return { code, filePath, imports };
}

export { router as codegenRouter };
```

### **Bước 8: Copy Lovable Prompt**

```bash
# Create prompts directory
mkdir -p apps/api/src/prompts

# Copy Lovable agent prompt
cp Lovable/Agent\ Prompt.txt apps/api/src/prompts/lovable-agent.txt
```

### **Bước 9: Setup Environment Variables**

**File: `apps/api/.env`**
```env
# OpenAI
OPENAI_API_KEY=sk-...

# Or Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/lovable
# Or Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...

# Server
PORT=3001
NODE_ENV=development
```

**File: `apps/web/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### **Bước 10: Run the App**

```bash
# Terminal 1: Run API
cd apps/api
npm run dev

# Terminal 2: Run Web
cd apps/web
npm run dev

# Open http://localhost:3000
```

---

## 🎨 **Bước 11: Implement Live Preview (Basic)**

**File: `apps/web/components/live-preview.tsx`**
```typescript
'use client';

import { useEffect, useState } from 'react';

export function LivePreview() {
  const [url, setUrl] = useState('');

  useEffect(() => {
    // In production, this would be WebContainer URL
    // For MVP, use static preview
    setUrl('http://localhost:3002');
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="p-4 border-b flex items-center gap-4">
        <h2 className="font-bold">Preview</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded">Mobile</button>
          <button className="px-3 py-1 border rounded">Tablet</button>
          <button className="px-3 py-1 border rounded bg-blue-500 text-white">
            Desktop
          </button>
        </div>
      </div>

      {/* Preview iframe */}
      <div className="flex-1 bg-gray-100 flex items-center justify-center">
        <div className="w-full h-full bg-white">
          {url ? (
            <iframe
              src={url}
              className="w-full h-full"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No preview available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 🔧 **Bước 12: Implement Sidebar (Basic)**

**File: `apps/web/components/sidebar.tsx`**
```typescript
'use client';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LayoutGrid, Package, Palette, Folder } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-80 border-r">
      <Tabs defaultValue="sections" className="h-full">
        <TabsList className="w-full justify-start border-b rounded-none">
          <TabsTrigger value="sections">
            <LayoutGrid className="w-4 h-4 mr-2" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="theme">
            <Palette className="w-4 h-4 mr-2" />
            Theme
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="p-4 space-y-4">
          <h3 className="font-bold mb-2">Add Section</h3>

          {['Hero', 'Features', 'Testimonials', 'CTA', 'Pricing'].map((section) => (
            <button
              key={section}
              className="w-full p-4 border rounded-lg hover:border-blue-500 transition"
            >
              <p className="font-medium">{section}</p>
              <p className="text-sm text-gray-500">Click to add</p>
            </button>
          ))}
        </TabsContent>

        <TabsContent value="theme" className="p-4">
          <h3 className="font-bold mb-4">Theme Customization</h3>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Primary Color</label>
              <input
                type="color"
                defaultValue="#3b82f6"
                className="w-full h-10 mt-2"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Font Family</label>
              <select className="w-full p-2 border rounded mt-2">
                <option>Inter</option>
                <option>Roboto</option>
                <option>Poppins</option>
              </select>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}
```

---

## 📦 **Bước 13: Add WebContainer (Advanced)**

```bash
npm install @webcontainer/api
```

**File: `apps/web/lib/webcontainer.ts`**
```typescript
import { WebContainer } from '@webcontainer/api';

let webcontainerInstance: WebContainer;

export async function initWebContainer() {
  if (webcontainerInstance) return webcontainerInstance;

  webcontainerInstance = await WebContainer.boot();
  return webcontainerInstance;
}

export async function createProject(files: Record<string, any>) {
  const container = await initWebContainer();

  // Mount files
  await container.mount(files);

  // Install dependencies
  const installProcess = await container.spawn('npm', ['install']);
  const installExitCode = await installProcess.exit;

  if (installExitCode !== 0) {
    throw new Error('Failed to install dependencies');
  }

  // Start dev server
  const devProcess = await container.spawn('npm', ['run', 'dev']);

  // Wait for server to be ready
  devProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        console.log(data);
      }
    })
  );

  // Get preview URL
  container.on('server-ready', (port, url) => {
    console.log('Server ready at:', url);
  });

  return container;
}
```

---

## 🧪 **Testing Your MVP**

### Test Flow:
1. **Chat**: Type "Create a landing page with a hero section"
2. **Generate**: AI should respond with code
3. **Preview**: Should see live preview (if WebContainer is setup)
4. **Iterate**: Ask "Make the hero background blue"
5. **Export**: Add export functionality

---

## 📈 **MVP Features Checklist**

### Week 1:
- [x] Basic chat interface
- [x] AI integration (OpenAI/Anthropic)
- [x] Simple code generation
- [x] Static preview
- [x] Sidebar with sections

### Week 2:
- [ ] WebContainer integration
- [ ] Live code preview
- [ ] File system management
- [ ] Error detection
- [ ] Export to ZIP

### Week 3-4 (Optional):
- [ ] Design system customization
- [ ] Component library
- [ ] GitHub integration
- [ ] Deploy to Vercel
- [ ] User authentication

---

## 🐛 Common Issues & Solutions

### Issue 1: CORS errors
```typescript
// apps/api/src/index.ts
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));
```

### Issue 2: OpenAI API rate limits
```typescript
// Add retry logic
import { retry } from '@/lib/retry';

const completion = await retry(() =>
  openai.chat.completions.create({...}),
  { retries: 3, delay: 1000 }
);
```

### Issue 3: WebContainer not loading
```typescript
// Make sure you're using HTTPS in production
// WebContainer requires secure context
```

---

## 🚀 Next Steps After MVP

1. **Add Authentication** (Supabase Auth / Clerk)
2. **Implement Project Saving** (Database persistence)
3. **Add Collaboration** (WebSocket + Yjs)
4. **Deploy to Production** (Vercel + Railway)
5. **Add Billing** (Stripe integration)
6. **Marketing & Launch** (Product Hunt, Twitter)

---

## 📚 Resources

- **Full Architecture**: See `LOVABLE_CLONE_ARCHITECTURE.md`
- **Lovable Prompt**: `/Lovable/Agent Prompt.txt`
- **Lovable Tools**: `/Lovable/Agent Tools.json`
- **WebContainer Docs**: https://webcontainers.io/guides/quickstart
- **shadcn/ui**: https://ui.shadcn.com
- **Next.js**: https://nextjs.org/docs

---

## 💡 Pro Tips

1. **Start Simple**: Build chat first, add complexity later
2. **Use Lovable's Prompt**: Copy their system prompt directly
3. **Test Iteratively**: Deploy early, get feedback
4. **Monitor Costs**: Track OpenAI API usage
5. **Cache Responses**: Use Redis for common queries
6. **Version Control**: Git commit frequently
7. **Documentation**: Document as you build
8. **Community**: Join Discord for help

---

**Good luck building your Lovable clone! 🎉**

Nếu cần help với bất kỳ bước nào, hãy reference back to the full architecture document!
