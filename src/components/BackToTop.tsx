import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button once user scrolls past 280px
      if (window.scrollY > 280) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial state
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      id="btn-back-to-top"
      onClick={scrollToTop}
      title="Về đầu trang"
      aria-label="Cuộn về đầu trang"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 p-2.5 sm:p-3 rounded-full bg-[var(--ussh-blue)] hover:bg-[var(--ussh-blue-dark)] active:bg-[#0c244c] text-white shadow-lg hover:shadow-xl border border-white/20 transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-hidden focus:ring-2 focus:ring-blue-400 cursor-pointer flex items-center justify-center group"
    >
      <ChevronUp className="w-5 h-5 sm:w-5 sm:h-5 transition-transform group-hover:-translate-y-0.5" />
      <span className="sr-only">Về đầu trang</span>
    </button>
  );
};
