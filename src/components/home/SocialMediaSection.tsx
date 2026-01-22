"use client";

import Image from "next/image";
import Link from "next/link";
import InstagramIcon from "@/assets/instagram__item.png";
import VKIcon from "@/assets/vk__item.png";
import TelegramIcon from "@/assets/telegram__item.png";

export default function SocialMediaSection() {
  const socialLinks = [
    {
      id: "instagram",
      name: "Instagram",
      url: "https://www.instagram.com/coofixrussia?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
      icon: InstagramIcon,
      description: "Следите за новинками и акциями",
    },
    {
      id: "vk",
      name: "ВКонтакте",
      url: "https://vk.com/coofixrussia",
      icon: VKIcon,
      description: "Присоединяйтесь к нашему сообществу",
    },
    {
      id: "telegram",
      name: "Telegram",
      url: "https://t.me/coofixmoskov",
      icon: TelegramIcon,
      description: "Быстрые уведомления и поддержка",
    },
  ];

  return (
    <section className="relative bg-white dark:bg-dark py-12 lg:py-16 overflow-hidden">
      {/* Decorative Background Lines */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-0 w-40 h-px bg-orange transform rotate-12"></div>
          <div className="absolute top-20 right-10 w-32 h-px bg-orange transform -rotate-12"></div>
          <div className="absolute bottom-20 left-10 w-48 h-px bg-orange transform rotate-45"></div>
          <div className="absolute bottom-10 right-0 w-36 h-px bg-orange transform -rotate-45"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-px bg-orange transform rotate-90"></div>
          <div className="absolute top-1/3 right-1/4 w-20 h-px bg-orange transform -rotate-90"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-coal dark:text-foreground mb-8 md:mb-12 text-center">
          Мы в соц сетях
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {socialLinks.map((social) => (
            <Link
              key={social.id}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-coal dark:bg-coal rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 flex flex-col"
            >
              {/* Image at the top - full width */}
              <div className="relative w-full h-48 md:h-56 bg-gray-800 overflow-hidden">
                <Image
                  src={social.icon}
                  alt={social.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              {/* Text content below image */}
              <div className="p-6 md:p-8 flex flex-col items-center text-center flex-1">
                {/* Name */}
                <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-orange transition-colors">
                  {social.name}
                </h3>
                
                {/* Description */}
                <p className="text-sm md:text-base text-white/70">
                  {social.description}
                </p>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-orange/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
