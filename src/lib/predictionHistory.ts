/**
 * Module quản lý lịch sử dự đoán trúng tuyển (Prediction History)
 * Lưu trữ bền vững tại localStorage của trình duyệt, cung cấp dữ liệu
 * cho trang Dự đoán và trang Xem phân bố điểm.
 */

export interface PredictionHistoryRecord {
  id: string;
  createdAt: number;
  formattedDate: string;
  year: number; // 2026
  majorId?: string;
  majorCode: string;
  majorName: string;
  scoreType?: 'real' | 'fake';
  admissionForm: string; // DT01, DT02, DT03
  formLabel: string;
  combination: string;
  programType: string;

  // Scores
  finalAdmissionScore: number;
  baseAdmissionScore: number;
  cutoffScore: number | null;
  scoreGap: number | null;
  probability?: number | null;
  level: 'HIGH' | 'FAIRLY_SAFE' | 'CONSIDER' | 'LOW' | 'INSUFFICIENT_DATA';
  levelLabel: string; // An toàn, Khá an toàn, Cân nhắc, Rủi ro, Chưa có dữ liệu
  levelBadge: string;
  commentary?: string;

  // Raw component values for re-populating form
  components: {
    thpt30: number | null;
    thpt100: number | null;
    hb30: number | null;
    hb100: number | null;
    dgnl1200: number | null;
    dgnl100: number | null;
    bonus: number;
    priority: number;
  };

  // Form input states
  inputState?: {
    inputModeThpt?: 'subjects' | 'total';
    thptSub1?: string;
    thptSub2?: string;
    thptSub3?: string;
    thptTotalInput?: string;
    inputModeHocBa?: 'subjects' | 'total';
    hbSub1?: string;
    hbSub2?: string;
    hbSub3?: string;
    hbTotalInput?: string;
    dgnlInput?: string;
    achievementBonusInput?: string;
    priorityArea?: string;
    priorityObject?: string;
  };
}

const STORAGE_KEY = 'ussh_prediction_history_2026';
const LATEST_KEY = 'ussh_latest_prediction_id';

function normalizeHistoryValue(value: unknown): string {
  return value === undefined || value === null ? '' : String(value);
}

function getPredictionProfileKey(record: Omit<PredictionHistoryRecord, 'id' | 'createdAt' | 'formattedDate'>): string {
  const input = record.inputState || {};
  return JSON.stringify([
    record.year,
    record.majorId,
    record.majorCode,
    record.admissionForm,
    record.combination,
    record.programType,
    record.scoreType,
    normalizeHistoryValue(input.inputModeThpt),
    normalizeHistoryValue(input.thptSub1),
    normalizeHistoryValue(input.thptSub2),
    normalizeHistoryValue(input.thptSub3),
    normalizeHistoryValue(input.thptTotalInput),
    normalizeHistoryValue(input.inputModeHocBa),
    normalizeHistoryValue(input.hbSub1),
    normalizeHistoryValue(input.hbSub2),
    normalizeHistoryValue(input.hbSub3),
    normalizeHistoryValue(input.hbTotalInput),
    normalizeHistoryValue(input.dgnlInput),
    normalizeHistoryValue(input.achievementBonusInput),
    normalizeHistoryValue(input.priorityArea),
    normalizeHistoryValue(input.priorityObject),
  ]);
}

function removeDuplicateHistoryRecords(records: PredictionHistoryRecord[]): PredictionHistoryRecord[] {
  const seen = new Set<string>();
  return records.filter((record) => {
    const key = getPredictionProfileKey(record);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getPredictionHistory(): PredictionHistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? removeDuplicateHistoryRecords(parsed) : [];
  } catch (err) {
    console.error('Error reading prediction history:', err);
    return [];
  }
}

export function savePredictionRecord(record: Omit<PredictionHistoryRecord, 'id' | 'createdAt' | 'formattedDate'>): PredictionHistoryRecord {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const formattedDate = `${pad(now.getHours())}:${pad(now.getMinutes())} - ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

  const randSuffix = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : `${Date.now().toString(36)}`;
  const newRecord: PredictionHistoryRecord = {
    ...record,
    id: `pred_${Date.now()}_${randSuffix}`,
    createdAt: Date.now(),
    formattedDate,
  };

  try {
    const history = getPredictionHistory();
    const duplicate = history.find((item) => getPredictionProfileKey(item) === getPredictionProfileKey(record));
    if (duplicate) {
      localStorage.setItem(LATEST_KEY, duplicate.id);
      window.dispatchEvent(new CustomEvent('ussh_prediction_updated', { detail: duplicate }));
      return duplicate;
    }

    // Prepend new record, keep up to 30 most recent
    const updated = [newRecord, ...history.filter(h => h.id !== newRecord.id)].slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    localStorage.setItem(LATEST_KEY, newRecord.id);

    // Dispatch window storage event so other components or tabs sync immediately
    window.dispatchEvent(new CustomEvent('ussh_prediction_updated', { detail: newRecord }));
  } catch (err) {
    console.error('Error saving prediction record:', err);
  }

  return newRecord;
}

export function getLatestPrediction(): PredictionHistoryRecord | null {
  const history = getPredictionHistory();
  if (history.length === 0) return null;
  const latestId = localStorage.getItem(LATEST_KEY);
  if (latestId) {
    const found = history.find(h => h.id === latestId);
    if (found) return found;
  }
  return history[0];
}

export function deletePredictionRecord(id: string): PredictionHistoryRecord[] {
  try {
    const history = getPredictionHistory();
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('ussh_prediction_updated'));
    return updated;
  } catch (err) {
    console.error('Error deleting prediction record:', err);
    return [];
  }
}

export function clearAllPredictionHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LATEST_KEY);
    window.dispatchEvent(new CustomEvent('ussh_prediction_updated'));
  } catch (err) {
    console.error('Error clearing prediction history:', err);
  }
}
