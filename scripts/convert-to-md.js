const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const srcDir = '.';  // 原仓库根（英文源）
const docsDir = './docs';

// 清理旧 docs
if (fs.existsSync(docsDir)) {
  try {
    fs.rmSync(docsDir, { recursive: true, force: true });
    console.log('清理旧 docs/。');
  } catch (e) {
    console.warn(`清理失败: ${e.message}。继续。`);
  }
}
fs.mkdirSync(docsDir, { recursive: true });

// 创建语言子目录
const langDirs = ['en', 'zh'];
langDirs.forEach(lang => {
  fs.mkdirSync(path.join(docsDir, lang), { recursive: true });
});

// 文本扩展
const textExts = ['.txt', '.json', '.yaml', '.yml', '.md', '.markdown', '.config', '.prompt', '.log'];

// 资源扩展（直接复制）
const resourceExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf', '.zip', '.exe', '.html'];

// README 模式匹配（优先重命名到 index.md）
const readmePatterns = ['readme.md', 'readme.txt', 'README.md', 'README.txt'];

const products = fs.readdirSync(srcDir)
  .filter(dir => fs.statSync(path.join(srcDir, dir)).isDirectory() && !['docs', 'scripts', '.git', '.github', 'node_modules'].includes(dir));

let enNavItems = '';
let zhNavItems = '';
let enSidebarChildren = '';
let zhSidebarChildren = '';

products.forEach(product => {
  const productSrc = path.join(srcDir, product);
  const productSlug = product.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  // 英文版
  const enDocs = path.join(docsDir, 'en', productSlug);
  fs.mkdirSync(enDocs, { recursive: true });
  copyAndConvert(productSrc, enDocs, 'en', product);

  // 中文版：直接复制英文版结构（用户手动翻译）
  const zhDocs = path.join(docsDir, 'zh', productSlug);
  fs.mkdirSync(zhDocs, { recursive: true });
  copyDir(enDocs, zhDocs);  // 复制整个 en/ 到 zh/

  console.log(`复制模板: ${product} (en -> zh，手动翻译 zh/ 中的 .md)`);

  // 更新 nav/sidebar
  enNavItems += `{ text: '${product}', link: '/en/${productSlug}/' }, `;
  enSidebarChildren += `{ text: '${product}', link: '/en/${productSlug}/' }, `;
  zhNavItems += `{ text: '${product}', link: '/zh/${productSlug}/' }, `;
  zhSidebarChildren += `{ text: '${product}', link: '/zh/${productSlug}/' }, `;
  console.log(`完成: ${product}`);
});

// 复制函数（文本转 MD，资源复制，重命名 README 到 index.md）
function copyAndConvert(src, dest, lang, product) {
  function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });
    const items = fs.readdirSync(src);
    let readmeFile = null;
    items.forEach(item => {
      const srcPath = path.join(src, item);
      const destPath = path.join(dest, item);
      const stat = fs.statSync(srcPath);
      if (stat.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        const ext = path.extname(item).toLowerCase();
        if (readmePatterns.some(pattern => item.toLowerCase() === pattern.toLowerCase())) {
          // 优先处理 README：重命名到 index.md
          readmeFile = srcPath;
          return;
        } else if (textExts.includes(ext)) {
          let content;
          try {
            content = fs.readFileSync(srcPath, 'utf8').trim();
            if (content.includes('\x00') || content.includes('IHDR')) return;
          } catch (e) {
            console.warn(`读取失败 ${srcPath}`);
            return;
          }

          let rendered;
          if (ext === '.md' || ext === '.markdown') {
            rendered = content;
          } else if (ext === '.txt' || ext === '.prompt' || ext === '.log') {
            rendered = `## ${item}\n\n\`\`\`text\n${content}\n\`\`\``;
          } else if (ext === '.json') {
            try {
              rendered = `## ${item}\n\n\`\`\`json\n${JSON.stringify(JSON.parse(content), null, 2)}\n\`\`\``;
            } catch (e) {
              rendered = `## ${item}\n\n\`\`\`json\n${content}\n\`\`\`\n\n:::warning 格式问题。\n:::`;
            }
          } else if (ext === '.yaml' || ext === '.yml') {
            try {
              rendered = `## ${item}\n\n\`\`\`yaml\n${yaml.dump(yaml.load(content), { indent: 2 })}\n\`\`\``;
            } catch (e) {
              rendered = `## ${item}\n\n\`\`\`yaml\n${content}\n\`\`\`\n\n:::warning 格式问题。\n:::`;
            }
          } else {
            rendered = `## ${item}\n\n\`\`\`\n${content}\n\`\`\``;
          }
          const mdFile = destPath.replace(/\.[^/.]+$/, '') + '.md';
          fs.writeFileSync(mdFile, rendered);
          console.log(`转换 ${lang}: ${path.relative(docsDir, mdFile)}`);
        } else if (resourceExts.includes(ext)) {
          fs.copyFileSync(srcPath, destPath);
          console.log(`复制资源 ${lang}: ${path.relative(docsDir, destPath)}`);
        } else {
          console.warn(`跳过 ${lang}: ${srcPath}`);
        }
      }
    });

    // 处理 README 重命名到 index.md
    if (readmeFile) {
      let content;
      try {
        content = fs.readFileSync(readmeFile, 'utf8').trim();
        if (content.includes('\x00') || content.includes('IHDR')) {
          console.warn(`跳过 README 二进制: ${readmeFile}`);
          return;
        }
      } catch (e) {
        console.warn(`读取 README 失败: ${e.message}`);
        return;
      }

      let rendered = content;
      const ext = path.extname(readmeFile).toLowerCase();
      if (ext === '.txt') {
        rendered = `# ${product} (${lang.toUpperCase()})\n\n${content}`;
      } else if (ext === '.md' || ext === '.markdown') {
        rendered = `# ${product} (${lang.toUpperCase()})\n\n${content}`;
      }

      fs.writeFileSync(path.join(dest, 'index.md'), rendered);
      console.log(`重命名 README 到 index.md: ${path.relative(docsDir, path.join(dest, 'index.md'))}`);
    } else {
      // 无 README，新建 index.md 列表
      let filesList = '## 内容列表\n\n';
      const allItems = fs.readdirSync(dest, { withFileTypes: true });
      allItems.forEach(item => {
        const itemPath = path.join(dest, item.name);
        const relativePath = `/${lang}/${path.relative(docsDir, itemPath).replace(/\\/g, '/')}`;
        if (item.isDirectory()) {
          filesList += `- 📁 [${item.name}](${relativePath}/)\n`;
        } else if (item.name.endsWith('.md')) {
          const origName = item.name.replace('.md', '');
          filesList += `- 📄 [${origName}](${relativePath})\n`;
        } else {
          const ext = path.extname(item.name).toLowerCase();
          if (['.png', '.jpg', '.jpeg', '.gif', '.svg'].includes(ext)) {
            filesList += `- 🖼️ ![${item.name}](${relativePath})\n`;
          } else if (ext === '.pdf') {
            filesList += `- 📕 [${item.name} (PDF)](${relativePath})\n`;
          } else {
            filesList += `- 🔗 [${item.name}](${relativePath})\n`;
          }
        }
      });

      const indexContent = `# ${product} (${lang.toUpperCase()})\n\n${filesList}\n\n*完整还原。*`;
      fs.writeFileSync(path.join(dest, 'index.md'), indexContent);
      console.log(`新建 index.md: ${path.relative(docsDir, path.join(dest, 'index.md'))}`);
    }
  }

  copyDir(src, dest);
}

// 简单复制目录（用于 zh/ 模板）
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const items = fs.readdirSync(src, { withFileTypes: true });
  items.forEach(item => {
    const srcPath = path.join(src, item.name);
    const destPath = path.join(dest, item.name);
    if (item.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`复制模板: ${path.relative(docsDir, destPath)}`);
    }
  });
}

// 英文首页（卡片布局）
const enHomeContent = `# AI System Prompts Hub (EN)

:::info
Explore AI tool system prompts and models.
:::

<div class="grid cards" grid="@lg:3 @2xl:4">

${products.map(product => {
  const slug = product.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `- **${product}**
  > AI tool prompts and resources
  > [Explore](/en/${slug}/)`;
}).join('\n\n')}

</div>

:::tip Update
Auto-synced from original repo.
:::`;
fs.writeFileSync(path.join(docsDir, 'en/index.md'), enHomeContent);

// 中文首页（初始同英文，翻译后手动调整）
const zhHomeContent = `# AI 系统提示词中心 (ZH)

:::info
探索 AI 工具系统提示词和模型。
:::

<div class="grid cards" grid="@lg:3 @2xl:4">

${products.map(product => {
  const slug = product.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `- **${product}**
  > AI 工具提示词与资源
  > [探索](/zh/${slug}/)`;
}).join('\n\n')}

</div>

:::tip 更新
基于原仓库自动同步。
:::`;
fs.writeFileSync(path.join(docsDir, 'zh/index.md'), zhHomeContent);

// 创建/更新 config.js（i18n 支持）
let configPath = path.join(docsDir, '.vitepress/config.js');
if (!fs.existsSync(configPath)) {
  fs.writeFileSync(configPath, `import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/',
  title: {
    en: 'AI System Prompts Hub',
    zh: 'AI 系统提示词中心'
  },
  description: {
    en: 'Collection of AI tool system prompts',
    zh: 'AI 工具系统提示词集合'
  },
  themeConfig: {
    nav: {
      en: [{ text: 'Home', link: '/en/' }],
      zh: [{ text: '首页', link: '/zh/' }]
    },
    sidebar: {
      '/en/': [{ text: 'Products', children: [] }],
      '/zh/': [{ text: '产品', children: [] }]
    },
    search: true,
    features: {
      contentCodeCopy: true
    }
  },
  locales: {
    en: { label: 'English' },
    zh: { label: '中文' }
  },
  markdown: {
    attrs: { leftDelimiter: '{', rightDelimiter: '}' }
  }
})`);
  console.log('创建 config.js。');
}

let config = fs.readFileSync(configPath, 'utf8');

// 更新英文 nav/sidebar
config = config.replace("nav: { en: [{ text: 'Home', link: '/en/' }] }", `nav: { en: [ { text: 'Home', link: '/en/' }, ${enNavItems.slice(0, -2)} ] }`);
config = config.replace("/en/': [{ text: 'Products', children: [] }]", `/en/': [{ text: 'Products', children: [ ${enSidebarChildren.slice(0, -2)} ] }]`);

// 更新中文
config = config.replace("nav: { zh: [{ text: '首页', link: '/zh/' }] }", `nav: { zh: [ { text: '首页', link: '/zh/' }, ${zhNavItems.slice(0, -2)} ] }`);
config = config.replace("/zh/': [{ text: '产品', children: [] }]", `/zh/': [{ text: '产品', children: [ ${zhSidebarChildren.slice(0, -2)} ] }]`);

fs.writeFileSync(configPath, config);

console.log(`\n完成！${products.length} 产品，双语模板 (zh/ 复制 en/，手动翻译 .md)。README 已重命名到 index.md。跑 npm run docs:dev 测试 (/en/ 或 /zh/)。`);