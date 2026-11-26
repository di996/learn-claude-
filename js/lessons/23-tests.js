// Sources (checked 2026-11-26): https://code.claude.com/docs/en/common-workflows, https://code.claude.com/docs/en/best-practices
// Docs ("Work with tests"): "be specific about what behavior you want to verify"; "run the new tests and fix any failures".
// Best practices: "Give Claude something it can run that comes back pass or fail."
AD.addLesson({
  id: 'write-tests',
  n: 23,
  level: 'beginner',
  title: 'Write and run tests',
  blurb: 'Have Claude write tests, run them and fix what fails.',
  icon: '✓',
  pro: true,
  summary: 'You asked for specific tests, let Claude run them, and approved the fix for the bug they found.',
  start: 'claude',
  steps: [
    {
      say: `<p>Tests let Claude check its own work. Ask Claude to add tests for <code>countOpen</code>, and say <b>what to check</b>: done todos must not be counted.</p>`,
      match: (v) => !v.startsWith('/') && !v.startsWith('!') && /test/i.test(v) && /count/i.test(v) && /(done|finish|complet|tick)/i.test(v),
      answer: 'add tests for countOpen that check done todos are not counted',
      hints: [
        { match: /^\//, msg: 'No slash needed. Ask in plain English.' },
        { match: /^!/, msg: 'No `!`. You are asking Claude, not running a command.' },
        { match: (v) => !/test/i.test(v), msg: 'Ask for **tests**.' },
        { match: (v) => !/count/i.test(v), msg: 'Say which function: `countOpen`.' },
        { match: (v) => !/(done|finish|complet|tick)/i.test(v), msg: 'Say what to check: **done** todos must not be counted.' },
      ],
      hint: 'Try `add tests for countOpen that check done todos are not counted`.',
      successTitle: 'Request sent.',
      success: 'Claude wants to add to the test file…',
      respond: [{ think: 700 }, { tool: 'Read', arg: 'tests/utils.test.js', out: 'Read 48 lines' }],
      pause: false,
    },
    {
      say: `<p>The test checks exactly what you asked for. <b>Approve it.</b></p>`,
      menu: {
        title: 'Edit file',
        bodyHtml: true,
        body:
          '<span class="t-dim">tests/utils.test.js</span>\n' +
          '<span class="t-green">+ test(\'countOpen skips done todos\', () => {</span>\n' +
          '<span class="t-green">+   const todos = [{ done: false }, { done: true }, { done: false }];</span>\n' +
          '<span class="t-green">+   expect(countOpen(todos)).toBe(2);</span>\n' +
          '<span class="t-green">+ });</span>',
        question: 'Do you want to make this edit to utils.test.js?',
        options: ['Yes', 'Yes, allow all edits during this session', 'No'],
      },
      answer: [0, 1],
      hints: {
        2: 'This is the test you asked for. Approve it.',
      },
      hint: 'Choose "Yes".',
      success: 'The test is written. Now run it.',
      respond: [{ tool: 'Update', arg: 'tests/utils.test.js', out: 'Updated tests/utils.test.js with 4 additions' }],
    },
    {
      say: `<p>Ask Claude to <b>run the new tests and fix any failures</b>.</p>`,
      match: (v) => !v.startsWith('/') && !v.startsWith('!') && /run/i.test(v) && /test/i.test(v),
      answer: 'run the new tests and fix any failures',
      hints: [
        { match: /^!/, msg: 'You could run them yourself, but this time let Claude run them, so it can fix what fails.' },
        { match: /^\//, msg: 'No slash needed. Ask in plain English.' },
        { match: (v) => !/run/i.test(v), msg: 'Ask Claude to **run** the tests.' },
      ],
      hint: 'Ask Claude to **run** the new tests and fix any failures.',
      successTitle: 'Request sent.',
      success: 'Claude wants to run a command…',
      respond: [{ think: 400 }],
      pause: false,
    },
    {
      say: `<p>Claude will run the tests more than once: now, and again after a fix. Let it run <code>npm test</code> without asking each time.</p>`,
      menu: {
        title: 'Bash command',
        body: 'npm test\n  Run the test suite',
        question: 'Do you want to proceed?',
        options: ['Yes', "Yes, and don't ask again for: npm test *", 'No'],
      },
      answer: 1,
      hints: {
        0: 'That allows it once. Claude will run the tests again after fixing, so choose "don\'t ask again" for `npm test`.',
        2: '`npm test` only runs the tests. It is safe.',
      },
      hint: 'Choose "Yes, and don\'t ask again for: npm test *".',
      success: 'The new test found a real bug: done todos were counted too.',
      respond: [
        { tool: 'Bash', arg: 'npm test', out: ['FAIL  tests/utils.test.js', '  ✕ countOpen skips done todos', '    Expected 2, received 3', 'Tests: 1 failed, 14 passed'] },
        { text: '`countOpen` counts every todo, also the done ones. I\'ll fix it.' },
      ],
      pause: false,
    },
    {
      say: `<p>Here is the fix. <b>Approve it.</b></p>`,
      menu: {
        title: 'Edit file',
        bodyHtml: true,
        body:
          '<span class="t-dim">src/utils.js</span>\n' +
          '<span class="t-red">- return todos.length;</span>\n' +
          '<span class="t-green">+ return todos.filter((t) => !t.done).length;</span>',
        question: 'Do you want to make this edit to utils.js?',
        options: ['Yes', 'Yes, allow all edits during this session', 'No'],
      },
      answer: [0, 1],
      hints: {
        2: 'This fixes the bug the test found. Approve it.',
      },
      hint: 'Choose "Yes".',
      success: 'Claude ran the tests again by itself. All green.',
      respond: [
        { tool: 'Update', arg: 'src/utils.js', out: 'Updated src/utils.js with 1 addition and 1 removal' },
        { tool: 'Bash', arg: 'npm test', out: ['PASS  tests/utils.test.js', 'PASS  tests/app.test.js', 'Tests: 15 passed'] },
        { text: 'Fixed. All 15 tests pass.' },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>Why do tests help when you work with Claude?</b></p>`,
      choices: [
        { text: 'Claude can run them and see for itself if a change works', right: true },
        { text: 'They make Claude answer faster', why: 'Tests don\'t speed Claude up. They let it check its work.' },
        { text: 'Claude Code won\'t start without tests', why: 'It works fine without tests. They just make its changes safer.' },
      ],
      success: 'Say what to test, let Claude run it, and keep going until it passes.',
    },
  ],
});
