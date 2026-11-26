// Sources (checked 2026-11-26): https://code.claude.com/docs/en/checkpointing, https://code.claude.com/docs/en/interactive-mode
// Docs: "Run /rewind, or press Esc twice when the prompt input is empty, to open the rewind menu."
// Menu actions: "Restore code and conversation", "Restore conversation", "Restore code", "Summarize from here", "Never mind".
// "A file that only Bash commands changed isn't tracked and stays as it is."
// The simulator cannot press Esc twice, so the exercise uses /rewind. The menu layout is simplified.
AD.addLesson({
  id: 'rewind',
  n: 16,
  level: 'beginner',
  title: 'Undo with /rewind',
  blurb: 'Roll back Claude\'s changes and the conversation to an earlier point.',
  icon: '⟲',
  pro: true,
  summary: 'You rewound Claude\'s changes and the conversation to before your last request.',
  start: 'claude',
  steps: [
    {
      before: [
        { user: 'what does this project do?' },
        { text: 'This is a small **to-do list web app**. The main code is in `src/app.js`.' },
      ],
      say: `<p>Ask Claude to <code>make the Add button bigger</code>.</p>`,
      match: (v) => !v.startsWith('/') && !v.startsWith('!') && /(bigger|larger|size)/i.test(v),
      answer: 'make the Add button bigger',
      hints: [
        { match: /^\//, msg: 'No slash needed. Ask in plain English.' },
        { match: /^!/, msg: 'No `!`. You are asking Claude, not running a command.' },
        { match: (v) => !/(bigger|larger|size)/i.test(v), msg: 'Say what you want: the Add button **bigger**.' },
      ],
      hint: 'Ask Claude to make the Add button **bigger**.',
      success: 'Claude did more than you asked: it also renamed the button. You want all of it gone.',
      respond: [
        { think: 600 },
        { tool: 'Update', arg: 'src/styles.css', out: 'Updated src/styles.css with 2 additions' },
        { tool: 'Update', arg: 'src/index.html', out: 'Updated src/index.html with 1 addition and 1 removal' },
        { text: 'The Add button is bigger. I also renamed it to **Create task**, which reads better.' },
      ],
    },
    {
      say: `<p>Go back to before that request. Type <code>/rewind</code>.</p><p>Tip: pressing <kbd>Esc</kbd> twice on an empty prompt opens the same menu.</p>`,
      match: /^\/(rewind|undo)$/,
      answer: '/rewind',
      hints: [
        { match: /^rewind$/i, msg: 'Claude Code commands start with a slash: `/rewind`.' },
        { match: /^\/(rewnd|rewid|rewin|reiwnd)$/, msg: 'Check the spelling: `/rewind`.' },
        { match: /^\/clear$/, msg: '`/clear` empties the conversation, but the file changes stay. Use `/rewind`.' },
        { match: /^(undo|change it back)/i, msg: 'You could ask Claude, but `/rewind` puts the files back exactly as they were.' },
      ],
      hint: 'Type `/rewind`.',
      successTitle: 'Rewind.',
      success: 'Pick the point to go back to.',
      pause: false,
    },
    {
      say: `<p>Each of your messages is a point you can go back to. Pick the one where you asked for a bigger button.</p>`,
      menu: {
        title: 'Rewind',
        question: 'Restore to the point before this message:',
        options: ['> what does this project do?', '> make the Add button bigger'],
      },
      answer: 1,
      hints: {
        0: 'That goes back further than you need. Pick the message about the **bigger button**.',
      },
      hint: 'Pick "make the Add button bigger".',
      success: 'Now choose what to restore.',
      pause: false,
    },
    {
      say: `<p>You want the files back <b>and</b> the conversation. Choose that.</p>`,
      menu: {
        title: 'Rewind',
        question: 'What do you want to restore?',
        options: ['Restore code and conversation', 'Restore conversation', 'Restore code', 'Summarize from here', 'Never mind'],
      },
      answer: 0,
      hints: {
        1: 'That rewinds the chat, but keeps the changed files. You want the code back too.',
        2: 'That restores the files, but Claude would still remember renaming the button. Restore both.',
        3: 'That shortens the conversation. It does not undo the file changes.',
        4: 'That closes the menu without undoing anything.',
      },
      hint: 'Choose "Restore code and conversation".',
      success: 'Both files are back as they were, and the conversation is back to before your request.',
      respond: [{ out: 'Restored the code and conversation' }],
    },
    {
      say: `<p>Quick check.</p><p><b>Claude deleted a file with the terminal command <code>rm</code>. Can <code>/rewind</code> bring it back?</b></p>`,
      choices: [
        { text: 'No. Files changed only by terminal commands are not tracked', right: true },
        { text: 'Yes. /rewind undoes everything', why: 'It undoes Claude\'s file edits, but not files changed only by terminal commands.' },
        { text: 'Yes, with /clear', why: '`/clear` only empties the conversation. It never brings files back.' },
      ],
      success: '/rewind undoes Claude\'s edits. For everything else, use git.',
    },
  ],
});
