// Sources (checked 2026-11-24): https://code.claude.com/docs/en/permissions, https://code.claude.com/docs/en/quickstart
// Note: menu options follow the permission prompt shown in the permissions docs ("Yes", "Yes, and don't ask again for: npm test *", "No").
// Not every prompt shows every option. Esc declines the action.
AD.addLesson({
  id: 'allow-commands',
  n: 5,
  level: 'beginner',
  title: 'Allow or reject a command',
  pro: true,
  blurb: 'Let Claude run safe commands and stop the risky ones.',
  icon: '$',
  summary: 'You allowed npm test for good and stopped a command that would have deleted your tests.',
  article: 'blog/claude-code-permissions.html',
  start: 'claude',
  steps: [
    {
      say: `<p>Claude also asks before running <b>commands</b> in your terminal.</p><p>Ask it to run the tests, e.g. <code>run the tests</code></p>`,
      match: (v) => !v.startsWith('/') && /test/i.test(v) && /(run|check|execute|start)/i.test(v),
      answer: 'run the tests',
      hints: [
        { match: /^\//, msg: 'No slash needed. Just ask in plain English.' },
        { match: /^npm test$/, msg: 'Inside Claude Code you ask in plain English. Claude will run `npm test` for you.' },
        { match: /test/i, msg: 'Ask Claude to **run** the tests.' },
      ],
      hint: 'Ask Claude to **run** the **tests**.',
      successTitle: 'Request sent.',
      success: 'Claude wants to run a command…',
      respond: [{ think: 700 }, { text: "I'll run the test suite." }],
      pause: false,
    },
    {
      say: `<p><code>npm test</code> only runs tests. It's safe, and you'll want it often.</p><p>Allow it <b>and don't ask again</b>.</p>`,
      menu: {
        title: 'Bash command',
        body: 'npm test\n  Run the test suite',
        question: 'Do you want to proceed?',
        options: ['Yes', "Yes, and don't ask again for: npm test *", 'No'],
      },
      answer: 1,
      hints: {
        0: 'That runs it once. The task says **don\'t ask again**, which is option 2.',
        2: '`npm test` only runs tests. It is safe, so allow it.',
      },
      hint: 'Pick the option that says "don\'t ask again".',
      success: 'Claude saves this as a rule for the project. It will not ask about `npm test` here again.',
      respond: [
        { tool: 'Bash', arg: 'npm test', out: ['PASS tests/utils.test.js', 'PASS tests/app.test.js', 'Tests: 12 passed, 12 total'] },
        { text: 'All 12 tests pass.' },
      ],
    },
    {
      say: `<p>Now see what happens with a bad idea.</p><p>Ask Claude to <code>delete the tests folder</code>.</p>`,
      match: (v) => !v.startsWith('/') && /(delete|remove|\brm\b|get rid)/i.test(v) && /test/i.test(v),
      answer: 'delete the tests folder',
      hints: [{ match: /^\//, msg: 'No slash needed. Just ask in plain English.' }],
      hint: 'Ask Claude to **delete** the **tests** folder.',
      successTitle: 'Sent.',
      success: 'Watch what Claude wants to run…',
      respond: [{ think: 700 }, { text: "I'll remove the `tests/` folder." }],
      pause: false,
    },
    {
      say: `<p>Claude wants to run <code>rm -rf tests</code>. That deletes your tests for good.</p><p><b>Say no.</b></p>`,
      menu: {
        title: 'Bash command',
        body: 'rm -rf tests\n  Remove the tests folder',
        question: 'Do you want to proceed?',
        options: ['Yes', 'No'],
      },
      answer: 1,
      hints: {
        0: 'Careful. That would delete all your tests for good. Choose "No".',
      },
      hint: 'Choose option 2, "No".',
      success: 'Nothing was deleted. Saying no is always safe, and Claude waits for new instructions. In real Claude Code, Esc also says no.',
      respond: [{ out: 'Command rejected' }],
    },
    {
      say: `<p>Quick check.</p><p><b>Which command is a good fit for "don't ask again"?</b></p>`,
      choices: [
        { text: '`npm test`: safe, and you run it often', right: true },
        { text: '`rm -rf tests`: it saves time', why: '`rm -rf` deletes files for good. You want to be asked every time.' },
        { text: 'Every command, so Claude never stops to ask', why: 'Then Claude could also run risky commands without you seeing them first.' },
      ],
      success: 'Allow safe, frequent commands. Keep being asked about anything that deletes or changes a lot.',
    },
  ],
});
