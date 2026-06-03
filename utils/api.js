// ── CloudBase API layer ────────────────────────────────────────────────────────
// All functions call cloud functions and return Promises with the same shape
// as before, so login.js / auth.js need no changes.

function wxLogin() {
  return wx.cloud.callFunction({ name: 'wxLogin' }).then(res => {
    if (!res.result) throw new Error('cloud_error');
    return res.result;
  });
}

function getPhoneNumber(code) {
  return wx.cloud.callFunction({ name: 'getPhoneNumber', data: { code } }).then(res => {
    if (!res.result || !res.result.success) throw new Error(res.result && res.result.error || 'get_phone_failed');
    return res.result.user;
  });
}

module.exports = { wxLogin, getPhoneNumber };
