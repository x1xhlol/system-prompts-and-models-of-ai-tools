from universal_ai_client import UniversalAIClient
import os

BASE_URL = os.environ.get('BASE_URL', 'https://your-domain.com')
TOKEN = os.environ.get('TOKEN', 'YOUR_TOKEN')

client = UniversalAIClient(BASE_URL, TOKEN)

print('Chat:')
print(client.chat('Hello, how are you?', optimizePrompt=True))

print('\nStreaming:')
for event in client.stream_chat('Tell me a short story.'):
    if event.get('type') == 'chunk':
        print(event.get('content', ''), end='', flush=True)
    elif event.get('type') == 'end':
        print('\n[stream end]', event.get('metadata'))
        break

print('\nRAG Search:')
search = client.rag_search('machine learning algorithms', collection='knowledge_base', limit=3)
print([{'id': r['id'], 'score': r['score']} for r in search.get('results', [])])

print('\nPlugin Execute:')
print(client.execute_plugin('web-scraper', 'scrape', { 'url': 'https://example.com', 'selector': '.content', 'format': 'text' }))