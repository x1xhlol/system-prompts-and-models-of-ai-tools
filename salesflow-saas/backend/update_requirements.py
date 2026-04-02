"""
Dealix requirements.txt — Production Grade
كل الأدوات المطلوبة للمشروع
"""

requirements = """
# ── Core FastAPI Stack ────────────────────────────────────────
fastapi==0.115.5
uvicorn[standard]==0.32.1
pydantic==2.9.2
pydantic-settings==2.6.1
python-multipart==0.0.12

# ── Database ─────────────────────────────────────────────────
sqlalchemy==2.0.36
asyncpg==0.30.0
psycopg2-binary==2.9.10
alembic==1.14.0
pgvector==0.3.6

# ── AI & LLM ─────────────────────────────────────────────────
groq==0.12.0
openai==1.57.0
anthropic==0.39.0
langchain==0.3.9
langchain-groq==0.2.1
langchain-community==0.3.9
langgraph==0.2.53
crewai==0.80.0

# ── Agent Tools ───────────────────────────────────────────────
playwright==1.49.0
httpx==0.27.2
beautifulsoup4==4.12.3
lxml==5.3.0
fake-useragent==2.0.3

# ── WhatsApp & Messaging ─────────────────────────────────────
twilio==9.3.7
requests==2.32.3

# ── Calendar & Scheduling ────────────────────────────────────
setuptools>=69.0.0
python-dateutil==2.9.0

# ── Analytics & Data ─────────────────────────────────────────
pandas==2.2.3
numpy==2.1.3
scipy==1.14.1

# ── Security & Auth ──────────────────────────────────────────
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-decouple==3.8

# ── Queue & Cache ─────────────────────────────────────────────
redis==5.2.0
celery==5.4.0

# ── SSH & Deploy ─────────────────────────────────────────────
paramiko==3.5.0

# ── Monitoring ───────────────────────────────────────────────
sentry-sdk[fastapi]==2.19.0
prometheus-fastapi-instrumentator==7.0.0

# ── ZATCA & Saudi ────────────────────────────────────────────
qrcode==8.0
Pillow==11.0.0
xmltodict==0.14.2
"""

with open("requirements.txt", "w", encoding="utf-8") as f:
    f.write(requirements)

print("✅ requirements.txt updated")
