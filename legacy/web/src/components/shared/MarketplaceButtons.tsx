"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import YandexLogo from "../../assets/yandexMarket.png"
import WB from "../../assets/wbLogo.png"
import Ozon from "../../assets/ozonLogo.png"

const marketplaces = [
  {
    name: "Wildberries",
    url: "https://www.wildberries.ru/seller/250037177",
    color: "bg-[#cb11ab]",
    icon: WB, 
  },
  {
    name: "Ozon",
    url: "https://ozon.ru/t/rd4SVmK",
    color: "bg-[#005bff]",
    icon: Ozon,
  },
  {
    name: "Yandex Market",
    url: "https://market.yandex.ru/cc/8VnW99",
    color: "bg-[#ffcc00]",
    icon: YandexLogo,
  },
];

export const MarketplaceButtons = () => {
  return (
    <>
      <style jsx global>{`
        @keyframes wave {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          25% {
            transform: translateY(-8px) rotate(-2deg);
          }
          50% {
            transform: translateY(-12px) rotate(0deg);
          }
          75% {
            transform: translateY(-8px) rotate(2deg);
          }
        }
        
        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-3px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(3px);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.4);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(0, 0, 0, 0);
          }
        }
        
        .marketplace-button {
          animation: wave 3s ease-in-out infinite;
        }
        
        .marketplace-button:nth-child(1) {
          animation-delay: 0s;
        }
        
        .marketplace-button:nth-child(2) {
          animation-delay: 0.3s;
        }
        
        .marketplace-button:nth-child(3) {
          animation-delay: 0.6s;
        }
        
        .marketplace-button:hover {
          animation: shake 0.5s ease-in-out, pulse 2s ease-in-out infinite;
        }
      `}</style>
      <div className="fixed right-2 sm:right-4 top-[50%] -translate-y-1/2 z-40 flex flex-col gap-2 sm:gap-3">
        {marketplaces.map((market) => (
          <Link
            key={market.name}
            href={market.url}
            target="_blank"
            rel="noopener noreferrer"
            title={market.name}
            className={`
              marketplace-button
              ${market.color} 
              w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 
              rounded-full flex items-center justify-center 
              shadow-lg transform transition-all duration-300 
              hover:scale-110 hover:-translate-x-1
              overflow-hidden p-1
            `}
          >
            <Image
              src={market.icon}
              alt={market.name}
              width={56}
              height={56}
              className="w-full h-full object-contain rounded-full"
              unoptimized
            />
          </Link>
        ))}
      </div>
    </>
  );
};