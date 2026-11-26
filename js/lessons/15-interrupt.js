// Sources (checked 2026-11-26): https://code.claude.com/docs/en/interactive-mode
// Docs: Esc "Stop the current response or tool call mid-turn so you can redirect"; Claude "keeps the work done so far".
// Builds on lesson 6 (say no and redirect). The full rewind (Esc Esc) comes in lesson 16.
AD.addLesson({
  id: 'interrupt',
  n: 15,
  level: 'beginner',
  title: 'Stop Claude with Esc',
  blurb: 'Stop Claude the moment it heads the wrong way, then point it the right way.',
  icon: '⏹',
  pro: true,
  summary: 'You stopped Claude mid-task with Esc and told it what you really meant.',
  article: 'blog/claude-code-context-and-sessions.html',
  start: 'claude',
  steps: [
    {
      say: `<p>Ask Claude to <code>make the todo list look nicer</code>.</p>`,
      match: (v) => !v.startsWith('/') && !v.startsWith('!') && /(nice|better|pretty|look|style)/i.test(v),
      answer: 'make the todo list look nicer',
      hints: [
        { match: /^\//, msg: 'No slash needed. Ask in plain English.' },
        { match: /^!/, msg: 'No `!`. You are asking Claude, not running a command.' },
      ],
      hint: 'Ask Claude to make the list **look nicer**.',
      successTitle: 'Request sent.',
      success: 'Watch what Claude does…',
      respond: [{ think: 500 }],
      pause: false,
    },
    {
      say: `<p>Claude is redesigning the <b>whole app</b>. You only meant the list.</p><p>Press <b>Esc</b> to stop it now.</p>`,
      during: [
        { tool: 'Read', arg: 'src/index.html', out: 'Read 38 lines', delay: 300 },
        { text: "I'll redesign the whole app: a new layout, new fonts and a dark theme.", delay: 300 },
        { tool: 'Update', arg: 'src/index.html', out: 'Updated src/index.html with 12 additions' },
        { think: Infinity, label: 'Redesigning' },
      ],
      success: 'Stopped. Claude keeps what it already did, but does nothing more.',
      respond: [{ out: 'Interrupted by user' }],
    },
    {
      say: `<p>Now tell Claude what you meant: only restyle the <b>list</b>, in <code>src/styles.css</code>.</p>`,
      match: (v) => !v.startsWith('/') && !v.startsWith('!') && /list/i.test(v),
      answer: 'only restyle the todo list in src/styles.css',
      hints: [
        { match: /^\//, msg: 'No slash needed. Tell Claude in plain English.' },
        { match: /^!/, msg: 'No `!`. You are talking to Claude, not running a command.' },
        { match: (v) => !/list/i.test(v), msg: 'Say what to change: only the **list**.' },
      ],
      hint: 'Tell Claude to only change the **list**, e.g. `only restyle the todo list in src/styles.css`.',
      success: 'Stop, then steer. Much faster than waiting for the wrong result.',
      respond: [
        { think: 700 },
        {
          tool: 'Update',
          arg: 'src/styles.css',
          out: 'Updated src/styles.css with 3 additions',
          diff: [
            ['+', '.todo { padding: 12px 0; }', 41],
            ['+', '.todo + .todo { border-top: 1px solid #e3ded2; }', 42],
            ['+', '.todo.done { color: #8b8678; }', 43],
          ],
        },
        { text: 'Only the list changed: more space between todos, thin lines between them, and grey for done items.' },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>Claude changed <code>index.html</code> before you pressed Esc. What happens to that change?</b></p>`,
      choices: [
        { text: 'It stays. Esc stops Claude but keeps what is already done', right: true },
        { text: 'It is undone automatically', why: 'Esc keeps the work done so far. To undo it, you ask Claude or rewind (next lesson).' },
        { text: 'Claude Code closes', why: 'Esc only stops the current answer. You quit with `/exit`.' },
      ],
      success: 'Esc stops right away. What was already changed stays, so check it.',
    },
  ],
});
