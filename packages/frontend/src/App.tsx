import { useState } from 'react';

interface Message {
  text: string;
  isUser: boolean;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { text: input, isUser: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';
      const aiMessage: Message = { text: '', isUser: false };
      setMessages(prevMessages => [...prevMessages, aiMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        aiResponse += decoder.decode(value, { stream: true });
        setMessages(prevMessages =>
          prevMessages.map((msg, index) =>
            index === prevMessages.length - 1
              ? { ...msg, text: aiResponse }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = { text: 'Sorry, something went wrong.', isUser: false };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-md p-4">
        <h1 className="text-3xl font-bold text-center text-gray-800">AI Coding Agent</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex my-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-4 rounded-lg shadow-md max-w-lg ${
                  message.isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-800'
                }`}
              >
                <p style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start my-4">
              <div className="p-4 rounded-lg shadow-md bg-white text-gray-800">
                <p>Jules is thinking...</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <footer className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Ask me to code something..."
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 transition"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
