import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };
import { runAdmissionForecast } from '../src/lib/admissionForecast';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

async function testFullFlow() {
  const coll = collection(db, 'admission_scores');
  const snap = await getDocs(query(coll, where('nam', '==', 2026)));
  const records: any[] = [];
  snap.forEach(d => {
    const data = d.data();
    records.push({
      nam: Number(data.nam),
      ma_nganh: String(data.ma_nganh || ''),
      ten_nganh: String(data.ten_nganh || ''),
      he_dao_tao: String(data.he_dao_tao || 'Chuẩn'),
      doi_tuong: data.doi_tuong != null ? String(data.doi_tuong) : undefined,
      ma_pt: String(data.ma_pt || ''),
      to_hop: String(data.to_hop || ''),
      diem_chuan: Number(data.diem_chuan) || 0,
      thang_diem: Number(data.thang_diem) || 100,
    });
  });

  console.log(`Loaded ${records.length} records for 2026 from Firestore.`);

  // TH1: Báo chí, DT01, C00
  // Điểm thí sinh mẫu: THPT = 26.0 (thang 30), DGNL = 880 (thang 1200), Học bạ = 26.4 (thang 30, tức 8.8/10)
  const result1 = runAdmissionForecast(
    {
      year: 2026,
      majorCode: '7320101',
      majorName: 'Báo chí',
      programType: 'all',
      admissionForm: 'DT01',
      combination: 'C00',
      inputModeThpt: 'total',
      thptTotal: 26.5,
      inputModeHocBa: 'total',
      hbTotal: 26.4,
      dgnlScore: 880,
      achievementBonus: 0,
      priorityArea: 'KV3',
      priorityObject: 'None',
    },
    records
  );

  console.log("\n================ RESULT CASE 1 (Báo chí, DT01, C00) ================");
  console.log("Status:", result1.status);
  console.log("S (Điểm xét tuyển dự kiến):", result1.calculation?.finalAdmissionScore);
  console.log("C (Điểm chuẩn tham chiếu Card 2):", result1.reference?.cutoffScore);
  console.log("D (Khoảng cách điểm D = S - C):", result1.scoreGap);
  console.log("P (Xác suất trúng tuyển):", result1.prediction?.probability + "%");
  console.log("Phân loại (Ngưỡng):", result1.prediction?.levelLabel, result1.prediction?.level);

  // TH2: Báo chí, DT02, C00
  const result2 = runAdmissionForecast(
    {
      year: 2026,
      majorCode: '7320101',
      majorName: 'Báo chí',
      programType: 'all',
      admissionForm: 'DT02',
      combination: 'C00',
      inputModeThpt: 'total',
      thptTotal: 26.5,
      inputModeHocBa: 'total',
      hbTotal: 26.4,
      achievementBonus: 0,
      priorityArea: 'KV3',
      priorityObject: 'None',
    },
    records
  );

  console.log("\n================ RESULT CASE 2 (Báo chí, DT02, C00) ================");
  console.log("Status:", result2.status);
  console.log("S:", result2.calculation?.finalAdmissionScore);
  console.log("C:", result2.reference?.cutoffScore);
  console.log("D:", result2.scoreGap);
  console.log("P:", result2.prediction?.probability + "%");
  console.log("Phân loại:", result2.prediction?.levelLabel, result2.prediction?.level);

  // TH3: Báo chí, DT03, C00
  const result3 = runAdmissionForecast(
    {
      year: 2026,
      majorCode: '7320101',
      majorName: 'Báo chí',
      programType: 'all',
      admissionForm: 'DT03',
      combination: 'C00',
      inputModeThpt: 'total',
      inputModeHocBa: 'total',
      hbTotal: 26.4,
      dgnlScore: 880,
      achievementBonus: 0,
      priorityArea: 'KV3',
      priorityObject: 'None',
    },
    records
  );

  console.log("\n================ RESULT CASE 3 (Báo chí, DT03, C00) ================");
  console.log("Status:", result3.status);
  console.log("S:", result3.calculation?.finalAdmissionScore);
  console.log("C:", result3.reference?.cutoffScore);
  console.log("D:", result3.scoreGap);
  console.log("P:", result3.prediction?.probability + "%");
  console.log("Phân loại:", result3.prediction?.levelLabel, result3.prediction?.level);

  process.exit(0);
}

testFullFlow().catch(console.error);
