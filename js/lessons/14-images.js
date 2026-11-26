// Sources (checked 2026-11-26): https://code.claude.com/docs/en/common-workflows, https://code.claude.com/docs/en/interactive-mode
// Docs ("Work with images"): drag and drop an image; paste with Ctrl+V (Alt+V on Windows/WSL);
// or "Provide an image path to Claude". Shortcut table: "Ctrl+V or Cmd+V (iTerm2)" pastes an image.
// The simulator cannot paste or drop images, so the exercise uses the image path.
AD.addLesson({
  id: 'images',
  n: 14,
  level: 'beginner',
  title: 'Show Claude a screenshot',
  blurb: 'Give Claude a picture of a problem instead of describing it.',
  icon: '▣',
  pro: true,
  summary: 'You gave Claude a screenshot of a bug, let it find the cause and approved the fix.',
  start: 'claude',
  steps: [
    {
      type: 'info',
      say: `<p>Sometimes a picture says it faster. Claude Code can read images, like a screenshot of a bug.</p><p>Three ways: <b>drag</b> the image into the terminal, <b>paste</b> it with <kbd>Ctrl</kbd>+<kbd>V</kbd>, or <b>type its path</b> in your message.</p>`,
      button: 'Got it',
    },
    {
      say: `<p>On your phone, the Clear button covers the list. Your screenshot is at <code>~/Desktop/bug.png</code>.</p><p>Ask what's wrong, with the path in your message.</p>`,
      match: (v) => !v.startsWith('/') && /~\/Desktop\/bug\.png\b/.test(v) && v.replace(/@?~\/Desktop\/bug\.png/, '').trim().length >= 3,
      answer: "what's wrong in this screenshot? ~/Desktop/bug.png",
      hints: [
        { match: /(^|[\s@])bug\.png/, msg: 'Use the full path, so Claude can find it: `~/Desktop/bug.png`.' },
        { match: /desktop\/bug/, msg: 'Desktop has a capital D: `~/Desktop/bug.png`.' },
        { match: /^@?~\/Desktop\/bug\.png\s*$/, msg: 'Add a question too, e.g. `what\'s wrong in this screenshot? ~/Desktop/bug.png`.' },
        { match: /^\//, msg: 'No slash. Ask your question and add the path.' },
      ],
      hint: 'Ask what is wrong, and include `~/Desktop/bug.png`.',
      success: 'Claude looked at the picture and found the cause.',
      respond: [
        { think: 600 },
        { tool: 'Read', arg: '~/Desktop/bug.png', out: 'Read image' },
        { tool: 'Read', arg: 'src/styles.css', out: 'Read 64 lines' },
        { text: 'The screenshot shows the **Clear** button on top of the last todo. It has `position: fixed`, so on small screens it covers the list.' },
      ],
    },
    {
      say: `<p>Ask Claude to <b>fix it</b>.</p>`,
      match: (v) => !v.startsWith('/') && /(fix|repair|solve|change)/i.test(v),
      answer: 'fix it',
      hints: [
        { match: /^\//, msg: 'No slash needed. Ask in plain English.' },
        { match: /^!/, msg: 'No `!`. You are asking Claude, not running a command.' },
        { match: (v) => !/(fix|repair|solve|change)/i.test(v), msg: 'Say what to do: ask Claude to **fix** it.' },
      ],
      hint: 'Ask Claude to **fix** it.',
      successTitle: 'Request sent.',
      success: 'Claude wants to change src/styles.css…',
      respond: [{ think: 700 }],
      pause: false,
    },
    {
      say: `<p>The button moves below the list instead of floating on top. <b>Approve it.</b></p>`,
      menu: {
        title: 'Edit file',
        bodyHtml: true,
        body:
          '<span class="t-dim">src/styles.css</span>\n' +
          '  .clear-btn {\n' +
          '<span class="t-red">-   position: fixed;</span>\n' +
          '<span class="t-red">-   bottom: 16px;</span>\n' +
          '<span class="t-green">+   margin-top: 16px;</span>\n' +
          '  }',
        question: 'Do you want to make this edit to styles.css?',
        options: ['Yes', 'Yes, allow all edits during this session', 'No'],
      },
      answer: [0, 1],
      hints: {
        2: 'This fixes the bug from your screenshot. Approve it.',
      },
      hint: 'Choose "Yes".',
      success: 'Fixed, without you having to explain the layout in words.',
      respond: [{ tool: 'Update', arg: 'src/styles.css', out: 'Updated src/styles.css with 1 addition and 2 removals' }],
    },
    {
      say: `<p>Quick check.</p><p><b>You copied a screenshot. How do you paste it into Claude Code?</b></p>`,
      choices: [
        { text: '`Ctrl+V`', right: true },
        { text: 'You can\'t. Describe it in words instead', why: 'Claude Code reads images: paste, drag it in or type its path.' },
        { text: 'Type `/paste`', why: 'There is no such command. Images are pasted with `Ctrl+V`.' },
      ],
      success: 'Paste with Ctrl+V (Alt+V on Windows), drag it in, or type the path.',
    },
  ],
});
