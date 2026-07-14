import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';

export default function BBChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'bb' | 'user', text: string}[]>([
    { role: 'bb', text: "Hello. I am BB, your HAVEN Genesis guide. Are you in immediate danger, or do you need help locating a resource?" }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');

    setTimeout(async () => {
      try {
        await fetch('http://localhost:4000/api/public/cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'BB Chat Intake', description: userText })
        });
        setMessages(prev => [...prev, { role: 'bb', text: "I have recorded your situation and routed it to our secure matrix. A caseworker will review this shortly. Please check the map for immediate local resources." }]);
      } catch (e) {
        setMessages(prev => [...prev, { role: 'bb', text: "Network interference detected. Please try again." }]);
      }
    }, 1000);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-16 w-16 bg-blue-600 rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-500 transition-all z-50 border-2 border-blue-400 group"
      >
        <MessageSquare className="text-white h-8 w-8 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-2 -right-2 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span>
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 transform transition-all">
      <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center shadow-inner">
            <Bot className="text-white h-6 w-6" />
          </div>
          <div>
            <h3 className="text-white font-bold tracking-wide">BB Assistant</h3>
            <p className="text-green-400 text-xs flex items-center"><span className="h-2 w-2 bg-green-400 rounded-full mr-2"></span>Online</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="h-96 p-4 overflow-y-auto bg-slate-950 flex flex-col space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-md ${
              msg.role === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex items-center bg-slate-950 rounded-full border border-slate-700 p-1 pr-2 shadow-inner">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tell BB what you need..." 
            className="flex-1 bg-transparent text-white px-4 py-2 focus:outline-none text-sm placeholder-slate-500"
          />
          <button 
            onClick={handleSend}
            className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors"
          >
            <Send className="h-4 w-4 text-white ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
