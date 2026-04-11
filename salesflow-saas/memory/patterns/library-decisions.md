# Library Decisions — Dealix AI Revenue OS

**Type**: pattern
**Date**: 2026-04-11
**Status**: active

## Added Libraries (Priority Order)

### Immediate (Security + Core)
| Library | Why | Replaces |
|---------|-----|----------|
| `PyJWT[crypto]` | Active JWT library | `python-jose` (abandoned 3+ years) |
| `litellm` | Unified LLM provider with auto-fallback | Manual Groq→OpenAI switching |
| `sentry-sdk[fastapi]` | Production error tracking | None (was missing) |
| `slowapi` | API rate limiting | None (was missing) |
| `pydantic-extra-types[phonenumbers]` | Saudi +966 phone validation | None |

### Arabic & Saudi
| Library | Why |
|---------|-----|
| `camel-tools` | Best Arabic NLP (NYU Abu Dhabi) — morphology, NER, dialect detection |
| `pyarabic` | Arabic text normalization before NLP processing |
| `hijridate` | Official Umm al-Qura Hijri calendar for Saudi UX |
| `phonenumbers` | Format/validate Saudi mobile numbers for WhatsApp |

### Communication
| Library | Why |
|---------|-----|
| `pywa` | Direct WhatsApp Cloud API (cheaper than Twilio per-message) |
| `resend` | Transactional email with free tier |
| `weasyprint` | Arabic RTL PDF generation for invoices/quotes |

### Performance & Monitoring
| Library | Why |
|---------|-----|
| `fastapi-cache2` | Redis-backed response caching (90% DB load reduction) |
| `celery-redbeat` | Dynamic Celery scheduling from Redis (no restart needed) |
| `prometheus-fastapi-instrumentator` | Prometheus metrics for Grafana dashboards |
| `structlog` | JSON structured logging with tenant_id context |

### AI Enhancement
| Library | Why |
|---------|-----|
| `instructor` | Extract structured Pydantic models from LLM outputs |
| `statsforecast` | Fast time-series forecasting (500x faster than Prophet) |

### Testing
| Library | Why |
|---------|-----|
| `pytest-asyncio` | Test async FastAPI endpoints |
| `pytest-cov` | Coverage reporting |
| `factory-boy` | Test data factories for SQLAlchemy models |

## Rejected Libraries
| Library | Why Rejected |
|---------|-------------|
| `prophet` | Heavy dependencies (PyStan), statsforecast is faster |
| `elasticsearch` | Too heavy for current scale, use pg_trgm then Meilisearch |
| `apscheduler` | Already have Celery, celery-redbeat is better fit |
| `fatoora` | Abandoned (2022), built our own ZATCA QR in invoice_generator.py |

## Migration Notes
- **python-jose → PyJWT**: Minor API change. `jose.jwt.decode()` → `jwt.decode()`. Same RSA/HS256 support.
- **Manual LLM fallback → litellm**: Replace `services/llm/provider.py` logic with `litellm.completion()` + fallback list.
