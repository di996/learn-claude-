AD.addLesson({
  id: 'edits-permissions',
  n: 2,
  title: 'Approve edits & commands',
  blurb: 'Ask for a change, read the diff and decide what Claude may do.',
  icon: '✎',
  summary: 'You approved a single edit, allowed a safe command and rejected a risky one.',
  article: 'blog/claude-code-permissions.html',
  start: 'claude',
  steps: [
    {
      say: `<p>Claude can change your code – but by default it <b>asks before every edit</b>.</p><p>Ask it to add a feature, e.g. <code>add a button that clears completed todos</code></p>`,
      match: (v) => !v.startsWith('/') && /(clear|remove|delete|hide)/i.test(v) && /(complet|done|finish|checked|ticked)/i.test(v),
      answer: 'add a button that clears completed todos',
      hints: [
        { match: /^\//, msg: 'No slash needed – describe the change in plain English.' },
        { match: /(clear|remove|delete)/i, msg: 'Mention which todos: the **completed** ones.' },
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
      say: `<p>Claude wants to edit <code>src/app.js</code>. <b>Green lines</b> will be added, <b>red lines</b> removed.</p><p>The change looks good. Approve <b>just this one edit</b>.</p>`,
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
        options: ['Yes', 'Yes, allow all edits during this session (shift+tab)', 'No, and tell Claude what to do differently (esc)'],
      },
      answer: 0,
      hints: {
        1: 'Option 2 works too, but it lets Claude make **every** future edit without asking. For now, approve only this one.',
        2: 'Option 3 rejects the edit – but this change looks correct.',
      },
      hint: 'Choose option 1.',
      success: 'Option 1 approves only this edit. Claude will ask again next time.',
      respond: [
        {
          tool: 'Update',
          arg: 'src/app.js',
          out: 'Updated src/app.js with 6 additions',
          diff: [
            [' ', '  render();', 41],
            [' ', '}', 42],
            ['+', 'function clearCompleted() {', 43],
            ['+', '  todos = todos.filter(t => !t.done);', 44],
            ['+', '  saveTodos(todos);', 45],
            ['+', '  render();', 46],
            ['+', '}', 47],
          ],
        },
        { text: 'Now let me run the tests to make sure nothing broke.' },
      ],
      pause: false,
    },
    {
      say: `<p>Claude also asks before running <b>shell commands</b>.</p><p><code>npm test</code> is safe and you'll want it often. Allow it <b>and don't ask again</b> for this command.</p>`,
      menu: {
        title: 'Bash command',
        body: 'npm test\n  Run the test suite',
        question: 'Do you want to proceed?',
        options: ['Yes', "Yes, and don't ask again for `npm test` commands in /Users/you/my-project", 'No, and tell Claude what to do differently (esc)'],
      },
      answer: 1,
      hints: {
        0: 'That runs it once. The instruction says **don\'t ask again** – that is option 2.',
        2: '`npm test` only runs tests, it\'s safe. Allow it.',
      },
      hint: 'Pick the option that says "don\'t ask again".',
      success: 'Claude remembers this rule – `npm test` will now run without asking.',
      respond: [
        { tool: 'Bash', arg: 'npm test', out: ['PASS tests/utils.test.js', 'PASS tests/app.test.js', 'Tests: 12 passed, 12 total'] },
        { text: 'All 12 tests pass. The **Clear completed** button is ready.' },
      ],
    },
    {
      say: `<p>Now let's see what happens with a bad idea.</p><p>Ask Claude to <code>delete the tests folder</code>.</p>`,
      match: (v) => /(delete|remove|rm|get rid)/i.test(v) && /test/i.test(v),
      answer: 'delete the tests folder',
      hint: 'Ask Claude to **delete** the **tests** folder.',
      successTitle: 'Sent.',
      success: 'Let\'s see what Claude wants to do…',
      respond: [{ think: 700 }, { text: "I'll remove the `tests/` directory." }],
      pause: false,
    },
    {
      say: `<p>Claude wants to run <code>rm -rf tests</code> – that permanently deletes your tests!</p><p><b>Reject it</b> so you can tell Claude what to do instead.</p>`,
      menu: {
        title: 'Bash command',
        body: 'rm -rf tests\n  Remove the tests directory',
        question: 'Do you want to proceed?',
        options: ['Yes', "Yes, and don't ask again for `rm` commands in /Users/you/my-project", 'No, and tell Claude what to do differently (esc)'],
      },
      answer: 2,
      hints: {
        0: 'Careful! That would delete all your tests for good. Choose the "No" option.',
        1: 'Definitely not – that would let Claude run **any** `rm` command without asking!',
      },
      hint: 'Choose option 3 – or press Esc.',
      success: 'Rejecting is always safe. Nothing was deleted.',
      respond: [{ out: 'User rejected the command' }],
    },
    {
      say: `<p>After rejecting, Claude waits for directions.</p><p>Tell it what you actually want, e.g. <code>keep the tests, just skip the slow one</code></p>`,
      match: (v) => !v.startsWith('/') && v.split(/\s+/).length >= 3 && !/(delete|rm -rf|remove) (the )?tests/i.test(v),
      answer: 'keep the tests, just skip the slow one',
      hints: [{ match: /(delete|remove)/i, msg: 'Let\'s keep the tests this time! Ask for something safer.' }],
      hint: 'Write a short sentence (3+ words) telling Claude what to do instead.',
      success: 'This is the core loop: ask → review → approve or redirect.',
      respond: [
        { think: 700 },
        {
          tool: 'Update',
          arg: 'tests/app.test.js',
          out: 'Updated tests/app.test.js with 1 addition and 1 removal',
          diff: [
            ['-', "test('syncs 10,000 todos', async () => {", 58],
            ['+', "test.skip('syncs 10,000 todos', async () => {", 58],
          ],
        },
        { text: 'Kept all tests and marked the slow sync test with `test.skip`.' },
      ],
    },
  ],
});
