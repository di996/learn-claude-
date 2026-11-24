// Sources (checked 2026-11-24): https://code.claude.com/docs/en/quickstart, https://code.claude.com/docs/en/cli-reference, https://code.claude.com/docs/en/common-workflows, https://code.claude.com/docs/en/interactive-mode
AD.addLesson({
  id: 'exit-continue',
  n: 3,
  level: 'beginner',
  title: 'Exit and pick up again',
  blurb: 'Leave Claude Code and continue your last conversation later.',
  icon: '↺',
  summary: 'You exited Claude Code and continued the same conversation with claude --continue.',
  article: 'blog/claude-code-context-and-sessions.html',
  start: 'claude',
  steps: [
    {
      before: [
        { user: 'what does this project do?' },
        { text: 'This is a small **to-do list web app**. The main code is in `src/app.js`, and todos are saved by `src/storage.js`.' },
      ],
      say: `<p>You have been chatting with Claude about the project. Time for a break.</p><p>Leave Claude Code: type <code>/exit</code> and press Enter.</p>`,
      match: /^\/(exit|quit)$/,
      answer: '/exit',
      hints: [
        { match: /^(exit|quit|bye)$/i, msg: 'Inside Claude Code, commands start with a slash: `/exit`.' },
        { match: /^\/ex/, msg: 'Check the spelling: `/exit`.' },
      ],
      hint: 'Commands inside Claude Code start with `/`. Try `/exit`.',
      success: 'You are back in the normal terminal. Tip: pressing **Ctrl+D twice** also exits.',
      respond: [{ exit: true }],
    },
    {
      say: `<p>Later, you want to continue where you left off. Plain <code>claude</code> would start a <b>new</b> conversation.</p><p>Type <code>claude --continue</code> to reopen the last one.</p>`,
      match: /^claude\s+(--continue|-c)$/,
      answer: 'claude --continue',
      hints: [
        { match: /^claude$/, msg: 'That starts a fresh conversation. Add `--continue` to reopen the last one.' },
        { match: /^claude\s+-?continue$/, msg: 'Use two dashes: `claude --continue`.' },
        { match: /^\/continue/, msg: 'You are in the normal terminal now, not inside Claude. Type `claude --continue`.' },
        { match: /^claude\s+--contin/, msg: 'Check the spelling: `--continue`.' },
      ],
      hint: 'Type `claude`, a space, two dashes and `continue`.',
      success: 'Your earlier conversation is back. Short version: `claude -c`.',
      respond: [
        { launch: true },
        { user: 'what does this project do?' },
        { text: 'This is a small **to-do list web app**. The main code is in `src/app.js`, and todos are saved by `src/storage.js`.', delay: 0 },
      ],
    },
    {
      say: `<p>Claude still remembers the conversation. Test it with a question that only makes sense if it does.</p><p>Ask: <code>which of those files should I read first?</code></p>`,
      match: (v) => !v.startsWith('/') && v.split(/\s+/).length >= 3 && /\b(those|them|these)\b/i.test(v) && /(first|start|begin|read)/i.test(v),
      answer: 'which of those files should I read first?',
      hints: [
        { match: /^\//, msg: 'No slash needed. Just ask the question.' },
        { match: /what does this project do/i, msg: 'Claude already answered that. Ask which of **those** files to read first.' },
        { match: (v) => !/\b(those|them|these)\b/i.test(v), msg: 'Refer back to the earlier answer with **those**, e.g. `which of those files should I read first?`' },
        { match: (v) => v.split(/\s+/).length < 3, msg: 'Write a full question, e.g. `which of those files should I read first?`' },
      ],
      hint: 'Ask which of **those** files to read first.',
      success: 'Claude knew what "those files" meant, because the conversation continued.',
      respond: [
        { think: 700 },
        { text: 'Start with `src/app.js`. As I mentioned, it holds the main logic. Then look at `src/storage.js` to see how todos are saved.' },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>You come back tomorrow and want yesterday's conversation. What do you type in the terminal?</b></p>`,
      choices: [
        { text: '`claude --continue`', right: true },
        { text: '`claude`', why: 'Plain `claude` starts a new, empty conversation.' },
        { text: '`/exit`', why: '`/exit` leaves Claude Code. It does not bring anything back.' },
      ],
      success: '`claude --continue` reopens the latest conversation in that folder.',
    },
  ],
});
