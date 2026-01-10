import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avvalgi konfiguratsiya opsiyalari
  reactCompiler: true,
  
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
  },

  /* config options here */
};

export default nextConfig;