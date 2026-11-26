// Sources (checked 2026-11-26): https://code.claude.com/docs/en/permission-modes, https://code.claude.com/docs/en/interactive-mode, https://code.claude.com/docs/en/quickstart
// Final project of the Beginner level (flagged in AD.finals). Only the goal is given; the learner must remember
// plan mode (lesson 20), ! commands (13), tests (23) and committing (24). Hints help if they get stuck.
AD.addLesson({
  id: 'beginner-project',
  n: 25,
  level: 'beginner',
  title: 'Beginner project: add a search box',
  blurb: 'Build a new feature on your own, from plan to commit.',
  icon: '★',
  pro: true,
  summary: 'You built a search box on your own: planned it, let Claude build it, tested it and saved it with a commit.',
  start: 'claude',
  steps: [
    {
      say: `<p><b>Your project:</b> a search box that filters the todo list as you type. No step-by-step this time.</p><p>It is a bigger change, so start the safe way: let Claude plan before it touches anything.</p>`,
      mode: 'plan',
      modeHints: {
        accept: 'That is accept edits. Keep going until you see plan mode.',
        normal: 'You went all the way round. Keep pressing until you see plan mode.',
      },
      hint: 'Switch to plan mode with **Shift+Tab** (twice).',
      success: '`⏸ plan mode on`. Good start.',
    },
    {
      say: `<p>Now ask Claude for the feature.</p>`,
      match: (v) => !v.startsWith('/') && !v.startsWith('!') && /(search|filter|find)/i.test(v),
      answer: 'add a search box that filters the todo list as I type',
      hints: [
        { match: /^\//, msg: 'No slash needed. Describe the feature in plain English.' },
        { match: /^!/, msg: 'No `!`. You are asking Claude, not running a command.' },
        { match: (v) => !/(search|filter|find)/i.test(v), msg: 'Describe the goal: a **search** box that filters the list.' },
      ],
      hint: 'Ask for a **search box** that filters the list as you type.',
      successTitle: 'Planning…',
      success: 'A plan, and nothing changed yet.',
      respond: [
        { think: 1200, label: 'Planning' },
        { tool: 'Read', arg: 'src/index.html', out: 'Read 41 lines' },
        { tool: 'Read', arg: 'src/app.js', out: 'Read 112 lines' },
        {
          text: [
            "Here's my plan:",
            '1. Add a search box above the list in `index.html`',
            '2. In `app.js`, show only todos whose text contains the search words',
            '3. Keep it working together with the category filter',
            '4. Add tests in `tests/app.test.js`',
          ],
        },
      ],
      pause: false,
    },
    {
      say: `<p>The plan is good, and you will check the result with the tests afterwards. Let Claude make the edits <b>without asking each time</b>.</p>`,
      menu: {
        title: 'Ready to code?',
        body: 'Claude\'s plan: a search box (4 steps)',
        question: 'Would you like to proceed?',
        options: ['Yes, auto-accept edits', 'Yes, manually approve edits', 'No, keep planning'],
      },
      answer: 0,
      hints: {
        1: 'That works too, but here you check the result with the tests afterwards. Let Claude edit without asking.',
        2: 'The plan is good. No need to keep planning.',
      },
      hint: 'Choose the option that auto-accepts the edits.',
      success: 'Claude built it. Now make sure it works.',
      respond: [
        { perm: 'accept' },
        { tool: 'Update', arg: 'src/index.html', out: 'Updated src/index.html with 1 addition' },
        { tool: 'Update', arg: 'src/app.js', out: 'Updated src/app.js with 8 additions and 1 removal' },
        { tool: 'Update', arg: 'tests/app.test.js', out: 'Updated tests/app.test.js with 12 additions' },
        { text: 'Done. Typing in the search box filters the list right away.' },
      ],
    },
    {
      say: `<p>Don't just trust it. Run the tests yourself.</p>`,
      match: /^!\s*npm (run )?test$/,
      answer: '!npm test',
      hints: [
        { match: /^npm (run )?test$/, msg: 'Start with `!` to run it yourself.' },
        { match: (v) => !v.startsWith('!') && /test/i.test(v), msg: 'Asking Claude works too, but run them yourself this time, with `!`.' },
        { match: /^\//, msg: 'Terminal commands start with `!`, not `/`.' },
      ],
      hint: 'Run the tests yourself: `!npm test`.',
      success: 'All green, including the new search tests.',
      respond: [
        { shell: 'PASS  tests/app.test.js\nPASS  tests/utils.test.js\nTests: 18 passed' },
        { think: 300 },
        { text: 'All 18 tests pass, including the 3 new search tests.' },
      ],
    },
    {
      say: `<p>It works. Save this version, with a good message.</p>`,
      match: (v) => !v.startsWith('/') && !v.startsWith('!') && /commit/i.test(v),
      answer: 'commit my changes with a descriptive message',
      hints: [
        { match: /^!\s*git/, msg: 'You could, but let Claude write the message. Ask in plain English.' },
        { match: /^\/commit/, msg: 'No slash needed. Ask in plain English.' },
        { match: (v) => !/commit/i.test(v), msg: 'Ask Claude to **commit** your changes.' },
      ],
      hint: 'Ask Claude to commit your changes with a descriptive message.',
      successTitle: 'Request sent.',
      success: 'Claude wrote the message…',
      respond: [{ think: 500 }, { tool: 'Bash', arg: 'git diff', out: '3 files changed, 21 insertions(+), 1 deletion(-)' }],
      pause: false,
    },
    {
      say: `<p>Last step. Check the message, then <b>allow the commit</b>.</p>`,
      menu: {
        title: 'Bash command',
        body: 'git add src/index.html src/app.js tests/app.test.js\ngit commit -m "Add search box that filters todos as you type"\n  Commit the search feature',
        question: 'Do you want to proceed?',
        options: ['Yes', 'No'],
      },
      answer: 0,
      hints: {
        1: 'The message is clear and the tests pass. Allow it.',
      },
      hint: 'Choose "Yes".',
      successTitle: 'Beginner level done!',
      success: 'Plan first, let Claude build, test what it built, and commit when it works. Use this on every real change.',
      respond: [
        { tool: 'Bash', arg: 'git commit', out: ['[main 7d4e2b1] Add search box that filters todos as you type', ' 3 files changed, 21 insertions(+), 1 deletion(-)'] },
      ],
    },
  ],
});
