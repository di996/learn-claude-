// Sources (checked 2026-11-24): https://code.claude.com/docs/en/memory, https://code.claude.com/docs/en/commands
// Docs: /init "Initialize project with a CLAUDE.md guide". CLAUDE.md is read "at the start of every session".
// /clear "starts fresh on a new task while keeping project memory".
AD.addLesson({
  id: 'init-claude-md',
  n: 9,
  level: 'beginner',
  title: 'Give Claude a memory with /init',
  blurb: 'Create CLAUDE.md, the file Claude reads at the start of every session.',
  icon: '◈',
  pro: true,
  summary: 'You created CLAUDE.md with /init and saw Claude use it after a fresh start.',
  article: 'blog/claude-code-slash-commands-and-claude-md.html',
  start: 'claude',
  steps: [
    {
      say: `<p><b>CLAUDE.md</b> is a file with notes about your project: how to run it, code style, rules. Claude reads it at the start of <i>every</i> session.</p><p>Let Claude write one with <code>/init</code>.</p>`,
      match: /^\/init$/,
      answer: '/init',
      hints: [
        { match: /^\/(inti|int|iinit|initt)$/, msg: 'Looks like a typo. It is `/init`.' },
        { match: /^init$/i, msg: 'Don\'t forget the slash: `/init`.' },
        { match: /claude\.md/i, msg: 'You could ask in words, but there is a built-in command for this: `/init`.' },
      ],
      hint: 'The command is `/init`.',
      successTitle: 'Analyzing…',
      success: 'Claude is reading the project to learn how it works.',
      respond: [
        { think: 1100, label: 'Analyzing codebase' },
        { tool: 'Read', arg: 'package.json', out: 'Read 19 lines' },
        { tool: 'Search', arg: 'pattern: "**/*.js"', out: 'Found 7 files' },
        { tool: 'Read', arg: 'README.md', out: 'Read 31 lines' },
      ],
      pause: false,
    },
    {
      say: `<p>Claude wants to create <code>CLAUDE.md</code>. Read what it wrote, then <b>approve it</b>.</p>`,
      menu: {
        title: 'Create file',
        bodyHtml: true,
        body:
          '<span class="t-dim">CLAUDE.md</span>\n' +
          '<span class="t-green">+ ## Commands</span>\n' +
          '<span class="t-green">+ - `npm test`: run the unit tests</span>\n' +
          '<span class="t-green">+ - `npm start`: serve the app</span>\n' +
          '<span class="t-green">+ ## Code style</span>\n' +
          '<span class="t-green">+ - Plain JavaScript, no frameworks</span>\n' +
          '<span class="t-green">+ - Save data only through src/storage.js</span>',
        question: 'Do you want to create CLAUDE.md?',
        options: ['Yes', 'Yes, allow all edits during this session', 'No'],
      },
      answer: [0, 1],
      hints: {
        2: 'The notes look correct, and you want Claude to remember them. Approve the file.',
      },
      hint: 'Choose "Yes".',
      success: 'CLAUDE.md is a normal text file. You can edit it any time.',
      respond: [
        { tool: 'Write', arg: 'CLAUDE.md', out: 'Wrote 9 lines to CLAUDE.md' },
        { text: 'Created `CLAUDE.md` with commands and code style notes.' },
      ],
    },
    {
      say: `<p>Now prove the memory survives a fresh start.</p><p><b>Start a new conversation</b> without leaving Claude Code.</p>`,
      match: /^\/(clear|reset|new)$/,
      answer: '/clear',
      hints: [
        { match: /^\/exit$/, msg: 'That leaves Claude Code. Use the command that starts a fresh conversation but keeps you inside.' },
        { match: /^clear$/i, msg: 'Commands start with a slash.' },
        { match: /^\/init$/, msg: 'You already made CLAUDE.md. Now start a fresh conversation (you learned it last lesson).' },
      ],
      hint: 'It is the command from the last lesson. It starts with `/cl…`.',
      success: 'Empty conversation. But CLAUDE.md is project memory, so it is loaded again.',
      respond: [{ wait: 300 }, { clear: true }, { launch: true, instant: true }],
    },
    {
      say: `<p>Ask Claude <code>how do I run the tests?</code></p>`,
      match: (v) => !v.startsWith('/') && /test/i.test(v) && v.split(/\s+/).length >= 3,
      answer: 'how do I run the tests?',
      hints: [
        { match: /^\//, msg: 'No slash needed. Ask a normal question.' },
        { match: /^npm test$/, msg: 'Ask Claude in plain English, e.g. `how do I run the tests?`' },
        { match: (v) => !/test/i.test(v), msg: 'Mention the **tests** in your question.' },
      ],
      hint: 'Ask how to run the **tests**.',
      success: 'Claude answered right away, without searching. It came from CLAUDE.md.',
      respond: [
        { think: 500 },
        { text: 'Run `npm test`. That is listed under **Commands** in your CLAUDE.md.' },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>When does Claude read CLAUDE.md?</b></p>`,
      choices: [
        { text: 'At the start of every session', right: true },
        { text: 'Only right after you run `/init`', why: '`/init` creates the file. After that, Claude reads it every time a session starts.' },
        { text: 'Only when you mention it with @', why: 'You don\'t have to mention it. Claude loads it automatically.' },
      ],
      success: 'Put things in CLAUDE.md that Claude should know every time.',
    },
  ],
});
