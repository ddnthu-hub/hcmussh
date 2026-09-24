import assert from 'node:assert/strict';
import {
  clearAllPredictionHistory,
  getPredictionHistory,
  savePredictionRecord,
} from '../src/lib/predictionHistory';

const storage = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (key: string) => storage.get(key) || null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};
(globalThis as any).window = {
  dispatchEvent: () => true,
  localStorage: (globalThis as any).localStorage,
};

const baseRecord = {
  year: 2026,
  majorId: '7320101',
  majorCode: '7320101',
  majorName: 'Báo chí',
  scoreType: 'real' as const,
  admissionForm: 'DT01',
  formLabel: 'THPT',
  combination: 'D01',
  programType: 'all',
  finalAdmissionScore: 75,
  baseAdmissionScore: 75,
  cutoffScore: 70,
  scoreGap: 5,
  level: 'HIGH' as const,
  levelLabel: 'An toàn',
  levelBadge: 'badge',
  components: { thpt30: 75, thpt100: 75, hb30: null, hb100: null, dgnl1200: null, dgnl100: null, bonus: 0, priority: 0 },
  inputState: {
    inputModeThpt: 'subjects' as const,
    thptSub1: '8', thptSub2: '8', thptSub3: '8', thptTotalInput: '',
    inputModeHocBa: 'subjects' as const,
    hbSub1: '', hbSub2: '', hbSub3: '', hbTotalInput: '', dgnlInput: '',
    achievementBonusInput: '0', priorityArea: 'KV3', priorityObject: 'None',
  },
};

clearAllPredictionHistory();
savePredictionRecord(baseRecord);
savePredictionRecord({ ...baseRecord });
assert.equal(getPredictionHistory().length, 1);

savePredictionRecord({ ...baseRecord, scoreType: 'fake' });
assert.equal(getPredictionHistory().length, 2);

savePredictionRecord({ ...baseRecord, inputState: { ...baseRecord.inputState, thptSub1: '8.5' } });
assert.equal(getPredictionHistory().length, 3);

console.log('prediction history deduplication tests passed');
