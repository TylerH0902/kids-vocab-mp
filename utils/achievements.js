const auth     = require('./auth');
const progress = require('./progress');
const BOOKS    = require('./books');

const KEY_PREFIX = 'ach_';
const SIDE_QUEST_COST = 500;

const ACHIEVEMENTS = [
  // LOGIN & STREAKS (8)
  { id:'first_login',   cat:'login',     pts:50,  daily:false, icon:'🌟', title_en:'First Steps',         title_zh:'初次探索',   desc_en:'Log in for the first time',             desc_zh:'第一次登录' },
  { id:'streak_2',      cat:'login',     pts:15,  daily:false, icon:'🔥', title_en:'Back Again',          title_zh:'再次归来',   desc_en:'2-day login streak',                    desc_zh:'连续登录2天' },
  { id:'streak_3',      cat:'login',     pts:30,  daily:false, icon:'🔥', title_en:'Habit Forming',       title_zh:'养成习惯',   desc_en:'3-day login streak',                    desc_zh:'连续登录3天' },
  { id:'streak_7',      cat:'login',     pts:75,  daily:false, icon:'🔥', title_en:'One Week Warrior',    title_zh:'一周勇士',   desc_en:'7-day login streak',                    desc_zh:'连续登录7天' },
  { id:'streak_14',     cat:'login',     pts:150, daily:false, icon:'⚡', title_en:'Fortnight Champion',  title_zh:'两周冠军',   desc_en:'14-day login streak',                   desc_zh:'连续登录14天' },
  { id:'streak_30',     cat:'login',     pts:300, daily:false, icon:'👑', title_en:'Month Master',        title_zh:'月度霸主',   desc_en:'30-day login streak',                   desc_zh:'连续登录30天' },
  { id:'daily_login',   cat:'login',     pts:10,  daily:true,  icon:'📅', title_en:'Daily Visitor',       title_zh:'每日访客',   desc_en:'Log in today',                          desc_zh:'今天登录' },
  { id:'login_10',      cat:'login',     pts:25,  daily:false, icon:'🏅', title_en:'Regular',             title_zh:'老朋友',     desc_en:'Log in on 10 different days',           desc_zh:'累计登录10天' },
  // BOOKS (8)
  { id:'first_book',    cat:'books',     pts:50,  daily:false, icon:'📖', title_en:'First Story',         title_zh:'初读故事',   desc_en:'Complete your first book',              desc_zh:'完成第一本书' },
  { id:'books_3',       cat:'books',     pts:60,  daily:false, icon:'📚', title_en:'Bookworm',            title_zh:'小书虫',     desc_en:'Complete 3 different books',            desc_zh:'完成3本不同的书' },
  { id:'books_5',       cat:'books',     pts:80,  daily:false, icon:'📚', title_en:'Avid Reader',         title_zh:'阅读达人',   desc_en:'Complete 5 different books',            desc_zh:'完成5本不同的书' },
  { id:'books_all7',    cat:'books',     pts:200, daily:false, icon:'🏆', title_en:'Story Collector',     title_zh:'故事收藏家', desc_en:'Complete all 7 main quest books',       desc_zh:'完成全部7本主线书籍' },
  { id:'play_twice',    cat:'books',     pts:20,  daily:false, icon:'🔄', title_en:'Try Again',           title_zh:'再试一次',   desc_en:'Play the same book twice',              desc_zh:'同一本书玩两次' },
  { id:'play_5times',   cat:'books',     pts:50,  daily:false, icon:'💪', title_en:'Persistent',          title_zh:'坚持不懈',   desc_en:'Play the same book 5 times',            desc_zh:'同一本书玩5次' },
  { id:'two_today',     cat:'books',     pts:40,  daily:true,  icon:'📖', title_en:'Double Feature',      title_zh:'双书挑战',   desc_en:'Complete 2 books in one day',           desc_zh:'一天内完成2本书' },
  { id:'three_today',   cat:'books',     pts:75,  daily:true,  icon:'📚', title_en:'Triple Threat',       title_zh:'三连阅读',   desc_en:'Complete 3 books in one day',           desc_zh:'一天内完成3本书' },
  // SCORES (8)
  { id:'first_80',      cat:'scores',    pts:30,  daily:false, icon:'⭐', title_en:'First Gold',          title_zh:'初获金星',   desc_en:'Score 80%+ for the first time',         desc_zh:'首次得分80%以上' },
  { id:'first_100',     cat:'scores',    pts:75,  daily:false, icon:'💯', title_en:'Perfect Score',       title_zh:'满分达人',   desc_en:'Score 100% on any book',                desc_zh:'任意一本书得满分' },
  { id:'perfect_2',     cat:'scores',    pts:100, daily:false, icon:'💯', title_en:'Flawless Twice',      title_zh:'两次完美',   desc_en:'Score 100% on 2 different books',       desc_zh:'2本不同书均得满分' },
  { id:'perfect_3',     cat:'scores',    pts:150, daily:false, icon:'🌟', title_en:'Triple Perfect',      title_zh:'三次完美',   desc_en:'Score 100% on 3 different books',       desc_zh:'3本不同书均得满分' },
  { id:'perfect_5',     cat:'scores',    pts:200, daily:false, icon:'👑', title_en:'Perfectionist',       title_zh:'完美主义者', desc_en:'Score 100% on 5 different books',       desc_zh:'5本不同书均得满分' },
  { id:'improved',      cat:'scores',    pts:25,  daily:false, icon:'📈', title_en:'Getting Better',      title_zh:'进步了',     desc_en:'Improve your score on any book',        desc_zh:'提高了任意一本书的分数' },
  { id:'three_stars',   cat:'scores',    pts:40,  daily:false, icon:'⭐', title_en:'Three Stars',         title_zh:'三星好评',   desc_en:'Earn 3 stars on any book',              desc_zh:'任意一本书获得3星' },
  { id:'three_stars_3', cat:'scores',    pts:80,  daily:false, icon:'✨', title_en:'Star Collector',      title_zh:'星星收藏家', desc_en:'Earn 3 stars on 3 different books',     desc_zh:'3本不同书各获3星' },
  // QUESTIONS (6)
  { id:'first_q',       cat:'questions', pts:5,   daily:false, icon:'❓', title_en:'First Answer',        title_zh:'初次作答',   desc_en:'Answer your first question',            desc_zh:'回答第一个问题' },
  { id:'q_100',         cat:'questions', pts:30,  daily:false, icon:'💯', title_en:'Century',             title_zh:'百题达人',   desc_en:'Answer 100 questions total',            desc_zh:'累计回答100道题' },
  { id:'q_500',         cat:'questions', pts:75,  daily:false, icon:'🔢', title_en:'Five Hundred',        title_zh:'五百题达人', desc_en:'Answer 500 questions total',            desc_zh:'累计回答500道题' },
  { id:'q_1000',        cat:'questions', pts:150, daily:false, icon:'🏆', title_en:'One Thousand',        title_zh:'千题大师',   desc_en:'Answer 1000 questions total',           desc_zh:'累计回答1000道题' },
  { id:'daily_20q',     cat:'questions', pts:10,  daily:true,  icon:'📝', title_en:'Daily Quiz',          title_zh:'每日问答',   desc_en:'Answer 20 questions today',             desc_zh:'今日回答20道题' },
  { id:'daily_40q',     cat:'questions', pts:20,  daily:true,  icon:'📝', title_en:'Quiz Fanatic',        title_zh:'问答狂热者', desc_en:'Answer 40 questions today',             desc_zh:'今日回答40道题' },
  // QUEST (6)
  { id:'cp_2',          cat:'quest',     pts:25,  daily:false, icon:'🗺️', title_en:'Road Begins',         title_zh:'旅途开始',   desc_en:'Unlock the 2nd checkpoint',             desc_zh:'解锁第2个关卡' },
  { id:'cp_4',          cat:'quest',     pts:60,  daily:false, icon:'🗺️', title_en:'Halfway There',       title_zh:'完成一半',   desc_en:'Unlock the 4th checkpoint',             desc_zh:'解锁第4个关卡' },
  { id:'cp_7_done',     cat:'quest',     pts:200, daily:false, icon:'🏆', title_en:'Quest Master',        title_zh:'任务大师',   desc_en:'Complete all 7 checkpoints',            desc_zh:'完成全部7个关卡' },
  { id:'new_quest',     cat:'quest',     pts:50,  daily:false, icon:'🔄', title_en:'New Beginning',       title_zh:'新的开始',   desc_en:'Start a new quest',                     desc_zh:'开始新旅程' },
  { id:'quest_2_done',  cat:'quest',     pts:250, daily:false, icon:'⭐', title_en:'Seasoned Adventurer', title_zh:'资深探险家', desc_en:'Complete all checkpoints in Quest 2',  desc_zh:'完成第2轮旅程全部关卡' },
  { id:'portal_found',  cat:'quest',     pts:40,  daily:false, icon:'🔮', title_en:'Secret Discovered',   title_zh:'发现秘密',   desc_en:'Unlock your first side quest portal',   desc_zh:'解锁第一个支线传送门' },
  // SIDE QUESTS (5)
  { id:'first_sq',      cat:'side',      pts:60,  daily:false, icon:'🔮', title_en:'Side Adventurer',     title_zh:'支线冒险者', desc_en:'Complete your first side quest book',   desc_zh:'完成第一本支线任务书籍' },
  { id:'sq_2',          cat:'side',      pts:100, daily:false, icon:'🔮', title_en:'Bonus Hunter',        title_zh:'奖励猎人',   desc_en:'Complete 2 side quest books',           desc_zh:'完成2本支线任务书籍' },
  { id:'sq_all',        cat:'side',      pts:200, daily:false, icon:'👑', title_en:'Side Champion',       title_zh:'支线冠军',   desc_en:'Complete all side quest books',         desc_zh:'完成全部支线任务书籍' },
  { id:'sq_100',        cat:'side',      pts:80,  daily:false, icon:'💯', title_en:'Side Perfect',        title_zh:'支线完美',   desc_en:'Score 100% on a side quest book',       desc_zh:'在支线任务中获得满分' },
  { id:'sq_main_day',   cat:'side',      pts:60,  daily:true,  icon:'⚡', title_en:'Double Agent',        title_zh:'双线作战',   desc_en:'Complete side + main book same day',    desc_zh:'同一天完成支线和主线各一本' },
  // LANGUAGE (4)
  { id:'bilingual',     cat:'lang',      pts:30,  daily:false, icon:'🌐', title_en:'Bilingual',           title_zh:'双语达人',   desc_en:'Play same book in both EN and ZH',      desc_zh:'同一本书用中英文各玩一遍' },
  { id:'zh_3',          cat:'lang',      pts:40,  daily:false, icon:'🀄', title_en:'Chinese Scholar',     title_zh:'中文学者',   desc_en:'Complete 3 books in Chinese',           desc_zh:'用中文完成3本书' },
  { id:'en_3',          cat:'lang',      pts:40,  daily:false, icon:'🔤', title_en:'English Expert',      title_zh:'英语达人',   desc_en:'Complete 3 books in English',           desc_zh:'用英文完成3本书' },
  { id:'lang_day',      cat:'lang',      pts:20,  daily:true,  icon:'🌐', title_en:'Polyglot Day',        title_zh:'双语同行',   desc_en:'Play in both languages in one day',     desc_zh:'同一天用中英文各玩' },
  // SPECIAL (5)
  { id:'early_bird',    cat:'special',   pts:20,  daily:false, icon:'🌅', title_en:'Early Bird',          title_zh:'早起鸟儿',   desc_en:'Log in before 8 am',                    desc_zh:'早上8点前登录' },
  { id:'night_owl',     cat:'special',   pts:20,  daily:false, icon:'🦉', title_en:'Night Owl',           title_zh:'夜猫子',     desc_en:'Log in after 9 pm',                     desc_zh:'晚上9点后登录' },
  { id:'weekend',       cat:'special',   pts:15,  daily:false, icon:'🎉', title_en:'Weekend Warrior',     title_zh:'周末勇士',   desc_en:'Complete a book on the weekend',        desc_zh:'周末完成一本书' },
  { id:'plays_10',      cat:'special',   pts:75,  daily:false, icon:'🎯', title_en:'Ten Tales',           title_zh:'十次挑战',   desc_en:'Complete 10 book plays total',          desc_zh:'累计完成10次阅读挑战' },
  { id:'comeback',      cat:'special',   pts:30,  daily:false, icon:'🦋', title_en:'Comeback Kid',        title_zh:'王者归来',   desc_en:'Return after 3+ days away',             desc_zh:'离开3天后重新登录' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function _today() {
  return new Date().toISOString().slice(0, 10);
}

function _daysBetween(d1, d2) {
  return Math.round((new Date(d2) - new Date(d1)) / 86400000);
}

function _uid() {
  const p = auth.getUserProfile();
  return (p && p.uid) || 'guest';
}

function _load(uid) {
  try {
    return wx.getStorageSync(KEY_PREFIX + uid) || {
      points: 0, totalEarned: 0, spent: 0,
      earned: [],
      dailyEarned: {},
      loginStreak: 0, lastLoginDate: '', totalLogins: 0,
      totalQuestions: 0, dailyQuestions: 0, lastQuestionDate: '',
      booksCompletedToday: [], lastPlayDate: '',
      langPlayedToday: [], lastLangDate: '',
      langBookMap: {},
      zhBooks: [], enBooks: [],
      sqCompleted: [],
      unlockedSideQuests: [],
    };
  } catch(e) {
    return {
      points: 0, totalEarned: 0, spent: 0,
      earned: [],
      dailyEarned: {},
      loginStreak: 0, lastLoginDate: '', totalLogins: 0,
      totalQuestions: 0, dailyQuestions: 0, lastQuestionDate: '',
      booksCompletedToday: [], lastPlayDate: '',
      langPlayedToday: [], lastLangDate: '',
      langBookMap: {},
      zhBooks: [], enBooks: [],
      sqCompleted: [],
      unlockedSideQuests: [],
    };
  }
}

function _save(uid, state) {
  try { wx.setStorageSync(KEY_PREFIX + uid, state); }
  catch(e) { console.error('[achievements] save failed', e); }
}

function _grant(state, id, arr) {
  if (state.earned.includes(id)) return;
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (!a) return;
  state.earned.push(id);
  state.points += a.pts;
  state.totalEarned += a.pts;
  arr.push(a);
}

function _grantDaily(state, id, today, arr) {
  if ((state.dailyEarned || {})[id] === today) return;
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (!a) return;
  if (!state.dailyEarned) state.dailyEarned = {};
  state.dailyEarned[id] = today;
  state.points += a.pts;
  state.totalEarned += a.pts;
  arr.push(a);
}

// ── Public API ────────────────────────────────────────────────────────────────

function checkLogin() {
  const uid = _uid();
  if (!uid || uid === 'guest') return [];

  const state = _load(uid);
  const today = _today();
  const arr   = [];

  const alreadyTodayLogin = state.lastLoginDate === today;

  if (!alreadyTodayLogin) {
    // New day — update daily counters
    const prev = state.lastLoginDate;
    state.lastLoginDate = today;
    state.totalLogins = (state.totalLogins || 0) + 1;

    // Login streak logic
    if (prev) {
      const gap = _daysBetween(prev, today);
      if (gap === 1) {
        state.loginStreak = (state.loginStreak || 0) + 1;
      } else {
        if (gap >= 3) {
          _grant(state, 'comeback', arr);
        }
        state.loginStreak = 1;
      }
    } else {
      state.loginStreak = 1;
    }

    // Reset daily book/lang/question counters
    state.booksCompletedToday = [];
    state.langPlayedToday = [];
    state.dailyQuestions = 0;
    state.lastQuestionDate = today;
    state.lastPlayDate = today;
    state.lastLangDate = today;
  }

  // Daily login (always try)
  _grantDaily(state, 'daily_login', today, arr);

  if (!alreadyTodayLogin) {
    // One-time login achievements
    if (state.totalLogins >= 1) _grant(state, 'first_login', arr);
    if (state.totalLogins >= 10) _grant(state, 'login_10', arr);

    // Streak milestones
    if (state.loginStreak >= 2)  _grant(state, 'streak_2', arr);
    if (state.loginStreak >= 3)  _grant(state, 'streak_3', arr);
    if (state.loginStreak >= 7)  _grant(state, 'streak_7', arr);
    if (state.loginStreak >= 14) _grant(state, 'streak_14', arr);
    if (state.loginStreak >= 30) _grant(state, 'streak_30', arr);

    // Time-based (one-time)
    const hour = new Date().getHours();
    if (hour < 8)  _grant(state, 'early_bird', arr);
    if (hour >= 21) _grant(state, 'night_owl', arr);
  }

  _save(uid, state);
  return arr;
}

function checkBookComplete(bookId, correct, total, lang, isSideQuest) {
  const uid = _uid();
  if (!uid || uid === 'guest') return [];

  const state = _load(uid);
  const today = _today();
  const arr   = [];

  // Reset daily counters if new day
  if (state.lastPlayDate !== today) {
    state.booksCompletedToday = [];
    state.lastPlayDate = today;
  }
  if (state.lastQuestionDate !== today) {
    state.dailyQuestions = 0;
    state.lastQuestionDate = today;
  }
  if (state.lastLangDate !== today) {
    state.langPlayedToday = [];
    state.lastLangDate = today;
  }

  // Track questions answered
  state.totalQuestions = (state.totalQuestions || 0) + total;
  state.dailyQuestions = (state.dailyQuestions || 0) + total;

  // Track daily books completed (store {id, isSideQuest})
  state.booksCompletedToday = state.booksCompletedToday || [];
  // Only add if not already added this session (one completion per call)
  state.booksCompletedToday.push({ id: bookId, isSideQuest: !!isSideQuest });

  // Track language play
  state.langPlayedToday = state.langPlayedToday || [];
  if (!state.langPlayedToday.includes(lang)) {
    state.langPlayedToday.push(lang);
  }

  // Track lang-book map
  state.langBookMap = state.langBookMap || {};
  if (!state.langBookMap[bookId]) state.langBookMap[bookId] = [];
  if (!state.langBookMap[bookId].includes(lang)) {
    state.langBookMap[bookId].push(lang);
  }

  // Track zh/en book lists
  state.zhBooks = state.zhBooks || [];
  state.enBooks = state.enBooks || [];
  if (lang === 'zh' && !state.zhBooks.includes(bookId)) state.zhBooks.push(bookId);
  if (lang === 'en' && !state.enBooks.includes(bookId)) state.enBooks.push(bookId);

  // Track side quest completions
  if (isSideQuest) {
    state.sqCompleted = state.sqCompleted || [];
    if (!state.sqCompleted.includes(bookId)) state.sqCompleted.push(bookId);
  }

  // Derive from progress data
  const allProgress = progress.getAll();
  const bookData    = allProgress[bookId]; // already updated by saveResult
  const uniqueBooks = Object.keys(allProgress).filter(k => allProgress[k] && allProgress[k].attempts > 0);
  const totalPlays  = uniqueBooks.reduce((s, k) => s + (allProgress[k].attempts || 0), 0);
  const perfectBooks = uniqueBooks.filter(k => {
    const d = allProgress[k];
    return d.bestTotal > 0 && d.bestScore === d.bestTotal;
  });
  const threeStarBooks = uniqueBooks.filter(k => progress.getStars(allProgress[k]) >= 3);

  const pct = Math.round((correct / (total || 1)) * 100);

  // improved: best score equals current correct AND played more than once
  const isImproved = bookData && bookData.attempts > 1 && bookData.bestScore === correct;

  // ── Question milestones ───────────────────────────────────────────────────
  if (state.totalQuestions >= 1)    _grant(state, 'first_q', arr);
  if (state.totalQuestions >= 100)  _grant(state, 'q_100', arr);
  if (state.totalQuestions >= 500)  _grant(state, 'q_500', arr);
  if (state.totalQuestions >= 1000) _grant(state, 'q_1000', arr);
  if (state.dailyQuestions >= 20)   _grantDaily(state, 'daily_20q', today, arr);
  if (state.dailyQuestions >= 40)   _grantDaily(state, 'daily_40q', today, arr);

  // ── Book milestones ───────────────────────────────────────────────────────
  const mainBooks = BOOKS.filter(b => !b.sideQuest).map(b => b.id);
  const uniqueMainPlayed = uniqueBooks.filter(k => mainBooks.includes(k));

  if (uniqueBooks.length >= 1)  _grant(state, 'first_book', arr);
  if (uniqueBooks.length >= 3)  _grant(state, 'books_3', arr);
  if (uniqueBooks.length >= 5)  _grant(state, 'books_5', arr);
  if (uniqueMainPlayed.length >= 7) _grant(state, 'books_all7', arr);

  if (bookData && bookData.attempts >= 2) _grant(state, 'play_twice', arr);
  if (bookData && bookData.attempts >= 5) _grant(state, 'play_5times', arr);

  const todayCount = state.booksCompletedToday.length;
  if (todayCount >= 2) _grantDaily(state, 'two_today', today, arr);
  if (todayCount >= 3) _grantDaily(state, 'three_today', today, arr);

  // ── Score milestones ──────────────────────────────────────────────────────
  if (pct >= 80) _grant(state, 'first_80', arr);
  if (pct === 100) _grant(state, 'first_100', arr);
  if (perfectBooks.length >= 2) _grant(state, 'perfect_2', arr);
  if (perfectBooks.length >= 3) _grant(state, 'perfect_3', arr);
  if (perfectBooks.length >= 5) _grant(state, 'perfect_5', arr);
  if (isImproved) _grant(state, 'improved', arr);
  if (threeStarBooks.length >= 1) _grant(state, 'three_stars', arr);
  if (threeStarBooks.length >= 3) _grant(state, 'three_stars_3', arr);

  // ── Side quest milestones ─────────────────────────────────────────────────
  if (isSideQuest) {
    if (pct === 100) _grant(state, 'sq_100', arr);
    if (state.sqCompleted.length >= 1) _grant(state, 'first_sq', arr);
    if (state.sqCompleted.length >= 2) _grant(state, 'sq_2', arr);
    const totalSideQuests = BOOKS.filter(b => b.sideQuest).length;
    if (state.sqCompleted.length >= totalSideQuests) _grant(state, 'sq_all', arr);
  }

  // ── Double agent: side + main same day ────────────────────────────────────
  const todayHasSide = state.booksCompletedToday.some(b => b.isSideQuest);
  const todayHasMain = state.booksCompletedToday.some(b => !b.isSideQuest);
  if (todayHasSide && todayHasMain) _grantDaily(state, 'sq_main_day', today, arr);

  // ── Language milestones ───────────────────────────────────────────────────
  if (state.langBookMap[bookId] && state.langBookMap[bookId].length >= 2) {
    _grant(state, 'bilingual', arr);
  }
  if (state.zhBooks.length >= 3) _grant(state, 'zh_3', arr);
  if (state.enBooks.length >= 3) _grant(state, 'en_3', arr);
  if (state.langPlayedToday.length >= 2) _grantDaily(state, 'lang_day', today, arr);

  // ── Special milestones ────────────────────────────────────────────────────
  const dow = new Date().getDay();
  if (dow === 0 || dow === 6) _grant(state, 'weekend', arr);
  if (totalPlays >= 10) _grant(state, 'plays_10', arr);

  _save(uid, state);
  return arr;
}

function checkQuestUnlock(unlockedCount) {
  const uid = _uid();
  if (!uid || uid === 'guest') return [];

  const state = _load(uid);
  const arr   = [];

  if (unlockedCount >= 2) _grant(state, 'cp_2', arr);
  if (unlockedCount >= 4) {
    _grant(state, 'cp_4', arr);
    _grant(state, 'portal_found', arr);
  }

  _save(uid, state);
  return arr;
}

function checkQuestComplete(questNumber) {
  const uid = _uid();
  if (!uid || uid === 'guest') return [];

  const state = _load(uid);
  const arr   = [];

  _grant(state, 'cp_7_done', arr);
  if (questNumber >= 2) _grant(state, 'quest_2_done', arr);

  _save(uid, state);
  return arr;
}

function checkNewQuest() {
  const uid = _uid();
  if (!uid || uid === 'guest') return [];

  const state = _load(uid);
  const arr   = [];

  _grant(state, 'new_quest', arr);

  _save(uid, state);
  return arr;
}

function unlockSideQuest(bookId) {
  const uid = _uid();
  if (!uid || uid === 'guest') return false;

  const state = _load(uid);
  state.unlockedSideQuests = state.unlockedSideQuests || [];

  if (state.unlockedSideQuests.includes(bookId)) return true; // already unlocked
  if (state.points < SIDE_QUEST_COST) return false;

  state.points -= SIDE_QUEST_COST;
  state.spent = (state.spent || 0) + SIDE_QUEST_COST;
  state.unlockedSideQuests.push(bookId);

  _save(uid, state);
  return true;
}

function isUnlocked(bookId) {
  const uid = _uid();
  if (!uid || uid === 'guest') return false;
  const state = _load(uid);
  return (state.unlockedSideQuests || []).includes(bookId);
}

function getState() {
  const uid = _uid();
  if (!uid || uid === 'guest') {
    return {
      points: 0, totalEarned: 0, spent: 0,
      earned: [], dailyEarned: {},
      loginStreak: 0, lastLoginDate: '', totalLogins: 0,
      totalQuestions: 0, dailyQuestions: 0, lastQuestionDate: '',
      booksCompletedToday: [], lastPlayDate: '',
      langPlayedToday: [], lastLangDate: '',
      langBookMap: {}, zhBooks: [], enBooks: [],
      sqCompleted: [], unlockedSideQuests: [],
    };
  }
  return _load(uid);
}

function getBalance() {
  const uid = _uid();
  if (!uid || uid === 'guest') return 0;
  return (_load(uid).points) || 0;
}

module.exports = {
  ACHIEVEMENTS,
  SIDE_QUEST_COST,
  checkLogin,
  checkBookComplete,
  checkQuestUnlock,
  checkQuestComplete,
  checkNewQuest,
  unlockSideQuest,
  isUnlocked,
  getState,
  getBalance,
};
