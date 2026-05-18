const STRINGS = {
  en: {
    chooseAge:    'Choose your age group',
    chooseMode:   'Choose mode',
    casual:       'Casual',
    test:         'Test',
    start:        'Start!',
    tapAnswer:    'Tap the correct word',
    correct:      'Correct! 🎉',
    wrong:        'Try again! 💪',
    next:         'Next →',
    score:        'Score',
    done:         'Done!',
    testDone:     'Test Complete!',
    casualDone:   'Great Work!',
    youScored:    'You scored',
    playAgain:    'Play Again',
    backHome:     'Home',
    spellIt:      'Spell it!',
    typeHere:     'Type here…',
    check:        'Check',
    spellCorrect: '✅ Correct!',
    spellWrong:   (ans, correct) => `❌ It's "${correct}"`,
    age13:        'Ages 1–3',
    age34:        'Ages 3–4',
    age56:        'Ages 5–6',
  },
  zh: {
    chooseAge:    '选择年龄组',
    chooseMode:   '选择模式',
    casual:       '练习模式',
    test:         '测试模式',
    start:        '开始！',
    tapAnswer:    '点击正确答案',
    correct:      '答对了！🎉',
    wrong:        '再试一次！💪',
    next:         '下一题 →',
    score:        '分数',
    done:         '完成！',
    testDone:     '测试完成！',
    casualDone:   '棒极了！',
    youScored:    '你得了',
    playAgain:    '再玩一次',
    backHome:     '首页',
    spellIt:      '拼写吧！',
    typeHere:     '在这里输入…',
    check:        '检查',
    spellCorrect: '✅ 正确！',
    spellWrong:   (ans, correct) => `❌ 正确答案是 "${correct}"`,
    age13:        '1–3 岁',
    age34:        '3–4 岁',
    age56:        '5–6 岁',
  }
};

function t(lang, key, ...args) {
  const s = (STRINGS[lang] || STRINGS.en)[key];
  return typeof s === 'function' ? s(...args) : (s || key);
}

module.exports = { t };
