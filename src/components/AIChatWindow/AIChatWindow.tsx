import { useState } from 'react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type Props = {
  userData: {
    messages: Message[];
  };
  setUserData: (data: any) => void;
  onClose: () => void;
};

const AIChatWindow = ({ userData, setUserData, onClose }: Props) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...userData.messages, userMessage];
    setUserData({ messages: updatedMessages });
    setInput('');
    setIsLoading(true);

    try {
      // Simulate AI response (replace with actual API call)
      const aiResponse: Message = {
        role: 'assistant',
        content: "I'm here to help you learn about personal finance. What specific topic would you like to know more about?"
      };
      
      setUserData({ messages: [...updatedMessages, aiResponse] });
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h3 className="font-semibold">AI Assistant</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>
      
      <div className="h-96 overflow-y-auto p-4">
        {userData.messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-center text-gray-500">AI is thinking...</div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChatWindow; 