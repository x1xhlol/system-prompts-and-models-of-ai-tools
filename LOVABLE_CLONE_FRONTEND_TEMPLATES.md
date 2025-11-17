# 🎨 Lovable Clone - Frontend Templates

> Complete React/Next.js component templates

---

# 💬 I. CHAT INTERFACE COMPONENTS

## 1. Main Chat Panel

**File: `apps/web/components/chat/chat-panel.tsx`**

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';
import { Send, Loader2 } from 'lucide-react';
import { useChatStore } from '@/stores/chat-store';
import { api } from '@/lib/api';

export function ChatPanel() {
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, addMessage, projectId, conversationId } = useChatStore();

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      timestamp: new Date()
    };

    addMessage(userMessage);
    setInput('');
    setIsStreaming(true);

    try {
      // Use EventSource for streaming
      const eventSource = new EventSource(
        `${process.env.NEXT_PUBLIC_API_URL}/api/chat/stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            message: input,
            projectId,
            conversationId
          })
        }
      );

      let assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: '',
        timestamp: new Date()
      };

      addMessage(assistantMessage);

      eventSource.onmessage = (event) => {
        if (event.data === '[DONE]') {
          eventSource.close();
          setIsStreaming(false);
          return;
        }

        const data = JSON.parse(event.data);

        if (data.token) {
          assistantMessage.content += data.token;
          // Update message in store
          useChatStore.getState().updateMessage(assistantMessage.id, {
            content: assistantMessage.content
          });
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsStreaming(false);
        console.error('Stream error');
      };
    } catch (error) {
      console.error('Send message error:', error);
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Chat</h2>
        <p className="text-sm text-muted-foreground">
          Describe what you want to build
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium mb-2">
                  Start a new conversation
                </p>
                <p className="text-sm">
                  Describe your app and I'll help you build it
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))
          )}

          {isStreaming && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build..."
            className="flex-1 min-h-[60px] max-h-[200px] resize-none"
            disabled={isStreaming}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            {isStreaming ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
```

---

## 2. Chat Message Component

**File: `apps/web/components/chat/chat-message.tsx`**

```typescript
'use client';

import { Message } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg',
        isUser ? 'bg-muted/50' : 'bg-background'
      )}
    >
      <Avatar className="h-8 w-8">
        {isUser ? (
          <>
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src="/lovable-logo.png" />
            <AvatarFallback>
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </>
        )}
      </Avatar>

      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            {isUser ? 'You' : 'Lovable'}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const language = match ? match[1] : '';

                  return !inline ? (
                    <CodeBlock
                      language={language}
                      code={String(children).replace(/\n$/, '')}
                    />
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.toolCalls.map((call, i) => (
              <div
                key={i}
                className="text-xs bg-muted p-2 rounded border"
              >
                <span className="font-mono text-primary">
                  {call.name}
                </span>
                <span className="text-muted-foreground ml-2">
                  {JSON.stringify(call.parameters)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
        onClick={copyToClipboard}
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>

      <SyntaxHighlighter
        language={language || 'typescript'}
        style={vscDarkPlus}
        customStyle={{
          borderRadius: '0.5rem',
          fontSize: '0.875rem'
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
```

---

# 🎨 II. LIVE PREVIEW COMPONENTS

## 1. Live Preview Panel

**File: `apps/web/components/preview/live-preview.tsx`**

```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  ExternalLink,
  Code
} from 'lucide-react';
import { usePreviewStore } from '@/stores/preview-store';
import { ConsolePanel } from './console-panel';
import { NetworkPanel } from './network-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Viewport = 'mobile' | 'tablet' | 'desktop';

const viewportSizes = {
  mobile: { width: 375, height: 667, icon: Smartphone },
  tablet: { width: 768, height: 1024, icon: Tablet },
  desktop: { width: 1440, height: 900, icon: Monitor }
};

export function LivePreview() {
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [scale, setScale] = useState(1);
  const [showDevTools, setShowDevTools] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { url, reload, consoleLogs, networkRequests } = usePreviewStore();

  // Calculate scale to fit viewport
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const { width, height } = viewportSizes[viewport];

    const scaleX = (container.clientWidth - 32) / width;
    const scaleY = (container.clientHeight - 100) / height;

    setScale(Math.min(scaleX, scaleY, 1));
  }, [viewport]);

  // Listen for console logs from iframe
  useEffect(() => {
    if (!iframeRef.current) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        usePreviewStore.getState().addConsoleLog({
          method: event.data.method,
          args: event.data.args,
          timestamp: new Date()
        });
      }

      if (event.data.type === 'network') {
        usePreviewStore.getState().addNetworkRequest({
          method: event.data.method,
          url: event.data.url,
          status: event.data.status,
          timestamp: new Date()
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRefresh = () => {
    reload();
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  };

  const handleOpenInNewTab = () => {
    window.open(url, '_blank');
  };

  const ViewportIcon = viewportSizes[viewport].icon;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          {/* Viewport selector */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            {(Object.keys(viewportSizes) as Viewport[]).map((v) => {
              const Icon = viewportSizes[v].icon;
              return (
                <Button
                  key={v}
                  variant={viewport === v ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewport(v)}
                  className="h-8 w-8 p-0"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>

          <div className="text-sm text-muted-foreground">
            {viewportSizes[viewport].width} × {viewportSizes[viewport].height}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDevTools(!showDevTools)}
          >
            <Code className="h-4 w-4 mr-2" />
            DevTools
          </Button>

          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm" onClick={handleOpenInNewTab}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Preview */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center bg-muted/20 p-4 overflow-auto"
        >
          {url ? (
            <div
              style={{
                width: viewportSizes[viewport].width,
                height: viewportSizes[viewport].height,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                transition: 'all 0.3s ease'
              }}
            >
              <iframe
                ref={iframeRef}
                src={url}
                className="w-full h-full bg-white rounded-lg shadow-2xl border"
                sandbox="allow-scripts allow-same-origin allow-forms"
                title="Preview"
              />
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Monitor className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No preview available</p>
              <p className="text-sm">
                Start coding to see your app come to life
              </p>
            </div>
          )}
        </div>

        {/* DevTools */}
        {showDevTools && (
          <div className="w-96 border-l">
            <Tabs defaultValue="console" className="h-full">
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="console">Console</TabsTrigger>
                <TabsTrigger value="network">Network</TabsTrigger>
              </TabsList>

              <TabsContent value="console" className="h-full">
                <ConsolePanel logs={consoleLogs} />
              </TabsContent>

              <TabsContent value="network" className="h-full">
                <NetworkPanel requests={networkRequests} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 2. Console Panel

**File: `apps/web/components/preview/console-panel.tsx`**

```typescript
'use client';

import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2, Info, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ConsoleLog {
  method: 'log' | 'warn' | 'error' | 'info';
  args: any[];
  timestamp: Date;
}

interface ConsolePanelProps {
  logs: ConsoleLog[];
}

export function ConsolePanel({ logs }: ConsolePanelProps) {
  const clearLogs = () => {
    // Clear logs in store
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <span className="text-sm font-medium">Console</span>
        <Button variant="ghost" size="sm" onClick={clearLogs}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No console logs
            </p>
          ) : (
            logs.map((log, i) => (
              <div
                key={i}
                className={cn(
                  'p-2 rounded text-xs font-mono border-l-2',
                  log.method === 'error' &&
                    'bg-destructive/10 border-destructive',
                  log.method === 'warn' &&
                    'bg-yellow-500/10 border-yellow-500',
                  log.method === 'info' &&
                    'bg-blue-500/10 border-blue-500',
                  log.method === 'log' && 'bg-muted border-muted-foreground'
                )}
              >
                <div className="flex items-start gap-2">
                  {log.method === 'error' && (
                    <XCircle className="h-3 w-3 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  {log.method === 'warn' && (
                    <AlertTriangle className="h-3 w-3 text-yellow-500 flex-shrink-0 mt-0.5" />
                  )}
                  {log.method === 'info' && (
                    <Info className="h-3 w-3 text-blue-500 flex-shrink-0 mt-0.5" />
                  )}

                  <div className="flex-1">
                    {log.args.map((arg, j) => (
                      <div key={j}>
                        {typeof arg === 'object'
                          ? JSON.stringify(arg, null, 2)
                          : String(arg)}
                      </div>
                    ))}
                  </div>

                  <span className="text-muted-foreground text-[10px]">
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
```

---

# 🎛️ III. SIDEBAR COMPONENTS

## 1. Main Sidebar

**File: `apps/web/components/sidebar/sidebar.tsx`**

```typescript
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, Palette, Folder, Settings } from 'lucide-react';
import { SectionsPanel } from './sections-panel';
import { ThemePanel } from './theme-panel';
import { FilesPanel } from './files-panel';
import { SettingsPanel } from './settings-panel';

export function Sidebar() {
  return (
    <aside className="w-80 border-r bg-background flex flex-col h-full">
      <Tabs defaultValue="sections" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start border-b rounded-none h-12">
          <TabsTrigger value="sections" className="flex-1">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="theme" className="flex-1">
            <Palette className="h-4 w-4 mr-2" />
            Theme
          </TabsTrigger>
          <TabsTrigger value="files" className="flex-1">
            <Folder className="h-4 w-4 mr-2" />
            Files
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="flex-1 overflow-hidden m-0 p-4">
          <SectionsPanel />
        </TabsContent>

        <TabsContent value="theme" className="flex-1 overflow-hidden m-0 p-4">
          <ThemePanel />
        </TabsContent>

        <TabsContent value="files" className="flex-1 overflow-hidden m-0 p-4">
          <FilesPanel />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
```

---

## 2. Sections Panel

**File: `apps/web/components/sidebar/sections-panel.tsx`**

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus } from 'lucide-react';
import { useChatStore } from '@/stores/chat-store';
import Image from 'next/image';

const sections = [
  {
    id: 'hero',
    name: 'Hero Section',
    description: 'Large header with CTA',
    preview: '/previews/hero.png',
    prompt: 'Add a hero section with a headline, subheadline, and call-to-action button'
  },
  {
    id: 'features',
    name: 'Features Grid',
    description: '3-column feature showcase',
    preview: '/previews/features.png',
    prompt: 'Add a features section with a 3-column grid showing product features'
  },
  {
    id: 'testimonials',
    name: 'Testimonials',
    description: 'Customer reviews carousel',
    preview: '/previews/testimonials.png',
    prompt: 'Add a testimonials section with customer reviews in a carousel'
  },
  {
    id: 'cta',
    name: 'Call to Action',
    description: 'Conversion-focused banner',
    preview: '/previews/cta.png',
    prompt: 'Add a call-to-action section with a compelling message and button'
  },
  {
    id: 'pricing',
    name: 'Pricing Table',
    description: 'Tiered pricing cards',
    preview: '/previews/pricing.png',
    prompt: 'Add a pricing section with 3 tier cards (Basic, Pro, Enterprise)'
  },
  {
    id: 'faq',
    name: 'FAQ',
    description: 'Frequently asked questions',
    preview: '/previews/faq.png',
    prompt: 'Add an FAQ section with collapsible questions and answers'
  },
  {
    id: 'contact',
    name: 'Contact Form',
    description: 'Get in touch form',
    preview: '/previews/contact.png',
    prompt: 'Add a contact section with a form (name, email, message fields)'
  },
  {
    id: 'footer',
    name: 'Footer',
    description: 'Site footer with links',
    preview: '/previews/footer.png',
    prompt: 'Add a footer section with navigation links, social media, and copyright'
  }
];

export function SectionsPanel() {
  const { addMessage, projectId } = useChatStore();

  const handleAddSection = (section: typeof sections[0]) => {
    // Add message to chat
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: section.prompt,
      timestamp: new Date()
    });

    // Trigger AI to generate section
    // This will be handled by the chat panel
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-semibold text-lg">Add Section</h3>
        <p className="text-sm text-muted-foreground">
          Click to add pre-built sections to your page
        </p>
      </div>

      <ScrollArea className="flex-1 -mx-4 px-4">
        <div className="space-y-3">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleAddSection(section)}
              className="w-full group relative overflow-hidden rounded-lg border bg-card hover:bg-accent transition-all"
            >
              <div className="aspect-video relative bg-muted">
                <Image
                  src={section.preview}
                  alt={section.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Plus className="h-8 w-8 text-white" />
                </div>
              </div>

              <div className="p-3 text-left">
                <h4 className="font-medium">{section.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {section.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
```

---

## 3. Theme Customizer

**File: `apps/web/components/sidebar/theme-panel.tsx`**

```typescript
'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useThemeStore } from '@/stores/theme-store';
import { Palette, Type, Layout } from 'lucide-react';

const fontFamilies = [
  'Inter',
  'Roboto',
  'Poppins',
  'Open Sans',
  'Lato',
  'Montserrat'
];

const borderRadiusPresets = [
  { name: 'None', value: '0' },
  { name: 'Small', value: '0.25rem' },
  { name: 'Medium', value: '0.5rem' },
  { name: 'Large', value: '1rem' },
  { name: 'Full', value: '9999px' }
];

export function ThemePanel() {
  const { theme, updateTheme } = useThemeStore();

  const handleColorChange = (key: string, value: string) => {
    updateTheme({
      colors: {
        ...theme.colors,
        [key]: value
      }
    });
  };

  return (
    <ScrollArea className="h-full -mx-4 px-4">
      <div className="space-y-6">
        {/* Colors */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Palette className="h-4 w-4" />
            <h3 className="font-semibold">Colors</h3>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="primary">Primary Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="primary"
                  type="color"
                  value={theme.colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="h-10 w-20 p-1"
                />
                <Input
                  type="text"
                  value={theme.colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="secondary">Secondary Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="secondary"
                  type="color"
                  value={theme.colors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="h-10 w-20 p-1"
                />
                <Input
                  type="text"
                  value={theme.colors.secondary}
                  onChange={(e) => handleColorChange('secondary', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="accent">Accent Color</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="accent"
                  type="color"
                  value={theme.colors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="h-10 w-20 p-1"
                />
                <Input
                  type="text"
                  value={theme.colors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Type className="h-4 w-4" />
            <h3 className="font-semibold">Typography</h3>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="fontFamily">Font Family</Label>
              <Select
                value={theme.typography.fontFamily}
                onValueChange={(value) =>
                  updateTheme({
                    typography: {
                      ...theme.typography,
                      fontFamily: value
                    }
                  })
                }
              >
                <SelectTrigger id="fontFamily" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fontSize">Base Font Size</Label>
              <Input
                id="fontSize"
                type="number"
                min="12"
                max="20"
                value={parseInt(theme.typography.fontSize)}
                onChange={(e) =>
                  updateTheme({
                    typography: {
                      ...theme.typography,
                      fontSize: `${e.target.value}px`
                    }
                  })
                }
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Layout */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Layout className="h-4 w-4" />
            <h3 className="font-semibold">Layout</h3>
          </div>

          <div className="space-y-3">
            <div>
              <Label>Border Radius</Label>
              <div className="grid grid-cols-5 gap-2 mt-1">
                {borderRadiusPresets.map((preset) => (
                  <Button
                    key={preset.value}
                    variant={
                      theme.layout.borderRadius === preset.value
                        ? 'default'
                        : 'outline'
                    }
                    size="sm"
                    onClick={() =>
                      updateTheme({
                        layout: {
                          ...theme.layout,
                          borderRadius: preset.value
                        }
                      })
                    }
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="maxWidth">Max Container Width (px)</Label>
              <Input
                id="maxWidth"
                type="number"
                min="1024"
                max="1920"
                step="32"
                value={parseInt(theme.layout.maxWidth)}
                onChange={(e) =>
                  updateTheme({
                    layout: {
                      ...theme.layout,
                      maxWidth: `${e.target.value}px`
                    }
                  })
                }
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <Button className="w-full" onClick={() => {
          // Apply theme changes
          console.log('Applying theme:', theme);
        }}>
          Apply Theme
        </Button>
      </div>
    </ScrollArea>
  );
}
```

---

_Continue in next file with WebContainer, Stores, and Configuration templates..._
