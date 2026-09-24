import assert from 'node:assert/strict';
import {
  ORIENTATION_QUESTIONS,
  calculateUserProfile,
  getOrientationMajorProfiles,
  rankAllMajors,
} from '../src/data/orientationData';

assert.equal(ORIENTATION_QUESTIONS.length, 27);
assert.deepEqual(ORIENTATION_QUESTIONS.map((question) => question.id), Array.from({ length: 27 }, (_, index) => index + 1));
assert.ok(ORIENTATION_QUESTIONS.some((question) => question.options.length === 6 && question.maxSelect === 3));
assert.ok(ORIENTATION_QUESTIONS.some((question) => question.options.length === 5 && question.maxSelect === 2));
assert.ok(ORIENTATION_QUESTIONS.some((question) => question.options.length === 4 && question.maxSelect === 1));
assert.ok(ORIENTATION_QUESTIONS.every((question) => (question.maxSelect || 1) <= question.options.length));
assert.ok(ORIENTATION_QUESTIONS.every((question) => {
  const labels = question.options.map((option) => option.label.trim());
  const ids = question.options.map((option) => option.id);
  return new Set(labels).size === labels.length && new Set(ids).size === ids.length;
}));
assert.ok(ORIENTATION_QUESTIONS.every((question) => question.options.every((option) => Object.keys(option.profile).length > 0)));

const answers = Object.fromEntries(
  ORIENTATION_QUESTIONS.map((question) => [question.id, [question.options[0].id]])
);
const { userRawProfile, userProfile } = calculateUserProfile(answers);
const profiles = getOrientationMajorProfiles();
const ranked = rankAllMajors(userProfile, profiles);

assert.equal(ranked.length, profiles.length);
assert.ok(ranked.length > 0);
assert.ok(ranked.every((result) => /^\d+$/.test(result.majorCode)));
assert.ok(Object.values(userRawProfile).some((value) => value > 0));
assert.ok(new Set(ranked.map((result) => result.fitScore)).size > 1);

const questionFour = ORIENTATION_QUESTIONS.find((question) => question.id === 4)!;
const multiSelectAnswers = { ...answers, 4: questionFour.options.slice(0, 2).map((option) => option.id) };
const multiSelectProfile = calculateUserProfile(multiSelectAnswers).userRawProfile;
const singleSelectProfile = calculateUserProfile({ ...answers, 4: [questionFour.options[0].id] }).userRawProfile;
assert.ok(Math.abs(multiSelectProfile.analysis - singleSelectProfile.analysis) < 0.5);

const alternateAnswers = Object.fromEntries(
  ORIENTATION_QUESTIONS.map((question) => [question.id, [question.options[1].id]])
);
const alternateProfile = calculateUserProfile(alternateAnswers).userProfile;
const alternateRanked = rankAllMajors(alternateProfile, profiles);
assert.notEqual(ranked[0].majorCode, alternateRanked[0].majorCode);

const criteriaKeys = ['analysis', 'communication', 'socialHuman', 'language', 'creativity', 'organization', 'research', 'international', 'technologyData'];
const focusedProfile = (focus: string) => Object.fromEntries(
  criteriaKeys.map((key) => [key, key === focus ? 100 : 30])
);
const focusedTopMajors = criteriaKeys.slice(1).map((focus) => rankAllMajors(focusedProfile(focus) as any, profiles)[0].majorCode);
assert.ok(new Set(focusedTopMajors).size > 1);

const focusedSpreads = criteriaKeys.map((focus) => {
  const result = rankAllMajors(focusedProfile(focus) as any, profiles);
  return result[0].fitScore - result[result.length - 1].fitScore;
});
assert.ok(focusedSpreads.some((spread) => spread >= 10));

const firstAnswerProfile = calculateUserProfile(answers).userProfile;
const changedAnswers = { ...answers, 1: [ORIENTATION_QUESTIONS.find((question) => question.id === 1)!.options[3].id] };
const changedAnswerProfile = calculateUserProfile(changedAnswers).userProfile;
assert.ok(Math.abs(changedAnswerProfile.analysis - firstAnswerProfile.analysis) > 0 || Math.abs(changedAnswerProfile.communication - firstAnswerProfile.communication) > 0);

console.log(`orientation survey tests passed (${ORIENTATION_QUESTIONS.length} questions, ${ranked.length} majors)`);
