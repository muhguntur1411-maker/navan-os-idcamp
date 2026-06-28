"use client";

import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, TrendingUp, Zap, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [strategy, setStrategy] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true); // Pelindung agar mesin grafik (Recharts) tidak error
    async function fetchAndProcessData() {
      setIsLoading(true);
      const { data: sales } = await supabase.from('sales_metrics').select('item_name, quantity');
      
      if (sales && sales.length > 0) {
        const aggregated = sales.reduce((acc: any, curr: any) => {
          const name = curr.item_name.toUpperCase();
          acc[name] = (acc[name] || 0) + curr.quantity;
          return acc;
        }, {});
        
        const formattedData = Object.keys(aggregated).map(key => ({
          name: key,
          Total: aggregated[key]
        }));
        setChartData(formattedData);
      }
      setIsLoading(false);
    }
    fetchAndProcessData();
  }, []);

  const handleGenerateStrategy = async () => {
    if (chartData.length === 0) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salesData: chartData })
      });
      const data = await res.json();
      setStrategy(data.strategy);
    } catch (error) {
      setStrategy("Gagal menghasilkan strategi. Coba lagi.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isMounted) return null;

  return (
    <main className="flex min-h-screen flex-col bg-slate-50 p-4 md:p-8">
      <header className="flex justify-between items-center mb-8 max-w-4xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 text-slate-900 hover:text-blue-600 transition-colors font-medium">
          <ArrowLeft size={20} /> Kembali ke Chat
        </Link>
        <h1 className="font-bold text-2xl text-slate-900">Analisis Navan OS</h1>
      </header>

      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Area Grafik */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Total Penjualan Produk</h2>
          </div>
          
          {/* PERBAIKAN: Memaksa tinggi grafik ke 350px agar tidak bisa kolaps */}
          <div style={{ height: "350px", width: "100%" }}>
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-blue-600 font-medium">
                <Loader2 className="animate-spin mr-2" size={20} /> Menarik data dari Supabase...
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#0f172a" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#0f172a" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ backgroundColor: '#ffffff', color: '#0f172a', borderRadius: '8px', border: '1px solid #e2e8f0' }} itemStyle={{ color: '#0f172a', fontWeight: 'bold' }} />
                  <Bar dataKey="Total" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-xl">
                Belum ada data penjualan. Silakan input dari halaman chat.
              </div>
            )}
          </div>
        </div>

        {/* Area Strategi AI */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900"><Zap className="text-blue-600" /> AI Marketing Strategy</h2>
              <p className="text-slate-600 text-sm mt-1">Buat copywriting otomatis berdasarkan grafik penjualan di atas.</p>
            </div>
            <button 
              onClick={handleGenerateStrategy}
              disabled={isGenerating || chartData.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors disabled:bg-slate-400 flex items-center gap-2 shadow-sm"
            >
              {isGenerating ? <><Loader2 className="animate-spin" size={18} /> Berpikir...</> : "Generate Strategy"}
            </button>
          </div>

          {strategy && (
            <div className="mt-6 bg-white p-5 rounded-xl border border-blue-100 shadow-sm">
              <p className="whitespace-pre-line text-slate-900 leading-relaxed font-medium">{strategy}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}