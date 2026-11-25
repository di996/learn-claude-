/* Lesson registry. Each lesson file calls AD.addLesson({...}).
 * Lessons belong to a track: 'code' (Claude Code, the default) or 'basics' (Claude Basics). */
(function () {
  const AD = (window.AD = window.AD || {});
  AD.lessons = AD.lessons || [];
  AD.trackOf = (l) => l.track || 'code';
  AD.addLesson = (l) => {
    AD.lessons.push(l);
    AD.lessons.sort((a, b) => a.n - b.n);
  };
  // The full plan: one title per lesson number (source: lesson-index.md, 24 Nov 2026).
  // The dashboard shows a built lesson when one exists with that number, otherwise the
  // planned title as "Coming soon". No need to remove entries when a lesson is added.
  AD.plan = {
    basics: [
      'Your first chat', 'Write a good prompt', 'Give examples', 'Let Claude ask you questions', 'Set the tone and format',
      "Fix it, don't start over", 'Edit an earlier message', 'New chat or keep going?',
      'Share files and photos', 'Summarize a long document', 'Make a Project', 'Project instructions and knowledge',
      'Styles', 'Your preferences and memory', 'Web search', 'Artifacts', 'Connectors',
      'Check the facts', 'What not to share', 'From chat to Claude Code',
    ],
    code: [
      // Beginner 1-25
      'Start Claude Code', 'Ask about your project', 'Exit and pick up again', 'Approve your first edit', 'Allow or reject a command',
      'Say no and redirect', 'The / menu and /help', 'Start fresh with /clear', 'Give Claude a memory with /init', 'Edit memory with /memory',
      'Point at a file with @', 'Several files and folders', 'Run a command yourself with !', 'Paste a screenshot', 'Stop Claude with Esc',
      'Rewind', 'How full is the context?', 'Find an old conversation', 'Auto-accept with Shift+Tab', 'Plan first, then code',
      'Fix a bug', 'Explain the code', 'Write and run tests', 'Save your work with git', 'Beginner project: build a feature on your own',
      // Intermediate 26-50
      'Write a good task', 'Explore, plan, code', 'Tests first', 'Find your way in a big codebase', 'Switch model with /model',
      'Make Claude think harder', 'Settings with /config', 'Lasting permissions', 'settings.json', 'Work on a branch',
      'Open a pull request', 'Fix a merge conflict', 'Code review with Claude', 'Make a slash command', 'Commands with arguments',
      'Skills', 'Built-in subagents', 'Make your own subagent', 'CLAUDE.md in subfolders', 'Run a dev server',
      'Refactor with checkpoints', 'Debug with logs and screenshots', 'What does it cost?', 'When things act up: /doctor', 'Intermediate project: branch, tests and pull request',
      // Pro 51-75
      'What is MCP?', 'Use an MCP server', 'Share MCP with your team', 'What are hooks?', 'Format after every edit',
      'Block risky commands', 'Get notified when done', 'Ask without a session: claude -p', 'Pipes and JSON', 'Claude Code in GitHub Actions',
      'Many sessions with worktrees', 'Many subagents at once', 'Plugins', 'Skills with scripts', 'Your own status line',
      'Permissions and sandbox', 'Watch out for prompt injection', 'Write a spec first', 'Big refactors in steps', 'Long tasks without losing track',
      'Share your setup in the repo', 'Automatic code review', 'Pro project: plan a whole app', 'Pro project: build it with subagents and hooks', 'Pro project: tests, PR and automation',
    ],
  };
  // Lessons that are a level's final project (shown with a flag).
  AD.finals = { code: [25, 50, 73, 74, 75], basics: [] };

  // Levels and topics for the dashboard (DESIGN.md "Dashboard: emner i niveauer", 24 Nov 2026).
  AD.levels = [
    { key: 'basics', track: 'basics', kicker: 'Start here', name: 'Claude Basics', bar: 'Claude Basics', sub: 'Simulated chat', from: 1, to: 20 },
    { key: 'beginner', track: 'code', kicker: 'Claude Code', name: 'Beginner', bar: 'Claude Code · Beginner', sub: 'Project: the to-do app', from: 1, to: 25 },
    { key: 'intermediate', track: 'code', kicker: 'Claude Code', name: 'Intermediate', bar: 'Claude Code · Intermediate', sub: 'Project: a bigger app', from: 26, to: 50 },
    { key: 'pro', track: 'code', kicker: 'Claude Code', name: 'Pro', bar: 'Claude Code · Pro', sub: 'Project: a team repo', from: 51, to: 75 },
  ];
  AD.topics = [
    { level: 'basics', title: 'Chat basics', sub: 'Prompts, examples, tone', from: 1, to: 8 },
    { level: 'basics', title: 'Files and projects', sub: 'Share files, Projects, preferences', from: 9, to: 14 },
    { level: 'basics', title: 'Tools and safety', sub: 'Web search, facts, then Claude Code', from: 15, to: 20 },
    { level: 'beginner', title: 'Get started', sub: 'Start, ask, approve, say no', from: 1, to: 8 },
    { level: 'beginner', title: 'Memory and files', sub: 'CLAUDE.md, @files, !, Esc', from: 9, to: 16 },
    { level: 'beginner', title: 'Real work', sub: 'Modes, bugs, tests, git', from: 17, to: 25 },
    { level: 'intermediate', title: 'Better tasks', sub: 'Good tasks, models, settings', from: 26, to: 33 },
    { level: 'intermediate', title: 'Git and your own tools', sub: 'Branches, PRs, commands, skills', from: 34, to: 41 },
    { level: 'intermediate', title: 'Workflows', sub: 'Subagents, checkpoints, debugging', from: 42, to: 50 },
    { level: 'pro', title: 'MCP and hooks', sub: 'Connect tools, automate checks', from: 51, to: 57 },
    { level: 'pro', title: 'Automation', sub: 'Scripts, worktrees, plugins', from: 58, to: 66 },
    { level: 'pro', title: 'Big tasks and teams', sub: 'Specs, long tasks, shared setup', from: 67, to: 75 },
  ];
  AD.lessonsIn = (track) => AD.lessons.filter((l) => AD.trackOf(l) === track);
  AD.lessonById = (id) => AD.lessons.find((l) => l.id === id);
  AD.nextLesson = (id) => {
    const cur = AD.lessonById(id);
    if (!cur) return null;
    if (cur.next) return AD.lessonById(cur.next) || null; // e.g. last Basics lesson -> Claude Code lesson 1
    const list = AD.lessonsIn(AD.trackOf(cur));
    const i = list.indexOf(cur);
    return list[i + 1] || null;
  };
})();
