import WebSocket from 'ws';

const BASE_URL = process.env.BASE_URL || 'https://your-domain.com';
const TOKEN = process.env.TOKEN || 'YOUR_TOKEN';
const WS_URL = process.env.WS_URL || BASE_URL.replace(/^http/, 'ws');

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
  console.log('WS connected, authenticating...');
  ws.send(JSON.stringify({ type: 'auth', token: TOKEN }));
});

ws.on('message', (buf) => {
  const msgText = buf.toString();
  try {
    const data = JSON.parse(msgText);
    if (data.type === 'auth_success') {
      console.log('Auth OK, sending stream_chat');
      ws.send(JSON.stringify({ type: 'stream_chat', text: 'Tell me a story', optimizePrompt: true }));
    } else if (data.type === 'stream_chunk') {
      process.stdout.write(data.chunk);
    } else if (data.type === 'chat_response') {
      console.log('\n[chat_response]', data.message);
    } else if (data.type === 'error') {
      console.error('WS error:', data.message);
    } else {
      console.log('[WS]', data);
    }
  } catch (_) {
    console.log('[RAW]', msgText);
  }
});

ws.on('close', () => console.log('WS closed'));
ws.on('error', (err) => console.error('WS error', err));