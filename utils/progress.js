const auth = require('./auth');

const KEY_PREFIX   = 'progress_';
const QUEST_PREFIX = 'quest_';
const TOTAL_CHECKPOINTS = 7;

function _uid() {
  const p = auth.getUserProfile();
  return (p && p.uid) || 'guest';
}

function _load(uid) {
  try { return wx.getStorageSync(KEY_PREFIX + uid) || {}; }
  catch(e) { return {}; }
}

function _save(uid, data) {
  try { wx.setStorageSync(KEY_PREFIX + uid, data); }
  catch(e) { console.error('[progress] save failed', e); }
}

// Call after a book quiz completes
function saveResult(bookId, correct, total) {
  const uid  = _uid();
  const data = _load(uid);
  const prev = data[bookId] || {};
  const isBest = !prev.bestScore || correct > prev.bestScore;
  data[bookId] = {
    attempts:     (prev.attempts || 0) + 1,
    bestScore:    isBest ? correct : (prev.bestScore || 0),
    bestTotal:    isBest ? total   : (prev.bestTotal  || total),
    lastScore:    correct,
    lastTotal:    total,
    lastPlayedAt: Date.now(),
  };
  _save(uid, data);
  return data[bookId];
}

// Returns stored record for a book, or null if never played
function getBook(bookId) {
  return _load(_uid())[bookId] || null;
}

// Returns 0–3 stars based on best score percentage
function getStars(p) {
  if (!p || !p.bestTotal) return 0;
  const pct = (p.bestScore / p.bestTotal) * 100;
  if (pct >= 80) return 3;
  if (pct >= 60) return 2;
  if (pct >= 1)  return 1;
  return 0;
}

// Returns the full progress map for the current user
function getAll() {
  return _load(_uid());
}

// ── Quest state ───────────────────────────────────────────────────────────────

function _loadQuest(uid) {
  try {
    return wx.getStorageSync(QUEST_PREFIX + uid) ||
           { questNumber: 1, completedInQuest: [], questComplete: false };
  } catch(e) {
    return { questNumber: 1, completedInQuest: [], questComplete: false };
  }
}

function _saveQuest(uid, state) {
  try { wx.setStorageSync(QUEST_PREFIX + uid, state); } catch(e) {}
}

function getQuestState() {
  return _loadQuest(_uid());
}

// Call when a checkpoint is passed (80%+) in quest mode. Returns updated state.
function completeCheckpoint(bookId) {
  const uid   = _uid();
  const state = _loadQuest(uid);
  if (!state.completedInQuest.includes(bookId)) {
    state.completedInQuest.push(bookId);
  }
  if (state.completedInQuest.length >= TOTAL_CHECKPOINTS) {
    state.questComplete = true;
  }
  _saveQuest(uid, state);
  return state;
}

// Reset quest progress, increment quest number. Returns updated state.
function startNewQuest() {
  const uid   = _uid();
  const state = _loadQuest(uid);
  state.questNumber     += 1;
  state.completedInQuest = [];
  state.questComplete    = false;
  _saveQuest(uid, state);
  return state;
}

module.exports = { saveResult, getBook, getStars, getAll, getQuestState, completeCheckpoint, startNewQuest };
