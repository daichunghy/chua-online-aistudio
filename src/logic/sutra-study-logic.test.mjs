import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SUTRA_COLLECTION,
  SUTRA_REFLECTION_TAGS,
  createSutraStudyState,
  getSutraById,
  getSutraTotalBeats,
  resolveSutraBeatPosition,
  advanceSutraBeat,
  getFirstBeatIndexForVerse,
  gradeSutraPuzzle,
  completeSutraSession,
  getSutraMasterySummary
} from './sutra-study-logic.mjs';

test('SUTRA_COLLECTION includes 6 rich beginner-friendly sutras with valid audio and puzzles', () => {
  assert.equal(SUTRA_COLLECTION.length, 6);
  const ids = new Set();
  for (const sutra of SUTRA_COLLECTION) {
    assert.ok(sutra.id && !ids.has(sutra.id));
    ids.add(sutra.id);
    assert.ok(sutra.title.length > 5);
    assert.ok(sutra.chantAudioUrl.startsWith('/'));
    assert.ok(sutra.verses.length >= 4);
    for (const v of sutra.verses) {
      assert.ok(v.chantLine.length > 5);
      assert.ok(v.plainMeaning.length > 10);
      assert.ok(Array.isArray(v.beatUnits) && v.beatUnits.length >= 3);
    }
    assert.equal(sutra.fillBlankPuzzles.length, 3);
    for (const p of sutra.fillBlankPuzzles) {
      assert.ok(p.prompt.includes('___'));
      assert.equal(p.options.length, 3);
      assert.ok(p.correctIndex >= 0 && p.correctIndex < 3);
    }
  }
});

test('beat progression resolves verses accurately and completes round cleanly', () => {
  const sutra = getSutraById('tam_kinh_bat_nha');
  const total = getSutraTotalBeats(sutra);
  assert.ok(total >= 20);

  const startPos = resolveSutraBeatPosition(sutra, 0);
  assert.equal(startPos.verseIndex, 0);
  assert.equal(startPos.beatIndexInVerse, 0);
  assert.equal(startPos.isLastBeat, false);

  const verse2Start = getFirstBeatIndexForVerse(sutra, 2);
  const verse2Pos = resolveSutraBeatPosition(sutra, verse2Start);
  assert.equal(verse2Pos.verseIndex, 2);
  assert.equal(verse2Pos.beatIndexInVerse, 0);

  const step1 = advanceSutraBeat(sutra, 0);
  assert.equal(step1.nextBeatIndex, 1);
  assert.equal(step1.finishedRound, false);

  const stepEnd = advanceSutraBeat(sutra, total - 1);
  assert.equal(stepEnd.finishedRound, true);
  assert.equal(stepEnd.position.isLastBeat, true);
});

test('gradeSutraPuzzle gives gentle encouragement on mistakes and rewards correct answers', () => {
  const sutra = getSutraById('kinh_phap_cu');
  const puzzle0 = sutra.fillBlankPuzzles[0];
  const wrongIdx = (puzzle0.correctIndex + 1) % puzzle0.options.length;

  const wrongRes = gradeSutraPuzzle(sutra.id, 0, wrongIdx);
  assert.equal(wrongRes.correct, false);
  assert.ok(wrongRes.explanation.includes('Gợi ý'));

  const okRes = gradeSutraPuzzle(sutra.id, 0, puzzle0.correctIndex);
  assert.equal(okRes.correct, true);
  assert.equal(okRes.correctAnswer, puzzle0.options[puzzle0.correctIndex]);
});

test('createSutraStudyState & completeSutraSession preserve valid progress and award merit XP', () => {
  const empty = createSutraStudyState({
    activeSutraId: 'non_existent',
    completedSutras: ['tam_kinh_bat_nha', 'bogus'],
    totalMoBeats: -4
  });
  assert.equal(empty.activeSutraId, SUTRA_COLLECTION[0].id);
  assert.deepEqual(empty.completedSutras, ['tam_kinh_bat_nha']);
  assert.equal(empty.totalMoBeats, 0);

  const res1 = completeSutraSession(empty, 'kinh_tu_bi', {
    noteTag: SUTRA_REFLECTION_TAGS[0],
    beatsTapped: 24,
    dateLabel: '18/11/2026'
  });
  assert.equal(res1.firstTimeCompleted, true);
  assert.equal(res1.bonusMeritXp, 25);
  assert.ok(res1.state.completedSutras.includes('kinh_tu_bi'));
  assert.equal(res1.state.totalMoBeats, 24);
  assert.equal(res1.state.keepsakeNotes[0].sutraId, 'kinh_tu_bi');

  const res2 = completeSutraSession(res1.state, 'kinh_tu_bi', {
    noteTag: SUTRA_REFLECTION_TAGS[1],
    beatsTapped: 12
  });
  assert.equal(res2.firstTimeCompleted, false);
  assert.equal(res2.bonusMeritXp, 10);
  assert.equal(res2.state.totalMoBeats, 36);

  const summary = getSutraMasterySummary(res2.state);
  assert.equal(summary.completedCount, 2);
  assert.equal(summary.totalSutras, 6);
});
