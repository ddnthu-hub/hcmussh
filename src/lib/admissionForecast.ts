/**
 * Module tính toán và dự đoán trúng tuyển Trường ĐH KHXH&NV – ĐHQG-HCM
 * 
 * Kiến trúc phân tầng rõ ràng:
 * 1. THÔNG TIN THÍ SINH (Input)
 * 2. TÍNH ĐIỂM THÀNH PHẦN (THPT, Học bạ, ĐGNL, Điểm thưởng, Điểm ưu tiên)
 * 3. TÍNH ĐIỂM XÉT TUYỂN (Theo công thức chính thức DT01, DT02, DT03 - tách trước & sau ưu tiên)
 * 4. SO SÁNH VỚI DỮ LIỆU TUYỂN SINH (Điểm chuẩn tham chiếu năm 2026 / 2027)
 * 5. ĐÁNH GIÁ KHẢ NĂNG TRÚNG TUYỂN (Mức đánh giá tham khảo khách quan, KHÔNG dùng xác suất giả)
 * 6. KẾT QUẢ TỔNG HỢP
 */

export type AdmissionYear = 2026 | 2027;

export type AdmissionFormCode = 'DT01' | 'DT02' | 'DT03' | 'all';

export interface AdmissionFormConfig {
  code: AdmissionFormCode;
  name: string;
  shortLabel: string;
  fullName: string;
  description: string;
  weights: {
    thpt: number;
    dgnl: number;
    hocba: number;
  };
  requires: {
    thpt: boolean;
    dgnl: boolean;
    hocba: boolean;
  };
}

export const ADMISSION_FORMS_CONFIG: Record<string, AdmissionFormConfig> = {
  DT01: {
    code: 'DT01',
    name: 'DT01 (THPT + ĐGNL + Học bạ)',
    shortLabel: 'THPT + ĐGNL + Học bạ',
    fullName: 'Điểm thi THPT + Điểm thi ĐGNL + Điểm học bạ THPT',
    description: 'Áp dụng cho thí sinh có kết quả thi Tốt nghiệp THPT (45%), thi ĐGNL ĐHQG-HCM (45%) và học bạ THPT (10%).',
    weights: { thpt: 0.45, dgnl: 0.45, hocba: 0.10 },
    requires: { thpt: true, dgnl: true, hocba: true },
  },
  DT02: {
    code: 'DT02',
    name: 'DT02 (THPT + Học bạ)',
    shortLabel: 'THPT + Học bạ',
    fullName: 'Điểm thi THPT + Điểm học bạ THPT',
    description: 'Dành cho thí sinh sử dụng điểm thi Tốt nghiệp THPT (90%) kết hợp kết quả học bạ THPT (10%).',
    weights: { thpt: 0.90, dgnl: 0.0, hocba: 0.10 },
    requires: { thpt: true, dgnl: false, hocba: true },
  },
  DT03: {
    code: 'DT03',
    name: 'DT03 (ĐGNL + Học bạ)',
    shortLabel: 'ĐGNL + Học bạ',
    fullName: 'Điểm thi ĐGNL + Điểm học bạ THPT',
    description: 'Dành cho thí sinh sử dụng điểm thi ĐGNL ĐHQG-HCM (90%) kết hợp kết quả học bạ THPT (10%).',
    weights: { thpt: 0.0, dgnl: 0.90, hocba: 0.10 },
    requires: { thpt: false, dgnl: true, hocba: true },
  },
  all: {
    code: 'all',
    name: 'Tất cả',
    shortLabel: 'Tất cả',
    fullName: 'Tất cả phương thức xét tuyển chính thức (ĐT01, ĐT02, ĐT03)',
    description: 'Bao gồm các phương thức ĐT01, ĐT02 và ĐT03 năm 2026. Nhập các đầu điểm bạn có để hệ thống phân tích.',
    weights: { thpt: 0.45, dgnl: 0.45, hocba: 0.10 },
    requires: { thpt: true, dgnl: true, hocba: true },
  },
};

export type ForecastStatus = 
  | 'READY' 
  | 'MISSING_INPUT' 
  | 'MISSING_CUTOFF' 
  | 'MISSING_ALPHA1' 
  | 'MISSING_MODEL_DATA' 
  | 'MODEL_UNAVAILABLE';

export type AssessmentLevel = 'HIGH' | 'FAIRLY_SAFE' | 'CONSIDER' | 'LOW' | 'INSUFFICIENT_DATA';

/**
 * CẤU HÌNH TẬP TRUNG HỆ SỐ k VÀ CÁC NGƯỠNG ĐÁNH GIÁ XÁC SUẤT
 * Hàm logistic: P = 1 / (1 + e^(-kD)), Probability = P * 100
 * Trong đó D = S - C (khoảng cách điểm giữa điểm dự kiến S và điểm chuẩn tham chiếu C)
 * k quyết định độ nhạy của xác suất đối với khoảng cách điểm.
 */
export const PROBABILITY_CONFIG = {
  /**
   * Hệ số k điều chỉnh độ dốc của hàm logistic.
   * Dùng k = 0.5 theo đặc tả chuẩn và mô phỏng thực tế tuyển sinh:
   * - D = 0  -> P = 50.00%
   * - D = +4 -> P ≈ 88.08%
   * - D = -4 -> P ≈ 11.92%
   */
  K: 0.5,
};

export const PROBABILITY_THRESHOLDS = {
  SAFE: 85,        // Probability >= 85% -> An toàn
  FAIRLY_SAFE: 65, // 65% <= Probability < 85% -> Khá an toàn
  CONSIDER: 40,    // 40% <= Probability < 65% -> Cân nhắc
                   // Probability < 40% -> Rủi ro
};

export interface AssessmentThresholds {
  safeMinGap: number;     // scoreGap >= safeMinGap -> HIGH
  considerMinGap: number; // scoreGap >= considerMinGap -> CONSIDER, below -> LOW
}

export const ASSESSMENT_THRESHOLDS: AssessmentThresholds = {
  safeMinGap: 1.0,      // Cao hơn điểm chuẩn từ +1.0 điểm (thang 100)
  considerMinGap: -1.5, // Thấp hơn điểm chuẩn từ -1.5 đến +1.0 điểm (thang 100)
};

export interface UserScoreInputs {
  year: AdmissionYear;
  majorCode: string;
  majorName: string;
  programType: string;
  admissionForm: AdmissionFormCode;
  combination: string;
  
  // THPT inputs (chọn 1 trong 2: 3 môn hoặc tổng)
  inputModeThpt: 'subjects' | 'total';
  thptSubject1?: number;
  thptSubject2?: number;
  thptSubject3?: number;
  thptTotal?: number;

  // Học bạ inputs (chọn 1 trong 2: 3 môn hoặc tổng)
  inputModeHocBa: 'subjects' | 'total';
  hbSubject1?: number;
  hbSubject2?: number;
  hbSubject3?: number;
  hbTotal?: number;

  // ĐGNL input (thang 1200)
  dgnlScore?: number;

  // Điểm thưởng thành tích
  achievementBonus: number; // thang 100 (tối đa 5.0 điểm)

  // Điểm ưu tiên
  priorityArea: 'KV1' | 'KV2-NT' | 'KV2' | 'KV3';
  priorityObject: 'None' | 'UT1' | 'UT2';
}

export interface ComponentScores {
  // THPT
  thptSubject1: number | null;
  thptSubject2: number | null;
  thptSubject3: number | null;
  thpt30: number | null;
  thpt100: number | null;

  // Học bạ
  hbSubject1: number | null;
  hbSubject2: number | null;
  hbSubject3: number | null;
  hb30: number | null;
  hb100: number | null;

  // ĐGNL
  dgnl1200: number | null;
  dgnl100: number | null;

  // Thưởng & Ưu tiên
  achievementBonus: number;
  basePriority30: number;
  basePriority100: number;
  scaledPriority: number;
  priorityScore: number;
}

export interface CalculationResult {
  components: ComponentScores;
  alpha1: number;
  admissionForm: Exclude<AdmissionFormCode, 'all'>;
  baseAdmissionScore: number;
  finalAdmissionScore: number;
  formulaDescription: string;
}

export interface ReferenceCutoff {
  year: number;
  majorCode: string;
  majorName: string;
  programType: string;
  admissionForm: AdmissionFormCode;
  combination: string;
  cutoffScore: number | null;
  maxScore: number;
  isOfficial2026: boolean;
  isReference2026For2027: boolean;
  notes?: string;
}

export interface PredictionOutcome {
  type: 'model_probability' | 'assessment';
  probability: number | null; // Luôn là null nếu không có candidate-level model
  level: AssessmentLevel;
  levelLabel: string;
  levelColor: string;
  commentary: string;
  isModelAvailable: boolean;
  modelDetails?: {
    modelVersion: string;
    trainedAt: string;
    metrics: Record<string, number>;
  };
}

export interface ForecastResult {
  status: ForecastStatus;
  statusMessage?: string;
  input: {
    year: AdmissionYear;
    majorCode: string;
    majorName: string;
    programType: string;
    admissionForm: AdmissionFormCode;
    combination: string;
    priorityArea: string;
    priorityObject: string;
  };
  calculation: CalculationResult | null;
  reference: ReferenceCutoff | null;
  scoreGap: number | null;
  prediction: PredictionOutcome | null;
}

// Hệ số điểm ưu tiên khu vực (thang 30 theo quy chế)
export const PRIORITY_AREA_POINTS: Record<string, number> = {
  'KV1': 0.75,
  'KV2-NT': 0.50,
  'KV2': 0.25,
  'KV3': 0.00,
};

// Hệ số điểm ưu tiên đối tượng (thang 30 theo quy chế)
export const PRIORITY_OBJECT_POINTS: Record<string, number> = {
  'None': 0.00,
  'UT1': 2.00,
  'UT2': 1.00,
};

/**
 * Kiểm tra xem hệ thống có dữ liệu cấp cá nhân (candidate-level labels) và model thống kê hợp lệ hay không.
 * Căn cứ: Hệ thống hiện chỉ có bảng điểm chuẩn, chưa có dữ liệu lịch sử trúng/trượt của từng thí sinh.
 */
export function checkModelAvailability(): {
  hasCandidateData: boolean;
  hasLabels: boolean;
  hasTrainedModel: boolean;
  reason: string;
} {
  return {
    hasCandidateData: false,
    hasLabels: false,
    hasTrainedModel: false,
    reason: 'Hệ thống hiện chưa có tập dữ liệu cấp cá nhân (candidate-level records kèm nhãn trúng/trượt admitted=0/1) để huấn luyện Logistic Regression. Kết quả được đánh giá dựa trên mức so sánh điểm xét tuyển với điểm chuẩn tham chiếu tuyển sinh.',
  };
}

/**
 * Tính điểm THPT
 * Kiểm tra: 0 <= mỗi môn <= 10, 0 <= THPT30 <= 30
 * Quy đổi: THPT100 = THPT30 * 100 / 30
 */
export function calculateThptScores(input: {
  inputMode: 'subjects' | 'total';
  sub1?: number;
  sub2?: number;
  sub3?: number;
  total?: number;
}): { thpt30: number; thpt100: number; s1: number | null; s2: number | null; s3: number | null } | null {
  if (input.inputMode === 'subjects') {
    if (
      input.sub1 === undefined || input.sub1 === null || isNaN(input.sub1) ||
      input.sub2 === undefined || input.sub2 === null || isNaN(input.sub2) ||
      input.sub3 === undefined || input.sub3 === null || isNaN(input.sub3)
    ) {
      return null;
    }
    const s1 = Math.max(0, Math.min(10, input.sub1));
    const s2 = Math.max(0, Math.min(10, input.sub2));
    const s3 = Math.max(0, Math.min(10, input.sub3));
    const thpt30 = Number((s1 + s2 + s3).toFixed(2));
    const thpt100 = Number(((thpt30 * 100) / 30).toFixed(2));
    return { thpt30, thpt100, s1, s2, s3 };
  } else {
    if (input.total === undefined || input.total === null || isNaN(input.total)) {
      return null;
    }
    const thpt30 = Math.max(0, Math.min(30, input.total));
    const thpt100 = Number(((thpt30 * 100) / 30).toFixed(2));
    return { thpt30, thpt100, s1: null, s2: null, s3: null };
  }
}

/**
 * Tính điểm Học bạ
 * Kiểm tra: 0 <= mỗi môn <= 10, 0 <= HB30 <= 30
 * Quy đổi: HB100 = HB30 * 100 / 30
 */
export function calculateHocBaScores(input: {
  inputMode: 'subjects' | 'total';
  sub1?: number;
  sub2?: number;
  sub3?: number;
  total?: number;
}): { hb30: number; hb100: number; s1: number | null; s2: number | null; s3: number | null } | null {
  if (input.inputMode === 'subjects') {
    if (
      input.sub1 === undefined || input.sub1 === null || isNaN(input.sub1) ||
      input.sub2 === undefined || input.sub2 === null || isNaN(input.sub2) ||
      input.sub3 === undefined || input.sub3 === null || isNaN(input.sub3)
    ) {
      return null;
    }
    const s1 = Math.max(0, Math.min(10, input.sub1));
    const s2 = Math.max(0, Math.min(10, input.sub2));
    const s3 = Math.max(0, Math.min(10, input.sub3));
    const hb30 = Number((s1 + s2 + s3).toFixed(2));
    const hb100 = Number(((hb30 * 100) / 30).toFixed(2));
    return { hb30, hb100, s1, s2, s3 };
  } else {
    if (input.total === undefined || input.total === null || isNaN(input.total)) {
      return null;
    }
    const hb30 = Math.max(0, Math.min(30, input.total));
    const hb100 = Number(((hb30 * 100) / 30).toFixed(2));
    return { hb30, hb100, s1: null, s2: null, s3: null };
  }
}

/**
 * Tính điểm ĐGNL ĐHQG-HCM
 * Giữ nguyên thang 0 - 1200
 * Quy đổi sang thang 100: DGNL100 = DGNLScore * 100 / 1200
 */
export function calculateDgnlScores(rawDgnl?: number): { dgnl1200: number; dgnl100: number } | null {
  if (rawDgnl === undefined || rawDgnl === null || isNaN(rawDgnl)) {
    return null;
  }
  const dgnl1200 = Math.max(0, Math.min(1200, rawDgnl));
  const dgnl100 = Number(((dgnl1200 * 100) / 1200).toFixed(2));
  return { dgnl1200, dgnl100 };
}

/**
 * Tính điểm ưu tiên (theo quy chế Bộ GD&ĐT & ĐHQG-HCM)
 * Tránh hoàn toàn tính toán vòng lặp (circular calculation).
 * Thứ tự:
 * 1. Nhận baseAdmissionScore (trước ưu tiên) trên thang 100
 * 2. Tính mức điểm ưu tiên cơ bản basePriority trên thang 30 -> quy đổi thang 100
 * 3. Nếu baseAdmissionScore >= 75: áp dụng công thức giảm lũy tiến:
 *    scaledPriority = [(100 - baseAdmissionScore) / 25] * basePriority100
 *    Nếu baseAdmissionScore < 75: scaledPriority = basePriority100
 */
export function calculatePriorityScores(
  baseAdmissionScore: number,
  area: string,
  object: string
): {
  basePriority30: number;
  basePriority100: number;
  scaledPriority: number;
  priorityScore: number;
} {
  const areaPoints = PRIORITY_AREA_POINTS[area] || 0;
  const objectPoints = PRIORITY_OBJECT_POINTS[object] || 0;
  const basePriority30 = Number((areaPoints + objectPoints).toFixed(2));
  const basePriority100 = Number(((basePriority30 * 100) / 30).toFixed(2));

  let scaledPriority = basePriority100;
  if (baseAdmissionScore >= 75.0) {
    const factor = Math.max(0, (100.0 - baseAdmissionScore) / 25.0);
    scaledPriority = Number((factor * basePriority100).toFixed(2));
  }

  const priorityScore = Math.max(0, Number(scaledPriority.toFixed(2)));

  return {
    basePriority30,
    basePriority100,
    scaledPriority,
    priorityScore,
  };
}

/**
 * Lấy hệ số α1 từ cấu hình
 * Mặc định α1 = 1.0 trừ khi có cấu hình đặc thù cho ngành/tổ hợp.
 * Hoàn toàn không sử dụng α2.
 */
export function getAlpha1(majorCode: string, combination: string): number {
  // Chuẩn hóa theo quy định USSH: α1 = 1.0 cho tổ hợp gốc
  return 1.0;
}

/**
 * Tính toán toàn bộ quy trình điểm xét tuyển
 */
export function calculateAdmissionScore(
  inputs: UserScoreInputs
): { calculation: CalculationResult | null; missingFields: string[] } {
  let effectiveForm = inputs.admissionForm;
  if (effectiveForm === 'all') {
    const hasDgnl = inputs.dgnlScore !== undefined && !isNaN(inputs.dgnlScore) && inputs.dgnlScore > 0;
    const hasThpt = (inputs.inputModeThpt === 'total' && !!inputs.thptTotal) || (inputs.inputModeThpt === 'subjects' && inputs.thptSubject1 !== undefined);
    if (hasThpt && hasDgnl) {
      effectiveForm = 'DT01';
    } else if (hasThpt) {
      effectiveForm = 'DT02';
    } else if (hasDgnl) {
      effectiveForm = 'DT03';
    } else {
      effectiveForm = 'DT01';
    }
  }
  const formConfig = ADMISSION_FORMS_CONFIG[effectiveForm] || ADMISSION_FORMS_CONFIG.DT01;
  const missingFields: string[] = [];

  // THPT
  let thptResult: ReturnType<typeof calculateThptScores> = null;
  if (formConfig.requires.thpt) {
    thptResult = calculateThptScores({
      inputMode: inputs.inputModeThpt,
      sub1: inputs.thptSubject1,
      sub2: inputs.thptSubject2,
      sub3: inputs.thptSubject3,
      total: inputs.thptTotal,
    });
    if (!thptResult) {
      missingFields.push('Điểm thi tốt nghiệp THPT');
    }
  }

  // Học bạ
  let hbResult: ReturnType<typeof calculateHocBaScores> = null;
  if (formConfig.requires.hocba) {
    hbResult = calculateHocBaScores({
      inputMode: inputs.inputModeHocBa,
      sub1: inputs.hbSubject1,
      sub2: inputs.hbSubject2,
      sub3: inputs.hbSubject3,
      total: inputs.hbTotal,
    });
    if (!hbResult) {
      missingFields.push('Điểm học bạ THPT');
    }
  }

  // ĐGNL
  let dgnlResult: ReturnType<typeof calculateDgnlScores> = null;
  if (formConfig.requires.dgnl) {
    dgnlResult = calculateDgnlScores(inputs.dgnlScore);
    if (!dgnlResult) {
      missingFields.push('Điểm thi ĐGNL ĐHQG-HCM');
    }
  }

  if (missingFields.length > 0) {
    return { calculation: null, missingFields };
  }

  // Lấy alpha1
  const alpha1 = getAlpha1(inputs.majorCode, inputs.combination);

  // Tính baseAdmissionScore
  let baseAdmissionScore = 0;
  let formulaDescription = '';

  const thpt100 = thptResult ? thptResult.thpt100 : 0;
  const hb100 = hbResult ? hbResult.hb100 : 0;
  const dgnl100 = dgnlResult ? dgnlResult.dgnl100 : 0;

  if (effectiveForm === 'DT01') {
    // DT01: 45% THPT + 45% ĐGNL + 10% Học bạ
    baseAdmissionScore = (thpt100 * alpha1 * 0.45) + (dgnl100 * 0.45) + (hb100 * 0.10);
    formulaDescription = `Điểm xét tuyển gốc = (${thpt100.toFixed(2)} × ${alpha1} × 45%) + (${dgnl100.toFixed(2)} × 45%) + (${hb100.toFixed(2)} × 10%) = ${baseAdmissionScore.toFixed(2)}`;
  } else if (effectiveForm === 'DT02') {
    // DT02: 90% THPT + 10% Học bạ
    baseAdmissionScore = (thpt100 * alpha1 * 0.90) + (hb100 * 0.10);
    formulaDescription = `Điểm xét tuyển gốc = (${thpt100.toFixed(2)} × ${alpha1} × 90%) + (${hb100.toFixed(2)} × 10%) = ${baseAdmissionScore.toFixed(2)}`;
  } else if (effectiveForm === 'DT03') {
    // DT03: 90% ĐGNL + 10% Học bạ
    baseAdmissionScore = (dgnl100 * 0.90) + (hb100 * 0.10);
    formulaDescription = `Điểm xét tuyển gốc = (${dgnl100.toFixed(2)} × 90%) + (${hb100.toFixed(2)} × 10%) = ${baseAdmissionScore.toFixed(2)}`;
  }

  baseAdmissionScore = Number(baseAdmissionScore.toFixed(2));

  // Điểm thưởng thành tích (giới hạn 0 - 5.0 thang 100)
  const achievementBonus = Math.max(0, Math.min(5.0, Number((inputs.achievementBonus || 0).toFixed(2))));

  // Điểm ưu tiên (tính từ baseAdmissionScore)
  const priorityInfo = calculatePriorityScores(baseAdmissionScore, inputs.priorityArea, inputs.priorityObject);

  // Điểm xét tuyển cuối cùng (thang 100, tối đa 100.0)
  const finalAdmissionScore = Math.min(
    100.0,
    Number((baseAdmissionScore + achievementBonus + priorityInfo.priorityScore).toFixed(2))
  );

  const components: ComponentScores = {
    thptSubject1: thptResult ? thptResult.s1 : null,
    thptSubject2: thptResult ? thptResult.s2 : null,
    thptSubject3: thptResult ? thptResult.s3 : null,
    thpt30: thptResult ? thptResult.thpt30 : null,
    thpt100: thptResult ? thptResult.thpt100 : null,

    hbSubject1: hbResult ? hbResult.s1 : null,
    hbSubject2: hbResult ? hbResult.s2 : null,
    hbSubject3: hbResult ? hbResult.s3 : null,
    hb30: hbResult ? hbResult.hb30 : null,
    hb100: hbResult ? hbResult.hb100 : null,

    dgnl1200: dgnlResult ? dgnlResult.dgnl1200 : null,
    dgnl100: dgnlResult ? dgnlResult.dgnl100 : null,

    achievementBonus,
    basePriority30: priorityInfo.basePriority30,
    basePriority100: priorityInfo.basePriority100,
    scaledPriority: priorityInfo.scaledPriority,
    priorityScore: priorityInfo.priorityScore,
  };

  return {
    missingFields: [],
    calculation: {
      components,
      alpha1,
      admissionForm: effectiveForm as Exclude<AdmissionFormCode, 'all'>,
      baseAdmissionScore,
      finalAdmissionScore,
      formulaDescription,
    },
  };
}

/**
 * Chuẩn hóa Hệ / Chương trình đào tạo về 3 nhóm chính thức theo yêu cầu:
 * - Chương trình chuẩn
 * - Chương trình chuẩn quốc tế
 * - Chương trình liên kết với nước ngoài
 */
export function normalizeProgramType(
  raw?: string
): 'Chương trình chuẩn' | 'Chương trình chuẩn quốc tế' | 'Chương trình liên kết với nước ngoài' {
  if (!raw) return 'Chương trình chuẩn';
  const s = raw.toLowerCase().trim();
  if (
    s.includes('liên kết') ||
    s.includes('nước ngoài') ||
    s.includes('lkqt') ||
    s.includes('quốc tế 2+2') ||
    s.includes('đối tác')
  ) {
    return 'Chương trình liên kết với nước ngoài';
  }
  if (
    s.includes('chuẩn quốc tế') ||
    s.includes('chất lượng cao') ||
    s.includes('clc') ||
    (s.includes('quốc tế') && !s.includes('liên kết'))
  ) {
    return 'Chương trình chuẩn quốc tế';
  }
  return 'Chương trình chuẩn';
}

export function normalizeFormCode(val: string | undefined | null): string {
  if (!val) return '';
  return val.trim().replace(/đ/gi, 'd').replace(/Đ/g, 'D').toUpperCase();
}

export function matchesProgramType(recHeDaoTao: string | undefined, targetType: string | undefined): boolean {
  if (!targetType || targetType === 'all' || targetType === 'Tất cả') return true;
  return normalizeProgramType(recHeDaoTao) === normalizeProgramType(targetType);
}

export function matchesAdmissionForm(
  rec: { doi_tuong?: string; ma_pt?: string },
  targetForm: string | undefined
): boolean {
  if (!targetForm || targetForm === 'all') return true;
  const targetNorm = normalizeFormCode(targetForm);
  const recDoiTuongNorm = normalizeFormCode(rec.doi_tuong);
  const recMaPtNorm = normalizeFormCode(rec.ma_pt);

  if (recDoiTuongNorm === targetNorm || recMaPtNorm === targetNorm) return true;
  if (recDoiTuongNorm.includes(targetNorm) || recMaPtNorm.includes(targetNorm)) return true;

  const combinedText = `${rec.doi_tuong || ''} ${rec.ma_pt || ''}`.toLowerCase();
  if (targetNorm === 'DT01') {
    if (combinedText.includes('thpt') && combinedText.includes('đgnl')) return true;
  }
  if (targetNorm === 'DT02') {
    if (combinedText.includes('thpt') && !combinedText.includes('đgnl')) return true;
  }
  if (targetNorm === 'DT03') {
    if (combinedText.includes('đgnl') && !combinedText.includes('thpt')) return true;
  }

  return false;
}

/**
 * BƯỚC 2 — LẤY ĐIỂM CHUẨN THAM CHIẾU
 * Lấy điểm chuẩn thực tế từ Firestore (records2026).
 * Lọc đúng theo nam, ma_nganh, he_dao_tao, doi_tuong, to_hop.
 * Ưu tiên dữ liệu năm 2026 khi dự đoán tuyển sinh năm 2027.
 * Không được tạo dữ liệu năm 2027 bằng cách đổi năm từ dữ liệu 2026.
 * Kết quả: C = điểm chuẩn tham chiếu
 */
export function getReferenceCutoff(
  records: Array<{
    nam: number;
    ma_nganh: string;
    ten_nganh?: string;
    he_dao_tao: string;
    doi_tuong?: string;
    ma_pt?: string;
    to_hop: string;
    diem_chuan: number;
    thang_diem: number;
    notes?: string;
  }>,
  query: {
    year: AdmissionYear;
    majorCode: string;
    programType: string;
    admissionForm: AdmissionFormCode;
    combination: string;
  }
): ReferenceCutoff {
  // Dự đoán 2027 dùng năm gần nhất đã có dữ liệu, hiện là 2026.
  const availableYears = Array.from(new Set(records.map((record) => Number(record.nam))))
    .filter((recordYear) => Number.isFinite(recordYear) && recordYear <= 2026)
    .sort((a, b) => b - a);
  const targetYear = availableYears[0] || 2026;
  const recordsInYear = records.filter((r) => Number(r.nam) === targetYear);

  // 2. Xác định ma_nganh
  let pool = recordsInYear;
  if (query.majorCode && query.majorCode !== 'all') {
    const cleanMajorCode = String(query.majorCode).trim();
    const exactMajor = pool.filter((r) => String(r.ma_nganh).trim() === cleanMajorCode);
    if (exactMajor.length > 0) {
      pool = exactMajor;
    } else {
      const prefixMajor = pool.filter((r) => String(r.ma_nganh).trim().startsWith(cleanMajorCode));
      if (prefixMajor.length > 0) {
        pool = prefixMajor;
      }
    }
  }

  // 3. Lọc phương thức bắt buộc. Không fallback sang phương thức khác.
  if (query.admissionForm && query.admissionForm !== 'all') {
    const formMatched = pool.filter((r) => matchesAdmissionForm(r, query.admissionForm));
    pool = formMatched;
  }

  // 4. Xác định tổ hợp nếu dữ liệu thực tế cần tổ hợp
  if (query.combination && query.combination !== 'all') {
    const cleanQueryToHop = query.combination.trim().split(/[\s(]/)[0].toUpperCase();
    const toHopMatched = pool.filter((r) => {
      if (!r.to_hop || r.to_hop === 'all' || r.to_hop === 'ALL') return true;
      const cleanRecToHop = String(r.to_hop).trim().split(/[\s(]/)[0].toUpperCase();
      return cleanRecToHop === cleanQueryToHop;
    });
      pool = toHopMatched;
  }

  // 5. Lọc hệ đào tạo bắt buộc khi người dùng đã chọn một hệ.
  if (query.programType && query.programType !== 'all') {
    pool = pool.filter((r) => matchesProgramType(r.he_dao_tao, query.programType));
  } else if (pool.length > 1) {
    // Khi người dùng chưa chọn hệ cụ thể, dùng chương trình chuẩn làm
    // tham chiếu mặc định để không trộn điểm chuẩn giữa các hệ đào tạo.
    const standardPool = pool.filter((r) => normalizeProgramType(r.he_dao_tao) === 'Chương trình chuẩn');
    if (standardPool.length > 0) pool = standardPool;
  }

  const is2027 = query.year === 2027;
  // Nhiều bản ghi có thể cùng một ngành/phương thức/tổ hợp; dùng trung vị
  // của dữ liệu thực tế thay vì chọn tùy ý một document.
  if (pool.length > 1) {
    pool.sort((a, b) => a.diem_chuan - b.diem_chuan);
  }
  const matched = pool.length > 0 ? pool[Math.floor(pool.length / 2)] : null;

  if (matched) {
    return {
      year: matched.nam,
      majorCode: matched.ma_nganh,
      majorName: matched.ten_nganh || '',
      programType: matched.he_dao_tao,
      admissionForm: query.admissionForm,
      combination: query.combination,
      cutoffScore: matched.diem_chuan,
      maxScore: matched.thang_diem || 100,
      isOfficial2026: query.year === 2026,
      isReference2026For2027: is2027,
      notes: is2027
        ? 'Dữ liệu tuyển sinh chính thức năm 2027 chưa được công bố. Kết quả sử dụng điểm chuẩn tham chiếu năm 2026.'
        : undefined,
    };
  }

  return {
    year: query.year,
    majorCode: query.majorCode,
    majorName: '',
    programType: query.programType,
    admissionForm: query.admissionForm,
    combination: query.combination,
    cutoffScore: null,
    maxScore: 100,
    isOfficial2026: query.year === 2026,
    isReference2026For2027: is2027,
    notes: 'Không tìm thấy dữ liệu tuyển sinh phù hợp với lựa chọn hiện tại.',
  };
}

export const lookupCutoffScore = getReferenceCutoff;

/**
 * BƯỚC 3 — TÍNH KHOẢNG CÁCH ĐIỂM
 * D = S - C
 * Trong đó:
 * - S = điểm xét tuyển dự kiến
 * - C = điểm chuẩn tham chiếu
 * - D = khoảng cách giữa điểm dự kiến và điểm chuẩn
 * Diễn giải:
 * - D > 0: điểm dự kiến cao hơn điểm chuẩn
 * - D = 0: điểm dự kiến bằng điểm chuẩn
 * - D < 0: điểm dự kiến thấp hơn điểm chuẩn
 * Lưu ý: Không gọi D là xác suất.
 */
export function calculateScoreGap(
  admissionScore: number | null | undefined,
  cutoffScore: number | null | undefined
): number | null {
  if (
    admissionScore === null ||
    admissionScore === undefined ||
    isNaN(admissionScore) ||
    !isFinite(admissionScore) ||
    cutoffScore === null ||
    cutoffScore === undefined ||
    isNaN(cutoffScore) ||
    !isFinite(cutoffScore)
  ) {
    return null;
  }
  return Number((admissionScore - cutoffScore).toFixed(2));
}

/**
 * BƯỚC 4 — CHUYỂN KHOẢNG CÁCH ĐIỂM THÀNH GIÁ TRỊ XÁC SUẤT
 * Sử dụng hàm logistic:
 * P = 1 / (1 + e^(-kD))
 * Trong đó:
 * - P là giá trị xác suất biểu diễn dưới dạng 0–1
 * - D là khoảng cách điểm (score gap)
 * - k là hệ số điều chỉnh độ dốc của hàm logistic (lấy từ PROBABILITY_CONFIG.K)
 * Sau đó chuyển sang phần trăm:
 * Probability = P × 100
 * 
 * Lưu ý:
 * - 100% khách quan, tất định, KHÔNG dùng Math.random(), KHÔNG hardcode kết quả ảo.
 * - Công thức này là hàm logistic dùng để chuyển khoảng cách điểm thành giá trị 0–1,
 *   không phải mô hình Machine Learning được huấn luyện từ dữ liệu cá nhân.
 * - Kết quả đảm bảo nằm trong khoảng [0, 100], làm tròn 2 chữ số thập phân (XX.XX).
 */
export function calculateProbability(scoreGap: number | null): number | null {
  if (scoreGap === null || isNaN(scoreGap) || !isFinite(scoreGap)) {
    return null;
  }
  const D = scoreGap;
  const k = PROBABILITY_CONFIG.K;
  const exponent = -k * D;
  const p = 1 / (1 + Math.exp(exponent));
  const probPercent = p * 100;
  // Giới hạn an toàn [0, 100] và làm tròn 2 chữ số thập phân
  const clamped = Math.min(100, Math.max(0, probPercent));
  return Number(clamped.toFixed(2));
}

export const calculateAdmissionProbability = calculateProbability;

export interface ProbabilityClassification {
  level: AssessmentLevel;
  levelLabel: string;
  levelColor: string;
  badgeClass: string;
  commentary: string;
}

/**
 * BƯỚC 5 — PHÂN LOẠI KẾT QUẢ THEO NGƯỠNG
 * Sử dụng các ngưỡng tập trung trong PROBABILITY_THRESHOLDS:
 * - Probability >= 85% → An toàn (SAFE)
 * - Probability >= 65% và < 85% → Khá an toàn (FAIRLY_SAFE)
 * - Probability >= 40% và < 65% → Cân nhắc (CONSIDER)
 * - Probability < 40% → Rủi ro (LOW)
 * - null → Chưa đủ dữ liệu đối chiếu (INSUFFICIENT_DATA)
 */
export function classifyProbability(probabilityPercent: number | null): ProbabilityClassification {
  if (probabilityPercent === null || isNaN(probabilityPercent) || !isFinite(probabilityPercent)) {
    return {
      level: 'INSUFFICIENT_DATA',
      levelLabel: 'Chưa đủ dữ liệu đối chiếu',
      levelColor: 'text-slate-700 bg-slate-100 border-slate-300',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
      commentary: 'Không tìm thấy dữ liệu tuyển sinh phù hợp với lựa chọn hiện tại.',
    };
  }

  const probStr = probabilityPercent.toFixed(2);

  if (probabilityPercent >= PROBABILITY_THRESHOLDS.SAFE) {
    return {
      level: 'HIGH',
      levelLabel: 'An toàn',
      levelColor: 'text-emerald-800 bg-emerald-50 border-emerald-300',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      commentary: `Xác suất tham khảo khoảng ${probStr}% (vùng An toàn). Điểm xét tuyển của bạn cao hơn điểm chuẩn tham chiếu, tạo ưu thế cạnh tranh lớn trong dữ liệu lịch sử.`,
    };
  } else if (probabilityPercent >= PROBABILITY_THRESHOLDS.FAIRLY_SAFE) {
    return {
      level: 'FAIRLY_SAFE',
      levelLabel: 'Cân nhắc',
      levelColor: 'text-teal-800 bg-teal-50 border-teal-300',
      badgeClass: 'bg-teal-50 text-teal-800 border-teal-300',
      commentary: `Xác suất tham khảo khoảng ${probStr}% (vùng Cân nhắc). Điểm xét tuyển của bạn cao hơn điểm chuẩn tham chiếu nhưng vẫn cần xem xét biến động tuyển sinh.`,
    };
  } else if (probabilityPercent >= PROBABILITY_THRESHOLDS.CONSIDER) {
    return {
      level: 'CONSIDER',
      levelLabel: 'Rủi ro',
      levelColor: 'text-amber-800 bg-amber-50 border-amber-300',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-300',
      commentary: `Xác suất tham khảo khoảng ${probStr}% (vùng Rủi ro). Điểm xét tuyển của bạn chỉ tiệm cận hoặc thấp hơn điểm chuẩn tham chiếu.`,
    };
  } else {
    return {
      level: 'LOW',
      levelLabel: 'Rủi ro',
      levelColor: 'text-rose-800 bg-rose-50 border-rose-300',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
      commentary: `Xác suất tham khảo khoảng ${probStr}% (vùng Rủi ro). Điểm xét tuyển của bạn hiện thấp hơn điểm chuẩn tham chiếu; đây không phải kết quả trúng tuyển chính thức.`,
    };
  }
}

/**
 * Đánh giá khả năng tham khảo theo khoảng cách điểm.
 * Phần trăm là quy đổi logistic từ điểm chênh lệch, không phải mô hình ML cấp cá nhân.
 */
export function evaluateAdmissionLikelihood(
  scoreGap: number | null,
  reference: ReferenceCutoff | null
): PredictionOutcome {
  if (scoreGap === null || !reference || reference.cutoffScore === null) {
    return {
      type: 'assessment',
      probability: null,
      level: 'INSUFFICIENT_DATA',
      levelLabel: 'Chưa đủ dữ liệu đối chiếu',
      levelColor: 'text-slate-700 bg-slate-100 border-slate-300',
      commentary: 'Không tìm thấy dữ liệu tuyển sinh phù hợp với lựa chọn hiện tại.',
      isModelAvailable: false,
    };
  }

  const probability = calculateProbability(scoreGap);
  const classification = classifyProbability(probability);

  return {
    type: 'model_probability',
    probability,
    level: classification.level,
    levelLabel: classification.levelLabel,
    levelColor: classification.badgeClass,
    commentary: classification.commentary,
    isModelAvailable: false,
  };
}

/**
 * Thực thi dự báo trúng tuyển hoàn chỉnh theo đúng quy trình chuẩn:
 * BƯỚC 1: calculateAdmissionScore() -> S (điểm xét tuyển dự kiến)
 * BƯỚC 2: getReferenceCutoff() -> C (điểm chuẩn tham chiếu từ Firestore)
 * BƯỚC 3: calculateScoreGap() -> D = S - C (khoảng cách điểm)
 * BƯỚC 4: calculateProbability() -> P = 1 / (1 + e^(-kD)), Probability = P * 100
 * BƯỚC 5: classifyProbability() -> Phân loại theo ngưỡng SAFE(85), FAIRLY_SAFE(65), CONSIDER(40)
 */
export function runAdmissionForecast(
  inputs: UserScoreInputs,
  scoreRecords: Array<{
    nam: number;
    ma_nganh: string;
    ten_nganh?: string;
    he_dao_tao: string;
    doi_tuong?: string;
    ma_pt?: string;
    to_hop: string;
    diem_chuan: number;
    thang_diem: number;
    notes?: string;
  }>
): ForecastResult {
  // BƯỚC 1 — TÍNH ĐIỂM XÉT TUYỂN DỰ KIẾN (S)
  const calcResult = calculateAdmissionScore(inputs);

  if (!calcResult.calculation) {
    return {
      status: 'MISSING_INPUT',
      statusMessage: `Vui lòng nhập đầy đủ các thông tin bắt buộc: ${calcResult.missingFields.join(', ')}.`,
      input: {
        year: inputs.year,
        majorCode: inputs.majorCode,
        majorName: inputs.majorName,
        programType: inputs.programType,
        admissionForm: inputs.admissionForm,
        combination: inputs.combination,
        priorityArea: inputs.priorityArea,
        priorityObject: inputs.priorityObject,
      },
      calculation: null,
      reference: null,
      scoreGap: null,
      prediction: null,
    };
  }

  const S = calcResult.calculation.finalAdmissionScore;

  // BƯỚC 2 — LẤY ĐIỂM CHUẨN THAM CHIẾU (C)
  const reference = getReferenceCutoff(scoreRecords, {
    year: inputs.year,
    majorCode: inputs.majorCode,
    programType: inputs.programType,
    admissionForm: calcResult.calculation.admissionForm,
    combination: inputs.combination,
  });

  const C = reference.cutoffScore;

  // BƯỚC 3 — TÍNH KHOẢNG CÁCH ĐIỂM: D = S - C
  const scoreGap = calculateScoreGap(S, C);

  // BƯỚC 4 & BƯỚC 5 — CHUYỂN KHOẢNG CÁCH ĐIỂM THÀNH XÁC SUẤT VÀ PHÂN LOẠI
  const prediction = evaluateAdmissionLikelihood(scoreGap, reference);

  const status: ForecastStatus = reference.cutoffScore === null ? 'MISSING_CUTOFF' : 'READY';

  const result: ForecastResult = {
    status,
    statusMessage: reference.cutoffScore === null ? 'Không tìm thấy dữ liệu tuyển sinh phù hợp với lựa chọn hiện tại.' : undefined,
    input: {
      year: inputs.year,
      majorCode: inputs.majorCode,
      majorName: inputs.majorName,
      programType: inputs.programType,
      admissionForm: inputs.admissionForm,
      combination: inputs.combination,
      priorityArea: inputs.priorityArea,
      priorityObject: inputs.priorityObject,
    },
    calculation: calcResult.calculation,
    reference,
    scoreGap,
    prediction,
  };

  // Log debug trong môi trường development
  if ((import.meta as any).env?.DEV) {
    console.log('[AdmissionForecast] Pipeline execution:', {
      S,
      C,
      D: scoreGap,
      probability: prediction?.probability,
      level: prediction?.levelLabel,
    });
  }

  return result;
}
