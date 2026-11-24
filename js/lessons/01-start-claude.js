// Sources (checked 2026-11-24): https://code.claude.com/docs/en/quickstart, https://code.claude.com/docs/en/security
// Note: the docs confirm the workspace trust dialog but not its exact wording. The menu text below is simplified.
AD.addLesson({
  id: 'start-session',
  n: 1,
  level: 'beginner',
  title: 'Start Claude Code',
  blurb: 'Find your project, move into it and launch Claude Code.',
  icon: '▶',
  summary: 'You found your project, moved into it and started Claude Code there.',
  article: 'blog/getting-started-with-claude-code.html',
  cwd: '~',
  steps: [
    {
      say: `<p>This is a normal terminal. Before you start Claude Code, find your project.</p><p>Type <code>ls</code> and press <b>Enter</b> to list the folders here.</p>`,
      match: /^ls(\s+-[a-zA-Z]+)?$/,
      answer: 'ls',
      hints: [
        { match: /^dir$/i, msg: '`dir` is for Windows Command Prompt. Here it is `ls` (short for "list").' },
        { match: /^LS$|^Ls$/, msg: 'Terminal commands are case-sensitive. Use lowercase: `ls`.' },
        { match: /^cd/, msg: 'You will move into the folder next. First list what is here with `ls`.' },
        { match: /^claude/, msg: 'Not yet. First find your project with `ls`.' },
      ],
      hint: 'Type the two letters `ls` and press Enter.',
      success: 'There it is: `my-project`. That is the to-do app you will work on.',
      respond: [{ shell: 'Desktop    Documents    Downloads    my-project' }],
    },
    {
      say: `<p>Claude Code works on the folder you start it in, so move into the project first.</p><p>Type <code>cd my-project</code> and press <b>Enter</b>.</p>`,
      match: /^cd\s+(\.\/)?(~\/)?my-project\/?$/,
      answer: 'cd my-project',
      hints: [
        { match: /^cd\s*$/, msg: 'Add the folder name after `cd`: `cd my-project`.' },
        { match: /my_project|myproject|my project/i, msg: 'The folder is called `my-project`, with a hyphen.' },
        { match: /^claude/, msg: 'Almost. Move into the project folder first, so Claude sees the right files.' },
        { match: /^ls/, msg: 'You already listed the folders. Now move into one with `cd`.' },
      ],
      hint: 'Use `cd` followed by the folder name.',
      success: 'The prompt now shows `~/my-project`. You are inside the project.',
      respond: [{ cwd: '~/my-project' }],
    },
    {
      say: `<p>Now start Claude Code. The command is simply the tool's name.</p><p>Type <code>claude</code> and press <b>Enter</b>.</p>`,
      match: /^claude$/,
      answer: 'claude',
      hints: [
        { match: /^claude[- ]?code$/i, msg: 'Close. The command is just `claude`.' },
        { match: /^Claude$/, msg: 'Use lowercase: `claude`.' },
        { match: /^(npm|npx|brew|curl)/, msg: 'Claude Code is already installed here. Just run `claude`.' },
      ],
      hint: 'Type the word `claude` in lowercase and press Enter.',
      successTitle: 'Starting…',
      success: 'The first time you open a folder, Claude Code asks you something.',
      pause: false,
    },
    {
      say: `<p>Claude Code asks if you trust this folder, because it will read and work with the files in it.</p><p>It's your own project, so <b>trust it</b>.</p>`,
      menu: {
        title: 'Workspace trust',
        body: '/Users/you/my-project',
        question: 'Do you trust the files in this folder?',
        options: ['Yes, I trust this folder', 'No, exit'],
      },
      answer: 0,
      hints: {
        1: 'That closes Claude Code again. This is your own project, so it is safe to trust.',
      },
      hint: 'Choose option 1.',
      success: 'Claude Code is running. The box at the bottom is where you talk to it. Only trust folders you know.',
      respond: [{ launch: true }],
    },
    {
      say: `<p>Quick check.</p><p><b>Why did you run <code>cd my-project</code> before <code>claude</code>?</b></p>`,
      choices: [
        { text: 'Claude Code works on the files in the folder you start it from', right: true },
        { text: 'Because `claude` only works in folders called my-project', why: 'Any folder name works. What matters is starting Claude in the project you want help with.' },
        { text: 'It makes Claude respond faster', why: 'Speed is not the reason. Think about which files Claude can see.' },
      ],
      success: 'Always start Claude Code inside the project you want help with.',
    },
  ],
});
