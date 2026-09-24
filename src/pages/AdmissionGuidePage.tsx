import React, { useEffect, useMemo, useState } from 'react';
import { NavigationTab } from '../types';
import { ADMISSION_METHODS } from '../data/admissionData';
import { getAdmissionScores, AdmissionScoreDoc } from '../lib/firebase';
import { 
  BookOpen, 
  FileText, 
  CheckCircle, 
  Calendar, 
  DollarSign, 
  Award, 
  Mail, 
  ExternalLink,
  Clock,
  ArrowRight,
  ChevronDown
} from 'lucide-react';

interface AdmissionGuidePageProps {
  onSelectTab: (tab: NavigationTab) => void;
}

export const AdmissionGuidePage: React.FC<AdmissionGuidePageProps> = ({ onSelectTab }) => {
  const [activeMethodIndex, setActiveMethodIndex] = useState<number>(0);
  const [admissionRecords, setAdmissionRecords] = useState<AdmissionScoreDoc[]>([]);

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
            ? 'ĐT03 – ĐGNL + Học bạ'
            : code.includes('02')
              ? 'ĐT02 – THPT + Học bạ'
              : code.includes('01')
                ? 'ĐT01 – THPT + ĐGNL + Học bạ'
                : '';
          if (label) yearMethods.add(label);
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
          const label = methodLabels[code] || record.ma_pt || '';
          if (label) yearMethods.add(label);
        }
        labels.set(record.nam, yearMethods);
      });
    return Array.from(labels.entries()).sort(([a], [b]) => b - a);
  }, [admissionRecords]);

  const groupedHistoricalMethods = useMemo(() => {
    const recent = historicalMethods.filter(([year]) => year === 2023 || year === 2024 || year === 2025);
    const otherYears = historicalMethods.filter(([year]) => year !== 2023 && year !== 2024 && year !== 2025);
    const methodSignature = (methods: Set<string>) => Array.from(methods).sort().join('|');

    if (recent.length === 3 && recent.every(([, methods]) => methodSignature(methods) === methodSignature(recent[0][1]))) {
      return [...otherYears, [2023, recent[0][1]] as [number, Set<string>]].sort(([a], [b]) => b - a).map(([year, methods]) => [year === 2023 ? '2023–2025' : year, methods] as [number | string, Set<string>]);
    }

    return historicalMethods;
  }, [historicalMethods]);

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
            <span>Cẩm nang của hệ thống 2027</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ussh-blue-dark)] tracking-tight">
            Thông tin & Hướng dẫn
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Hướng dẫn cách sử dụng các chức năng tra cứu, dự đoán và định hướng; giải thích nguồn dữ liệu, công thức điểm và cách đọc kết quả trên website.
          </p>
        </div>

      </div>

      <section id="guide-usage" className="scroll-mt-24 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <details className="group lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-slate-100 pb-3 text-[#0f2b5c] [&::-webkit-details-marker]:hidden">
            <h2 className="text-lg sm:text-xl font-bold">Hướng dẫn sử dụng website</h2>
            <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-b border-slate-100 pb-3">
            <p className="mt-1 text-xs text-slate-500">Chọn đúng chức năng theo nhu cầu của bạn.</p>
          </div>
          <ol className="space-y-3 text-xs leading-relaxed text-slate-700">
            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <strong className="text-sm text-[#0f2b5c]">1. Tra cứu điểm chuẩn</strong>
              <p className="mt-2">Chọn <strong>năm tuyển sinh, phương thức xét tuyển, hệ đào tạo và tổ hợp</strong>, sau đó lọc theo <strong>mã ngành hoặc tên ngành</strong>. Khi cần xem nhiều lựa chọn cùng lúc, dùng mục <strong>“Tất cả”</strong> nếu bộ lọc hỗ trợ.</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Dữ liệu tra cứu là dữ liệu tuyển sinh đã có trong hệ thống.</li>
                <li>Điểm chuẩn hiển thị không phải điểm dự đoán.</li>
                <li>Mỗi phương thức, tổ hợp và hệ đào tạo có thể có mức điểm khác nhau.</li>
              </ul>
            </li>
            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <strong className="text-sm text-[#0f2b5c]">2. Dự đoán trúng tuyển</strong>
              <p className="mt-2">Chọn <strong>ngành, phương thức xét tuyển và tổ hợp</strong>, rồi chọn loại điểm phù hợp:</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li><strong>Điểm thực tế:</strong> điểm bạn đã có hoặc dự kiến sử dụng trong hồ sơ thực tế.</li>
                <li><strong>Điểm giả định:</strong> điểm dùng để thử nghiệm các kịch bản khác nhau.</li>
              </ul>
              <p className="mt-2">Nhập các mức điểm được yêu cầu và nhấn <strong>Phân tích</strong>. Hệ thống quy đổi điểm, tính điểm xét tuyển, đối chiếu dữ liệu lịch sử phù hợp và đưa ra mức độ trúng tuyển <strong>ước tính</strong>. Nếu chọn nhiều ngành, từng ngành được phân tích riêng.</p>
            </li>
            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <strong className="text-sm text-[#0f2b5c]">3. Định hướng ngành</strong>
              <p className="mt-2">Trả lời các câu hỏi về <strong>sở thích, khả năng và nhóm năng lực</strong>. Hệ thống tổng hợp câu trả lời để xây dựng hồ sơ và tính <strong>mức độ phù hợp (%)</strong> với các ngành.</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Xem các ngành có mức độ phù hợp cao.</li>
                <li>Xem nhóm năng lực phù hợp và chi tiết theo từng ngành.</li>
                <li>Mức độ phù hợp ngành không phải là xác suất trúng tuyển.</li>
              </ul>
            </li>
            <li className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <strong className="text-sm text-[#0f2b5c]">4. Phân bố điểm</strong>
              <p className="mt-2">Sau khi hoàn thành dự đoán, bạn có thể xem phân bố điểm xét tuyển dự kiến của người dùng nếu hệ thống đã có đủ dữ liệu.</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Biểu đồ giúp hình dung vị trí điểm của bạn trong tập dữ liệu người dùng.</li>
                <li>Đây không phải phân bố điểm chuẩn chính thức và không thay thế điểm chuẩn của Nhà trường.</li>
              </ul>
            </li>
          </ol>
        </details>

        <details id="guide-data" className="group lg:col-span-2 scroll-mt-24 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-slate-100 pb-3 text-[#0f2b5c] [&::-webkit-details-marker]:hidden">
          <h2 className="text-lg sm:text-xl font-bold">Phương thức xét tuyển theo từng năm</h2>
          <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        {groupedHistoricalMethods.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {groupedHistoricalMethods.map(([year, methods]) => (
              <div key={year} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                {year === 2026 ? (
                  <>
                    <h3 className="font-bold text-[#0f2b5c]">Năm 2026</h3>
                    <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-700">
                      <li>• Phương thức 1 – Xét tuyển thẳng</li>
                      <li>• Phương thức 2 – Xét tuyển tổng hợp</li>
                    </ul>
                  </>
                ) : (
                  <>
                    <h3 className="font-bold text-[#0f2b5c]">Năm {year}</h3>
                    <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-700">
                      {Array.from(methods).sort().map((method) => <li key={method}>• {method}</li>)}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Chưa tải được dữ liệu phương thức từ hệ thống.</p>
        )}
        </details>
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

      <details id="guide-system-data" className="group scroll-mt-24 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-slate-100 pb-3 text-[#0f2b5c] [&::-webkit-details-marker]:hidden">
          <h2 className="text-lg sm:text-xl font-bold">Dữ liệu hệ thống sử dụng</h2>
          <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <div className="border-b border-slate-100 pb-3">
          <p className="text-xs text-slate-500 mt-1">Phân biệt dữ liệu thực tế được sử dụng để tra cứu và dữ liệu tham chiếu phục vụ dự đoán.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 text-xs leading-relaxed text-slate-700 md:grid-cols-2">
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-[#0f2b5c]">Tra cứu điểm chuẩn</h3>
              <span className="shrink-0 rounded-md bg-white px-2 py-1 text-[10px] font-bold text-[#0f2b5c]">2023–2026</span>
            </div>
            <p>Hệ thống sử dụng dữ liệu điểm chuẩn tuyển sinh thực tế của Trường Đại học Khoa học Xã hội và Nhân văn, ĐHQG-HCM được tích hợp trong hệ thống.</p>
            <p><strong>Phạm vi dữ liệu:</strong> Người dùng có thể tra cứu theo từng năm, phương thức xét tuyển, hệ đào tạo, tổ hợp và ngành dựa trên dữ liệu đã được cập nhật.</p>
            <ul className="list-disc space-y-1 pl-4">
              <li>Chỉ hiển thị dữ liệu thực tế đang tồn tại; không tạo dữ liệu còn thiếu.</li>
              <li>Không phải mọi phương thức hoặc tổ hợp đều có dữ liệu ở tất cả các năm.</li>
              <li>Dữ liệu tra cứu là dữ liệu lịch sử/thực tế, không phải kết quả do hệ thống dự đoán.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-[#0f2b5c]">Dự đoán trúng tuyển</h3>
              <span className="shrink-0 rounded-md bg-white px-2 py-1 text-[10px] font-bold text-amber-900">Tham chiếu: 2026</span>
            </div>
            <p>Hệ thống sử dụng điểm do người dùng nhập, công thức tính điểm xét tuyển theo phương thức được chọn và dữ liệu điểm chuẩn lịch sử phù hợp.</p>
            <p>Đối với dự đoán kỳ tuyển sinh <strong>2027</strong>, dữ liệu tuyển sinh <strong>2026</strong> được dùng làm dữ liệu lịch sử/tham chiếu gần nhất.</p>
            <p className="font-semibold text-amber-900">Điểm chuẩn năm 2026 là dữ liệu tham chiếu, không phải điểm chuẩn chính thức của năm 2027.</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
          <h3 className="font-bold text-[#0f2b5c]">Nguồn thông tin</h3>
          <p className="mt-2">Các thông tin về phương thức tuyển sinh, cách tính điểm, điểm cộng, điểm ưu tiên và dữ liệu điểm chuẩn được sử dụng làm cơ sở tham chiếu từ thông tin tuyển sinh chính thức của Trường Đại học Khoa học Xã hội và Nhân văn, ĐHQG-HCM và các quy định tuyển sinh liên quan.</p>
        </div>

      </details>

      <details id="guide-calculation" className="group scroll-mt-24 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 border-b border-slate-100 pb-3 text-[#0f2b5c] [&::-webkit-details-marker]:hidden">
          <h2 className="text-lg sm:text-xl font-bold">Cách tính mức độ phù hợp và xác suất của hệ thống</h2>
          <ChevronDown className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
        </summary>
        <div className="space-y-4 text-xs leading-relaxed text-slate-700">
          <div className="border-b border-slate-100 pb-3">
            <p className="mt-1 text-slate-500">Các chức năng sử dụng dữ liệu và quy tắc khác nhau, không thay thế kết quả xét tuyển chính thức.</p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="font-bold text-[#0f2b5c]">Điểm xét tuyển dự đoán</h4>
              <p className="mt-2">Các loại điểm đầu vào được quy đổi về cùng thang 100 trước khi áp dụng công thức của phương thức xét tuyển.</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li><strong>THPT:</strong> tổng 3 môn trong tổ hợp được quy đổi từ thang 30 về thang 100.</li>
                <li><strong>ĐGNL:</strong> điểm từ thang 1.200 được quy đổi về thang 100.</li>
                <li><strong>Học bạ:</strong> điểm 3 môn trong tổ hợp được quy đổi từ thang 30 về thang 100 theo logic hiện tại.</li>
              </ul>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg bg-blue-50 p-2"><strong>Đối tượng 1 – ĐHL1</strong><span className="mt-1 block">45% điểm thi tốt nghiệp THPT<br />+ 45% điểm Đánh giá năng lực<br />+ 10% điểm học bạ 3 năm THPT</span></div>
                <div className="rounded-lg bg-blue-50 p-2"><strong>Đối tượng 2 – ĐHL2</strong><span className="mt-1 block">90% điểm thi tốt nghiệp THPT<br />+ 10% điểm học bạ 3 năm THPT</span></div>
                <div className="rounded-lg bg-blue-50 p-2"><strong>Đối tượng 3 – ĐHL3</strong><span className="mt-1 block">90% điểm Đánh giá năng lực<br />+ 10% điểm học bạ 3 năm THPT</span></div>
              </div>
              <p className="mt-3"><strong>Điểm thành tích và điểm ưu tiên</strong> được tính theo quy định tuyển sinh hiện hành của Nhà trường và các quy định liên quan của Bộ Giáo dục và Đào tạo.</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="font-bold text-[#0f2b5c]">Định hướng ngành</h4>
              <p className="mt-2">Hệ thống không sử dụng điểm chuẩn để tính mức độ phù hợp ngành.</p>
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-[11px] font-semibold text-[#0f2b5c]">Câu trả lời → Hồ sơ năng lực/sở thích → 9 nhóm yếu tố → So sánh với từng ngành → Mức độ phù hợp (%)</div>
              <p className="mt-3">Chín nhóm yếu tố gồm: Phân tích, Giao tiếp, Xã hội – con người, Ngôn ngữ, Sáng tạo, Tổ chức – quản lý, Nghiên cứu, Đối ngoại – quốc tế và Công nghệ – dữ liệu.</p>
              <p className="mt-2">Mức độ phù hợp được tính bằng cách so sánh hồ sơ người dùng với hồ sơ yêu cầu của từng ngành; đây là công cụ hỗ trợ định hướng và <strong>không phải xác suất trúng tuyển</strong>.</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="font-bold text-[#0f2b5c]">Xác suất trúng tuyển tham khảo</h4>
              <p className="mt-2">Sau khi tính điểm xét tuyển, hệ thống so sánh điểm người dùng với dữ liệu điểm chuẩn lịch sử phù hợp của cùng ngành, phương thức, tổ hợp và hệ đào tạo.</p>
              <div className="mt-3 rounded-lg bg-amber-50 p-3 text-[11px] font-semibold text-amber-900">Điểm xét tuyển → Điểm chuẩn lịch sử phù hợp → Khoảng cách điểm → Mô hình tính xác suất → Xác suất tham khảo</div>
              <p className="mt-3">Xác suất được chuyển đổi từ khoảng cách giữa điểm xét tuyển và điểm chuẩn tham chiếu theo mô hình tính toán của hệ thống. Hệ thống không tính đơn giản bằng cách lấy điểm xét tuyển chia cho điểm chuẩn.</p>
              <p className="mt-2">Kết quả chỉ dựa trên dữ liệu lịch sử và không bảo đảm kết quả tuyển sinh thực tế.</p>
            </div>

            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="font-bold text-[#0f2b5c]">Mục tiêu điểm</h4>
              <p className="mt-2">Mức mục tiêu được tham chiếu từ điểm chuẩn phù hợp. Với dự đoán năm 2027, mức tham chiếu này dựa trên dữ liệu tuyển sinh năm 2026, không phải điểm chuẩn chính thức năm 2027.</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Điểm chuẩn tham chiếu và mức mục tiêu.</li>
                <li>Mục tiêu cao hơn điểm tham chiếu hoặc mục tiêu tự nhập.</li>
                <li>Điểm dự đoán hiện tại và khoảng cách còn thiếu.</li>
              </ul>
              <p className="mt-2">Khi điểm hiện tại đã đạt hoặc cao hơn mục tiêu, hệ thống hiển thị “Đã đạt hoặc cao hơn mục tiêu” và không hiển thị khoảng cách âm.</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4">
            <h4 className="font-bold text-[#0f2b5c]">Phân bố điểm</h4>
            <p className="mt-2">Biểu đồ được xây dựng từ điểm xét tuyển do người dùng nhập trong các lượt dự đoán hợp lệ, không phải từ điểm chuẩn của Nhà trường. Chỉ các lượt dự đoán bằng <strong>điểm thực tế</strong> được sử dụng; mỗi người dùng được xác định riêng để tránh nhiều lượt của một người làm tăng giả tạo số lượng người dùng. Biểu đồ chỉ hiển thị khi hệ thống có đủ dữ liệu theo điều kiện hiện tại và không tạo dữ liệu giả.</p>
          </div>

        </div>
      </details>

      {/* Contact Banner */}
      <section id="guide-data-notes" className="scroll-mt-24 bg-[#0f2b5c] text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-sm sm:text-lg font-bold text-amber-300 whitespace-nowrap">
            Bạn còn thắc mắc về hệ thống của chúng tôi?
          </h3>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('messages')}
            className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center space-x-2 border border-white/20"
          >
            <Mail className="w-4 h-4" />
            <span>Gửi câu hỏi</span>
          </button>
        </div>
      </section>
    </div>
  );
};
