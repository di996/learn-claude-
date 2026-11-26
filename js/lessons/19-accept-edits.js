// Sources (checked 2026-11-26): https://code.claude.com/docs/en/interactive-mode, https://code.claude.com/docs/en/permission-modes
// Docs: Shift+Tab cycles default → acceptEdits → plan. Status line: "⏵⏵ accept edits on".
// In accept edits mode, file edits go through; "All other Bash commands except the built-in read-only set" still prompt
// (a few file commands like mkdir and mv are auto-approved inside the project).
// Replaces the old lesson 05-modes.js (same id). Plan mode is lesson 20. Bob removes the old file.
AD.addLesson({
  id: 'modes',
  n: 19,
  level: 'beginner',
  title: 'Auto-accept edits with Shift+Tab',
  blurb: 'Let Claude edit files without asking each time. Commands still ask.',
  icon: '⏵',
  pro: true,
  summary: 'You switched on accept edits with Shift+Tab, let Claude edit without asking and still approved a command yourself.',
  article: 'blog/claude-code-plan-mode.html',
  start: 'claude',
  steps: [
    {
      say: `<p>Saying "Yes" to every edit gets tiring. <b>Shift+Tab</b> switches modes.</p><p>Press <b>Shift+Tab once</b> and watch the line under the input box.</p>`,
      mode: 'accept',
      modeHints: { plan: 'You pressed it twice and landed in plan mode. Keep pressing Shift+Tab until you see accept edits.' },
      hint: 'Hold **Shift** and press **Tab**. Don\'t type anything.',
      success: '`⏵⏵ accept edits on`: Claude now edits files without asking.',
    },
    {
      say: `<p>Ask Claude to <code>add a counter that shows how many todos are left</code>.</p>`,
      match: (v) => !v.startsWith('/') && !v.startsWith('!') && /(count|how many|left|number)/i.test(v),
      answer: 'add a counter that shows how many todos are left',
      hints: [
        { match: /^\//, msg: 'No slash needed. Ask in plain English.' },
        { match: /^!/, msg: 'No `!`. You are asking Claude, not running a command.' },
        { match: (v) => !/(count|how many|left|number)/i.test(v), msg: 'Say what you want: a **counter** of todos left.' },
      ],
      hint: 'Ask for a **counter** that shows how many todos are left.',
      success: 'No question this time. In accept edits mode, Claude edits files straight away.',
      respond: [
        { think: 700 },
        {
          tool: 'Update',
          arg: 'src/app.js',
          out: 'Updated src/app.js with 3 additions',
          diff: [
            ['+', 'function renderCount(todos) {', 58],
            ['+', "  $('count').textContent = countOpen(todos) + ' left';", 59],
            ['+', '}', 60],
          ],
        },
        { tool: 'Update', arg: 'src/index.html', out: 'Updated src/index.html with 1 addition' },
        { text: 'Added a counter under the list, like "3 left".' },
      ],
    },
    {
      say: `<p>Now ask Claude to <b>run the tests</b>.</p>`,
      match: (v) => !v.startsWith('/') && /test/i.test(v),
      answer: 'run the tests',
      hints: [
        { match: /^\//, msg: 'No slash needed. Ask Claude in plain English.' },
        { match: (v) => !/test/i.test(v), msg: 'Ask Claude to run the **tests**.' },
      ],
      hint: 'Ask Claude to **run the tests**.',
      successTitle: 'Request sent.',
      success: 'Claude wants to run a command…',
      respond: [{ think: 500 }],
      pause: false,
    },
    {
      say: `<p>A command still asks, even in accept edits mode. This one is safe. <b>Allow it.</b></p>`,
      menu: {
        title: 'Bash command',
        body: 'npm test\n  Run the test suite',
        question: 'Do you want to proceed?',
        options: ['Yes', "Yes, and don't ask again for: npm test *", 'No'],
      },
      answer: [0, 1],
      hints: {
        2: '`npm test` only runs the tests. It is safe to allow.',
      },
      hint: 'Choose "Yes".',
      success: 'Edits go through by themselves. Commands still wait for you.',
      respond: [
        { tool: 'Bash', arg: 'npm test', out: ['PASS  tests/utils.test.js', 'PASS  tests/app.test.js', 'Tests: 12 passed'] },
        { text: 'All 12 tests pass.' },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>Accept edits is on. What still asks for your OK?</b></p>`,
      choices: [
        { text: 'Most terminal commands, like `npm test`', right: true },
        { text: 'Every file edit', why: 'That is the normal mode. In accept edits mode, file edits go through by themselves.' },
        { text: 'Nothing at all', why: 'Commands still ask. Accept edits only covers file edits.' },
      ],
      success: 'Accept edits = file edits without asking. Commands still need your OK.',
    },
  ],
});
