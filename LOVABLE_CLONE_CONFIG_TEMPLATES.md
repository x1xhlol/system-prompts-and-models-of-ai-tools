# ⚙️ Lovable Clone - Configuration & Infrastructure Templates

> WebContainer, Stores, Database, and Config templates

---

# 🐳 I. WEBCONTAINER INTEGRATION

## 1. WebContainer Manager

**File: `apps/web/lib/webcontainer.ts`**

```typescript
import { WebContainer, FileSystemTree } from '@webcontainer/api';

let webcontainerInstance: WebContainer | null = null;

export class WebContainerManager {
  private static container: WebContainer | null = null;
  private static bootPromise: Promise<WebContainer> | null = null;

  static async getInstance(): Promise<WebContainer> {
    if (this.container) {
      return this.container;
    }

    if (this.bootPromise) {
      return this.bootPromise;
    }

    this.bootPromise = WebContainer.boot();
    this.container = await this.bootPromise;
    this.bootPromise = null;

    return this.container;
  }

  static async createProject(
    projectId: string,
    files: FileSystemTree
  ): Promise<{
    container: WebContainer;
    url: string;
  }> {
    const container = await this.getInstance();

    // Mount files
    await container.mount(files);

    // Install dependencies
    const installProcess = await container.spawn('npm', ['install']);

    installProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log('[npm install]', data);
        }
      })
    );

    const installExitCode = await installProcess.exit;

    if (installExitCode !== 0) {
      throw new Error('Failed to install dependencies');
    }

    // Start dev server
    const devProcess = await container.spawn('npm', ['run', 'dev']);

    devProcess.output.pipeTo(
      new WritableStream({
        write(data) {
          console.log('[dev server]', data);
        }
      })
    );

    // Wait for server to be ready
    const url = await new Promise<string>((resolve) => {
      container.on('server-ready', (port, url) => {
        resolve(url);
      });
    });

    return { container, url };
  }

  static async writeFile(
    path: string,
    content: string
  ): Promise<void> {
    const container = await this.getInstance();
    await container.fs.writeFile(path, content);
  }

  static async readFile(path: string): Promise<string> {
    const container = await this.getInstance();
    const file = await container.fs.readFile(path, 'utf-8');
    return file;
  }

  static async deleteFile(path: string): Promise<void> {
    const container = await this.getInstance();
    await container.fs.rm(path);
  }

  static async renameFile(
    oldPath: string,
    newPath: string
  ): Promise<void> {
    const container = await this.getInstance();
    const content = await container.fs.readFile(oldPath, 'utf-8');
    await container.fs.writeFile(newPath, content);
    await container.fs.rm(oldPath);
  }

  static async getFileTree(path: string = '/'): Promise<FileSystemTree> {
    const container = await this.getInstance();
    const entries = await container.fs.readdir(path, {
      withFileTypes: true
    });

    const tree: FileSystemTree = {};

    for (const entry of entries) {
      const fullPath = `${path}/${entry.name}`;

      if (entry.isDirectory()) {
        tree[entry.name] = {
          directory: await this.getFileTree(fullPath)
        };
      } else {
        const content = await container.fs.readFile(fullPath, 'utf-8');
        tree[entry.name] = {
          file: {
            contents: content
          }
        };
      }
    }

    return tree;
  }
}
```

---

## 2. Project Template Generator

**File: `apps/api/src/lib/templates.ts`**

```typescript
import { FileSystemTree } from '@webcontainer/api';

export function generateNextJsTemplate(projectName: string): FileSystemTree {
  return {
    'package.json': {
      file: {
        contents: JSON.stringify(
          {
            name: projectName,
            version: '0.1.0',
            private: true,
            scripts: {
              dev: 'next dev',
              build: 'next build',
              start: 'next start',
              lint: 'next lint'
            },
            dependencies: {
              react: '^18.3.0',
              'react-dom': '^18.3.0',
              next: '^14.2.0',
              'class-variance-authority': '^0.7.0',
              clsx: '^2.1.0',
              'tailwind-merge': '^2.2.0',
              'lucide-react': '^0.378.0'
            },
            devDependencies: {
              typescript: '^5',
              '@types/node': '^20',
              '@types/react': '^18',
              '@types/react-dom': '^18',
              postcss: '^8',
              tailwindcss: '^3.4.0',
              autoprefixer: '^10.0.1',
              eslint: '^8',
              'eslint-config-next': '14.2.0'
            }
          },
          null,
          2
        )
      }
    },
    'tsconfig.json': {
      file: {
        contents: JSON.stringify(
          {
            compilerOptions: {
              lib: ['dom', 'dom.iterable', 'esnext'],
              allowJs: true,
              skipLibCheck: true,
              strict: true,
              noEmit: true,
              esModuleInterop: true,
              module: 'esnext',
              moduleResolution: 'bundler',
              resolveJsonModule: true,
              isolatedModules: true,
              jsx: 'preserve',
              incremental: true,
              plugins: [
                {
                  name: 'next'
                }
              ],
              paths: {
                '@/*': ['./src/*']
              }
            },
            include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
            exclude: ['node_modules']
          },
          null,
          2
        )
      }
    },
    'next.config.js': {
      file: {
        contents: `/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
`
      }
    },
    'tailwind.config.ts': {
      file: {
        contents: `import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;
`
      }
    },
    'postcss.config.js': {
      file: {
        contents: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`
      }
    },
    '.eslintrc.json': {
      file: {
        contents: JSON.stringify(
          {
            extends: 'next/core-web-vitals'
          },
          null,
          2
        )
      }
    },
    src: {
      directory: {
        app: {
          directory: {
            'layout.tsx': {
              file: {
                contents: `import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "${projectName}",
  description: "Built with Lovable",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
`
              }
            },
            'page.tsx': {
              file: {
                contents: `export default function Home() {
  return (
    <main className="min-h-screen p-24">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to ${projectName}
        </h1>
        <p className="text-lg text-muted-foreground">
          Built with Lovable - Start building your dream app!
        </p>
      </div>
    </main>
  );
}
`
              }
            },
            'globals.css': {
              file: {
                contents: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`
              }
            }
          }
        },
        components: {
          directory: {
            ui: {
              directory: {}
            }
          }
        },
        lib: {
          directory: {
            'utils.ts': {
              file: {
                contents: `import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
`
              }
            }
          }
        }
      }
    },
    public: {
      directory: {}
    }
  };
}

export async function initializeProjectTemplate(
  projectId: string,
  framework: 'next' | 'vite' = 'next'
): Promise<void> {
  const fs = require('fs/promises');
  const path = require('path');

  const projectPath = path.join(process.env.PROJECTS_DIR!, projectId);

  // Create project directory
  await fs.mkdir(projectPath, { recursive: true });

  // Generate template
  const template =
    framework === 'next'
      ? generateNextJsTemplate(projectId)
      : generateViteTemplate(projectId);

  // Write files
  await writeFileSystemTree(projectPath, template);
}

async function writeFileSystemTree(
  basePath: string,
  tree: FileSystemTree
): Promise<void> {
  const fs = require('fs/promises');
  const path = require('path');

  for (const [name, node] of Object.entries(tree)) {
    const fullPath = path.join(basePath, name);

    if ('directory' in node) {
      await fs.mkdir(fullPath, { recursive: true });
      await writeFileSystemTree(fullPath, node.directory);
    } else if ('file' in node) {
      await fs.writeFile(fullPath, node.file.contents, 'utf-8');
    }
  }
}

function generateViteTemplate(projectName: string): FileSystemTree {
  // Similar structure for Vite + React
  return {
    // ... Vite template structure
  } as FileSystemTree;
}
```

---

# 📦 II. STATE MANAGEMENT (Zustand Stores)

## 1. Chat Store

**File: `apps/web/stores/chat-store.ts`**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  name: string;
  parameters: Record<string, any>;
}

interface ChatState {
  messages: Message[];
  projectId: string | null;
  conversationId: string | null;
  isLoading: boolean;

  // Actions
  setProjectId: (id: string) => void;
  setConversationId: (id: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      projectId: null,
      conversationId: null,
      isLoading: false,

      setProjectId: (id) => set({ projectId: id }),

      setConversationId: (id) => set({ conversationId: id }),

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message]
        })),

      updateMessage: (id, updates) =>
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === id ? { ...msg, ...updates } : msg
          )
        })),

      clearMessages: () => set({ messages: [] }),

      setLoading: (loading) => set({ isLoading: loading })
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        messages: state.messages,
        projectId: state.projectId,
        conversationId: state.conversationId
      })
    }
  )
);
```

---

## 2. Preview Store

**File: `apps/web/stores/preview-store.ts`**

```typescript
import { create } from 'zustand';

export interface ConsoleLog {
  method: 'log' | 'warn' | 'error' | 'info';
  args: any[];
  timestamp: Date;
}

export interface NetworkRequest {
  method: string;
  url: string;
  status: number;
  timestamp: Date;
}

interface PreviewState {
  url: string;
  consoleLogs: ConsoleLog[];
  networkRequests: NetworkRequest[];

  // Actions
  setUrl: (url: string) => void;
  reload: () => void;
  addConsoleLog: (log: ConsoleLog) => void;
  addNetworkRequest: (request: NetworkRequest) => void;
  clearConsoleLogs: () => void;
  clearNetworkRequests: () => void;
}

export const usePreviewStore = create<PreviewState>((set) => ({
  url: '',
  consoleLogs: [],
  networkRequests: [],

  setUrl: (url) => set({ url }),

  reload: () => set((state) => ({ url: state.url + '?t=' + Date.now() })),

  addConsoleLog: (log) =>
    set((state) => ({
      consoleLogs: [...state.consoleLogs, log]
    })),

  addNetworkRequest: (request) =>
    set((state) => ({
      networkRequests: [...state.networkRequests, request]
    })),

  clearConsoleLogs: () => set({ consoleLogs: [] }),

  clearNetworkRequests: () => set({ networkRequests: [] })
}));
```

---

## 3. Theme Store

**File: `apps/web/stores/theme-store.ts`**

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
  };
  layout: {
    borderRadius: string;
    maxWidth: string;
  };
}

interface ThemeState {
  theme: Theme;
  updateTheme: (updates: Partial<Theme>) => void;
  resetTheme: () => void;
}

const defaultTheme: Theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    background: '#ffffff',
    foreground: '#000000'
  },
  typography: {
    fontFamily: 'Inter',
    fontSize: '16px'
  },
  layout: {
    borderRadius: '0.5rem',
    maxWidth: '1280px'
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: defaultTheme,

      updateTheme: (updates) =>
        set((state) => ({
          theme: {
            ...state.theme,
            ...updates,
            colors: {
              ...state.theme.colors,
              ...(updates.colors || {})
            },
            typography: {
              ...state.theme.typography,
              ...(updates.typography || {})
            },
            layout: {
              ...state.theme.layout,
              ...(updates.layout || {})
            }
          }
        })),

      resetTheme: () => set({ theme: defaultTheme })
    }),
    {
      name: 'theme-storage'
    }
  )
);
```

---

## 4. Project Store

**File: `apps/web/stores/project-store.ts`**

```typescript
import { create } from 'zustand';

export interface Project {
  id: string;
  name: string;
  description?: string;
  framework: 'next' | 'vite';
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;

  // Actions
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,

  setProjects: (projects) => set({ projects }),

  setCurrentProject: (project) => set({ currentProject: project }),

  addProject: (project) =>
    set((state) => ({
      projects: [...state.projects, project]
    })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
      currentProject:
        state.currentProject?.id === id
          ? { ...state.currentProject, ...updates }
          : state.currentProject
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject:
        state.currentProject?.id === id ? null : state.currentProject
    }))
}));
```

---

# 🗄️ III. DATABASE SCHEMA (Prisma)

**File: `packages/database/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String        @id @default(cuid())
  email         String        @unique
  name          String?
  avatar        String?
  passwordHash  String?

  // OAuth
  oauthProvider String?
  oauthId       String?

  // Subscription
  subscription  Subscription?

  // Relations
  projects      Project[]
  usage         Usage[]

  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([email])
}

model Subscription {
  id            String    @id @default(cuid())
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  plan          String    // 'free' | 'pro' | 'enterprise'
  status        String    @default("active") // 'active' | 'canceled' | 'past_due'

  // Limits
  monthlyTokens Int       @default(50000)
  monthlyProjects Int     @default(3)

  // Stripe
  stripeCustomerId       String?   @unique
  stripeSubscriptionId   String?   @unique
  stripePriceId          String?
  stripeCurrentPeriodEnd DateTime?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Project {
  id              String    @id @default(cuid())
  name            String
  description     String?

  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Framework
  framework       String    @default("next") // 'next' | 'vite' | 'remix'

  // Project data
  fileTree        Json      @default("{}")
  designSystem    Json      @default("{}")
  dependencies    Json      @default("{}")

  // Conversation
  conversationId  String?
  conversation    Conversation? @relation(fields: [conversationId], references: [id])

  // Deployments
  deployments     Deployment[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([userId])
}

model Conversation {
  id        String    @id @default(cuid())
  messages  Message[]
  projects  Project[]

  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id              String       @id @default(cuid())

  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  role            String       // 'user' | 'assistant' | 'system'
  content         String       @db.Text
  toolCalls       Json?

  createdAt       DateTime     @default(now())

  @@index([conversationId])
}

model Deployment {
  id          String    @id @default(cuid())

  projectId   String
  project     Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)

  provider    String    // 'vercel' | 'netlify' | 'cloudflare'
  url         String
  status      String    // 'pending' | 'building' | 'ready' | 'error'

  buildLogs   String?   @db.Text
  error       String?   @db.Text

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([projectId])
}

model Usage {
  id        String   @id @default(cuid())

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  tokens    Int
  type      String   // 'generation' | 'chat'

  timestamp DateTime @default(now())

  @@index([userId, timestamp])
}

model ApiKey {
  id        String   @id @default(cuid())
  key       String   @unique
  name      String

  userId    String

  lastUsed  DateTime?
  createdAt DateTime @default(now())

  @@index([userId])
}
```

---

# 🔐 IV. ENVIRONMENT CONFIGURATION

## 1. Backend .env

**File: `apps/api/.env.example`**

```env
# Server
NODE_ENV=development
PORT=3001

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/lovable

# Supabase (alternative to PostgreSQL)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_KEY=eyJxxx...

# AI Providers
AI_PROVIDER=openai  # 'openai' | 'anthropic'
AI_MODEL=gpt-4-turbo-preview

# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Redis (for caching)
REDIS_URL=redis://localhost:6379

# Projects Directory
PROJECTS_DIR=/var/projects

# Stripe (for billing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (Resend / SendGrid)
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@lovable.dev

# Deployment Providers
VERCEL_TOKEN=...
NETLIFY_TOKEN=...

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
POSTHOG_API_KEY=phc_...

# Vector DB (for semantic search)
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-west1-gcp
```

---

## 2. Frontend .env

**File: `apps/web/.env.local.example`**

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase (if using for auth)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Google Analytics
NEXT_PUBLIC_GA_ID=G-...

# Feature Flags
NEXT_PUBLIC_ENABLE_WEBCONTAINER=true
NEXT_PUBLIC_ENABLE_GITHUB_INTEGRATION=true
```

---

# 📝 V. PACKAGE.JSON CONFIGS

## 1. Root package.json (Monorepo)

**File: `package.json`**

```json
{
  "name": "lovable-clone",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "clean": "turbo run clean && rm -rf node_modules",
    "db:generate": "cd packages/database && npx prisma generate",
    "db:migrate": "cd packages/database && npx prisma migrate dev",
    "db:studio": "cd packages/database && npx prisma studio"
  },
  "devDependencies": {
    "turbo": "^1.13.0",
    "typescript": "^5.4.0",
    "prettier": "^3.2.0",
    "eslint": "^8.57.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

## 2. Turbo Config

**File: `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

---

# 🚀 VI. DOCKER CONFIGURATION

## 1. Dockerfile (API)

**File: `apps/api/Dockerfile`**

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nodejs

EXPOSE 3001

ENV PORT 3001

CMD ["node", "dist/index.js"]
```

---

## 2. Docker Compose

**File: `docker-compose.yml`**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: lovable
      POSTGRES_PASSWORD: password
      POSTGRES_DB: lovable
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - '3001:3001'
    environment:
      DATABASE_URL: postgresql://lovable:password@postgres:5432/lovable
      REDIS_URL: redis://redis:6379
      NODE_ENV: production
    depends_on:
      - postgres
      - redis
    volumes:
      - projects_data:/var/projects

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    ports:
      - '3000:3000'
    environment:
      NEXT_PUBLIC_API_URL: http://api:3001
    depends_on:
      - api

volumes:
  postgres_data:
  redis_data:
  projects_data:
```

---

# 📚 VII. TYPESCRIPT CONFIGS

## 1. Shared tsconfig

**File: `packages/config/tsconfig.json`**

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true
  }
}
```

---

**Hoàn tất! Giờ bạn có đầy đủ code templates để bắt đầu build Lovable Clone! 🎉**
