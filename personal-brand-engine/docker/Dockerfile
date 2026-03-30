FROM python:3.12-slim

# System deps for weasyprint (CV PDF generation)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    libcairo2 \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directories
RUN mkdir -p /app/data /app/generated_cvs /app/logs

# Supervisor config
COPY docker/supervisord.conf /etc/supervisor/conf.d/brand-engine.conf

EXPOSE 8080

CMD ["supervisord", "-n", "-c", "/etc/supervisor/conf.d/brand-engine.conf"]
