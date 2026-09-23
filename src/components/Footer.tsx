import React from 'react';
import { NavigationTab } from '../types';
import { MapPin, ArrowRight } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: NavigationTab | string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="bg-[#164b7a] text-blue-100">
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Column 1: School & System Identity */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex shrink-0 items-center gap-2">
                <img src="/logo-dhqg.jpg" alt="Logo Đại học Quốc gia Thành phố Hồ Chí Minh" className="h-9 w-auto object-contain mix-blend-multiply" />
                <img src="/logo_ussh.png" alt="Logo Trường Đại học Khoa học Xã hội và Nhân văn" className="h-9 w-auto object-contain" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xs uppercase tracking-wide leading-tight">
                  HỆ THỐNG HỖ TRỢ TRA CỨU, ĐỊNH HƯỚNG NGÀNH VÀ DỰ ĐOÁN TRÚNG TUYỂN USSH
                </h3>
                <p className="text-[11px] text-rose-200 font-medium">Trường ĐH KHXH&NV – ĐHQG TP.HCM</p>
              </div>
            </div>
            <p className="text-xs text-blue-100/85 leading-relaxed font-normal">
              Cổng thông tin hỗ trợ thí sinh tìm hiểu thông tin tuyển sinh, phân tích dữ liệu điểm và tham khảo định hướng nghề nghiệp chuẩn mực.
            </p>
          </div>

          {/* Column 2: Campuses & Contact */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider border-b border-white/15 pb-2">
              Trường & Cơ sở đào tạo
            </h4>
            <div className="space-y-2.5 text-xs text-blue-100/90">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Cơ sở Sài Gòn</strong>
                  <p>10 - 12 Đinh Tiên Hoàng, P. Sài Gòn, TP. HCM</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Cơ sở Linh Xuân</strong>
                  <p>Khu đô thị ĐHQG-HCM, P. Linh Xuân, TP. HCM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Main guide links */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider border-b border-white/15 pb-2">
              GIẢI ĐÁP THẮC MẮC & HƯỚNG DẪN SỬ DỤNG
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('/cam-nang#guide-usage')}
                  className="font-semibold hover:text-[#ffd21a] hover:underline text-white transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-rose-300" />
                  <span>Hướng dẫn sử dụng hệ thống</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('/cam-nang#guide-data')}
                  className="font-semibold hover:text-[#ffd21a] hover:underline text-white transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-rose-300" />
                  <span>Phương thức xét tuyển</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('/cam-nang#guide-faq')}
                  className="font-semibold hover:text-[#ffd21a] hover:underline text-white transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-rose-300" />
                  <span>Câu hỏi thường gặp (FAQ)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('/cam-nang#guide-system-data')}
                  className="font-semibold hover:text-[#ffd21a] hover:underline text-white transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowRight className="w-3 h-3 text-rose-300" />
                  <span>Dữ liệu hệ thống sử dụng</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright Section */}
        <div className="mt-5 pt-4 border-t border-white/10 text-xs text-blue-200/80 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="font-normal text-center sm:text-left">
            © 2026 – 2027 Trường Đại học Khoa học Xã hội và Nhân văn – ĐHQG TP.HCM. Bản quyền thuộc về Nhà trường.
          </p>
        </div>
      </div>
    </footer>
  );
};
