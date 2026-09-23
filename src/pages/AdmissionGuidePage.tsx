import React, { useEffect, useMemo, useState } from 'react';
import { NavigationTab } from '../types';
import { ADMISSION_METHODS, FAQ_ITEMS } from '../data/admissionData';
import { getAdmissionScores, AdmissionScoreDoc } from '../lib/firebase';
import { 
  HelpCircle, 
  BookOpen, 
  FileText, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  DollarSign, 
  Award, 
  Mail, 
  ExternalLink,
  Clock,
  ArrowRight
} from 'lucide-react';

interface AdmissionGuidePageProps {
  onSelectTab: (tab: NavigationTab) => void;
}

export const AdmissionGuidePage: React.FC<AdmissionGuidePageProps> = ({ onSelectTab }) => {
  const [activeMethodIndex, setActiveMethodIndex] = useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [admissionRecords, setAdmissionRecords] = useState<AdmissionScoreDoc[]>([]);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const selectedMethod = ADMISSION_METHODS[activeMethodIndex];

  useEffect(() => {
    getAdmissionScores().then(setAdmissionRecords).catch(() => setAdmissionRecords([]));
  }, []);

  const historicalMethods = useMemo(() => {
    const labels = new Map<number, Set<string>>();
    admissionRecords
      .filter((record) => record.nam >= 2023 && record.nam <= 2026)
      .forEach((record) => {
        const yearMethods = labels.get(record.nam) || new Set<string>();
        if (record.nam === 2026) {
          const code = String(record.doi_tuong || record.ma_pt || '').toUpperCase();
          const label = code.includes('03')
            ? 'DT03 – ĐGNL + Học bạ'
            : code.includes('02')
              ? 'DT02 – THPT + Học bạ'
              : code.includes('01')
                ? 'DT01 – THPT + ĐGNL + Học bạ'
                : record.ma_pt || record.doi_tuong || 'Chưa xác định mã phương thức';
          yearMethods.add(label);
        } else {
          const methodLabels: Record<string, string> = {
            THPT: 'Thi tốt nghiệp THPT',
            PT1_THPT: 'Thi tốt nghiệp THPT',
            DGNL: 'ĐGNL ĐHQG-HCM',
            PT2_DGNL: 'ĐGNL ĐHQG-HCM',
            UTXT_DHQG: 'Ưu tiên xét tuyển ĐHQG-HCM',
            UTXT_PT: 'Ưu tiên xét tuyển theo Đề án PT',
            UTXT_TSGN: 'Tuyển thẳng & Ưu tiên TSGN',
            HSG_DOITUYEN: 'HSG Đội tuyển / Quốc gia',
          };
          const code = String(record.ma_pt || '').toUpperCase();
          yearMethods.add(methodLabels[code] || record.ma_pt || 'Chưa xác định mã phương thức');
        }
        labels.set(record.nam, yearMethods);
      });
    return Array.from(labels.entries()).sort(([a], [b]) => b - a);
  }, [admissionRecords]);

  useEffect(() => {
    const sectionId = window.location.hash.slice(1);
    if (!sectionId) return;
    window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  return (
    <div className="w-full max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[var(--ussh-blue)]/10 text-[var(--ussh-blue-dark)] text-xs font-bold mb-2">
            <BookOpen className="w-3.5 h-3.5 text-[var(--ussh-blue-dark)]" />
            <span>Cẩm nang tuyển sinh 2026 – 2027</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ussh-blue-dark)] tracking-tight">
            Hướng dẫn tuyển sinh & Quy trình xét tuyển
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Hướng dẫn cách sử dụng các chức năng tra cứu, dự đoán và định hướng; giải thích nguồn dữ liệu, công thức điểm và cách đọc kết quả trên website.
          </p>
        </div>

      </div>

      <section id="guide-usage" className="scroll-mt-24 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xl font-bold text-[#0f2b5c]">Hướng dẫn sử dụng website</h2>
            <p className="mt-1 text-xs text-slate-500">Chọn đúng chức năng theo nhu cầu của bạn.</p>
          </div>
          <ol className="space-y-4 text-xs leading-relaxed text-slate-700">
            <li><strong className="text-[#0f2b5c]">1. Tra cứu điểm chuẩn:</strong> chọn năm, phương thức, hệ đào tạo và tổ hợp; tìm theo mã hoặc tên ngành. Kết quả lấy từ dữ liệu điểm chuẩn đang có trong Firestore.</li>
            <li><strong className="text-[#0f2b5c]">2. Dự đoán trúng tuyển:</strong> chọn ngành, phương thức và tổ hợp; chọn điểm thực tế hoặc giả định; nhập các đầu điểm được yêu cầu rồi bấm Phân tích. Mỗi ngành có điểm chuẩn và xác suất tham khảo riêng.</li>
            <li><strong className="text-[#0f2b5c]">3. Định hướng ngành:</strong> đọc phần giới thiệu, bấm Bắt đầu khảo sát, trả lời 15 câu hỏi. Có thể bấm Dừng làm để lưu tiến độ và tiếp tục sau.</li>
            <li><strong className="text-[#0f2b5c]">4. Phân bố điểm:</strong> sau khi hoàn thành dự đoán, xem vị trí điểm của mình trong dữ liệu phân bố người dùng và chọn các lần dự đoán trong danh sách lịch sử.</li>
          </ol>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-xl font-bold text-[#0f2b5c]">Cách tính điểm dự đoán</h2>
            <p className="mt-1 text-xs text-slate-500">Điểm được quy đổi về thang 100 trước khi tính.</p>
          </div>
          <div className="space-y-3 text-xs leading-relaxed text-slate-700">
            <p><strong>THPT:</strong> tổng 3 môn tổ hợp × 100 / 30.</p>
            <p><strong>ĐGNL:</strong> điểm ĐGNL × 100 / 1.200.</p>
            <p><strong>Học bạ:</strong> tổng điểm 3 môn hoặc tổng điểm người dùng nhập × 100 / 30.</p>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p><strong>DT01:</strong> 45% THPT + 45% ĐGNL + 10% học bạ.</p>
              <p><strong>DT02:</strong> 90% THPT + 10% học bạ.</p>
              <p><strong>DT03:</strong> 90% ĐGNL + 10% học bạ.</p>
            </div>
            <p>Điểm thành tích và điểm ưu tiên được cộng theo logic hiện tại của hệ thống. Điểm ưu tiên được giảm theo quy tắc hiện hành khi điểm gốc đạt ngưỡng 75/100.</p>
            <p className="font-semibold text-amber-800">Xác suất chỉ là tham khảo từ khoảng cách giữa điểm dự kiến và điểm chuẩn lịch sử; không phải cam kết trúng tuyển.</p>
          </div>
        </div>
      </section>

      <section id="guide-data" className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xl font-bold text-[#0f2b5c]">Phương thức xét tuyển theo từng năm</h2>
          <p className="mt-1 text-xs text-slate-500">Danh sách được tổng hợp từ các mã phương thức thực tế trong Firestore, không phải phương thức dự đoán.</p>
        </div>
        {historicalMethods.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {historicalMethods.map(([year, methods]) => (
              <div key={year} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-bold text-[#0f2b5c]">Năm {year}</h3>
                <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-700">
                  {Array.from(methods).sort().map((method) => <li key={method}>• {method}</li>)}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Chưa tải được dữ liệu phương thức từ Firestore.</p>
        )}
      </section>

      {/* Section 1: Historical method catalog kept for reference */}
      <section id="guide-overview" className="hidden scroll-mt-24 space-y-6">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-[#0f2b5c]">
            Danh mục phương thức tuyển sinh trong dữ liệu lịch sử
          </h2>
          <p className="text-xs text-slate-500">
            Các mục dưới đây là nội dung phương thức được lưu trong project; dữ liệu hiện không gắn năm áp dụng cụ thể và không phải cấu hình dự đoán năm 2027.
          </p>
        </div>

        {/* Method Switcher Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ADMISSION_METHODS.map((method, idx) => (
            <button
              key={method.id}
              onClick={() => setActiveMethodIndex(idx)}
              className={`p-4 rounded-xl text-left border transition-all ${
                activeMethodIndex === idx
                  ? 'bg-[#0f2b5c] text-white border-[#0f2b5c] shadow-md'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className={`text-[11px] font-bold block mb-1 ${activeMethodIndex === idx ? 'text-amber-300' : 'text-blue-700'}`}>
                {method.codeName}
              </span>
              <h3 className="font-bold text-xs sm:text-sm line-clamp-2">{method.shortName}</h3>
              <span className={`text-[11px] block mt-2 ${activeMethodIndex === idx ? 'text-slate-200' : 'text-slate-500'}`}>
                Chỉ tiêu: {method.quotaShare}
              </span>
            </button>
          ))}
        </div>

        {/* Selected Method Detail Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold text-xs">
                {selectedMethod.codeName}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-xs">
                Chỉ tiêu: {selectedMethod.quotaShare}
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#0f2b5c]">
              {selectedMethod.name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              {selectedMethod.description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Requirements */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Điều kiện và Tiêu chí xét tuyển
              </h4>
              <ul className="space-y-2">
                {selectedMethod.requirements.map((req, i) => (
                  <li key={i} className="flex items-start space-x-2 text-xs text-slate-700">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps & Timeline */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                Quy trình thực hiện & Thời gian
              </h4>
              <div className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mb-2">
                <strong>Thời gian: </strong> {selectedMethod.timeframe}
              </div>
              <ol className="space-y-2 relative border-l border-slate-200 ml-2 pl-3">
                {selectedMethod.steps.map((step, i) => (
                  <li key={i} className="text-xs text-slate-700 relative">
                    <span className="absolute -left-[19px] top-0.5 w-3 h-3 rounded-full bg-blue-600"></span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Tuition Fees & Scholarships */}
      <section className="hidden grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tuition */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5 text-[#0f2b5c]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0f2b5c]">Học phí & Chính sách hỗ trợ</h3>
            <p className="text-xs text-slate-500 mt-1">Thông tin học phí năm học 2024 - 2025 và dự kiến 2025 - 2026</p>
          </div>
          <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
            <p>
              • <strong>Chương trình Chuẩn:</strong> Dao động từ 22.000.000 đến 32.000.000 VNĐ/năm học tùy theo khối ngành khoa học xã hội hay truyền thông - ngoại ngữ.
            </p>
            <p>
              • <strong>Ngành khoa học cơ bản (Triết học, Lịch sử, Tôn giáo học, Địa lý...):</strong> Được nhận gói học bổng hỗ trợ của ĐHQG-HCM, giảm trừ trực tiếp tới 35% học phí.
            </p>
            <p>
              • <strong>Chương trình Chất lượng cao:</strong> Khoảng 55.000.000 - 60.000.000 VNĐ/năm với lớp học quy mô nhỏ, phòng học máy lạnh tiêu chuẩn quốc tế và giảng dạy tăng cường tiếng Anh.
            </p>
          </div>
        </div>

        {/* Scholarships */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
            <Award className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0f2b5c]">Học bổng tài trợ sinh viên</h3>
            <p className="text-xs text-slate-500 mt-1">Hàng nghìn suất học bổng với tổng ngân sách hơn 30 tỷ đồng/năm</p>
          </div>
          <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
            <p>
              • <strong>Học bổng Thủ khoa Tuyển sinh:</strong> Trao tặng 100% học phí toàn khóa học và sinh hoạt phí cho các thủ khoa đầu vào các phương thức.
            </p>
            <p>
              • <strong>Học bổng khuyến khích học tập:</strong> Xét cấp mỗi học kỳ cho sinh viên đạt điểm rèn luyện và kết quả học tập từ Khá, Giỏi, Xuất sắc.
            </p>
            <p>
              • <strong>Học bổng Doanh nghiệp & Quốc tế:</strong> Học bổng Lotte, Posco, Pony Chung, Sumitomo, AEON, cùng mạng lưới cựu sinh viên Nhân văn tài trợ.
            </p>
          </div>
        </div>
      </section>

      <section id="guide-system-data" className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-xl font-bold text-[#0f2b5c]">Dữ liệu hệ thống sử dụng</h2>
          <p className="text-xs text-slate-500 mt-1">Phân biệt dữ liệu tra cứu thực tế với kết quả mô phỏng của hệ thống.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 leading-relaxed">
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-2">
            <h3 className="font-bold text-sm text-[#0f2b5c]">Tra cứu điểm chuẩn</h3>
            <p>Sử dụng dữ liệu điểm chuẩn thực tế từ Firestore, bộ sưu tập <strong>admission_scores</strong>.</p>
            <p>Cho phép tra cứu các năm và phương thức mà hệ thống đang có dữ liệu. Dữ liệu tra cứu không được gọi là điểm chuẩn dự đoán.</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-2">
            <h3 className="font-bold text-sm text-[#0f2b5c]">Dự đoán trúng tuyển</h3>
            <p>Sử dụng điểm người dùng nhập và công thức tính điểm xét tuyển theo phương thức được chọn.</p>
            <p>Đối chiếu với điểm chuẩn lịch sử phù hợp trong Firestore để tính <strong>xác suất tham khảo</strong> theo từng ngành.</p>
            <p>Năm 2027 sử dụng điểm chuẩn 2026 làm dữ liệu lịch sử/tham chiếu, không phải điểm chuẩn chính thức 2027 và không tạo điểm chuẩn 2027 giả.</p>
          </div>
        </div>
      </section>

      {/* Section 3: Frequently Asked Questions (FAQ Accordion) */}
      <section id="guide-faq" className="scroll-mt-24 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#0f2b5c]">
            Câu hỏi Thường gặp (FAQ)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Giải đáp những thắc mắc phổ biến nhất của thí sinh và phụ huynh trong mùa tuyển sinh
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100 flex items-center justify-between transition-colors focus:outline-hidden"
                >
                  <span className="font-bold text-xs sm:text-sm text-slate-900 pr-4">
                    {item.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 bg-white text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-200">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Banner */}
      <section id="guide-data-notes" className="scroll-mt-24 bg-[#0f2b5c] text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-amber-300">
            Bạn còn thắc mắc về hệ thống của chúng tôi?
          </h3>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('messages')}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center space-x-2 border border-white/20"
          >
            <Mail className="w-4 h-4" />
            <span>Gửi câu hỏi</span>
          </button>
        </div>
      </section>
    </div>
  );
};
