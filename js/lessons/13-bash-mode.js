// Sources (checked 2026-11-26): https://code.claude.com/docs/en/interactive-mode
// Docs (shell mode with ! prefix): "Run a command directly, add its output to the session, and have Claude respond to it".
// "Claude responds to the command output automatically"; it doesn't require Claude to approve the command.
AD.addLesson({
  id: 'bash-mode',
  n: 13,
  level: 'beginner',
  title: 'Run a command yourself with !',
  blurb: 'Run a terminal command without leaving Claude. Claude sees the output.',
  icon: '!',
  pro: true,
  summary: 'You ran git status and the tests yourself with !, let Claude fix the failing test and checked the fix.',
  article: 'blog/claude-code-file-mentions-and-bash-mode.html',
  start: 'claude',
  steps: [
    {
      say: `<p>Start a message with <code>!</code> and it runs as a terminal command. You see the output, and so does Claude.</p><p>Run <code>!git status</code></p>`,
      match: /^!\s*git status$/,
      answer: '!git status',
      hints: [
        { match: /^git status$/, msg: 'Put `!` in front so it runs as a command: `!git status`.' },
        { match: /^\/git/, msg: '`/` is for Claude Code\'s own commands. Terminal commands start with `!`.' },
        { match: /^!\s*git\s*stat?u?s?$/, msg: 'Check the spelling: `!git status`.' },
      ],
      hint: 'Type `!git status`.',
      success: 'The command ran right away. No approval needed, because you ran it yourself.',
      respond: [
        { shell: 'On branch main\nChanges not staged for commit:\n  modified:   tests/utils.test.js' },
        { think: 400 },
        { text: 'You have one changed file: the new `isOverdue` tests.' },
      ],
    },
    {
      say: `<p>Run the tests yourself: <code>!npm test</code></p>`,
      match: /^!\s*npm (run )?test$/,
      answer: '!npm test',
      hints: [
        { match: /^npm (run )?test$/, msg: 'Start with `!` so it runs as a command: `!npm test`.' },
        { match: /^\/npm|^\/test/, msg: 'Terminal commands start with `!`, not `/`.' },
        { match: /^!\s*npm tests$/, msg: 'It is `test`, without an s: `!npm test`.' },
      ],
      hint: 'Type `!npm test`.',
      success: 'Claude read the output and spotted the problem by itself.',
      respond: [
        { shell: 'FAIL  tests/utils.test.js\n  ✕ isOverdue: yesterday is late\n  ✓ isOverdue: tomorrow is not late\nTests: 1 failed, 11 passed' },
        { think: 600 },
        { text: 'One test fails: `isOverdue` returns `false` for yesterday. It compares the dates the wrong way round.' },
      ],
    },
    {
      say: `<p>Now let Claude do the work. Ask it to <b>fix the failing test</b>.</p>`,
      match: (v) => !v.startsWith('!') && !v.startsWith('/') && /(fix|repair|solve)/i.test(v),
      answer: 'fix the failing test',
      hints: [
        { match: /^!/, msg: 'No `!` this time. You are asking Claude, not running a command.' },
        { match: /^\//, msg: 'No slash needed. Ask in plain English.' },
        { match: (v) => !/(fix|repair|solve)/i.test(v), msg: 'Say what you want: ask Claude to **fix** the failing test.' },
      ],
      hint: 'Ask Claude to **fix** the failing test.',
      successTitle: 'Request sent.',
      success: 'Claude wants to change src/utils.js…',
      respond: [{ think: 700 }, { tool: 'Read', arg: 'src/utils.js', out: 'Read 41 lines' }],
      pause: false,
    },
    {
      say: `<p>The comparison sign was the wrong way round. <b>Approve the fix.</b></p>`,
      menu: {
        title: 'Edit file',
        bodyHtml: true,
        body:
          '<span class="t-dim">src/utils.js</span>\n' +
          '  export function isOverdue(todo) {\n' +
          '<span class="t-red">-   return todo.due > new Date();</span>\n' +
          '<span class="t-green">+   return todo.due < new Date();</span>\n' +
          '  }',
        question: 'Do you want to make this edit to utils.js?',
        options: ['Yes', 'Yes, allow all edits during this session', 'No'],
      },
      answer: [0, 1],
      hints: {
        2: 'This is the one-character fix for the failing test. Approve it.',
      },
      hint: 'Choose "Yes".',
      success: 'Fixed. But don\'t just trust it. Check it.',
      respond: [{ tool: 'Update', arg: 'src/utils.js', out: 'Updated src/utils.js with 1 addition and 1 removal' }],
    },
    {
      say: `<p>Check the fix yourself: run the tests again.</p>`,
      match: /^!\s*npm (run )?test$/,
      answer: '!npm test',
      hints: [
        { match: /^npm (run )?test$/, msg: 'Start with `!` so it runs as a command.' },
        { match: /^\//, msg: 'Terminal commands start with `!`, not `/`.' },
        { match: /^!\s*git/, msg: 'That shows changed files. You want to run the **tests**.' },
        { match: (v) => !v.startsWith('!'), msg: 'Run the test command yourself, with `!` in front.' },
      ],
      hint: 'Run the tests the same way as before: `!` and then the test command.',
      success: 'All green. You ran it, Claude fixed it, you checked it.',
      respond: [
        { shell: 'PASS  tests/utils.test.js\nTests: 12 passed' },
        { think: 300 },
        { text: 'All 12 tests pass now.' },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>Which one runs a terminal command, like <code>git status</code>?</b></p>`,
      choices: [
        { text: '`!git status`', right: true },
        { text: '`/git status`', why: '`/` opens Claude Code\'s own commands, like `/clear` or `/help`.' },
        { text: '`@git status`', why: '`@` points at a file or folder.' },
      ],
      success: '`!` runs a command. `@` points at a file. `/` is a Claude Code command.',
    },
  ],
});
