# Dealix — تشغيل الستاك الكامل بـ Docker Compose

من مجلد `salesflow-saas`:

```bash
cp .env.example .env
# عدّل .env (SECRET_KEY، كلمات مرور DB، مفاتيح اختيارية)

docker compose up -d --build
docker compose ps
```

## قاعدة البيانات والبذور

```bash
make migrate
make seed
```

## Celery

الخدمات: `celery_worker`, `celery_beat`. للتحقق:

```bash
docker compose logs -f celery_worker --tail=50
```

إذا كانت الميزات (تسلسلات، مهام مجدولة) لا تعمل، راجع أن Redis و`REDIS_URL` سليمة وأن الـ worker يعمل دون أخطاء متكررة.

## إيقاف التشغيل

```bash
docker compose down
# مع حذف الحجم (احذر — يمسح بيانات Postgres المحلية):
# docker compose down -v
```

## بيئة بدون Docker

على أجهزة التطوير التي لا تتوفر فيها Docker، استخدم نفس أوامر CI: `pytest` مع SQLite و`npm run build`، وتشغيل `uvicorn` محلياً مع Postgres/Redis منفصلين أو قاعدة SQLite للاختبارات فقط — لا يغني ذلك عن اختبار staging حقيقي قبل الإنتاج.
