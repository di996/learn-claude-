// Sources (checked 2026-11-24): https://code.claude.com/docs/en/quickstart, https://code.claude.com/docs/en/common-workflows
AD.addLesson({
  id: 'ask-questions',
  n: 2,
  level: 'beginner',
  title: 'Ask about your project',
  blurb: 'Ask in plain English and let Claude read the code for you.',
  icon: '?',
  summary: 'You asked Claude about the project, and it read the files itself to answer.',
  article: 'blog/getting-started-with-claude-code.html',
  start: 'claude',
  steps: [
    {
      say: `<p>You never have to explain a codebase to Claude. It reads the files itself. Just ask in plain English.</p><p>Ask what this project does, e.g. <code>what does this project do?</code></p>`,
      match: (v) => !v.startsWith('/') && /\b(what|explain|describe|overview|summar|tell me|how does)/i.test(v) && v.split(/\s+/).length >= 3,
      answer: 'what does this project do?',
      hints: [
        { match: /^\//, msg: 'Lines starting with `/` are commands. Here you just type a normal question.' },
        { match: (v) => v.split(/\s+/).length < 3, msg: 'Write a full question, e.g. `what does this project do?`' },
      ],
      hint: 'Ask a question about the project, starting with "what" or "explain".',
      success: 'Lines with a tool name, like **Read**, show what Claude chose to do. Here it read three files.',
      respond: [
        { think: 1100, label: 'Thinking' },
        { tool: 'Read', arg: 'README.md', out: 'Read 24 lines' },
        { tool: 'Read', arg: 'package.json', out: 'Read 19 lines' },
        { tool: 'Read', arg: 'src/app.js', out: 'Read 88 lines' },
        {
          text: [
            'This is a small **to-do list web app** written in plain JavaScript.',
            '',
            '- `src/app.js` renders the list and handles adding, ticking and deleting todos',
            '- `src/utils.js` has helpers like `formatDate()` and `slugify()`',
            '- `src/storage.js` saves todos in the browser',
            '- `tests/` holds the unit tests, run with `npm test`',
          ],
        },
      ],
    },
    {
      say: `<p>Now something more specific.</p><p>Ask which <b>technologies</b> the project uses.</p>`,
      match: (v) => !v.startsWith('/') && /(tech|stack|language|framework|librar|tools?|built with|written in|depend)/i.test(v),
      answer: 'what technologies does this project use?',
      hints: [
        { match: /^\//, msg: 'No slash needed. Just ask the question.' },
        { match: /what does this project do/i, msg: 'You already asked that. This time ask about the **technologies** it uses.' },
      ],
      hint: 'Ask something like "what technologies does this project use?"',
      success: 'Claude looked in `package.json`, where JavaScript projects list their tools.',
      respond: [
        { think: 800 },
        { tool: 'Read', arg: 'package.json', out: 'Read 19 lines' },
        {
          text: [
            '- **Plain JavaScript, HTML and CSS.** No framework.',
            '- **Jest** for the tests (`npm test`).',
            '- The todos are saved with the browser\'s built-in `localStorage`.',
          ],
        },
      ],
    },
    {
      say: `<p>You can also ask where something happens.</p><p>Ask <b>which file saves the todos</b>.</p>`,
      match: (v) => !v.startsWith('/') && /(sav|stor|persist|local ?storage|keep)/i.test(v),
      answer: 'which file saves the todos?',
      hints: [
        { match: /^\//, msg: 'Just type a normal question, no `/` needed.' },
        { match: /todo/i, msg: 'Ask specifically which file **saves** the todos.' },
      ],
      hint: 'Ask about **saving** or **storing** the todos.',
      success: 'Claude searched the code instead of guessing.',
      respond: [
        { think: 800 },
        { tool: 'Search', arg: 'pattern: "localStorage"', out: 'Found 2 files' },
        {
          text: [
            'Saving happens in `src/storage.js`. It has `loadTodos()` and `saveTodos(todos)`.',
            '`src/app.js` calls `saveTodos()` after every change.',
          ],
        },
      ],
    },
    {
      say: `<p>Finally, ask Claude to <b>explain a single function</b>: <code>formatDate</code>.</p>`,
      match: (v) => !v.startsWith('/') && /format ?date/i.test(v),
      answer: 'explain what formatDate does',
      hints: [
        { match: /^\//, msg: 'No slash needed. Ask in plain English.' },
        { match: /format/i, msg: 'Name the function exactly: `formatDate`.' },
      ],
      hint: 'Ask something like "explain what formatDate does".',
      success: 'Asking about one function is a quick way to learn unfamiliar code.',
      respond: [
        { think: 700 },
        { tool: 'Read', arg: 'src/utils.js', out: 'Read 31 lines' },
        {
          text: [
            '`formatDate(date)` turns a date into short text like **"24 Nov"** for the list.',
            'It returns an empty string if no date is given.',
          ],
        },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>Did asking these questions change any of your files?</b></p>`,
      choices: [
        { text: 'No. Claude only read files to answer', right: true },
        { text: 'Yes. Claude rewrote files to understand them', why: 'Look at the tool lines: only Read and Search. Nothing was edited.' },
        { text: 'Yes. Every question is saved into README.md', why: 'Questions are not written into your files. Claude only read them.' },
      ],
      success: 'Asking is safe. Claude reads what it needs and leaves your files alone.',
    },
  ],
});
