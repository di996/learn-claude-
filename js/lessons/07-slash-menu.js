// Sources (checked 2026-11-24): https://code.claude.com/docs/en/commands, https://code.claude.com/docs/en/interactive-mode, https://code.claude.com/docs/en/quickstart
// Docs: "Type / to see the commands available to you, or type / followed by letters to filter." /help: "Show help and available commands".
// The /help output below is simplified.
AD.addLesson({
  id: 'slash-commands',
  n: 7,
  level: 'beginner',
  title: 'The / menu and /help',
  blurb: 'Find commands with / and tell them apart from messages to Claude.',
  icon: '/',
  pro: true,
  summary: 'You opened the command list, ran /help, filtered commands by typing and restarted Claude Code from memory.',
  article: 'blog/claude-code-slash-commands-and-claude-md.html',
  start: 'claude',
  steps: [
    {
      say: `<p>Anything starting with <code>/</code> is a <b>command</b> for Claude Code itself, not a message to Claude.</p><p>Type <code>/</code> and look at the list. Then finish typing <code>/help</code> and press <b>Enter</b>.</p>`,
      match: /^\/help$/,
      answer: '/help',
      hints: [
        { match: /^help$/i, msg: 'Commands start with a slash: `/help`.' },
        { match: /^\//, msg: 'That is another command. For now, run `/help`.' },
      ],
      hint: 'Type `/help` and press Enter.',
      success: 'Use ↑↓ in the list to move, and Enter to run the highlighted command.',
      respond: [
        {
          shell:
            'Claude Code\n\nCommon commands:\n  /help      Show help and available commands\n  /init      Initialize project with a CLAUDE.md guide\n  /clear     Start a new conversation with empty context\n  /memory    Edit CLAUDE.md files\n  /exit      Exit Claude Code',
          delay: 300,
        },
      ],
    },
    {
      say: `<p>What happens without the slash? Type just <code>help</code> and press Enter.</p>`,
      match: /^help\??$/i,
      answer: 'help',
      hints: [
        { match: /^\/help$/, msg: 'That is the command again. This time leave out the slash: `help`.' },
      ],
      hint: 'Type the word `help`, with no slash.',
      success: 'Without the slash it is a normal message, so Claude answered it like a question.',
      respond: [
        { think: 600 },
        { text: 'Happy to help. What would you like to do in this project? For a list of Claude Code commands, type `/help`.' },
      ],
    },
    {
      say: `<p>You don't have to remember every command. Type the first letters and the list <b>shrinks</b>.</p><p>Type <code>/exi</code>, see that only one command is left, and press <b>Enter</b>.</p>`,
      match: /^\/(exit|quit)$/,
      answer: '/exit',
      hints: [
        { match: /^exi?t?$/i, msg: 'Start with a slash: `/exi`.' },
        { match: /^\/help$/, msg: 'Type `/exi` to filter the list, then press Enter.' },
      ],
      hint: 'Type `/exi` and press Enter. The list fills in the rest.',
      success: 'Typing a few letters is the fastest way to find a command.',
      respond: [{ exit: true }],
    },
    {
      say: `<p>You're back in the normal terminal, still inside the project.</p><p><b>Start Claude Code again.</b></p>`,
      match: /^claude$/,
      answer: 'claude',
      hints: [
        { match: /^\/?claude[- ]?code$/i, msg: 'The command is just the tool\'s name, in lowercase.' },
        { match: /^\//, msg: 'You are in the normal terminal now. Slash commands only work inside Claude Code.' },
        { match: /^claude\s+(--continue|-c)$/, msg: 'That reopens the last conversation. Here, just start Claude Code normally.' },
        { match: /^cd/, msg: 'You are already in `my-project`. Just start Claude Code.' },
      ],
      hint: 'It is the same command you used in lesson 1: the tool\'s name in lowercase.',
      success: 'You remembered it without help.',
      respond: [{ launch: true }],
    },
    {
      say: `<p>Quick check.</p><p><b>Which of these is a command for Claude Code itself?</b></p>`,
      choices: [
        { text: '`/help`', right: true },
        { text: '`help`', why: 'Without the slash, Claude reads it as a normal message.' },
        { text: '`please show the help`', why: 'That is a message to Claude. Commands start with `/`.' },
      ],
      success: 'Starts with `/` → command. Everything else → message to Claude.',
    },
  ],
});
