# Kids Vocab — WeChat Mini Program Progress

Target device: 小天才 smartwatch (~240×240px screen)
Source app: /Users/hanliwei/projects/kids-vocab/index.html

## File Checklist

### Core
- [x] Directory structure created
- [x] PROGRESS.md
- [x] project.config.json
- [x] app.json
- [x] app.js
- [x] app.wxss

### Utils
- [x] utils/words.js       — base WORDS array (70 words with def_en/def_zh)
- [x] utils/words13.js     — 412 words (adapted from data/words_13_new.js)
- [x] utils/words34.js     — 1018 words (adapted from data/words_34_extra.js)
- [x] utils/words56.js     — 986 words (adapted from data/words_56_extra.js)
- [x] utils/game.js        — shuffle, dedup, getDistractors, pool building
- [x] utils/i18n.js        — UI language strings (EN/ZH toggle)
- [x] utils/pixabay.js     — image fetch + wx.setStorage cache

### Pages
- [x] pages/index/         — age group + mode selection (setup screen)
- [x] pages/game/          — main game (young tap-to-answer + quiz MCQ)
- [x] pages/spell/         — spelling game
- [x] pages/result/        — score screen

### Remaining
- [ ] Test in WeChat DevTools — open project at /Users/hanliwei/projects/kids-vocab-mp
- [ ] Fix any runtime errors found during testing
- [ ] Verify 240×240 layout on watch simulator
- [ ] Add audio files (copy /kids-vocab/audio/ → kids-vocab-mp/audio/ if needed)

## Key Design Decisions
- No drag-and-drop (too fiddly on watch) — tap card to answer
- 4 choices for all age groups (2×2 grid fits 240px)
- Picture shown above choices; tap picture to hear word
- Language toggle (EN/ZH) persisted via wx.setStorageSync
- Pixabay images for 1-3 and 3-4 groups (wx.request, cached in storage)
- TEST_COUNT: 1-3 → 20, 3-4 → 20, 5-6 → 40
- SPELL_COUNT: 1-3 → 20, 3-4 → 20, 5-6 → 40
- Back button hidden during test mode

## Session Log
- Session 1: All files created and committed. Ready for DevTools testing.
