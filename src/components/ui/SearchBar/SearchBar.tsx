"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiSearch } from "react-icons/fi";
import { Loader } from "@/components/shared/Loader";
import { useDebounce } from "@/hooks/useDebounce"; 

interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  maxResults?: number;
  onSearch?: (query: string, signal: AbortSignal) => Promise<Product[]>; 
}

export function SearchBar({
  className = "",
  placeholder = "Поиск по каталогу",
  maxResults = 6,
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false); // Dropdownni nazorat qiladi
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // useDebounce hookini 1000ms (1s) kechikish bilan ishlatish
  const debouncedQuery = useDebounce(query, 1000); 

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle search logic
  useEffect(() => {
    const trimmedQuery = debouncedQuery.trim();

    // Query bo'sh bo'lsa, qidiruvni boshlamaymiz, faqat natijalarni tozalaymiz
    if (!trimmedQuery) {
      setResults([]);
      setIsLoading(false); // Yuklanishni to'xtatish
      return;
    }

    // AbortController eski so'rovni bekor qilish uchun
    const controller = new AbortController();
    const signal = controller.signal;

    const performSearch = async () => {
      setIsLoading(true);
      try {
        if (onSearch) {
          const searchResults = await onSearch(trimmedQuery, signal); 
          setResults(searchResults.slice(0, maxResults));
          // showResults endi Input fokuslanganda true bo'ladi, bu yerda o'zgartirish shart emas
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') { 
          return;
        }
        
        if (error instanceof Error) {
            console.error("Search error:", error.message);
        } else {
            console.error("Search error:", error);
        }
        
        setResults([]);
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    performSearch();

    // Cleanup function: bu keyingi so'rovdan oldin oldingi so'rovni bekor qiladi
    return () => {
      controller.abort();
    };
  }, [debouncedQuery, maxResults, onSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      router.push(`/catalog?search=${encodeURIComponent(trimmedQuery)}`);
      setShowResults(false);
      setQuery("");
    }
  };

  const handleShowAll = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      router.push(`/catalog?search=${encodeURIComponent(trimmedQuery)}`); 
      setShowResults(false);
      setQuery("");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleProductClick = (productId: string) => {
    setShowResults(false);
    setQuery("");
  };
  
  // Natijalar oynasini ko'rsatish sharti: input faol bo'lsa (fokuslanganda `showResults` true bo'ladi)
  const shouldShowResultsDropdown = showResults;

  // Kontentni tanlash uchun yordamchi funksiya
  const renderDropdownContent = () => {
    const trimmedQuery = query.trim();

    // 1. Agar qidiruv amalga oshirilayotgan bo'lsa (debounced so'rov yuborilgandan keyin)
    if (isLoading) {
      return (
        <div className="p-8 flex justify-center bg-dark min-h-[100px]">
           <Loader size="sm" variant="dots"/>
        </div>
      );
    }
    
    // 2. Agar query bo'sh bo'lsa (fokuslangandan keyingi boshlang'ich holat)
    if (!trimmedQuery) {
      return (
        <div className="p-4 bg-dark min-h-[50px]">
          {/* Bu yerda keyinchalik so'nggi ko'rilganlar/tavsiyalar bo'lishi mumkin */}
          <p className="text-smoky">поиск...</p>
        </div>
      );
    }

    // 3. Natijalar topilgan bo'lsa (1-rasm)
    if (results.length > 0) {
      return (
        <>
          <div className="max-h-[400px] overflow-y-auto">
            {results.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                onClick={() => handleProductClick(product.id)} 
                className={`flex items-center gap-3 p-3 hover:bg-100 transition-colors cursor-pointer`}
              >
                <div className="w-16 h-16 shrink-0 relative">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-contain rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-coal truncate">
                    {product.title}
                  </h4>
                </div>
                <div className="shrink-0">
                  <p className="font-semibold text-coal">{product.price.toLocaleString("ru-RU")} ₽</p>
                </div>
              </Link>
            ))}
          </div>
          
          <button
            onClick={handleShowAll}
            className="w-full py-3 bg-dark text-white hover:bg-coal transition-colors font-medium"
          >
            Показать все
          </button>
        </>
      );
    }

    // 4. Natijalar topilmagan bo'lsa (2-rasm)
    return (
        <div className="bg-dark p-8 text-center">
            <p className="text-foreground">Нет результатов</p>
        </div>
    );
  };

  return (
    <div ref={searchRef} className={`relative flex-1 max-w-sm ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-statDark">
          <FiSearch size={20} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          // Input aktiv bo'lishi bilanoq dropdownni ko'rsatish
          onFocus={() => setShowResults(true)} 
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-white rounded text-coal placeholder-smoky focus:outline-none focus:ring-2 focus:ring-orange"
        />
        {/* Loading ikonasi Input ichida qoladi */}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader size="sm" variant="dots" />
          </div>
        )}
      </form>

      {/* Results Dropdown (Input faol bo'lsa darhol ko'rinadi) */}
      {shouldShowResultsDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
            {renderDropdownContent()}
        </div>
      )}
    </div>
  );
}