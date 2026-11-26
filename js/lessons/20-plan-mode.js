// Sources (checked 2026-11-26): https://code.claude.com/docs/en/permission-modes, https://code.claude.com/docs/en/interactive-mode
// Docs: plan mode status line "⏸ plan mode on". "Claude reads files, runs shell commands to explore, and writes a plan, but does not edit your source."
// Plan approval options: "Yes, auto-accept edits" (shown when auto mode is unavailable), "Yes, manually approve edits", "No, keep planning".
// Builds on lesson 19 (Shift+Tab). Shift+Tab is not named in the instruction (progression rule), only in the hint.
AD.addLesson({
  id: 'plan-mode',
  n: 20,
  level: 'beginner',
  title: 'Plan mode: plan first, then code',
  blurb: 'Get a plan you can check before Claude touches a single file.',
  icon: '⏸',
  pro: true,
  summary: 'You switched to plan mode, read Claude\'s plan, chose to approve each edit yourself and approved the first one.',
  article: 'blog/claude-code-plan-mode.html',
  start: 'claude',
  steps: [
    {
      say: `<p>For a bigger change, let Claude plan first. In <b>plan mode</b> it reads and plans, but changes nothing.</p><p>Switch to plan mode.</p>`,
      mode: 'plan',
      modeHints: {
        accept: 'That is accept edits. Press Shift+Tab once more.',
        normal: 'You went all the way round. Keep pressing Shift+Tab until you see plan mode.',
      },
      hint: 'Press **Shift+Tab** twice, until you see `⏸ plan mode on`.',
      success: '`⏸ plan mode on`: Claude can look, but not edit.',
    },
    {
      say: `<p>Ask Claude to <code>add categories to todos, like work and home</code>.</p>`,
      match: (v) => !v.startsWith('/') && !v.startsWith('!') && /(categor|tag|label|group|work|home)/i.test(v),
      answer: 'add categories to todos, like work and home',
      hints: [
        { match: /^\//, msg: 'No slash needed. Ask in plain English.' },
        { match: /^!/, msg: 'No `!`. You are asking Claude, not running a command.' },
        { match: (v) => !/(categor|tag|label|group|work|home)/i.test(v), msg: 'Ask for **categories** for the todos.' },
      ],
      hint: 'Ask Claude to add **categories** to the todos.',
      successTitle: 'Planning…',
      success: 'Claude only read files. Nothing is changed yet.',
      respond: [
        { think: 1200, label: 'Planning' },
        { tool: 'Read', arg: 'src/app.js', out: 'Read 94 lines' },
        { tool: 'Read', arg: 'src/storage.js', out: 'Read 31 lines' },
        {
          text: [
            "Here's my plan:",
            '1. Add a `category` field to each todo in `storage.js` (old todos get "none")',
            '2. Add a category picker next to the input in `index.html`',
            '3. Add filter buttons (All, Work, Home) in `app.js`',
            '4. Add tests for the filter in `tests/app.test.js`',
          ],
        },
      ],
      pause: false,
    },
    {
      say: `<p>The plan looks good. You want to check <b>each edit yourself</b>. Choose that.</p>`,
      menu: {
        title: 'Ready to code?',
        body: 'Claude\'s plan: categories for todos (4 steps)',
        question: 'Would you like to proceed?',
        options: ['Yes, auto-accept edits', 'Yes, manually approve edits', 'No, keep planning'],
      },
      answer: 1,
      hints: {
        0: 'That lets Claude edit without asking. You want to check **each edit** yourself.',
        2: 'The plan is good. No need to keep planning.',
      },
      hint: 'Choose "Yes, manually approve edits".',
      success: 'Plan mode is off. Claude starts on step 1 and asks before each edit.',
      respond: [{ perm: 'normal' }, { think: 600 }],
      pause: false,
    },
    {
      say: `<p>Step 1 of the plan: a <code>category</code> field. <b>Approve it.</b></p>`,
      menu: {
        title: 'Edit file',
        bodyHtml: true,
        body:
          '<span class="t-dim">src/storage.js</span>\n' +
          '<span class="t-red">- const todo = { text, done: false };</span>\n' +
          '<span class="t-green">+ const todo = { text, done: false, category: \'none\' };</span>',
        question: 'Do you want to make this edit to storage.js?',
        options: ['Yes', 'Yes, allow all edits during this session', 'No'],
      },
      answer: 0,
      hints: {
        1: 'That stops asking for the rest of the session. You chose to check each edit, so pick "Yes".',
        2: 'This is step 1 of the plan you approved. Approve it.',
      },
      hint: 'Choose "Yes".',
      success: 'The first step is in, exactly as planned.',
      respond: [{ tool: 'Update', arg: 'src/storage.js', out: 'Updated src/storage.js with 1 addition and 1 removal' }],
    },
    {
      say: `<p>Quick check.</p><p><b>What does Claude do in plan mode?</b></p>`,
      choices: [
        { text: 'Reads files and writes a plan, but doesn\'t edit your code', right: true },
        { text: 'Edits files without asking', why: 'That is accept edits mode.' },
        { text: 'Runs every command without asking', why: 'Plan mode is the careful one. Nothing changes until you approve the plan.' },
      ],
      success: 'Big task → plan mode first. Read the plan, then let Claude code.',
    },
  ],
});
