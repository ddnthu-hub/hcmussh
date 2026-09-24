import assert from 'node:assert/strict';
import {
  calculateScoreDistribution,
  getValidDistributionUserCount,
  selectLatestRealScores,
  UserScoreRecord,
} from '../src/lib/userScoreDistribution';

const record = (deviceId: string, score: number, createdAt: string, scoreType: 'real' | 'fake' = 'real'): UserScoreRecord => ({
  deviceId,
  userAdmissionScore: score,
  year: 2026,
  scoreType,
  isReal: scoreType === 'real',
  source: 'user_prediction',
  createdAt,
});

const scores = (records: UserScoreRecord[]) => selectLatestRealScores(records).map((item) => item.userAdmissionScore).sort((a, b) => a - b);

assert.deepEqual(scores([
  record('A', 75, '2026-01-01T10:00:00Z'),
  record('A', 76, '2026-01-01T10:30:00Z'),
  record('A', 77, '2026-01-01T11:00:00Z'),
]), [77]);

assert.deepEqual(scores([
  record('A', 75, '2026-01-01T10:00:00Z', 'fake'),
  record('A', 80, '2026-01-01T11:00:00Z', 'fake'),
  record('A', 85, '2026-01-01T12:00:00Z', 'fake'),
]), []);

assert.deepEqual(scores([
  record('A', 77, '2026-01-01T10:00:00Z'),
  record('A', 90, '2026-01-01T11:00:00Z', 'fake'),
]), [77]);

assert.deepEqual(scores([
  record('A', 90, '2026-01-01T10:00:00Z', 'fake'),
  record('A', 78, '2026-01-01T11:00:00Z'),
]), [78]);

const twoDevices = [
  record('A', 77.37, '2026-01-01T11:00:00Z'),
  record('B', 82.10, '2026-01-01T11:00:00Z'),
];
assert.equal(getValidDistributionUserCount(twoDevices), 2);
assert.deepEqual(calculateScoreDistribution(scores(twoDevices)).filter((bucket) => bucket.userCount > 0).map((bucket) => bucket.range), ['75.0 – 79.9', '80.0 – 84.9']);

assert.equal(getValidDistributionUserCount([
  record('A', 77.37, '2026-01-01T11:00:00Z'),
  record('B', 82.10, '2026-01-01T11:00:00Z', 'fake'),
]), 1);

assert.deepEqual(scores([
  record('A', 70, '2026-01-01T10:00:00Z'),
  record('A', 75, '2026-01-01T11:00:00Z'),
  record('A', 80, '2026-01-01T12:00:00Z'),
  record('B', 85, '2026-01-01T12:00:00Z'),
]), [80, 85]);

console.log('user_score_distribution tests passed');
