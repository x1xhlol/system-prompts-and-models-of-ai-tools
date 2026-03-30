.PHONY: help up down restart logs status test setup pull-model

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Initial setup - copy .env and pull Ollama model
	@test -f .env || cp .env.example .env
	@echo "✓ .env file ready - edit it with your API keys"
	@mkdir -p data generated_cvs logs
	@echo "✓ Data directories created"

up: ## Start all services
	docker compose up -d
	@echo "✓ Services started"
	@echo "  API: http://localhost:8080"
	@echo "  Health: http://localhost:8080/health"
	@echo "  Dashboard: http://localhost:8080/dashboard/status"

down: ## Stop all services
	docker compose down

restart: ## Restart all services
	docker compose restart

logs: ## View logs (follow mode)
	docker compose logs -f

logs-api: ## View API logs
	docker compose logs -f brand-engine

logs-scheduler: ## View scheduler logs
	docker exec brand-engine tail -f /app/logs/scheduler.log

status: ## Check service status
	@docker compose ps
	@echo ""
	@curl -s http://localhost:8080/health 2>/dev/null | python3 -m json.tool || echo "API not responding"

pull-model: ## Pull the Ollama model
	docker exec brand-ollama ollama pull qwen2.5:7b
	@echo "✓ Model pulled"

test: ## Run tests
	python -m pytest tests/ -v

lint: ## Run linter
	python -m ruff check .

build: ## Build Docker image
	docker compose build

shell: ## Open shell in container
	docker exec -it brand-engine bash

db-shell: ## Open database shell
	docker exec -it brand-engine python -c "from storage.database import init_db; init_db(); print('DB initialized')"
