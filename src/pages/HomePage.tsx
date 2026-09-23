import React, { useState, useEffect, useMemo } from 'react';
import { NavigationTab, Major } from '../types';
import { getAdmissionScores, AdmissionScoreDoc } from '../lib/firebase';
import { 
  Search, 
  Compass, 
  BarChart3, 
  TrendingUp, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Database, 
  Calendar, 
  GraduationCap, 
  AlertCircle,
  HelpCircle,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface HomePageProps {
  onSelectTab: (tab: NavigationTab) => void;
  onViewMajor?: (major: Major) => void;
  onSelectMajorForPrediction?: (majorId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectTab }) => {
  const [scores, setScores] = useState<AdmissionScoreDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroPhoto, setHeroPhoto] = useState(0);
  const heroPhotos = ['/photo 1.jpg', '/photo 2.jpg', '/photo 3.jpg', '/photo 4.jpg', '/photo 5.jpg'];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroPhoto((current) => (current + 1) % heroPhotos.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    getAdmissionScores()
      .then((data) => {
        if (isMounted) {
          setScores(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Lỗi tải dữ liệu thống kê tuyển sinh:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute stats strictly from Firestore data
  const stats = useMemo(() => {
    if (!scores || scores.length === 0) {
      return {
        totalMajors: 40,
        yearRange: '2023–2026',
        programsCount: 3,
      };
    }

    // Standard Chuẩn majors set
    const standardMajorsMap = new Map<string, boolean>();
    scores.forEach((s) => {
      const code = String(s.ma_nganh || '').trim().toUpperCase();
      const isChuan = s.he_dao_tao === 'Chuẩn' || !s.he_dao_tao;
      if (code && isChuan && !code.includes('_')) {
        if (code === '7220301') return; // Triết học Mác - Lênin code note
        standardMajorsMap.set(code, true);
      }
    });

    const validYears: number[] = Array.from(
      new Set(scores.map((s) => Number(s.nam)).filter((n): n is number => !isNaN(n) && n > 0))
    );
    validYears.sort((a: number, b: number) => a - b);
    const minYear = validYears[0] || 2023;
    const maxYear = validYears[validYears.length - 1] || 2026;

    // Programs / Hệ đào tạo
    const programs = new Set(scores.map((s) => s.he_dao_tao).filter(Boolean));

    return {
      totalMajors: standardMajorsMap.size > 0 ? standardMajorsMap.size : 40,
      yearRange: `${minYear}–${maxYear}`,
      programsCount: programs.size > 0 ? programs.size : 3,
    };
  }, [scores]);

  return (
    <div className="space-y-14 sm:space-y-20 pb-16">
      {/* ====================================================================
          1. HERO SECTION - Giới thiệu hệ thống (Phong cách Cổng tuyển sinh USSH)
          ==================================================================== */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="relative min-h-[420px] overflow-hidden rounded-xl bg-[#092f58] shadow-sm sm:min-h-[520px]">
          <img src={heroPhotos[heroPhoto]} alt="Trường Đại học Khoa học Xã hội và Nhân văn" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700" />
          <div className="absolute inset-0 bg-[#062b52]/15" />
          <div className="relative z-10 flex min-h-[420px] flex-col items-center justify-center px-5 py-12 text-center text-white sm:min-h-[520px] sm:px-8">
            <h1 className="max-w-5xl text-[1.4rem] font-black uppercase leading-[1.1] tracking-tight text-white drop-shadow-[0_2px_3px_rgba(5,29,67,0.9)] sm:text-4xl lg:text-5xl">
              Hệ thống hỗ trợ tra cứu,<br />định hướng ngành và dự đoán trúng tuyển USSH
            </h1>
            <p className="mt-5 max-w-3xl text-[11px] font-medium leading-relaxed text-white drop-shadow-[0_1px_2px_rgba(5,29,67,0.95)] sm:text-base">
              Cổng thông tin hỗ trợ thí sinh tra cứu điểm chuẩn, khám phá nhóm ngành phù hợp và tham khảo khả năng trúng tuyển từ dữ liệu tuyển sinh năm 2026.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-2 text-center sm:gap-16">
              <div className="drop-shadow-[0_1px_2px_rgba(5,29,67,0.95)]"><strong className="block text-[1.2rem] font-black text-[#ffd21a] sm:text-5xl">40+</strong><span className="block text-[8px] font-bold uppercase leading-tight sm:text-sm">Ngành</span></div>
              <div className="drop-shadow-[0_1px_2px_rgba(5,29,67,0.95)]"><strong className="block text-[1.2rem] font-black text-[#ffd21a] sm:text-5xl">3</strong><span className="block text-[8px] font-bold uppercase leading-tight sm:text-sm">Chương trình đào tạo</span></div>
              <div className="drop-shadow-[0_1px_2px_rgba(5,29,67,0.95)]"><strong className="block text-[1.1rem] font-black text-[#ffd21a] sm:text-5xl">2023–2026</strong><span className="block text-[8px] font-bold uppercase leading-tight sm:text-sm">DỮ LIỆU CÁC NĂM</span></div>
            </div>
            <div className="mt-7 flex items-center gap-1.5" aria-label="Ảnh nền trang chủ">
              {heroPhotos.map((photo, index) => (
                <button key={photo} type="button" aria-label={`Hiển thị ảnh ${index + 1}`} onClick={() => setHeroPhoto(index)} className={`h-2 rounded-full transition-all ${heroPhoto === index ? 'w-7 bg-white' : 'w-2 bg-white/60 hover:bg-white'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. HỆ THỐNG HỖ TRỢ BẠN NHỮNG GÌ? (5 Card chức năng theo đúng thứ tự menu)
          ==================================================================== */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="mx-auto max-w-3xl space-y-2 text-center">
          <h2 className="text-xl font-extrabold tracking-[-0.02em] text-[var(--ussh-blue-dark)] sm:text-3xl">
            HỆ THỐNG HỖ TRỢ BẠN NHỮNG GÌ?
          </h2>
          <p className="text-xs leading-relaxed text-slate-600 sm:text-base">
            Các công cụ được thiết kế để hỗ trợ thí sinh tìm hiểu thông tin tuyển sinh và tự đánh giá lựa chọn của mình.
          </p>
        </div>

        {/* 5 Function Cards in Exact Menu Order */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
          {/* 01. Tra cứu điểm chuẩn */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-[var(--ussh-blue)] transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--ussh-blue)]/10 text-[var(--ussh-blue-dark)] flex items-center justify-center group-hover:bg-[var(--ussh-blue)] group-hover:text-white transition-colors">
                  <Search className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-400">01</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[var(--ussh-blue-dark)] transition-colors mb-2">
                Tra cứu điểm chuẩn
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Tra cứu và lọc dữ liệu điểm chuẩn theo năm, ngành/chương trình, hệ đào tạo, hình thức xét tuyển và tổ hợp.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button
                id="card-btn-scores"
                onClick={() => onSelectTab('scores')}
                className="w-full py-2.5 px-4 rounded-lg bg-[var(--ussh-blue)] hover:bg-[var(--ussh-blue-dark)] text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <span>Tra cứu ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 02. Định hướng ngành */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-[var(--ussh-blue)] transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--ussh-red)]/10 text-[var(--ussh-red)] flex items-center justify-center group-hover:bg-[var(--ussh-red)] group-hover:text-white transition-colors">
                  <Compass className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-400">02</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[var(--ussh-blue-dark)] transition-colors mb-2">
                Định hướng ngành
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Thực hiện khảo sát để khám phá những ngành/chương trình phù hợp với đặc điểm và sở thích của bản thân.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button
                id="card-btn-orientation"
                onClick={() => onSelectTab('orientation')}
                className="w-full py-2.5 px-4 rounded-lg bg-[var(--ussh-red)] hover:bg-[var(--ussh-red-dark)] text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <span>Khám phá định hướng</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 03. Dự đoán trúng tuyển */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-[var(--ussh-red)] transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--ussh-blue)]/10 text-[var(--ussh-blue-dark)] flex items-center justify-center group-hover:bg-[var(--ussh-blue)] group-hover:text-white transition-colors">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-400">03</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[var(--ussh-red)] transition-colors mb-2">
                Dự đoán trúng tuyển
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Nhập thông tin xét tuyển để tham khảo khả năng trúng tuyển dựa trên dữ liệu tuyển sinh.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button
                id="card-btn-prediction"
                onClick={() => onSelectTab('prediction')}
                className="w-full py-2.5 px-4 rounded-lg bg-[var(--ussh-blue)] hover:bg-[var(--ussh-blue-dark)] text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <span>Thử dự đoán</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 04. Xem phân bố điểm */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-[var(--ussh-blue)] transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--ussh-red)]/10 text-[var(--ussh-red)] flex items-center justify-center group-hover:bg-[var(--ussh-red)] group-hover:text-white transition-colors">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-400">04</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[var(--ussh-blue-dark)] transition-colors mb-2">
                Xem phân bố điểm
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Xem phân bố điểm xét tuyển dự kiến được tổng hợp từ những lượt dự báo của người dùng.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button
                id="card-btn-distribution"
                onClick={() => onSelectTab('distribution')}
                className="w-full py-2.5 px-4 rounded-lg bg-[var(--ussh-red)] hover:bg-[var(--ussh-red-dark)] text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <span>Xem phân bố</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 05. Cẩm nang */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-[var(--ussh-blue)] transition-all flex flex-col justify-between group md:col-span-2 lg:col-span-1">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--ussh-blue)]/10 text-[var(--ussh-blue-dark)] flex items-center justify-center group-hover:bg-[var(--ussh-blue)] group-hover:text-white transition-colors">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-slate-400">05</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[var(--ussh-blue-dark)] transition-colors mb-2">
                Cẩm nang
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Tìm hiểu hướng dẫn sử dụng hệ thống và các thông tin cần biết trong quá trình tra cứu, định hướng và dự đoán.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button
                id="card-btn-guide"
                onClick={() => onSelectTab('guide')}
                className="w-full py-2.5 px-4 rounded-lg bg-[var(--ussh-blue)] hover:bg-[var(--ussh-blue-dark)] text-white text-xs sm:text-sm font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <span>Xem cẩm nang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

        {false && <>
        {/* ====================================================================
          3. DỮ LIỆU TUYỂN SINH TRONG HỆ THỐNG & DỮ LIỆU ĐƯỢC SỬ DỤNG
          ==================================================================== */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-xs space-y-8">
          <div className="max-w-3xl space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--ussh-blue-dark)] tracking-tight">
              Dữ liệu tuyển sinh trong hệ thống
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Hệ thống sử dụng dữ liệu tuyển sinh được tổng hợp theo từng năm, ngành/chương trình, hệ đào tạo, hình thức xét tuyển, tổ hợp và điểm chuẩn để hỗ trợ các chức năng tra cứu và dự đoán.
            </p>
          </div>

          {/* 4 Overview Statistics - Dynamically derived from Firestore */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Stat 1: 40+ ngành */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80">
              <div className="flex items-center space-x-2 text-slate-500 mb-2">
                <Database className="w-4 h-4 text-[var(--ussh-blue)]" />
                <span className="text-xs font-semibold uppercase tracking-wider">Ngành/Chương trình</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[var(--ussh-blue-dark)]">
                {loading ? '...' : '40+ ngành'}
              </div>
              <p className="text-xs text-slate-500 mt-1">Đang có trong hệ thống</p>
            </div>

            {/* Stat 2: 2023–2026 */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80">
              <div className="flex items-center space-x-2 text-slate-500 mb-2">
                <Calendar className="w-4 h-4 text-[var(--ussh-red)]" />
                <span className="text-xs font-semibold uppercase tracking-wider">Dữ liệu tuyển sinh</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[var(--ussh-blue-dark)]">
                {stats.yearRange}
              </div>
              <p className="text-xs text-slate-500 mt-1">Giai đoạn xét tuyển liên tục</p>
            </div>

            {/* Stat 3: Mô phỏng xét tuyển */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80">
              <div className="flex items-center space-x-2 text-slate-500 mb-2">
                <Layers className="w-4 h-4 text-[var(--ussh-blue)]" />
                <span className="text-xs font-semibold uppercase tracking-wider">Mô phỏng xét tuyển</span>
              </div>
              <div className="text-base sm:text-lg font-extrabold text-[var(--ussh-blue-dark)] uppercase leading-tight">
                Mô phỏng xét tuyển
              </div>
              <p className="text-xs text-slate-500 mt-1">Mô phỏng điểm xét tuyển và tham khảo khả năng trúng tuyển.</p>
            </div>

            {/* Stat 4: 3 Chương trình/hệ đào tạo */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80">
              <div className="flex items-center space-x-2 text-slate-500 mb-2">
                <GraduationCap className="w-4 h-4 text-[var(--ussh-red)]" />
                <span className="text-xs font-semibold uppercase tracking-wider">Hệ đào tạo</span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[var(--ussh-blue-dark)]">
                {stats.programsCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">Chương trình đào tạo</p>
            </div>

            {/* Stat 5: Dữ liệu tổng hợp dự báo */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80">
              <div className="flex items-center space-x-2 text-slate-500 mb-2">
                <Database className="w-4 h-4 text-[var(--ussh-red)]" />
                <span className="text-xs font-semibold uppercase tracking-wider">Dữ liệu tổng hợp dự báo</span>
              </div>
              <div className="text-base sm:text-lg font-extrabold text-[var(--ussh-blue-dark)] uppercase leading-tight">
                Dữ liệu tổng hợp dự báo
              </div>
              <p className="text-xs text-slate-500 mt-1">Tổng hợp dữ liệu phục vụ tham khảo và mô phỏng khả năng trúng tuyển.</p>
            </div>
          </div>

          {/* Dữ liệu được sử dụng context card */}
          <div className="bg-blue-50/70 rounded-xl p-4 sm:p-5 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-[var(--ussh-blue-dark)] uppercase tracking-wide">
                Nguồn dữ liệu tuyển sinh
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed">
                Dữ liệu tuyển sinh được quản lý và cập nhật thông qua hệ thống cơ sở dữ liệu chính thức của Nhà trường, phản ánh trung thực kết quả điểm chuẩn và chỉ tiêu qua các mùa tuyển sinh.
              </p>
            </div>
            <div className="shrink-0 flex items-center space-x-2">
              <button
                onClick={() => onSelectTab('scores')}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-[var(--ussh-blue-dark)] border border-blue-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
              >
                Xem chi tiết dữ liệu
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. ĐỊNH HƯỚNG NGÀNH (Chưa biết nên tìm hiểu ngành nào?)
          ==================================================================== */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#eaf5fc] text-[var(--ussh-blue-dark)] rounded-xl p-6 sm:p-8 lg:p-10 border border-[#c8e1f2] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-white text-xs font-medium text-[var(--ussh-blue-dark)] border border-[#c8e1f2]">
              <Compass className="w-3.5 h-3.5 text-[var(--ussh-blue)]" />
              <span>Khảo sát hướng nghiệp</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--ussh-blue-dark)] tracking-tight">
              Chưa biết nên tìm hiểu ngành nào?
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Khảo sát ngắn giúp hệ thống phân tích đặc điểm và mức độ phù hợp của bạn với các ngành/chương trình đang có trong hệ thống.
            </p>
            <div className="text-xs text-[var(--ussh-blue)] font-medium">
              40+ ngành hiện có trong dữ liệu
            </div>
          </div>

          <div className="shrink-0">
            <button
              id="cta-survey-btn"
              onClick={() => onSelectTab('orientation')}
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-[var(--ussh-blue-dark)] text-sm font-bold shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Thực hiện khảo sát</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. DỰ ĐOÁN TRÚNG TUYỂN (Tham khảo khả năng trúng tuyển)
          ==================================================================== */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--ussh-red)]/10 text-xs font-semibold text-[var(--ussh-red)]">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Phân tích dữ liệu xét tuyển</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Tham khảo khả năng trúng tuyển
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Nhập thông tin xét tuyển để hệ thống tính toán kết quả dự báo dựa trên dữ liệu tuyển sinh được sử dụng trong hệ thống.
            </p>
            <p className="text-[11px] sm:text-xs text-slate-500 italic">
              * Kết quả mang tính chất tham khảo, không thay thế kết quả tuyển sinh chính thức.
            </p>
          </div>

          <div className="shrink-0">
            <button
              id="cta-prediction-btn"
              onClick={() => onSelectTab('prediction')}
              className="px-6 py-3 rounded-xl bg-[var(--ussh-red)] hover:bg-[#b00f21] text-white text-sm font-bold shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Thử dự đoán</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. PHÂN BỐ ĐIỂM (Phân bố điểm xét tuyển dự kiến)
          ==================================================================== */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--ussh-blue)]/10 text-xs font-semibold text-[var(--ussh-blue-dark)]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Thống kê cộng đồng dự báo</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Phân bố điểm xét tuyển dự kiến
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Xem xu hướng phân bố điểm xét tuyển dự kiến được tổng hợp từ dữ liệu người dùng đã thực hiện dự báo.
            </p>
          </div>

          <div className="shrink-0">
            <button
              id="cta-distribution-btn"
              onClick={() => onSelectTab('distribution')}
              className="px-6 py-3 rounded-xl bg-[var(--ussh-blue)] hover:bg-[var(--ussh-blue-dark)] text-white text-sm font-bold shadow-md transition-all flex items-center space-x-2 cursor-pointer"
            >
              <span>Xem phân bố điểm</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. CẨM NANG TUYỂN SINH (4 nhóm nội dung)
          ==================================================================== */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--ussh-blue-dark)] tracking-tight">
              Cẩm nang của hệ thống
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Tổng hợp cẩm nang và hướng dẫn sử dụng giúp thí sinh nắm rõ quy trình xét tuyển
            </p>
          </div>
          <button
            onClick={() => onSelectTab('guide')}
            className="text-xs font-semibold text-[var(--ussh-blue-dark)] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Xem toàn bộ cẩm nang</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <div
            onClick={() => onSelectTab('guide')}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-[var(--ussh-blue)] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[var(--ussh-blue)]/10 text-[var(--ussh-blue-dark)] flex items-center justify-center mb-3 group-hover:bg-[var(--ussh-blue)] group-hover:text-white transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5 group-hover:text-[var(--ussh-blue-dark)] transition-colors">
                Hướng dẫn tra cứu điểm chuẩn
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cách sử dụng các bộ lọc theo năm, tổ hợp, hệ đào tạo và tra cứu điểm trúng tuyển chính xác.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-[var(--ussh-blue-dark)] group-hover:translate-x-1 transition-transform">
              <span>Đọc hướng dẫn</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => onSelectTab('guide')}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-[var(--ussh-red)] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[var(--ussh-red)]/10 text-[var(--ussh-red)] flex items-center justify-center mb-3 group-hover:bg-[var(--ussh-red)] group-hover:text-white transition-colors">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5 group-hover:text-[var(--ussh-red)] transition-colors">
                Hướng dẫn sử dụng chức năng dự đoán
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Nhập mức điểm kỳ thi, giải thích các mức dự báo và cách đọc báo cáo phân tích tham khảo.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-[var(--ussh-red)] group-hover:translate-x-1 transition-transform">
              <span>Đọc hướng dẫn</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => onSelectTab('guide')}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-[var(--ussh-blue)] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[var(--ussh-blue)]/10 text-[var(--ussh-blue-dark)] flex items-center justify-center mb-3 group-hover:bg-[var(--ussh-blue)] group-hover:text-white transition-colors">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5 group-hover:text-[var(--ussh-blue-dark)] transition-colors">
                Hướng dẫn khảo sát định hướng ngành
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tìm hiểu cơ chế trắc nghiệm, các nhóm đặc điểm ngành học và cách đối chiếu ngành phù hợp.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-[var(--ussh-blue-dark)] group-hover:translate-x-1 transition-transform">
              <span>Đọc hướng dẫn</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => onSelectTab('guide')}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-[var(--ussh-blue)] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-[var(--ussh-blue)]/10 text-[var(--ussh-blue-dark)] flex items-center justify-center mb-3 group-hover:bg-[var(--ussh-blue)] group-hover:text-white transition-colors">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1.5 group-hover:text-[var(--ussh-blue-dark)] transition-colors">
                Câu hỏi thường gặp
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Giải đáp thắc mắc về phương thức xét tuyển, đối tượng ưu tiên, tổ hợp môn và quy chế chung.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-[var(--ussh-blue-dark)] group-hover:translate-x-1 transition-transform">
              <span>Xem câu hỏi</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          9. LƯU Ý KHI SỬ DỤNG
          ==================================================================== */}
      <section className="w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 sm:p-6 text-slate-800 flex items-start gap-4">
          <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1.5 text-xs sm:text-sm">
            <h3 className="font-bold text-amber-950 uppercase tracking-wide text-xs sm:text-sm">
              Lưu ý khi sử dụng
            </h3>
            <p className="text-slate-700 leading-relaxed">
              Kết quả dự đoán và các thông tin phân tích trên hệ thống nhằm mục đích hỗ trợ tham khảo và định hướng cho thí sinh. Điểm trúng tuyển chính thức do Hội đồng Tuyển sinh công bố.
            </p>
          </div>
        </div>
      </section>
      </>}
    </div>
  );
};
