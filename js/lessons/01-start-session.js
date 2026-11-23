AD.addLesson({
  id: 'start-session',
  n: 1,
  title: 'Start your first session',
  blurb: 'Open a project, launch Claude Code and ask it about the code.',
  icon: '▶',
  summary: 'You launched Claude Code, asked questions in plain English and exited cleanly.',
  cwd: '~',
  steps: [
    {
      say: `<p>This is a normal terminal. Claude Code always works <b>inside a project folder</b>, so first move into it.</p><p>Type <code>cd my-project</code> and press <b>Enter</b>.</p>`,
      match: /^cd\s+(\.\/)?(~\/)?my-project\/?$/,
      answer: 'cd my-project',
      hints: [
        { match: /^cd\s*$/, msg: 'Add the folder name after `cd`: `cd my-project`.' },
        { match: /my_project|myproject|my project/i, msg: 'The folder is called `my-project` – with a hyphen.' },
        { match: /^claude/, msg: 'Almost! Go into the project folder first, so Claude can see the right files.' },
        { match: /^ls/, msg: 'Good instinct to look around – but this step is about moving into the folder with `cd`.' },
      ],
      hint: 'Use the `cd` command followed by the folder name.',
      success: 'The prompt now shows `~/my-project` – you are inside the project.',
      respond: [{ cwd: '~/my-project' }],
    },
    {
      say: `<p>Now start Claude Code. The command is simply the tool's name.</p><p>Type <code>claude</code> and press <b>Enter</b>.</p>`,
      match: /^claude$/,
      answer: 'claude',
      hints: [
        { match: /^claude[- ]?code/i, msg: 'Close! The command is just `claude`.' },
        { match: /^Claude$/, msg: 'Terminal commands are case-sensitive. Use lowercase: `claude`.' },
        { match: /^npm|^npx|^brew/, msg: 'Claude Code is already installed here. Just run `claude`.' },
      ],
      hint: 'Type the word `claude` (lowercase) and press Enter.',
      success: 'Claude Code is running. The box at the bottom is where you talk to it.',
      respond: [{ launch: true }],
    },
    {
      say: `<p>You never have to explain a codebase to Claude – it can read the files itself. Just ask in plain English.</p><p>Ask what this project does, e.g. <code>what does this project do?</code></p>`,
      match: (v) => !v.startsWith('/') && /\b(what|explain|describe|overview|summar|tell me|how does)/i.test(v) && v.split(/\s+/).length >= 3,
      answer: 'what does this project do?',
      hints: [
        { match: /^\//, msg: 'Lines starting with `/` are commands. Here you just type a normal question.' },
        { match: (v) => v.split(/\s+/).length < 3, msg: 'Write a full question – e.g. `what does this project do?`' },
      ],
      hint: 'Ask a question about the project, starting with "what" or "explain".',
      success: 'Watch the **⏺** lines – each one is a tool Claude decided to use.',
      respond: [
        { think: 1100, label: 'Thinking' },
        { tool: 'Read', arg: 'README.md', out: 'Read 24 lines' },
        { tool: 'Read', arg: 'package.json', out: 'Read 19 lines' },
        { tool: 'Read', arg: 'src/app.js', out: 'Read 88 lines' },
        {
          text: [
            'This is a small **to-do list web app** written in plain JavaScript.',
            '',
            '- `src/app.js` – renders the list and handles adding, ticking and deleting todos',
            '- `src/utils.js` – helpers like `formatDate()` and `slugify()`',
            '- `src/storage.js` – saves todos in the browser\'s localStorage',
            '- `tests/` – unit tests, run with `npm test`',
          ],
        },
      ],
    },
    {
      say: `<p>Claude read three files on its own before answering. That's the big difference from a normal chatbot.</p><p>Ask a follow-up: <b>which file handles saving the todos?</b></p>`,
      match: (v) => !v.startsWith('/') && /(sav|stor|persist|local ?storage|keep)/i.test(v),
      answer: 'which file handles saving the todos?',
      hints: [{ match: /^\//, msg: 'Just type a normal question – no `/` needed.' }],
      hint: 'Ask about **saving** or **storing** the todos.',
      success: 'Claude searched the codebase instead of guessing.',
      respond: [
        { think: 800 },
        { tool: 'Search', arg: 'pattern: "localStorage"', out: 'Found 2 files' },
        {
          text: [
            'Saving happens in `src/storage.js`. It exposes `loadTodos()` and `saveTodos(todos)`, which read and write a JSON string under the key `"todos"`.',
            '`src/app.js` calls `saveTodos()` after every change.',
          ],
        },
      ],
    },
    {
      say: `<p>Done for now. Leave Claude Code and return to your normal terminal.</p><p>Type <code>/exit</code> and press Enter.</p>`,
      match: /^\/(exit|quit)$/,
      answer: '/exit',
      hints: [
        { match: /^(exit|quit|bye)$/i, msg: 'Inside Claude Code, commands start with a slash: `/exit`.' },
        { match: /^\/ex/, msg: 'Check the spelling – it is `/exit`.' },
      ],
      hint: 'Commands inside Claude Code start with `/`. Try `/exit`.',
      success: 'Tip: pressing **Ctrl+C twice** also exits.',
      respond: [{ exit: true }],
    },
    {
      say: `<p>Quick check before you go.</p><p><b>Why did you run <code>cd my-project</code> before <code>claude</code>?</b></p>`,
      choices: [
        { text: 'Claude Code works on the files in the folder you start it from', right: true },
        { text: 'Because `claude` only works in folders called my-project', why: 'Any folder name works – what matters is starting Claude in the project you want it to work on.' },
        { text: 'It makes Claude respond faster', why: 'Speed isn\'t the reason. Think about which files Claude can see.' },
      ],
      success: 'Always launch Claude from the root of the project you want help with.',
    },
  ],
});
