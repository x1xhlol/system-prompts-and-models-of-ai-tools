# Deployment Checklist — Dealix

## Pre-Deploy
- [ ] All tests pass: `pytest -v`
- [ ] No pending migrations: `alembic heads`
- [ ] Environment variables set in production
- [ ] Docker images built: `docker-compose build`
- [ ] Database backed up: `pg_dump dealix > backup.sql`

## Deploy
```bash
git pull origin main
docker-compose down && docker-compose build --no-cache && docker-compose up -d
docker-compose exec backend alembic upgrade head
curl -f https://api.dealix.sa/api/v1/health
```

## Post-Deploy
- [ ] Check Sentry for errors (15 min)
- [ ] Test login + Arabic UI
- [ ] Test WhatsApp send/receive
- [ ] Verify Celery workers active

## Rollback
```bash
docker-compose down
git checkout HEAD~1
docker-compose build && docker-compose up -d
docker-compose exec backend alembic downgrade -1
```
