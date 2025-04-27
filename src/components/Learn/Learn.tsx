import { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { getFromLocalStorage, setToLocalStorage } from "@/lib/storage";

interface Message {
    id: string;
    content: string;
    sender: "user" | "assistant";
    timestamp: Date;
}

interface UserData {
    netSavings: number;
    categoriesOverBudget: number;
    budgeteerScore: number;
    budgets: Array<{
        category: string;
        budgeted: number;
        spent: number;
    }>;
    assets: {
        accounts: Array<{
            name: string;
            balance: number;
        }>;
        loans: Array<{
            name: string;
            balance: number;
        }>;
        investments: Array<{
            name: string;
            balance: number;
        }>;
    };
}

interface LearnProps {
    userData: UserData;
}

const fetchAIResponse = async (message: string, userData: UserData, onToken: (token: string) => void): Promise<void> => {
    try {
        console.log('Starting AI response fetch...');
        
        // Format user data for the prompt
        const userDataContext = `
User's Financial Overview:
- Net Savings: $${userData.netSavings.toFixed(2)}
- Categories Over Budget: ${userData.categoriesOverBudget}
- Budgeteer Score: ${userData.budgeteerScore}

Current Budgets:
${userData.budgets.map(b => `- ${b.category}: Budgeted $${b.budgeted.toFixed(2)}, Spent $${b.spent.toFixed(2)}`).join('\n')}

Assets:
Accounts: ${userData.assets.accounts.map(a => `${a.name} ($${a.balance.toFixed(2)})`).join(', ')}
Loans: ${userData.assets.loans.map(l => `${l.name} ($${l.balance.toFixed(2)})`).join(', ')}
Investments: ${userData.assets.investments.map(i => `${i.name} ($${i.balance.toFixed(2)})`).join(', ')}
`;

        console.log('Sending request to Ollama...');
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama3',
                prompt: `You are a helpful financial assistant. Here is the user's current financial situation:

${userDataContext}

The user asked: "${message}"

Please provide a detailed, accurate, and helpful response that takes into account their current financial situation. 
If the question is unclear, ask for clarification. 
If it's not related to finance, politely redirect to financial topics.`,
                stream: true,
            }),
        });

        console.log('Received response from Ollama:', response.status);
        
        if (!response.ok || !response.body) {
            console.error('Response not OK or no body:', response);
            throw new Error('Failed to fetch response from the server.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
            const { value, done: streamDone } = await reader.read();
            done = streamDone;
            
            if (value) {
                const chunk = decoder.decode(value);
                // console.log('Received chunk:', chunk);
                const lines = chunk.split('\n').filter(line => line.trim() !== '');
                
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        if (data.response) {
                            // console.log('Processing token:', data.response);
                            onToken(data.response);
                        }
                    } catch (e) {
                        console.error('Error parsing chunk:', e, 'Chunk:', line);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error in fetchAIResponse:', error);
        throw error;
    }
};

const Learn = ({ userData }: LearnProps) => {
    const [messages, setMessages] = useState<Message[]>(() => {
        const savedMessages = getFromLocalStorage("learnMessages", []);
        return savedMessages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
        }));
    });
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [currentStreamingMessage, setCurrentStreamingMessage] = useState<Message | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, currentStreamingMessage]);

    useEffect(() => {
        setToLocalStorage("learnMessages", messages);
    }, [messages]);

    // Initial greeting when component mounts
    useEffect(() => {
        if (!hasInitialized.current && messages.length === 0) {
            hasInitialized.current = true;
            setIsLoading(true);
            let aiMessageContent = "";
            const initialMessage: Message = {
                id: Date.now().toString(),
                content: "",
                sender: "assistant",
                timestamp: new Date()
            };
            setCurrentStreamingMessage(initialMessage);

            fetchAIResponse(
                "Hello! I'm your financial assistant. I can help you understand your finances and answer any questions you have about personal finance. What would you like to know?",
                userData,
                (token) => {
                    aiMessageContent += token;
                    setCurrentStreamingMessage(prev => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            content: aiMessageContent
                        };
                    });
                }
            )
                .then(() => {
                    setMessages(prev => [
                        ...prev,
                        {
                            ...initialMessage,
                            content: aiMessageContent
                        }
                    ]);
                    setCurrentStreamingMessage(null);
                })
                .catch(error => {
                    console.error('Error getting initial greeting:', error);
                    const errorMessage: Message = {
                        id: Date.now().toString(),
                        content: error instanceof Error && error.message.includes('Ollama')
                            ? "I can't connect to the AI service. Please make sure Ollama is running on your computer. You can start it by running 'ollama serve' in your terminal."
                            : "I apologize, but I'm having trouble connecting to the AI service. Please try again later.",
                        sender: "assistant",
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, errorMessage]);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [userData]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            content: input.trim(),
            sender: "user",
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        let aiMessageContent = "";
        const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: "",
            sender: "assistant",
            timestamp: new Date()
        };
        setCurrentStreamingMessage(aiMessage);

        try {
            await fetchAIResponse(input.trim(), userData, (token) => {
                aiMessageContent += token;
                setCurrentStreamingMessage(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        content: aiMessageContent
                    };
                });
            });

            setMessages(prev => [
                ...prev,
                {
                    ...aiMessage,
                    content: aiMessageContent
                }
            ]);
            setCurrentStreamingMessage(null);
        } catch (error) {
            console.error('Error getting AI response:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: error instanceof Error && error.message.includes('Ollama')
                    ? "I can't connect to the AI service. Please make sure Ollama is running on your computer. You can start it by running 'ollama serve' in your terminal."
                    : "I apologize, but I'm having trouble connecting to the AI service. Please try again later.",
                sender: "assistant",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setCurrentStreamingMessage(null);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                                message.sender === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                            }`}
                        >
                            <p className="text-sm whitespace-pre-line">{message.content}</p>
                            <span className="text-xs opacity-70 mt-1 block">
                                {message.timestamp.toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                ))}
                {currentStreamingMessage && (
                    <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg p-3 bg-muted">
                            <p className="text-sm whitespace-pre-line">
                                {currentStreamingMessage.content}
                                <span className="animate-pulse">▋</span>
                            </p>
                            <span className="text-xs opacity-70 mt-1 block">
                                {currentStreamingMessage.timestamp.toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                )}
                {isLoading && !currentStreamingMessage && (
                    <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-3">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="border-t p-4">
                <div className="flex items-center gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask a question about personal finance..."
                        className="flex-1 min-h-[40px] max-h-[120px] p-2 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={1}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Learn; 