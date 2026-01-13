import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avvalgi konfiguratsiya opsiyalari
  reactCompiler: true,
  
  // Build papkasini o'zgartirish (Netlify uchun default .next ishlatamiz)
  // distDir: 'dist', // Agar kerak bo'lsa, oching
  
  // ✨ Yangi: Tasvirlar konfiguratsiyasi qo'shildi
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        //pathname: '/**', // Agar kerak bo'lsa, ma'lum bir pathni cheklash mumkin
      },
      // Agar kelajakda boshqa tashqi tasvir xostlari bo'lsa, ularni ham shu yerga qo'shing
    ],
    // Image optimization settings
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  
  // Performance optimizations
  compress: true,
  poweredByHeader: false,

  /* config options here */
};

export default nextConfig;