// Sources (checked 2026-11-26): https://code.claude.com/docs/en/common-workflows
// Docs ("Understand new codebases"): "give me an overview of this codebase", "explain the main architecture patterns used here",
// "trace the login process from front-end to database".
AD.addLesson({
  id: 'explain-code',
  n: 22,
  level: 'beginner',
  title: 'Get code explained',
  blurb: 'Understand a project you didn\'t write: the big picture first, then the details.',
  icon: '❖',
  pro: true,
  summary: 'You got an overview of the project, had one function explained and followed a todo from the input box to storage.',
  start: 'claude',
  steps: [
    {
      say: `<p>Imagine a friend made this app and you have never seen the code. Start with the big picture.</p><p>Ask: <code>give me an overview of this codebase</code></p>`,
      match: (v) => !v.startsWith('/') && !v.startsWith('!') && /(overview|explain|summar|structure|big picture)/i.test(v),
      answer: 'give me an overview of this codebase',
      hints: [
        { match: /^\//, msg: 'No slash needed. Ask in plain English.' },
        { match: /^!/, msg: 'No `!`. You are asking Claude, not running a command.' },
      ],
      hint: 'Ask for an **overview** of the codebase.',
      success: 'Now you know which file does what.',
      respond: [
        { think: 800 },
        { tool: 'Search', arg: 'pattern: "**/*"', out: 'Found 9 files' },
        { tool: 'Read', arg: 'src/app.js', out: 'Read 112 lines' },
        {
          text: [
            'A small to-do app in plain JavaScript:',
            '- `src/app.js`: the main logic (adding, ticking off, filtering)',
            '- `src/storage.js`: saves todos in the browser',
            '- `src/utils.js`: small helpers like `formatDate()`',
            '- `tests/`: the tests, run with `npm test`',
          ],
        },
      ],
    },
    {
      say: `<p>Now zoom in. Ask what <code>renderCount</code> does, and point Claude at the file it lives in, <code>src/app.js</code>.</p>`,
      match: (v) => /@src\/app\.js\b/.test(v) && /rendercount|count/i.test(v),
      answer: 'what does renderCount in @src/app.js do?',
      hints: [
        { match: (v) => !v.includes('@'), msg: 'Remember: put `@` before the path to hand Claude the file.' },
        { match: /@app\.js/, msg: 'Use the path from the project folder: `@src/app.js`.' },
        { match: (v) => !/rendercount|count/i.test(v), msg: 'Name the function you want explained: `renderCount`.' },
      ],
      hint: 'Ask what `renderCount` does, and include `@src/app.js`.',
      success: 'Short and specific, because Claude got the right file.',
      respond: [
        { think: 500 },
        { text: '`renderCount()` counts the todos that are not done (with `countOpen()`) and shows "3 left" under the list. It runs every time the list changes.' },
      ],
    },
    {
      say: `<p>Last, follow one thing from start to end. Ask how a new todo goes <b>from the input box to being saved</b>.</p>`,
      match: (v) => !v.startsWith('/') && !v.startsWith('!') && /(sav|stor)/i.test(v) && /(todo|input|add|new)/i.test(v),
      answer: 'how does a new todo go from the input box to being saved?',
      hints: [
        { match: /^\//, msg: 'No slash needed. Ask in plain English.' },
        { match: (v) => !/(sav|stor)/i.test(v), msg: 'Ask how a todo ends up **saved**.' },
        { match: (v) => !/(todo|input|add|new)/i.test(v), msg: 'Say what to follow: a **new todo** from the input box.' },
      ],
      hint: 'Ask how a new todo goes from the input box to being **saved**.',
      success: 'Following one path through the code is the fastest way to understand it.',
      respond: [
        { think: 800 },
        { tool: 'Read', arg: 'src/app.js', out: 'Read 112 lines' },
        { tool: 'Read', arg: 'src/storage.js', out: 'Read 31 lines' },
        {
          text: [
            '1. You press **Add**, and `addTodo()` in `app.js` reads the input box.',
            '2. It creates `{ text, done: false, category }` and adds it to the list.',
            '3. `save()` in `storage.js` writes the whole list to the browser.',
            '4. `render()` redraws the list and the counter.',
          ],
        },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>You open a project you have never seen. What do you ask Claude first?</b></p>`,
      choices: [
        { text: 'For an overview of the codebase', right: true },
        { text: 'To rewrite it in a framework you know', why: 'Understand it first. Big changes to code you don\'t know are risky.' },
        { text: 'To explain every file, one by one', why: 'That takes long. Get the big picture first, then zoom in.' },
      ],
      success: 'Big picture → one file → one path from start to end.',
    },
  ],
});
