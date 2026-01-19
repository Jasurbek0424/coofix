"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import clsx from "clsx";
import { useUser } from "@/store/useUser";
import { FiLogOut } from "react-icons/fi";
import NewsPhoto from "@/assets/news__photo.png";
import SalesPhoto from "@/assets/sales__photo.png";

interface ProfileSidebarProps {
  className?: string;
}

export function ProfileSidebar({ className }: ProfileSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    {
      label: "История заказов",
      href: "/profile/orders",
      icon: null,
    },
    {
      label: "Личная информация",
      href: "/profile/info",
      icon: null,
    },
  ];

  const promotions = [
    {
      title: "Новое поступление",
      subtitle: "Самые свежие товары",
      href: "/catalog?filter=new",
      image: NewsPhoto,
    },
    {
      title: "Товары со скидкой",
      subtitle: "Акции и распродажи",
      href: "/catalog?filter=sale",
      image: SalesPhoto,
    },
  ];

  return (
    <aside className={clsx("w-full md:w-64 flex-shrink-0", className)}>
      <div className="space-y-4">
        {/* Navigation Menu */}
        <div className="bg-dark p-4 rounded-lg space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "block px-4 py-3 rounded transition-colors",
                  isActive
                    ? "bg-orange text-white"
                    : "text-foreground hover:bg-coal"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={clsx(
              "w-full flex items-center gap-2 px-4 py-3 rounded transition-colors text-foreground hover:bg-coal"
            )}
          >
            <FiLogOut size={18} />
            <span>Выйти</span>
          </button>
        </div>

        {/* Promotions */}
        <div className="space-y-4">
          {promotions.map((promo, index) => (
            <Link
              key={index}
              href={promo.href}
              className="relative h-48 rounded-lg overflow-hidden group cursor-pointer block"
            >
              <div className="absolute inset-0 z-0">
                <Image
                  src={promo.image}
                  alt={promo.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 256px"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 group-hover:from-black/70 transition-colors" />
              <div className="absolute bottom-4 left-4 right-4 z-20 text-white">
                <h3 className="font-semibold text-lg mb-1">{promo.title}</h3>
                <p className="text-sm">{promo.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

