
import { defineConfig } from 'vitepress'
import path from 'path'
import fs from 'fs'

// Helper function to generate sidebar from file structure
function getSidebar(dir, sidebarTitle) {
  const root = path.join(process.cwd(), 'docs', dir)
  const directories = fs.readdirSync(root).filter(file => 
    fs.statSync(path.join(root, file)).isDirectory() && file !== '.vitepress'
  );

  const sidebar = {}
  const sidebarItems = []

  for (const d of directories) {
    const dirPath = path.join(root, d)
    const files = fs.readdirSync(dirPath)
      .filter(file => file.endsWith('.md'))
      .map(file => {
        const text = file.replace('.md', '');
        const link = `/${dir}/${d}/${file}`;
        return { text, link };
      });

    if (files.length > 0) {
        sidebarItems.push({
        text: d,
        collapsed: true,
        items: files
      });
    }
  }
  
  sidebar[`/${dir}/`] = [
    {
      text: sidebarTitle,
      items: sidebarItems
    }
  ];
  
  return sidebar;
}


export default defineConfig({
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }]
  ],
  title: 'AI System Prompts Hub',
  description: 'A collection of system prompts for various AI tools.',
  
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'GitHub', link: 'https://github.com/yancongya/system-prompts-and-models-of-ai-tools' }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yancongya' }
    ],
    footer: {
      copyright: 'Copyright © 2025-present yancongya'
    }
  },

  locales: {
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      title: 'AI System Prompts Hub',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          {
            text: 'Prompts',
            items: [
              { text: 'amp', link: '/en/amp/' },
              { text: 'anthropic', link: '/en/anthropic/' },
              { text: 'augment-code', link: '/en/augment-code/' },
              { text: 'claude-code', link: '/en/claude-code/' },
              { text: 'cluely', link: '/en/cluely/' },
              { text: 'codebuddy-prompts', link: '/en/codebuddy-prompts/' },
              { text: 'comet-assistant', link: '/en/comet-assistant/' },
              { text: 'cursor-prompts', link: '/en/cursor-prompts/' },
              { text: 'devin-ai', link: '/en/devin-ai/' },
              { text: 'dia', link: '/en/dia/' },
              { text: 'junie', link: '/en/junie/' },
              { text: 'kiro', link: '/en/kiro/' },
              { text: 'leapnew', link: '/en/leapnew/' },
              { text: 'lovable', link: '/en/lovable/' },
              { text: 'manus-agent-tools--prompt', link: '/en/manus-agent-tools--prompt/' },
              { text: 'notionai', link: '/en/notionai/' },
              { text: 'open-source-prompts', link: '/en/open-source-prompts/' },
              { text: 'orchidsapp', link: '/en/orchidsapp/' },
              { text: 'perplexity', link: '/en/perplexity/' },
              { text: 'poke', link: '/en/poke/' },
              { text: 'qoder', link: '/en/qoder/' },
              { text: 'replit', link: '/en/replit/' },
              { text: 'samedev', link: '/en/samedev/' },
              { text: 'trae', link: '/en/trae/' },
              { text: 'traycer-ai', link: '/en/traycer-ai/' },
              { text: 'v0-prompts-and-tools', link: '/en/v0-prompts-and-tools/' },
              { text: 'vscode-agent', link: '/en/vscode-agent/' },
              { text: 'warpdev', link: '/en/warpdev/' },
              { text: 'windsurf', link: '/en/windsurf/' },
              { text: 'xcode', link: '/en/xcode/' },
              { text: 'zai-code', link: '/en/zai-code/' }
            ]
          },
          { text: 'About', link: '/en/about' }
        ],
        sidebar: getSidebar('en', 'AI Tools'),
      }
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      title: 'AI 系统提示词中心',
      themeConfig: {
        nav: [
          { text: '首页', link: '/zh/' },
          {
            text: '提示词',
            items: [
              { text: 'amp', link: '/zh/amp/' },
              { text: 'anthropic', link: '/zh/anthropic/' },
              { text: 'augment-code', link: '/zh/augment-code/' },
              { text: 'claude-code', link: '/zh/claude-code/' },
              { text: 'cluely', link: '/zh/cluely/' },
              { text: 'codebuddy-prompts', link: '/zh/codebuddy-prompts/' },
              { text: 'cursor-prompts', link: '/zh/cursor-prompts/' },
              { text: 'devin-ai', link: '/zh/devin-ai/' },
              { text: 'dia', link: '/zh/dia/' },
              { text: 'junie', link: '/zh/junie/' },
              { text: 'kiro', link: '/zh/kiro/' },
              { text: 'leapnew', link: '/zh/leapnew/' },
              { text: 'lovable', link: '/zh/lovable/' },
              { text: 'manus-agent-tools--prompt', link: '/zh/manus-agent-tools--prompt/' },
              { text: 'notionai', link: '/zh/notionai/' },
              { text: 'open-source-prompts', link: '/zh/open-source-prompts/' },
              { text: 'comet-assistant', link: '/zh/comet-assistant/' },
              { text: 'qoder', link: '/zh/qoder/' },
              { text: 'orchidsapp', link: '/zh/orchidsapp/' },
              { text: 'perplexity', link: '/zh/perplexity/' },
              { text: 'poke', link: '/zh/poke/' },
              { text: 'replit', link: '/zh/replit/' },
              { text: 'samedev', link: '/zh/samedev/' },
              { text: 'trae', link: '/zh/trae/' },
              { text: 'traycer-ai', link: '/zh/traycer-ai/' },
              { text: 'v0-prompts-and-tools', link: '/zh/v0-prompts-and-tools/' },
              { text: 'vscode-agent', link: '/zh/vscode-agent/' },
              { text: 'warpdev', link: '/zh/warpdev/' },
              { text: 'windsurf', link: '/zh/windsurf/' },
              { text: 'xcode', link: '/zh/xcode/' },
              { text: 'zai-code', link: '/zh/zai-code/' }
            ]
          },
          { text: '关于', link: '/zh/about' }
        ],
        sidebar: getSidebar('zh', 'AI 工具'),
        outlineTitle: '在本页',
        docFooter: {
          prev: '上一篇',
          next: '下一篇'
        }
      }
    }
  }
})
