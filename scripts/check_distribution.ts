import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

async function checkDoiTuong() {
  const coll = collection(db, 'admission_scores');
  const snap = await getDocs(query(coll, where('nam', '==', 2026)));
  
  const doiTuongCounts: Record<string, number> = {};
  const heDaoTaoCounts: Record<string, number> = {};
  const toHopSamples = new Set<string>();

  snap.forEach(d => {
    const data = d.data();
    const dt = String(data.doi_tuong);
    doiTuongCounts[dt] = (doiTuongCounts[dt] || 0) + 1;

    const hdt = String(data.he_dao_tao);
    heDaoTaoCounts[hdt] = (heDaoTaoCounts[hdt] || 0) + 1;

    if (data.to_hop) toHopSamples.add(String(data.to_hop));
  });

  console.log('2026 doi_tuong distribution:', doiTuongCounts);
  console.log('2026 he_dao_tao distribution:', heDaoTaoCounts);
  console.log('2026 to_hop samples:', Array.from(toHopSamples).slice(0, 20));
  process.exit(0);
}

checkDoiTuong().catch(console.error);
