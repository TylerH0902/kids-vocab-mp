const SESSION_KEY = 'userSession';
const PROFILE_KEY  = 'userProfile';

// Returns true if a valid, non-expired session exists
function isLoggedIn() {
  try {
    const s = wx.getStorageSync(SESSION_KEY);
    if (!s || !s.token) return false;
    if (s.expiresAt && Date.now() > s.expiresAt) { clearSession(); return false; }
    return true;
  } catch(e) { return false; }
}

function getToken() {
  try { const s = wx.getStorageSync(SESSION_KEY); return (s && s.token) || null; }
  catch(e) { return null; }
}

function getUserProfile() {
  try { return wx.getStorageSync(PROFILE_KEY) || null; }
  catch(e) { return null; }
}

// data = the object returned by api.wxLogin() or api.verifySms()
function saveSession(data) {
  try {
    wx.setStorageSync(SESSION_KEY, {
      token:       data.token,
      expiresAt:   data.expiresAt,
      loginMethod: data.loginMethod,
    });
    wx.setStorageSync(PROFILE_KEY, {
      uid:         data.uid,
      openid:      data.openid      || null,
      phone:       data.phone       || null,
      nickname:    data.nickname    || 'Explorer',
      avatarUrl:   data.avatarUrl   || '',
      loginMethod: data.loginMethod || 'phone',
      createdAt:   Date.now(),
    });
  } catch(e) { console.error('[auth] saveSession failed', e); }
}

function updateProfile(fields) {
  try {
    const current = wx.getStorageSync(PROFILE_KEY) || {};
    wx.setStorageSync(PROFILE_KEY, Object.assign({}, current, fields));
  } catch(e) {}
}

function clearSession() {
  try { wx.removeStorageSync(SESSION_KEY); wx.removeStorageSync(PROFILE_KEY); } catch(e) {}
}

module.exports = { isLoggedIn, getToken, getUserProfile, saveSession, updateProfile, clearSession };
