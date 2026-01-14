"use client";

import React from "react";
import Link from "next/link";
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
    <div className="fixed right-4 top-[60%] -translate-y-1/2 z-50 flex flex-col gap-3">
      {marketplaces.map((market) => (
        <Link
          key={market.name}
          href={market.url}
          target="_blank"
          rel="noopener noreferrer"
          title={market.name}
          className={`
            ${market.color} 
            w-12 h-12 md:w-14 md:h-14 
            rounded-full flex items-center justify-center 
            text-white font-bold text-[10px] md:text-xs
            shadow-lg transform transition-all duration-300 
            hover:scale-110 hover:-translate-x-2
            animate-bounce
          `}
        >
          {typeof market.icon === "string" ? (
            market.icon
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={market.icon.src} alt={market.name} className="rounded-full" />
          )}
        </Link>
      ))}

      <style jsx>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce {
          animation: bounce 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};