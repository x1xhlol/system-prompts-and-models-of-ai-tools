# LLM Provider Routing Strategy

**Type**: provider-config
**Date**: 2026-04-11
**Status**: active

## Provider Stack

| Provider | Use Case | Latency | Cost | Arabic Quality |
|----------|----------|---------|------|----------------|
| Groq (llama-3.1-70b) | Fast classification, scoring | ~200ms | Free tier | Good |
| Groq (llama-3.1-8b) | Simple tasks, routing | ~100ms | Free tier | Adequate |
| OpenAI (gpt-4o-mini) | Fallback, complex reasoning | ~1-2s | $0.15/1M in | Very Good |
| OpenAI (gpt-4o) | Premium tasks, proposals | ~2-3s | $2.50/1M in | Excellent |
| Claude (via API) | Sales copy, proposals | ~2-3s | $3/1M in | Excellent |
| DeepSeek | Code generation | ~1-2s | Low | N/A |

## Routing Rules

1. **Intent Detection**: Groq llama-3.1-8b (speed priority)
2. **Lead Scoring**: Groq llama-3.1-70b (accuracy needed)
3. **Arabic NLP**: Groq llama-3.1-70b (good Arabic, fast)
4. **Message Writing**: OpenAI gpt-4o-mini (quality Arabic output)
5. **Proposal Generation**: Claude (best long-form Arabic)
6. **Conversation Summary**: Groq llama-3.1-70b (speed + quality balance)
7. **Forecasting**: OpenAI gpt-4o-mini (reasoning needed)

## Fallback Chain
Primary → Secondary → Emergency:
- Groq → OpenAI gpt-4o-mini → local cached response
- OpenAI → Groq → error with retry

## Cost Budget
- Target: < $50/month for 100 active tenants
- Groq free tier covers ~80% of requests
- OpenAI handles remaining 20% premium tasks
