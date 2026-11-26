// Sources (checked 2026-11-26): https://code.claude.com/docs/en/common-workflows, https://code.claude.com/docs/en/interactive-mode
// Docs: typing @ opens file path autocomplete; "@src/utils/auth.js" includes the file's content in the message.
// Replaces the old lesson 04-mention-files.js (same id, so blog links keep working). Bob removes the old file.
AD.addLesson({
  id: 'mention-files',
  n: 11,
  level: 'beginner',
  title: 'Point at a file with @',
  blurb: 'Hand Claude the exact file you mean instead of letting it search.',
  icon: '@',
  pro: true,
  summary: 'You saw Claude search on its own, then pointed it at exact files with @ and autocomplete.',
  article: 'blog/claude-code-file-mentions-and-bash-mode.html',
  start: 'claude',
  steps: [
    {
      say: `<p>First, see what Claude does on its own.</p><p>Ask: <code>where are dates formatted?</code></p>`,
      match: (v) => !v.startsWith('/') && !v.includes('@') && /date/i.test(v),
      answer: 'where are dates formatted?',
      hints: [
        { match: /^\//, msg: 'No slash needed. Just ask in plain English.' },
        { match: /@/, msg: 'Not yet. Ask without `@` first, so you can see the difference.' },
      ],
      hint: 'Ask a question about where **dates** are formatted.',
      success: 'Claude had to search the project first. That works, but takes time.',
      respond: [
        { think: 600 },
        { tool: 'Search', arg: 'pattern: "date"', out: 'Found 3 files' },
        { tool: 'Read', arg: 'src/utils.js', out: 'Read 41 lines' },
        { text: 'Dates are formatted by `formatDate()` in `src/utils.js`.' },
      ],
    },
    {
      say: `<p>When you already know the file, hand it over with <code>@</code>. The file comes with your message.</p><p>Ask: <code>explain @src/utils.js</code></p>`,
      match: (v) => /@src\/utils\.js\b/.test(v) && v.replace(/@\S+/g, '').trim().length >= 3,
      answer: 'explain @src/utils.js',
      hints: [
        { match: /@utils\.js/, msg: 'Use the path from the project folder: `@src/utils.js`.' },
        { match: /(^|\s)src\/utils\.js/, msg: 'Put `@` right before the path: `@src/utils.js`.' },
        { match: /^@src\/utils\.js\s*$/, msg: 'Add what you want, e.g. `explain @src/utils.js`.' },
        { match: /^\//, msg: 'No slash. Start with the question: `explain @src/utils.js`.' },
      ],
      hint: 'Type `explain @src/utils.js`.',
      success: 'No search this time. Claude got the file straight away.',
      respond: [
        { think: 700 },
        {
          text: [
            '`src/utils.js` has three helpers:',
            '- `formatDate(date)` turns a date into "Mon 4 Mar"',
            '- `slugify(text)` makes an id from a todo title',
            '- `isOverdue(todo)` is true when a todo is late',
          ],
        },
      ],
    },
    {
      say: `<p>Ask what <code>src/storage.js</code> saves, pointing at it with <code>@</code>.</p><p>Tip: you don't have to type the whole path. Type <code>@sto</code> and pick the file from the list.</p>`,
      match: (v) => /@src\/storage\.js\b/.test(v) && v.replace(/@\S+/g, '').trim().length >= 3,
      answer: 'what does @src/storage.js save?',
      hints: [
        { match: /@storage\.js/, msg: 'The file lives in `src`: `@src/storage.js`. Pick it from the list to get the full path.' },
        { match: /(^|\s)src\/storage\.js/, msg: 'Start the path with `@`, so the file is attached.' },
        { match: /@src\/storage\.js\s*$/, msg: 'Add a question too, e.g. `what does @src/storage.js save?`' },
      ],
      hint: 'Ask what `@src/storage.js` saves, e.g. `what does @src/storage.js save?`',
      success: 'The list after @ saves typing and avoids typos in paths.',
      respond: [
        { think: 600 },
        { text: '`src/storage.js` saves your todos in the browser (localStorage) and loads them again on start.' },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>When is <code>@</code> the better choice?</b></p>`,
      choices: [
        { text: 'When you already know which file Claude should look at', right: true },
        { text: 'When you have no idea where the code is', why: 'Then just ask. Claude can search the project for you.' },
        { text: 'When you want to run a terminal command', why: 'That is a different prefix. You will learn it soon.' },
      ],
      success: 'Know the file? Use @. Don\'t know? Ask, and Claude searches.',
    },
  ],
});
