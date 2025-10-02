import UniversalAIClient from './client.js';

const BASE_URL = process.env.BASE_URL || 'https://your-domain.com';
const TOKEN = process.env.TOKEN || 'YOUR_TOKEN';

const client = new UniversalAIClient(BASE_URL, TOKEN);

async function main() {
  console.log('Chat:');
  const chat = await client.chat('Hello, how are you?', { optimizePrompt: true });
  console.log(chat);

  console.log('\nStreaming:');
  await client.streamChat('Tell me a short story.', (chunk) => {
    if (chunk.type === 'chunk') process.stdout.write(chunk.content);
    if (chunk.type === 'end') console.log('\n[stream end]', chunk.metadata);
  });

  console.log('\nRAG Search:');
  const search = await client.ragSearch('machine learning algorithms', { collection: 'knowledge_base', limit: 3 });
  console.log(search.results?.map(r => ({ id: r.id, score: r.score })));

  console.log('\nPlugin Execute:');
  const plugin = await client.executePlugin('web-scraper', 'scrape', { url: 'https://example.com', selector: '.content', format: 'text' });
  console.log(plugin);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});