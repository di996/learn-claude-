// Sources (checked 2026-11-24): https://code.claude.com/docs/en/quickstart, https://code.claude.com/docs/en/permissions
// Note: the docs confirm that "don't ask again" for file edits lasts until the session ends. The exact menu wording is simplified.
AD.addLesson({
  id: 'edits-permissions',
  n: 4,
  level: 'beginner',
  title: 'Approve your first edit',
  blurb: 'Ask for a change, read the diff and decide how much Claude may edit.',
  icon: '✎',
  summary: 'You read a diff, approved one edit and then let Claude edit freely for the rest of the session.',
  article: 'blog/claude-code-permissions.html',
  start: 'claude',
  steps: [
    {
      say: `<p>Claude can change your code, but by default it <b>asks before every edit</b>.</p><p>Ask it to add a feature, e.g. <code>add a button that clears completed todos</code></p>`,
      match: (v) => !v.startsWith('/') && /(clear|remove|delete|hide)/i.test(v) && /(complet|done|finish|checked|ticked)/i.test(v),
      answer: 'add a button that clears completed todos',
      hints: [
        { match: /^\//, msg: 'No slash needed. Describe the change in plain English.' },
        { match: /(clear|remove|delete)/i, msg: 'Say which todos: the **completed** ones.' },
      ],
      hint: 'Ask Claude to add a button that clears **completed** todos.',
      successTitle: 'Request sent.',
      success: 'Claude is reading the code and preparing an edit…',
      respond: [
        { think: 1000 },
        { tool: 'Read', arg: 'src/app.js', out: 'Read 88 lines' },
        { text: "I'll add a `clearCompleted()` function and a button that calls it." },
      ],
      pause: false,
    },
    {
      say: `<p>Claude wants to edit <code>src/app.js</code>. <b>Green lines</b> with <b>+</b> will be added.</p><p>The change looks good. Approve <b>just this one edit</b>.</p>`,
      menu: {
        title: 'Edit file',
        bodyHtml: true,
        body:
          '<span class="t-dim">src/app.js</span>\n' +
          '<span class="t-green">+ function clearCompleted() {</span>\n' +
          '<span class="t-green">+   todos = todos.filter(t =&gt; !t.done);</span>\n' +
          '<span class="t-green">+   saveTodos(todos);</span>\n' +
          '<span class="t-green">+   render();</span>\n' +
          '<span class="t-green">+ }</span>',
        question: 'Do you want to make this edit to app.js?',
        options: ['Yes', 'Yes, allow all edits during this session', 'No'],
      },
      answer: 0,
      hints: {
        1: 'That lets Claude make **every** edit this session without asking. For now, approve only this one.',
        2: '"No" rejects the edit, but this change looks correct.',
      },
      hint: 'Choose option 1.',
      success: 'Option 1 approves only this edit. Claude will ask again next time.',
      respond: [
        {
          tool: 'Update',
          arg: 'src/app.js',
          out: 'Updated src/app.js with 5 additions',
          diff: [
            [' ', '}', 42],
            ['+', 'function clearCompleted() {', 43],
            ['+', '  todos = todos.filter(t => !t.done);', 44],
            ['+', '  saveTodos(todos);', 45],
            ['+', '  render();', 46],
            ['+', '}', 47],
          ],
        },
        { text: 'Added `clearCompleted()`. The button is wired up in `src/index.html`.' },
      ],
    },
    {
      say: `<p>Now a small style change.</p><p>Ask Claude to <code>make the clear button red</code>.</p>`,
      match: (v) => !v.startsWith('/') && /(red|colou?r)/i.test(v),
      answer: 'make the clear button red',
      hints: [
        { match: /^\//, msg: 'No slash needed. Just describe the change.' },
        { match: /(blue|green|yellow|orange|purple|pink|black)/i, msg: 'The task is to make the clear button **red**.' },
      ],
      hint: 'Ask Claude to make the button **red**.',
      successTitle: 'Request sent.',
      success: 'Claude is preparing another edit…',
      respond: [
        { think: 800 },
        { tool: 'Read', arg: 'src/styles.css', out: 'Read 64 lines' },
      ],
      pause: false,
    },
    {
      say: `<p>You trust Claude with small changes in this project. This time, let it make edits <b>for the rest of the session</b> without asking.</p>`,
      menu: {
        title: 'Edit file',
        bodyHtml: true,
        body:
          '<span class="t-dim">src/styles.css</span>\n' +
          '<span class="t-green">+ .clear-btn {</span>\n' +
          '<span class="t-green">+   background: #d64545;</span>\n' +
          '<span class="t-green">+   color: #fff;</span>\n' +
          '<span class="t-green">+ }</span>',
        question: 'Do you want to make this edit to styles.css?',
        options: ['Yes', 'Yes, allow all edits during this session', 'No'],
      },
      answer: 1,
      hints: {
        0: 'That approves only this edit. The task says: no more asking **for the rest of the session**.',
        2: 'This change is fine, so there is no reason to reject it.',
      },
      hint: 'Pick the option that mentions **this session**.',
      success: 'Notice the second edit: Claude did not ask. Commands still need your OK, and the rule ends when you exit.',
      respond: [
        {
          tool: 'Update',
          arg: 'src/styles.css',
          out: 'Updated src/styles.css with 4 additions',
          diff: [
            ['+', '.clear-btn {', 65],
            ['+', '  background: #d64545;', 66],
            ['+', '  color: #fff;', 67],
            ['+', '}', 68],
          ],
        },
        { text: "I'll add a hover color too." },
        {
          tool: 'Update',
          arg: 'src/styles.css',
          out: 'Updated src/styles.css with 3 additions',
          diff: [
            ['+', '.clear-btn:hover {', 69],
            ['+', '  background: #b83232;', 70],
            ['+', '}', 71],
          ],
        },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>What does "Yes, allow all edits during this session" do?</b></p>`,
      choices: [
        { text: 'Claude edits files without asking until you exit', right: true },
        { text: 'Claude never asks about edits again, in any project', why: 'It only lasts for this session. Next time you start Claude Code, it asks again.' },
        { text: 'Claude can also run any command without asking', why: 'It only covers file edits. Commands still need your approval.' },
      ],
      success: 'Approve one edit when you want to check each change. Allow all when you trust the task.',
    },
  ],
});
