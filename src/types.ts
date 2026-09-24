export type NavigationTab = 
  | 'home' 
  | 'orientation' 
  | 'scores' 
  | 'prediction' 
  | 'distribution' 
  | 'guide'
  | 'messages'
  | 'admin'
  | 'admin-scores'
  | 'admin-messages'
  | 'admin-import'
  | 'admin-members'
  | 'admin-audit-logs'
  | 'admin-settings';

export interface ScoreDistributionBucket {
  range: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
  cumulativePercentile?: number;
  benchmarkMilestone?: string;
}

export interface UserScoreSubmission {
  id: string;
  userName?: string;
  score: number;
  method: 'THPT' | 'DGNL';
  combination: string;
  targetMajor: string;
  createdAt: string;
}

export type AdmissionMethodId = 'PT1_THPT' | 'PT2_DGNL' | 'PT3_UTXT' | 'PT4_CHUNGCHI';

export interface AdmissionScoreHistory {
  year: number;
  thptScore: number;
  dgnlScore: number;
  combinations: string[];
}

export interface Major {
  id: string;
  code: string;
  name: string;
  faculty?: string;
  fieldCategory?: 'communication' | 'language' | 'social_science' | 'humanities' | 'international' | 'tourism' | string;
  fieldCategoryName?: string;
  programType?: string;
  description?: string;
  targetSkills?: string[];
  careerProspects?: string[];
  sampleEmployers?: string[];
  benchmarkHistory?: AdmissionScoreHistory[];
  defaultCombinations?: string[];
  quota2024?: number;
  quota?: number;
  tuitionEstimatedPerYear?: string;
  highlight?: boolean;
}

export interface SubjectCombination {
  code: string;
  name: string;
  subjects: string[];
}

export interface AdmissionMethodDetail {
  id: AdmissionMethodId;
  name: string;
  shortName: string;
  codeName: string;
  quotaShare: string;
  description: string;
  requirements: string[];
  timeframe: string;
  steps: string[];
  badgeColor: string;
}

export interface PredictionInput {
  method: 'THPT' | 'DGNL';
  combination: string;
  subjectScores: {
    subject1: number;
    subject2: number;
    subject3: number;
  };
  dgnlTotalScore: number;
  priorityArea: 'KV1' | 'KV2-NT' | 'KV2' | 'KV3';
  priorityObject: 'None' | 'UT1' | 'UT2';
  targetMajorId: string;
}

export interface PredictionOutcome {
  targetMajor: Major;
  totalCalculatedScore: number;
  baseScore: number;
  priorityScore: number;
  lastYearBenchmark: number;
  difference: number;
  likelihood: 'safe' | 'promising' | 'moderate' | 'challenging';
  likelihoodLabel: string;
  likelihoodColor: string;
  commentary: string;
  suggestions: Major[];
}

export type CriteriaKey = 
  | 'analysis' 
  | 'communication' 
  | 'socialHuman' 
  | 'language' 
  | 'creativity' 
  | 'organization' 
  | 'research' 
  | 'international' 
  | 'technologyData';

export type CriteriaProfile = Record<CriteriaKey, number>;

export interface OrientationOption {
  id: string;
  label: string;
  profile: CriteriaProfile;
}

export interface OrientationQuestion {
  id: number;
  text: string;
  weight: number;
  maxSelect?: number;
  hint?: string;
  options: OrientationOption[];
}

export interface MajorProfile {
  majorCode: string;
  majorName: string;
  faculty?: string;
  profile: CriteriaProfile;
  weights: CriteriaProfile;
  description?: string;
}

export interface CriterionComparison {
  criterion: CriteriaKey;
  userScore: number;
  majorScore: number;
  difference: number;
  similarity: number;
  weight: number;
  weightedContribution: number;
}

export interface MajorFitResult {
  majorCode: string;
  majorName: string;
  fitScore: number;
  rawWeightedScore: number;
  rank: number;
  criteriaBreakdown: CriterionComparison[];
  topMatchingCriteria: CriteriaKey[];
  majorData?: Major;
  admissions2026?: {
    methods: string[];
    combinations: string[];
    benchmarkSample?: number;
    maxScore?: number;
    quotaEstimated?: number;
  };
}

export interface OrientationHistoryItem {
  id: string;
  completedAt: string;
  answers: Record<number, string[]>;
  userRawProfile: CriteriaProfile;
  userProfile: CriteriaProfile;
  top3Majors: MajorFitResult[];
}

// ============================================================================
// FIRESTORE SCHEMA INTERFACES & ADMIN SYSTEM TYPES
// ============================================================================

export interface AdmissionScoreDoc {
  id: string;
  nam: number;
  ma_nganh: string;
  ten_nganh: string;
  he_dao_tao: string;
  ma_pt: string;
  doi_tuong?: string | null;
  to_hop?: string | null;
  diem_chuan: number;
  chi_tieu_du_kien?: number | null;
  thang_diem?: number;
  ghi_chu?: string | null;
  mon_chinh?: string | null;
  updatedAt?: any;
  created_at?: string;
  updated_at?: string;
}

export interface PredictionLogDoc {
  id: string;
  user_score: number;
  method: string;
  combination: string;
  target_major_code: string;
  target_major_name: string;
  confidence_level?: string;
  score_gap?: number;
  created_at: string;
}

export interface PageViewDoc {
  id: string;
  path: string;
  referrer?: string;
  timestamp: string;
}

export type AuditActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'IMPORT' | 'LOGIN' | 'ROLE_CHANGE';

export interface AuditLogDoc {
  id: string;
  admin_email: string;
  action: AuditActionType;
  collection_name: string;
  document_id: string;
  timestamp: string;
  details: string;
  status: 'SUCCESS' | 'ERROR';
}

export type AdminRole = 'superadmin' | 'admin' | 'editor';

export interface AdminMemberDoc {
  id: string;
  uid?: string;
  email: string;
  name: string;
  role: AdminRole;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  last_login?: string;
}

export interface CatalogItemDoc {
  id: string;
  catalog_type: 'majors' | 'programs' | 'combinations' | 'methods' | 'years';
  code: string;
  name: string;
  description?: string;
  order_index?: number;
  is_active: boolean;
  updated_at?: string;
}

export interface AdmissionAlphaConfigDoc {
  id: string;
  year: number;
  active_methods: string[];
  notes?: string;
  updated_at?: string;
}

export interface ModelMetricsDoc {
  id: string;
  metric_name: string;
  value: number | string;
  timestamp: string;
}

export interface ValidationIssue {
  row: number;
  field: string;
  value: any;
  reason: string;
  type: 'validation' | 'format' | 'permission';
}

export interface ImportPreviewResult {
  validRecords: Omit<AdmissionScoreDoc, 'id'>[];
  issues: ValidationIssue[];
  totalRows: number;
}
