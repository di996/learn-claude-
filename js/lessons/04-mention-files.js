AD.addLesson({
  id: 'mention-files',
  n: 4,
  title: 'Point at files with @',
  blurb: 'Reference exact files and run shell commands without leaving Claude.',
  icon: '@',
  pro: true,
  summary: 'You attached files with @ and ran a shell command with !.',
  start: 'claude',
  steps: [
    {
      say: `<p>Instead of letting Claude search, you can hand it a file directly with <code>@</code>. Type <code>@</code> and an autocomplete list of files appears.</p><p>Ask: <code>explain @src/utils.js</code></p>`,
      match: (v) => /@src\/utils\.js\b/.test(v) && v.replace(/@\S+/g, '').trim().length >= 3,
      answer: 'explain @src/utils.js',
      hints: [
        { match: /@utils\.js/, msg: 'Use the path from the project root: `@src/utils.js`. The autocomplete helps!' },
        { match: /(^|\s)src\/utils\.js/, msg: 'Put an `@` right before the path so Claude Code attaches the file: `@src/utils.js`.' },
        { match: /^@src\/utils\.js\s*$/, msg: 'Add what you want, e.g. `explain @src/utils.js`.' },
      ],
      hint: 'Type `explain @src/utils.js` – press Tab to autocomplete the file.',
      success: 'No Read step this time – the file was attached with your message.',
      respond: [
        { think: 800 },
        {
          text: [
            '`src/utils.js` has three helpers:',
            '- `formatDate(date)` – turns a Date into "Mon 4 Mar"',
            '- `slugify(text)` – makes a URL-safe id from a todo title',
            '- `isOverdue(todo)` – true if a todo\'s due date has passed',
          ],
        },
      ],
    },
    {
      say: `<p>You can mention several files in one message.</p><p>Ask which helpers are missing tests, mentioning <code>@src/utils.js</code> <b>and</b> <code>@tests/utils.test.js</code>.</p>`,
      match: (v) => /@src\/utils\.js/.test(v) && /@tests\/utils\.test\.js/.test(v),
      answer: 'which functions in @src/utils.js are missing tests in @tests/utils.test.js?',
      hints: [
        { match: (v) => (v.match(/@/g) || []).length < 2, msg: 'Mention **both** files with `@`.' },
        { match: /@utils\.test\.js|@test\//, msg: 'The test file lives at `@tests/utils.test.js`.' },
      ],
      hint: 'Include both `@src/utils.js` and `@tests/utils.test.js`.',
      success: 'Precise context = precise answers.',
      respond: [
        { think: 900 },
        { text: ['`formatDate` and `slugify` are tested.', '**`isOverdue` has no tests.** Want me to add some?'] },
      ],
    },
    {
      say: `<p>Need to run a quick terminal command? Start with <code>!</code> to run it directly – Claude sees the output too.</p><p>Run <code>!git status</code></p>`,
      match: /^!\s*git status$/,
      answer: '!git status',
      hints: [
        { match: /^git status$/, msg: 'Put a `!` in front so it runs as a shell command: `!git status`.' },
        { match: /^\/git/, msg: '`/` is for Claude Code commands. Shell commands use `!`.' },
      ],
      hint: 'Type `!git status`.',
      success: 'Bash mode: great for quick checks without switching windows.',
      respond: [
        { tool: 'Bash', arg: 'git status', out: ['On branch main', 'Changes not staged for commit:', '  modified:   src/app.js', '  modified:   tests/app.test.js'] },
      ],
    },
    {
      say: `<p><b>When is <code>@</code> most useful?</b></p>`,
      choices: [
        { text: 'When you already know which file Claude should look at', right: true },
        { text: 'When you want Claude to run a terminal command', why: 'That is the `!` prefix.' },
        { text: 'When you want to clear the conversation', why: 'That is `/clear`.' },
      ],
      success: '`@` = file, `!` = shell, `/` = Claude Code command.',
    },
  ],
});
