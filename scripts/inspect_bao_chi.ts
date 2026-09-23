import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

async function check() {
  const coll = collection(db, 'admission_scores');
  const snap = await getDocs(query(coll, where('nam', '==', 2026)));
  console.log(`Total 2026 docs: ${snap.size}`);

  const baoChiDocs: any[] = [];
  snap.forEach(d => {
    const data = d.data();
    if ((data.ma_nganh || '').startsWith('7320101')) {
      baoChiDocs.push({
        id: d.id,
        ma_nganh: data.ma_nganh,
        ten_nganh: data.ten_nganh,
        he_dao_tao: data.he_dao_tao,
        doi_tuong: data.doi_tuong,
        ma_pt: data.ma_pt,
        to_hop: data.to_hop,
        diem_chuan: data.diem_chuan,
        thang_diem: data.thang_diem,
        nam: data.nam,
      });
    }
  });

  console.log('--- ALL BAO CHI 2026 DOCS ---');
  console.table(baoChiDocs);
  process.exit(0);
}

check().catch(e => {
  console.error(e);
  process.exit(1);
});
