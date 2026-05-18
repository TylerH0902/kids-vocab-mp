const WORDS_BASE   = require('./words.js');
const WORDS_13_NEW = require('./words13.js');
const WORDS_34_EXT = require('./words34.js');
const WORDS_56_EXT = require('./words56.js');

function dedup(arr) {
  const seen = new Set();
  return arr.filter(w => seen.has(w.id) ? false : seen.add(w.id));
}

const WORDS_13 = dedup([...WORDS_BASE, ...WORDS_13_NEW]);
const WORDS_34 = dedup([...WORDS_13,   ...WORDS_34_EXT]);
const WORDS_56 = dedup([...WORDS_34,   ...WORDS_56_EXT]);

const WORD_POOL = { '1-3': WORDS_13, '3-4': WORDS_34, '5-6': WORDS_56 };

const TEST_COUNT  = { '1-3': 20, '3-4': 20, '5-6': 40 };
const SPELL_COUNT = { '1-3': 20, '3-4': 20, '5-6': 40 };

const SPELL_WORDS = {
  '1-3': WORDS_13.filter(w => w.en.length <= 4),
  '3-4': WORDS_34.filter(w => w.en.length >= 4 && w.en.length <= 6),
  '5-6': WORDS_56.filter(w => w.en.length >= 6),
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getDistractors(word, pool, n) {
  const sameCat = pool.filter(w => w.id !== word.id && w.cat === word.cat);
  const other   = pool.filter(w => w.id !== word.id && w.cat !== word.cat);
  return shuffle([...sameCat, ...other]).slice(0, n);
}

function buildTestPool(ageGroup, mode) {
  const pool  = WORD_POOL[ageGroup] || WORDS_13;
  const count = mode === 'test' ? TEST_COUNT[ageGroup] : pool.length;
  return shuffle([...pool]).slice(0, count);
}

function buildSpellPool(ageGroup) {
  const pool  = SPELL_WORDS[ageGroup] || SPELL_WORDS['1-3'];
  const count = SPELL_COUNT[ageGroup] || 20;
  return shuffle([...pool]).slice(0, count);
}

module.exports = {
  WORD_POOL,
  TEST_COUNT,
  SPELL_COUNT,
  shuffle,
  getDistractors,
  buildTestPool,
  buildSpellPool,
};
