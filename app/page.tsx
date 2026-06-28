"use client";

import { useState } from 'react';
import { Send, BarChart2, Loader2 } from 'lucide-react';
import Link from 'next/link'; // Menambahkan fungsi navigasi

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Halo! Saya asisten Navan. Silakan ketik laporan penjualan atau sisa stok hari ini.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return; 
    
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', content: userText }]);
    setInput(''); 
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Koneksi terputus. Coba lagi.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-slate-50">
      <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="font-bold text-xl">Navan OS</h1>
        {/* Tombol yang sudah diubah menjadi Link aktif */}
        <Link href="/dashboard" className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg text-sm hover:bg-slate-700 transition-colors">
          <BarChart2 size={16} /> Dashboard
        </Link>
      </header>

      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-xl max-w-[80%] shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-blue-100 text-blue-900 rounded-tl-none whitespace-pre-line'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-xl bg-blue-100 text-blue-900 rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} /> AI sedang memproses...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            placeholder="Contoh: Laku 15 ayam geprek, cuaca hujan..." 
            className="flex-1 p-3 border border-slate-300 rounded-xl text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 flex items-center justify-center transition-colors disabled:bg-blue-400"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </main>
  );
}