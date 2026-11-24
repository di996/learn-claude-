// Sources (checked 2026-11-24): https://code.claude.com/docs/en/commands, https://code.claude.com/docs/en/interactive-mode
// Docs: /clear "Start a new conversation with empty context." Aliases: /reset, /new. The previous conversation can be resumed later.
AD.addLesson({
  id: 'clear',
  n: 8,
  level: 'beginner',
  title: 'Start fresh with /clear',
  blurb: 'Clear the conversation when you switch to a new task.',
  icon: '⌫',
  pro: true,
  summary: 'You cleared the conversation, saw Claude start with an empty context and began a new task.',
  article: 'blog/claude-code-slash-commands-and-claude-md.html',
  start: 'claude',
  steps: [
    {
      before: [
        { user: 'add a button that clears completed todos' },
        { tool: 'Update', arg: 'src/app.js', out: 'Updated src/app.js with 5 additions' },
        { text: 'Done. The **Clear completed** button works and all tests pass.' },
      ],
      say: `<p>The button is done. Your next task is <b>unrelated</b>: the README. The old conversation would only get in the way.</p><p>Start a new conversation with <code>/clear</code>.</p>`,
      match: /^\/(clear|reset|new)$/,
      answer: '/clear',
      hints: [
        { match: /^clear$/i, msg: 'Inside Claude Code it needs a slash: `/clear`.' },
        { match: /^\/exit$/, msg: '`/exit` leaves Claude Code. `/clear` keeps you inside with a fresh conversation.' },
        { match: /^\/cl/, msg: 'Check the spelling: `/clear`.' },
      ],
      hint: 'The command is `/clear`.',
      success: 'New conversation, empty context. You are still in the same project.',
      respond: [{ wait: 300 }, { clear: true }, { launch: true, instant: true }],
    },
    {
      say: `<p>Check that it worked. Ask Claude <code>what did we just change?</code></p>`,
      match: (v) => !v.startsWith('/') && v.split(/\s+/).length >= 3 && /(what|which|did|change|last|before|earlier)/i.test(v),
      answer: 'what did we just change?',
      hints: [
        { match: /^\//, msg: 'No slash needed. Ask a normal question.' },
        { match: (v) => v.split(/\s+/).length < 3, msg: 'Write a full question, e.g. `what did we just change?`' },
      ],
      hint: 'Ask what you just changed.',
      success: 'Claude does not remember the button. That is exactly what /clear does.',
      respond: [
        { think: 600 },
        { text: "This is a new conversation, so I don't know what was changed before. I can look at the files or the git history if you want." },
      ],
    },
    {
      say: `<p>Good, a clean start. Begin the new task: ask Claude to <code>add a "How to run" section to README.md</code></p>`,
      match: (v) => !v.startsWith('/') && /readme/i.test(v),
      answer: 'add a "How to run" section to README.md',
      hints: [
        { match: /^\//, msg: 'No slash needed. Describe the task.' },
        { match: (v) => !/readme/i.test(v), msg: 'Name the file: **README.md**.' },
      ],
      hint: 'Ask Claude to add a section to **README.md**.',
      success: 'A fresh conversation for a fresh task keeps Claude focused.',
      respond: [
        { think: 800 },
        { tool: 'Read', arg: 'package.json', out: 'Read 19 lines' },
        { tool: 'Read', arg: 'README.md', out: 'Read 24 lines' },
        { text: 'I\'ll add a **How to run** section with `npm install`, `npm start` and `npm test`.' },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>When should you use <code>/clear</code>?</b></p>`,
      choices: [
        { text: 'When you start a new task that has nothing to do with the last one', right: true },
        { text: 'When you want to continue yesterday\'s work', why: 'Then you want the old conversation back. That is `claude --continue`.' },
        { text: 'When you want to leave Claude Code', why: 'That is `/exit`. `/clear` keeps you inside with a fresh conversation.' },
      ],
      success: 'New task → `/clear`. Same task tomorrow → `claude --continue`.',
    },
  ],
});
