# Deployment Notes

## Principles

- **Secrets live outside Git.** All credentials are injected via environment variables or a secret manager at deploy time.
- **SSL lives outside the repo.** Certificates are provisioned on the host or via a cloud load balancer. Never commit `.pem`, `.key`, or `.crt` files.
- **Infrastructure as config, not code secrets.** `docker-compose.yml` and Nginx configs reference environment variables, not hardcoded values.

## Deployment Order

Follow this sequence for a clean deployment:

```
1. Validate environment
   - Confirm .env is populated (never committed)
   - Verify database connection string
   - Verify Redis connection string
   - Verify WhatsApp API credentials
   - Verify AI provider API keys

2. Start database and cache
   - docker-compose up -d postgres redis
   - Wait for health checks to pass
   - Run migrations: docker-compose exec backend alembic upgrade head

3. Start backend
   - docker-compose up -d backend
   - Verify: curl http://localhost:8000/api/v1/health

4. Health check
   - GET /api/v1/health must return {"status": "ok"}
   - Confirm database and Redis connectivity in response

5. Start frontend
   - docker-compose up -d frontend
   - Verify: curl http://localhost:3000

6. Start workers
   - docker-compose up -d celery-worker celery-beat
   - Verify workers register with Redis broker

7. Start reverse proxy
   - docker-compose up -d nginx
   - Verify routing: https://yourdomain.com -> frontend
   - Verify routing: https://yourdomain.com/api -> backend

8. SSL termination
   - Handled at Nginx or cloud load balancer level
   - Certbot or managed certificates (not stored in repo)
   - Verify HTTPS redirect and certificate validity
```

## Rollback

1. Identify the failing service via logs: `docker-compose logs <service>`
2. Roll back the container image to the previous tag
3. If a migration caused the issue, run `alembic downgrade -1`
4. Restart affected services: `docker-compose up -d <service>`

## Monitoring

- Application logs: `docker-compose logs -f backend`
- Worker logs: `docker-compose logs -f celery-worker`
- Database: monitor connection pool and query latency
- Redis: monitor memory usage and queue depth
