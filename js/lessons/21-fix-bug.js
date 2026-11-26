// Sources (checked 2026-11-26): https://code.claude.com/docs/en/common-workflows, https://code.claude.com/docs/en/best-practices
// Docs: "Tell Claude the command to reproduce the issue and get a stack trace". Best practices: give Claude
// "something it can run that comes back pass or fail". Shell mode (!) output is added to the conversation.
AD.addLesson({
  id: 'fix-bug',
  n: 21,
  level: 'beginner',
  title: 'Fix a bug',
  blurb: 'Show Claude the failing test and the command that proves the fix.',
  icon: '✱',
  pro: true,
  summary: 'You found a failing test, told Claude how to check its fix, and approved the fix and the test run.',
  start: 'claude',
  steps: [
    {
      say: `<p>The category filter from last time feels off. Run the tests yourself to find out.</p>`,
      match: /^!\s*npm (run )?test$/,
      answer: '!npm test',
      hints: [
        { match: /^npm (run )?test$/, msg: 'Remember: start with `!` to run a command yourself.' },
        { match: /^\//, msg: 'Terminal commands start with `!`, not `/`.' },
        { match: /^!\s*git/, msg: 'That shows changed files. You want to run the **tests**.' },
        { match: (v) => !v.startsWith('!'), msg: 'Run the test command yourself: `!` and then `npm test`.' },
      ],
      hint: 'Run the tests with `!npm test`.',
      success: 'One test fails. Now you know exactly what is broken.',
      respond: [
        { shell: 'FAIL  tests/app.test.js\n  ✕ filter: Work shows only work todos\n    Expected 2 todos, received 0\nTests: 1 failed, 13 passed' },
        { think: 300 },
        { text: 'The filter test fails: choosing **Work** shows no todos.' },
      ],
    },
    {
      say: `<p>Ask Claude to fix it. Also tell it <b>how to check</b>: run <code>npm test</code>. Then it can prove its own fix.</p>`,
      match: (v) => !v.startsWith('/') && !v.startsWith('!') && /(fix|repair|solve)/i.test(v) && /npm test|run the tests|run tests|tests? pass/i.test(v),
      answer: 'fix the failing filter test and run npm test to check',
      hints: [
        { match: /^!/, msg: 'No `!` this time. You are asking Claude.' },
        { match: /^\//, msg: 'No slash needed. Ask in plain English.' },
        { match: (v) => !/(fix|repair|solve)/i.test(v), msg: 'Ask Claude to **fix** the failing test.' },
        { match: (v) => !/npm test|run the tests|run tests|tests? pass/i.test(v), msg: 'Also tell Claude how to check: run `npm test`.' },
      ],
      hint: 'Try `fix the failing filter test and run npm test to check`.',
      successTitle: 'Request sent.',
      success: 'Claude found the cause…',
      respond: [
        { think: 700 },
        { tool: 'Read', arg: 'src/app.js', out: 'Read 112 lines' },
        { text: 'The filter compares "Work" with "work". Categories are saved in lowercase, so nothing matches.' },
      ],
      pause: false,
    },
    {
      say: `<p>One small change. <b>Approve it.</b></p>`,
      menu: {
        title: 'Edit file',
        bodyHtml: true,
        body:
          '<span class="t-dim">src/app.js</span>\n' +
          '<span class="t-red">- return todos.filter((t) => t.category === filter);</span>\n' +
          '<span class="t-green">+ return todos.filter((t) => t.category === filter.toLowerCase());</span>',
        question: 'Do you want to make this edit to app.js?',
        options: ['Yes', 'Yes, allow all edits during this session', 'No'],
      },
      answer: [0, 1],
      hints: {
        2: 'This is the fix for the failing test. Approve it.',
      },
      hint: 'Choose "Yes".',
      success: 'Now Claude wants to check its fix, just as you asked.',
      respond: [{ tool: 'Update', arg: 'src/app.js', out: 'Updated src/app.js with 1 addition and 1 removal' }],
      pause: false,
    },
    {
      say: `<p>Claude wants to run the tests. <b>Allow it.</b></p>`,
      menu: {
        title: 'Bash command',
        body: 'npm test\n  Run the test suite',
        question: 'Do you want to proceed?',
        options: ['Yes', "Yes, and don't ask again for: npm test *", 'No'],
      },
      answer: [0, 1],
      hints: {
        2: 'This is how Claude checks the fix. `npm test` is safe. Allow it.',
      },
      hint: 'Choose "Yes".',
      success: 'All green. Claude fixed it and proved it.',
      respond: [
        { tool: 'Bash', arg: 'npm test', out: ['PASS  tests/app.test.js', 'PASS  tests/utils.test.js', 'Tests: 14 passed'] },
        { text: 'Fixed. All 14 tests pass.' },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>What helps Claude most when it has to fix a bug?</b></p>`,
      choices: [
        { text: 'The error, and the command that shows it', right: true },
        { text: 'Just "it\'s broken, fix it"', why: 'Claude has to guess what is wrong. Give it the error and how to see it.' },
        { text: 'Starting a new conversation first', why: 'That throws away what Claude knows. Give it the error instead.' },
      ],
      success: 'Error + the command to check it = a fix Claude can prove.',
    },
  ],
});
