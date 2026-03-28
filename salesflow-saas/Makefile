.PHONY: up down build logs migrate seed test

# Start all services
up:
	docker compose up -d

# Stop all services
down:
	docker compose down

# Build and start
build:
	docker compose up -d --build

# View logs
logs:
	docker compose logs -f

# Backend logs only
logs-backend:
	docker compose logs -f backend celery_worker

# Run database migrations
migrate:
	docker compose exec backend alembic upgrade head

# Create new migration
migration:
	docker compose exec backend alembic revision --autogenerate -m "$(msg)"

# Seed initial data
seed:
	docker compose exec backend python -m app.seeds.seed_data

# Run tests
test:
	docker compose exec backend pytest -v

# Restart backend only
restart-backend:
	docker compose restart backend celery_worker celery_beat

# Shell into backend
shell:
	docker compose exec backend bash

# Check service health
health:
	curl -s http://localhost:8000/api/v1/health | python3 -m json.tool
