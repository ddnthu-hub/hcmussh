import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, limit } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

async function check() {
  console.log('Fetching sample documents from admission_scores...');
  const coll = collection(db, 'admission_scores');
  
  // 1. Fetch any 10 docs
  const snap = await getDocs(query(coll, limit(20)));
  console.log(`Total sample docs fetched: ${snap.size}`);
  snap.forEach(doc => {
    const d = doc.data();
    if (d.nam === 2026 || d.nam === '2026' || (d.ten_nganh && d.ten_nganh.includes('Báo chí')) || (d.ma_nganh && d.ma_nganh.includes('7320101'))) {
      console.log('Sample matching doc:', doc.id, JSON.stringify(d, null, 2));
    }
  });

  // 2. Fetch all docs with nam == 2026 (number)
  console.log('\n--- Query nam == 2026 (number) ---');
  const snap2026Num = await getDocs(query(coll, where('nam', '==', 2026)));
  console.log(`Docs with nam == 2026 (number): ${snap2026Num.size}`);

  // 3. Fetch all docs with nam == '2026' (string)
  console.log('\n--- Query nam == "2026" (string) ---');
  const snap2026Str = await getDocs(query(coll, where('nam', '==', '2026')));
  console.log(`Docs with nam == '2026' (string): ${snap2026Str.size}`);

  // Print all docs for Báo chí in 2026
  const all2026 = snap2026Num.size > 0 ? snap2026Num : snap2026Str;
  console.log('\n--- Checking 2026 docs for Báo chí ---');
  let baoChiFound = 0;
  all2026.forEach(doc => {
    const d = doc.data();
    const ten = (d.ten_nganh || '').toLowerCase();
    const ma = (d.ma_nganh || '').toLowerCase();
    if (ten.includes('báo chí') || ma.includes('7320101') || ten.includes('bao chi')) {
      baoChiFound++;
      console.log(`[Doc ${doc.id}]`, JSON.stringify(d, null, 2));
    }
  });
  console.log(`Total Báo chí docs in 2026: ${baoChiFound}`);

  // Also check some other 2026 docs to see their structure
  console.log('\n--- First 3 docs from 2026 ---');
  let count = 0;
  all2026.forEach(doc => {
    if (count < 3) {
      console.log(`[2026 Doc ${doc.id}]`, JSON.stringify(doc.data(), null, 2));
      count++;
    }
  });
}

check().catch(console.error);
