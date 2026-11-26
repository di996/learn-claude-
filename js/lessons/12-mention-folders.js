// Sources (checked 2026-11-26): https://code.claude.com/docs/en/common-workflows
// Docs: "You can reference multiple files in a single message"; "What's the structure of @src/components?";
// "Directory references show file listings, not contents".
AD.addLesson({
  id: 'mention-folders',
  n: 12,
  level: 'beginner',
  title: 'Several files and folders with @',
  blurb: 'Point at more than one file, or at a whole folder, in one message.',
  icon: '⧉',
  pro: true,
  summary: 'You pointed at two files at once, looked inside a folder with @ and got tests written for the right function.',
  article: 'blog/claude-code-file-mentions-and-bash-mode.html',
  start: 'claude',
  steps: [
    {
      say: `<p>One message can point at several files.</p><p>Ask which functions in <code>src/utils.js</code> have no tests in <code>tests/utils.test.js</code>. Point at <b>both</b> files.</p>`,
      match: (v) => /@src\/utils\.js\b/.test(v) && /@tests\/utils\.test\.js\b/.test(v),
      answer: 'which functions in @src/utils.js have no tests in @tests/utils.test.js?',
      hints: [
        { match: (v) => !v.includes('@'), msg: 'Remember: put `@` in front of a file path to hand it to Claude.' },
        { match: (v) => (v.match(/@/g) || []).length < 2, msg: 'Put `@` in front of **each** file.' },
        { match: /@utils\.test\.js|@test\//, msg: 'The test file lives in `tests`: `@tests/utils.test.js`.' },
        { match: /@utils\.js/, msg: 'Use the path from the project folder: `@src/utils.js`.' },
      ],
      hint: 'Mention `@src/utils.js` and `@tests/utils.test.js` in one question.',
      success: 'Two files, one message. Claude compared them directly.',
      respond: [
        { think: 800 },
        { text: ['`formatDate` and `slugify` have tests.', '**`isOverdue` has no tests.**'] },
      ],
    },
    {
      say: `<p>You can point at a whole folder too. Claude gets the <b>list of files</b> in it.</p><p>Ask: <code>what's in the @tests/ folder?</code></p>`,
      match: (v) => /@tests\/?(?=[\s?.!]|$)/.test(v),
      answer: "what's in the @tests/ folder?",
      hints: [
        { match: /(^|\s)tests\/?(\s|$|\?)/, msg: 'Put `@` in front of the folder: `@tests/`.' },
        { match: /@tests\/\S+/, msg: 'Point at the folder itself, not a file in it: `@tests/`.' },
        { match: /@test\b/, msg: 'The folder is called `tests`, with an s.' },
      ],
      hint: 'Type `what\'s in the @tests/ folder?`',
      success: 'A folder gives Claude a list of files, not what is inside them.',
      respond: [
        { think: 500 },
        { text: ['`tests/` has two files:', '- `utils.test.js` (helpers)', '- `app.test.js` (adding and ticking off todos)'] },
      ],
    },
    {
      say: `<p>Now put it to work. Ask Claude to add tests for <code>isOverdue</code>. Point at the file with the function <b>and</b> the test file.</p>`,
      match: (v) => /overdue/i.test(v) && /@src\/utils\.js\b/.test(v) && /@tests\/utils\.test\.js\b/.test(v),
      answer: 'add tests for isOverdue from @src/utils.js to @tests/utils.test.js',
      hints: [
        { match: (v) => !v.includes('@'), msg: 'Point at the files with `@`, so Claude does not have to search.' },
        { match: (v) => !/overdue/i.test(v), msg: 'Say which function needs tests: `isOverdue`.' },
        { match: (v) => !/@tests\/utils\.test\.js\b/.test(v), msg: 'Also point at the test file: `@tests/utils.test.js`.' },
        { match: (v) => !/@src\/utils\.js\b/.test(v), msg: 'Also point at the function\'s file: `@src/utils.js`.' },
      ],
      hint: 'Mention `isOverdue`, `@src/utils.js` and `@tests/utils.test.js`.',
      successTitle: 'Request sent.',
      success: 'Claude wants to edit the test file…',
      respond: [{ think: 800 }],
      pause: false,
    },
    {
      say: `<p>Read the change. It tests a late todo and one that is not late. <b>Approve it.</b></p>`,
      menu: {
        title: 'Edit file',
        bodyHtml: true,
        body:
          '<span class="t-dim">tests/utils.test.js</span>\n' +
          '<span class="t-green">+ test(\'isOverdue: yesterday is late\', () => {</span>\n' +
          '<span class="t-green">+   expect(isOverdue({ due: yesterday })).toBe(true);</span>\n' +
          '<span class="t-green">+ });</span>\n' +
          '<span class="t-green">+ test(\'isOverdue: tomorrow is not late\', () => {</span>\n' +
          '<span class="t-green">+   expect(isOverdue({ due: tomorrow })).toBe(false);</span>\n' +
          '<span class="t-green">+ });</span>',
        question: 'Do you want to make this edit to utils.test.js?',
        options: ['Yes', 'Yes, allow all edits during this session', 'No'],
      },
      answer: [0, 1],
      hints: {
        2: 'These are the tests you asked for. Approve them.',
      },
      hint: 'Choose "Yes".',
      success: 'Tests added, in the right file, for the right function.',
      respond: [{ tool: 'Update', arg: 'tests/utils.test.js', out: 'Updated tests/utils.test.js with 6 additions' }],
    },
    {
      say: `<p>Quick check.</p><p><b>You type <code>@src/</code>. What does Claude get?</b></p>`,
      choices: [
        { text: 'A list of the files in the folder', right: true },
        { text: 'The full contents of every file in the folder', why: 'A folder gives a list of files. Point at a file to share what is inside it.' },
        { text: 'Nothing. @ only works on single files', why: 'It works on folders too, like `@tests/`.' },
      ],
      success: 'File → its contents. Folder → its list of files. Several in one message is fine.',
    },
  ],
});
