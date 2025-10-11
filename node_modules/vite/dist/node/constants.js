import path, { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const { version } = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url)).toString()
);
const VERSION = version;
const DEFAULT_MAIN_FIELDS = [
  "browser",
  "module",
  "jsnext:main",
  // moment still uses this...
  "jsnext"
];
const ESBUILD_MODULES_TARGET = [
  "es2020",
  // support import.meta.url
  "edge88",
  "firefox78",
  "chrome87",
  "safari14"
];
const DEFAULT_EXTENSIONS = [
  ".mjs",
  ".js",
  ".mts",
  ".ts",
  ".jsx",
  ".tsx",
  ".json"
];
const DEFAULT_CONFIG_FILES = [
  "vite.config.js",
  "vite.config.mjs",
  "vite.config.ts",
  "vite.config.cjs",
  "vite.config.mts",
  "vite.config.cts"
];
const JS_TYPES_RE = /\.(?:j|t)sx?$|\.mjs$/;
const CSS_LANGS_RE = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/;
const OPTIMIZABLE_ENTRY_RE = /\.[cm]?[jt]s$/;
const SPECIAL_QUERY_RE = /[?&](?:worker|sharedworker|raw|url)\b/;
const FS_PREFIX = `/@fs/`;
const CLIENT_PUBLIC_PATH = `/@vite/client`;
const ENV_PUBLIC_PATH = `/@vite/env`;
const VITE_PACKAGE_DIR = resolve(
  // import.meta.url is `dist/node/constants.js` after bundle
  fileURLToPath(import.meta.url),
  "../../.."
);
const CLIENT_ENTRY = resolve(VITE_PACKAGE_DIR, "dist/client/client.mjs");
const ENV_ENTRY = resolve(VITE_PACKAGE_DIR, "dist/client/env.mjs");
const CLIENT_DIR = path.dirname(CLIENT_ENTRY);
const KNOWN_ASSET_TYPES = [
  // images
  "apng",
  "bmp",
  "png",
  "jpe?g",
  "jfif",
  "pjpeg",
  "pjp",
  "gif",
  "svg",
  "ico",
  "webp",
  "avif",
  // media
  "mp4",
  "webm",
  "ogg",
  "mp3",
  "wav",
  "flac",
  "aac",
  "opus",
  "mov",
  "m4a",
  "vtt",
  // fonts
  "woff2?",
  "eot",
  "ttf",
  "otf",
  // other
  "webmanifest",
  "pdf",
  "txt"
];
const DEFAULT_ASSETS_RE = new RegExp(
  `\\.(` + KNOWN_ASSET_TYPES.join("|") + `)(\\?.*)?$`
);
const DEP_VERSION_RE = /[?&](v=[\w.-]+)\b/;
const loopbackHosts = /* @__PURE__ */ new Set([
  "localhost",
  "127.0.0.1",
  "::1",
  "0000:0000:0000:0000:0000:0000:0000:0001"
]);
const wildcardHosts = /* @__PURE__ */ new Set([
  "0.0.0.0",
  "::",
  "0000:0000:0000:0000:0000:0000:0000:0000"
]);
const DEFAULT_DEV_PORT = 5173;
const DEFAULT_PREVIEW_PORT = 4173;
const DEFAULT_ASSETS_INLINE_LIMIT = 4096;
const defaultAllowedOrigins = /^https?:\/\/(?:(?:[^:]+\.)?localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/;
const METADATA_FILENAME = "_metadata.json";

export { CLIENT_DIR, CLIENT_ENTRY, CLIENT_PUBLIC_PATH, CSS_LANGS_RE, DEFAULT_ASSETS_INLINE_LIMIT, DEFAULT_ASSETS_RE, DEFAULT_CONFIG_FILES, DEFAULT_DEV_PORT, DEFAULT_EXTENSIONS, DEFAULT_MAIN_FIELDS, DEFAULT_PREVIEW_PORT, DEP_VERSION_RE, ENV_ENTRY, ENV_PUBLIC_PATH, ESBUILD_MODULES_TARGET, FS_PREFIX, JS_TYPES_RE, KNOWN_ASSET_TYPES, METADATA_FILENAME, OPTIMIZABLE_ENTRY_RE, SPECIAL_QUERY_RE, VERSION, VITE_PACKAGE_DIR, defaultAllowedOrigins, loopbackHosts, wildcardHosts };
