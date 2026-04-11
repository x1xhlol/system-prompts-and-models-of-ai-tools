# Operations Schedule — Dealix AI Revenue OS

**Date**: 2026-04-11 | **Status**: active

## Daily Operations (يومي)

| الوقت | المهمة | المسؤول |
|-------|--------|---------|
| 08:00 | فحص صحة جميع الخدمات (Docker, DB, Redis, Celery) | ops |
| 08:15 | مراجعة أخطاء Sentry الجديدة | ops |
| 08:30 | فحص صحة مزودي الاستدلال المحلي | ops |
| 09:00 | مراجعة تقرير المبيعات اليومي التلقائي | founder |
| 12:00 | فحص Celery Beat tasks (sequences, follow-ups) | ops |
| 16:00 | مراجعة tool verification logs — أي contradictions؟ | ops |
| 17:00 | فحص memory sync وwiki health | knowledge |

### أوامر الفحص اليومي:
```bash
# Health check
curl -f https://api.dealix.sa/api/v1/health

# Celery workers
docker compose exec celery-worker celery -A app.workers inspect active

# Sentry errors (last 24h)
# Check https://sentry.io/organizations/dealix/

# Tool verification contradictions
curl https://api.dealix.sa/api/v1/hermes/health
```

## Weekly Operations (أسبوعي — كل أحد)

| المهمة | المسؤول |
|--------|---------|
| تشغيل فحص Shannon الأمني على staging | security |
| مراجعة مزودي LLM: تكلفة + أداء + استقرار | ops |
| مقارنة local vs cloud: أي المهام أنسب محلياً؟ | ops |
| مراجعة الـ runs الفاشلة ومعرفة السبب الجذري | ops |
| مراجعة الإجراءات المتناقضة (contradicted actions) | security |
| تنظيف الذاكرة: حذف duplicates + archive stale | knowledge |
| مراجعة التكلفة الأسبوعية (هدف: < $50) | founder |
| مراجعة drift الأوامر والمهارات | ops |

### أوامر الفحص الأسبوعي:
```bash
# Shannon security scan
curl -X POST https://api.dealix.sa/api/v1/hermes/security/scan \
  -H "Content-Type: application/json" \
  -d '{"environment": "staging", "base_url": "https://staging.dealix.sa"}'

# Cost report
curl https://api.dealix.sa/api/v1/hermes/cost?period=weekly

# Self-improvement cycle
curl -X POST https://api.dealix.sa/api/v1/hermes/improvements/cycle

# Executive summary
curl https://api.dealix.sa/api/v1/hermes/executive-summary?period=weekly
```

## Monthly Operations (شهري — أول أحد من كل شهر)

| المهمة | المسؤول |
|--------|---------|
| مراجعة انحراف المعمارية (architecture drift) | ops |
| مراجعة عملية الإطلاق والتحسين | ops |
| تدريب rollback drill (استعادة من النسخة الاحتياطية) | ops |
| تدريب backup/restore drill | ops |
| إعادة benchmark لمزودي LLM | ops |
| مراجعة انحراف نظام التصميم | delivery |
| مراجعة وإعادة هيكلة سير العمل | founder |
| تحديث ICP وstrategy بناءً على بيانات الشهر | founder |
| مراجعة PDPL compliance checklist | security |
| تقرير أداء شهري للمستثمرين/المؤسسين | founder |

### أوامر الفحص الشهري:
```bash
# Full health report
curl https://api.dealix.sa/api/v1/hermes/health

# Knowledge brain lint
# Run via Hermes: identify stale/orphan/duplicate wiki pages

# Database backup test
pg_dump dealix > /tmp/test_restore.sql
psql -d dealix_test < /tmp/test_restore.sql
rm /tmp/test_restore.sql

# Provider benchmark rerun
# Compare Groq vs OpenAI vs local on 50 test queries
```

## Emergency Procedures

### Production Down
1. Check Docker: `docker compose ps`
2. Check logs: `docker compose logs -f backend --since 5m`
3. Restart if needed: `docker compose restart backend`
4. If persistent: rollback to last known good commit
5. Notify team in communication channel

### Data Breach Suspicion
1. Immediately notify security profile
2. Check audit logs for unauthorized access
3. Check PDPL consent logs for anomalies
4. Run Shannon emergency scan on affected area
5. Prepare SDAIA notification if confirmed (within 72 hours)

### Cost Spike
1. Check observability: `GET /hermes/cost?period=hourly`
2. Identify expensive workflow
3. Pause autopilot if needed
4. Switch to local inference for non-critical tasks
5. Review and optimize the expensive workflow
