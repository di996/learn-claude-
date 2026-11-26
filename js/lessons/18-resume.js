// Sources (checked 2026-11-26): https://code.claude.com/docs/en/common-workflows, https://code.claude.com/docs/en/cli-reference
// Docs: "Use claude --resume to choose from a list, or /resume from inside a running session."
// --continue / -c: "Load the most recent conversation in the current directory". The session list below is simplified.
AD.addLesson({
  id: 'resume',
  n: 18,
  level: 'beginner',
  title: 'Find an old conversation',
  blurb: 'Pick an earlier conversation from a list and carry on where you left off.',
  icon: '☰',
  pro: true,
  summary: 'You left Claude Code, opened yesterday\'s conversation with claude --resume and carried on.',
  start: 'claude',
  steps: [
    {
      before: [
        { user: 'make the Add button bigger' },
        { text: 'Done. The Add button is bigger now.' },
      ],
      say: `<p>Yesterday you worked on due dates in another conversation. Today you want to go back to it.</p><p>First, leave Claude Code.</p>`,
      match: /^\/(exit|quit)$/,
      answer: '/exit',
      hints: [
        { match: /^(exit|quit|bye)$/i, msg: 'Inside Claude Code, commands start with a slash.' },
        { match: /^\/ex/, msg: 'Check the spelling: `/exit`.' },
        { match: /^\/resume/, msg: 'Not yet. Leave Claude Code first with `/exit`.' },
        { match: /^\/clear$/, msg: '`/clear` empties the conversation. You want to **leave** Claude Code.' },
      ],
      hint: 'Use the command that leaves Claude Code: `/exit`.',
      success: 'You are back in the normal terminal.',
      respond: [{ exit: true }],
    },
    {
      say: `<p><code>claude --continue</code> only opens the <b>latest</b> conversation. To choose from a list, type <code>claude --resume</code>.</p><p>Inside Claude Code, <code>/resume</code> opens the same list.</p>`,
      match: /^claude\s+(--resume|-r)$/,
      answer: 'claude --resume',
      hints: [
        { match: /^claude\s+(--continue|-c)$/, msg: 'That opens only the latest conversation, the one about the button. Use `--resume` to choose.' },
        { match: /^claude\s+-?resume$/, msg: 'Use two dashes: `claude --resume`.' },
        { match: /^\/resume/, msg: 'You are in the normal terminal now. Type `claude --resume`.' },
        { match: /^claude$/, msg: 'That starts a new conversation. Add `--resume`.' },
        { match: /^claude\s+--res/, msg: 'Check the spelling: `--resume`.' },
      ],
      hint: 'Type `claude --resume`.',
      successTitle: 'Your conversations.',
      success: 'Pick the one you want.',
      pause: false,
    },
    {
      say: `<p>Pick yesterday's conversation about <b>due dates</b>.</p>`,
      menu: {
        title: 'Resume session',
        question: 'Which conversation do you want to resume?',
        options: ['make the Add button bigger · 10 minutes ago', 'add due dates to todos · yesterday', 'what does this project do? · 3 days ago'],
      },
      answer: 1,
      hints: {
        0: 'That is today\'s conversation about the button. You want the one about **due dates**.',
        2: 'That one is from 3 days ago. You want **yesterday\'s**, about due dates.',
      },
      hint: 'Pick "add due dates to todos".',
      success: 'Yesterday\'s conversation is back, with everything Claude knew.',
      respond: [
        { launch: true },
        { user: 'add due dates to todos' },
        { text: 'Done. Todos now have an optional due date, shown next to the title.', delay: 0 },
      ],
    },
    {
      say: `<p>Carry on where you left off. Ask Claude to <code>show overdue todos in red</code>.</p>`,
      match: (v) => !v.startsWith('/') && !v.startsWith('!') && /(red|overdue|late)/i.test(v),
      answer: 'show overdue todos in red',
      hints: [
        { match: /^\//, msg: 'No slash needed. Ask in plain English.' },
        { match: /^!/, msg: 'No `!`. You are asking Claude, not running a command.' },
      ],
      hint: 'Ask Claude to show **overdue** todos in **red**.',
      success: 'Claude knew which due dates you meant, because it is the same conversation.',
      respond: [
        { think: 700 },
        { tool: 'Update', arg: 'src/styles.css', out: 'Updated src/styles.css with 1 addition', diff: [['+', '.todo.overdue { color: #b4441c; }', 44]] },
        { text: 'Overdue todos are red now. They use the due dates we added yesterday.' },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>You are inside Claude Code and want the list of old conversations without leaving. What do you type?</b></p>`,
      choices: [
        { text: '`/resume`', right: true },
        { text: '`/clear`', why: '`/clear` empties the current conversation. It does not open old ones.' },
        { text: '`claude --continue`', why: 'That is typed in the normal terminal, and it only opens the latest conversation.' },
      ],
      success: 'Latest conversation → claude --continue. Choose from a list → claude --resume, or /resume inside Claude.',
    },
  ],
});
