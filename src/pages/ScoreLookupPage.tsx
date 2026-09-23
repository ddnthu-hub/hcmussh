import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Major, NavigationTab, AdmissionScoreDoc } from '../types';
import { DETAILED_SCORE_RECORDS, DetailedScoreEntry, MAJORS_DATA, TrainingProgramType } from '../data/admissionData';
import { 
  getAdmissionScores, 
  getFirestoreConnectionInfo, 
  subscribeFirestoreStatus, 
  FirestoreStatusInfo 
} from '../lib/firebase';
import { Pagination } from '../components/Pagination';
import { 
  Search, 
  RotateCcw,
  ChevronDown
} from 'lucide-react';

interface ScoreLookupPageProps {
  onSelectTab: (tab: NavigationTab) => void;
  onViewMajor: (major: Major) => void;
  onSelectMajorForPrediction: (majorIds: string[], filters?: { programType?: string; admissionForm?: string; combination?: string }) => void;
}

// 1. Supported Admission Years (Strictly 2023 - 2026, no 2022)
export const SUPPORTED_ADMISSION_YEARS = [2026, 2025, 2024, 2023] as const;
const ALL_YEARS_VALUE = 'all';
const SCORE_LOOKUP_SESSION_KEY = 'ussh_score_lookup_page_state';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectFilterProps {
  id: string;
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  summary: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  singleSelect?: boolean;
}

const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({ id, label, options, selected, onChange, summary, isOpen, onOpen, onClose, singleSelect = false }) => {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const handleDocumentPointerDown = (event: PointerEvent) => {
      if (detailsRef.current?.open && !detailsRef.current.contains(event.target as Node)) {
        onCloseRef.current();
      }
    };

    document.addEventListener('pointerdown', handleDocumentPointerDown);
    return () => document.removeEventListener('pointerdown', handleDocumentPointerDown);
  }, []);

  const handleOptionChange = (value: string, checked: boolean) => {
    if (singleSelect) {
      onChange(checked ? [value] : ['all']);
      return;
    }

    if (value === ALL_YEARS_VALUE || value === 'all') {
      onChange(checked ? ['all'] : []);
      return;
    }

    const next = checked
      ? Array.from(new Set([...selected.filter((item) => item !== 'all'), value]))
      : selected.filter((item) => item !== value && item !== 'all');
    onChange(next.length > 0 ? next : ['all']);
  };

  return (
    <details ref={detailsRef} open={isOpen} className={`relative isolate group ${isOpen ? 'z-50' : 'z-0'}`}>
      <summary id={id} onClick={(event) => { event.preventDefault(); isOpen ? onClose() : onOpen(); }} className="flex w-full cursor-pointer list-none items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 marker:hidden">
        <span className="truncate">{summary}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="absolute left-0 right-0 z-[60] mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
        {options.map((option) => {
          const checked = selected.includes(option.value) || (option.value === 'all' && selected.length === 0);
          return (
            <label key={option.value} className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-2 text-xs text-slate-700 hover:bg-slate-50">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => handleOptionChange(option.value, event.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--ussh-blue)]"
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    </details>
  );
};

// 2. Standard 3 Training Program Types
export function formatTrainingType(rawType: string | null | undefined): TrainingProgramType {
  if (!rawType) return 'Chương trình chuẩn';
  const norm = rawType.trim().toUpperCase();
  if (norm === 'CHUẨN' || norm === 'CHUAN' || norm === 'CHƯƠNG TRÌNH CHUẨN') {
    return 'Chương trình chuẩn';
  }
  if (
    norm === 'CLC' || 
    norm === 'CHẤT LƯỢNG CAO' || 
    norm === 'CHAT LUONG CAO' || 
    norm === 'CHUẨN QUỐC TẾ' || 
    norm === 'CHƯƠNG TRÌNH CHUẨN QUỐC TẾ'
  ) {
    return 'Chương trình chuẩn quốc tế';
  }
  if (
    norm === 'LIÊN KẾT' || 
    norm === 'LIEN KET' || 
    norm === 'LIEN_KET' || 
    norm === 'CỬ NHÂN QUỐC TẾ' || 
    norm === 'CỬ NHÂN LIÊN KẾT' || 
    norm === 'CHƯƠNG TRÌNH LIÊN KẾT VỚI NƯỚC NGOÀI' ||
    norm === 'LIÊN KẾT ĐÀO TẠO VỚI NƯỚC NGOÀI'
  ) {
    return 'Chương trình liên kết với nước ngoài';
  }
  return 'Chương trình chuẩn';
}

// 3. Normalize 2026 Admission Methods (doi_tuong -> Friendly Name)
export function normalizeDoiTuong2026(raw: string | null | undefined): string {
  if (!raw) return 'THPT + ĐGNL + Học bạ';
  const s = raw.trim().toUpperCase().replace(/[\s_-]/g, '');
  if (s === 'DT01' || s === 'ĐT01' || s.endsWith('01') || s.includes('01')) {
    return 'THPT + ĐGNL + Học bạ';
  }
  if (s === 'DT02' || s === 'ĐT02' || s.endsWith('02') || s.includes('02')) {
    return 'THPT + Học bạ';
  }
  if (s === 'DT03' || s === 'ĐT03' || s.endsWith('03') || s.includes('03')) {
    return 'ĐGNL + Học bạ';
  }
  return raw.trim();
}

// 4. Normalize 2023 - 2025 Admission Methods (ma_pt -> Friendly Name)
export function formatMethod2023_2025(ma_pt: string | null | undefined): string {
  if (!ma_pt) return 'Thi tốt nghiệp THPT';
  const code = ma_pt.trim().toUpperCase();
  if (code === 'THPT' || code === 'PT1_THPT') return 'Thi tốt nghiệp THPT';
  if (code === 'DGNL' || code === 'PT2_DGNL') return 'ĐGNL ĐHQG-HCM';
  if (code === 'UTXT_DHQG') return 'Ưu tiên xét tuyển ĐHQG-HCM';
  if (code === 'UTXT_PT') return 'Ưu tiên xét tuyển theo Đề án PT';
  if (code === 'UTXT_TSGN') return 'Tuyển thẳng & Ưu tiên TSGN';
  if (code === 'HSG_DOITUYEN') return 'HSG Đội tuyển / Quốc gia';
  return ma_pt;
}

// 5. Determine Score Scale with prioritized checks
export function getScoreScale(record: {
  year?: number;
  thang_diem?: number;
  ma_pt?: string | null;
  admissionMethod?: string | null;
  score?: number;
  doi_tuong?: string | null;
}): 30 | 100 | 1200 {
  // 1. If thang_diem exists and is a valid scale
  if (record.thang_diem === 30 || record.thang_diem === 100 || record.thang_diem === 1200) {
    return record.thang_diem;
  }

  // 2. Year + Method / Doi tuong
  const year = Number(record.year);
  if (year === 2026) {
    return 100;
  }

  const methodUpper = (record.ma_pt || record.admissionMethod || '').toUpperCase();
  if (methodUpper.includes('DGNL') || methodUpper.includes('ĐGNL')) {
    return 1200;
  }

  // 3. Metadata or Score Value Range
  const score = typeof record.score === 'number' ? record.score : 0;
  if (score > 100) {
    return 1200;
  }
  if (score > 30 && score <= 100) {
    return 100;
  }
  return 30;
}

// 6. Score Range Options Specification
export interface ScoreRangeOption {
  id: string;
  label: string;
  min: number;
  max: number;
  scale: 30 | 100 | 1200;
}

// 2026: 100-point scale
export const SCORE_RANGES_2026: ScoreRangeOption[] = [
  { id: '100_70_74_99', label: '70.00 – 74.99', min: 70.0, max: 74.999, scale: 100 },
  { id: '100_75_79_99', label: '75.00 – 79.99', min: 75.0, max: 79.999, scale: 100 },
  { id: '100_80_84_99', label: '80.00 – 84.99', min: 80.0, max: 84.999, scale: 100 },
  { id: '100_85_89_99', label: '85.00 – 89.99', min: 85.0, max: 89.999, scale: 100 },
  { id: '100_90_94_99', label: '90.00 – 94.99', min: 90.0, max: 94.999, scale: 100 },
  { id: '100_95_100', label: '95.00 – 100.00', min: 95.0, max: 100.001, scale: 100 },
];

// 2023 - 2025: 30-point scale
export const SCORE_RANGES_2023_2025_SCALE_30: ScoreRangeOption[] = [
  { id: '30_15_19_99', label: '15.00 – 19.99', min: 15.0, max: 19.999, scale: 30 },
  { id: '30_20_21_99', label: '20.00 – 21.99', min: 20.0, max: 21.999, scale: 30 },
  { id: '30_22_23_99', label: '22.00 – 23.99', min: 22.0, max: 23.999, scale: 30 },
  { id: '30_24_25_99', label: '24.00 – 25.99', min: 24.0, max: 25.999, scale: 30 },
  { id: '30_26_27_99', label: '26.00 – 27.99', min: 26.0, max: 27.999, scale: 30 },
  { id: '30_28_30', label: '28.00 – 30.00', min: 28.0, max: 30.001, scale: 30 },
];

// 2023 - 2025: 1200-point scale
export const SCORE_RANGES_2023_2025_SCALE_1200: ScoreRangeOption[] = [
  { id: '1200_600_699', label: '600 – 699', min: 600, max: 699.999, scale: 1200 },
  { id: '1200_700_799', label: '700 – 799', min: 700, max: 799.999, scale: 1200 },
  { id: '1200_800_899', label: '800 – 899', min: 800, max: 899.999, scale: 1200 },
  { id: '1200_900_999', label: '900 – 999', min: 900, max: 999.999, scale: 1200 },
  { id: '1200_1000_1099', label: '1000 – 1099', min: 1000, max: 1099.999, scale: 1200 },
  { id: '1200_1100_1200', label: '1100 – 1200', min: 1100, max: 1200.001, scale: 1200 },
];

// 2026 Methods
export const ADMISSION_METHODS_2026 = [
  'THPT + ĐGNL + Học bạ',
  'THPT + Học bạ',
  'ĐGNL + Học bạ',
] as const;

// 7. Mapping Firestore document to UI model
function mapScoreDocToEntry(s: AdmissionScoreDoc): DetailedScoreEntry {
  const year = Number(s.nam);
  let admissionMethod = '';
  const rawMethodCode = s.ma_pt || '';
  const doiTuong = s.doi_tuong || '';

  if (year === 2026) {
    admissionMethod = normalizeDoiTuong2026(s.doi_tuong);
  } else {
    admissionMethod = formatMethod2023_2025(s.ma_pt);
  }

  const programType = formatTrainingType(s.he_dao_tao);

  const maxScore = getScoreScale({
    year,
    thang_diem: s.thang_diem,
    ma_pt: s.ma_pt,
    admissionMethod,
    score: s.diem_chuan,
    doi_tuong: s.doi_tuong
  });

  return {
    id: s.id,
    year,
    majorCode: s.ma_nganh,
    majorName: s.ten_nganh,
    programType,
    admissionMethod,
    rawMethodCode,
    doiTuong,
    combination: s.to_hop && s.to_hop.trim().toUpperCase() !== 'ĐGNL' ? s.to_hop.trim() : '',
    score: s.diem_chuan,
    maxScore,
    notes: s.ghi_chu || undefined,
  };
}

export const ScoreLookupPage: React.FC<ScoreLookupPageProps> = ({
  onSelectTab,
  onViewMajor,
  onSelectMajorForPrediction,
}) => {
  const [allRecords, setAllRecords] = useState<DetailedScoreEntry[]>(() => {
    // Filter out any older year like 2022 from fallback
    return DETAILED_SCORE_RECORDS
      .filter((r) => r.year >= 2023)
      .map((r) => ({
        ...r,
        programType: formatTrainingType(r.programType),
        admissionMethod: r.year === 2026 ? normalizeDoiTuong2026(r.admissionMethod) : r.admissionMethod,
        combination: r.combination && r.combination.trim().toUpperCase() !== 'ĐGNL' ? r.combination.trim() : '',
      }));
  });

  const [dbStatus, setDbStatus] = useState<FirestoreStatusInfo>(getFirestoreConnectionInfo());
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Filters state
  const [selectedYears, setSelectedYears] = useState<string[]>(['2026']);
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['all']);
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(['all']);
  const [selectedCombinations, setSelectedCombinations] = useState<string[]>(['all']);
  const [selectedScoreRanges, setSelectedScoreRanges] = useState<string[]>(['all']);
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const hasHydratedLookupState = useRef(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SCORE_LOOKUP_SESSION_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.searchInput !== undefined) setSearchInput(saved.searchInput);
        if (saved.searchTerm !== undefined) setSearchTerm(saved.searchTerm);
        if (saved.selectedYears) {
          const savedYears = saved.selectedYears.filter((year: string) => year !== ALL_YEARS_VALUE && SUPPORTED_ADMISSION_YEARS.includes(Number(year) as typeof SUPPORTED_ADMISSION_YEARS[number]));
          setSelectedYears(savedYears.length > 0 ? savedYears : ['2026']);
        }
        if (saved.selectedMethods) setSelectedMethods(saved.selectedMethods);
        if (saved.selectedPrograms) setSelectedPrograms(saved.selectedPrograms);
        if (saved.selectedCombinations) setSelectedCombinations(saved.selectedCombinations);
        if (saved.selectedScoreRanges) setSelectedScoreRanges(saved.selectedScoreRanges);
        if (saved.rowsPerPage) setRowsPerPage(saved.rowsPerPage);
        if (saved.currentPage) setCurrentPage(saved.currentPage);
      }
    } catch {
      sessionStorage.removeItem(SCORE_LOOKUP_SESSION_KEY);
    } finally {
      hasHydratedLookupState.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hasHydratedLookupState.current) return;
    sessionStorage.setItem(SCORE_LOOKUP_SESSION_KEY, JSON.stringify({
      searchInput,
      searchTerm,
      selectedYears,
      selectedMethods,
      selectedPrograms,
      selectedCombinations,
      selectedScoreRanges,
      rowsPerPage,
      currentPage,
    }));
  }, [searchInput, searchTerm, selectedYears, selectedMethods, selectedPrograms, selectedCombinations, selectedScoreRanges, rowsPerPage, currentPage]);

  const loadScoresData = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);

    try {
      const scores = await getAdmissionScores(force);
      if (scores && scores.length > 0) {
        // Exclude 2022 if any exists in database
        const filteredDocs = scores.filter((s) => s.nam >= 2023);
        const mapped = filteredDocs.map(mapScoreDocToEntry);
        setAllRecords(mapped);
      }
    } catch (err) {
      console.warn('Could not refresh scores from Firestore:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsub = subscribeFirestoreStatus((status) => {
      setDbStatus(status);
    });
    loadScoresData();
    return () => unsub();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput.trim());
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setSelectedYears(['2026']);
    setSelectedMethods(['all']);
    setSelectedPrograms(['all']);
    setSelectedCombinations(['all']);
    setSelectedScoreRanges(['all']);
    setCurrentPage(1);
    sessionStorage.removeItem(SCORE_LOOKUP_SESSION_KEY);
  };

  const handleYearsChange = (values: string[]) => {
    setSelectedYears(values);
    setSelectedMethods(['all']);
    setSelectedPrograms(['all']);
    setSelectedCombinations(['all']);
    setSelectedScoreRanges(['all']);
    setCurrentPage(1);
  };

  const selectedYearNumbers = selectedYears.map(Number);
  const hasSingle2026 = selectedYears.length === 1 && selectedYears[0] === '2026';

  // Compute available combinations for selected years without subject names
  const availableCombinations = useMemo(() => {
    const yearRecords = allRecords.filter((r) => {
      const matchesYear = selectedYearNumbers.includes(r.year);
      const matchesMethod = selectedMethods.includes('all') || selectedMethods.includes(r.admissionMethod);
      return matchesYear && matchesMethod;
    });
    const set = new Set<string>();
    for (const r of yearRecords) {
      if (r.combination && r.combination.trim() && r.combination.trim().toUpperCase() !== 'ĐGNL') {
        set.add(r.combination.trim());
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }));
  }, [allRecords, selectedYears, selectedMethods]);

  useEffect(() => {
    if (selectedCombinations.includes('all')) return;
    const valid = selectedCombinations.filter((combination) => availableCombinations.includes(combination));
    const next = valid.length > 0 ? valid : ['all'];
    if (next.length !== selectedCombinations.length || next.some((value, index) => value !== selectedCombinations[index])) {
      setSelectedCombinations(next);
    }
  }, [availableCombinations, selectedCombinations]);

  // Compute available admission methods for 2023-2025
  const availableMethods2023_2025 = useMemo(() => {
    const yearRecords = allRecords.filter((r) => selectedYearNumbers.some((year) => year !== 2026 && year === r.year));
    const found = new Set<string>();
    for (const r of yearRecords) {
      if (r.admissionMethod) found.add(r.admissionMethod);
    }
    const standardOrder = [
      'Thi tốt nghiệp THPT',
      'ĐGNL ĐHQG-HCM',
      'Ưu tiên xét tuyển ĐHQG-HCM',
      'Ưu tiên xét tuyển theo Đề án PT',
      'Tuyển thẳng & Ưu tiên TSGN',
      'HSG Đội tuyển / Quốc gia'
    ];
    const ordered: string[] = [];
    for (const m of standardOrder) {
      if (found.has(m)) ordered.push(m);
    }
    for (const m of found) {
      if (!ordered.includes(m)) ordered.push(m);
    }
    return ordered;
  }, [allRecords, selectedYears]);

  // Check whether a score record matches selected score range
  const matchesScoreRange = (
    rec: DetailedScoreEntry,
    rangeId: string,
    year: number
  ): boolean => {
    if (!rangeId || rangeId === 'all') return true;

    const scale = getScoreScale({
      year: rec.year,
      thang_diem: rec.maxScore,
      ma_pt: rec.rawMethodCode,
      admissionMethod: rec.admissionMethod,
      score: rec.score,
      doi_tuong: rec.doiTuong
    });

    let targetOption: ScoreRangeOption | undefined;
    if (year === 2026) {
      targetOption = SCORE_RANGES_2026.find((o) => o.id === rangeId);
    } else {
      targetOption = SCORE_RANGES_2023_2025_SCALE_30.find((o) => o.id === rangeId) ||
                     SCORE_RANGES_2023_2025_SCALE_1200.find((o) => o.id === rangeId);
    }

    if (!targetOption) return true;
    if (scale !== targetOption.scale) return false;

    return rec.score >= targetOption.min && rec.score <= targetOption.max;
  };

  // Filter the detailed records
  const filteredRecords = useMemo(() => {
    return allRecords.filter((rec) => {
      // 1. Search matches name or code
      const matchesSearch = 
        !searchTerm ||
        rec.majorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.majorCode.includes(searchTerm);

      // 2. Year filter
      const matchesYear = selectedYears.includes('all') || selectedYears.includes(String(rec.year));

      // 3. Method filter
      const matchesMethod = selectedMethods.includes('all') || selectedMethods.includes(rec.admissionMethod);

      // 4. Program filter (strictly matched to standard 3 training types)
      const matchesProgram = selectedPrograms.includes('all') || selectedPrograms.includes(rec.programType);

      // 5. Combination filter
      const matchesCombination = selectedCombinations.includes('all') || selectedCombinations.includes(rec.combination);

      // 6. Score range filter
      const matchesRange = selectedScoreRanges.includes('all') || selectedScoreRanges.some((range) => matchesScoreRange(rec, range, rec.year));

      return matchesSearch && matchesYear && matchesMethod && matchesProgram && matchesCombination && matchesRange;
    });
  }, [allRecords, searchTerm, selectedYears, selectedMethods, selectedPrograms, selectedCombinations, selectedScoreRanges]);

  const selectedYearLabel = selectedYears.join(', ');

  const methodOptions = [
    ...(selectedYearNumbers.includes(2026) ? ADMISSION_METHODS_2026.map((method) => ({ value: method, label: method })) : []),
    ...availableMethods2023_2025.map((method) => ({ value: method, label: method })),
  ].filter((option, index, options) => options.findIndex((item) => item.value === option.value) === index);
  const scoreRangeOptions = hasSingle2026
    ? SCORE_RANGES_2026.map((range) => ({ value: range.id, label: range.label }))
    : [
        ...(selectedYearNumbers.includes(2026) ? SCORE_RANGES_2026.map((range) => ({ value: range.id, label: `${range.label} (thang 100)` })) : []),
        ...SCORE_RANGES_2023_2025_SCALE_30.map((range) => ({ value: range.id, label: `${range.label} (thang 30)` })),
        ...SCORE_RANGES_2023_2025_SCALE_1200.map((range) => ({ value: range.id, label: `${range.label} (thang 1200)` })),
      ];
  const filterSummary = (selected: string[], allLabel: string, countLabel: string) => {
    if (selected.includes('all') || selected.length === 0) return allLabel;
    if (selected.length === 1) return selected[0];
    return `${selected.length} ${countLabel} được chọn`;
  };

  const totalResults = filteredRecords.length;
  const totalPages = Math.ceil(totalResults / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalResults);
  const currentRecords = filteredRecords.slice(startIndex, endIndex);

  const handleRowClick = (record: DetailedScoreEntry) => {
    const major = MAJORS_DATA.find((m) => m.code === record.majorCode);
    if (major) {
      onViewMajor(major);
    }
  };

  return (
    <div className="w-full max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ussh-blue-dark)] tracking-tight">
            Tra cứu thông tin và điểm chuẩn tuyển sinh
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Dữ liệu tuyển sinh chính thức Trường Đại học Khoa học Xã hội và Nhân văn, Đại học Quốc gia TP.HCM
          </p>
        </div>
      </div>

      <div className="sticky top-[74px] z-40 -mx-3 space-y-3 bg-white/95 px-3 py-3 shadow-sm backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="flex items-center justify-center max-w-2xl mx-auto gap-2 print:hidden">
        <div className="relative flex-1">
          <input
            id="search-major-input"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Nhập tên ngành hoặc mã ngành..."
            className="w-full pl-4 pr-10 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:border-[var(--ussh-blue)] focus:ring-1 focus:ring-[var(--ussh-blue)] text-sm text-slate-800 placeholder-slate-400 bg-white shadow-2xs"
          />
          <button
            type="button"
            aria-label="Xóa tìm kiếm ngành"
            title="Hiển thị tất cả ngành"
            onClick={() => { setSearchInput(''); setSearchTerm(''); setCurrentPage(1); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-sm font-bold cursor-pointer"
          >
            ×
          </button>
        </div>

        <button
          id="search-major-submit-btn"
          type="submit"
          className="px-6 py-2 rounded-lg bg-[var(--ussh-blue)] hover:bg-[var(--ussh-blue-dark)] text-white text-sm font-semibold transition-colors shadow-2xs whitespace-nowrap cursor-pointer"
        >
          Tìm kiếm
        </button>
      </form>

      {/* Bộ lọc dữ liệu */}
      <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-2xs">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-700">Bộ lọc</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
          <div>
            <MultiSelectFilter id="filter-year-select" label="Năm xét tuyển" selected={selectedYears} onChange={handleYearsChange} summary={filterSummary(selectedYears, 'Chọn năm', 'năm')} options={SUPPORTED_ADMISSION_YEARS.map((year) => ({ value: String(year), label: String(year) }))} isOpen={openFilter === 'year'} onOpen={() => setOpenFilter('year')} onClose={() => setOpenFilter(null)} singleSelect />
          </div>

          <div>
            <MultiSelectFilter id="filter-method-select" label="Hình thức xét tuyển" selected={selectedMethods} onChange={(values) => { setSelectedMethods(values); setCurrentPage(1); }} summary={filterSummary(selectedMethods, 'Tất cả hình thức', 'hình thức')} options={[{ value: 'all', label: 'Tất cả hình thức' }, ...methodOptions]} isOpen={openFilter === 'method'} onOpen={() => setOpenFilter('method')} onClose={() => setOpenFilter(null)} />
          </div>

          <div>
            <MultiSelectFilter id="filter-program-select" label="Hệ đào tạo" selected={selectedPrograms} onChange={(values) => { setSelectedPrograms(values); setCurrentPage(1); }} summary={filterSummary(selectedPrograms, 'Tất cả hệ đào tạo', 'hệ đào tạo')} options={[{ value: 'all', label: 'Tất cả hệ đào tạo' }, { value: 'Chương trình chuẩn', label: 'Chương trình chuẩn' }, { value: 'Chương trình chuẩn quốc tế', label: 'Chương trình chuẩn quốc tế' }, { value: 'Chương trình liên kết với nước ngoài', label: 'Chương trình liên kết với nước ngoài' }]} isOpen={openFilter === 'program'} onOpen={() => setOpenFilter('program')} onClose={() => setOpenFilter(null)} />
          </div>

          <div>
            <MultiSelectFilter id="filter-combination-select" label="Tổ hợp xét tuyển" selected={selectedCombinations} onChange={(values) => { setSelectedCombinations(values); setCurrentPage(1); }} summary={filterSummary(selectedCombinations, 'Tất cả tổ hợp', 'tổ hợp')} options={[{ value: 'all', label: 'Tất cả tổ hợp' }, ...availableCombinations.map((combination) => ({ value: combination, label: combination }))]} isOpen={openFilter === 'combination'} onOpen={() => setOpenFilter('combination')} onClose={() => setOpenFilter(null)} />
          </div>

          <div>
            <MultiSelectFilter id="filter-score-range-select" label="Khoảng điểm" selected={selectedScoreRanges} onChange={(values) => { setSelectedScoreRanges(values); setCurrentPage(1); }} summary={filterSummary(selectedScoreRanges, 'Tất cả khoảng điểm', 'khoảng điểm')} options={[{ value: 'all', label: 'Tất cả khoảng điểm' }, ...scoreRangeOptions]} isOpen={openFilter === 'scoreRange'} onOpen={() => setOpenFilter('scoreRange')} onClose={() => setOpenFilter(null)} />
          </div>
        </div>
      </div>
      </div>

      {/* Counter & Rows selector */}
      <div className="mt-1 flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:px-2">
        <div className="leading-relaxed">
          {totalResults > 0 ? (
            <span>
              Tìm thấy <strong className="text-slate-900 font-bold">{totalResults.toLocaleString('vi-VN')}</strong> kết quả điểm chuẩn
              {selectedYears.length > 0 && (
                <span className="ml-1 text-slate-500">năm {selectedYearLabel}</span>
              )}
            </span>
          ) : (
            <span>Không có kết quả phù hợp với bộ lọc hiện tại</span>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-slate-500">Hiển thị mỗi trang:</span>
          <select
            id="rows-per-page-select"
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="py-1 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-semibold focus:outline-hidden focus:border-[var(--ussh-blue)] cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Main Score Table (Screen View with Pagination) */}
      <div id="score-lookup-table-container" className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="admission-score-table">
            <thead>
              <tr className="bg-[#f4f7fb] border-b border-slate-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-20">NĂM</th>
                <th className="py-3.5 px-4 w-28">MÃ NGÀNH</th>
                <th className="py-3.5 px-4">TÊN NGÀNH</th>
                <th className="py-3.5 px-4 text-center">HỆ ĐÀO TẠO</th>
                <th className="py-3.5 px-4">HÌNH THỨC XÉT TUYỂN</th>
                <th className="py-3.5 px-4 text-center">TỔ HỢP</th>
                <th className="py-3.5 px-4 text-right">ĐIỂM CHUẨN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={`loading-skel-${i}`} className="animate-pulse">
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-12" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-48" /></td>
                    <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-16 mx-auto" /></td>
                    <td className="py-3.5 px-4"><div className="h-4 bg-slate-200 rounded w-36" /></td>
                    <td className="py-3.5 px-4 text-center"><div className="h-4 bg-slate-200 rounded w-12 mx-auto" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-4 bg-slate-200 rounded w-14 ml-auto" /></td>
                  </tr>
                ))
              )}

              {!loading && currentRecords.map((record) => (
                <tr
                  key={record.id}
                  onClick={() => handleRowClick(record)}
                  className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                >
                  {/* NĂM */}
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {record.year}
                  </td>

                  {/* MÃ NGÀNH */}
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {record.majorCode}
                  </td>

                  {/* TÊN NGÀNH */}
                  <td className="py-3.5 px-4 font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                    {record.majorName}
                  </td>

                  {/* HỆ ĐÀO TẠO (Standardized 3 training types) */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] border border-slate-200 whitespace-nowrap">
                      {record.programType}
                    </span>
                  </td>

                  {/* HÌNH THỨC XÉT TUYỂN (Friendly name, no internal codes) */}
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {record.admissionMethod}
                  </td>

                  {/* TỔ HỢP (Only code, no subject names, unified Inter font) */}
                  <td className="py-3.5 px-4 text-center font-medium text-slate-700">
                    {record.combination}
                  </td>

                  {/* ĐIỂM CHUẨN (Original score formatting) */}
                  <td className="py-3.5 px-4 text-right font-bold text-[#d32f2f] text-sm">
                    {record.score % 1 === 0 ? record.score : record.score.toFixed(2)}
                  </td>
                </tr>
              ))}

              {!loading && currentRecords.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="max-w-md mx-auto space-y-2.5">
                      <p className="text-sm font-semibold text-slate-800">
                        Không tìm thấy dữ liệu điểm chuẩn phù hợp
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Vui lòng thử điều chỉnh lại bộ lọc, chọn năm khác (2026, 2025, 2024, 2023) hoặc đổi từ khóa tìm kiếm.
                      </p>
                      <div className="pt-2 flex items-center justify-center gap-2">
                        <button
                          onClick={handleResetFilters}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Đặt lại bộ lọc</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Shared Pagination component with auto scroll-to-top */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          scrollTargetId="score-lookup-table-container"
          totalRecords={totalResults}
          startIndex={startIndex}
          endIndex={startIndex + rowsPerPage}
        />
      </div>

      {/* Print-Only Full Table (Prints all matching filtered records across A4 pages) */}
      <div className="score-print-table hidden print:block">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold text-slate-800 uppercase tracking-wider">
              <th className="py-2 px-2.5 w-14">NĂM</th>
              <th className="py-2 px-2.5 w-20">MÃ NGÀNH</th>
              <th className="py-2 px-2.5">TÊN NGÀNH</th>
              <th className="py-2 px-2.5 text-center">HỆ ĐÀO TẠO</th>
              <th className="py-2 px-2.5">HÌNH THỨC XÉT TUYỂN</th>
              <th className="py-2 px-2.5 text-center">TỔ HỢP</th>
              <th className="py-2 px-2.5 text-right">ĐIỂM CHUẨN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-[10px]">
            {filteredRecords.map((record) => (
              <tr key={`print-row-${record.id}`}>
                <td className="py-1.5 px-2.5 text-slate-700">{record.year}</td>
                <td className="py-1.5 px-2.5 font-medium text-slate-800">{record.majorCode}</td>
                <td className="py-1.5 px-2.5 font-bold text-slate-900">{record.majorName}</td>
                <td className="py-1.5 px-2.5 text-center text-slate-700">{record.programType}</td>
                <td className="py-1.5 px-2.5 text-slate-700">{record.admissionMethod}</td>
                <td className="py-1.5 px-2.5 text-center font-medium text-slate-700">{record.combination}</td>
                <td className="py-1.5 px-2.5 text-right font-bold text-slate-900">
                  {record.score % 1 === 0 ? record.score : record.score.toFixed(2)}
                </td>
              </tr>
            ))}
            {filteredRecords.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 text-center text-slate-500">
                  Không có kết quả điểm chuẩn phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pt-3 mt-3 border-t border-slate-300 text-[9px] text-slate-500 flex justify-between">
          <span>Nguồn dữ liệu: Cổng tuyển sinh Trường ĐH KHXH&NV – ĐHQG TP.HCM</span>
          <span>Ngày in: {new Date().toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      {/* Bottom prediction CTA: only shown when the current lookup has results */}
      {totalResults > 0 && (
      <div className="bg-[var(--ussh-blue-subtle)] rounded-xl p-4 border border-[var(--ussh-blue-light)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs print:hidden">
        <div className="text-slate-700 text-center sm:text-left">
          <strong>Bạn muốn biết với mức điểm hiện tại và mức độ trúng tuyển ước tính của mình như thế nào?</strong>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => {
              const majorCodes = Array.from(new Set(filteredRecords.map((record) => record.majorCode.trim()).filter(Boolean)));
              if (majorCodes.length > 0) {
                const selectedProgramForPrediction = selectedPrograms.length === 1 && !selectedPrograms.includes('all') ? selectedPrograms[0] : undefined;
                const selectedCombinationForPrediction = selectedCombinations.length === 1 && !selectedCombinations.includes('all') ? selectedCombinations[0] : undefined;
                const selectedMethodForPrediction = selectedYears.length === 1 && selectedYears[0] === '2026' && selectedMethods.length === 1 && !selectedMethods.includes('all')
                  ? selectedMethods[0]
                  : undefined;
                onSelectMajorForPrediction(majorCodes, {
                  programType: selectedProgramForPrediction,
                  admissionForm: selectedMethodForPrediction,
                  combination: selectedCombinationForPrediction,
                });
              }
            }}
            className="px-3.5 py-1.5 rounded-lg bg-[var(--ussh-blue)] text-white font-semibold hover:bg-[var(--ussh-blue-dark)] transition-colors cursor-pointer"
          >
            Dự đoán trúng tuyển
          </button>
        </div>
      </div>
      )}
    </div>
  );
};
