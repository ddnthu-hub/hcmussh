import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

export function normalizeFormCode(val: string | undefined | null): string {
  if (!val) return '';
  return val.trim().replace(/đ/gi, 'd').replace(/Đ/g, 'D').toUpperCase();
}

export function normalizeProgramType(pt: string | undefined): string {
  if (!pt) return 'Chương trình chuẩn';
  const s = pt.trim().toLowerCase();
  if (s === 'chuẩn' || s === 'chuan' || (s.includes('chuẩn') && !s.includes('quốc tế'))) {
    return 'Chương trình chuẩn';
  }
  if (
    s.includes('chuẩn quốc tế') ||
    s.includes('chất lượng cao') ||
    s.includes('clc') ||
    (s.includes('quốc tế') && !s.includes('liên kết'))
  ) {
    return 'Chương trình chuẩn quốc tế';
  }
  if (
    s.includes('liên kết') ||
    s.includes('lien ket') ||
    s.includes('2+2') ||
    s.includes('quốc tế 2+2') ||
    s.includes('đối tác')
  ) {
    return 'Chương trình liên kết với nước ngoài';
  }
  return 'Chương trình chuẩn';
}

export function matchesProgramType(recHeDaoTao: string | undefined, targetType: string | undefined): boolean {
  if (!targetType || targetType === 'all' || targetType === 'Tất cả') return true;
  return normalizeProgramType(recHeDaoTao) === normalizeProgramType(targetType);
}

function matchesAdmissionForm(
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

function queryCutoff(records: any[], q: any) {
  const targetYear = 2026;
  const recordsInYear = records.filter(r => Number(r.nam) === targetYear);

  let pool = recordsInYear;
  if (q.majorCode && q.majorCode !== 'all') {
    const cleanMajorCode = String(q.majorCode).trim();
    const exactMajor = pool.filter(r => String(r.ma_nganh).trim() === cleanMajorCode);
    if (exactMajor.length > 0) {
      pool = exactMajor;
    } else {
      const prefixMajor = pool.filter(r => String(r.ma_nganh).trim().startsWith(cleanMajorCode));
      if (prefixMajor.length > 0) {
        pool = prefixMajor;
      }
    }
  }

  if (q.admissionForm && q.admissionForm !== 'all') {
    const formMatched = pool.filter(r => matchesAdmissionForm(r, q.admissionForm));
    if (formMatched.length > 0) {
      pool = formMatched;
    }
  }

  if (q.combination && q.combination !== 'all') {
    const cleanQueryToHop = q.combination.trim().split(/[\s(]/)[0].toUpperCase();
    const toHopMatched = pool.filter(r => {
      if (!r.to_hop || r.to_hop === 'all' || r.to_hop === 'ALL') return true;
      const cleanRecToHop = String(r.to_hop).trim().split(/[\s(]/)[0].toUpperCase();
      return cleanRecToHop === cleanQueryToHop;
    });
    if (toHopMatched.length > 0) {
      pool = toHopMatched;
    }
  }

  if (pool.length > 1) {
    if (q.programType && q.programType !== 'all') {
      const hdtMatched = pool.filter(r => matchesProgramType(r.he_dao_tao, q.programType));
      if (hdtMatched.length > 0) {
        pool = hdtMatched;
      }
    }
    if (pool.length > 1) {
      const standardProgram = pool.filter(r => normalizeProgramType(r.he_dao_tao) === 'Chương trình chuẩn');
      if (standardProgram.length > 0) {
        pool = standardProgram;
      }
    }
  }

  return pool[0] || null;
}

async function run() {
  const coll = collection(db, 'admission_scores');
  const snap = await getDocs(query(coll, where('nam', '==', 2026)));
  const records: any[] = [];
  snap.forEach(d => records.push(d.data()));

  // Test 5 distinct majors
  const testMajors = ['7320101', '7220201', '7310401', '7310205', '7320104'];
  for (const m of testMajors) {
    const res = queryCutoff(records, {
      year: 2026,
      majorCode: m,
      programType: 'all',
      admissionForm: 'DT01',
      combination: 'D01',
    });
    console.log(`Major ${m} -> Cutoff:`, res ? `${res.ten_nganh} (${res.doi_tuong}, ${res.to_hop}): ${res.diem_chuan}` : 'NOT FOUND');
  }

  process.exit(0);
}

run().catch(console.error);
