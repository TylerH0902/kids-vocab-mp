// ── CloudBase API layer ────────────────────────────────────────────────────────
// All functions call cloud functions and return Promises with the same shape
// as before, so login.js / auth.js need no changes.

// Audio CDN — jsDelivr serves the kids-vocab-audio GitHub repo through
// CDN nodes in Asia, significantly reducing latency vs direct GitHub Pages.
const AUDIO_CDN = 'https://cdn.jsdelivr.net/gh/TylerH0902/kids-vocab-audio@main';

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

module.exports = { wxLogin, getPhoneNumber, AUDIO_CDN };
