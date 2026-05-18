# Kids Vocab — WeChat Mini Program Progress

Target device: 小天才 smartwatch (~240×240px screen)
Source app: /Users/hanliwei/projects/kids-vocab/index.html

## File Checklist

### Core
- [x] Directory structure created
- [x] PROGRESS.md
- [ ] project.config.json
- [ ] app.json
- [ ] app.js
- [ ] app.wxss

### Utils
- [ ] utils/words.js       — base WORDS array (from index.html ~line 369)
- [ ] utils/words13.js     — adapted from data/words_13_new.js
- [ ] utils/words34.js     — adapted from data/words_34_extra.js
- [ ] utils/words56.js     — adapted from data/words_56_extra.js
- [ ] utils/game.js        — shuffle, dedup, getDistractors, pool building
- [ ] utils/i18n.js        — UI language strings (EN/ZH toggle)
- [ ] utils/pixabay.js     — image fetch + wx.setStorage cache

### Pages
- [ ] pages/index/         — age group + mode selection (setup screen)
- [ ] pages/game/          — main game (young tap-to-answer + quiz MCQ)
- [ ] pages/spell/         — spelling game
- [ ] pages/result/        — score screen

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
- Session 1: Directory structure + PROGRESS.md created. Starting app core files.
