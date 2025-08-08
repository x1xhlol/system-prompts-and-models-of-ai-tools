# Universal AI Agent – Artifact Bundle

Contents:
- `openapi/openapi.yaml`: OpenAPI 3.0 spec
- `postman/UniversalAI.postman_collection.json`: Postman collection (variables: `baseUrl`, `token`)
- `clients/node`: Node client (ESM), SSE streaming, WebSocket sample, rate-limited fetch
- `clients/python`: Python client (`requests`), SSE streaming
- `utils`: Rate-limit-safe helpers (`rate_limit.js`, `rate_limit.py`)
- `scripts/curl.sh`: Handy cURL commands

Quickstart:

1) Postman
- Import `postman/UniversalAI.postman_collection.json`
- Set variables `baseUrl`, `token`

2) OpenAPI
- Load `openapi/openapi.yaml` into Swagger UI/Insomnia/Stoplight

3) Node client
```bash
cd clients/node
npm install
BASE_URL=https://your-domain.com TOKEN=YOUR_TOKEN npm start
# WebSocket sample
BASE_URL=https://your-domain.com TOKEN=YOUR_TOKEN npm run ws
```

4) Python client
```bash
cd clients/python
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
BASE_URL=https://your-domain.com TOKEN=YOUR_TOKEN python examples.py
```

5) cURL
```bash
cd scripts
chmod +x curl.sh
BASE_URL=https://your-domain.com TOKEN=YOUR_TOKEN ./curl.sh chat "Hello"
```

Notes:
- Set `BASE_URL` and `TOKEN` environment variables for all samples.
- Streaming responses are SSE (Server-Sent Events) and parsed via `data: ...` lines.
- Retry/backoff on HTTP 429/5xx is implemented in the rate-limit helpers.