// ── Backend API layer ──────────────────────────────────────────────────────────
// Set MOCK = false and fill in BASE_URL when your server is ready.
// All functions return Promises with the same shape in both modes.

const MOCK = true;
const BASE_URL = 'https://your-api-server.com'; // ← replace with real URL

function _request(method, path, data) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + path,
      method,
      data,
      header: { 'Content-Type': 'application/json' },
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error((res.data && res.data.message) || 'request_failed'));
        }
      },
      fail(err) { reject(new Error(err.errMsg || 'network_error')); },
    });
  });
}

// Exchange wx.login() code for a session
// Real endpoint: POST /api/auth/wx-login { code }
// Returns: { token, uid, openid, nickname, loginMethod, isNewUser, expiresAt }
function wxLogin(code) {
  if (MOCK) {
    return Promise.resolve({
      token: 'mock_tok_' + Date.now(),
      uid: 'wx_' + Date.now(),
      openid: 'mock_openid_' + Date.now(),
      nickname: 'Explorer',
      loginMethod: 'wechat',
      isNewUser: false,
      expiresAt: Date.now() + 30 * 24 * 3600 * 1000,
    });
  }
  return _request('POST', '/api/auth/wx-login', { code });
}

// Send SMS verification code
// Real endpoint: POST /api/auth/sms/send { phone }
// Returns: { success: true }
// Note: In mock mode the code is always 123456
function sendSms(phone) {
  if (MOCK) {
    console.log('[MOCK] SMS code for', phone, '→ 123456');
    return new Promise(r => setTimeout(r, 700));
  }
  return _request('POST', '/api/auth/sms/send', { phone });
}

// Verify SMS code and log in
// Real endpoint: POST /api/auth/sms/verify { phone, code }
// Returns: { token, uid, phone (masked), nickname, loginMethod, isNewUser, expiresAt }
function verifySms(phone, code) {
  if (MOCK) {
    if (code !== '123456') return Promise.reject(new Error('wrong_code'));
    const masked = phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    return new Promise(r => setTimeout(() => r({
      token: 'mock_tok_' + Date.now(),
      uid: 'phone_' + phone,
      phone: masked,
      nickname: masked,
      loginMethod: 'phone',
      isNewUser: false,
      expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
    }), 600));
  }
  return _request('POST', '/api/auth/sms/verify', { phone, code });
}

module.exports = { wxLogin, sendSms, verifySms, MOCK };
