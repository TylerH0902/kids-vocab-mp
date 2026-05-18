const KEY    = '55902333-4a758f2cdefcb17ac7698976a';
const PREFIX = 'px2_';

function fetchWordImage(wordEn) {
  return new Promise(resolve => {
    const cacheKey = PREFIX + wordEn;
    const cached   = wx.getStorageSync(cacheKey);
    if (cached) { resolve(cached === 'NONE' ? null : cached); return; }

    const q   = encodeURIComponent(wordEn);
    const url = `https://pixabay.com/api/?key=${KEY}&q=${q}&image_type=illustration&safesearch=true&order=popular&per_page=5&min_width=200`;

    wx.request({
      url,
      success(res) {
        const hits = res.data && res.data.hits;
        if (hits && hits.length) {
          const imgUrl = hits[0].webformatURL;
          wx.setStorageSync(cacheKey, imgUrl);
          resolve(imgUrl);
        } else {
          // fallback: try photos
          wx.request({
            url: `https://pixabay.com/api/?key=${KEY}&q=${q}&image_type=photo&safesearch=true&order=popular&per_page=3`,
            success(res2) {
              const hits2 = res2.data && res2.data.hits;
              if (hits2 && hits2.length) {
                const imgUrl = hits2[0].webformatURL;
                wx.setStorageSync(cacheKey, imgUrl);
                resolve(imgUrl);
              } else {
                wx.setStorageSync(cacheKey, 'NONE');
                resolve(null);
              }
            },
            fail() { resolve(null); }
          });
        }
      },
      fail() { resolve(null); }
    });
  });
}

module.exports = { fetchWordImage };
