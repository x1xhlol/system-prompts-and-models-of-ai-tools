/**
 * Copies marketing assets into frontend/public so they work with ONLY Next.js (port 3000).
 * No FastAPI required for /dealix-marketing or /dealix-presentations.
 *
 * Usage (from salesflow-saas): node scripts/sync-marketing-to-public.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC_MARKETING = path.join(ROOT, "sales_assets");
const SRC_PRES = path.join(ROOT, "presentations", "dealix-2026-sectors");
const DEST_MARKETING = path.join(ROOT, "frontend", "public", "dealix-marketing");
const DEST_PRES = path.join(ROOT, "frontend", "public", "dealix-presentations");

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

function cpDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn("SKIP (missing):", src);
    return false;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  rmrf(dest);
  fs.cpSync(src, dest, { recursive: true });
  return true;
}

console.log("Dealix — sync marketing → frontend/public\n");

const ok1 = cpDir(SRC_MARKETING, DEST_MARKETING);
const ok2 = cpDir(SRC_PRES, DEST_PRES);

if (ok1) console.log("OK:", DEST_MARKETING);
if (ok2) console.log("OK:", DEST_PRES);

const SRC_STRATEGY_DOC = path.join(ROOT, "docs", "DEALIX_NEXT_LEVEL_MASTER_PLAN_AR.md");
const DEST_STRATEGY_DIR = path.join(ROOT, "frontend", "public", "strategy");
if (fs.existsSync(SRC_STRATEGY_DOC)) {
  fs.mkdirSync(DEST_STRATEGY_DIR, { recursive: true });
  fs.copyFileSync(
    SRC_STRATEGY_DOC,
    path.join(DEST_STRATEGY_DIR, "DEALIX_NEXT_LEVEL_MASTER_PLAN_AR.md")
  );
  console.log("OK:", path.join(DEST_STRATEGY_DIR, "DEALIX_NEXT_LEVEL_MASTER_PLAN_AR.md"));
} else {
  console.warn("SKIP strategy doc (missing):", SRC_STRATEGY_DOC);
}

const SRC_ULTIMATE = path.join(ROOT, "docs", "ULTIMATE_EXECUTION_MASTER_AR.md");
if (fs.existsSync(SRC_ULTIMATE)) {
  fs.mkdirSync(DEST_STRATEGY_DIR, { recursive: true });
  fs.copyFileSync(SRC_ULTIMATE, path.join(DEST_STRATEGY_DIR, "ULTIMATE_EXECUTION_MASTER_AR.md"));
  console.log("OK:", path.join(DEST_STRATEGY_DIR, "ULTIMATE_EXECUTION_MASTER_AR.md"));
} else {
  console.warn("SKIP ULTIMATE execution doc (missing):", SRC_ULTIMATE);
}

const SRC_INTEGRATION = path.join(ROOT, "docs", "INTEGRATION_MASTER_AR.md");
if (fs.existsSync(SRC_INTEGRATION)) {
  fs.mkdirSync(DEST_STRATEGY_DIR, { recursive: true });
  fs.copyFileSync(SRC_INTEGRATION, path.join(DEST_STRATEGY_DIR, "INTEGRATION_MASTER_AR.md"));
  console.log("OK:", path.join(DEST_STRATEGY_DIR, "INTEGRATION_MASTER_AR.md"));
} else {
  console.warn("SKIP INTEGRATION_MASTER doc (missing):", SRC_INTEGRATION);
}

const SRC_LEGAL = path.join(ROOT, "docs", "legal");
const DEST_LEGAL = path.join(DEST_STRATEGY_DIR, "legal");
if (fs.existsSync(SRC_LEGAL)) {
  fs.mkdirSync(DEST_LEGAL, { recursive: true });
  for (const f of fs.readdirSync(SRC_LEGAL)) {
    if (f.endsWith(".md")) {
      fs.copyFileSync(path.join(SRC_LEGAL, f), path.join(DEST_LEGAL, f));
    }
  }
  console.log("OK:", DEST_LEGAL);
} else {
  console.warn("SKIP legal docs (missing):", SRC_LEGAL);
}

const SRC_COMPETITIVE = path.join(ROOT, "docs", "COMPETITIVE_MATRIX_AR.md");
if (fs.existsSync(SRC_COMPETITIVE)) {
  fs.mkdirSync(DEST_STRATEGY_DIR, { recursive: true });
  fs.copyFileSync(SRC_COMPETITIVE, path.join(DEST_STRATEGY_DIR, "COMPETITIVE_MATRIX_AR.md"));
  console.log("OK:", path.join(DEST_STRATEGY_DIR, "COMPETITIVE_MATRIX_AR.md"));
} else {
  console.warn("SKIP competitive matrix (missing):", SRC_COMPETITIVE);
}

const readme = path.join(DEST_MARKETING, "LOCAL-ONLY-NEXT.txt");
fs.writeFileSync(
  readme,
  [
    "هذه الملفات تُنسَخ من sales_assets إلى مجلد public في الفرونت إند.",
    "",
    "التشغيل المحلي (بدون خادم FastAPI على 8000):",
    "  cd frontend",
    "  npm run dev",
    "",
    "ثم افتح في المتصفح:",
    "  http://localhost:3000/dealix-marketing/",
    "  http://localhost:3000/dealix-presentations/",
    "  http://localhost:3000/resources",
    "  http://localhost:3000/strategy",
    "  http://localhost:3000/strategy/legal/ (وثائق قانونية بعد المزامنة)",
    "  http://localhost:3000/strategy/COMPETITIVE_MATRIX_AR.md",
    "",
    "لتحديث النسخ بعد تعديل الملفات الأصلية:",
    "  node scripts/sync-marketing-to-public.cjs",
    "",
    "للرفع على GitHub: commit مجلدات public/dealix-* بعد المزامنة.",
    "",
  ].join("\r\n"),
  "utf8"
);

console.log("\nDone. Run: cd frontend && npm run dev");
