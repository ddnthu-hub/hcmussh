import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Major, NavigationTab } from '../types';
import { 
  MAJORS_DATA, 
  SUBJECT_COMBINATIONS,
} from '../data/admissionData';
import { 
  ADMISSION_FORMS_CONFIG, 
  AdmissionYear, 
  AdmissionFormCode, 
  UserScoreInputs, 
  ForecastResult, 
  runAdmissionForecast, 
  checkModelAvailability,
  calculateScoreGap,
  evaluateAdmissionLikelihood,
  getReferenceCutoff,
  matchesProgramType,
  matchesAdmissionForm,
  normalizeProgramType,
  PRIORITY_AREA_POINTS,
  PRIORITY_OBJECT_POINTS
} from '../lib/admissionForecast';
import { getAdmissionScores, INITIAL_SCORE_RECORDS, AdmissionScoreDoc } from '../lib/firebase';
import { Pagination } from '../components/Pagination';
import { 
  getPredictionHistory, 
  savePredictionRecord, 
  deletePredictionRecord, 
  clearAllPredictionHistory, 
  PredictionHistoryRecord,
  getLatestPrediction
} from '../lib/predictionHistory';
import { 
  saveUserScoreDistribution, 
  setHasCompletedPrediction 
} from '../lib/userScoreDistribution';
import { 
  BarChart3, 
  Calculator, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  Sparkles, 
  ArrowRight, 
  Info, 
  ShieldAlert, 
  GraduationCap, 
  Scale, 
  Award, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  TrendingUp, 
  RotateCcw,
  ArrowLeft,
  Search,
  History,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Target
} from 'lucide-react';

interface AdmissionPredictorPageProps {
  preSelectedMajorId?: string | null;
  onSelectTab: (tab: NavigationTab) => void;
  onViewMajor: (major: Major) => void;
}

type TargetMode = 'reference' | 'offset' | 'custom';
type ScoreType = 'real' | 'fake';
type TargetDetailKey = 'thpt' | 'hocba' | 'dgnl';
const PREDICTION_SESSION_KEY = 'ussh_prediction_page_state';

const SUBJECTS_BY_COMBINATION: Record<string, string[]> = {
  A00: ['Toán', 'Vật lí', 'Hóa học'],
  A01: ['Toán', 'Vật lí', 'Tiếng Anh'],
  B00: ['Toán', 'Hóa học', 'Sinh học'],
  C00: ['Ngữ văn', 'Lịch sử', 'Địa lí'],
  C01: ['Ngữ văn', 'Toán', 'Vật lí'],
  C03: ['Ngữ văn', 'Toán', 'Lịch sử'],
  D01: ['Toán', 'Ngữ văn', 'Tiếng Anh'],
  D04: ['Toán', 'Ngữ văn', 'Tiếng Trung'],
  D06: ['Toán', 'Ngữ văn', 'Tiếng Nhật'],
  D14: ['Ngữ văn', 'Lịch sử', 'Tiếng Anh'],
  D15: ['Ngữ văn', 'Địa lí', 'Tiếng Anh'],
};

const TARGET_DETAIL_MAX: Record<TargetDetailKey, number> = {
  thpt: 30,
  hocba: 30,
  dgnl: 1200,
};

export const AdmissionPredictorPage: React.FC<AdmissionPredictorPageProps> = ({
  preSelectedMajorId,
  onSelectTab,
  onViewMajor,
}) => {
  const initialMajorIds = useMemo(() => {
    const queryValue = new URLSearchParams(window.location.search).get('ma_nganh');
    const ids = Array.from(new Set((queryValue || '').split(',').map((value) => value.trim()).filter(Boolean)));
    return ids.length > 0 ? ids : ['all'];
  }, []);

  const predictionQuery = useMemo(() => new URLSearchParams(window.location.search), []);
  const queryProgramType = predictionQuery.get('he_dao_tao');
  const queryAdmissionForm = predictionQuery.get('phuong_thuc');
  const queryCombination = predictionQuery.get('to_hop');
  const normalizedQueryAdmissionForm = queryAdmissionForm === 'THPT + ĐGNL + Học bạ'
    ? 'DT01'
    : queryAdmissionForm === 'THPT + Học bạ'
      ? 'DT02'
      : queryAdmissionForm === 'ĐGNL + Học bạ'
        ? 'DT03'
        : 'all';

  // 1. INPUT STATES - Strictly 2026 data
  const [year] = useState<AdmissionYear>(2027);
  const [selectedMajorId, setSelectedMajorId] = useState<string>(
    initialMajorIds.length === 1 && initialMajorIds[0] !== 'all' ? initialMajorIds[0] : preSelectedMajorId || 'all'
  );
  const [selectedMajorIds, setSelectedMajorIds] = useState<string[]>(initialMajorIds);
  const [programType, setProgramType] = useState<string>(queryProgramType || 'all');
  const [admissionForm, setAdmissionForm] = useState<AdmissionFormCode>(normalizedQueryAdmissionForm as AdmissionFormCode);
  const [combination, setCombination] = useState<string>(queryCombination || 'all');
  const [majorSearchQuery, setMajorSearchQuery] = useState<string>('');
  const [targetMode, setTargetMode] = useState<TargetMode>('reference');
  const [targetOffset, setTargetOffset] = useState<number>(1);
  const [customTargetInput, setCustomTargetInput] = useState<string>('');
  const [scoreType, setScoreType] = useState<ScoreType | null>(null);
  const [showTargetPanel, setShowTargetPanel] = useState(false);
  const [targetDetailMajorCode, setTargetDetailMajorCode] = useState<string | null>(null);
  const [targetDetailScores, setTargetDetailScores] = useState<Record<TargetDetailKey, number>>({ thpt: 0, hocba: 0, dgnl: 0 });
  const [targetDetailFixed, setTargetDetailFixed] = useState<Record<TargetDetailKey, boolean>>({ thpt: false, hocba: false, dgnl: false });

  // Prediction History states
  const [historyList, setHistoryList] = useState<PredictionHistoryRecord[]>(() => getPredictionHistory());
  const [showHistorySection, setShowHistorySection] = useState<boolean>(false);
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null);

  // THPT input states
  const [inputModeThpt, setInputModeThpt] = useState<'subjects' | 'total'>('subjects');
  const [thptSub1, setThptSub1] = useState<string>('');
  const [thptSub2, setThptSub2] = useState<string>('');
  const [thptSub3, setThptSub3] = useState<string>('');
  const [thptTotalInput, setThptTotalInput] = useState<string>('');

  // Học bạ input states
  const [inputModeHocBa, setInputModeHocBa] = useState<'subjects' | 'total'>('subjects');
  const [hbSub1, setHbSub1] = useState<string>('');
  const [hbSub2, setHbSub2] = useState<string>('');
  const [hbSub3, setHbSub3] = useState<string>('');
  const [hbTotalInput, setHbTotalInput] = useState<string>('');

  // ĐGNL input state (thang 1200)
  const [dgnlInput, setDgnlInput] = useState<string>('');

  // Điểm thưởng thành tích (thang 100, tối đa 5.0)
  const [achievementBonusInput, setAchievementBonusInput] = useState<string>('0');

  // Ưu tiên
  const [priorityArea, setPriorityArea] = useState<'KV1' | 'KV2-NT' | 'KV2' | 'KV3'>('KV3');
  const [priorityObject, setPriorityObject] = useState<'None' | 'UT1' | 'UT2'>('None');

  // Dữ liệu điểm chuẩn từ database
  const [allScoreRecords, setAllScoreRecords] = useState<AdmissionScoreDoc[]>([]);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);

  // Analysis status and field validation errors
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [hasAnalyzed, setHasAnalyzed] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const resultsRef = useRef<HTMLDivElement>(null);
  const targetPanelRef = useRef<HTMLElement>(null);
  const inputFormRef = useRef<HTMLDivElement>(null);
  const resultsComparisonRef = useRef<HTMLDivElement>(null);

  // Pagination for results
  const [resultsPage, setResultsPage] = useState<number>(1);
  const RESULTS_PER_PAGE = 8;
  const [targetPage, setTargetPage] = useState<number>(1);
  const TARGETS_PER_PAGE = 8;
  const [assessmentPage, setAssessmentPage] = useState<number>(1);
  const ASSESSMENTS_PER_PAGE = 5;

  const hasHydratedPredictionState = useRef(false);

  useEffect(() => {
    if (predictionQuery.has('ma_nganh')) {
      hasHydratedPredictionState.current = true;
      return;
    }

    try {
      const raw = sessionStorage.getItem(PREDICTION_SESSION_KEY);
      if (!raw) {
        hasHydratedPredictionState.current = true;
        return;
      }
      const saved = JSON.parse(raw);
      if (saved.selectedMajorIds) setSelectedMajorIds(saved.selectedMajorIds);
      if (saved.selectedMajorId) setSelectedMajorId(saved.selectedMajorId);
      if (saved.programType) setProgramType(saved.programType);
      if (saved.admissionForm) setAdmissionForm(saved.admissionForm);
      if (saved.combination) setCombination(saved.combination);
      if (saved.scoreType) setScoreType(saved.scoreType);
      if (saved.inputModeThpt) setInputModeThpt(saved.inputModeThpt);
      if (saved.thptSub1 !== undefined) setThptSub1(saved.thptSub1);
      if (saved.thptSub2 !== undefined) setThptSub2(saved.thptSub2);
      if (saved.thptSub3 !== undefined) setThptSub3(saved.thptSub3);
      if (saved.thptTotalInput !== undefined) setThptTotalInput(saved.thptTotalInput);
      if (saved.inputModeHocBa) setInputModeHocBa(saved.inputModeHocBa);
      if (saved.hbSub1 !== undefined) setHbSub1(saved.hbSub1);
      if (saved.hbSub2 !== undefined) setHbSub2(saved.hbSub2);
      if (saved.hbSub3 !== undefined) setHbSub3(saved.hbSub3);
      if (saved.hbTotalInput !== undefined) setHbTotalInput(saved.hbTotalInput);
      if (saved.dgnlInput !== undefined) setDgnlInput(saved.dgnlInput);
      if (saved.achievementBonusInput !== undefined) setAchievementBonusInput(saved.achievementBonusInput);
      if (saved.priorityArea) setPriorityArea(saved.priorityArea);
      if (saved.priorityObject) setPriorityObject(saved.priorityObject);
      if (saved.forecastResult) {
        setForecastResult(saved.forecastResult);
        setHasAnalyzed(true);
      }
    } catch {
      sessionStorage.removeItem(PREDICTION_SESSION_KEY);
    } finally {
      hasHydratedPredictionState.current = true;
    }
  }, [initialMajorIds]);

  useEffect(() => {
    if (!hasHydratedPredictionState.current) return;
    sessionStorage.setItem(PREDICTION_SESSION_KEY, JSON.stringify({
      selectedMajorIds,
      selectedMajorId,
      programType,
      admissionForm,
      combination,
      scoreType,
      inputModeThpt,
      thptSub1,
      thptSub2,
      thptSub3,
      thptTotalInput,
      inputModeHocBa,
      hbSub1,
      hbSub2,
      hbSub3,
      hbTotalInput,
      dgnlInput,
      achievementBonusInput,
      priorityArea,
      priorityObject,
      forecastResult,
    }));
  }, [selectedMajorIds, selectedMajorId, programType, admissionForm, combination, scoreType, inputModeThpt, thptSub1, thptSub2, thptSub3, thptTotalInput, inputModeHocBa, hbSub1, hbSub2, hbSub3, hbTotalInput, dgnlInput, achievementBonusInput, priorityArea, priorityObject, forecastResult]);

  // Load scores on mount with safe fallback when Firestore is unavailable or blocked.
  useEffect(() => {
    let isMounted = true;

    getAdmissionScores()
      .then((records) => {
        if (isMounted) {
          const validRecords = records.length > 0 ? records : INITIAL_SCORE_RECORDS;
          setAllScoreRecords(validRecords);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAllScoreRecords(INITIAL_SCORE_RECORDS);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync selected major if preselected
  useEffect(() => {
    if (preSelectedMajorId) {
      setSelectedMajorId(preSelectedMajorId);
      const target = MAJORS_DATA.find(m => m.id === preSelectedMajorId);
      if (!queryCombination && target && target.defaultCombinations.length > 0) {
        setCombination(target.defaultCombinations[0]);
      }
    }
  }, [preSelectedMajorId]);

  useEffect(() => {
    if (initialMajorIds.includes('all')) return;

    const timer = window.setTimeout(() => {
      const target = document.getElementById('target-major-multiselect');
      if (!target) return;
      const navOffset = 92;
      const targetY = target.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });

      const selectedMajorCheckbox = target.querySelector<HTMLInputElement>('input[data-major-checkbox="true"]:checked');
      selectedMajorCheckbox?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);

    return () => window.clearTimeout(timer);
  }, [initialMajorIds]);

  // Lọc tập dữ liệu tuyển sinh năm 2026 chính thức
  const records2026 = useMemo(() => {
    const list = allScoreRecords.filter((r) => r.nam === 2026);
    if (list.length > 0) return list;
    const fallback2026 = INITIAL_SCORE_RECORDS.filter((r) => r.nam === 2026);
    return fallback2026.length > 0 ? fallback2026 : INITIAL_SCORE_RECORDS;
  }, [allScoreRecords]);

  // Danh sách ngành thực tế năm 2026 từ Firestore records
  const majorsFromFirestore = useMemo<Major[]>(() => {
    const map = new Map<string, Major>();
    MAJORS_DATA.forEach((m) => map.set(m.code, m));

    const distinct2026 = new Map<string, Major>();

    records2026.forEach((r) => {
      if (!r.ma_nganh) return;
      const existing = map.get(r.ma_nganh);
      if (existing) {
        distinct2026.set(r.ma_nganh, {
          ...existing,
          name: r.ten_nganh && r.ten_nganh.trim() ? r.ten_nganh.trim() : existing.name,
        });
      } else {
        distinct2026.set(r.ma_nganh, {
          id: `fs_${r.ma_nganh}`,
          code: r.ma_nganh,
          name: r.ten_nganh || r.ma_nganh,
          faculty: 'Khoa đào tạo USSH',
          fieldCategory: 'social_science',
          fieldCategoryName: 'Khoa học Xã hội & Nhân văn',
          programType: r.he_dao_tao || 'Chương trình chuẩn',
          description: `Ngành đào tạo chính quy ${r.ten_nganh || r.ma_nganh} tại Trường ĐH KHXH&NV – ĐHQG TP.HCM.`,
          careerProspects: ['Nghiên cứu & phát triển', 'Doanh nghiệp & truyền thông'],
          targetSkills: ['Tư duy phản biện', 'Giao tiếp & học thuật'],
          sampleEmployers: ['Các cơ quan văn hóa, truyền thông, doanh nghiệp liên quan'],
          tuitionEstimatedPerYear: '16.000.000 - 24.000.000 VNĐ',
          defaultCombinations: r.to_hop ? [r.to_hop] : ['D01', 'C00'],
          quota2024: r.chi_tieu_du_kien || 100,
          benchmarkHistory: [
            {
              year: 2026,
              thptScore: r.diem_chuan,
              dgnlScore: r.diem_chuan > 100 ? r.diem_chuan : 0,
              combinations: r.to_hop ? [r.to_hop] : ['D01', 'C00'],
            }
          ]
        });
      }
    });

    const result = Array.from(distinct2026.values());
    if (result.length > 0) {
      return result.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }
    return MAJORS_DATA;
  }, [records2026]);

  const selectedMajor = useMemo(() => {
    if (selectedMajorId === 'all') {
      return {
        id: 'all',
        code: 'ALL',
        name: 'Tất cả ngành/chương trình',
        faculty: 'Trường ĐH KHXH&NV – ĐHQG TP.HCM',
        fieldCategoryName: 'Toàn bộ ngành',
        fieldCategory: 'all',
        defaultCombinations: ['D01', 'C00', 'A01', 'D14'],
        benchmarkHistory: []
      } as unknown as Major;
    }
    return majorsFromFirestore.find(m => m.id === selectedMajorId || m.code === selectedMajorId) || majorsFromFirestore[0];
  }, [selectedMajorId, majorsFromFirestore]);

  const getMajorProgramType = (majorCode: string): string => {
    const record = records2026.find((item) => item.ma_nganh === majorCode);
    return normalizeProgramType(record?.he_dao_tao || majorsFromFirestore.find((major) => major.code === majorCode)?.programType);
  };

  const handleMajorSelection = (majorCode: string, checked: boolean) => {
    setSelectedMajorIds((current) => {
      if (majorCode === 'all') {
        setSelectedMajorId('all');
        setProgramType(checked ? 'all' : 'all');
        return checked ? ['all'] : [];
      }

      let next = current.filter((code) => code !== 'all');
      if (checked) next = Array.from(new Set([...next, majorCode]));
      else next = next.filter((code) => code !== majorCode);

      if (next.length === 0) next = ['all'];
      setSelectedMajorId(next.includes('all') ? 'all' : next.length === 1 ? next[0] : 'all');
      if (next.includes('all')) {
        setProgramType('all');
      } else {
        const selectedProgramTypes = new Set(next.map(getMajorProgramType));
        setProgramType(selectedProgramTypes.size === 1 ? Array.from(selectedProgramTypes)[0] : 'all');
      }
      return next;
    });
  };

  const majorSections = useMemo(() => {
    const sectionOrder = [
      'Chương trình chuẩn',
      'Chương trình chuẩn quốc tế',
      'Chương trình liên kết với nước ngoài',
    ] as const;
    const sectionLabels: Record<(typeof sectionOrder)[number], string> = {
      'Chương trình chuẩn': 'Chuẩn',
      'Chương trình chuẩn quốc tế': 'Chuẩn quốc tế',
      'Chương trình liên kết với nước ngoài': 'Liên kết nước ngoài',
    };

    return sectionOrder.map((type) => ({
      type,
      label: sectionLabels[type],
      majors: majorsFromFirestore.filter((major) => {
        const record = records2026.find((item) => item.ma_nganh === major.code);
        return normalizeProgramType(record?.he_dao_tao || major.programType) === type;
      }),
    })).filter((section) => section.majors.length > 0);
  }, [majorsFromFirestore, records2026]);

  // Tổ hợp xét tuyển năm 2026 - chỉ lấy từ trường to_hop trong bảng admission_scores của năm 2026
  const availableCombinations = useMemo(() => {
    const set = new Set<string>();
    const targetRecords = selectedMajorId === 'all'
      ? records2026
      : records2026.filter((r) => r.ma_nganh === selectedMajor.code);

    targetRecords.forEach((r) => {
      if (admissionForm !== 'all' && !matchesAdmissionForm(r, admissionForm)) return;
      if (r.to_hop && r.to_hop.trim()) {
        const raw = r.to_hop.trim();
        // Chỉ lấy mã tổ hợp (ví dụ D01, C00...), loại bỏ phần tên môn
        const code = raw.split(/[\s(]/)[0].toUpperCase();
        if (code && code !== 'ALL' && code !== 'TẤT CẢ') {
          set.add(code);
        }
      }
    });

    return Array.from(set).sort();
  }, [selectedMajorId, selectedMajor, records2026, admissionForm]);

  useEffect(() => {
    if (combination !== 'all' && !availableCombinations.includes(combination)) {
      setCombination('all');
    }
  }, [availableCombinations, combination]);

  const activeCombinationObj = useMemo(() => {
    const selectedCode = combination === 'all'
      ? availableCombinations[0] || selectedMajor?.defaultCombinations?.[0] || 'D01'
      : combination;
    const normalizedCode = selectedCode.trim().split(/[\s(]/)[0].toUpperCase();
    const catalogCombination = SUBJECT_COMBINATIONS.find((item) => item.code === normalizedCode);
    return catalogCombination || {
      code: normalizedCode,
      name: `Tổ hợp ${normalizedCode}`,
      subjects: SUBJECTS_BY_COMBINATION[normalizedCode] || ['Toán', 'Ngữ văn', 'Tiếng Anh'],
    };
  }, [combination, availableCombinations, selectedMajor]);

  const currentFormConfig = ADMISSION_FORMS_CONFIG[admissionForm] || ADMISSION_FORMS_CONFIG.all;

  // Helper chuyển đổi input sang UserScoreInputs (Chỉ sử dụng dữ liệu 2026)
  const buildCurrentInputs = (): UserScoreInputs => {
    return {
      year,
      majorCode: selectedMajorId === 'all' ? 'all' : selectedMajor.code,
      majorName: selectedMajorId === 'all' ? 'Tất cả các ngành' : selectedMajor.name,
      programType: selectedMajorId === 'all' ? programType : getMajorProgramType(selectedMajor.code),
      admissionForm,
      combination,
      inputModeThpt,
      thptSubject1: inputModeThpt === 'subjects' && thptSub1.trim() !== '' ? parseFloat(thptSub1) : undefined,
      thptSubject2: inputModeThpt === 'subjects' && thptSub2.trim() !== '' ? parseFloat(thptSub2) : undefined,
      thptSubject3: inputModeThpt === 'subjects' && thptSub3.trim() !== '' ? parseFloat(thptSub3) : undefined,
      thptTotal: inputModeThpt === 'total' && thptTotalInput.trim() !== '' ? parseFloat(thptTotalInput) : undefined,
      inputModeHocBa,
      hbSubject1: inputModeHocBa === 'subjects' && hbSub1.trim() !== '' ? parseFloat(hbSub1) : undefined,
      hbSubject2: inputModeHocBa === 'subjects' && hbSub2.trim() !== '' ? parseFloat(hbSub2) : undefined,
      hbSubject3: inputModeHocBa === 'subjects' && hbSub3.trim() !== '' ? parseFloat(hbSub3) : undefined,
      hbTotal: inputModeHocBa === 'total' && hbTotalInput.trim() !== '' ? parseFloat(hbTotalInput) : undefined,
      dgnlScore: dgnlInput.trim() !== '' ? parseFloat(dgnlInput) : undefined,
      achievementBonus: parseFloat(achievementBonusInput) || 0,
      priorityArea,
      priorityObject,
    };
  };

  const normalizeScoreInput = (value: string) => value.replace(/^0+(?=\d)/, '');

  const focusNextScoreInput = (currentId: string) => {
    const inputOrder: string[] = [];
    if (currentFormConfig.requires.thpt) {
      inputOrder.push(inputModeThpt === 'subjects' ? 'thpt-sub1-input' : 'thpt-total-input');
      if (inputModeThpt === 'subjects') inputOrder.push('thpt-sub2-input', 'thpt-sub3-input');
    }
    if (currentFormConfig.requires.hocba) {
      inputOrder.push(inputModeHocBa === 'subjects' ? 'hb-sub1-input' : 'hb-total-input');
      if (inputModeHocBa === 'subjects') inputOrder.push('hb-sub2-input', 'hb-sub3-input');
    }
    if (currentFormConfig.requires.dgnl) inputOrder.push('dgnl-score-input');
    inputOrder.push('achievement-bonus-input');

    const nextId = inputOrder[inputOrder.indexOf(currentId) + 1];
    if (nextId) {
      document.getElementById(nextId)?.focus();
    }
  };

  const handleScoreKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      focusNextScoreInput(event.currentTarget.id);
    }
  };

  // Explicit field validation
  const validateInputs = (): boolean => {
    const errors: Record<string, string> = {};

    const needThpt = admissionForm === 'DT01' || admissionForm === 'DT02';
    const needDgnl = admissionForm === 'DT01' || admissionForm === 'DT03';
    const hasAnyThptInput = inputModeThpt === 'subjects'
      ? (thptSub1.trim() !== '' || thptSub2.trim() !== '' || thptSub3.trim() !== '')
      : thptTotalInput.trim() !== '';
    const hasDgnlInput = dgnlInput.trim() !== '';

    // Nếu chọn 'all': yêu cầu nhập ít nhất điểm THPT hoặc ĐGNL
    if (admissionForm === 'all' && !hasAnyThptInput && !hasDgnlInput) {
      errors['generalScore'] = 'Vui lòng nhập điểm thi Tốt nghiệp THPT hoặc điểm thi ĐGNL ĐHQG-HCM để phân tích.';
    }

    // THPT validation if required by current form or entered in 'all' mode
    if (needThpt || (admissionForm === 'all' && hasAnyThptInput)) {
      if (inputModeThpt === 'subjects') {
        const s1 = parseFloat(thptSub1);
        const s2 = parseFloat(thptSub2);
        const s3 = parseFloat(thptSub3);

        if (thptSub1.trim() === '' || isNaN(s1) || s1 < 0 || s1 > 10) {
          errors['thptSub1'] = 'Điểm Môn 1 THPT phải từ 0 đến 10';
        }
        if (thptSub2.trim() === '' || isNaN(s2) || s2 < 0 || s2 > 10) {
          errors['thptSub2'] = 'Điểm Môn 2 THPT phải từ 0 đến 10';
        }
        if (thptSub3.trim() === '' || isNaN(s3) || s3 < 0 || s3 > 10) {
          errors['thptSub3'] = 'Điểm Môn 3 THPT phải từ 0 đến 10';
        }
      } else {
        const total = parseFloat(thptTotalInput);
        if (thptTotalInput.trim() === '' || isNaN(total) || total < 0 || total > 30) {
          errors['thptTotalInput'] = 'Tổng điểm THPT phải từ 0 đến 30';
        }
      }
    }

    // ĐGNL validation if required by current form or entered in 'all' mode
    if (needDgnl || (admissionForm === 'all' && hasDgnlInput)) {
      const dgnl = parseFloat(dgnlInput);
      if (dgnlInput.trim() === '' || isNaN(dgnl) || dgnl < 0 || dgnl > 1200) {
        errors['dgnlInput'] = 'Điểm ĐGNL ĐHQG-HCM phải từ 0 đến 1.200';
      }
    }

    // Học bạ validation (bắt buộc cho tất cả hình thức xét tuyển 2026: DT01, DT02, DT03, Tất cả)
    if (inputModeHocBa === 'subjects') {
      const h1 = parseFloat(hbSub1);
      const h2 = parseFloat(hbSub2);
      const h3 = parseFloat(hbSub3);

      if (hbSub1.trim() === '' || isNaN(h1) || h1 < 0 || h1 > 10) {
        errors['hbSub1'] = 'Điểm Môn 1 học bạ phải từ 0 đến 10';
      }
      if (hbSub2.trim() === '' || isNaN(h2) || h2 < 0 || h2 > 10) {
        errors['hbSub2'] = 'Điểm Môn 2 học bạ phải từ 0 đến 10';
      }
      if (hbSub3.trim() === '' || isNaN(h3) || h3 < 0 || h3 > 10) {
        errors['hbSub3'] = 'Điểm Môn 3 học bạ phải từ 0 đến 10';
      }
    } else {
      const total = parseFloat(hbTotalInput);
      if (hbTotalInput.trim() === '' || isNaN(total) || total < 0 || total > 30) {
        errors['hbTotalInput'] = 'Tổng điểm học bạ phải từ 0 đến 30';
      }
    }

    // Điểm thưởng thành tích (0 - 5.0)
    const bonus = parseFloat(achievementBonusInput);
    if (isNaN(bonus) || bonus < 0 || bonus > 5.0) {
      errors['achievementBonusInput'] = 'Điểm thưởng phải từ 0 đến 5.0';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Tính toán kết quả thực tế (chỉ sử dụng dữ liệu 2026 từ Firestore)
  const executeForecast = (): ForecastResult => {
    const inputs = buildCurrentInputs();
    const rawRecords = allScoreRecords.length > 0 ? allScoreRecords : INITIAL_SCORE_RECORDS;
    const recs2026 = rawRecords.filter(r => r.nam === 2026);
    const records = recs2026.length > 0 ? recs2026 : rawRecords;
    const result = runAdmissionForecast(inputs, records);
    setForecastResult(result);
    return result;
  };

  // Reuse the existing forecast formula locally while the user adjusts scores.
  const liveTargetForecast = useMemo(() => {
    if (records2026.length === 0) return forecastResult;
    const result = runAdmissionForecast(buildCurrentInputs(), records2026);
    return result.calculation ? result : forecastResult;
  }, [
    year,
    records2026,
    selectedMajorId,
    programType,
    admissionForm,
    combination,
    inputModeThpt,
    thptSub1,
    thptSub2,
    thptSub3,
    thptTotalInput,
    inputModeHocBa,
    hbSub1,
    hbSub2,
    hbSub3,
    hbTotalInput,
    dgnlInput,
    achievementBonusInput,
    priorityArea,
    priorityObject,
    forecastResult,
  ]);

  const targetMajors = useMemo(() => {
    if (selectedMajorIds.includes('all')) return majorsFromFirestore;
    return majorsFromFirestore.filter((major) => selectedMajorIds.includes(major.code));
  }, [majorsFromFirestore, selectedMajorIds]);

  const targetMaxScore = 100;
  const getTargetScore = (cutoff: number | null) => {
    if (cutoff === null) return null;
    if (targetMode === 'offset') return Math.min(targetMaxScore, cutoff + targetOffset);
    if (targetMode === 'custom') {
      const custom = Number(customTargetInput);
      return Number.isFinite(custom) && custom >= 0 && custom <= targetMaxScore ? custom : null;
    }
    return cutoff;
  };

  const targetMajorEntries = useMemo(() => {
    const current = liveTargetForecast?.calculation?.finalAdmissionScore ?? null;
    const entries = targetMajors.map((major) => {
      const reference = getReferenceCutoff(records2026, {
        year,
        majorCode: major.code,
        programType: getMajorProgramType(major.code),
        admissionForm,
        combination,
      });
      const target = getTargetScore(reference.cutoffScore);
      const gap = target !== null && current !== null ? target - current : null;
      return { major, reference, target, current, gap };
    });
    return entries.filter((entry) => entry.gap === null || entry.gap > 0);
  }, [targetMajors, records2026, year, admissionForm, combination, targetMode, targetOffset, customTargetInput, liveTargetForecast]);

  const totalTargetPages = Math.ceil(targetMajorEntries.length / TARGETS_PER_PAGE) || 1;
  const paginatedTargetMajors = useMemo(() => {
    const start = (targetPage - 1) * TARGETS_PER_PAGE;
    return targetMajorEntries.slice(start, start + TARGETS_PER_PAGE);
  }, [targetMajorEntries, targetPage]);

  useEffect(() => {
    setTargetPage(1);
  }, [targetMajorEntries]);

  const openTargetDetails = (majorCode: string) => {
    const calculation = forecastResult?.calculation;
    setTargetDetailMajorCode(majorCode);
    setTargetDetailScores({
      thpt: calculation?.components.thpt30 ?? 0,
      hocba: calculation?.components.hb30 ?? 0,
      dgnl: calculation?.components.dgnl1200 ?? 0,
    });
    setTargetDetailFixed({ thpt: false, hocba: false, dgnl: false });
  };

  const showTargetScores = () => {
    setTargetDetailMajorCode(null);
    setShowTargetPanel(true);
    window.setTimeout(() => targetPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  const updateTargetDetailScore = (key: TargetDetailKey, nextValue: number) => {
    const activeKeys = (['thpt', 'hocba', 'dgnl'] as TargetDetailKey[]).filter((item) => {
      if (item === 'thpt') return currentFormConfig.requires.thpt;
      if (item === 'dgnl') return currentFormConfig.requires.dgnl;
      return currentFormConfig.requires.hocba;
    });
    setTargetDetailScores((current) => {
      if (targetDetailFixed[key]) return current;
      const toNormalized = (item: TargetDetailKey, value: number) => (value / TARGET_DETAIL_MAX[item]) * 100;
      const fromNormalized = (item: TargetDetailKey, value: number) => (value / 100) * TARGET_DETAIL_MAX[item];
      const currentTotal = activeKeys.reduce((sum, item) => sum + toNormalized(item, current[item]), 0);
      const boundedValue = Math.max(0, Math.min(TARGET_DETAIL_MAX[key], nextValue));
      const fixedTotal = activeKeys
        .filter((item) => item !== key && targetDetailFixed[item])
        .reduce((sum, item) => sum + toNormalized(item, current[item]), 0);
      const remaining = Math.max(0, currentTotal - fixedTotal - toNormalized(key, boundedValue));
      const otherKeys = activeKeys.filter((item) => item !== key && !targetDetailFixed[item]);
      const otherTotal = otherKeys.reduce((sum, item) => sum + toNormalized(item, current[item]), 0);
      const next = { ...current, [key]: boundedValue };
      otherKeys.forEach((item) => {
        const normalized = otherTotal > 0 ? (toNormalized(item, current[item]) / otherTotal) * remaining : remaining / Math.max(1, otherKeys.length);
        next[item] = fromNormalized(item, normalized);
      });
      return next;
    });
  };

  // Xử lý khi bấm nút "Phân tích" (thực sự tính toán và lưu lịch sử)
  const handleAnalyze = async () => {
    if (isAnalyzing) return;
    if (!scoreType) {
      setFieldErrors({ scoreType: 'Vui lòng chọn Điểm thực tế hoặc Điểm giả định.' });
      return;
    }
    if (!validateInputs()) {
      return;
    }
    setFieldErrors({});
    setIsAnalyzing(true);

    try {
      const result = executeForecast();
      setHasAnalyzed(true);
      setShowTargetPanel(false);

      // Cuộn mượt sang khu vực kết quả
      if (resultsRef.current) {
        const navOffset = 80;
        const targetY = resultsRef.current.getBoundingClientRect().top + window.pageYOffset - navOffset;
        window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      }

      // Lưu lịch sử dự đoán khi có kết quả tính điểm
      if (result && result.calculation) {
        savePredictionRecord({
          year,
          majorId: selectedMajorId,
          majorCode: selectedMajorId === 'all' ? 'ALL' : selectedMajor.code,
          majorName: selectedMajorId === 'all' ? 'Tất cả các ngành' : selectedMajor.name,
          scoreType,
          admissionForm,
          formLabel: currentFormConfig.shortLabel,
          combination,
          programType,
          finalAdmissionScore: result.calculation.finalAdmissionScore,
          baseAdmissionScore: result.calculation.baseAdmissionScore,
          cutoffScore: result.reference?.cutoffScore ?? null,
          scoreGap: result.scoreGap,
          probability: result.prediction?.probability ?? null,
          level: result.prediction?.level || 'INSUFFICIENT_DATA',
          levelLabel: result.prediction?.levelLabel || 'Chưa đủ dữ liệu',
          levelBadge: result.prediction?.levelColor || 'bg-slate-100 text-slate-700',
          commentary: result.prediction?.commentary,
          components: {
            thpt30: result.calculation.components.thpt30,
            thpt100: result.calculation.components.thpt100,
            hb30: result.calculation.components.hb30,
            hb100: result.calculation.components.hb100,
            dgnl1200: result.calculation.components.dgnl1200,
            dgnl100: result.calculation.components.dgnl100,
            bonus: result.calculation.components.achievementBonus,
            priority: result.calculation.components.priorityScore,
          },
          inputState: {
            inputModeThpt,
            thptSub1,
            thptSub2,
            thptSub3,
            thptTotalInput,
            inputModeHocBa,
            hbSub1,
            hbSub2,
            hbSub3,
            hbTotalInput,
            dgnlInput,
            achievementBonusInput,
            priorityArea,
            priorityObject,
          }
        });

        const updated = getPredictionHistory();
        setHistoryList(updated);

        // ====================================================================
        // LƯU PHÂN BỐ ĐIỂM NGƯỜI DÙNG VÀO FIRESTORE (user_score_distribution)
        // Bắt buộc tuân thủ điều kiện:
        // 1. Nhập đủ dữ liệu
        // 2. Hệ thống tính được điểm xét tuyển (result.calculation)
        // 3. Tìm được dữ liệu điểm chuẩn phù hợp (result.status === 'READY')
        // 4. Dự báo hoàn thành thành công
        // 5. Kết quả dự báo hiển thị
        // ====================================================================
        if (scoreType === 'real' && result.status === 'READY' && result.reference && result.reference.cutoffScore !== null) {
          const userAdmissionScore = result.calculation.finalAdmissionScore;
          const analysisSignature = `${result.input.year}_${userAdmissionScore.toFixed(2)}_${result.input.majorCode}_${result.input.admissionForm}_${result.input.combination}_${thptTotalInput || thptSub1}_${hbTotalInput || hbSub1}_${dgnlInput}`;

          try {
            await saveUserScoreDistribution({
              userAdmissionScore,
              year: 2026,
              uniqueKey: analysisSignature,
              majorCode: result.input.majorCode,
              majorName: result.input.majorName,
              admissionForm: result.calculation.admissionForm,
              programType: result.input.programType,
              combination: result.input.combination,
            });
            setHasCompletedPrediction(true);
          } catch (distributionError) {
            console.warn('Không thể lưu phân bố điểm, vẫn giữ kết quả dự đoán:', distributionError);
          }
        }

      }
    } catch (err) {
      console.error('Lỗi tính toán dự đoán:', err);
      setFieldErrors({
        calculation: 'Đã xảy ra lỗi trong quá trình phân tích. Vui lòng kiểm tra lại điểm số và thử lại.'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Nạp lại dữ liệu từ một bản ghi trong lịch sử
  const handleReloadFromHistory = (item: PredictionHistoryRecord) => {
    const saved = item.inputState || {};
    const toNumber = (value?: string) => value !== undefined && value.trim() !== '' ? parseFloat(value) : undefined;
    const majorCode = item.majorCode === 'ALL' ? 'all' : item.majorCode;
    const restoredInputs: UserScoreInputs = {
      year: item.year as AdmissionYear,
      majorCode,
      majorName: item.majorName,
      programType: item.programType || 'all',
      admissionForm: item.admissionForm as AdmissionFormCode,
      combination: item.combination || 'all',
      inputModeThpt: saved.inputModeThpt || 'subjects',
      thptSubject1: toNumber(saved.thptSub1),
      thptSubject2: toNumber(saved.thptSub2),
      thptSubject3: toNumber(saved.thptSub3),
      thptTotal: toNumber(saved.thptTotalInput),
      inputModeHocBa: saved.inputModeHocBa || 'subjects',
      hbSubject1: toNumber(saved.hbSub1),
      hbSubject2: toNumber(saved.hbSub2),
      hbSubject3: toNumber(saved.hbSub3),
      hbTotal: toNumber(saved.hbTotalInput),
      dgnlScore: toNumber(saved.dgnlInput),
      achievementBonus: toNumber(saved.achievementBonusInput) || 0,
      priorityArea: (saved.priorityArea || 'KV3') as UserScoreInputs['priorityArea'],
      priorityObject: (saved.priorityObject || 'None') as UserScoreInputs['priorityObject'],
    };
    const records = records2026.length > 0 ? records2026 : (allScoreRecords.length > 0 ? allScoreRecords : INITIAL_SCORE_RECORDS);
    const restoredResult = runAdmissionForecast(restoredInputs, records);

    if (item.majorId) {
      setSelectedMajorId(item.majorId);
      setSelectedMajorIds(item.majorCode === 'ALL' ? ['all'] : [item.majorCode]);
    } else {
      setSelectedMajorId(majorCode);
      setSelectedMajorIds(majorCode === 'all' ? ['all'] : [majorCode]);
    }
    if (item.admissionForm) {
      setAdmissionForm(item.admissionForm as AdmissionFormCode);
    }
    if (item.combination) {
      setCombination(item.combination);
    }
    if (item.programType) {
      setProgramType(item.programType);
    }
    if (saved.inputModeThpt) setInputModeThpt(saved.inputModeThpt);
    setThptSub1(saved.thptSub1 || '');
    setThptSub2(saved.thptSub2 || '');
    setThptSub3(saved.thptSub3 || '');
    setThptTotalInput(saved.thptTotalInput || '');
    if (saved.inputModeHocBa) setInputModeHocBa(saved.inputModeHocBa);
    setHbSub1(saved.hbSub1 || '');
    setHbSub2(saved.hbSub2 || '');
    setHbSub3(saved.hbSub3 || '');
    setHbTotalInput(saved.hbTotalInput || '');
    setDgnlInput(saved.dgnlInput || '');
    setAchievementBonusInput(saved.achievementBonusInput || '0');
    if (saved.priorityArea) setPriorityArea(saved.priorityArea as UserScoreInputs['priorityArea']);
    if (saved.priorityObject) setPriorityObject(saved.priorityObject as UserScoreInputs['priorityObject']);
    setScoreType(item.scoreType || 'real');
    setForecastResult(restoredResult);
    setHasAnalyzed(true);
    setShowHistorySection(false);
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  // Xóa 1 bản ghi lịch sử
  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = deletePredictionRecord(id);
    setHistoryList(updated);
  };

  // Xóa toàn bộ lịch sử
  const handleClearAllHistory = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử dự đoán?')) {
      clearAllPredictionHistory();
      setHistoryList([]);
    }
  };

  // Reset form về mặc định (Làm sạch hoàn toàn input và trạng thái phân tích mà không reload trang)
  const handleReset = () => {
    setSelectedMajorId('all');
    setProgramType('all');
    setAdmissionForm('all');
    setCombination('all');
    setInputModeThpt('subjects');
    setThptSub1('');
    setThptSub2('');
    setThptSub3('');
    setThptTotalInput('');
    setInputModeHocBa('subjects');
    setHbSub1('');
    setHbSub2('');
    setHbSub3('');
    setHbTotalInput('');
    setDgnlInput('');
    setAchievementBonusInput('0');
    setPriorityArea('KV3');
    setPriorityObject('None');
    setMajorSearchQuery('');
    setScoreType(null);
    setShowTargetPanel(false);
    setTargetDetailMajorCode(null);
    setTargetDetailScores({ thpt: 0, hocba: 0, dgnl: 0 });
    setTargetDetailFixed({ thpt: false, hocba: false, dgnl: false });
    setFieldErrors({});
    setIsAnalyzing(false);
    setForecastResult(null);
    sessionStorage.removeItem(PREDICTION_SESSION_KEY);
    setHasAnalyzed(false);
    setResultsPage(1);
    setResetSuccessMsg('Đặt lại thành công');
    setTimeout(() => setResetSuccessMsg(null), 1500);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset trang kết quả về 1 khi bộ lọc hoặc từ khóa thay đổi
  useEffect(() => {
    setResultsPage(1);
  }, [majorSearchQuery, admissionForm, programType, combination]);

  useEffect(() => {
    setAssessmentPage(1);
  }, [selectedMajorIds, admissionForm, programType, combination]);

  // Gợi ý ngành cùng nhóm (khi chọn 1 ngành cụ thể)
  const alternativeMajors = useMemo(() => {
    if (selectedMajorId === 'all') return [];
    return majorsFromFirestore.filter(
      (m) => m.id !== selectedMajor.id && m.fieldCategory === selectedMajor.fieldCategory
    ).slice(0, 3);
  }, [selectedMajor, selectedMajorId, majorsFromFirestore]);

  // Đánh giá tất cả các ngành khi chọn "Tất cả ngành/chương trình"
  const allMajorsEvaluations = useMemo(() => {
    if (!forecastResult?.calculation || records2026.length === 0) return [];
    const myScore = forecastResult.calculation.finalAdmissionScore;
    const referenceForm = forecastResult.calculation.admissionForm;

    const selectedCodes = new Set(selectedMajorIds);
    const candidates = selectedMajorIds.includes('all')
      ? majorsFromFirestore
      : majorsFromFirestore.filter((major) => selectedCodes.has(major.code));

    return candidates.map((major) => {
      // 1. Lấy điểm chuẩn tham chiếu C
      const ref = getReferenceCutoff(records2026, {
        year,
        majorCode: major.code,
        programType: getMajorProgramType(major.code),
        admissionForm: referenceForm,
        combination,
      });

      const cutoff = ref.cutoffScore;
      // 2. Tính khoảng cách điểm D = S - C
      const gap = calculateScoreGap(myScore, cutoff);
      const assessment = evaluateAdmissionLikelihood(gap, ref);

      return {
        major,
        cutoff,
        gap,
        probability: assessment.probability,
        level: assessment.level,
        levelLabel: assessment.levelLabel,
        levelBadge: assessment.levelColor,
        programType: ref.programType || programType,
      };
    });
  }, [forecastResult, records2026, programType, admissionForm, combination, majorsFromFirestore, selectedMajorIds]);

  const filteredAllMajors = useMemo(() => {
    if (!majorSearchQuery.trim()) return allMajorsEvaluations;
    const q = majorSearchQuery.toLowerCase().trim();
    return allMajorsEvaluations.filter(item => 
      item.major.name.toLowerCase().includes(q) ||
      item.major.code.toLowerCase().includes(q) ||
      item.major.fieldCategoryName.toLowerCase().includes(q)
    );
  }, [allMajorsEvaluations, majorSearchQuery]);

  const totalResultsCount = filteredAllMajors.length;
  const totalResultsPages = Math.ceil(totalResultsCount / RESULTS_PER_PAGE) || 1;

  const paginatedAllMajors = useMemo(() => {
    const start = (resultsPage - 1) * RESULTS_PER_PAGE;
    return filteredAllMajors.slice(start, start + RESULTS_PER_PAGE);
  }, [filteredAllMajors, resultsPage]);

  const totalAssessmentPages = Math.ceil(allMajorsEvaluations.length / ASSESSMENTS_PER_PAGE) || 1;
  const paginatedAssessments = useMemo(() => {
    const start = (assessmentPage - 1) * ASSESSMENTS_PER_PAGE;
    return allMajorsEvaluations.slice(start, start + ASSESSMENTS_PER_PAGE);
  }, [allMajorsEvaluations, assessmentPage]);

  return (
    <div className="w-full max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 overflow-x-hidden">
      {/* 1. Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-[var(--ussh-blue)]/10 text-[var(--ussh-blue-dark)] text-xs font-bold mb-2">
            <Calculator className="w-3.5 h-3.5 text-[var(--ussh-blue-dark)]" />
            <span>Dự đoán tuyển sinh 2027 (Thang 100 điểm)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--ussh-blue-dark)] tracking-tight">
            Dự đoán trúng tuyển
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            Hệ thống phân tích điểm thành phần thí sinh theo các hình thức hiện có và đối chiếu điểm chuẩn tham chiếu năm 2026 để đưa ra mức đánh giá tham khảo cho dự đoán tuyển sinh 2027: An toàn, Cân nhắc, Rủi ro.
          </p>
        </div>

        {/* Admission Year Badge - Strictly Locked to 2026 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center md:items-end gap-2.5 shrink-0">
          <button
            id="toggle-history-btn"
            type="button"
            onClick={() => setShowHistorySection(prev => !prev)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer border border-slate-200"
          >
            <History className="w-4 h-4 text-blue-800" />
            <span>Lịch sử dự đoán ({historyList.length})</span>
            {showHistorySection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f2b5c] text-white text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Điểm chuẩn tham chiếu 2026 (Thang 100)</span>
          </div>
        </div>
      </div>

      {resetSuccessMsg && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-3 text-sm font-bold text-white shadow-xl animate-fadeIn">
            <CheckCircle2 className="h-5 w-5" />
            <span>{resetSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* History Drawer / Panel */}
      {showHistorySection && (
        <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col gap-2 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <History className="w-5 h-5 shrink-0 text-[#0f2b5c]" />
              <h3 className="truncate text-base font-bold text-[#0f2b5c] whitespace-nowrap">Lịch sử các lần dự đoán của bạn</h3>
              <span className="shrink-0 text-xs text-slate-500 font-semibold">({historyList.length} lần)</span>
            </div>
            {historyList.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllHistory}
                className="inline-flex shrink-0 items-center justify-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-100 hover:text-rose-700 cursor-pointer whitespace-nowrap"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Xóa toàn bộ</span>
              </button>
            )}
          </div>

          {historyList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {historyList.map((rec) => (
                <div 
                  key={rec.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100 transition-colors flex flex-col justify-between space-y-2.5"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">{rec.formattedDate}</span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-[#0f2b5c] text-lg whitespace-nowrap">{rec.finalAdmissionScore.toFixed(2)}/100</span>
                    </div>
                    <span className="text-[11px] text-slate-500">Điểm xét tuyển của bạn</span>
                  </div>

                  <div className="pt-2 flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleReloadFromHistory(rec)}
                      className="flex-1 py-1.5 px-2 bg-white hover:bg-blue-50 border border-slate-300 text-[#0f2b5c] rounded-lg text-xs font-bold transition-colors cursor-pointer text-center"
                    >
                      Xem lại
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteHistory(rec.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Xóa bản ghi này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-xs space-y-1">
              <p>Bạn chưa lưu lần dự đoán nào.</p>
              <p className="text-slate-400">Hãy nhập điểm và bấm nút &quot;Phân tích&quot; để hệ thống tự động tính toán và lưu lịch sử.</p>
            </div>
          )}
        </div>
      )}

      {/* 2026 Advisory Notice */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-blue-950">
        <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <strong className="font-bold block text-blue-950 text-sm">Cơ chế tính điểm & phân tích dự đoán 2027:</strong>
          <p className="leading-relaxed">
            Hệ thống tính toán dự đoán 2027 bằng công thức hiện tại và sử dụng <strong>điểm chuẩn tham chiếu năm 2026</strong> (thang điểm 100) từ dữ liệu của Trường ĐH KHXH&NV – ĐHQG TP.HCM.
            Đây là dữ liệu tham chiếu, không phải điểm chuẩn chính thức của năm 2027.
          </p>
        </div>
      </div>

      {/* 2. Main Content: Grid 12 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Input Form (5 cols) */}
        {!showTargetPanel && <div ref={inputFormRef} className="lg:col-span-5 space-y-6 scroll-mt-24">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm sm:text-base font-bold text-[#0f2b5c] uppercase tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-amber-500" />
                <span>Hồ sơ người dùng</span>
              </h2>
              <button
                id="reset-form-btn"
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-[#0f2b5c] flex items-center gap-1 font-bold transition-colors"
                title="Đặt lại thông tin nhập"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
            </div>

            {/* Target Major Selection - multi-select by ma_nganh */}
            <div>
              <span className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">Ngành bạn muốn dự đoán:</span>
                <label className="mb-2 flex items-center gap-2 rounded-md border border-slate-300 bg-white px-2 py-2 text-xs font-bold text-slate-800 shadow-sm hover:bg-slate-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedMajorIds.includes('all')}
                    onChange={(e) => handleMajorSelection('all', e.target.checked)}
                    className="h-4 w-4 accent-[var(--ussh-blue)]"
                  />
                  <span>Tất cả ngành/chương trình</span>
                </label>
                <div id="target-major-multiselect" className="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-slate-300 bg-slate-50 p-2">
                {majorSections.map((section) => (
                  <section key={section.type} className="rounded-lg border border-slate-200 bg-white p-2">
                    <h3 className="px-1 pb-1 text-xs font-extrabold uppercase tracking-wide text-[var(--ussh-blue-dark)]">{section.label}</h3>
                    <div className="space-y-0.5">
                      {section.majors.map((major) => {
                        const combinations = Array.from(new Set(
                          records2026
                            .filter((record) => record.ma_nganh === major.code && normalizeProgramType(record.he_dao_tao) === section.type)
                            .map((record) => record.to_hop?.trim().split(/[\s(]/)[0].toUpperCase())
                            .filter((code): code is string => Boolean(code) && code !== 'ALL' && code !== 'TẤT CẢ')
                        )).sort();
                        const displayedCombinations = combinations.length > 0 ? combinations : (major.defaultCombinations || []);
                        return (
                          <label key={major.code} className="flex items-start gap-2 rounded-md px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer">
                            <input
                              type="checkbox"
                              data-major-checkbox="true"
                              checked={selectedMajorIds.includes('all') || selectedMajorIds.includes(major.code)}
                              onChange={(e) => handleMajorSelection(major.code, e.target.checked)}
                              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--ussh-blue)]"
                            />
                            <span className="min-w-0">
                              <span className="block font-semibold">{major.code} - {major.name}</span>
                              <span className="block text-[10px] text-slate-500">Tổ hợp: {displayedCombinations.length > 0 ? displayedCombinations.join(', ') : 'Đang cập nhật'}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
              <p className="mt-1 text-[11px] text-slate-500">{selectedMajorIds.includes('all') ? 'Không giới hạn ngành' : `Đã chọn ${selectedMajorIds.length} ngành`}</p>
            </div>

            <div className="rounded-lg border border-[var(--ussh-blue-light)] bg-[var(--ussh-blue-subtle)] p-4">
              <p className="text-sm font-bold text-[var(--ussh-blue-dark)]">Điểm bạn nhập là điểm thực tế hay điểm giả định?</p>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <label className={`cursor-pointer rounded-md border p-3 ${scoreType === 'real' ? 'border-[var(--ussh-blue)] bg-white shadow-sm' : 'border-transparent bg-white/60'}`}>
                  <input type="radio" name="score-type" checked={scoreType === 'real'} onChange={() => setScoreType('real')} className="mr-2 accent-[var(--ussh-blue)]" />
                  <strong className="text-sm text-[var(--ussh-blue-dark)]">Điểm thực tế</strong>
                  <span className="mt-1 block pl-5 text-xs text-slate-600">Điểm bạn đã đạt được trong các kì thi.</span>
                </label>
                <label className={`cursor-pointer rounded-md border p-3 ${scoreType === 'fake' ? 'border-[var(--ussh-red)] bg-white shadow-sm' : 'border-transparent bg-white/60'}`}>
                  <input type="radio" name="score-type" checked={scoreType === 'fake'} onChange={() => setScoreType('fake')} className="mr-2 accent-[var(--ussh-red)]" />
                  <strong className="text-sm text-[var(--ussh-blue-dark)]">Điểm giả định</strong>
                  <span className="mt-1 block pl-5 text-xs text-slate-600">Mức điểm thử nghiệm để tham khảo dự đoán.</span>
                </label>
              </div>
            </div>

            {/* Admission Form Selection - Thống nhất duy nhất 1 kiểu bộ lọc theo năm 2026 */}
            <div className="space-y-1.5 pt-1">
              <label htmlFor="admission-form-select" className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                Hình thức xét tuyển:
              </label>
              <select
                id="admission-form-select"
                value={admissionForm}
                onChange={(e) => setAdmissionForm(e.target.value as AdmissionFormCode)}
                className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-800 focus:outline-hidden focus:border-[#0f2b5c]"
              >
                <option value="all">Tất cả</option>
                <option value="DT01">Điểm thi THPT + Điểm thi ĐGNL + Điểm học bạ THPT</option>
                <option value="DT02">Điểm thi THPT + Điểm học bạ THPT</option>
                <option value="DT03">Điểm thi ĐGNL + Điểm học bạ THPT</option>
              </select>
            </div>

            {/* 2. COMPONENT SCORES INPUT SECTION */}
            <div className="pt-3 border-t border-slate-100 space-y-4">
              <h3 className="text-xs sm:text-sm font-bold text-[#0f2b5c] uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-blue-600" />
                <span>2. Điểm thành phần</span>
              </h3>

              {/* THPT Score Input (if required by form) */}
              {currentFormConfig.requires.thpt && (
                <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-blue-950 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-blue-700" />
                      Điểm thi THPT ({currentFormConfig.weights.thpt * 100}%)
                    </span>
                    <div className="flex text-xs bg-white rounded-md border border-blue-200 p-0.5">
                      <button
                        type="button"
                        onClick={() => setInputModeThpt('subjects')}
                        className={`px-2.5 py-1 rounded font-bold ${inputModeThpt === 'subjects' ? 'bg-blue-800 text-white' : 'text-slate-600'}`}
                      >
                        Nhập điểm từng môn
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputModeThpt('total')}
                        className={`px-2.5 py-1 rounded font-bold ${inputModeThpt === 'total' ? 'bg-blue-800 text-white' : 'text-slate-600'}`}
                      >
                        Nhập điểm tổng
                      </button>
                    </div>
                  </div>

                  {inputModeThpt === 'subjects' ? (
                    <div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label htmlFor="thpt-sub1-input" className="block text-xs text-slate-600 mb-1 truncate font-medium">
                            Môn 1
                          </label>
                          <input
                            id="thpt-sub1-input"
                            type="number"
                            min={0}
                            max={10}
                            step={0.1}
                            value={thptSub1}
                            onChange={(e) => setThptSub1(normalizeScoreInput(e.target.value))}
                            onKeyDown={handleScoreKeyDown}
                            placeholder="0 - 10"
                            className={`w-full px-2 py-2 text-sm bg-white border rounded font-bold text-center text-slate-900 focus:outline-hidden ${
                              fieldErrors['thptSub1'] ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 focus:border-blue-700'
                            }`}
                          />
                        </div>
                        <div>
                          <label htmlFor="thpt-sub2-input" className="block text-xs text-slate-600 mb-1 truncate font-medium">
                            Môn 2
                          </label>
                          <input
                            id="thpt-sub2-input"
                            type="number"
                            min={0}
                            max={10}
                            step={0.1}
                            value={thptSub2}
                            onChange={(e) => setThptSub2(normalizeScoreInput(e.target.value))}
                            onKeyDown={handleScoreKeyDown}
                            placeholder="0 - 10"
                            className={`w-full px-2 py-2 text-sm bg-white border rounded font-bold text-center text-slate-900 focus:outline-hidden ${
                              fieldErrors['thptSub2'] ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 focus:border-blue-700'
                            }`}
                          />
                        </div>
                        <div>
                          <label htmlFor="thpt-sub3-input" className="block text-xs text-slate-600 mb-1 truncate font-medium">
                            Môn 3
                          </label>
                          <input
                            id="thpt-sub3-input"
                            type="number"
                            min={0}
                            max={10}
                            step={0.1}
                            value={thptSub3}
                            onChange={(e) => setThptSub3(normalizeScoreInput(e.target.value))}
                            onKeyDown={handleScoreKeyDown}
                            placeholder="0 - 10"
                            className={`w-full px-2 py-2 text-sm bg-white border rounded font-bold text-center text-slate-900 focus:outline-hidden ${
                              fieldErrors['thptSub3'] ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 focus:border-blue-700'
                            }`}
                          />
                        </div>
                      </div>
                      {(fieldErrors['thptSub1'] || fieldErrors['thptSub2'] || fieldErrors['thptSub3']) && (
                        <span className="text-xs text-rose-600 font-bold block mt-1.5">
                          {fieldErrors['thptSub1'] || fieldErrors['thptSub2'] || fieldErrors['thptSub3']}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="relative">
                        <input
                          id="thpt-total-input"
                          type="number"
                          min={0}
                          max={30}
                          step={0.1}
                          value={thptTotalInput}
                          onChange={(e) => setThptTotalInput(normalizeScoreInput(e.target.value))}
                          onKeyDown={handleScoreKeyDown}
                          placeholder="0.00 - 30.00"
                          className={`w-full px-3 py-2 text-sm bg-white border rounded-lg font-bold text-slate-900 focus:outline-hidden ${
                            fieldErrors['thptTotalInput'] ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 focus:border-blue-700'
                          }`}
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold">/ 30 điểm</span>
                      </div>
                      {fieldErrors['thptTotalInput'] && (
                        <span className="text-xs text-rose-600 font-bold block mt-1.5">
                          {fieldErrors['thptTotalInput']}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Học bạ Score Input (always required across DT01, DT02, DT03) */}
              {currentFormConfig.requires.hocba && (
                <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-emerald-700" />
                      Điểm học bạ THPT ({currentFormConfig.weights.hocba * 100}%)
                    </span>
                    <div className="flex text-xs bg-white rounded-md border border-emerald-200 p-0.5">
                      <button
                        type="button"
                        onClick={() => setInputModeHocBa('subjects')}
                        className={`px-2.5 py-1 rounded font-bold ${inputModeHocBa === 'subjects' ? 'bg-emerald-800 text-white' : 'text-slate-600'}`}
                      >
                        Nhập điểm từng môn
                      </button>
                      <button
                        type="button"
                        onClick={() => setInputModeHocBa('total')}
                        className={`px-2.5 py-1 rounded font-bold ${inputModeHocBa === 'total' ? 'bg-emerald-800 text-white' : 'text-slate-600'}`}
                      >
                          Nhập điểm tổng
                      </button>
                    </div>
                  </div>

                  {inputModeHocBa === 'subjects' ? (
                    <div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label htmlFor="hb-sub1-input" className="block text-xs text-slate-600 mb-1 truncate font-medium">
                            Môn 1
                          </label>
                          <input
                            id="hb-sub1-input"
                            type="number"
                            min={0}
                            max={10}
                            step={0.1}
                            value={hbSub1}
                            onChange={(e) => setHbSub1(normalizeScoreInput(e.target.value))}
                            onKeyDown={handleScoreKeyDown}
                            placeholder="0 - 10"
                            className={`w-full px-2 py-2 text-sm bg-white border rounded font-bold text-center text-slate-900 focus:outline-hidden ${
                              fieldErrors['hbSub1'] ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 focus:border-emerald-700'
                            }`}
                          />
                        </div>
                        <div>
                          <label htmlFor="hb-sub2-input" className="block text-xs text-slate-600 mb-1 truncate font-medium">
                            Môn 2
                          </label>
                          <input
                            id="hb-sub2-input"
                            type="number"
                            min={0}
                            max={10}
                            step={0.1}
                            value={hbSub2}
                            onChange={(e) => setHbSub2(normalizeScoreInput(e.target.value))}
                            onKeyDown={handleScoreKeyDown}
                            placeholder="0 - 10"
                            className={`w-full px-2 py-2 text-sm bg-white border rounded font-bold text-center text-slate-900 focus:outline-hidden ${
                              fieldErrors['hbSub2'] ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 focus:border-emerald-700'
                            }`}
                          />
                        </div>
                        <div>
                          <label htmlFor="hb-sub3-input" className="block text-xs text-slate-600 mb-1 truncate font-medium">
                            Môn 3
                          </label>
                          <input
                            id="hb-sub3-input"
                            type="number"
                            min={0}
                            max={10}
                            step={0.1}
                            value={hbSub3}
                            onChange={(e) => setHbSub3(normalizeScoreInput(e.target.value))}
                            onKeyDown={handleScoreKeyDown}
                            placeholder="0 - 10"
                            className={`w-full px-2 py-2 text-sm bg-white border rounded font-bold text-center text-slate-900 focus:outline-hidden ${
                              fieldErrors['hbSub3'] ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 focus:border-emerald-700'
                            }`}
                          />
                        </div>
                      </div>
                      {(fieldErrors['hbSub1'] || fieldErrors['hbSub2'] || fieldErrors['hbSub3']) && (
                        <span className="text-xs text-rose-600 font-bold block mt-1.5">
                          {fieldErrors['hbSub1'] || fieldErrors['hbSub2'] || fieldErrors['hbSub3']}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="relative">
                        <input
                          id="hb-total-input"
                          type="number"
                          min={0}
                          max={30}
                          step={0.1}
                          value={hbTotalInput}
                          onChange={(e) => setHbTotalInput(normalizeScoreInput(e.target.value))}
                          onKeyDown={handleScoreKeyDown}
                          placeholder="0.00 - 30.00"
                          className={`w-full px-3 py-2 text-sm bg-white border rounded-lg font-bold text-slate-900 focus:outline-hidden ${
                            fieldErrors['hbTotalInput'] ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 focus:border-emerald-700'
                          }`}
                        />
                        <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold">/ 30 điểm</span>
                      </div>
                      {fieldErrors['hbTotalInput'] && (
                        <span className="text-xs text-rose-600 font-bold block mt-1.5">
                          {fieldErrors['hbTotalInput']}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ĐGNL Score Input (if required by form) */}
              {currentFormConfig.requires.dgnl && (
                <div className="p-3.5 bg-purple-50/50 rounded-xl border border-purple-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-purple-950 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-purple-700" />
                      Điểm thi ĐGNL ĐHQG-HCM ({currentFormConfig.weights.dgnl * 100}%)
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="dgnl-score-input"
                      type="number"
                      min={0}
                      max={1200}
                      step={5}
                      value={dgnlInput}
                      onChange={(e) => setDgnlInput(normalizeScoreInput(e.target.value))}
                      onKeyDown={handleScoreKeyDown}
                      placeholder="0 - 1200"
                      className={`w-full px-3 py-2 text-sm bg-white border rounded-lg font-bold text-purple-900 focus:outline-hidden ${
                        fieldErrors['dgnlInput'] ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 focus:border-purple-700'
                      }`}
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold">/ 1.200 điểm</span>
                  </div>
                  {fieldErrors['dgnlInput'] && (
                    <span className="text-xs text-rose-600 font-bold block mt-1">
                      {fieldErrors['dgnlInput']}
                    </span>
                  )}
                </div>
              )}

              {/* Achievement Bonus Input */}
              <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="achievement-bonus-input" className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-600" />
                    Điểm thưởng thành tích
                  </label>
                  <span className="text-xs text-amber-900 font-bold">Tối đa 5.0 điểm</span>
                </div>
                <input
                  id="achievement-bonus-input"
                  type="number"
                  min={0}
                  max={5}
                  step={0.25}
                  value={achievementBonusInput}
                  onChange={(e) => setAchievementBonusInput(normalizeScoreInput(e.target.value))}
                  onKeyDown={handleScoreKeyDown}
                  placeholder="0.0 - 5.0"
                  className={`w-full px-3 py-2 text-sm bg-white border rounded-lg font-bold text-slate-900 focus:outline-hidden ${
                    fieldErrors['achievementBonusInput'] ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-300 focus:border-amber-600'
                  }`}
                />
                {fieldErrors['achievementBonusInput'] && (
                  <span className="text-xs text-rose-600 font-bold block mt-1">
                    {fieldErrors['achievementBonusInput']}
                  </span>
                )}
                <p className="text-xs text-slate-600">
                  Dành cho thí sinh đạt giải HSG quốc gia, chứng chỉ ngoại ngữ quốc tế, học sinh trường chuyên theo quy chế.
                </p>
              </div>

              {/* Priority Section (Area + Object) */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                  Điểm ưu tiên quy chế tuyển sinh:
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="priority-area-select" className="block text-xs font-bold text-slate-700 mb-1">
                      Khu vực:
                    </label>
                    <select
                      id="priority-area-select"
                      value={priorityArea}
                      onChange={(e) => setPriorityArea(e.target.value as any)}
                      className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded font-semibold text-slate-800 focus:outline-hidden"
                    >
                      <option value="KV3">KV3 (+0.0đ)</option>
                      <option value="KV2">KV2 (+0.25đ)</option>
                      <option value="KV2-NT">KV2-NT (+0.50đ)</option>
                      <option value="KV1">KV1 (+0.75đ)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="priority-object-select" className="block text-xs font-bold text-slate-700 mb-1">
                      Đối tượng chính sách:
                    </label>
                    <select
                      id="priority-object-select"
                      value={priorityObject}
                      onChange={(e) => setPriorityObject(e.target.value as any)}
                      className="w-full px-2.5 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded font-semibold text-slate-800 focus:outline-hidden"
                    >
                      <option value="None">Không (+0.0đ)</option>
                      <option value="UT1">Nhóm UT1 (+2.0đ)</option>
                      <option value="UT2">Nhóm UT2 (+1.0đ)</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-tight">
                  * Theo quy chế Bộ GD&ĐT: Khi điểm xét tuyển gốc từ 75/100 trở lên (tương đương 22.5/30), điểm ưu tiên được giảm tuyến tính.
                </p>
              </div>
            </div>

            {/* Display validation errors alert if any */}
            {Object.keys(fieldErrors).length > 0 && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Vui lòng kiểm tra lại các thông tin sau:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-rose-700 pl-1">
                  {Object.entries(fieldErrors).map(([key, msg]) => (
                    <li key={key}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ACTION BUTTON: PHÂN TÍCH */}
            <button
              id="btn-execute-analysis"
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className={`w-full py-3.5 bg-[var(--ussh-blue-dark)] hover:bg-[var(--ussh-blue)] active:scale-[0.99] text-white rounded-xl font-bold text-sm sm:text-base tracking-wide transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer ${
                isAnalyzing ? 'opacity-80 cursor-wait' : 'hover:shadow-lg'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-bold">Đang phân tích...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span className="font-bold uppercase tracking-wider">Phân tích</span>
                </>
              )}
            </button>
          </div>
        </div>}

        {/* RIGHT COLUMN: Results Section (7 cols) - Structured 3 Cards */}
        <div ref={resultsRef} className={`${showTargetPanel ? 'lg:col-span-12' : 'lg:col-span-7'} flex flex-col space-y-6`}>
          {/* Target score planning uses 2026 reference data and current local inputs. */}
          {showTargetPanel && forecastResult?.calculation && (
          <section ref={targetPanelRef} className="space-y-5 py-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-extrabold uppercase text-amber-950">MỤC TIÊU ĐIỂM</h2>
                <p className="mt-1 text-sm text-slate-600">Năm dự đoán: <strong>2027</strong>. Điểm chuẩn tham chiếu: <strong>2026</strong>.</p>
                <p className="mt-1 text-xs text-slate-500">Điểm chuẩn 2026 là dữ liệu tham chiếu, không phải điểm chuẩn chính thức của năm 2027.</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                <button type="button" onClick={() => { setShowTargetPanel(false); setTargetDetailMajorCode(null); window.setTimeout(() => inputFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0); }} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-sky-300 bg-sky-50 px-2.5 py-1.5 text-[10px] sm:text-xs font-bold text-sky-900 hover:bg-sky-100 cursor-pointer"><ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />Quay lại điều chỉnh điểm</button>
                <button type="button" onClick={() => { setShowTargetPanel(false); setTargetDetailMajorCode(null); }} className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[10px] sm:text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"><ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />Quay lại kết quả</button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['reference', 'offset', 'custom'] as TargetMode[]).map((mode) => (
                <label key={mode} className="inline-flex items-center gap-2 rounded-md border border-[var(--ussh-blue-light)] bg-white px-3 py-2 text-xs font-semibold text-[var(--ussh-blue-dark)] cursor-pointer">
                  <input type="radio" name="target-mode" checked={targetMode === mode} onChange={() => setTargetMode(mode)} className="accent-[var(--ussh-blue)]" />
                  {mode === 'reference' ? 'Theo điểm chuẩn tham chiếu' : mode === 'offset' ? 'Cao hơn điểm chuẩn' : 'Tự nhập mục tiêu'}
                </label>
              ))}
            </div>

            {targetMode === 'offset' && (
              <div className="flex flex-wrap gap-2">
                {[0.5, 1, 1.5, 2].map((offset) => (
                  <button key={offset} type="button" onClick={() => setTargetOffset(offset)} className={`rounded-md border px-3 py-1.5 text-xs font-bold cursor-pointer ${targetOffset === offset ? 'border-[var(--ussh-red)] bg-[var(--ussh-red)] text-white' : 'border-slate-300 bg-white text-slate-700'}`}>
                    +{offset.toFixed(1)} điểm
                  </button>
                ))}
              </div>
            )}
            {targetMode === 'custom' && (
              <input type="number" min="0" max="100" step="0.01" value={customTargetInput} onChange={(event) => setCustomTargetInput(event.target.value)} placeholder="Mục tiêu của tôi (0–100)" className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800" />
            )}

            <div id="target-score-list" className="space-y-5">
              {targetMajorEntries.length ? (
                <>
                  {paginatedTargetMajors.some((entry) => entry.gap !== null && entry.gap <= 0) && (
                    <div>
                      <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-emerald-800">Đã đạt mục tiêu</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {paginatedTargetMajors.filter((entry) => entry.gap !== null && entry.gap <= 0).map(({ major, reference, target, current, gap }) => (
                  <div key={major.code} className="rounded-lg border border-amber-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-extrabold text-[var(--ussh-blue-dark)]">{major.name}</h3>
                      <span className="font-mono text-xs text-slate-500">Mã ngành: {major.code}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                      <div><span className="block text-xs text-slate-500">Điểm chuẩn tham chiếu 2026</span><strong className="text-[var(--ussh-red)]">{reference.cutoffScore !== null ? reference.cutoffScore.toFixed(2) : 'Chưa có dữ liệu'}</strong></div>
                      <div><span className="block text-xs text-slate-500">Mục tiêu</span><strong className="text-amber-800">{target !== null ? target.toFixed(2) : 'Chưa có dữ liệu'}</strong></div>
                      <div><span className="block text-xs text-slate-500">Điểm xét tuyển dự kiến</span><strong>{current !== null ? current.toFixed(2) : 'Chưa phân tích'}</strong></div>
                      <div><span className="block text-xs text-slate-500">Khoảng cách</span><strong className={gap !== null && gap > 0 ? 'text-rose-700' : 'text-emerald-700'}>{gap !== null ? gap > 0 ? `Còn thiếu ${gap.toFixed(2)}` : 'Đã đạt hoặc cao hơn mục tiêu' : 'Chưa đủ dữ liệu'}</strong></div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-amber-100 pt-3">
                      <span className="text-xs text-slate-500">Điều chỉnh theo điểm hiện tại của bạn</span>
                      <button type="button" onClick={() => openTargetDetails(major.code)} className="rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-800 cursor-pointer">Chi tiết</button>
                    </div>
                    {targetDetailMajorCode === major.code && (
                      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 space-y-3">
                        <p className="text-xs font-bold text-amber-950">Bộ tương tác điểm tham khảo</p>
                        <p className="text-[11px] leading-4 text-slate-600">Chọn <strong>Cố định</strong> cho thành phần không muốn thay đổi. Các thành phần còn lại sẽ tự cân đối khi bạn tăng hoặc giảm điểm.</p>
                        {([
                          ['thpt', 'Điểm THPT', 30, 0.1, '/ 30'],
                          ['hocba', 'Điểm học bạ', 30, 0.1, '/ 30'],
                          ['dgnl', 'Điểm ĐGNL', 1200, 1, '/ 1200'],
                        ] as const).map(([key, label, max, step, unit]) => {
                          const enabled = key === 'thpt' ? currentFormConfig.requires.thpt : key === 'hocba' ? currentFormConfig.requires.hocba : currentFormConfig.requires.dgnl;
                          if (!enabled) return null;
                          return <div key={key} className={`rounded-md border p-2 ${targetDetailFixed[key] ? 'border-slate-300 bg-slate-100' : 'border-amber-200 bg-white'}`}>
                            <div className="flex items-center justify-between gap-2">
                              <label className="text-xs font-semibold text-slate-700">{label}: <span className="font-mono text-amber-900">{targetDetailScores[key].toFixed(key === 'dgnl' ? 0 : 2)} {unit}</span></label>
                              <label className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={targetDetailFixed[key]} onChange={(event) => setTargetDetailFixed((current) => ({ ...current, [key]: event.target.checked }))} className="h-3.5 w-3.5 accent-amber-700" />
                                Cố định
                              </label>
                            </div>
                            <input type="range" min="0" max={max} step={step} value={targetDetailScores[key]} disabled={targetDetailFixed[key]} onChange={(event) => updateTargetDetailScore(key, Number(event.target.value))} className="mt-1 w-full accent-amber-700 disabled:cursor-not-allowed disabled:opacity-40" />
                          </div>;
                        })}
                        <div className="rounded-md bg-white px-3 py-2 text-xs text-slate-700">Điểm xét tuyển mô phỏng: <strong className="text-amber-900">{((targetDetailScores.thpt / 30 * 100) * currentFormConfig.weights.thpt + (targetDetailScores.hocba / 30 * 100) * currentFormConfig.weights.hocba + (targetDetailScores.dgnl / 1200 * 100) * currentFormConfig.weights.dgnl + (forecastResult.calculation.components.achievementBonus || 0) + (forecastResult.calculation.components.priorityScore || 0)).toFixed(2)}</strong> / 100</div>
                      </div>
                    )}
                  </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {paginatedTargetMajors.some((entry) => entry.gap === null || entry.gap > 0) && (
                    <div>
                      <div className="grid grid-cols-1 gap-3">
                        {paginatedTargetMajors.filter((entry) => entry.gap === null || entry.gap > 0).map(({ major, reference, target, current, gap }) => (
                          <div key={major.code} className="rounded-lg border border-amber-200 bg-white p-4 shadow-sm">
                            <div className="flex flex-wrap items-baseline justify-between gap-2">
                              <h3 className="font-extrabold text-[var(--ussh-blue-dark)]">{major.name}</h3>
                              <span className="font-mono text-xs text-slate-500">Mã ngành: {major.code}</span>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                              <div><span className="block text-xs text-slate-500">Điểm chuẩn tham chiếu 2026</span><strong className="text-[var(--ussh-red)]">{reference.cutoffScore !== null ? reference.cutoffScore.toFixed(2) : 'Chưa có dữ liệu'}</strong></div>
                              <div><span className="block text-xs text-slate-500">Mục tiêu</span><strong className="text-amber-800">{target !== null ? target.toFixed(2) : 'Chưa có dữ liệu'}</strong></div>
                              <div><span className="block text-xs text-slate-500">Điểm xét tuyển dự kiến</span><strong>{current !== null ? current.toFixed(2) : 'Chưa phân tích'}</strong></div>
                              <div><span className="block text-xs text-slate-500">Khoảng cách</span><strong className="text-rose-700">{gap !== null ? `Còn thiếu ${gap.toFixed(2)}` : 'Chưa đủ dữ liệu'}</strong></div>
                            </div>
                            <div className="mt-4 flex items-center justify-between gap-3 border-t border-amber-100 pt-3">
                              <span className="text-xs text-slate-500">Điều chỉnh theo điểm hiện tại của bạn</span>
                              <button type="button" onClick={() => openTargetDetails(major.code)} className="rounded-lg bg-amber-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-800 cursor-pointer">Chi tiết</button>
                            </div>
                            {targetDetailMajorCode === major.code && (
                              <div className="mt-3 space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                                <p className="text-xs font-bold text-amber-950">Bộ tương tác điểm tham khảo</p>
                                <p className="text-[11px] leading-4 text-slate-600">Chọn <strong>Cố định</strong> cho thành phần không muốn thay đổi.</p>
                                {([
                                  ['thpt', 'Điểm THPT', 30, 0.1, '/ 30'],
                                  ['hocba', 'Điểm học bạ', 30, 0.1, '/ 30'],
                                  ['dgnl', 'Điểm ĐGNL', 1200, 1, '/ 1200'],
                                ] as const).map(([key, label, max, step, unit]) => {
                                  const enabled = key === 'thpt' ? currentFormConfig.requires.thpt : key === 'hocba' ? currentFormConfig.requires.hocba : currentFormConfig.requires.dgnl;
                                  if (!enabled) return null;
                                  return <div key={key} className={`rounded-md border p-2 ${targetDetailFixed[key] ? 'border-slate-300 bg-slate-100' : 'border-amber-200 bg-white'}`}>
                                    <div className="flex items-center justify-between gap-2">
                                      <label className="text-xs font-semibold text-slate-700">{label}: <span className="font-mono text-amber-900">{targetDetailScores[key].toFixed(key === 'dgnl' ? 0 : 2)} {unit}</span></label>
                                      <label className="inline-flex shrink-0 items-center gap-1 text-[11px] font-bold text-slate-600 cursor-pointer">
                                        <input type="checkbox" checked={targetDetailFixed[key]} onChange={(event) => setTargetDetailFixed((current) => ({ ...current, [key]: event.target.checked }))} className="h-3.5 w-3.5 accent-amber-700" />
                                        Cố định
                                      </label>
                                    </div>
                                    <input type="range" min="0" max={max} step={step} value={targetDetailScores[key]} disabled={targetDetailFixed[key]} onChange={(event) => updateTargetDetailScore(key, Number(event.target.value))} className="mt-1 w-full accent-amber-700 disabled:cursor-not-allowed disabled:opacity-40" />
                                  </div>;
                                })}
                                <div className="rounded-md bg-white px-3 py-2 text-xs text-slate-700">Điểm xét tuyển mô phỏng: <strong className="text-amber-900">{((targetDetailScores.thpt / 30 * 100) * currentFormConfig.weights.thpt + (targetDetailScores.hocba / 30 * 100) * currentFormConfig.weights.hocba + (targetDetailScores.dgnl / 1200 * 100) * currentFormConfig.weights.dgnl + (forecastResult.calculation.components.achievementBonus || 0) + (forecastResult.calculation.components.priorityScore || 0)).toFixed(2)}</strong> / 100</div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : <p className="text-sm text-slate-600">Chưa có ngành được chọn.</p>}
            </div>
            {targetMajorEntries.length > TARGETS_PER_PAGE && (
              <Pagination
                currentPage={targetPage}
                totalPages={totalTargetPages}
                onPageChange={setTargetPage}
                scrollTargetId="target-score-list"
                totalRecords={targetMajors.length}
                startIndex={(targetPage - 1) * TARGETS_PER_PAGE}
                endIndex={Math.min(targetPage * TARGETS_PER_PAGE, targetMajors.length)}
              />
            )}
            <p className="text-xs leading-5 text-slate-500"><strong>Lưu ý:</strong> Mục tiêu điểm dựa trên điểm chuẩn tham chiếu năm 2026 và dữ liệu điểm bạn cung cấp. Kết quả chỉ mang tính tham khảo, không đảm bảo khả năng trúng tuyển năm 2027.</p>
          </section>
          )}
          {!showTargetPanel && forecastResult && forecastResult.calculation ? (
            <div className="space-y-6">
              {/* ============================================================ */}
              {/* CARD 1: ĐIỂM XÉT TUYỂN CỦA BẠN (Component Breakdown & Total) */}
              {/* ============================================================ */}
              <div id="card-admission-score" className="bg-emerald-50/60 rounded-2xl border-2 border-emerald-300 p-6 shadow-md space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-sm sm:text-base font-bold text-[#0f2b5c] uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Điểm xét tuyển của bạn</span>
                  </h4>
                </div>

                {/* Score Summary Box */}
                <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/90 p-5 rounded-xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-blue-900 block">ĐIỂM XÉT TUYỂN CHÍNH THỨC</span>
                    <span className="text-xs text-blue-800 block mt-0.5">
                      (Đã bao gồm điểm xét tuyển gốc + điểm thưởng + điểm ưu tiên quy đổi)
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <strong className="text-3xl sm:text-4xl font-black text-[#0f2b5c] tracking-tight">
                      {forecastResult.calculation.finalAdmissionScore.toFixed(2)}
                    </strong>
                    <span className="text-xs font-bold text-slate-600 block">/ 100.00 điểm</span>
                  </div>
                </div>

                {/* Detailed Components Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                        <th className="py-2.5 px-3 font-bold">Thành phần điểm</th>
                        <th className="py-2.5 px-3 font-bold text-center">Điểm gốc</th>
                        <th className="py-2.5 px-3 font-bold text-center">Quy đổi thang 100</th>
                        <th className="py-2.5 px-3 font-bold text-center">Tỷ trọng</th>
                        <th className="py-2.5 px-3 font-bold text-right">Điểm thành phần</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {/* THPT row */}
                      {currentFormConfig.requires.thpt && (
                        <tr>
                          <td className="py-2.5 px-3 font-medium">
                            Điểm thi tốt nghiệp THPT
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold">
                            {forecastResult.calculation.components.thpt30 !== null ? `${forecastResult.calculation.components.thpt30.toFixed(2)} / 30` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-blue-900">
                            {forecastResult.calculation.components.thpt100 !== null ? forecastResult.calculation.components.thpt100.toFixed(2) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-600">
                            {currentFormConfig.weights.thpt * 100}%
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {forecastResult.calculation.components.thpt100 !== null 
                              ? (forecastResult.calculation.components.thpt100 * currentFormConfig.weights.thpt).toFixed(2) 
                              : '—'}
                          </td>
                        </tr>
                      )}

                      {/* ĐGNL row */}
                      {currentFormConfig.requires.dgnl && (
                        <tr>
                          <td className="py-2.5 px-3 font-medium">
                            Điểm thi ĐGNL ĐHQG-HCM
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold">
                            {forecastResult.calculation.components.dgnl1200 !== null ? `${forecastResult.calculation.components.dgnl1200} / 1200` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-purple-900">
                            {forecastResult.calculation.components.dgnl100 !== null ? forecastResult.calculation.components.dgnl100.toFixed(2) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-600">
                            {currentFormConfig.weights.dgnl * 100}%
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {forecastResult.calculation.components.dgnl100 !== null 
                              ? (forecastResult.calculation.components.dgnl100 * currentFormConfig.weights.dgnl).toFixed(2) 
                              : '—'}
                          </td>
                        </tr>
                      )}

                      {/* Học bạ row */}
                      {currentFormConfig.requires.hocba && (
                        <tr>
                          <td className="py-2.5 px-3 font-medium">
                            Điểm học bạ THPT
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold">
                            {forecastResult.calculation.components.hb30 !== null ? `${forecastResult.calculation.components.hb30.toFixed(2)} / 30` : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-900">
                            {forecastResult.calculation.components.hb100 !== null ? forecastResult.calculation.components.hb100.toFixed(2) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-600">
                            {currentFormConfig.weights.hocba * 100}%
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                            {forecastResult.calculation.components.hb100 !== null 
                              ? (forecastResult.calculation.components.hb100 * currentFormConfig.weights.hocba).toFixed(2) 
                              : '—'}
                          </td>
                        </tr>
                      )}

                      {/* Base Score Subtotal */}
                      <tr className="bg-slate-50/80 font-bold text-slate-900">
                        <td colSpan={4} className="py-2.5 px-3">
                          Điểm xét tuyển gốc (trước thưởng & ưu tiên):
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-blue-900 text-sm">
                          {forecastResult.calculation.baseAdmissionScore.toFixed(2)}
                        </td>
                      </tr>

                      {/* Bonus row */}
                      <tr>
                        <td colSpan={3} className="py-2 px-3 text-slate-600">
                          Điểm thưởng thành tích (HSG, chứng chỉ quốc tế):
                        </td>
                        <td className="py-2 px-3 text-center text-slate-500">—</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-amber-700">
                          +{forecastResult.calculation.components.achievementBonus.toFixed(2)}
                        </td>
                      </tr>

                      {/* Priority row */}
                      <tr>
                        <td colSpan={3} className="py-2 px-3 text-slate-600">
                          Điểm ưu tiên ({priorityArea} + {priorityObject}) quy đổi:
                        </td>
                        <td className="py-2 px-3 text-center text-slate-500 font-medium">
                          {forecastResult.calculation.baseAdmissionScore >= 75 ? 'Giảm lũy tiến' : 'Toàn phần'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                          +{forecastResult.calculation.components.priorityScore.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <strong>Công thức tính:</strong> {forecastResult.calculation.formulaDescription}
                </div>
              </div>

              {/* View mode A: If specific major selected, show Card 2 & Card 3 */}
              {selectedMajorId !== 'all' ? (
                <>
                  {/* ============================================================ */}
                  {/* CARD 2: ĐIỂM CHUẨN THAM CHIẾU & CHÊNH LỆCH */}
                  {/* ============================================================ */}
                  <div id="card-reference-cutoff" className="bg-blue-50/60 rounded-2xl border-2 border-blue-300 p-6 shadow-md space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="text-sm sm:text-base font-bold text-[#0f2b5c] uppercase tracking-wider flex items-center gap-2">
                        <Scale className="w-5 h-5 text-blue-600" />
                        <span>Điểm chuẩn tham chiếu</span>
                      </h4>
                      <span className="text-xs px-3 py-1 rounded-full bg-slate-100 font-bold text-slate-700 border border-slate-200">
                        {forecastResult.reference?.isReference2026For2027 ? 'Dữ liệu đối chiếu 2026' : `Năm ${forecastResult.reference?.year || 2026}`}
                      </span>
                    </div>

                    {forecastResult.reference && forecastResult.reference.cutoffScore !== null ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                          <span className="text-xs text-slate-600 font-semibold block">Điểm xét tuyển của bạn</span>
                          <strong className="text-2xl sm:text-3xl font-black text-[#0f2b5c] block mt-1">
                            {forecastResult.calculation.finalAdmissionScore.toFixed(2)}
                          </strong>
                          <span className="text-xs text-slate-500 block mt-0.5 font-medium">Thang 100</span>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                          <span className="text-xs text-slate-600 font-semibold block">
                            {forecastResult.reference.isReference2026For2027 ? 'Điểm chuẩn tham chiếu 2026' : 'Điểm chuẩn chính thức'}
                          </span>
                          <strong className="text-2xl sm:text-3xl font-black text-slate-800 block mt-1">
                            {forecastResult.reference.cutoffScore.toFixed(2)}
                          </strong>
                          <span className="text-xs text-slate-500 block mt-0.5 font-medium">
                            {forecastResult.reference.admissionForm} • {combination}
                          </span>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                          <span className="text-xs text-slate-600 font-semibold block">Chênh lệch điểm số</span>
                          <strong className={`text-2xl sm:text-3xl font-black block mt-1 ${forecastResult.scoreGap! >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {forecastResult.scoreGap! >= 0 ? `+${forecastResult.scoreGap!.toFixed(2)}` : forecastResult.scoreGap!.toFixed(2)}
                          </strong>
                          <span className="text-xs text-slate-500 block mt-0.5 font-bold">
                            {forecastResult.scoreGap! >= 0 ? 'Cao hơn điểm chuẩn' : 'Thấp hơn điểm chuẩn'}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs sm:text-sm">
                        <strong className="font-bold block mb-1 text-sm sm:text-base">
                          Không tìm thấy dữ liệu tuyển sinh phù hợp với lựa chọn hiện tại.
                        </strong>
                        Chưa có dữ liệu điểm chuẩn tham chiếu cho ngành <strong>{selectedMajor.name}</strong> theo hình thức <strong>{admissionForm}</strong> và tổ hợp <strong>{combination}</strong>. Hệ thống sẽ cập nhật ngay khi có thông báo chính thức từ Hội đồng Tuyển sinh.
                      </div>
                    )}

                  </div>

                  {/* ============================================================ */}
                  {/* CARD 3: ĐÁNH GIÁ KHẢ NĂNG TRÚNG TUYỂN */}
                  {/* ============================================================ */}
                  <div id="card-admission-assessment" className="bg-violet-50/60 rounded-2xl border-2 border-violet-300 p-6 shadow-md space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h4 className="text-sm sm:text-base font-bold text-[#0f2b5c] uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-amber-500" />
                        <span>Đánh giá khả năng trúng tuyển</span>
                      </h4>
                      <span className="text-xs text-slate-600 font-bold bg-slate-100 px-2.5 py-1 rounded-md">Xác suất trúng tuyển</span>
                    </div>

                    <div className="space-y-3">
                      {paginatedAssessments.length > 0 ? paginatedAssessments.map((assessment) => (
                        <div key={assessment.major.code} className="rounded-xl border border-violet-200 bg-white p-4 space-y-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h5 className="text-sm font-extrabold text-[var(--ussh-blue-dark)]">{assessment.major.name}</h5>
                              <p className="text-xs text-slate-500">Mã ngành: {assessment.major.code} · Điểm chuẩn tham chiếu: {assessment.cutoff !== null ? `${assessment.cutoff.toFixed(2)}/100` : 'Chưa có dữ liệu'}</p>
                            </div>
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <span className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800">
                                Xác suất trúng tuyển: {assessment.probability !== null ? `${assessment.probability.toFixed(2)}%` : 'Chưa có dữ liệu'}
                              </span>
                              <span className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${assessment.levelBadge}`}>{assessment.levelLabel}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
                            <span>Điểm của bạn: <strong>{forecastResult.calculation.finalAdmissionScore.toFixed(2)}</strong></span>
                            <span className={assessment.gap === null ? 'font-bold text-slate-500' : assessment.gap >= 0 ? 'font-bold text-emerald-700' : 'font-bold text-rose-700'}>
                              {assessment.gap === null ? 'Chưa có điểm chuẩn đối chiếu' : assessment.gap >= 0 ? `Cao hơn ${assessment.gap.toFixed(2)} điểm` : `Thấp hơn ${Math.abs(assessment.gap).toFixed(2)} điểm`}
                            </span>
                          </div>
                        </div>
                      )) : <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Chưa có ngành phù hợp với bộ lọc hiện tại.</p>}
                    </div>
                    {allMajorsEvaluations.length > ASSESSMENTS_PER_PAGE && (
                      <Pagination
                        currentPage={assessmentPage}
                        totalPages={totalAssessmentPages}
                        onPageChange={setAssessmentPage}
                        scrollTargetId="card-admission-assessment"
                        totalRecords={allMajorsEvaluations.length}
                        startIndex={(assessmentPage - 1) * ASSESSMENTS_PER_PAGE}
                        endIndex={Math.min(assessmentPage * ASSESSMENTS_PER_PAGE, allMajorsEvaluations.length)}
                      />
                    )}

                  </div>

                  {/* Recommended Alternatives */}
                  {alternativeMajors.length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                      <div>
                        <h4 className="font-bold text-sm sm:text-base text-[#0f2b5c]">
                          Các ngành cùng nhóm {selectedMajor.fieldCategoryName} để tham khảo thêm:
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-500">Tham khảo thêm các ngành đào tạo cùng nhóm lĩnh vực chuyên môn</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {alternativeMajors.map((alt) => (
                          <div
                            key={alt.id}
                            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-colors flex flex-col justify-between"
                          >
                            <div>
                              <span className="text-xs text-slate-500 font-mono block">{alt.code}</span>
                              <h5 className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 line-clamp-1">{alt.name}</h5>
                              <span className="text-xs font-semibold text-blue-800 block mt-1">
                                {alt.benchmarkHistory[0]?.thptScore || 25.0} điểm chuẩn THPT
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMajorId(alt.id);
                                window.scrollTo({ top: 100, behavior: 'smooth' });
                              }}
                              className="mt-3 text-xs text-[#0f2b5c] font-bold hover:underline self-start cursor-pointer"
                            >
                              Dự báo ngành này →
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* View mode B: When 'all' majors selected, display full comprehensive comparison table */
                <>
                <div id="results-comparison-card" ref={resultsComparisonRef} className="hidden bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-base sm:text-lg text-[#0f2b5c] flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span>Đối chiếu điểm xét tuyển với tất cả các ngành tại USSH</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-500">
                        Điểm xét tuyển của bạn: <strong className="text-[#0f2b5c] font-bold">{forecastResult.calculation.finalAdmissionScore.toFixed(2)}/100</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative w-full sm:w-56">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Tìm tên ngành, mã ngành..."
                          value={majorSearchQuery}
                          onChange={(e) => setMajorSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#0f2b5c]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                          <th className="py-2.5 px-3">Mã ngành</th>
                          <th className="py-2.5 px-3">Tên ngành</th>
                          <th className="py-2.5 px-3 text-center">Chênh lệch</th>
                          <th className="py-2.5 px-3 text-center">Xác suất trúng tuyển</th>
                          <th className="py-2.5 px-3 text-center">Mức độ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800">
                        {paginatedAllMajors.map((item) => (
                          <tr key={item.major.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{item.major.code}</td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900">{item.major.name}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold">
                              {item.gap !== null ? (
                                <span className={item.gap >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                  {item.gap >= 0 ? `+${item.gap.toFixed(2)}` : item.gap.toFixed(2)}
                                </span>
                              ) : '—'}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className="font-mono font-bold text-slate-900">{item.probability !== null ? `${item.probability.toFixed(2)}%` : '—'}</span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold border ${item.levelBadge}`}>
                                {item.levelLabel}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination with smooth scroll back-to-top */}
                  {filteredAllMajors.length > RESULTS_PER_PAGE && (
                    <div className="pt-3 border-t border-slate-100">
                      <Pagination
                        currentPage={resultsPage}
                        totalPages={totalResultsPages}
                        onPageChange={(page) => {
                          setResultsPage(page);
                          if (resultsComparisonRef.current) {
                            const navOffset = 80;
                            const targetY = resultsComparisonRef.current.getBoundingClientRect().top + window.pageYOffset - navOffset;
                            window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
                          } else {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        totalRecords={totalResultsCount}
                        startIndex={(resultsPage - 1) * RESULTS_PER_PAGE}
                        endIndex={Math.min(resultsPage * RESULTS_PER_PAGE, totalResultsCount)}
                        scrollTargetId="results-comparison-card"
                      />
                    </div>
                  )}
                </div>
                <div id="card-admission-assessment-all" className="bg-violet-50/60 rounded-2xl border-2 border-violet-300 p-6 shadow-md space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-sm sm:text-base font-bold text-[#0f2b5c] uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-amber-500" />
                      <span>Đánh giá khả năng trúng tuyển</span>
                    </h4>
                    <span className="text-xs text-slate-600 font-bold bg-slate-100 px-2.5 py-1 rounded-md">Xác suất trúng tuyển</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">Kết quả được đánh giá trên cơ sở mức chênh lệch giữa điểm xét tuyển dự kiến và điểm chuẩn 2026 phù hợp. Đây không phải kết quả trúng tuyển chính thức hay mô hình dự báo cá nhân.</p>
                  <div className="space-y-3">
                    {paginatedAssessments.length > 0 ? paginatedAssessments.map((assessment) => (
                      <div key={assessment.major.code} className="rounded-xl border border-violet-200 bg-white p-4 space-y-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h5 className="text-sm font-extrabold text-[var(--ussh-blue-dark)]">{assessment.major.name}</h5>
                            <p className="text-xs text-slate-500">Mã ngành: {assessment.major.code} · Điểm chuẩn tham chiếu: {assessment.cutoff !== null ? `${assessment.cutoff.toFixed(2)}/100` : 'Chưa có dữ liệu'}</p>
                          </div>
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <span className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800">
                              Xác suất trúng tuyển: {assessment.probability !== null ? `${assessment.probability.toFixed(2)}%` : 'Chưa có dữ liệu'}
                            </span>
                            <span className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${assessment.levelBadge}`}>{assessment.levelLabel}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-xs text-slate-600">
                          <span>Điểm của bạn: <strong>{forecastResult.calculation.finalAdmissionScore.toFixed(2)}</strong></span>
                          <span className={assessment.gap === null ? 'font-bold text-slate-500' : assessment.gap >= 0 ? 'font-bold text-emerald-700' : 'font-bold text-rose-700'}>
                            {assessment.gap === null ? 'Chưa có điểm chuẩn đối chiếu' : assessment.gap >= 0 ? `Cao hơn ${assessment.gap.toFixed(2)} điểm` : `Thấp hơn ${Math.abs(assessment.gap).toFixed(2)} điểm`}
                          </span>
                        </div>
                      </div>
                    )) : <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Chưa có ngành phù hợp với bộ lọc hiện tại.</p>}
                  </div>
                  {allMajorsEvaluations.length > ASSESSMENTS_PER_PAGE && (
                    <Pagination
                      currentPage={assessmentPage}
                      totalPages={totalAssessmentPages}
                      onPageChange={setAssessmentPage}
                      scrollTargetId="card-admission-assessment-all"
                      totalRecords={allMajorsEvaluations.length}
                      startIndex={(assessmentPage - 1) * ASSESSMENTS_PER_PAGE}
                      endIndex={Math.min(assessmentPage * ASSESSMENTS_PER_PAGE, allMajorsEvaluations.length)}
                    />
                  )}
                </div>
                </>
              )}
              {scoreType === 'fake' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={showTargetScores}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 cursor-pointer"
                  >
                    <Target className="h-3.5 w-3.5" />
                    <span>Xem mục tiêu điểm</span>
                  </button>
                </div>
              )}
            </div>
          ) : !showTargetPanel ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 space-y-3">
              <BarChart3 className="w-12 h-12 mx-auto text-slate-300" />
              <h4 className="font-bold text-slate-700 text-base sm:text-lg">
                Vui lòng nhấn nút &quot;Phân tích&quot;
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Nhập đầy đủ điểm thi THPT, ĐGNL hoặc học bạ theo hình thức xét tuyển ở khung bên trái và bấm &quot;Phân tích&quot;.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
