Marketing → frontend/public (بدون FastAPI)
==========================================

المشكلة: روابط http://127.0.0.1:8000/dealix-marketing/ تفشل إذا الـ backend غير شغال.

الحل: نسخ الأصول إلى Next.js public/ وتصفحها على المنفذ 3000 فقط.

الأوامر:
  cd salesflow-saas
  node scripts/sync-marketing-to-public.cjs

أو من مجلد frontend (يُشغَّل تلقائياً قبل dev/build):
  npm run dev
  npm run build

الروابط بعد npm run dev:
  http://localhost:3000/dealix-marketing/
  http://localhost:3000/dealix-presentations/
  http://localhost:3000/resources

GitHub:
  git add frontend/public/dealix-marketing frontend/public/dealix-presentations
  git commit -m "chore: sync marketing assets"
  git push
