import { bundledLanguages } from 'shiki';
import { r as runAsWorker } from './chunk-C-d2RJOW.js';
import 'node:crypto';
import 'node:fs';
import 'node:module';
import 'node:path';
import 'node:url';
import 'node:worker_threads';

async function resolveLang(lang) {
  return bundledLanguages[lang]?.().then((m) => m.default) || [];
}
runAsWorker(resolveLang);
