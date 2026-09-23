/**
 * Module quản lý và tổng hợp dữ liệu "Phân bố điểm xét tuyển dự kiến của người dùng"
 * 
 * QUY TRÌNH DỮ LIỆU:
 * Người dùng nhập điểm -> Tính điểm xét tuyển dự kiến (S) -> Dự báo thành công
 * -> Lưu điểm vào collection `user_score_distribution` (Firestore)
 * -> Tổng hợp dữ liệu nhiều người dùng -> Tạo phân bố điểm & hiển thị biểu đồ
 */

import { 
  collection,
  doc,
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { ensurePublicUser, getFirestoreDb, isFirebaseConfigured } from './firebase';
import { getPredictionHistory } from './predictionHistory';

export const USER_DISTRIBUTION_COLLECTION = 'user_score_distribution';
const PREDICTION_COMPLETED_KEY = 'ussh_has_completed_prediction';

export interface UserScoreRecord {
  id?: string;
  userAdmissionScore: number;
  year: number;
  userId?: string;
  scoreType?: 'real' | 'fake';
  isReal?: boolean;
  createdAt?: any;
  majorCode?: string;
  majorName?: string;
  admissionForm?: string;
  programType?: string;
  combination?: string;
  approved?: boolean;
  approvedAt?: any;
  approvedBy?: string;
}

export interface DistributionBucket {
  range: string;
  min: number;
  max: number;
  isClosedRight: boolean;
  userCount: number;
  percentage: number;
}

export interface UserScoreStatistics {
  totalCount: number;
  averageScore: number;
  minScore: number;
  maxScore: number;
  mostCommonRange: string;
}

/**
 * 8 khoảng điểm chuẩn thang 100 theo đúng yêu cầu:
 * < 65
 * 65.0 – 69.9
 * 70.0 – 74.9
 * 75.0 – 79.9
 * 80.0 – 84.9
 * 85.0 – 89.9
 * 90.0 – 94.9
 * 95.0 – 100
 */
export const SCORE_DISTRIBUTION_INTERVALS = [
  { range: '< 65', min: 0, max: 65, isClosedRight: false },
  { range: '65.0 – 69.9', min: 65, max: 70, isClosedRight: false },
  { range: '70.0 – 74.9', min: 70, max: 75, isClosedRight: false },
  { range: '75.0 – 79.9', min: 75, max: 80, isClosedRight: false },
  { range: '80.0 – 84.9', min: 80, max: 85, isClosedRight: false },
  { range: '85.0 – 89.9', min: 85, max: 90, isClosedRight: false },
  { range: '90.0 – 94.9', min: 90, max: 95, isClosedRight: false },
  { range: '95.0 – 100', min: 95, max: 100, isClosedRight: true },
];

// In-memory cache để giảm số lượng Firestore reads và tiết kiệm quota
let cachedUserScores: UserScoreRecord[] | null = null;
let cachedTimestamp = 0;
const CACHE_TTL_MS = 60000; // 60 giây

// Chống ghi trùng: Lưu vết mã nhận diện lần lưu gần nhất trong phiên
let lastSavedSignature: string | null = null;
let isSavingInProgress = false;

/**
 * Kiểm tra người dùng đã hoàn thành dự báo trúng tuyển hay chưa
 * Hỗ trợ lưu bền vững qua localStorage & kiểm tra lịch sử dự báo để không chặn khi F5
 */
export function hasCompletedPrediction(): boolean {
  try {
    const flag = localStorage.getItem(PREDICTION_COMPLETED_KEY);
    if (flag === 'true') return true;

    // Kiểm tra lịch sử dự đoán hiện có
    const history = getPredictionHistory();
    if (history && history.length > 0) {
      localStorage.setItem(PREDICTION_COMPLETED_KEY, 'true');
      return true;
    }
  } catch (e) {
    console.warn('Lỗi đọc trạng thái dự đoán:', e);
  }
  return false;
}

/**
 * Đặt cờ đánh dấu đã hoàn thành dự báo trúng tuyển
 */
export function setHasCompletedPrediction(value: boolean): void {
  try {
    if (value) {
      localStorage.setItem(PREDICTION_COMPLETED_KEY, 'true');
    } else {
      localStorage.removeItem(PREDICTION_COMPLETED_KEY);
    }
  } catch (e) {
    console.warn('Lỗi ghi trạng thái dự đoán:', e);
  }
}

/**
 * Lưu điểm xét tuyển dự kiến của người dùng vào collection `user_score_distribution`.
 * CHỈ LƯU SAU KHI DỰ BÁO THÀNH CÔNG.
 * Tích hợp cơ chế chống ghi trùng dữ liệu khi người dùng bấm "Phân tích" nhiều lần.
 */
export async function saveUserScoreDistribution(params: {
  userAdmissionScore: number;
  year?: number;
  uniqueKey?: string;
  majorCode?: string;
  majorName?: string;
  admissionForm?: string;
  programType?: string;
  combination?: string;
}): Promise<boolean> {
  const { userAdmissionScore, year = 2026, uniqueKey, majorCode, majorName, admissionForm, programType, combination } = params;

  // 1. Kiểm tra tính hợp lệ của điểm: Thang điểm 0 - 100
  if (
    typeof userAdmissionScore !== 'number' || 
    isNaN(userAdmissionScore) || 
    userAdmissionScore < 0 || 
    userAdmissionScore > 100
  ) {
    console.warn('[UserScoreDistribution] Điểm không hợp lệ, không lưu:', userAdmissionScore);
    return false;
  }

  // 2. Chống ghi trùng: Nếu cùng một chữ ký hoặc đang trong quá trình ghi thì bỏ qua
  const roundedScore = Number(userAdmissionScore.toFixed(2));
  const firebaseUser = isFirebaseConfigured ? await ensurePublicUser() : null;
  const signature = uniqueKey || `${firebaseUser?.uid || 'local'}_${year}_${roundedScore}`;

  if (lastSavedSignature === signature) {
    console.log('[UserScoreDistribution] Bỏ qua ghi trùng cho cùng một lượt phân tích:', signature);
    setHasCompletedPrediction(true);
    return true;
  }

  if (isSavingInProgress) {
    console.log('[UserScoreDistribution] Đang có tiến trình ghi Firestore, bỏ qua yêu cầu đồng thời');
    return false;
  }

  isSavingInProgress = true;

  try {
    const db = getFirestoreDb();
    if (!db || !isFirebaseConfigured) {
      console.warn('[UserScoreDistribution] Firebase chưa cấu hình, lưu cục bộ');
      lastSavedSignature = signature;
      setHasCompletedPrediction(true);
      return true;
    }

    const payload: Record<string, any> = {
      userAdmissionScore: roundedScore,
      scoreType: 'real',
      isReal: true,
      year,
      majorCode: majorCode || '',
      majorName: majorName || '',
      admissionForm: admissionForm || '',
      programType: programType || '',
      combination: combination || '',
      approved: false,
      createdAt: serverTimestamp(),
    };

    if (firebaseUser) payload.userId = firebaseUser.uid;

    const collRef = collection(db, USER_DISTRIBUTION_COLLECTION);
    await addDoc(collRef, payload);

    lastSavedSignature = signature;
    setHasCompletedPrediction(true);

    // Vô hiệu hóa cache để lần xem phân bố kế tiếp nạp dữ liệu mới
    cachedUserScores = null;

    // Phát sự kiện thông báo dữ liệu phân bố đã được cập nhật
    window.dispatchEvent(new CustomEvent('ussh_score_distribution_updated'));

    console.log('[UserScoreDistribution] Đã lưu thành công điểm người dùng vào Firestore:', roundedScore);
    return true;
  } catch (err) {
    console.error('[UserScoreDistribution] Lỗi khi lưu điểm người dùng:', err);
    return false;
  } finally {
    isSavingInProgress = false;
  }
}

/**
 * Lấy danh sách điểm số của người dùng từ collection `user_score_distribution`
 * CHỈ đọc collection này, KHÔNG đọc admission_scores.
 * Tích hợp bộ nhớ tạm (cache) để tránh vượt quota Firestore.
 */
export async function getUserScoreDistribution(
  year: number = 2026, 
  forceRefresh: boolean = false
): Promise<UserScoreRecord[]> {
  const now = Date.now();
  if (!forceRefresh && cachedUserScores && (now - cachedTimestamp < CACHE_TTL_MS)) {
    return cachedUserScores;
  }

  const db = getFirestoreDb();
  if (!db || !isFirebaseConfigured) {
    return [];
  }

  try {
    const collRef = collection(db, USER_DISTRIBUTION_COLLECTION);
    const q = query(collRef, where('year', '==', year));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      cachedUserScores = [];
      cachedTimestamp = now;
      return [];
    }

    const records: UserScoreRecord[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const score = Number(data.userAdmissionScore ?? data.score);
      const isRealScore = data.scoreType
        ? String(data.scoreType).toLowerCase() === 'real'
        : data.isReal !== false;

      if (
        typeof score === 'number' &&
        !isNaN(score) &&
        score >= 0 &&
        score <= 100 &&
        isRealScore &&
        typeof data.userId === 'string' &&
        data.userId.length > 0
      ) {
        records.push({
          id: docSnap.id,
          userAdmissionScore: score,
          year: Number(data.year) || year,
          userId: data.userId,
          scoreType: 'real',
          isReal: true,
          createdAt: data.createdAt,
          majorCode: data.majorCode,
          majorName: data.majorName,
          admissionForm: data.admissionForm,
          programType: data.programType,
          combination: data.combination,
          approved: data.approved,
          approvedAt: data.approvedAt,
          approvedBy: data.approvedBy,
        });
      }
    });

    cachedUserScores = records;
    cachedTimestamp = now;
    return records;
  } catch (err) {
    console.error('[UserScoreDistribution] Lỗi truy vấn Firestore:', err);
    return cachedUserScores || [];
  }
}

export async function getManagedUserScoreDistribution(forceRefresh = false): Promise<UserScoreRecord[]> {
  const db = getFirestoreDb();
  if (!db || !isFirebaseConfigured) return [];
  try {
    const snapshot = await getDocs(collection(db, USER_DISTRIBUTION_COLLECTION));
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        userAdmissionScore: Number(data.userAdmissionScore ?? data.score),
        year: Number(data.year),
        userId: data.userId,
        scoreType: (data.scoreType === 'fake' ? 'fake' : 'real') as 'real' | 'fake',
        isReal: data.isReal !== false,
        createdAt: data.createdAt,
        majorCode: data.majorCode,
        majorName: data.majorName,
        admissionForm: data.admissionForm,
        programType: data.programType,
        combination: data.combination,
        approved: data.approved === true,
        approvedAt: data.approvedAt,
        approvedBy: data.approvedBy,
      };
    }).filter((record) => Number.isFinite(record.userAdmissionScore) && record.userAdmissionScore >= 0 && record.userAdmissionScore <= 100);
  } catch (err) {
    console.error('[UserScoreDistribution] Lỗi tải dữ liệu quản trị:', err);
    return [];
  }
}

export async function updateManagedUserScoreDistribution(
  recordId: string,
  data: Partial<UserScoreRecord>,
  adminEmail: string,
): Promise<void> {
  const db = getFirestoreDb();
  if (!db || !isFirebaseConfigured) throw new Error('Firebase chưa được cấu hình.');
  const score = Number(data.userAdmissionScore);
  const year = Number(data.year);
  if (!Number.isFinite(score) || score < 0 || score > 100 || !Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error('Điểm hoặc năm không hợp lệ.');
  }
  await updateDoc(doc(db, USER_DISTRIBUTION_COLLECTION, recordId), {
    userAdmissionScore: Number(score.toFixed(2)),
    year,
    majorCode: String(data.majorCode || '').trim(),
    majorName: String(data.majorName || '').trim(),
    admissionForm: String(data.admissionForm || '').trim(),
    programType: String(data.programType || '').trim(),
    combination: String(data.combination || '').trim(),
    approved: data.approved === true,
    approvedBy: data.approved === true ? adminEmail : '',
    approvedAt: data.approved === true ? serverTimestamp() : null,
  });
  cachedUserScores = null;
}

export async function createManagedUserScoreDistribution(
  data: Partial<UserScoreRecord>,
): Promise<void> {
  const db = getFirestoreDb();
  if (!db || !isFirebaseConfigured) throw new Error('Firebase chưa được cấu hình.');
  const score = Number(data.userAdmissionScore);
  const year = Number(data.year);
  if (!Number.isFinite(score) || score < 0 || score > 100 || !Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error('Điểm hoặc năm không hợp lệ.');
  }
  await addDoc(collection(db, USER_DISTRIBUTION_COLLECTION), {
    userAdmissionScore: Number(score.toFixed(2)),
    year,
    majorCode: String(data.majorCode || '').trim(),
    majorName: String(data.majorName || '').trim(),
    admissionForm: String(data.admissionForm || '').trim(),
    programType: String(data.programType || '').trim(),
    combination: String(data.combination || '').trim(),
    approved: false,
    createdAt: serverTimestamp(),
  });
}

export async function deleteManagedUserScoreDistribution(recordId: string): Promise<void> {
  const db = getFirestoreDb();
  if (!db || !isFirebaseConfigured) throw new Error('Firebase chưa được cấu hình.');
  await deleteDoc(doc(db, USER_DISTRIBUTION_COLLECTION, recordId));
  cachedUserScores = null;
}

/**
 * Tính toán phân bố điểm số (Histogram) từ mảng điểm số của người dùng.
 * Phân chia chính xác theo 8 khoảng điểm:
 * < 65
 * 65.0 – 69.9
 * 70.0 – 74.9
 * 75.0 – 79.9
 * 80.0 – 84.9
 * 85.0 – 89.9
 * 90.0 – 94.9
 * 95.0 – 100
 */
export function calculateScoreDistribution(scores: number[]): DistributionBucket[] {
  const total = scores.length;

  return SCORE_DISTRIBUTION_INTERVALS.map((def) => {
    let count = 0;
    for (const s of scores) {
      if (def.isClosedRight) {
        if (s >= def.min && s <= def.max) count++;
      } else {
        if (s >= def.min && s < def.max) count++;
      }
    }

    const percentage = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;

    return {
      range: def.range,
      min: def.min,
      max: def.max,
      isClosedRight: def.isClosedRight,
      userCount: count,
      percentage,
    };
  });
}

/**
 * Tính toán các chỉ số thống kê từ danh sách điểm người dùng:
 * - Tổng số lượt dự báo
 * - Điểm trung bình
 * - Điểm thấp nhất
 * - Điểm cao nhất
 * - Khoảng điểm có nhiều người dùng nhất
 */
export function getValidDistributionUserCount(records: UserScoreRecord[]): number {
  const uniqueUserIds = new Set<string>();

  for (const record of records) {
    if (record.userId) {
      uniqueUserIds.add(record.userId);
    }
  }

  return uniqueUserIds.size;
}

export function calculateUserScoreStatistics(scores: number[]): UserScoreStatistics {
  const totalCount = scores.length;
  if (totalCount === 0) {
    return {
      totalCount: 0,
      averageScore: 0,
      minScore: 0,
      maxScore: 0,
      mostCommonRange: 'Chưa có',
    };
  }

  let sum = 0;
  let min = Infinity;
  let max = -Infinity;

  for (const s of scores) {
    sum += s;
    if (s < min) min = s;
    if (s > max) max = s;
  }

  const averageScore = Math.round((sum / totalCount) * 100) / 100;
  const minScore = min === Infinity ? 0 : Math.round(min * 100) / 100;
  const maxScore = max === -Infinity ? 0 : Math.round(max * 100) / 100;

  // Xác định khoảng điểm có nhiều người dùng nhất
  const buckets = calculateScoreDistribution(scores);
  let maxBucket = buckets[0];
  for (const b of buckets) {
    if (b.userCount > maxBucket.userCount) {
      maxBucket = b;
    }
  }

  const mostCommonRange = maxBucket && maxBucket.userCount > 0 ? maxBucket.range : 'Chưa có';

  return {
    totalCount,
    averageScore,
    minScore,
    maxScore,
    mostCommonRange,
  };
}

/**
 * Xác định khoảng điểm của một điểm số cụ thể
 */
export function findBucketForScore(score: number): string | null {
  for (const def of SCORE_DISTRIBUTION_INTERVALS) {
    if (def.isClosedRight) {
      if (score >= def.min && score <= def.max) return def.range;
    } else {
      if (score >= def.min && score < def.max) return def.range;
    }
  }
  return null;
}
