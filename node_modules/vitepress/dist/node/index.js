import { normalizePath } from 'vite';
export { loadEnv } from 'vite';
import { g as glob, c as createMarkdownRenderer, f as fs, m as matter, p as postcssPrefixSelector } from './chunk-D3CUZ4fa.js';
export { S as ScaffoldThemeType, b as build, q as createServer, a as defineConfig, e as defineConfigWithTheme, d as defineLoader, n as disposeMdItInstance, l as init, i as mergeConfig, r as resolveConfig, k as resolvePages, j as resolveSiteData, h as resolveUserConfig, s as scaffold, o as serve } from './chunk-D3CUZ4fa.js';
import path from 'node:path';
import 'node:crypto';
import 'node:module';
import 'node:url';
import 'node:process';
import 'node:fs/promises';
import 'node:fs';
import 'fs';
import 'node:events';
import 'node:stream';
import 'node:string_decoder';
import 'path';
import 'util';
import 'os';
import 'stream';
import 'readline';
import 'url';
import 'child_process';
import 'string_decoder';
import 'zlib';
import '@vue/shared';
import 'node:util';
import 'node:readline';
import 'node:tty';
import 'node:zlib';
import 'node:http';
import 'node:timers';
import 'node:querystring';
import 'tty';
import 'constants';
import 'assert';
import '@shikijs/transformers';
import 'shiki';
import './chunk-C-d2RJOW.js';
import 'node:worker_threads';
import 'minisearch';

function createContentLoader(pattern, {
  includeSrc,
  render,
  excerpt: renderExcerpt,
  transform,
  globOptions
} = {}) {
  const config = global.VITEPRESS_CONFIG;
  if (!config) {
    throw new Error(
      "content loader invoked without an active vitepress process, or before vitepress config is resolved."
    );
  }
  if (typeof pattern === "string") pattern = [pattern];
  pattern = pattern.map((p) => normalizePath(path.join(config.srcDir, p)));
  const cache = /* @__PURE__ */ new Map();
  return {
    watch: pattern,
    async load(files) {
      if (!files) {
        files = (await glob(pattern, {
          ignore: ["**/node_modules/**", "**/dist/**"],
          expandDirectories: false,
          ...globOptions
        })).sort();
      }
      const md = await createMarkdownRenderer(
        config.srcDir,
        config.markdown,
        config.site.base,
        config.logger
      );
      const raw = [];
      for (const file of files) {
        if (!file.endsWith(".md")) {
          continue;
        }
        const timestamp = fs.statSync(file).mtimeMs;
        const cached = cache.get(file);
        if (cached && timestamp === cached.timestamp) {
          raw.push(cached.data);
        } else {
          const src = fs.readFileSync(file, "utf-8");
          const { data: frontmatter, excerpt } = matter(
            src,
            // @ts-expect-error gray-matter types are wrong
            typeof renderExcerpt === "string" ? { excerpt_separator: renderExcerpt } : { excerpt: renderExcerpt }
          );
          const url = "/" + normalizePath(path.relative(config.srcDir, file)).replace(/(^|\/)index\.md$/, "$1").replace(/\.md$/, config.cleanUrls ? "" : ".html");
          const html = render ? md.render(src) : undefined;
          const renderedExcerpt = renderExcerpt ? excerpt && md.render(excerpt) : undefined;
          const data = {
            src: includeSrc ? src : undefined,
            html,
            frontmatter,
            excerpt: renderedExcerpt,
            url
          };
          cache.set(file, { data, timestamp });
          raw.push(data);
        }
      }
      return transform ? transform(raw) : raw;
    }
  };
}

function postcssIsolateStyles(options = {}) {
  return postcssPrefixSelector({
    prefix: ":not(:where(.vp-raw, .vp-raw *))",
    includeFiles: [/base\.css/],
    transform(prefix, _selector) {
      const [selector, pseudo = ""] = _selector.split(/(:\S*)$/);
      return selector + prefix + pseudo;
    },
    ...options
  });
}

export { createContentLoader, createMarkdownRenderer, postcssIsolateStyles };
