import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { salesData } = await req.json();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Kamu adalah Chief Marketing & Financial Officer (CMO & CFO) AI tingkat enterprise di dalam sistem Navan OS.
    Berikut adalah data matriks penjualan UMKM saat ini: ${JSON.stringify(salesData)}.
    
    Tugas Mutlak:
    Berikan analisis komprehensif dan tajam dalam 3 poin:
    1. DIAGNOSIS PERFORMA: Analisis produk dengan perputaran cepat (Fast-Moving) dan produk mati (Dead-Stock). Apa dampaknya pada arus kas (cash flow)?
    2. STRATEGI FINANSIAL: Rekomendasi taktis untuk menekan kerugian dari bahan baku produk yang tidak laku (contoh: bundling agresif, diskon silang).
    3. COPYWRITING EKSEKUSI: Buatkan 1 paragraf pesan siaran (Broadcast/Caption) yang sangat persuasif, menggunakan prinsip psikologi marketing (FOMO/Scarcity), untuk langsung mengeksekusi strategi poin ke-2.

    ATURAN FORMAT SANGAT PENTING:
    - DILARANG KERAS menggunakan simbol Markdown seperti bintang (**) atau pagar (###).
    - Gunakan Teks Biasa (Plain Text) saja.
    - Gunakan spasi (enter/baris baru) yang rapi untuk memisahkan setiap poin.
    - Gunakan HURUF KAPITAL untuk penekanan kata penting sebagai pengganti cetak tebal.
    - Boleh menggunakan emoji secara proporsional.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ strategy: responseText });
  } catch (error) {
    console.error("Error AI Strategy:", error);
    return NextResponse.json({ strategy: 'Sistem AI gagal memproses matriks data. Silakan coba lagi.' }, { status: 500 });
  }
}