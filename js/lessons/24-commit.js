// Sources (checked 2026-11-26): https://code.claude.com/docs/en/quickstart, https://code.claude.com/docs/en/permissions, https://code.claude.com/docs/en/checkpointing
// Quickstart ("Use Git with Claude Code"): "commit my changes with a descriptive message", "show me the last 5 commits".
// Permissions: Bash commands need approval "except a built-in set of read-only commands" (read-only git is in that set).
// Checkpointing: checkpoints are "not a replacement for version control".
AD.addLesson({
  id: 'commit',
  n: 24,
  level: 'beginner',
  title: 'Save your work with a git commit',
  blurb: 'Let Claude write a clear commit message and save your working version.',
  icon: '◉',
  pro: true,
  summary: 'You checked your changes, let Claude commit them with a clear message and looked at the history.',
  start: 'claude',
  steps: [
    {
      say: `<p>The fix and the new test work. Save this version with git. First, see what you changed yourself: run <code>git status</code>.</p>`,
      match: /^!\s*git (status|diff)( --stat)?$/,
      answer: '!git status',
      hints: [
        { match: /^git (status|diff)/, msg: 'Remember: start with `!` to run it yourself.' },
        { match: /^\/git/, msg: 'Terminal commands start with `!`, not `/`.' },
        { match: /^!\s*git stat?u?s?$/, msg: 'Check the spelling: `!git status`.' },
      ],
      hint: 'Type `!git status`.',
      success: 'Two changed files: the fix and the test.',
      respond: [
        { shell: 'On branch main\nChanges not staged for commit:\n  modified:   src/utils.js\n  modified:   tests/utils.test.js' },
        { think: 300 },
        { text: 'Two files changed: the `countOpen` fix and its new test.' },
      ],
    },
    {
      say: `<p>Let Claude write the message. Ask: <code>commit my changes with a descriptive message</code></p>`,
      match: (v) => !v.startsWith('/') && !v.startsWith('!') && /commit/i.test(v),
      answer: 'commit my changes with a descriptive message',
      hints: [
        { match: /^!\s*git commit/, msg: 'You could, but let Claude look at the changes and write the message. Ask in plain English.' },
        { match: /^\/commit/, msg: 'No slash needed. Ask in plain English.' },
        { match: (v) => !/commit/i.test(v), msg: 'Ask Claude to **commit** your changes.' },
      ],
      hint: 'Type `commit my changes with a descriptive message`.',
      successTitle: 'Request sent.',
      success: 'Claude read the changes and wrote a message…',
      respond: [
        { think: 600 },
        { tool: 'Bash', arg: 'git diff', out: '2 files changed, 5 insertions(+), 1 deletion(-)' },
      ],
      pause: false,
    },
    {
      say: `<p>Read the message Claude wrote. It says <b>what</b> changed and <b>why</b>. A commit changes your project's history, so Claude asks first. <b>Allow it.</b></p>`,
      menu: {
        title: 'Bash command',
        body: 'git add src/utils.js tests/utils.test.js\ngit commit -m "Fix countOpen counting done todos, add test"\n  Commit the countOpen fix and its test',
        question: 'Do you want to proceed?',
        options: ['Yes', 'No'],
      },
      answer: 0,
      hints: {
        1: 'The message is clear and only your two files are included. Allow it.',
      },
      hint: 'Choose "Yes".',
      success: 'Saved. This working version is now in your git history.',
      respond: [
        { tool: 'Bash', arg: 'git commit', out: ['[main 4f2c1a9] Fix countOpen counting done todos, add test', ' 2 files changed, 5 insertions(+), 1 deletion(-)'] },
      ],
    },
    {
      say: `<p>Look at your history. Ask Claude to <code>show me the last 3 commits</code>.</p>`,
      match: (v) => !v.startsWith('/') && /(commit|history|log)/i.test(v),
      answer: 'show me the last 3 commits',
      hints: [
        { match: /^\//, msg: 'No slash needed. Ask in plain English.' },
        { match: (v) => !/(commit|history|log)/i.test(v), msg: 'Ask to see the last **commits**.' },
      ],
      hint: 'Ask Claude to `show me the last 3 commits`.',
      success: 'Reading the history is safe, so Claude didn\'t need to ask.',
      respond: [
        { tool: 'Bash', arg: 'git log --oneline -3', out: ['4f2c1a9 Fix countOpen counting done todos, add test', 'b81e0d2 Add categories to todos', '9a3f5c7 Show overdue todos in red'] },
        { text: 'Your newest commit is on top.' },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>Why commit when a change works?</b></p>`,
      choices: [
        { text: 'So you can always go back to this working version', right: true },
        { text: 'It isn\'t needed, /rewind keeps everything forever', why: '/rewind only covers Claude\'s edits. Git keeps your history for good.' },
        { text: 'It makes Claude work faster', why: 'A commit saves a version. It doesn\'t change how fast Claude works.' },
      ],
      success: 'Working change → commit. Then you can always go back.',
    },
  ],
});
