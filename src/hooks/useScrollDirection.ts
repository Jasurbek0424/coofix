// src/hooks/useScrollDirection.ts
import { useState, useEffect } from 'react';

type ScrollDirection = 'up' | 'down' | 'static';

/**
 * @returns 'up', 'down' yoki 'static'
 */
export const useScrollDirection = (): ScrollDirection => {
  const [scrollDir, setScrollDir] = useState<ScrollDirection>('static');
  const threshold = 10;

  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    let ticking = false;

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset;

      if (Math.abs(scrollY - lastScrollY) < threshold) {
        // Agar scroll yetarli darajada o'zgarmagan bo'lsa, o'tkazib yuborish
        ticking = false;
        return;
      }

      // Pastga scroll qilish (ko'rinmay qoladi)
      if (scrollY > lastScrollY && scrollY > 0) {
        setScrollDir('down');
      } 
      // Yuqoriga scroll qilish yoki eng tepada turish (ko'rinadi)
      else if (scrollY < lastScrollY || scrollY === 0) {
        setScrollDir('up');
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return scrollDir;
};