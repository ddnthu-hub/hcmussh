import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  scrollTargetId?: string;
  totalRecords?: number;
  startIndex?: number;
  endIndex?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  scrollTargetId,
  totalRecords,
  startIndex,
  endIndex,
  className = '',
}) => {
  if (totalPages <= 1) return null;

  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    
    // Trigger callback
    onPageChange(page);

    // Auto scroll to target element or top of page
    setTimeout(() => {
      if (scrollTargetId) {
        const el = document.getElementById(scrollTargetId);
        if (el) {
          const navOffset = 80;
          const targetY = el.getBoundingClientRect().top + window.pageYOffset - navOffset;
          window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
  };

  // Generate page numbers with ellipsis
  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className={`border-t border-slate-200 px-4 py-3 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 select-none ${className}`}>
      {/* Left: Record summary if provided */}
      <div>
        {totalRecords !== undefined ? (
          <span>
            Hiển thị{' '}
            <strong className="text-slate-800 font-semibold">
              {totalRecords === 0 ? 0 : (startIndex !== undefined ? startIndex + 1 : 1)}–
              {endIndex !== undefined ? Math.min(endIndex, totalRecords) : totalRecords}
            </strong>{' '}
            trong <strong className="text-slate-800 font-semibold">{totalRecords}</strong> bản ghi
          </span>
        ) : (
          <span>
            Trang <strong className="text-slate-800">{currentPage}</strong> / {totalPages}
          </span>
        )}
      </div>

      {/* Right: Pagination controls */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer transition-colors"
          title="Trang trước"
          aria-label="Trang trước"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Trước</span>
        </button>

        <div className="flex items-center space-x-1">
          {pages.map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1 text-slate-400">
                  ...
                </span>
              );
            }
            const pageNum = p as number;
            const isActive = currentPage === pageNum;
            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => handlePageClick(pageNum)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-w-7 h-7 px-2 rounded-md font-semibold transition-colors cursor-pointer text-xs flex items-center justify-center ${
                  isActive
                    ? 'bg-[var(--ussh-blue)] text-white shadow-xs'
                    : 'hover:bg-slate-100 text-slate-700 border border-transparent hover:border-slate-200'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1 cursor-pointer transition-colors"
          title="Trang sau"
          aria-label="Trang sau"
        >
          <span className="hidden sm:inline">Tiếp</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
