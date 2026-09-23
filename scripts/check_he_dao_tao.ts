import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

async function check() {
  const coll = collection(db, 'admission_scores');
  const snap = await getDocs(query(coll, where('nam', '==', 2026)));
  
  const map = new Map<string, Set<string>>();
  snap.forEach(d => {
    const data = d.data();
    const code = String(data.ma_nganh);
    const hdt = String(data.he_dao_tao);
    if (!map.has(code)) map.set(code, new Set());
    map.get(code)!.add(hdt);
  });

  const multi: any[] = [];
  map.forEach((hdts, code) => {
    if (hdts.size > 1) {
      multi.push({ code, hdts: Array.from(hdts) });
    }
  });

  console.log('Majors with multiple he_dao_tao under the same ma_nganh:', multi);
  process.exit(0);
}

check().catch(console.error);
