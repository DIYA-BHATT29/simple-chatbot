'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

// OpenRouter/OpenAI uses 'assistant' instead of 'model'
// and 'content' instead of 'parts'
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    
    // Create history payload (OpenAI format)
    const historyPayload = [...messages, userMessage];

    setMessages(prev => [...prev, userMessage, { role: 'assistant', content: '' }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: historyPayload 
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();

      setMessages(prev => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        newMessages[lastIndex] = { role: 'assistant', content: data.text };
        return newMessages;
      });
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        newMessages[lastIndex] = { role: 'assistant', content: "Sorry, I encountered an error. Please check your connection or API key." };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-6 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-white">
      <div className="z-10 w-full max-w-4xl flex flex-col h-[85vh] bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="w-full bg-gray-900/50 p-6 border-b border-gray-800 flex items-center gap-4 backdrop-blur-sm">
          <div className="p-2 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-2xl shadow-lg shadow-green-500/20">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Simple Chatbot</h1>
            <p className="text-xs text-gray-400 font-medium tracking-wide">AI POWERED ASSISTANT</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 w-full overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border border-white/10 ${
                  msg.role === 'user' 
                    ? 'bg-blue-600/20 text-blue-400' 
                    : 'bg-green-600/20 text-green-400'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                
                {/* Message Bubble */}
                <div className={`p-4 rounded-2xl shadow-md ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm'
                    : 'bg-gray-800/80 border border-gray-700/50 text-gray-100 rounded-tl-sm'
                }`}>
                  {msg.content ? (
                    <div className="text-sm leading-relaxed">
                       <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <Loader2 className="animate-spin" size={16} />
                      <span className="text-xs font-medium">Thinking...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="w-full p-4 md:p-6 bg-gray-900/50 border-t border-gray-800 backdrop-blur-sm">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="relative flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-4 pr-14 bg-gray-800/50 border border-gray-700 text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent placeholder-gray-500 transition-all shadow-inner"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
