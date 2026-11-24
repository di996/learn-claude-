// Sources (checked 2026-11-24): https://code.claude.com/docs/en/permissions, https://code.claude.com/docs/en/interactive-mode
// Docs: choosing "No" without a comment stops the turn; Esc does the same. Tab on Yes/No adds a comment that Claude receives.
AD.addLesson({
  id: 'redirect',
  n: 6,
  level: 'beginner',
  title: 'Say no and redirect',
  blurb: 'Stop a suggestion you don\'t want and tell Claude what to do instead.',
  icon: '↪',
  pro: true,
  summary: 'You rejected a step you didn\'t want, told Claude what to do instead and approved the better version.',
  article: 'blog/claude-code-permissions.html',
  start: 'claude',
  steps: [
    {
      say: `<p>Ask Claude for a new feature: <code>add a due date to each todo</code></p>`,
      match: (v) => !v.startsWith('/') && /(due|deadline|date)/i.test(v),
      answer: 'add a due date to each todo',
      hints: [
        { match: /^\//, msg: 'No slash needed. Describe the feature in plain English.' },
        { match: /todo/i, msg: 'Mention the **due date**.' },
      ],
      hint: 'Ask Claude to add a **due date** to each todo.',
      successTitle: 'Request sent.',
      success: 'Claude has a plan…',
      respond: [
        { think: 900 },
        { tool: 'Read', arg: 'src/app.js', out: 'Read 93 lines' },
        { text: "I'll install a date library to handle due dates." },
      ],
      pause: false,
    },
    {
      say: `<p>Claude wants to install a new package. You'd rather keep the app free of extra libraries.</p><p><b>Say no.</b></p>`,
      menu: {
        title: 'Bash command',
        body: 'npm install date-fns\n  Install a date library',
        question: 'Do you want to proceed?',
        options: ['Yes', 'No'],
      },
      answer: 1,
      hints: {
        0: 'That installs the package. You wanted to avoid extra libraries, so choose "No".',
      },
      hint: 'Choose option 2, "No".',
      success: 'Claude stopped and waits for you. Nothing was installed.',
      respond: [{ out: 'Command rejected' }],
    },
    {
      say: `<p>Now tell Claude what you want instead, e.g. <code>no new packages, use the built-in Date</code></p>`,
      match: (v) => !v.startsWith('/') && v.split(/\s+/).length >= 3 && /(built.?in|no (new )?(packages?|librar|install)|without|instead|plain|native|Date\b|input)/i.test(v),
      answer: 'no new packages, use the built-in Date',
      hints: [
        { match: /^\//, msg: 'No slash needed. Just tell Claude in a sentence.' },
        { match: (v) => v.split(/\s+/).length < 3, msg: 'Write a full sentence, e.g. `no new packages, use the built-in Date`.' },
        { match: /(install|date-fns)/i, msg: 'You just said no to installing it. Tell Claude to do it **without** new packages.' },
      ],
      hint: 'Say what Claude should do instead: no new packages, use the built-in Date.',
      successTitle: 'Redirected.',
      success: 'Tip: on a prompt you can also move to No and press **Tab** to write the reason right there.',
      respond: [
        { think: 800 },
        { text: "Got it. I'll use a date input and JavaScript's built-in `Date`, no new packages." },
      ],
      pause: false,
    },
    {
      say: `<p>This is what you wanted. <b>Approve the edit.</b></p>`,
      menu: {
        title: 'Edit file',
        bodyHtml: true,
        body:
          '<span class="t-dim">src/app.js</span>\n' +
          '<span class="t-green">+ const due = form.due.value ? new Date(form.due.value) : null;</span>\n' +
          '<span class="t-green">+ todos.push({ text, done: false, due });</span>\n' +
          '<span class="t-red">- todos.push({ text, done: false });</span>',
        question: 'Do you want to make this edit to app.js?',
        options: ['Yes', 'Yes, allow all edits during this session', 'No'],
      },
      answer: [0, 1],
      hints: {
        2: 'This version uses the built-in `Date`, exactly what you asked for. Approve it.',
      },
      hint: 'Choose "Yes".',
      success: 'Say no, then redirect. Claude adjusts instead of starting over.',
      respond: [
        {
          tool: 'Update',
          arg: 'src/app.js',
          out: 'Updated src/app.js with 2 additions and 1 removal',
          diff: [
            ['-', '  todos.push({ text, done: false });', 21],
            ['+', '  const due = form.due.value ? new Date(form.due.value) : null;', 21],
            ['+', '  todos.push({ text, done: false, due });', 22],
          ],
        },
        { text: 'Each todo can now have a due date. No new packages.' },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>Claude suggests a step you don't want. What's the best move?</b></p>`,
      choices: [
        { text: 'Say no, then tell Claude what to do instead', right: true },
        { text: 'Say yes and fix it yourself afterwards', why: 'That means more work for you. Saying no costs nothing, and Claude adjusts.' },
        { text: 'Exit and start over', why: 'No need. Claude keeps the conversation and can change course right away.' },
      ],
      success: 'You are in charge. Claude proposes, you decide.',
    },
  ],
});
