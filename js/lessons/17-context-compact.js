// Sources (checked 2026-11-26): https://code.claude.com/docs/en/commands
// Docs: "/context [all]": "Visualize current context usage as a colored grid."
// "/compact [instructions]": "Free up context by summarizing the conversation so far. Optionally pass focus instructions for the summary."
// The /context grid is simplified to text here. Replaces the old lesson 06-context-sessions.js (same id). Bob removes the old file.
AD.addLesson({
  id: 'context-sessions',
  n: 17,
  level: 'beginner',
  title: 'How full is it? /context and /compact',
  blurb: 'See how much of Claude\'s working memory is used, and free up room.',
  icon: '◔',
  pro: true,
  summary: 'You checked the context with /context, compacted the conversation with a focus and saw the room it freed.',
  article: 'blog/claude-code-context-and-sessions.html',
  start: 'claude',
  steps: [
    {
      before: [
        { user: 'add due dates to todos' },
        { text: 'Done. Todos now have an optional due date.' },
        { user: 'show overdue todos in red' },
        { text: 'Done. Overdue todos are red now.' },
        { user: 'why does the date look wrong in Safari?' },
        { text: 'Safari reads the date string differently. I switched to `new Date(year, month, day)`.' },
      ],
      say: `<p>You have been working with Claude for a while. Everything you say fills up its working memory, the <b>context</b>.</p><p>See how full it is: <code>/context</code></p>`,
      match: /^\/context( all)?$/,
      answer: '/context',
      hints: [
        { match: /^context$/i, msg: 'Claude Code commands start with a slash: `/context`.' },
        { match: /^\/(contex|contxt|conext|contexts)$/, msg: 'Check the spelling: `/context`.' },
        { match: /^\/compact/, msg: 'First look at how full it is with `/context`.' },
      ],
      hint: 'Type `/context`.',
      success: 'Over half full. When it fills up, Claude has less room to think about your task.',
      respond: [
        { shell: 'Context usage\n■■■■■■■□□□  68% used\n  Messages          52%\n  System and tools  13%\n  Memory files       3%\n  Free space        32%' },
      ],
    },
    {
      say: `<p>Make room without losing the thread. <code>/compact</code> replaces the conversation with a short summary. Tell it what to keep:</p><p><code>/compact focus on the due date feature</code></p>`,
      match: (v) => /^\/compact\b/.test(v) && /due/i.test(v),
      answer: '/compact focus on the due date feature',
      hints: [
        { match: /^\/clear/, msg: '`/clear` throws the whole conversation away. `/compact` keeps a summary.' },
        { match: /^compact/i, msg: 'Start with a slash: `/compact`.' },
        { match: /^\/compact\s*$/, msg: 'Add what to focus on: `/compact focus on the due date feature`.' },
        { match: /^\/(compat|compakt|comapct)/, msg: 'Check the spelling: `/compact`.' },
      ],
      hint: 'Type `/compact focus on the due date feature`.',
      success: 'The conversation is now a short summary, focused on what you asked for.',
      respond: [
        { think: 1200, label: 'Compacting' },
        { out: 'Conversation compacted' },
        { text: 'Summary: due dates were added to todos, overdue todos are red, and dates use `new Date(year, month, day)` so Safari works.' },
      ],
    },
    {
      say: `<p>Check how full the context is now.</p>`,
      match: /^\/context( all)?$/,
      answer: '/context',
      hints: [
        { match: /^context$/i, msg: 'Remember the slash in front.' },
        { match: /^\/compact/, msg: 'You already compacted. Now **look** at the context again.' },
        { match: /^\/(clear|help)$/, msg: 'Use the same command as at the start, the one that shows how full the context is.' },
      ],
      hint: 'Use the same command as in the first step.',
      success: 'Lots of free space again, and Claude still knows what you were working on.',
      respond: [
        { shell: 'Context usage\n■■□□□□□□□□  19% used\n  Messages           3%\n  System and tools  13%\n  Memory files       3%\n  Free space        81%' },
      ],
    },
    {
      say: `<p>Quick check.</p><p><b>You want to keep working on the same feature, but the context is almost full. Which command?</b></p>`,
      choices: [
        { text: '`/compact`', right: true },
        { text: '`/clear`', why: '`/clear` empties everything. Use it when you switch to a **new** task.' },
        { text: '`/exit`', why: '`/exit` leaves Claude Code. It does not free up room.' },
      ],
      success: 'Same task, full context → /compact. New task → /clear.',
    },
  ],
});
