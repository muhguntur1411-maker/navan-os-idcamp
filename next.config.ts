import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development", // PWA hanya aktif saat production (Vercel) agar tidak mengganggu proses coding
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Jika sebelumnya Anda punya pengaturan lain di dalam sini, biarkan saja.
  // Jika kosong, biarkan kosong seperti ini.
};

export default withPWA(nextConfig);