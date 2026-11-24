// Sources (checked 2026-11-24): https://code.claude.com/docs/en/memory, https://code.claude.com/docs/en/commands
// Docs: /memory "Edit CLAUDE.md files, enable or disable auto memory, and view auto memory entries".
// Locations: ./CLAUDE.md (project, shared with the team), ~/.claude/CLAUDE.md (you, all projects), ./CLAUDE.local.md (you, this project).
// The /memory picker below is simplified (exact layout not confirmed in the docs text).
AD.addLesson({
  id: 'memory',
  n: 10,
  level: 'beginner',
  title: 'Edit memory with /memory',
  blurb: 'Open your memory files and add a rule Claude will follow.',
  icon: '✚',
  pro: true,
  summary: 'You opened your memory files with /memory, added a rule to CLAUDE.md and saw Claude follow it.',
  article: 'blog/claude-code-slash-commands-and-claude-md.html',
  start: 'claude',
  steps: [
    {
      say: `<p>Claude can have several memory files. <code>/memory</code> lets you pick one and edit it.</p><p>Run <code>/memory</code>.</p>`,
      match: /^\/memory$/,
      answer: '/memory',
      hints: [
        { match: /^\/(memroy|memmory|memeory)$/, msg: 'Check the spelling: `/memory`.' },
        { match: /^memory$/i, msg: 'Don\'t forget the slash: `/memory`.' },
        { match: /^\/init$/, msg: '`/init` creates CLAUDE.md. To open the memory files, use `/memory`.' },
      ],
      hint: 'The command is `/memory`.',
      successTitle: 'Memory files.',
      success: 'Pick which file to open.',
      pause: false,
    },
    {
      say: `<p>The rule you want is for <b>this project</b>, and your team should get it too. Pick the project's CLAUDE.md.</p>`,
      menu: {
        title: 'Memory',
        question: 'Which memory file do you want to edit?',
        options: ['Project memory  ./CLAUDE.md', 'User memory  ~/.claude/CLAUDE.md'],
      },
      answer: 0,
      hints: {
        1: 'User memory is for **you**, in every project. This rule belongs to this project, so pick ./CLAUDE.md.',
      },
      hint: 'Pick the one that starts with `./`, the project folder.',
      success: 'Now you can edit the file. Add a line, save it, and Claude follows it.',
      respond: [{ out: 'Opened ./CLAUDE.md' }],
    },
    {
      say: `<p>There's a quicker way: just ask Claude to add the rule.</p><p>Ask: <code>add to CLAUDE.md: use single quotes in JavaScript</code></p>`,
      match: (v) => !v.startsWith('/') && /single.?quote/i.test(v),
      answer: 'add to CLAUDE.md: use single quotes in JavaScript',
      hints: [
        { match: /^\//, msg: 'No slash needed. Ask Claude in plain English.' },
        { match: /double/i, msg: 'The rule is **single** quotes.' },
        { match: /claude\.md|rule|quote/i, msg: 'Say what the rule is: use **single quotes**.' },
      ],
      hint: 'Ask Claude to add a rule about **single quotes** to CLAUDE.md.',
      successTitle: 'Request sent.',
      success: 'Claude wants to edit the file…',
      respond: [{ think: 600 }, { tool: 'Read', arg: 'CLAUDE.md', out: 'Read 9 lines' }],
      pause: false,
    },
    {
      say: `<p>Check the change. <b>Approve it.</b></p>`,
      menu: {
        title: 'Edit file',
        bodyHtml: true,
        body:
          '<span class="t-dim">CLAUDE.md</span>\n' +
          '  ## Code style\n' +
          '  - Plain JavaScript, no frameworks\n' +
          '  - Save data only through src/storage.js\n' +
          '<span class="t-green">+ - Use single quotes in JavaScript</span>',
        question: 'Do you want to make this edit to CLAUDE.md?',
        options: ['Yes', 'Yes, allow all edits during this session', 'No'],
      },
      answer: [0, 1],
      hints: {
        2: 'This is the rule you asked for. Approve it.',
      },
      hint: 'Choose "Yes".',
      success: 'The rule is saved. Now test it.',
      respond: [{ tool: 'Update', arg: 'CLAUDE.md', out: 'Updated CLAUDE.md with 1 addition' }],
    },
    {
      say: `<p>Ask Claude to <code>add a function that counts open todos</code> and see if it follows the rule.</p>`,
      match: (v) => !v.startsWith('/') && /(count|number|how many)/i.test(v),
      answer: 'add a function that counts open todos',
      hints: [
        { match: /^\//, msg: 'No slash needed. Describe the function.' },
        { match: (v) => !/(count|number|how many)/i.test(v), msg: 'Say what the function does: it **counts** the open todos.' },
      ],
      hint: 'Ask for a function that **counts** the open todos.',
      success: 'Single quotes, as the rule says. Rules in CLAUDE.md guide Claude\'s answers.',
      respond: [
        { think: 800 },
        {
          tool: 'Update',
          arg: 'src/utils.js',
          out: 'Updated src/utils.js with 4 additions',
          diff: [
            ['+', 'export function countOpen(todos) {', 32],
            ['+', '  const n = todos.filter((t) => !t.done).length;', 33],
            ['+', "  return n + ' open';", 34],
            ['+', '}', 35],
          ],
        },
        { text: 'Added `countOpen()`. I used single quotes, as CLAUDE.md asks.' },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>You want a rule for yourself in <i>all</i> your projects. Which file?</b></p>`,
      choices: [
        { text: '`~/.claude/CLAUDE.md` (user memory)', right: true },
        { text: '`./CLAUDE.md` (project memory)', why: 'That file belongs to one project and is shared with your team.' },
        { text: '`README.md`', why: 'README is for people. Claude\'s memory lives in CLAUDE.md files.' },
      ],
      success: 'Project rules → ./CLAUDE.md. Your personal rules everywhere → ~/.claude/CLAUDE.md.',
    },
  ],
});
