import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Kamu adalah sistem Navan OS untuk UMKM.
    Analisis laporan dari kasir ini: "${message}"

    Tugasmu:
    1. Buatkan balasan ramah untuk kasir.
    2. Ekstrak data barang apa saja yang terjual dan berapa jumlahnya.
    
    WAJIB BALAS HANYA DENGAN FORMAT JSON MURNI SEPERTI INI:
    {
      "reply": "Baik, 10 mie goreng sudah saya catat ya!",
      "items": [
        { "name": "mie goreng", "qty": 10 }
      ]
    }`;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    
    // X-RAY 1: Melihat hasil asli dari otak Gemini
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    console.log("=== 1. HASIL DARI AI ===");
    console.log(responseText);

    const aiData = JSON.parse(responseText);

    // X-RAY 2: Coba simpan ke tabel log mentah
    const { data: logData, error: logError } = await supabase
      .from('raw_chat_logs')
      .insert([{ chat_text: message, ai_processed: true }])
      .select()
      .single();

    if (logError) {
        console.error("=== 2. ERROR DATABASE (TABEL LOG) ===");
        console.error(logError);
    }

    // X-RAY 3: Coba simpan ke tabel metrik penjualan
    if (aiData.items && aiData.items.length > 0 && logData) {
        const salesToInsert = aiData.items.map((item: any) => ({
            item_name: item.name,
            quantity: item.qty,
            log_reference: logData.id
        }));
        
        const { error: salesError } = await supabase.from('sales_metrics').insert(salesToInsert);
        
        if (salesError) {
            console.error("=== 3. ERROR DATABASE (TABEL SALES) ===");
            console.error(salesError);
        } else {
            console.log("=== 3. SUKSES! DATA BERHASIL MASUK SUPABASE ===");
        }
    }

    return NextResponse.json({ reply: aiData.reply });

  } catch (error) {
    console.error("=== ERROR FATAL ===", error);
    return NextResponse.json({ reply: 'Sistem mengalami kendala saat mencatat. Cek terminal.' }, { status: 500 });
  }
}