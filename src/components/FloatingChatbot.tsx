'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your Job Portal AI Assistant. I know about all the active jobs right now. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessages([...newMessages, { role: 'assistant', content: data.text }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again later.' }]);
      }
    } catch {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong. Please check your connection.' }]);
    }
    setLoading(false);
  };

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc mb-1">{line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>;
      if (line.trim() === '') return <div key={i} className="h-1" />;
      // Handle inline bold
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <p key={i} className="mb-1 leading-relaxed">
          {parts.map((part, j) => 
            part.startsWith('**') && part.endsWith('**') 
              ? <strong key={j}>{part.slice(2, -2)}</strong> 
              : part
          )}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-notion-blue text-white rounded-full flex items-center justify-center shadow-lg hover:bg-notion-blue/90 transition-all z-50 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-notion-bg border border-notion-border rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-notion-border bg-notion-blue-bg/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-notion-blue text-white flex items-center justify-center shadow-sm">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-notion-text text-sm">Job Assistant</h3>
              <p className="text-[11px] text-notion-text-tertiary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-notion-green"></span>
                Online and ready to help
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-notion-text-tertiary hover:text-notion-text transition-colors p-1 rounded-md hover:bg-notion-border-light">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-notion-text text-notion-bg' : 'bg-notion-blue text-white'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-notion-bg-secondary text-notion-text rounded-tr-sm border border-notion-border-light' : 'bg-notion-blue-bg/40 text-notion-text rounded-tl-sm border border-notion-blue/20'}`}>
                {msg.role === 'user' ? <p>{msg.content}</p> : <div className="text-[13px]">{renderMarkdown(msg.content)}</div>}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-notion-blue text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Bot size={16} />
              </div>
              <div className="max-w-[75%] p-4 rounded-2xl rounded-tl-sm bg-notion-blue-bg/40 border border-notion-blue/20 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-notion-blue/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-notion-blue/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-notion-blue/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3.5 border-t border-notion-border flex items-center gap-2 bg-notion-bg-secondary/50 rounded-b-2xl">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about available jobs..."
            className="flex-1 notion-input text-sm rounded-full py-2.5 px-4 shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-full bg-notion-blue text-white flex items-center justify-center flex-shrink-0 hover:bg-notion-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </form>
      </div>
    </>
  );
}
