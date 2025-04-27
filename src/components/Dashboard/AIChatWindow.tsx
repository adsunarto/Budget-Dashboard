import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { getFromLocalStorage, setToLocalStorage } from "@/lib/storage";

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type UserData = {
  netSavings: number;
  categoriesOverBudget: number;
  budgeteerScore: number;
  budgets: any[];
  assets: any;
};

type AIChatWindowProps = {
  onClose: () => void;
  userData: UserData;
};

const AIChatWindow = ({ onClose, userData }: AIChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>(() => 
    getFromLocalStorage("chatMessages", [])
  );
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    setToLocalStorage("chatMessages", messages);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      // Add initial empty AI response
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const promptParts = [
        "You are a financial assistant that helps with budgeting. Your goal is to provide clear, specific insights about the user's finances.",
        "Keep responses brief (2-3 sentences) but include specific numbers and data points from the user's financial information.",
        "Focus on concrete facts from the data rather than general advice.",
        "Do not use phrases like 'Based on', 'According to', 'It looks like', or 'I can see that'.",
        "Do not thank the user or ask if they have other questions.",
        "Do not use markdown, emojis, or bullet points.",
        `User's financial data: ${JSON.stringify(userData)}`,
        "Recent conversation:",
        ...messages
          .filter((msg, index) => {
            // Find the last 2 user messages
            const userMessages = messages.filter(m => m.role === 'user');
            const lastTwoUserIndices = userMessages.slice(-2).map(m => messages.indexOf(m));
            
            // Include both the user message and the following AI response
            return lastTwoUserIndices.includes(index) || 
                   (index > 0 && lastTwoUserIndices.includes(index - 1));
          })
          .map(msg => `${msg.role}: ${msg.content}`),
        `Current question: ${input}`,
      ];

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3',
          prompt: promptParts.join(' '),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to fetch response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        try {
          const chunk = decoder.decode(value);
          const parsed = JSON.parse(chunk);
          aiResponse += parsed.response;
          // Update the last message (which is the AI response) with the new content
          setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: aiResponse }]);
        } catch (error) {
          console.error('Error parsing response chunk:', error);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 w-96 h-[600px] bg-white rounded-lg shadow-xl flex flex-col border-2 border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-gray-700">AI Assistant</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-[#475598] text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#475598]"
          />
          <button
            type="submit"
            className="bg-[#475598] text-white px-4 py-2 rounded-lg hover:bg-[#475598]/90"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChatWindow; 