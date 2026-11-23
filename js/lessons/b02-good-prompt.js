// Sources (checked 2026-11-23): https://support.claude.com/en/articles/7996857-my-prompt-isn-t-giving-me-a-helpful-answer, https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/be-clear-and-direct
// Claude Basics B2 (Lasse). Running project: mum's 60th birthday party. Here: a short speech.
AD.addLesson({
  id: 'basics-good-prompt',
  track: 'basics',
  n: 2,
  title: 'Write a good prompt',
  blurb: 'Give Claude a goal, context and the format you want.',
  icon: '2',
  summary: 'You turned a vague request into a clear prompt with a goal, context and a format.',
  chat: {
    title: 'New chat',
    recents: ["Mum's 60th birthday party"],
  },
  steps: [
    {
      say: `<p>You want a short speech for the party. Start the way most people do: a very short prompt.</p><p>Type <code>write a speech</code> and press <b>Enter</b> or tap send.</p>`,
      match: (v) => !v.startsWith('/') && /speech/i.test(v),
      answer: 'write a speech',
      hints: [
        { match: /^\//, msg: 'No slash needed. Just type `write a speech`.' },
        { match: /speach|spech\b|speeh/i, msg: 'Check the spelling: `speech`.' },
      ],
      hint: 'Ask Claude to write a **speech**.',
      success: 'Claude wrote something, but it had to guess everything.',
      respond: [
        { title: 'Speech' },
        { think: 600 },
        {
          text: [
            'Good evening, everyone. Thank you all for being here today.',
            'We are gathered to celebrate a special occasion…',
            '',
            'What is the speech for, and who is it about?',
          ],
        },
      ],
    },
    {
      say: `<p>Claude doesn't know what the speech is for. Start with the <b>goal</b>.</p><p>Reply with the occasion, e.g. <code>it's for my mum's 60th birthday party</code>.</p>`,
      match: (v) => !v.startsWith('/') && /(birthday|60|sixtieth|party|celebrat)/i.test(v),
      answer: "it's for my mum's 60th birthday party",
      hints: [
        { match: /^\//, msg: 'No slash needed. Just tell Claude the occasion.' },
        { match: /^write a speech$/i, msg: 'That is the same prompt again. Add what it is **for**: `it\'s for my mum\'s 60th birthday party`.' },
      ],
      hint: 'Tell Claude the **occasion**: your mum\'s 60th birthday party.',
      success: 'Better. Now Claude knows the goal.',
      respond: [
        { think: 600 },
        {
          text: [
            'Here is a birthday speech:',
            '"Mum, sixty years young. You have always been there for us, and today we are here for you…"',
            '',
            'Tell me a bit about her, and I can make it more personal.',
          ],
        },
      ],
    },
    {
      say: `<p>It's still a speech for any mum. Add <b>context</b>: things only you know.</p><p>Tell Claude about her, e.g. <code>she's a retired teacher who loves her garden</code>.</p>`,
      match: (v) => !v.startsWith('/') && v.split(/\s+/).length >= 4 && /(she|her|mum|mom|mother|loves|likes|was|is a)/i.test(v),
      answer: "she's a retired teacher who loves her garden",
      hints: [
        { match: /^\//, msg: 'No slash needed. Just describe your mum.' },
        { match: /(birthday|60th|party)/i, msg: 'Claude already knows the occasion. Now describe **her**: her job, hobbies or habits.' },
        { match: (v) => v.split(/\s+/).length < 4, msg: 'Give a few details in a full sentence, e.g. `she\'s a retired teacher who loves her garden`.' },
      ],
      hint: 'Describe your mum: what she **did** or what she **loves**.',
      success: 'Now the speech is about your mum, not just any mum.',
      respond: [
        { think: 700 },
        {
          text: [
            '"For thirty years, Mum taught other people\'s children. Now she teaches tomatoes how to grow. And somehow, they listen to her better than we ever did…"',
            '',
            'It is about four minutes long. Want it shorter?',
          ],
        },
      ],
    },
    {
      say: `<p>Last part: the <b>format</b>. Say how long it should be and how it should sound.</p><p>E.g. <code>keep it under 2 minutes, warm and a bit funny</code>.</p>`,
      match: (v) => !v.startsWith('/') && /(minute|min\b|short|long|word|line|sentence|tone|funny|warm|serious|formal|casual)/i.test(v),
      answer: 'keep it under 2 minutes, warm and a bit funny',
      hints: [
        { match: /^\//, msg: 'No slash needed. Just say how long and how it should sound.' },
        { match: /(teacher|garden)/i, msg: 'Claude already knows about her. Now say the **length** and the **tone**.' },
      ],
      hint: 'Say the **length** (e.g. 2 minutes) and the **tone** (e.g. warm, funny).',
      success: 'Goal, context and format. That is a complete prompt.',
      respond: [
        { think: 700 },
        {
          text: [
            "Here is a 90-second version, warm with a little humour:",
            '"Mum taught a whole town to read. Now she spends her days talking to her roses, who are, frankly, better listeners than we were. Sixty years, and you still make everything grow. Happy birthday, Mum."',
          ],
        },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>Which prompt gets the best first answer?</b></p>`,
      choices: [
        { text: 'Write a 2-minute, warm speech for my mum\'s 60th. She\'s a retired teacher who loves her garden.', right: true },
        { text: 'Write a speech.', why: 'Claude has to guess the occasion, the person and the length. You saw how generic that got.' },
        { text: 'Write the best speech ever. Make it perfect.', why: 'Big words don\'t help. Details do: the goal, context and format.' },
      ],
      success: 'Next time, put the goal, context and format in your first message.',
    },
  ],
});
