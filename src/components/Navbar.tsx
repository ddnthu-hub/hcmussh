import React, { useEffect, useState } from 'react';
import { NavigationTab } from '../types';
import { 
  Menu, 
  X, 
  GraduationCap,
  Compass,
  Search,
  BarChart3,
  TrendingUp,
  BookOpen,
  Mail
} from 'lucide-react';
import { getMyMessages } from '../lib/userMessages';

interface NavbarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    let active = true;

    const loadUnreadMessages = async () => {
      try {
        const messages = await getMyMessages();
        if (active) {
          setUnreadMessages(messages.filter((message) => message.status === 'answered' && !message.answerReadAt).length);
        }
      } catch {
        if (active) setUnreadMessages(0);
      }
    };

    const handleMessagesUpdated = () => { void loadUnreadMessages(); };
    void loadUnreadMessages();
    const intervalId = window.setInterval(() => void loadUnreadMessages(), 15000);
    window.addEventListener('ussh-messages-updated', handleMessagesUpdated);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener('ussh-messages-updated', handleMessagesUpdated);
    };
  }, []);

  // Exact required sequence of 6 main navigation items
  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Trang chủ', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'scores', label: 'Tra cứu điểm chuẩn', icon: <Search className="w-4 h-4" /> },
    { id: 'orientation', label: 'Định hướng ngành', icon: <Compass className="w-4 h-4" /> },
    { id: 'prediction', label: 'Dự đoán trúng tuyển', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'distribution', label: 'Xem phân bố điểm', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'guide', label: 'Cẩm nang', icon: <BookOpen className="w-4 h-4" /> },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    setIsMobileMenuOpen(false);
  };

  const mailboxButton = (
    <button
      id="nav-mailbox-btn"
      type="button"
      onClick={() => handleNavClick('messages')}
      aria-label={unreadMessages > 0 ? `Hộp thư, ${unreadMessages} tin nhắn chưa đọc` : 'Mở hộp thư'}
      title="Hộp thư"
      className={`relative inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] transition-all duration-200 cursor-pointer ${
        currentTab === 'messages'
          ? 'bg-[var(--ussh-red)] text-white font-bold shadow-md shadow-red-900/20 ring-1 ring-red-900/10'
          : 'text-[var(--ussh-red)] hover:-translate-y-0.5 hover:bg-[var(--ussh-red-light)] hover:text-[var(--ussh-red-dark)] hover:shadow-sm'
      }`}
    >
      <Mail className="h-5 w-5" />
      <span className="hidden xl:inline">Hộp thư</span>
      {unreadMessages > 0 && (
        <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-rose-600 px-1 py-0.5 text-center text-[9px] font-bold leading-none text-white">
          {unreadMessages > 99 ? '99+' : unreadMessages}
        </span>
      )}
    </button>
  );

  return (
    <header className="relative bg-white text-[var(--ussh-blue-dark)] shadow-sm border-b border-[#d9e2ec]">
      <div className="w-full max-w-[1360px] mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-[72px] gap-2 lg:gap-3">
          {/* Left: VNU-HCM + USSH identity */}
          <button 
            id="brand-logo-btn"
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-2.5 sm:space-x-3.5 text-left focus:outline-hidden hover:opacity-95 transition-opacity py-1 shrink-0 cursor-pointer min-w-0"
          >
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 pr-2 sm:pr-3">
              <img
                src="/logo-dhqg.jpg"
                alt="Logo Đại học Quốc gia Thành phố Hồ Chí Minh"
                className="w-auto h-8 sm:h-9 xl:h-10 object-contain"
              />
              <img
                src="/logo_ussh.png"
                alt="Logo Trường Đại học Khoa học Xã hội và Nhân văn"
                className="w-auto h-8 sm:h-9 xl:h-10 object-contain"
              />
            </div>

          </button>

          {/* Center/Right Navigation Links for Laptops & Desktops (lg, xl, 2xl) */}
          <div className="hidden lg:flex items-center space-x-1 shrink-0 ml-1 xl:ml-2">
            <nav className="flex items-center space-x-1" aria-label="Thanh điều hướng chính">
              {navItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-link-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-2 xl:px-2.5 2xl:px-3 py-1.5 xl:py-2 rounded-lg text-[10px] xl:text-[11px] transition-all duration-200 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[var(--ussh-blue-dark)] text-white font-bold shadow-md shadow-slate-900/20 ring-1 ring-[var(--ussh-blue-dark)]/15'
                        : 'text-slate-600 hover:-translate-y-0.5 hover:text-[var(--ussh-blue-dark)] hover:bg-[var(--ussh-blue-subtle)] hover:shadow-sm font-medium'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            {mailboxButton}
          </div>

          {/* Mobile & Tablet controls (< lg) */}
          <div className="lg:hidden flex items-center gap-1 shrink-0">
            {mailboxButton}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg text-[var(--ussh-blue-dark)] hover:bg-[var(--ussh-blue-subtle)] focus:outline-hidden cursor-pointer"
              aria-label="Mở menu điều hướng"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu (< lg) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#d9e2ec] bg-white shadow-sm animate-in fade-in duration-200">
          <div className="px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--ussh-blue-dark)] text-white font-bold'
                      : 'text-slate-600 hover:bg-[var(--ussh-blue-subtle)]'
                  }`}
                >
                  <span className="text-[var(--ussh-blue)]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
