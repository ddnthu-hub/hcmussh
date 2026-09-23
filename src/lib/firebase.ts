import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  Firestore,
  writeBatch
} from 'firebase/firestore';
import { getAuth, Auth, signInAnonymously } from 'firebase/auth';
import { 
  AdmissionScoreDoc, 
  AuditLogDoc, 
  AdminMemberDoc, 
  AdminRole,
  CatalogItemDoc,
  PredictionLogDoc,
  PageViewDoc
} from '../types';

export type { AdmissionScoreDoc };
import { DETAILED_SCORE_RECORDS } from '../data/admissionData';
import firebaseAppletConfig from '../../firebase-applet-config.json';

// Firebase configuration from firebase-applet-config.json with environment fallbacks
const metaEnv = (import.meta as any).env || {};
export const firebaseConfig = {
  apiKey: firebaseAppletConfig.apiKey || metaEnv.VITE_FIREBASE_API_KEY || '',
  authDomain: firebaseAppletConfig.authDomain || metaEnv.VITE_FIREBASE_AUTH_DOMAIN || 'usshwebsite.firebaseapp.com',
  projectId: firebaseAppletConfig.projectId || metaEnv.VITE_FIREBASE_PROJECT_ID || 'usshwebsite',
  storageBucket: firebaseAppletConfig.storageBucket || metaEnv.VITE_FIREBASE_STORAGE_BUCKET || 'usshwebsite.firebasestorage.app',
  messagingSenderId: firebaseAppletConfig.messagingSenderId || metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: firebaseAppletConfig.appId || metaEnv.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    // Connect to the Firestore database where admission_scores exists
    const databaseId = firebaseAppletConfig.firestoreDatabaseId || '(default)';
    db = getFirestore(app, databaseId);
    auth = getAuth(app);
  } catch (err) {
    console.warn('Firebase initialization notice:', err);
  }
}

export { auth };

export async function ensurePublicUser(): Promise<{ uid: string; email: string }> {
  if (!auth) throw new Error('Firebase Auth chưa được cấu hình.');

  if (!auth.currentUser) {
    try {
      await signInAnonymously(auth);
    } catch (error: any) {
      const code = error?.code || '';
      if (code === 'auth/admin-restricted-operation' || code === 'auth/operation-not-allowed') {
        throw new Error(
          'Anonymous Authentication đang bị tắt trong Firebase project usshwebsite. Vui lòng bật Authentication > Sign-in method > Anonymous trong Firebase Console để người dùng công khai có thể gửi câu hỏi.'
        );
      }
      throw error;
    }
  }

  if (!auth.currentUser) throw new Error('Không thể xác định người dùng.');
  return { uid: auth.currentUser.uid, email: auth.currentUser.email || 'Người dùng ẩn danh' };
}

export interface FirestoreStatusInfo {
  connected: boolean;
  docCount: number;
  loading: boolean;
  empty: boolean;
  error: string | null;
  errorType: 'none' | 'permission-denied' | 'network-error' | 'quota-exceeded' | 'unknown';
  projectId: string;
  databaseId: string;
  collectionName: string;
  lastFetchedAt: string | null;
}

let firestoreStatus: FirestoreStatusInfo = {
  connected: isFirebaseConfigured,
  docCount: 0,
  loading: false,
  empty: false,
  error: null,
  errorType: 'none',
  projectId: firebaseConfig.projectId,
  databaseId: '(default)',
  collectionName: 'admission_scores',
  lastFetchedAt: null,
};

const statusListeners = new Set<(status: FirestoreStatusInfo) => void>();

function updateFirestoreStatus(update: Partial<FirestoreStatusInfo>) {
  firestoreStatus = { ...firestoreStatus, ...update };
  statusListeners.forEach((fn) => {
    try {
      fn(firestoreStatus);
    } catch (e) {
      console.warn('Status listener error:', e);
    }
  });
}

export function subscribeFirestoreStatus(fn: (status: FirestoreStatusInfo) => void): () => void {
  statusListeners.add(fn);
  fn(firestoreStatus);
  return () => {
    statusListeners.delete(fn);
  };
}

export function getFirestoreConnectionInfo(): FirestoreStatusInfo {
  return firestoreStatus;
}

export function classifyFirestoreError(err: any): { type: 'permission-denied' | 'network-error' | 'quota-exceeded' | 'unknown'; message: string } {
  const code = err?.code || '';
  const msg = err?.message || String(err);
  if (code === 'permission-denied' || msg.includes('permission') || msg.includes('insufficient')) {
    return { type: 'permission-denied', message: 'Truy cập bị từ chối (permission-denied). Vui lòng kiểm tra Firestore Security Rules.' };
  }
  if (code === 'resource-exhausted' || msg.includes('quota') || msg.includes('exhausted')) {
    return { type: 'quota-exceeded', message: 'Hạn ngạch truy vấn Firestore vượt giới hạn (quota exceeded). Vui lòng thử lại sau.' };
  }
  if (code === 'unavailable' || code === 'deadline-exceeded' || msg.includes('network') || msg.includes('offline') || msg.includes('failed to get document')) {
    return { type: 'network-error', message: 'Không thể kết nối mạng tới Firestore (network error). Kiểm tra kết nối Internet.' };
  }
  return { type: 'unknown', message: msg };
}

// In-memory cache for admission scores to prevent duplicate reads and save quota
let cachedScores: AdmissionScoreDoc[] | null = null;
let cachedScoresTimestamp = 0;
const CACHE_TTL_MS = 60000; // 1 minute cache

// Safe seed conversion from DETAILED_SCORE_RECORDS for initial state if DB is completely empty or unavailable
export const INITIAL_SCORE_RECORDS: AdmissionScoreDoc[] = DETAILED_SCORE_RECORDS.map((item, idx) => ({
  id: `ussh_score_${item.year}_${item.majorCode}_${idx}`,
  nam: item.year,
  ma_nganh: item.majorCode,
  ten_nganh: item.majorName,
  he_dao_tao: item.programType,
  ma_pt: item.admissionMethod.includes('THPT') ? 'PT1_THPT' : 'PT2_DGNL',
  doi_tuong: 'Thí sinh toàn quốc',
  to_hop: item.combination,
  diem_chuan: item.score,
  chi_tieu_du_kien: 50,
  thang_diem: item.maxScore,
  ghi_chu: item.notes || '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

/**
 * Fetch all admission scores from Firestore 'admission_scores' collection
 * Handles loading, empty data, permission denied, network errors, and quota exceeded.
 */
export async function getAdmissionScores(forceRefresh = false): Promise<AdmissionScoreDoc[]> {
  const now = Date.now();
  if (!forceRefresh && cachedScores && (now - cachedScoresTimestamp < CACHE_TTL_MS)) {
    return cachedScores;
  }

  updateFirestoreStatus({ loading: true, error: null, errorType: 'none' });

  if (db && isFirebaseConfigured) {
    try {
      // Query up to 5000 records to capture all historical and 2026 documents
      const q = query(collection(db, 'admission_scores'), orderBy('nam', 'desc'), limit(5000));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        updateFirestoreStatus({
          loading: false,
          empty: true,
          docCount: 0,
          connected: true,
          error: null,
          errorType: 'none',
          lastFetchedAt: new Date().toISOString(),
        });
        cachedScores = [];
        cachedScoresTimestamp = now;
        return [];
      }

      const list: AdmissionScoreDoc[] = snap.docs.map((d) => {
        const data = d.data();
        const diemChuan = Number(data.diem_chuan) || 0;
        const nam = Number(data.nam) || 2026;
        const maPt = String(data.ma_pt || '');
        const doiTuong = data.doi_tuong != null ? String(data.doi_tuong) : null;
        
        let thangDiem = data.thang_diem;
        if (!thangDiem) {
          if (nam === 2026 || (doiTuong && doiTuong.startsWith('ĐT')) || (diemChuan > 35 && diemChuan <= 100)) {
            thangDiem = 100;
          } else if (maPt === 'DGNL' || diemChuan > 100) {
            thangDiem = 1200;
          } else {
            thangDiem = 30;
          }
        }

        return {
          id: d.id,
          nam,
          ma_nganh: String(data.ma_nganh || ''),
          ten_nganh: String(data.ten_nganh || ''),
          he_dao_tao: String(data.he_dao_tao || 'Chuẩn'),
          ma_pt: maPt,
          doi_tuong: doiTuong,
          to_hop: data.to_hop != null ? String(data.to_hop) : null,
          diem_chuan: diemChuan,
          chi_tieu_du_kien: data.chi_tieu_du_kien != null ? Number(data.chi_tieu_du_kien) : null,
          thang_diem: thangDiem,
          ghi_chu: data.ghi_chu != null ? String(data.ghi_chu) : null,
          mon_chinh: data.mon_chinh != null ? String(data.mon_chinh) : null,
          updatedAt: data.updatedAt || null,
          created_at: data.created_at || (data.updatedAt?.seconds ? new Date(data.updatedAt.seconds * 1000).toISOString() : new Date().toISOString()),
          updated_at: data.updated_at || (data.updatedAt?.seconds ? new Date(data.updatedAt.seconds * 1000).toISOString() : new Date().toISOString()),
        };
      });

      cachedScores = list;
      cachedScoresTimestamp = now;

      updateFirestoreStatus({
        loading: false,
        empty: false,
        docCount: list.length,
        connected: true,
        error: null,
        errorType: 'none',
        lastFetchedAt: new Date().toISOString(),
      });

      return list;
    } catch (err: any) {
      const errInfo = classifyFirestoreError(err);
      console.warn('Firestore read error (admission_scores):', errInfo.type, errInfo.message);

      updateFirestoreStatus({
        loading: false,
        connected: false,
        error: errInfo.message,
        errorType: errInfo.type,
      });

      if (cachedScores && cachedScores.length > 0) {
        return cachedScores;
      }

      cachedScores = INITIAL_SCORE_RECORDS;
      cachedScoresTimestamp = now;
      updateFirestoreStatus({
        loading: false,
        empty: false,
        docCount: cachedScores.length,
        connected: false,
        error: 'Firestore không truy cập được; đang sử dụng dữ liệu bản địa dự phòng để hệ thống vẫn hoạt động.',
        errorType: 'unknown',
        lastFetchedAt: new Date().toISOString(),
      });

      return cachedScores;
    }
  }

  // If not configured, update status
  updateFirestoreStatus({
    loading: false,
    connected: false,
    error: 'Firebase chưa được khởi tạo với khóa API hợp lệ.',
    errorType: 'unknown',
  });

  cachedScores = INITIAL_SCORE_RECORDS;
  cachedScoresTimestamp = now;
  return cachedScores;
}

/**
 * Query admission scores specifically for a major by ma_nganh from Firestore
 */
export async function getAdmissionScoresByMajor(ma_nganh: string): Promise<AdmissionScoreDoc[]> {
  const cleanCode = String(ma_nganh || '').trim();
  if (!cleanCode) return [];

  if (db && isFirebaseConfigured) {
    try {
      const q = query(
        collection(db, 'admission_scores'),
        where('ma_nganh', '==', cleanCode)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list: AdmissionScoreDoc[] = snap.docs.map((d) => {
          const data = d.data();
          const diemChuan = Number(data.diem_chuan) || 0;
          const nam = Number(data.nam) || 2026;
          const maPt = String(data.ma_pt || '');
          const doiTuong = data.doi_tuong != null ? String(data.doi_tuong) : null;

          let thangDiem = data.thang_diem;
          if (!thangDiem) {
            if (nam === 2026 || (doiTuong && doiTuong.startsWith('ĐT')) || (diemChuan > 35 && diemChuan <= 100)) {
              thangDiem = 100;
            } else if (maPt === 'DGNL' || diemChuan > 100) {
              thangDiem = 1200;
            } else {
              thangDiem = 30;
            }
          }

          return {
            id: d.id,
            nam,
            ma_nganh: String(data.ma_nganh || ''),
            ten_nganh: String(data.ten_nganh || ''),
            he_dao_tao: String(data.he_dao_tao || 'Chuẩn'),
            ma_pt: maPt,
            doi_tuong: doiTuong,
            to_hop: data.to_hop != null ? String(data.to_hop) : null,
            diem_chuan: diemChuan,
            chi_tieu_du_kien: data.chi_tieu_du_kien != null ? Number(data.chi_tieu_du_kien) : null,
            thang_diem: thangDiem,
            ghi_chu: data.ghi_chu != null ? String(data.ghi_chu) : null,
            mon_chinh: data.mon_chinh != null ? String(data.mon_chinh) : null,
            updatedAt: data.updatedAt || null,
            created_at: data.created_at || (data.updatedAt?.seconds ? new Date(data.updatedAt.seconds * 1000).toISOString() : new Date().toISOString()),
            updated_at: data.updated_at || (data.updatedAt?.seconds ? new Date(data.updatedAt.seconds * 1000).toISOString() : new Date().toISOString()),
          };
        });

        // Sort descending by nam, then diem_chuan
        list.sort((a, b) => b.nam - a.nam || b.diem_chuan - a.diem_chuan);
        return list;
      }
    } catch (err) {
      console.warn('getAdmissionScoresByMajor direct query error, falling back to full list filter:', err);
    }
  }

  // Fallback: filter from cached / all admission scores
  const all = await getAdmissionScores();
  const filtered = all.filter((s) => String(s.ma_nganh).trim() === cleanCode);
  filtered.sort((a, b) => b.nam - a.nam || b.diem_chuan - a.diem_chuan);
  return filtered;
}

/**
 * Add or update an admission score record
 */
export async function saveAdmissionScore(record: Partial<AdmissionScoreDoc>, adminEmail: string): Promise<string> {
  const isNew = !record.id;
  const randSuffix = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : `${Date.now().toString(36)}`;
  const docId = record.id || `score_${Date.now()}_${randSuffix}`;
  const payload: AdmissionScoreDoc = {
    id: docId,
    nam: Number(record.nam) || 2026,
    ma_nganh: String(record.ma_nganh || ''),
    ten_nganh: String(record.ten_nganh || ''),
    he_dao_tao: String(record.he_dao_tao || 'Chương trình chuẩn'),
    ma_pt: String(record.ma_pt || 'THPT'),
    doi_tuong: String(record.doi_tuong || 'Thí sinh tự do & học sinh lớp 12'),
    to_hop: String(record.to_hop || 'D01'),
    diem_chuan: Number(record.diem_chuan) || 0,
    chi_tieu_du_kien: Number(record.chi_tieu_du_kien) || 0,
    thang_diem: Number(record.thang_diem) || 30,
    ghi_chu: String(record.ghi_chu || ''),
    updated_at: new Date().toISOString(),
    created_at: record.created_at || new Date().toISOString(),
  };

  if (db && isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'admission_scores', docId), payload);
    } catch (err) {
      console.warn('Firestore save notice:', err);
    }
  }

  // Update local cache
  if (cachedScores) {
    const existingIdx = cachedScores.findIndex((s) => s.id === docId);
    if (existingIdx >= 0) {
      cachedScores[existingIdx] = payload;
    } else {
      cachedScores = [payload, ...cachedScores];
    }
  }

  // Log to audit
  await createAuditLog({
    admin_email: adminEmail,
    action: isNew ? 'CREATE' : 'UPDATE',
    collection_name: 'admission_scores',
    document_id: docId,
    details: `${isNew ? 'Thêm mới' : 'Cập nhật'} điểm chuẩn: ${payload.ten_nganh} (${payload.to_hop}) - Năm ${payload.nam}: ${payload.diem_chuan}đ`,
    status: 'SUCCESS',
  });

  return docId;
}

/**
 * Delete an admission score record
 */
export async function deleteAdmissionScore(id: string, adminEmail: string, detailsInfo?: string): Promise<boolean> {
  if (db && isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, 'admission_scores', id));
    } catch (err) {
      console.warn('Firestore delete notice:', err);
    }
  }

  if (cachedScores) {
    cachedScores = cachedScores.filter((s) => s.id !== id);
  }

  await createAuditLog({
    admin_email: adminEmail,
    action: 'DELETE',
    collection_name: 'admission_scores',
    document_id: id,
    details: `Xóa bản ghi điểm chuẩn: ${detailsInfo || id}`,
    status: 'SUCCESS',
  });

  return true;
}

/**
 * Batch import admission scores
 */
export async function batchImportAdmissionScores(
  records: Omit<AdmissionScoreDoc, 'id'>[],
  adminEmail: string
): Promise<{ successCount: number; failureCount: number }> {
  let successCount = 0;
  let failureCount = 0;

  const prepared: AdmissionScoreDoc[] = records.map((r, i) => {
    const randSuffix = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : `${Date.now().toString(36)}_${i}`;
    return {
      ...r,
      id: `import_${Date.now()}_${i}_${randSuffix}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  });

  if (db && isFirebaseConfigured) {
    try {
      // Chunk into batches of 450 (Firestore limit is 500)
      const chunkSize = 450;
      for (let i = 0; i < prepared.length; i += chunkSize) {
        const chunk = prepared.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        chunk.forEach((item) => {
          const ref = doc(db!, 'admission_scores', item.id);
          batch.set(ref, item);
        });
        await batch.commit();
        successCount += chunk.length;
      }
    } catch (err) {
      console.error('Batch import error:', err);
      failureCount = prepared.length - successCount;
    }
  } else {
    // Local memory import
    successCount = prepared.length;
  }

  if (cachedScores) {
    cachedScores = [...prepared, ...cachedScores];
  } else {
    cachedScores = prepared;
  }
  cachedScoresTimestamp = Date.now();

  await createAuditLog({
    admin_email: adminEmail,
    action: 'IMPORT',
    collection_name: 'admission_scores',
    document_id: `batch_${Date.now()}`,
    details: `Nhập dữ liệu điểm chuẩn từ file: ${successCount} bản ghi thành công${failureCount > 0 ? `, ${failureCount} lỗi` : ''}`,
    status: failureCount === 0 ? 'SUCCESS' : 'ERROR',
  });

  return { successCount, failureCount };
}

// ============================================================================
// AUDIT LOGS MANAGEMENT
// ============================================================================

let memoryAuditLogs: AuditLogDoc[] = [
  {
    id: 'log_init_01',
    admin_email: 'vovanthu25122000@gmail.com',
    action: 'LOGIN',
    collection_name: 'admins',
    document_id: 'vovanthu25122000@gmail.com',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    details: 'Đăng nhập hệ thống quản trị USSH thành công',
    status: 'SUCCESS',
  },
  {
    id: 'log_init_02',
    admin_email: 'vovanthu25122000@gmail.com',
    action: 'UPDATE',
    collection_name: 'admission_scores',
    document_id: 'score_2026_init',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    details: 'Cập nhật bảng điểm chuẩn tuyển sinh chính thức năm 2026',
    status: 'SUCCESS',
  },
];

export async function getAuditLogs(): Promise<AuditLogDoc[]> {
  if (db && isFirebaseConfigured) {
    try {
      const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(100));
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => ({
          ...(d.data() as AuditLogDoc),
          id: d.id,
        }));
      }
    } catch (err) {
      console.warn('Firestore read notice (audit_logs):', err);
    }
  }
  return memoryAuditLogs;
}

export async function createAuditLog(entry: Omit<AuditLogDoc, 'id' | 'timestamp'>): Promise<void> {
  const randSuffix = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : `${Date.now().toString(36)}`;
  const docId = `audit_${Date.now()}_${randSuffix}`;
  const log: AuditLogDoc = {
    ...entry,
    id: docId,
    timestamp: new Date().toISOString(),
  };

  memoryAuditLogs = [log, ...memoryAuditLogs.slice(0, 199)];

  if (db && isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'audit_logs', docId), log);
    } catch (err) {
      console.warn('Firestore write notice (audit_logs):', err);
    }
  }
}

// ============================================================================
// ADMIN MEMBERS MANAGEMENT
// ============================================================================

let memoryMembers: AdminMemberDoc[] = [
  {
    id: 'admin_01',
    email: 'vovanthu25122000@gmail.com',
    name: 'Võ Văn Thư (Superadmin)',
    role: 'superadmin',
    status: 'active',
    created_at: '2026-01-10T08:00:00Z',
    last_login: new Date().toISOString(),
  },
  {
    id: 'admin_02',
    email: 'tuyensinh.ussh@vnuhcm.edu.vn',
    name: 'Phòng Đào tạo Tuyển sinh',
    role: 'admin',
    status: 'active',
    created_at: '2026-02-01T09:30:00Z',
    last_login: '2026-09-15T14:20:00Z',
  },
  {
    id: 'admin_03',
    email: 'truyenthong.ussh@vnuhcm.edu.vn',
    name: 'Bộ phận Truyền thông Tư vấn',
    role: 'editor',
    status: 'active',
    created_at: '2026-03-05T11:00:00Z',
    last_login: '2026-09-12T10:15:00Z',
  },
];

export async function getAdminMembers(): Promise<AdminMemberDoc[]> {
  if (db && isFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, 'admins'));
      if (!snap.empty) {
        return snap.docs.map((d) => ({
          ...(d.data() as AdminMemberDoc),
          id: d.id,
        }));
      }
    } catch (err) {
      console.warn('Firestore read notice (admins):', err);
    }
  }
  return memoryMembers;
}

export async function findAdminMemberByEmail(email: string): Promise<AdminMemberDoc | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;

  if (db && isFirebaseConfigured) {
    try {
      const q = query(collection(db, 'admins'), where('email', '==', normalizedEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return {
          ...(docSnap.data() as AdminMemberDoc),
          id: docSnap.id,
        };
      }
    } catch (err) {
      console.warn('Firestore query notice (admin by email):', err);
    }
  }

  // Fallback to local memory / predefined members
  const member = memoryMembers.find((m) => m.email.toLowerCase() === normalizedEmail);
  return member || null;
}

export async function saveAdminMember(member: Partial<AdminMemberDoc>, currentAdminEmail: string): Promise<void> {
  const isNew = !member.id;
  const docId = member.id || `admin_${Date.now()}`;
  const normalizedRole = String(member.role || 'editor').trim().toLowerCase().replace(/[-\s]+/g, '_');
  if (isNew && (normalizedRole === 'superadmin' || normalizedRole === 'super_admin')) {
    throw new Error('Không thể tạo thêm tài khoản Super Admin.');
  }
  if (!isNew && (normalizedRole === 'superadmin' || normalizedRole === 'super_admin')
      && (String(member.email || '').trim().toLowerCase() !== 'vovanthu25122000@gmail.com' || member.status !== 'active')) {
    throw new Error('Không thể thay đổi email hoặc trạng thái của Super Admin duy nhất.');
  }
  const payload: AdminMemberDoc = {
    id: docId,
    email: String(member.email || '').trim().toLowerCase(),
    name: String(member.name || 'Cán bộ quản trị'),
    role: (normalizedRole === 'super_admin' ? (member.role as AdminRole) : normalizedRole) as AdminRole,
    status: member.status || 'active',
    created_at: member.created_at || new Date().toISOString(),
    last_login: member.last_login || new Date().toISOString(),
  };

  memoryMembers = isNew 
    ? [payload, ...memoryMembers]
    : memoryMembers.map((m) => m.id === docId ? payload : m);

  if (db && isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'admins', docId), payload);
    } catch (err) {
      console.warn('Firestore write notice (admins):', err);
    }
  }

  await createAuditLog({
    admin_email: currentAdminEmail,
    action: isNew ? 'CREATE' : 'ROLE_CHANGE',
    collection_name: 'admins',
    document_id: docId,
    details: `${isNew ? 'Thêm mới' : 'Cập nhật'} thành viên quản trị: ${payload.name} (${payload.email}) - Vai trò: ${payload.role}`,
    status: 'SUCCESS',
  });
}

export async function deleteAdminMember(id: string, currentAdminEmail: string): Promise<void> {
  const target = memoryMembers.find((m) => m.id === id);
  memoryMembers = memoryMembers.filter((m) => m.id !== id);

  if (db && isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, 'admins', id));
    } catch (err) {
      console.warn('Firestore delete notice (admins):', err);
    }
  }

  await createAuditLog({
    admin_email: currentAdminEmail,
    action: 'DELETE',
    collection_name: 'admins',
    document_id: id,
    details: `Xóa thành viên quản trị: ${target ? target.email : id}`,
    status: 'SUCCESS',
  });
}

// ============================================================================
// CATALOGS MANAGEMENT
// ============================================================================

let memoryCatalogs: CatalogItemDoc[] = [
  { id: 'cat_prog_01', catalog_type: 'programs', code: 'CHƯƠNG TRÌNH CHUẨN', name: 'Chương trình Chuẩn', is_active: true },
  { id: 'cat_prog_02', catalog_type: 'programs', code: 'CHẤT LƯỢNG CAO', name: 'Chương trình Chất lượng cao', is_active: true },
  { id: 'cat_prog_03', catalog_type: 'programs', code: 'CỬ NHÂN QUỐC TẾ', name: 'Chương trình Cử nhân Quốc tế', is_active: true },
  { id: 'cat_comb_01', catalog_type: 'combinations', code: 'C00', name: 'Ngữ văn, Lịch sử, Địa lí', is_active: true },
  { id: 'cat_comb_02', catalog_type: 'combinations', code: 'D01', name: 'Toán, Ngữ văn, Tiếng Anh', is_active: true },
  { id: 'cat_comb_03', catalog_type: 'combinations', code: 'D14', name: 'Ngữ văn, Lịch sử, Tiếng Anh', is_active: true },
  { id: 'cat_comb_04', catalog_type: 'combinations', code: 'D15', name: 'Ngữ văn, Địa lí, Tiếng Anh', is_active: true },
  { id: 'cat_comb_05', catalog_type: 'combinations', code: 'A01', name: 'Toán, Vật lí, Tiếng Anh', is_active: true },
  { id: 'cat_meth_01', catalog_type: 'methods', code: 'PT1_THPT', name: 'Xét tuyển dựa trên kết quả thi tốt nghiệp THPT', is_active: true },
  { id: 'cat_meth_02', catalog_type: 'methods', code: 'PT2_DGNL', name: 'Xét tuyển dựa trên kết quả ĐGNL ĐHQG-HCM', is_active: true },
  { id: 'cat_meth_03', catalog_type: 'methods', code: 'PT3_UTXT', name: 'Ưu tiên xét tuyển theo quy định ĐHQG-HCM', is_active: true },
];

export async function getCatalogItems(): Promise<CatalogItemDoc[]> {
  if (db && isFirebaseConfigured) {
    try {
      const snap = await getDocs(collection(db, 'catalogs'));
      if (!snap.empty) {
        return snap.docs.map((d) => ({
          ...(d.data() as CatalogItemDoc),
          id: d.id,
        }));
      }
    } catch (err) {
      console.warn('Firestore read notice (catalogs):', err);
    }
  }
  return memoryCatalogs;
}

export async function saveCatalogItem(item: Partial<CatalogItemDoc>, adminEmail: string): Promise<void> {
  const isNew = !item.id;
  const docId = item.id || `cat_${Date.now()}`;
  const payload: CatalogItemDoc = {
    id: docId,
    catalog_type: item.catalog_type || 'programs',
    code: String(item.code || '').trim(),
    name: String(item.name || '').trim(),
    description: item.description || '',
    is_active: item.is_active !== false,
    updated_at: new Date().toISOString(),
  };

  memoryCatalogs = isNew
    ? [payload, ...memoryCatalogs]
    : memoryCatalogs.map((c) => c.id === docId ? payload : c);

  if (db && isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'catalogs', docId), payload);
    } catch (err) {
      console.warn('Firestore write notice (catalogs):', err);
    }
  }

  await createAuditLog({
    admin_email: adminEmail,
    action: isNew ? 'CREATE' : 'UPDATE',
    collection_name: 'catalogs',
    document_id: docId,
    details: `${isNew ? 'Thêm mới' : 'Cập nhật'} danh mục [${payload.catalog_type}]: ${payload.code} - ${payload.name}`,
    status: 'SUCCESS',
  });
}

// ============================================================================
// DASHBOARD STATS HELPER
// ============================================================================

export interface DashboardStats {
  totalScores: number;
  totalMajors: number;
  totalYears: number;
  yearsList: number[];
  totalPredictions: number;
  totalPageViews: number;
  totalAdmins: number;
  lastUpdatedText: string;
  predictionsError: string | null;
  pageViewsError: string | null;
  pageViewsTracked: boolean;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const scores = await getAdmissionScores();
  const members = await getAdminMembers();

  const uniqueMajors = new Set(scores.map((s) => s.ma_nganh));
  const uniqueYears = Array.from(new Set(scores.map((s) => s.nam))).sort((a, b) => b - a);

  let totalPredictions = 0;
  let totalPageViews = 0;
  let predictionsError: string | null = null;
  let pageViewsError: string | null = null;
  const pageViewsTracked = false;

  if (db && isFirebaseConfigured) {
    try {
      const predSnap = await getDocs(collection(db, 'user_score_distribution'));
      totalPredictions = predSnap.docs.filter((prediction) => {
        const data = prediction.data();
        return String(data.scoreType || '').toLowerCase() === 'real'
          && data.isReal === true
          && typeof data.userId === 'string'
          && data.userId.trim().length > 0;
      }).length;
    } catch (err) {
      predictionsError = err instanceof Error ? err.message : String(err);
      console.error('Error loading prediction statistics:', err);
    }
  }

  const latestUpdatedAt = scores
    .map((score) => score.updated_at)
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

  return {
    totalScores: scores.length,
    totalMajors: uniqueMajors.size,
    totalYears: uniqueYears.length,
    yearsList: uniqueYears,
    totalPredictions,
    totalPageViews,
    totalAdmins: members.length,
    lastUpdatedText: latestUpdatedAt ? new Date(latestUpdatedAt).toLocaleDateString('vi-VN') : 'Chưa có thông tin đồng bộ',
    predictionsError,
    pageViewsError,
    pageViewsTracked,
  };
}

export const getFirestoreDb = () => db;
